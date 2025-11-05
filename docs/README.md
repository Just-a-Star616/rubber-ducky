# Project Rubber Ducky - Documentation

**Last Updated**: November 5, 2025
**Status**: Production Ready
**iCabbi Integration**: Complete ✅

## 🚀 Quick Start

### For AI Assistants (Claude, etc.)
👉 **[CLAUDE.md](./CLAUDE.md)** - Start here for complete project overview, architecture, commands, and patterns

### For Developers
1. **[CLAUDE.md](./CLAUDE.md)** - Project overview and architecture
2. **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - IndexedDB implementation guide
3. **[ICABBI_ADAPTER_IMPLEMENTATION.md](./ICABBI_ADAPTER_IMPLEMENTATION.md)** - iCabbi API integration (COMPLETE)
4. **[FIXES_APPLIED.md](./FIXES_APPLIED.md)** - Recent bug fixes and solutions

## 📖 Documentation Structure

### iCabbi Integration (Production Ready)
Complete implementation with real production data analysis:

- **[ICABBI_ADAPTER_IMPLEMENTATION.md](./ICABBI_ADAPTER_IMPLEMENTATION.md)** - Complete implementation guide
  - Type definitions matching real API
  - Bidirectional transformation functions
  - Hybrid data model (iCabbi + local extensions)
  - React hooks for extensions
  - Usage examples and testing checklist

- **[REAL_ICABBI_FIELD_MAPPING.md](./REAL_ICABBI_FIELD_MAPPING.md)** - Field-by-field mapping
  - Analyzed 4 real API response files (2.2MB)
  - Driver, Vehicle, Account, User mappings
  - Critical differences and gotchas
  - Immutable vs editable fields

- **[ICABBI_DATA_MODEL_ANALYSIS.md](./ICABBI_DATA_MODEL_ANALYSIS.md)** - Initial data model analysis
  - Three-tier architecture
  - Data ownership (iCabbi vs local)
  - Sync strategies

- **[ICABBI_INTEGRATION.md](./ICABBI_INTEGRATION.md)** - Integration overview

### Database & Persistence
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - IndexedDB implementation
  - Database schema
  - React hooks patterns
  - Migration guide
  - Common patterns

### Bug Fixes & Solutions
- **[FIXES_APPLIED.md](./FIXES_APPLIED.md)** - Session fixes
  - Input fields clearing while typing (FIXED)
  - Data persistence across page refreshes (FIXED)
  - Driver duplication on edit (FIXED)
  - Testing instructions

### Feature Documentation
- **[COMMISSION_RULES_SYSTEM.md](./COMMISSION_RULES_SYSTEM.md)** - Commission engine
- **[DISPATCH_PAGE_GUIDE.md](./DISPATCH_PAGE_GUIDE.md)** - Dispatch interface
- **[CUSTOMER_PROMOTIONS_GUIDE.md](./CUSTOMER_PROMOTIONS_GUIDE.md)** - Promotions
- **[LOGGING_AND_AUDIT_GUIDE.md](./LOGGING_AND_AUDIT_GUIDE.md)** - Audit system
- **[WEBHOOKS_AND_AUTOMATIONS_GUIDE.md](./WEBHOOKS_AND_AUTOMATIONS_GUIDE.md)** - Automations

### Deployment
- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Backend configuration
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Deployment guide
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Vercel deployment
- **[DRIVER_SIGNUP_DEPLOYMENT.md](./DRIVER_SIGNUP_DEPLOYMENT.md)** - Driver signup

### Reference
- **[INDEX.md](./INDEX.md)** - Complete documentation index
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues
- **[QA_TESTING_CHECKLIST.md](./QA_TESTING_CHECKLIST.md)** - Testing procedures
- **[RELEASE_NOTES.md](./RELEASE_NOTES.md)** - Version history

## 🎯 Common Tasks

| I want to... | Read this |
|-------------|-----------|
| Understand the project architecture | [CLAUDE.md](./CLAUDE.md) |
| Integrate with iCabbi API | [ICABBI_ADAPTER_IMPLEMENTATION.md](./ICABBI_ADAPTER_IMPLEMENTATION.md) |
| Map iCabbi fields to our app | [REAL_ICABBI_FIELD_MAPPING.md](./REAL_ICABBI_FIELD_MAPPING.md) |
| Implement database features | [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) |
| Fix bugs or understand recent fixes | [FIXES_APPLIED.md](./FIXES_APPLIED.md) |
| Setup commission rules | [COMMISSION_RULES_SYSTEM.md](./COMMISSION_RULES_SYSTEM.md) |
| Deploy the application | [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) |
| Troubleshoot issues | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) |

## 📊 Recent Updates

### November 5, 2025 - iCabbi Integration Complete ✅
- Analyzed 4 real API response files (drivers, vehicles, accounts, users)
- Updated all type definitions to match actual iCabbi API structure
- Implemented bidirectional transformation functions
- Created hybrid data model for iCabbi core + local extensions
- Added comprehensive React hooks for working with extensions
- Complete documentation with examples and testing checklists

**Key Files Created:**
- `lib/icabbiAdapter.ts` - Updated with real field mappings
- `lib/driverExtensions.ts` - Extension data model and helpers
- `lib/useDatabase.ts` - Enhanced with extension hooks
- `docs/REAL_ICABBI_FIELD_MAPPING.md` - Complete field mapping
- `docs/ICABBI_ADAPTER_IMPLEMENTATION.md` - Implementation guide

### November 4, 2025 - Bug Fixes
- Fixed input fields clearing while typing
- Implemented IndexedDB for persistent data storage
- Fixed driver duplication on edit
- All fixes documented in [FIXES_APPLIED.md](./FIXES_APPLIED.md)

## 🔑 Key Insights

### iCabbi API Structure (Important!)
1. **Driver ID vs Ref**
   - `id` (number) - Immutable system ID (1, 2, 3...)
   - `ref` (string) - **Editable** call sign ("AV999") - what users see
   - Always use `ref` for display, `id` for internal lookups

2. **Status Fields are Strings**
   - `active: "0" | "1"` (not boolean!)
   - `deleted: "0" | "1"` (not boolean!)
   - Must transform to/from our enum types

3. **Hybrid Data Model**
   - iCabbi owns: Core operational data (drivers, bookings, vehicles)
   - We own: Business logic (commission, invoices, extensions)
   - Merge at runtime for UI display

4. **Fields Not in iCabbi**
   - Gender, date of birth, emergency contacts
   - Commission schemes, bank accounts
   - Performance metrics, preferences
   - Store in local `DriverExtension` records

## 📁 File Organization

```
docs/
├── README.md                          ← You are here
├── INDEX.md                           ← Complete documentation index
│
├── CLAUDE.md                          ← AI assistant guide (START HERE)
├── IMPLEMENTATION_GUIDE.md            ← Database implementation
├── FIXES_APPLIED.md                   ← Recent bug fixes
│
├── ICABBI_ADAPTER_IMPLEMENTATION.md   ← iCabbi integration (COMPLETE)
├── REAL_ICABBI_FIELD_MAPPING.md       ← Real API field mappings
├── ICABBI_DATA_MODEL_ANALYSIS.md      ← Data model analysis
├── ICABBI_INTEGRATION.md              ← Integration overview
│
├── COMMISSION_RULES_SYSTEM.md         ← Commission engine
├── DISPATCH_PAGE_GUIDE.md             ← Dispatch interface
├── CUSTOMER_PROMOTIONS_GUIDE.md       ← Promotions system
├── LOGGING_AND_AUDIT_GUIDE.md         ← Audit logging
├── WEBHOOKS_AND_AUTOMATIONS_GUIDE.md  ← Automations
│
├── BACKEND_SETUP.md                   ← Backend config
├── DEPLOYMENT_CHECKLIST.md            ← Deployment guide
├── VERCEL_DEPLOYMENT.md               ← Vercel deployment
├── DRIVER_SIGNUP_DEPLOYMENT.md        ← Driver signup
│
└── [Other guides...]
```

## 🆘 Getting Help

1. **Check the documentation index**: [INDEX.md](./INDEX.md)
2. **Review recent fixes**: [FIXES_APPLIED.md](./FIXES_APPLIED.md)
3. **Troubleshooting guide**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
4. **Project overview**: [CLAUDE.md](./CLAUDE.md)

---

**All documentation consolidated in `/docs` directory** ✅
**Last organized**: November 5, 2025
