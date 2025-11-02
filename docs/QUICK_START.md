# Quick Start Guide - Driver Signup Deployment

Get your branded driver signup application deployed with Google Workspace integration in 30 minutes.

## 📋 Pre-Requisites Checklist

Before starting, ensure you have:

- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Google Workspace account (Business/Enterprise)
- [ ] Google Cloud Console access
- [ ] Git installed
- [ ] Text editor or IDE

## 🚀 Quick Start (5-10 minutes)

### 1. Install Dependencies

```bash
cd /media/konichi/Data/project-rubber-ducky-executioner
npm install
```

### 2. Set Up Google Cloud Project

**Quick Version:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Driver Signup App"
3. Enable APIs:
   - Google Sheets API
   - Google Drive API
   - Gmail API (optional)
4. Create OAuth 2.0 Web Application credentials
5. Add redirect URI: `http://localhost:5173`
6. Download credentials JSON

**Full Instructions:** See [DRIVER_SIGNUP_DEPLOYMENT.md](./DRIVER_SIGNUP_DEPLOYMENT.md) → Google Workspace Setup

### 3. Configure Environment

Edit `.env.local`:

```bash
# Copy your Google credentials
VITE_GOOGLE_API_KEY=your_api_key_here
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_SHEETS_ID=your_sheet_id_here
VITE_GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
VITE_GOOGLE_WORKSPACE_GROUP=staff@yourcompany.com

# Custom Branding
VITE_COMPANY_NAME=Your Company Name
VITE_COMPANY_LOGO_URL=https://your-logo-url.png
VITE_PRIMARY_COLOR=#3b82f6
VITE_SUPPORT_EMAIL=support@yourcompany.com
```

### 4. Customize Branding

Edit `lib/branding.ts`:

```typescript
export const defaultBranding: BrandingConfig = {
  companyName: 'Your Company Name',
  companyLogoUrl: 'https://your-cdn.com/logo.png',
  primaryColor: '#3b82f6',
  accentColor: '#10b981',
  contactEmail: 'contact@yourcompany.com',
  contactPhone: '+1 (555) 000-0000',
  supportEmail: 'support@yourcompany.com',
  termsUrl: 'https://yourcompany.com/terms',
  privacyUrl: 'https://yourcompany.com/privacy',
};
```

### 5. Update Application Title

Edit `index.html`:

```html
<title>Join [Your Company] - Driver Application</title>
<meta name="description" content="Apply to become a driver with [Your Company]">
```

### 6. Run Locally

```bash
npm run dev
```

Open http://localhost:5173 in your browser

## ✅ Testing Checklist

- [ ] Signup form loads and displays company branding
- [ ] Form submission works
- [ ] File uploads are accepted
- [ ] Google Sheets logging works (check your sheet)
- [ ] Google Drive uploads work (check your drive folder)
- [ ] Staff notifications are sent (check email)
- [ ] Responsive design works on mobile

## 🌐 Deployment Options

### Option 1: Vercel (Easiest - 2-5 minutes)

```bash
npm install -g vercel
vercel login
vercel
```

Then add environment variables in Vercel Dashboard:
- Settings → Environment Variables
- Add all VITE_* variables

### Option 2: Netlify (2-5 minutes)

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --build
```

Add env vars in Netlify Dashboard:
- Site Settings → Build & Deploy → Environment

### Option 3: Self-Hosted

```bash
npm run build
# Upload dist/ folder to your server
# Configure environment variables on server
# Set up SSL/HTTPS
```

### Option 4: Docker

```bash
docker build -t driver-signup .
docker run -p 3000:3000 --env-file .env.local driver-signup
```

## 📊 Backend Integration (Optional)

For production use with email notifications:

1. **Set up backend server** (Node.js/Express)
   - See [BACKEND_SETUP.md](./BACKEND_SETUP.md)
   - Deploy to Vercel Functions, AWS Lambda, or own server

2. **Update frontend API endpoint**
   - Edit `lib/googleIntegration.ts`
   - Change `apiEndpoint` to your backend URL

3. **Test integration**
   - Submit form and verify notifications work

## 📁 Project Structure

```
project-rubber-ducky-executioner/
├── lib/
│   ├── branding.ts              ← Customize branding here
│   ├── googleIntegration.ts     ← Google API integration
│   └── ...
├── views/driver/
│   ├── DriverSignUp.tsx         ← Original form
│   ├── EnhancedDriverSignUp.tsx  ← With Google integration
│   └── BrandedDriverSignUp.tsx   ← With custom branding
├── .env.local                   ← Configure here
├── index.html                   ← Update title/meta
├── vite.config.ts
└── docs/
    ├── DRIVER_SIGNUP_DEPLOYMENT.md
    ├── BACKEND_SETUP.md
    └── STAFF_DASHBOARD_SETUP.md
```

## 🔧 Troubleshooting

### "Cannot find module 'react'"

```bash
# Run npm install
npm install
```

### Google Sheets not logging

1. Check `VITE_GOOGLE_SHEETS_ID` is correct
2. Verify sheet has headers in first row
3. Check service account has write permission
4. See [DRIVER_SIGNUP_DEPLOYMENT.md](./DRIVER_SIGNUP_DEPLOYMENT.md) → Troubleshooting

### Documents not uploading

1. Verify `VITE_GOOGLE_DRIVE_FOLDER_ID` is correct
2. Check folder permissions
3. Ensure API is enabled in Google Cloud

### Notifications not sending

1. Backend needs to be set up
2. Check `VITE_GOOGLE_WORKSPACE_GROUP` email exists
3. See [BACKEND_SETUP.md](./BACKEND_SETUP.md)

## 📝 Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_GOOGLE_API_KEY` | Google API Key | `AIzaSyD...` |
| `VITE_GOOGLE_CLIENT_ID` | OAuth Client ID | `123456.apps.googleusercontent.com` |
| `VITE_GOOGLE_SHEETS_ID` | Google Sheet ID | `1BxiMVs0XRA5nFMKu...` |
| `VITE_GOOGLE_DRIVE_FOLDER_ID` | Google Drive Folder ID | `0B1Dx6UpXm...` |
| `VITE_GOOGLE_WORKSPACE_GROUP` | Staff email group | `staff@company.com` |
| `VITE_COMPANY_NAME` | Your company name | `Acme Transport` |
| `VITE_COMPANY_LOGO_URL` | Logo URL | `https://cdn.acme.com/logo.png` |
| `VITE_PRIMARY_COLOR` | Brand color (hex) | `#3b82f6` |
| `VITE_SUPPORT_EMAIL` | Support email | `support@company.com` |

## 🎯 Next Steps

1. **Deploy & Test** (5-10 min)
   - Deploy to Vercel/Netlify
   - Test signup flow end-to-end

2. **Share with applicants** (30 min)
   - Get domain name
   - Add to marketing materials
   - Send to potential drivers

3. **Monitor & Improve** (ongoing)
   - Check submission metrics
   - Respond to applications
   - Iterate based on feedback

4. **STRETCH GOAL: Staff Dashboard** (2-4 hours)
   - See [STAFF_DASHBOARD_SETUP.md](./STAFF_DASHBOARD_SETUP.md)
   - Build application review interface
   - Add approval workflows

## 📚 Documentation

- **[DRIVER_SIGNUP_DEPLOYMENT.md](./DRIVER_SIGNUP_DEPLOYMENT.md)** - Complete deployment guide
- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Backend integration guide
- **[STAFF_DASHBOARD_SETUP.md](./STAFF_DASHBOARD_SETUP.md)** - Staff management interface
- **Google API Docs** - https://developers.google.com/docs
- **React Docs** - https://react.dev

## 🔐 Security Reminders

⚠️ **Important:**

- Never commit `.env.local` to git
- Use environment variables for all secrets
- Enable HTTPS in production
- Implement rate limiting
- Validate all user inputs
- Use CORS properly

## 💬 Support

If you encounter issues:

1. Check the relevant documentation file
2. Review error messages in browser console
3. Check Google Cloud Console for API errors
4. Verify all environment variables are set correctly
5. Ensure service account has proper permissions

## ✨ Features Included

✅ Custom branding (logo, colors, contact info)
✅ Google Drive document storage
✅ Google Sheets application logging
✅ Staff email notifications
✅ Responsive mobile design
✅ Application status tracking
✅ Document upload management
✅ Password creation & authentication
✅ Applicant portal
✅ Multiple document types

## 📌 Version Info

- **Created:** November 2, 2025
- **Status:** Ready for production
- **Support:** See documentation files

---

**Ready to deploy?** Start with Step 1 above and you'll be live in 30 minutes! 🚀
