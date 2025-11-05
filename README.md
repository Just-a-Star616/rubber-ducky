# Project Rubber Ducky 🦆

**Dispatch & Staff Management Application**

A comprehensive taxi dispatch and staff management system with commission rules, scheduling, iCabbi integration, and customer promotions.

---

## 📚 Documentation

**All documentation is located in the [`/docs`](./docs) directory.**

### Quick Links

| I need to... | Go to |
|-------------|-------|
| **Get started (AI assistants)** | [`docs/CLAUDE.md`](./docs/CLAUDE.md) |
| **Understand the project** | [`docs/README.md`](./docs/README.md) |
| **Browse all documentation** | [`docs/INDEX.md`](./docs/INDEX.md) |
| **Integrate with iCabbi API** | [`docs/ICABBI_ADAPTER_IMPLEMENTATION.md`](./docs/ICABBI_ADAPTER_IMPLEMENTATION.md) |
| **Map iCabbi fields** | [`docs/REAL_ICABBI_FIELD_MAPPING.md`](./docs/REAL_ICABBI_FIELD_MAPPING.md) |
| **Implement database features** | [`docs/IMPLEMENTATION_GUIDE.md`](./docs/IMPLEMENTATION_GUIDE.md) |
| **Review recent bug fixes** | [`docs/FIXES_APPLIED.md`](./docs/FIXES_APPLIED.md) |
| **Deploy the application** | [`docs/DEPLOYMENT_CHECKLIST.md`](./docs/DEPLOYMENT_CHECKLIST.md) |
| **Troubleshoot issues** | [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md) |

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

**For complete setup instructions, see [`docs/CLAUDE.md`](./docs/CLAUDE.md)**

---

## ✨ Key Features

- ✅ **iCabbi Integration** - Complete API adapter with real production data
- ✅ **Commission Rules System** - 3-stage rule engine with auto-population
- ✅ **Dispatch Interface** - Modern booking and dispatch management
- ✅ **Staff Management** - Comprehensive staff admin panel
- ✅ **Driver Recruitment** - Complete driver signup workflow
- ✅ **Customer Promotions** - Time-based promotions with scheduling
- ✅ **Audit Logging** - Comprehensive activity tracking
- ✅ **Webhooks & Automations** - Event-driven automations
- ✅ **IndexedDB Persistence** - Client-side data persistence

---

## 📊 Latest Updates

### November 5, 2025 - iCabbi Integration Complete ✅
- Analyzed 4 real API response files (2.2MB production data)
- Updated all type definitions to match actual iCabbi API structure
- Implemented bidirectional transformation functions
- Created hybrid data model for iCabbi core + local extensions
- Added comprehensive React hooks for extensions

**See:** [`docs/ICABBI_ADAPTER_IMPLEMENTATION.md`](./docs/ICABBI_ADAPTER_IMPLEMENTATION.md)

### November 4, 2025 - Bug Fixes
- Fixed input fields clearing while typing
- Implemented IndexedDB for persistent storage
- Fixed driver duplication on edit

**See:** [`docs/FIXES_APPLIED.md`](./docs/FIXES_APPLIED.md)

---

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite
- **Database**: IndexedDB (client-side persistence)
- **Integration**: iCabbi API adapter (hybrid model)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: Session-based + IndexedDB

**Full architecture details:** [`docs/CLAUDE.md`](./docs/CLAUDE.md)

---

## 📁 Project Structure

```
project-rubber-ducky-executioner/
├── docs/                    ← All documentation
│   ├── README.md           ← Documentation overview
│   ├── INDEX.md            ← Complete documentation index
│   ├── CLAUDE.md           ← Project guide for AI assistants
│   └── [25+ other guides]
│
├── lib/                     ← Core libraries
│   ├── icabbiAdapter.ts    ← iCabbi API integration
│   ├── driverExtensions.ts ← Extension data model
│   ├── db.ts               ← IndexedDB layer
│   └── useDatabase.ts      ← React hooks
│
├── views/                   ← Application pages
├── components/              ← React components
├── types.ts                 ← TypeScript type definitions
└── [other files]
```

---

## 🎯 For Developers

**👉 Start here:** [`docs/CLAUDE.md`](./docs/CLAUDE.md)

This file contains:
- Complete project architecture
- Available commands and scripts
- File organization
- Data persistence layer
- Type system overview
- Common patterns and best practices

---

## 📖 Documentation Highlights

### iCabbi Integration (Complete)
- **[ICABBI_ADAPTER_IMPLEMENTATION.md](./docs/ICABBI_ADAPTER_IMPLEMENTATION.md)** - Complete guide with examples
- **[REAL_ICABBI_FIELD_MAPPING.md](./docs/REAL_ICABBI_FIELD_MAPPING.md)** - Field-by-field mapping
- **[ICABBI_DATA_MODEL_ANALYSIS.md](./docs/ICABBI_DATA_MODEL_ANALYSIS.md)** - Data model analysis

### Implementation Guides
- **[IMPLEMENTATION_GUIDE.md](./docs/IMPLEMENTATION_GUIDE.md)** - IndexedDB implementation
- **[FIXES_APPLIED.md](./docs/FIXES_APPLIED.md)** - Bug fixes and solutions
- **[COMMISSION_RULES_SYSTEM.md](./docs/COMMISSION_RULES_SYSTEM.md)** - Commission engine

### Deployment
- **[DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md)** - Deployment guide
- **[BACKEND_SETUP.md](./docs/BACKEND_SETUP.md)** - Backend configuration
- **[VERCEL_DEPLOYMENT.md](./docs/VERCEL_DEPLOYMENT.md)** - Vercel deployment

---

## 🆘 Support

- **Documentation**: [`docs/INDEX.md`](./docs/INDEX.md)
- **Troubleshooting**: [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md)
- **Recent Fixes**: [`docs/FIXES_APPLIED.md`](./docs/FIXES_APPLIED.md)

---

**Last Updated**: November 5, 2025
**Status**: Production Ready
**iCabbi Integration**: Complete ✅
