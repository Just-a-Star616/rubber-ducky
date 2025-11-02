# Backend Setup Guide - Google Workspace Integration

This guide covers setting up a backend server to handle Google Workspace integrations, including:
- Secure Google API credential management
- Email notifications to staff groups
- Document management automation
- Application logging

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Driver Signup Frontend                    │
│              (React/TypeScript - Vite)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Server                            │
│  (Node.js/Express - Handles Google Integrations)           │
├─────────────────────────────────────────────────────────────┤
│  • /api/upload-document  - Upload to Google Drive          │
│  • /api/log-application  - Log to Google Sheets            │
│  • /api/notify-staff     - Send email notifications        │
│  • /api/auth/callback    - OAuth2 callback                 │
└────┬─────────────┬─────────────────┬────────────────────────┘
     │             │                 │
     ▼             ▼                 ▼
┌──────────┐ ┌───────────┐ ┌──────────────┐
│ Google   │ │ Google    │ │ Google       │
│ Drive    │ │ Sheets    │ │ Workspace    │
└──────────┘ └───────────┘ └──────────────┘
```

## Option 1: Node.js/Express Backend

### Prerequisites

- Node.js 16+
- npm or yarn
- Google Cloud credentials (from deployment guide)

### Setup

```bash
# 1. Create backend directory (if separate from frontend)
mkdir driver-signup-backend
cd driver-signup-backend

# 2. Initialize Node project
npm init -y

# 3. Install dependencies
npm install express cors dotenv @google-cloud/drive @google-cloud/sheets nodemailer
npm install -D typescript @types/express @types/node ts-node
```

### Create Backend Structure

```
driver-signup-backend/
├── src/
│   ├── config/
│   │   ├── google.ts          # Google API configuration
│   │   └── env.ts             # Environment variables
│   ├── controllers/
│   │   ├── uploads.ts         # Document upload handling
│   │   ├── sheets.ts          # Google Sheets logging
│   │   └── notifications.ts   # Email notifications
│   ├── routes/
│   │   └── api.ts             # API routes
│   ├── middleware/
│   │   └── auth.ts            # Authentication middleware
│   ├── utils/
│   │   └── errorHandler.ts    # Error handling
│   └── server.ts              # Express server setup
├── .env
├── .gitignore
├── tsconfig.json
└── package.json
```

### Implementation

#### `src/config/env.ts`

```typescript
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Google Cloud
  GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID,
  GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_SHEETS_ID: process.env.GOOGLE_SHEETS_ID,
  GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID,
  GOOGLE_WORKSPACE_GROUP: process.env.GOOGLE_WORKSPACE_GROUP,
  
  // Service Account Key (path to JSON file)
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
};

if (!config.GOOGLE_APPLICATION_CREDENTIALS) {
  console.warn('Warning: GOOGLE_APPLICATION_CREDENTIALS not set');
}
```

#### `src/config/google.ts`

```typescript
import { google } from 'googleapis';
import { config } from './env';
import * as fs from 'fs';

let auth: any;

export async function initializeGoogleAuth() {
  const keyFile = config.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (!keyFile || !fs.existsSync(keyFile)) {
    throw new Error('Google service account key file not found');
  }
  
  const keyData = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
  
  auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/gmail.send',
    ],
  });
  
  return auth;
}

export function getGoogleAuth() {
  if (!auth) {
    throw new Error('Google Auth not initialized. Call initializeGoogleAuth first.');
  }
  return auth;
}

export function getSheets() {
  return google.sheets({ version: 'v4', auth: getGoogleAuth() });
}

export function getDrive() {
  return google.drive({ version: 'v3', auth: getGoogleAuth() });
}

export function getGmail() {
  return google.gmail({ version: 'v1', auth: getGoogleAuth() });
}
```

#### `src/controllers/sheets.ts`

```typescript
import { getSheets } from '../config/google';
import { config } from '../config/env';

export async function logApplicationToSheet(applicationData: any) {
  try {
    const sheets = getSheets();
    
    const values = [
      [
        applicationData.id,
        new Date().toISOString(),
        applicationData.firstName,
        applicationData.lastName,
        applicationData.email,
        applicationData.mobileNumber,
        applicationData.area,
        applicationData.isLicensed ? 'Yes' : 'No',
        'Submitted',
        applicationData.badgeNumber || '',
        applicationData.vehicleMake || '',
        applicationData.vehicleModel || '',
        applicationData.vehicleRegistration || '',
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: config.GOOGLE_SHEETS_ID,
      range: 'Driver Applications!A:M',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    console.log(`Application ${applicationData.id} logged to Google Sheets`);
    return true;
  } catch (error) {
    console.error('Error logging to Google Sheets:', error);
    throw error;
  }
}
```

#### `src/controllers/uploads.ts`

```typescript
import { getDrive } from '../config/google';
import { config } from '../config/env';
import { Readable } from 'stream';

export async function uploadDocumentToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
) {
  try {
    const drive = getDrive();
    
    const fileMetadata = {
      name: fileName,
      parents: [config.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType,
      body: Readable.from(fileBuffer),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, webViewLink',
    });

    console.log(`File ${fileName} uploaded with ID: ${response.data.id}`);
    
    return {
      id: response.data.id,
      url: response.data.webViewLink,
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}
```

#### `src/controllers/notifications.ts`

```typescript
import { getGmail } from '../config/google';
import { config } from '../config/env';
import * as nodemailer from 'nodemailer';

// Using nodemailer with Gmail API
export async function sendNotificationEmail(applicationData: any) {
  try {
    const gmail = getGmail();
    const auth = gmail.context._options.auth;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        pass: '', // Service account uses OAuth
        xoauth2: await auth.getAccessToken(),
      },
    });

    const emailContent = `
New Driver Application Received

Name: ${applicationData.firstName} ${applicationData.lastName}
Email: ${applicationData.email}
Phone: ${applicationData.mobileNumber}
Area: ${applicationData.area}
Licensed: ${applicationData.isLicensed ? 'Yes' : 'No'}
Application ID: ${applicationData.id}
Submitted: ${new Date().toLocaleString()}

Please review this application in the Driver Application Dashboard.
    `;

    const result = await transporter.sendMail({
      from: config.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      to: config.GOOGLE_WORKSPACE_GROUP,
      subject: `New Driver Application: ${applicationData.firstName} ${applicationData.lastName}`,
      text: emailContent,
      html: `
        <h2>New Driver Application Received</h2>
        <p><strong>Name:</strong> ${applicationData.firstName} ${applicationData.lastName}</p>
        <p><strong>Email:</strong> ${applicationData.email}</p>
        <p><strong>Phone:</strong> ${applicationData.mobileNumber}</p>
        <p><strong>Area:</strong> ${applicationData.area}</p>
        <p><strong>Licensed:</strong> ${applicationData.isLicensed ? 'Yes' : 'No'}</p>
        <p><strong>Application ID:</strong> ${applicationData.id}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        <p><a href="${config.FRONTEND_URL}/staff/applications/${applicationData.id}">View Application</a></p>
      `,
    });

    console.log(`Notification email sent to ${config.GOOGLE_WORKSPACE_GROUP}`);
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}
```

#### `src/routes/api.ts`

```typescript
import express, { Router, Request, Response } from 'express';
import { logApplicationToSheet } from '../controllers/sheets';
import { uploadDocumentToDrive } from '../controllers/uploads';
import { sendNotificationEmail } from '../controllers/notifications';

const router = Router();

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

// Log application
router.post('/log-application', async (req: Request, res: Response) => {
  try {
    const applicationData = req.body;
    await logApplicationToSheet(applicationData);
    res.json({ success: true, message: 'Application logged' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload document
router.post('/upload-document', async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await uploadDocumentToDrive(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send notification
router.post('/notify-staff', async (req: Request, res: Response) => {
  try {
    const applicationData = req.body;
    await sendNotificationEmail(applicationData);
    res.json({ success: true, message: 'Notification sent' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

#### `src/server.ts`

```typescript
import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { initializeGoogleAuth } from './config/google';
import apiRoutes from './routes/api';

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  })
);

// Routes
app.use('/api', apiRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start server
async function start() {
  try {
    // Initialize Google Auth
    await initializeGoogleAuth();
    console.log('Google Auth initialized');

    app.listen(config.PORT, () => {
      console.log(`Server running on port ${config.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
```

#### `.env`

```bash
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Google Cloud
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_ID=your-sheet-id
GOOGLE_DRIVE_FOLDER_ID=your-folder-id
GOOGLE_WORKSPACE_GROUP=driver-signup-staff@yourcompany.com

# Path to service account key file
GOOGLE_APPLICATION_CREDENTIALS=./keys/service-account-key.json
```

#### `package.json` scripts

```json
{
  "scripts": {
    "dev": "ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "watch": "ts-node --watch src/server.ts"
  }
}
```

### Deployment

#### Vercel Deployment

```bash
# Create vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "src/server.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

#### Heroku Deployment

```bash
# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set GOOGLE_PROJECT_ID=...
heroku config:set GOOGLE_SERVICE_ACCOUNT_EMAIL=...
# ... set all variables

# Upload service account key securely
heroku config:set GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'

# Deploy
git push heroku main
```

## Option 2: Google Cloud Functions

If you prefer a serverless approach without maintaining a server:

```bash
# Create functions directory
mkdir functions
cd functions

# Initialize Cloud Functions
gcloud functions deploy notifyStaff \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated
```

## Option 3: AWS Lambda

Use AWS Lambda with Node.js runtime:

```javascript
// handler.js
const AWS = require('aws-sdk');
const sheets = require('@google-cloud/sheets');

exports.notifyStaff = async (event) => {
  // Handle notification logic
};
```

## Security Best Practices

✅ **Do:**
- Store credentials in environment variables
- Use service accounts for backend operations
- Implement request validation
- Add rate limiting
- Use HTTPS in production
- Log all API calls for audit trail
- Implement error handling

❌ **Don't:**
- Commit credentials to git
- Store secrets in code
- Expose service account keys in frontend
- Skip CORS validation
- Allow unlimited file sizes
- Ignore error messages (security info leak)

## Testing

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test log application
curl -X POST http://localhost:3001/api/log-application \
  -H "Content-Type: application/json" \
  -d '{"id":"APP-123","firstName":"John","lastName":"Doe",...}'

# Test send notification
curl -X POST http://localhost:3001/api/notify-staff \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John",...}'
```

---

**Related Documentation:**
- [DRIVER_SIGNUP_DEPLOYMENT.md](./DRIVER_SIGNUP_DEPLOYMENT.md)
- [STAFF_DASHBOARD_SETUP.md](./STAFF_DASHBOARD_SETUP.md)
