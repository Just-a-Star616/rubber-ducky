# Driver Signup Deployment Guide

## Overview

This guide covers deploying the driver signup application with custom branding and Google Workspace integration for document management, staff notifications, and application logging.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Workspace Setup](#google-workspace-setup)
3. [Configuration](#configuration)
4. [Installation](#installation)
5. [Deployment](#deployment)
6. [Staff Management Dashboard (Stretch Goal)](#staff-management-dashboard-stretch-goal)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 16+ and npm
- Google Workspace account (Business or Enterprise)
- Google Cloud Project with API access
- Git
- Web hosting service (Vercel, Netlify, AWS, etc.)

## Google Workspace Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project called "Driver Signup Application"
3. Enable the following APIs:
   - **Google Sheets API**: For logging applications
   - **Google Drive API**: For document storage
   - **Gmail API**: For notifications (optional)

### Step 2: Create OAuth 2.0 Credentials

1. Go to **Credentials** section in Google Cloud Console
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Add authorized redirect URIs:
   - `http://localhost:3000` (development)
   - `http://localhost:5173` (Vite default)
   - `https://yourdomain.com` (production)
   - `https://yourdomain.com/auth/callback` (if using callback)
5. Copy and save:
   - **Client ID**
   - **Client Secret**

### Step 3: Create Service Account (for backend)

1. In Google Cloud Console, go to **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in service account details
4. Create a new key (JSON format)
5. Download and save the key file securely

### Step 4: Set Up Google Sheets

1. Create a new Google Sheet called "Driver Applications"
2. Add headers in the first row:
   ```
   Application ID | Date | First Name | Last Name | Email | Phone | Area | Licensed | Status | Badge # | Vehicle Make | Vehicle Model | Registration
   ```
3. Share the sheet with the service account email
4. Copy the **Sheet ID** from the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

### Step 5: Set Up Google Drive Folder

1. Create a Google Drive folder called "Driver Applications"
2. Create subfolders:
   - `/Documents` - For all uploaded documents
   - `/Approved` - For approved applications
   - `/Rejected` - For rejected applications
3. Share the folder with the service account email
4. Copy the **Folder ID** from the URL: `https://drive.google.com/drive/folders/{FOLDER_ID}`

### Step 6: Create Google Workspace Group

1. Go to [Google Workspace Admin](https://admin.google.com/)
2. Navigate to **Groups and settings** → **Groups**
3. Create a new group called "Driver Signup Staff"
4. Email: `driver-signup-staff@yourcompany.com`
5. Add staff members who should receive notifications
6. Note the group email address

### Step 7: Set Up Email Notifications (Backend)

For sending notifications to the Google Workspace group, you'll need a backend service. Here are two options:

#### Option A: Using Google Apps Script (Serverless)

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project called "Driver Signup Notifications"
3. Add this script:

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  
  // Log to Google Sheets
  const ss = SpreadsheetApp.openById(SHEETS_ID);
  const sheet = ss.getSheetByName("Driver Applications");
  sheet.appendRow([
    data.applicationData.id,
    new Date(),
    data.applicationData.firstName,
    data.applicationData.lastName,
    data.applicationData.email,
    data.applicationData.mobileNumber,
    data.applicationData.area,
    data.applicationData.isLicensed ? "Yes" : "No",
    "Submitted",
  ]);
  
  // Send notification email
  GmailApp.sendEmail(
    data.groupEmail,
    data.subject,
    `New driver application received:\n\n` +
    `Name: ${data.applicant}\n` +
    `Email: ${data.email}\n` +
    `Phone: ${data.phone}\n` +
    `Area: ${data.area}\n` +
    `Licensed: ${data.applicationData.isLicensed ? "Yes" : "No"}\n` +
    `Submitted: ${data.timestamp}`
  );
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: "Application processed"
  })).setMimeType(ContentService.MimeType.JSON);
}
```

4. Deploy as web app:
   - Click **Deploy** → **New deployment**
   - Type: **Web app**
   - Execute as: Your account
   - Who has access: **Anyone**
5. Copy the deployment URL

#### Option B: Using Backend Server (Node.js)

See [Backend Setup Guide](./BACKEND_SETUP.md)

## Configuration

### Step 1: Update Environment Variables

Edit `.env.local`:

```bash
# Google API Configuration
VITE_GOOGLE_API_KEY=your_api_key
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_GOOGLE_SHEETS_ID=your_sheet_id
VITE_GOOGLE_DRIVE_FOLDER_ID=your_folder_id
VITE_GOOGLE_WORKSPACE_GROUP=driver-signup-staff@yourcompany.com

# Company Branding
VITE_COMPANY_NAME=Your Company Name
VITE_COMPANY_LOGO_URL=https://your-cdn.com/logo.png
VITE_PRIMARY_COLOR=#3b82f6
VITE_SUPPORT_EMAIL=support@yourcompany.com
```

### Step 2: Customize Branding

Edit `lib/branding.ts`:

```typescript
export const defaultBranding: BrandingConfig = {
  companyName: 'Your Company Name',
  companyLogoUrl: 'https://your-cdn.com/logo.png',
  primaryColor: '#your-primary-color',
  accentColor: '#your-accent-color',
  contactEmail: 'contact@yourcompany.com',
  contactPhone: '+1 (555) 000-0000',
  supportEmail: 'support@yourcompany.com',
  termsUrl: 'https://yourcompany.com/terms',
  privacyUrl: 'https://yourcompany.com/privacy',
};
```

### Step 3: Update Application Title

Edit `index.html`:

```html
<title>Join [Your Company] - Driver Application</title>
<meta name="description" content="Apply to become a driver with [Your Company]">
```

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables in .env.local
# (See Configuration section above)

# 3. Run development server
npm run dev

# 4. Open http://localhost:5173 in your browser
```

## Deployment

### Option 1: Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel

# 4. Add environment variables in Vercel dashboard
# Settings → Environment Variables
# Add all VITE_* variables from .env.local
```

### Option 2: Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --prod --build --functions=functions

# 4. Add environment variables in Netlify dashboard
# Site settings → Build & deploy → Environment
```

### Option 3: Docker Deployment

```bash
# Create Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

```bash
# Build and run
docker build -t driver-signup .
docker run -p 3000:3000 --env-file .env.local driver-signup
```

### Option 4: Self-Hosted (AWS, GCP, etc.)

```bash
# 1. Build the application
npm run build

# 2. Upload dist/ folder to your hosting service
# 3. Configure environment variables on your server
# 4. Set up SSL certificate
# 5. Configure domain DNS
```

## Features

### ✅ Current Features

- **Custom Branding**: Company logo, colors, and contact info
- **Google Drive Integration**: Documents automatically uploaded and organized
- **Google Sheets Logging**: All applications logged for tracking
- **Staff Notifications**: Automatic emails to staff group on new applications
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Application Status Tracking**: Applicants can log in and check status
- **Document Management**: Upload and manage driver license, insurance, vehicle documents

### 📋 File Structure

```
project-rubber-ducky-executioner/
├── lib/
│   ├── branding.ts                    # Branding configuration
│   ├── googleIntegration.ts          # Google API integration
│   └── ...
├── views/driver/
│   ├── DriverSignUp.tsx              # Original signup form
│   ├── EnhancedDriverSignUp.tsx       # With Google integration
│   ├── BrandedDriverSignUp.tsx        # With custom branding
│   └── ...
├── components/
│   └── ...
├── .env.local                         # Configuration (Git ignored)
├── index.html                         # Update title and meta
├── vite.config.ts
├── package.json
└── README.md
```

## Testing

### Local Testing

```bash
# 1. Start dev server
npm run dev

# 2. Test signup flow
# - Fill out form
# - Upload documents
# - Check Google Drive for uploads
# - Check Google Sheets for logs
# - Check email for notifications

# 3. Test applicant portal
# - Sign up with email
# - Create password
# - Login to check status
```

### Production Testing

```bash
# 1. Build and preview
npm run build
npm run preview

# 2. Test all Google integrations
# - Verify Sheets logging
# - Verify Drive uploads
# - Verify email notifications
# - Check error handling
```

## Staff Management Dashboard (Stretch Goal)

### Overview

Create a web interface for staff to:
- Review driver applications
- Approve/reject applications
- Assign tasks to team members
- Send messages to applicants
- View analytics and statistics

### Implementation Steps

1. **Create Staff Auth**: Verify staff via Google Workspace email
2. **Build Dashboard Layout**: Sidebar navigation, main content area
3. **Application List**: Filter, sort, search driver applications
4. **Application Detail View**: View full application, documents, history
5. **Action Panel**: Approve, reject, send message, assign task
6. **Analytics**: Charts showing applications by status, time, area

### Files to Create

- `views/staff/DriverSignupManagement.tsx`
- `components/staff/ApplicationCard.tsx`
- `components/staff/ApplicationDetail.tsx`
- `lib/staffServices.ts`

### Example Implementation

See `STAFF_DASHBOARD_SETUP.md` for detailed instructions.

## Troubleshooting

### Google OAuth Not Working

- ✓ Verify Client ID matches in .env.local
- ✓ Check authorized redirect URIs in Google Cloud Console
- ✓ Ensure HTTPS is used in production
- ✓ Check browser console for CORS errors

### Documents Not Uploading

- ✓ Verify Google Drive Folder ID is correct
- ✓ Ensure service account has write permissions
- ✓ Check file size (Google Drive limit: 5TB per file)
- ✓ Verify file types are allowed

### Notifications Not Sending

- ✓ Check Google Workspace group email is correct
- ✓ Verify Gmail API is enabled
- ✓ Check service account has send mail permission
- ✓ Review email logs in Google Workspace Admin

### Sheets Not Logging

- ✓ Verify Sheet ID is correct
- ✓ Check sheet name matches in code ("Driver Applications")
- ✓ Ensure headers exist in first row
- ✓ Verify service account has edit permission

## Support & Documentation

- [Google API Documentation](https://developers.google.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev)

## Security Considerations

⚠️ **Important**: Never commit `.env.local` to version control

- Store secrets in environment variables only
- Use service account keys securely on backend
- Implement rate limiting for APIs
- Validate and sanitize all user inputs
- Use HTTPS in production
- Implement CSRF protection
- Set proper CORS headers

## Next Steps

1. ✓ Complete Google Workspace setup
2. ✓ Configure environment variables
3. ✓ Test locally with development Google project
4. ✓ Deploy to staging environment
5. ✓ Test all integrations in staging
6. ✓ Deploy to production
7. → **STRETCH**: Implement staff management dashboard

---

**Last Updated**: November 2, 2025
**Version**: 1.0
