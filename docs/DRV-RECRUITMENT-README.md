<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Project Rubber Ducky Executioner

A comprehensive driver management platform with integrated driver signup, staff dashboard, and advanced features for managing transportation operations.

## 🎯 Features

### Driver Signup Application
- **Custom Branding**: 
  - Upload company logo through admin panel
  - Logo displays on login, sidebar, and signup pages
  - Company name and colors customization
- **Google Workspace Integration**: 
  - Document uploads to Google Drive
  - Application logging to Google Sheets
  - Staff notifications via email
- **Document Management**: Support for multiple document types
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Applicant Portal**: Track application status

### Staff Management (Stretch Goal)
- Application review dashboard
- Approval/rejection workflows
- Task assignment system
- Analytics and reporting
- Document management

## 📚 Documentation

**Complete documentation available in the `docs/` folder:**

- **[📖 Documentation Index](./docs/INDEX.md)** ⭐ Start here - Complete navigation guide
- **[ Driver Signup Deployment Guide](./docs/DRIVER_SIGNUP_DEPLOYMENT.md)** - Complete setup & Google Workspace integration
- **[🔧 Backend Integration Guide](./docs/BACKEND_SETUP.md)** - Backend server setup
- **[👥 Staff Dashboard Setup](./docs/STAFF_DASHBOARD_SETUP.md)** - Management interface
- **[🎨 Company Logo & Branding](./docs/BRANDING_LOGO_IMPLEMENTATION.md)** - Upload and customize your logo
- **[📊 Logging & Audit](./docs/LOGGING_AND_AUDIT_GUIDE.md)** - Activity tracking
- **[� Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues & solutions
- **[📋 Product Requirements](./docs/PRODUCT_REQUIREMENTS.md)** - Feature specifications

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm
- Google Workspace account

### Installation

```bash
# 1. Install dependencies
npm install

```bash
# 2. Set environment variables in .env.local
# Follow docs/DRIVER_SIGNUP_DEPLOYMENT.md

# 3. Configure Google APIs
# See docs/BACKEND_SETUP.md for detailed setup

# 4. Run locally
npm run dev
```

Open http://localhost:5173 in your browser

## 🌐 Deployment

### Vercel (Recommended)
```bash
vercel
```

### Netlify
```bash
netlify deploy --prod
```

### Docker
```bash
docker build -t driver-signup .
docker run -p 3000:3000 --env-file .env.local driver-signup
```

See [Driver Signup Deployment Guide](./docs/DRIVER_SIGNUP_DEPLOYMENT.md) for detailed deployment instructions.

## 📁 Project Structure

```
project-rubber-ducky-executioner/
├── views/
│   ├── driver/
│   │   ├── DriverSignUp.tsx
│   │   ├── EnhancedDriverSignUp.tsx (with Google integration)
│   │   ├── BrandedDriverSignUp.tsx (with custom branding)
│   │   └── ApplicantPortal.tsx
│   └── staff/
│       ├── DriverSignupManagement.tsx
│       └── ...
├── components/
│   ├── ui/ (shadcn components)
│   └── staff/
├── lib/
│   ├── branding.ts (customize company branding)
│   ├── googleIntegration.ts (Google API integration)
│   └── ...
├── docs/
│   ├── DRIVER_SIGNUP_DEPLOYMENT.md
│   ├── BACKEND_SETUP.md
│   ├── STAFF_DASHBOARD_SETUP.md
│   ├── BRANDING_LOGO_IMPLEMENTATION.md
│   └── INDEX.md
└── .env.local (Git ignored - configure here)
```

## 🔧 Configuration

### Environment Variables

```bash
# Google APIs
VITE_GOOGLE_API_KEY=your_api_key
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_GOOGLE_SHEETS_ID=your_sheet_id
VITE_GOOGLE_DRIVE_FOLDER_ID=your_folder_id
VITE_GOOGLE_WORKSPACE_GROUP=staff@yourcompany.com

# Branding
VITE_COMPANY_NAME=Your Company Name
VITE_COMPANY_LOGO_URL=https://your-logo-url.png
VITE_PRIMARY_COLOR=#3b82f6
VITE_SUPPORT_EMAIL=support@yourcompany.com
```

See [Driver Signup Deployment Guide](./docs/DRIVER_SIGNUP_DEPLOYMENT.md) for detailed setup.

## 🔐 Security

- ✅ All secrets stored in environment variables
- ✅ OAuth 2.0 authentication
- ✅ HTTPS recommended for production
- ✅ Input validation & sanitization
- ✅ CORS protection

Never commit `.env.local` to version control!

## 📊 Features Included

### ✅ Implemented
- Custom company branding
- Google Drive document storage
- Google Sheets application logging
- Staff email notifications
- Responsive mobile design
- Application status tracking
- Document upload management
- Applicant portal with authentication
- Multiple document support

### 📋 Available as Templates
- Staff dashboard (application review)
- Approval/rejection workflows
- Task assignment system
- Analytics dashboard
- Document viewer
- Communication tools

See [Staff Dashboard Setup](./docs/STAFF_DASHBOARD_SETUP.md) for implementation.

## 🧪 Testing

### Local Testing
```bash
npm run dev
# Visit http://localhost:5173
# Fill out signup form
# Upload documents
# Check Google Drive & Sheets
# Verify email notifications
```

### Build & Preview
```bash
npm run build
npm run preview
```

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## 🆘 Troubleshooting

For common issues and solutions, see:
- [Driver Signup Deployment - Troubleshooting](./docs/DRIVER_SIGNUP_DEPLOYMENT.md#troubleshooting)
- [General Troubleshooting Guide](./docs/TROUBLESHOOTING.md)

## 📚 Resources

- [Google API Documentation](https://developers.google.com/)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev)

## 🎯 Next Steps

1. **Deploy** (5-10 min) - Follow [Driver Signup Deployment Guide](./docs/DRIVER_SIGNUP_DEPLOYMENT.md)
2. **Customize** (10-15 min) - Update branding and company info
3. **Test** (10 min) - Submit test applications
4. **Share** (ongoing) - Send signup link to applicants
5. **Monitor** (ongoing) - Check Google Sheets & Drive
6. **STRETCH** (2-4 hours) - Build staff dashboard via [Staff Dashboard Setup](./docs/STAFF_DASHBOARD_SETUP.md)

## 📄 License

View your app in AI Studio: https://ai.studio/apps/drive/1JsJ1DhAUUF5mloCRa5db39Wyy2dBG0QV

## 📞 Support

For issues or questions:
1. Check relevant documentation file
2. Review error messages in browser console
3. Verify environment variables are set
4. Check Google Cloud Console for API errors

---

**Version**: 1.0  
**Last Updated**: November 2, 2025  
**Status**: Ready for Production