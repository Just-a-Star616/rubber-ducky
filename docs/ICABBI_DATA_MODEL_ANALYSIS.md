# iCabbi Data Model Analysis

This document analyzes the iCabbi API data model and compares it with our application's data requirements to inform our data store design.

## iCabbi API Overview

**API Version**: 242 (Swagger 2.0)
**Base Path**: `/v2`
**Authentication**: Basic Auth (app key + secret key)

## Core iCabbi Data Models

### 1. Driver

**iCabbi Fields** (`Driver` + `DriverCreate`):
```typescript
{
  id: integer,
  ix: string,  // Alternative unique identifier
  ref: string, // Reference/Call sign (e.g., "X999_0803")
  active: string, // "1" or "0"
  deleted: string, // "1" or "0"
  name: string, // Full name
  first_name: string,
  last_name: string,
  a_k_a: string, // Alias/nickname
  mobile: string, // E.164 format
  phone: string,
  phone_1: string, // Additional phone
  email: string,
  address: string,
  photo: string, // URL
  psv: string, // PSV details
  psv_expiry: datetime,
  badge_type: string, // "HACKNEY", etc.
  licence: string,
  licence_expiry: datetime,
  last_payment_date: datetime,
  lat: number, // Current location
  lng: number,
  imei: string, // Device IMEI
  start_date: string, // Unix timestamp
  school_badge_expiry: datetime,
  ni_number: string, // National Insurance
  frequency: string, // "WEEKLY", etc.
  si_id: string,
  password: string,
  vehicle: Vehicle // Related vehicle object
}
```

**What iCabbi DOESN'T provide**:
- Commission scheme assignment
- Current balance/debt tracking
- Earnings history details
- Bank account information
- Pending document change requests
- Detailed compliance status tracking
- Performance metrics (completionRate, averageRating calculated separately)
- Preferences (maxJobDistance, preferredAreas, etc.)
- Attribute tags (custom system for skills/specializations)

### 2. Booking

**iCabbi Fields** (`Booking` + `BookingSimpleResponseBody`):
```typescript
{
  id: integer,
  ix: string,
  perma_id: string,
  trip_id: string, // e.g., "123A"
  trip_ix: string,
  source: "APP" | "DISPATCH" | "ACCOUNT" | "WEB" | "NETWORKAPP" | "NETWORKWEB" | "IVR",
  source_partner: string,
  source_version: string,
  external_booking_id: string,
  date: datetime, // Pickup date (ISO 8601)
  created_date: datetime,
  release_date: datetime,
  pickup_date: datetime,
  expected_arrival_at: datetime,
  booked_date: datetime,
  arrive_date: datetime | null,
  contact_date: datetime | null,
  close_date: datetime | null,
  name: string, // Passenger name
  email: string,
  phone: string, // E.164 format
  flight_number: string | null,
  address: Address, // Pickup address object
  destination: Address, // Destination address object
  vias: Via[], // Via points
  distance: integer, // Estimated distance in meters
  actual_distance: integer,
  eta: integer, // ETA in minutes
  seats: integer,
  driver_id: integer | null,
  driver: Driver | null,
  vehicle_id: integer | null,
  vehicle_type: string, // e.g., "R4"
  vehicle_group: string, // "Taxi", "MPV", "Saloon"
  site_id: integer,
  account_id: integer,
  payment: Payment,
  payment_type: "CASH" | "CARD" | "INVOICE",
  payment_metadata: array,
  pricing_per_via: integer,
  zone_surge_price: array,
  instructions: string,
  status: "NEW" | "ASSIGN" | "BACKTOBASE" | "PAUSE" | "PAUSED" | "ARRIVED" |
          "NOSHOW" | "ENROUTE" | "FOLLOWON" | "WAIT" | "TRANSFERRED" |
          "MADECONTACT" | "DROPPINGOFF" | "CUSTOMER_CANCELLED" |
          "DRIVER_CANCELLED" | "DISPATCH_CANCELLED" | "COMPLETE" | "COMPLETED",
  finish_status: string | null,
  status_text: string, // Human-readable
  prebooked: integer, // 0 or 1
  extras: string, // Attribute extras as string
  extras_ids: array,
  extras_config: array,
  language: string, // e.g., "en-GB"
  app_metadata: object,
  journey_id: integer,
  recurring_rule_id: integer,
  is_ooa: boolean, // Out of area
  is_streethail: boolean,
  channel: string, // e.g., "Uber"
  live_eta: integer,
  route: RouteResponse,
  eta_log: object
}
```

**What iCabbi DOESN'T provide**:
- Commission calculation fields (cost vs price split)
- Custom attribute tags (our system's tags)
- Detailed pricing breakdown for commission purposes

### 3. Vehicle

**iCabbi Fields** (inferred from swagger - no complete definition found):
```typescript
{
  id: integer,
  registration: string,
  make: string,
  model: string,
  // Limited fields compared to our system
}
```

**What iCabbi DOESN'T provide**:
- Plate details (plateType, plateNumber, plateExpiry, plateIssuingCouncil)
- Insurance details (insuranceCertificateNumber, insuranceExpiry)
- MOT and road tax expiry
- Vehicle color
- Ownership type (Company/Driver-owned/Rental)
- Linked driver IDs
- Custom attributes
- Site assignment

### 4. Customer/Account

**iCabbi Fields** (`Account`):
```typescript
{
  id: integer,
  ref: string, // Account reference code
  name: string,
  // Limited customer data
}
```

**What iCabbi DOESN'T provide**:
- Customer notes and history
- Priority levels
- Banned drivers list
- Account credit tracking
- Loyalty points
- Total spend calculation
- Multiple saved addresses
- Custom attributes

### 5. Financial/Transactions

**iCabbi Fields** (`DriverTransaction`):
```typescript
{
  id: integer,
  ref: string, // e.g., "[C2242] Cash Machine 30/09"
  mode: string, // "CASH", etc.
  amount: number,
  created: datetime
}
```

**What iCabbi DOESN'T provide**:
- Commission schemes
- Detailed invoice generation
- Invoice line items breakdown
- Deduction tracking
- Credit/debit balance calculations
- Rental fees, insurance deposits, data charges
- Historical invoices with email status

## Data Ownership Analysis

### ✅ iCabbi Owns (Read-Only or Sync)
1. **Drivers** - Basic info, license/badge details, location, status
2. **Bookings** - All booking lifecycle, pricing, customer info, driver assignment
3. **Vehicles** - Basic vehicle information
4. **Customers** - Basic customer/account data

### 🔧 We Own (Local Database)
1. **Commission Schemes** - All commission configuration
2. **Invoices** - Invoice generation, line items, email status
3. **Driver Applications** - Onboarding workflow
4. **Staff Members** - Staff accounts, roles, permissions
5. **Permission Templates** - Granular permission system
6. **Sites** - Multi-location management
7. **Promotions & Rewards** - Driver incentive programs
8. **Customer Promotions** - Loyalty programs, promo codes (Voucherify integration)
9. **Audit Logs** - All system activity tracking
10. **System Attributes** - Custom attribute definitions
11. **Automations** - Workflow automations
12. **Webhooks** - Webhook configurations
13. **Message Templates** - Communication templates
14. **Driver Extensions**:
    - Bank accounts
    - Pending document change requests
    - Performance metrics calculations
    - Preferences
    - Custom attributes
15. **Booking Extensions**:
    - Custom attributes
    - Commission calculations
16. **Vehicle Extensions**:
    - Compliance documents
    - Linked drivers
    - Custom attributes
17. **Customer Extensions**:
    - Notes and history
    - Priority levels
    - Banned drivers
    - Loyalty points

## Recommended Data Store Architecture

### Three-Tier Storage System

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌────────────────┐  ┌────────────────┐
│  iCabbi API   │  │  Local Store   │  │  Demo Store    │
│  (Production) │  │  (IndexedDB)   │  │  (IndexedDB)   │
├───────────────┤  ├────────────────┤  ├────────────────┤
│ • Drivers     │  │ • Schemes      │  │ Mock iCabbi    │
│ • Bookings    │  │ • Invoices     │  │ data for demo  │
│ • Vehicles    │  │ • Applications │  │ • Editable     │
│ • Customers   │  │ • Staff        │  │ • Persistent   │
│ • Transactions│  │ • Permissions  │  │ • Resettable   │
│               │  │ • Extensions   │  │                │
│ READ-ONLY     │  │ READ/WRITE     │  │ READ/WRITE     │
└───────────────┘  └────────────────┘  └────────────────┘
```

### Store 1: iCabbi Connector (Production Mode)
- Uses `RealIcabbiConnector` from `icabbiAdapter.ts`
- Fetches operational data from iCabbi API
- Caches responses in memory for performance
- Handles sync/refresh logic

### Store 2: Local Business Logic Store (IndexedDB)
- **Collections**:
  - `commissionSchemes`
  - `invoices`
  - `historicInvoices`
  - `driverApplications`
  - `staffMembers`
  - `permissionTemplates`
  - `sites`
  - `promotions`
  - `customerPromotions`
  - `auditLogs`
  - `systemAttributes`
  - `automations`
  - `webhooks`
  - `messageTemplates`
  - `driverExtensions` (linked by driver ID)
  - `bookingExtensions` (linked by booking ID)
  - `vehicleExtensions` (linked by vehicle ID)
  - `customerExtensions` (linked by customer ID)

### Store 3: Demo/Mock Store (IndexedDB)
- Full mock iCabbi data
- Allows users to add/edit/delete data
- Pre-populated with `mockDrivers`, `mockBookings`, etc.
- Can be reset to defaults
- Used when `VITE_ICABBI_MODE=mock`

## Implementation Strategy

### Phase 1: Create IndexedDB Layer
```typescript
// lib/db.ts
class AppDatabase {
  private db: IDBDatabase;

  // Collections for business logic
  commissionSchemes: Collection<CommissionScheme>;
  invoices: Collection<Invoice>;
  driverApplications: Collection<DriverApplication>;
  staffMembers: Collection<StaffMember>;
  // ... etc

  // Demo mode collections
  mockDrivers: Collection<Driver>;
  mockBookings: Collection<Booking>;
  mockVehicles: Collection<Vehicle>;
  // ... etc
}
```

### Phase 2: Enhanced Data Source Context
```typescript
// lib/dataSourceContext.tsx - ENHANCED
interface DataSourceContextType {
  mode: 'mock' | 'production';

  // iCabbi data (from API or mock)
  drivers: UseQueryResult<Driver[]>;
  bookings: UseQueryResult<Booking[]>;
  vehicles: UseQueryResult<Vehicle[]>;
  customers: UseQueryResult<Customer[]>;

  // Local business logic (always from IndexedDB)
  commissionSchemes: UseQueryResult<CommissionScheme[]>;
  invoices: UseQueryResult<Invoice[]>;
  applications: UseQueryResult<DriverApplication[]>;
  staff: UseQueryResult<StaffMember[]>;
  // ... etc

  // Unified access methods
  getDriver(id): Promise<Driver & DriverExtension>;
  getBooking(id): Promise<Booking & BookingExtension>;
  // ... etc
}
```

### Phase 3: Sync Strategy
- **Production Mode**: Periodic sync from iCabbi → Local cache
- **Demo Mode**: All data from IndexedDB, fully editable
- **Hybrid Queries**: Join iCabbi data + local extensions

## Key Design Decisions

1. **Don't replicate iCabbi data structure** - Use transformation layer
2. **Store only extensions locally** - Link by ID to iCabbi entities
3. **Demo mode = Full local control** - Complete mock database
4. **Clear separation** - iCabbi operational data vs our business logic
5. **Offline-first approach** - Cache iCabbi responses locally

## Next Steps

1. Implement IndexedDB wrapper (`lib/db.ts`)
2. Create collection interfaces for each entity type
3. Build sync manager for iCabbi data (production mode)
4. Enhance `dataSourceContext.tsx` with IndexedDB integration
5. Migrate mock data files to IndexedDB seed data
6. Update components to use unified data access layer
7. Add demo mode toggle with data reset capability

## Benefits

✅ **Clear separation** between operational data (iCabbi) and business logic (ours)
✅ **Offline capability** with IndexedDB caching
✅ **Demo mode** with full CRUD persistence
✅ **Scalable** - Easy to add new local collections
✅ **Type-safe** - Maintains TypeScript interfaces
✅ **Production-ready** - Direct iCabbi integration path
