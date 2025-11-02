# Quick Reference Card

## 🚀 30-Second Deployment

```bash
# 1. Install
npm install

# 2. Configure (.env.local)
VITE_GOOGLE_API_KEY=your_key
VITE_GOOGLE_SHEETS_ID=your_sheet_id
VITE_GOOGLE_DRIVE_FOLDER_ID=your_folder_id
VITE_COMPANY_NAME=Your Company

# 3. Deploy
vercel
```

## 📋 Critical Files

| File | Purpose | Edit for |
|------|---------|----------|
| `.env.local` | Configuration | Google API keys, company name |
| `lib/branding.ts` | Company branding | Logo, colors, contact info |
| `index.html` | Page metadata | Title, description |
| `docs/QUICK_START.md` | Setup guide | First time setup |
| `docs/DRIVER_SIGNUP_DEPLOYMENT.md` | Complete guide | Detailed instructions |

## 🔧 Environment Variables

```bash
# Required for Google integration
VITE_GOOGLE_API_KEY
VITE_GOOGLE_CLIENT_ID
VITE_GOOGLE_SHEETS_ID
VITE_GOOGLE_DRIVE_FOLDER_ID
VITE_GOOGLE_WORKSPACE_GROUP

# Optional branding
VITE_COMPANY_NAME
VITE_COMPANY_LOGO_URL
VITE_PRIMARY_COLOR
VITE_SUPPORT_EMAIL
```

## 🎯 Key Endpoints (Backend)

```
POST /api/log-application         - Log to Google Sheets
POST /api/upload-document         - Upload to Google Drive
POST /api/notify-staff            - Send notifications
```

## ✅ Deployment Checklist

- [ ] Google Cloud Project created
- [ ] APIs enabled (Sheets, Drive, Gmail)
- [ ] OAuth credentials obtained
- [ ] Google Sheet created
- [ ] Google Drive folder created
- [ ] `.env.local` configured
- [ ] Company branding customized
- [ ] Local test passed (`npm run dev`)
- [ ] Deploy to production
- [ ] Test live version

## 📚 Documentation Map

```
QUICK START (START HERE!)
    ↓
docs/QUICK_START.md (5-30 min setup)
    ↓
Need Commission Rules? → docs/COMMISSION_RULES_SYSTEM.md
Need More Details? → docs/DRIVER_SIGNUP_DEPLOYMENT.md
Need Backend? → docs/BACKEND_SETUP.md
Want Staff Dashboard? → docs/STAFF_DASHBOARD_SETUP.md
```

## 💡 Commission Rules Quick Start

**Location**: Finance → Scheme Definitions → Edit Scheme

**3-Stage Workflow:**

1. **Stage 1: Select Fields**
   - Choose fields to include in commission base
   - Examples: price, surge_charge, toll_fee
   - Airport-aware options: all / airport_only / exclude_airport

2. **Stage 2: Define Formula**
   - JavaScript expression for commission calculation
   - Example: `(sum * 18) / 100` for 18%
   - Access variables: sum, commissionRate

3. **Stage 3: Output Rules**
   - Define what driver/company get
   - Filter by payment method (Cash/Card/Invoice)
   - Examples: "Driver Income (Card)", "Company Income (Cash)"

**Example Scenario:**
```
Stage 1: Select price + surge_charge (airport_only)
Stage 2: Formula = "(sum * 18) / 100"
Stage 3: Create rules for Cash and Card separately
Result: Different commission splits by payment method
```

**Key Files:**
- Commission builder: `components/staff/CommissionRuleBuilder.tsx`
- Scheme modal: `components/staff/SchemeEditModal.tsx`
- Types: `types.ts` (CommissionFieldRule, CommissionOutputRule)
- Documentation: `docs/COMMISSION_RULES_SYSTEM.md`

## 🆘 Common Issues

| Issue | Fix |
|-------|-----|
| Env vars not loading | Check `.env.local` exists, restart dev server |
| Google APIs not working | Verify credentials, enable APIs in Google Cloud |
| Files not uploading | Check Drive folder permissions |
| Notifications not sending | Set up backend server (BACKEND_SETUP.md) |
| Branding not showing | Clear browser cache, check branding.ts |

## 🔐 Security Essentials

✅ All secrets in environment variables
✅ `.env.local` in `.gitignore`
✅ HTTPS in production
✅ No secrets in code

## 📱 Device Support

✅ Desktop (1024px+)
✅ Tablet (768-1023px)
✅ Mobile (<768px)

## 🚀 Deployment Options

```bash
# Vercel
vercel

# Netlify
netlify deploy --prod

# Docker
docker build -t app .
docker run -p 3000:3000 app
```

## 📞 Need Help?

1. Check relevant doc file
2. See troubleshooting section
3. Review browser console errors
4. Verify environment variables

## ⏱️ Timeline

| Time | Task |
|------|------|
| 5 min | Setup & dependencies |
| 15 min | Google Cloud setup |
| 5 min | Configuration |
| 10 min | Deploy |
| **35 min total** | **Live!** |

## 🎯 Next Steps

1. Open `docs/QUICK_START.md`
2. Follow steps 1-6
3. Deploy to production
4. Share signup link with drivers
5. Monitor submissions in Google Sheets
6. (Optional) Build staff dashboard

## 📊 Key Files Structure

```
project-rubber-ducky-executioner/
├── lib/
│   ├── branding.ts ← Customize here
│   └── googleIntegration.ts ← Google APIs
├── views/driver/
│   ├── DriverSignUp.tsx ← Original form
│   ├── EnhancedDriverSignUp.tsx ← With Google
│   └── BrandedDriverSignUp.tsx ← With branding
├── .env.local ← Configure here
├── index.html ← Update title
└── docs/ ← All documentation
```

## ✨ Features at a Glance

✅ Custom company branding
✅ Document upload to Google Drive
✅ Application logging to Google Sheets
✅ Email notifications to staff
✅ Applicant portal
✅ Mobile responsive
✅ Easy deployment
✅ Production ready

## 🎓 For Developers

**Understand the flow:**
1. User fills form (EnhancedDriverSignUp.tsx)
2. Documents uploaded to Google Drive (googleIntegration.ts)
3. Application logged to Google Sheets (googleIntegration.ts)
4. Staff notified via email (backend/notification)
5. Applicant gets confirmation

**Customize:**
- Branding: `lib/branding.ts`
- Google APIs: `lib/googleIntegration.ts`
- Form UI: `views/driver/DriverSignUp.tsx`
- Style: Use Tailwind CSS classes

---

**Save this file for quick reference!**

*For full details, see docs/QUICK_START.md*
