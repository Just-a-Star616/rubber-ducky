# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project Rubber Ducky Executioner** is a comprehensive driver management platform built with React/TypeScript and Vite. The system provides three distinct user experiences:

1. **Staff Dashboard** - Administrative control center for managing drivers, vehicles, bookings, invoicing, and operations
2. **Driver Portal** - Self-service interface for drivers to view earnings, manage profiles, update documents, and track invoices
3. **Applicant Portal** - Onboarding flow for new driver applications with document management

The platform is designed to replace fragmented legacy systems with a unified solution that layers a superior UX and custom financial engine on top of existing dispatch systems (particularly iCabbi integration).

## Development Commands

```bash
# Development
npm run dev          # Start dev server on localhost:3000 (configured in vite.config.ts)

# Build
npm run build        # Production build with TypeScript and Vite

# Preview
npm run preview      # Preview production build locally
```

Note: This project currently has no test suite. The codebase uses mock data for all functionality.

## Architecture Overview

### Data Persistence Layer (NEW)

The application now uses **IndexedDB** for persistent storage:

- `lib/db.ts` - Core IndexedDB wrapper with CRUD operations
- `lib/useDatabase.ts` - React hooks for reactive database queries
- **Three-tier storage**:
  1. **iCabbi API** (production) - Operational data from dispatch system
  2. **Local Business Logic** (IndexedDB) - Commission schemes, invoices, staff, permissions
  3. **Demo/Mock Data** (IndexedDB) - Fully editable mock data for demonstrations

**Collections**:
- Business logic: `commissionSchemes`, `invoices`, `driverApplications`, `staffMembers`, `permissionTemplates`, `sites`, `promotions`, `auditLogs`, etc.
- Demo mode: `mockDrivers`, `mockBookings`, `mockVehicles`, `mockCustomers`, `mockAccounts`, `mockTransactions`
- Extensions: `driverExtensions`, `bookingExtensions`, `vehicleExtensions`, `customerExtensions`

**Key Features**:
- Automatic seeding on first load from existing mock data files
- `db.reset()` to restore to initial state
- Persistent across page refreshes
- Users can add/edit/delete data in demo mode

### State Management Pattern

The application uses **session-based state management** for UI state:

- `App.tsx` manages top-level UI state (user session, theme, dark mode)
- State persisted to `sessionStorage` for page refreshes
- Application state machine with distinct modes: `'login' | 'signUp' | 'createPassword' | 'applicantPortal' | 'staffDashboard' | 'driverPortal'`
- **Data state** now managed by IndexedDB (see Data Persistence Layer above)

### Authentication Flow

Three distinct authentication paths managed in `App.tsx`:

1. **Staff Login** → `StaffDashboard`
2. **Driver Login** → Validates against `mockDrivers` → `DriverPortal` with `loggedInDriver` state
3. **Applicant Login** → Validates against `submittedApplications` → `ApplicantPortal` with `applicantData` state

**Important**: Application submissions flow through: `DriverSignUp` → `CreatePassword` → `ApplicantPortal`

### Data Layer

The application operates on **mock data only** - no real backend currently exists:

- `lib/mockData.ts` - Core driver applications data
- `lib/mockDriverStaffData.ts` - Driver and staff member data (44KB, comprehensive)
- `lib/mockFinancialData.ts` - Earnings, invoices, transactions with helper functions for driver-specific data
- `lib/mockCustomerAccountData.ts` - Business accounts and customer data
- `lib/mockCompanyData.ts` - Company settings and configuration

**Critical**: When working with financial data, use the helper functions:
- `getDriverInvoices(driverId)` - Returns invoices for specific driver
- `getDriverTransactions(driverId)` - Returns transactions for chart display
- `getDriverEarnings(driverId)` - Calculates earnings summary

### Theming System

Dual theming system located in `lib/themes.ts`:

- **RGB-based variables** (legacy): `--color-primary-500`, `--color-background`
- **HSL-based variables** (shadcn): `--primary`, `--background`, `--card`, etc.

Both are set simultaneously via `hexToRgb()` and `hexToHsl()` helpers. Theme state managed in `App.tsx` with `isDarkMode` and `themeName` (defaults to 'Papaya'). Persisted to `localStorage`.

### Google Workspace Integration

Configured but not actively used in the current implementation:

- `lib/googleIntegration.ts` - Drive uploads, Sheets logging, email notifications
- `lib/branding.ts` - Company logo and branding configuration
- Environment variables in `vite.config.ts` define all Google API keys and IDs
- Backend architecture documented in `docs/BACKEND_SETUP.md` (Node.js/Express server design)

## Key Technical Patterns

### Commission & Financial Engine

The platform includes a sophisticated commission calculation system:

- `lib/ruleBuilder.ts` - Rule-based commission scheme builder with conditions and actions
- `components/BaseRuleBuilder.tsx` + `BaseRuleBuilder.css` - Visual rule builder UI (6.6KB component)
- Support for multiple commission types: percentage, fixed, tiered, per-booking
- `lib/dashboardPresets.ts` - Pre-configured KPI widgets for analytics

### iCabbi Dispatch Integration

- `lib/icabbiAdapter.ts` (19KB) - Adapter for iCabbi dispatch system integration
- Handles booking imports, driver mapping, status synchronization
- Currently mock implementation - designed for real API integration

### Data Source Context

- `lib/dataSourceContext.tsx` - React context for switching between mock data and real APIs
- Provides `useDataSource()` hook throughout the application
- Designed to facilitate transition from mock to production data

### Permissions System

- `lib/auditPermissions.ts` - Granular permission templates for staff roles
- Permissions levels: 'Hidden' | 'View' | 'Edit'
- Applied to every page/feature in the staff dashboard
- `lib/logging.ts` - Comprehensive audit logging system with `LogEntry` types

## File Organization

```
project-rubber-ducky-executioner/
├── App.tsx                    # Root component, state machine, session management
├── index.tsx                  # Entry point
├── types.ts                   # Central type definitions (28KB - all TypeScript interfaces)
├── vite.config.ts            # Vite config with env variable injection
│
├── views/
│   ├── Login.tsx             # Unified login (staff/driver/applicant)
│   ├── driver/               # Driver-facing views
│   │   ├── DriverPortal.tsx        # Container with sidebar navigation
│   │   ├── DriverDashboard.tsx     # Earnings summary and chart
│   │   ├── DriverProfile.tsx       # Profile + document management (30KB)
│   │   ├── InvoicesHistory.tsx     # Historical invoices list
│   │   ├── VehiclePage.tsx         # Vehicle details and inspections
│   │   ├── DriverSignUp.tsx        # Application form (basic)
│   │   ├── EnhancedDriverSignUp.tsx # With Google integration
│   │   ├── BrandedDriverSignUp.tsx  # With custom branding
│   │   ├── ApplicantPortal.tsx     # Application status tracking
│   │   └── CreatePassword.tsx      # Post-submission password creation
│   │
│   └── staff/                # Staff admin views (28 page components)
│       ├── StaffDashboard.tsx      # Container with advanced sidebar + theme switcher
│       ├── HomePage.tsx            # KPI dashboard landing
│       ├── DriversPage.tsx         # Driver CRUD management
│       ├── VehiclesPage.tsx        # Vehicle CRUD management
│       ├── InvoicingPage.tsx       # Driver invoicing workflow
│       ├── SchemesPage.tsx         # Commission schemes admin
│       ├── ApplicationsPage.tsx    # Driver application review
│       ├── ProfilePage.tsx         # Driver profile details (15KB)
│       ├── AccountsPage.tsx        # Business account management
│       ├── CustomersPage.tsx       # Customer CRUD (22KB)
│       ├── DispatchPage.tsx        # Live dispatch board (24KB)
│       ├── BookingsPage.tsx        # Booking management
│       ├── StaffManagementPage.tsx # Staff user management
│       ├── CompanyAdminPage.tsx    # Company settings
│       ├── PromotionsPage.tsx      # Promotion campaigns (21KB)
│       ├── ConnectorsPage.tsx      # iCabbi integration settings
│       └── AuditLogsPage.tsx       # System audit logs
│
├── components/
│   ├── ui/                   # shadcn/ui components (Button, Card, Dialog, etc.)
│   ├── staff/                # Staff-specific components
│   │   └── VehicleInspectionModal.tsx
│   ├── driver/               # Driver-specific components
│   ├── icons/                # SVG icon components
│   ├── Header.tsx            # Shared header component
│   ├── BaseRuleBuilder.tsx   # Commission rule builder UI
│   └── Card.tsx              # Legacy card component
│
└── lib/
    ├── mockData.ts                  # Core mock data (36KB)
    ├── mockDriverStaffData.ts       # Driver/staff mock data (45KB)
    ├── mockFinancialData.ts         # Financial mock data with helpers (11KB)
    ├── mockCustomerAccountData.ts   # Customer mock data (8KB)
    ├── mockCompanyData.ts           # Company settings (3KB)
    ├── themes.ts                    # Theme definitions + hex converters (9KB)
    ├── icabbiAdapter.ts             # iCabbi integration adapter (19KB)
    ├── ruleBuilder.ts               # Commission rule engine (15KB)
    ├── googleIntegration.ts         # Google Workspace APIs (7KB)
    ├── branding.ts                  # Logo/branding config (3KB)
    ├── logging.ts                   # Audit logging utilities (8KB)
    ├── auditPermissions.ts          # Permission system (4KB)
    ├── dataSourceContext.tsx        # Data source context provider (7KB)
    ├── dashboardPresets.ts          # Dashboard KPI presets (10KB)
    ├── promotionScheduling.ts       # Promotion scheduling logic (10KB)
    ├── voucherifyIntegration.ts     # Voucherify promo integration (12KB)
    └── utils.ts                     # Utility functions
```

## Type System

**Critical**: `types.ts` (28KB) contains ALL TypeScript interfaces used throughout the application:

Key type categories:
- **Core Entities**: `Driver`, `Vehicle`, `StaffMember`, `Customer`, `BusinessAccount`, `Site`
- **Applications**: `DriverApplication` (with status tracking)
- **Financial**: `Invoice`, `CommissionScheme`, `Payment`, `Transaction`, `Deduction`
- **Bookings**: `Booking`, `BookingStatus`, `DispatchStatus`
- **Documents**: `Document`, `DocumentUpdateRequest`, `PendingChanges`
- **Permissions**: `PermissionTemplate`, `StaffPermissions`
- **Logging**: `LogEntry`, `LogLevel`, `LogEventType`, `LogCategory`
- **UI State**: `DashboardPreset`, `KPIWidget`, `FilterState`

When creating new features, always import types from `./types` rather than defining inline.

## Environment Variables

Defined in `vite.config.ts` and loaded from `.env.local`:

```bash
# Google APIs (configured but not actively used)
VITE_GOOGLE_API_KEY
VITE_GOOGLE_CLIENT_ID
VITE_GOOGLE_SHEETS_ID
VITE_GOOGLE_DRIVE_FOLDER_ID
VITE_GOOGLE_WORKSPACE_GROUP

# Branding
VITE_COMPANY_NAME
VITE_COMPANY_LOGO_URL
VITE_PRIMARY_COLOR
VITE_SUPPORT_EMAIL

# AI Features
GEMINI_API_KEY              # For future AI integration
```

Access in code via `process.env.VITE_*` (Vite convention).

## Documentation Structure

Comprehensive documentation in `docs/`:

- `PRODUCT_REQUIREMENTS.md` - Complete PRD with user stories, success metrics, feature requirements organized by epic (Staff Control Tower, Driver Portal, Applicant Onboarding)
- `DRIVER_SIGNUP_DEPLOYMENT.md` - Driver signup deployment and Google Workspace integration
- `BACKEND_SETUP.md` - Backend architecture for Google integration (Node.js/Express design)
- `STAFF_DASHBOARD_SETUP.md` - Staff dashboard implementation guide
- `DRV-RECRUITMENT-README.md` - Main project README with quick start

## Important Implementation Notes

1. **No real backend exists** - All data is mock data. When users "submit" forms, data is stored in component state or sessionStorage only.

2. **Commission calculation** - The rule builder system is sophisticated but not yet connected to real invoice generation. See `lib/ruleBuilder.ts` for the engine design.

3. **iCabbi integration** - `lib/icabbiAdapter.ts` provides the interface, but no real API calls are made. This is designed for future integration.

4. **Three signup variants exist**:
   - `DriverSignUp.tsx` - Basic form
   - `EnhancedDriverSignUp.tsx` - With Google Drive/Sheets integration
   - `BrandedDriverSignUp.tsx` - With custom company branding
   Currently `DriverSignUp.tsx` is used in `App.tsx`.

5. **Financial data helpers are critical** - Always use `getDriverInvoices()`, `getDriverTransactions()`, and `getDriverEarnings()` from `mockFinancialData.ts` rather than filtering raw data directly. These helpers contain business logic for date ranges and driver-specific filtering.

6. **Sidebar navigation** - Both `StaffDashboard.tsx` and `DriverPortal.tsx` use internal page state to switch between views. They are NOT using React Router.

7. **Theme customization** - Themes are defined in `lib/themes.ts` with multiple color palettes ('Papaya', 'Ocean', 'Forest', etc.). The theme system sets both RGB and HSL CSS variables to support both legacy and shadcn components.

## Common Gotchas

- **Path aliases**: `@/` maps to project root (configured in `tsconfig.json` and `vite.config.ts`)
- **Port configuration**: Dev server runs on port 3000, not the Vite default 5173 (see `vite.config.ts`)
- **Dark mode**: Controlled by `isDarkMode` state in `App.tsx`, adds/removes `.dark` class on `document.documentElement`
- **Session persistence**: Most state is stored in `sessionStorage`, not `localStorage` (except theme preferences)
- **Driver vs Applicant**: Drivers are in `mockDrivers` array; Applicants are in `submittedApplications` state in `App.tsx`. They use different login flows.

## Future Backend Integration

When connecting to a real backend:

1. Replace mock data imports with API calls
2. Use `dataSourceContext.tsx` to toggle between mock/real data sources
3. Implement the backend structure outlined in `docs/BACKEND_SETUP.md`
4. Connect `googleIntegration.ts` functions to real Google APIs
5. Wire up `icabbiAdapter.ts` to real iCabbi API endpoints
6. Implement proper authentication (currently just email matching)
7. Add proper error handling and loading states throughout

## Related Resources

- Product requirements: `docs/PRODUCT_REQUIREMENTS.md`
- Main README: `DRV-RECRUITMENT-README.md`
- Google integration guide: `docs/DRIVER_SIGNUP_DEPLOYMENT.md`
- Backend design: `docs/BACKEND_SETUP.md`
