# Real iCabbi API Field Mapping

This document maps the **actual iCabbi API fields** (from production data) to our application's data model.

## Key Insights from Real Data

### System-Assigned Fields
- ✅ `id` - Integer, system-assigned (1, 2, 3...) - **Immutable**
- ✅ `ix` - UUID string (e.g., "11EA062AC2A96677B30A0A5A23E1E9BE") - **Immutable**
- ✅ `ref` - Driver call sign (e.g., "AV999", "997") - **Can be edited** - This is the driver's identifier for users

### Driver Status
- `active`: "1" (active) or "0" (inactive) - **String, not boolean!**
- `deleted`: "1" or "0" - **String, not boolean!**

---

## Driver Field Mapping

| iCabbi Field | Type | Our Field | Notes |
|--------------|------|-----------|-------|
| `id` | integer | `id` | **Immutable** - System ID |
| `ix` | string (UUID) | - | **Immutable** - Alternative unique ID, not used |
| `ref` | string | `driverRef` (NEW) | **Editable** - Driver call sign (e.g., "AV999") |
| `active` | string ("0"/"1") | `status` | Map: "1" → "Active", "0" → "Inactive" |
| `deleted` | string ("0"/"1") | - | Filter out if "1" |
| `name` | string | - | Full name (computed from first+last) |
| `first_name` | string | `firstName` | ✓ |
| `last_name` | string | `lastName` | ✓ |
| `a_k_a` | string | `nickname` (NEW) | Alias/nickname |
| `mobile` | string | `mobileNumber` | E.164 format (e.g., "00441143503195") |
| `phone` | string | `devicePhone` | Primary phone |
| `phone_1` | string | `alternatePhone` (NEW) | Secondary phone |
| `email` | string | `email` | May be empty string |
| `address` | string | `address` | Full address as single string |
| `photo` | string (URL) | `avatarUrl` | S3 URL or default image |
| `psv` | string | `badgeNumber` | Badge/PSV number |
| `psv_expiry` | datetime | `badgeExpiry` | ISO 8601 (e.g., "2040-02-20T19:19:00+00:00") |
| `badge_type` | string | `badgeType` | "PRIVATE HIRE", "HACKNEY", etc. |
| `licence` | string | `drivingLicenseNumber` | May be "NOT KNOWN" |
| `licence_expiry` | datetime | `drivingLicenseExpiry` | ISO 8601 |
| `invoice_commission` | number | `commissionRate` (NEW) | e.g., 1.54 |
| `last_payment_date` | datetime | - | Last payment timestamp |
| `lat` | number\|null | - | Current latitude |
| `lng` | number\|null | - | Current longitude |
| `lat_lng_last_updated` | datetime\|null | - | GPS timestamp |
| `imei` | string | - | Device IMEI (encrypted?) |
| `start_date` | string (unix) | `startDate` (NEW) | Unix timestamp as string |
| `school_badge_expiry` | datetime | `schoolBadgeExpiry` | ISO 8601 |
| `ni_number` | string | `niNumber` | May be "N/A" |
| `frequency` | string | `paymentFrequency` (NEW) | "WEEKLY", "MONTHLY", etc. |
| `si_id` | string | - | System integration ID |
| `is_transporter` | boolean | - | iCabbi-specific flag |
| `password` | string | - | **Do NOT sync** - Security risk |
| `vehicle` | object | - | **See Vehicle Mapping below** |
| `exclusions` | object | - | iCabbi-specific settings |

---

## Vehicle Field Mapping (nested in Driver)

| iCabbi Field | Type | Our Field | Notes |
|--------------|------|-----------|-------|
| `id` | string | `id` | **Immutable** - Vehicle ID as string |
| `ix` | string (UUID) | - | **Immutable** - Alternative ID |
| `ref` | string | `vehicleRef` | **Editable** - Vehicle call sign (e.g., "9999") |
| `a_k_a` | string | `nickname` (NEW) | Vehicle alias |
| `active` | boolean | `status` | Map: true → "Active", false → "Inactive" |
| `year` | integer | `year` (NEW) | Manufacturing year |
| `reg` | string | `registration` | UK registration (e.g., "GSW 7") |
| `plate` | string | `plateNumber` | Plate number |
| `plate_expiry` | datetime | `plateExpiry` | ISO 8601 |
| `hire_expiry` | datetime | `privateHireExpiry` (NEW) | Private hire license expiry |
| `insurer` | string | `insuranceProvider` (NEW) | Insurance company name |
| `insurance` | string | `insuranceCertificateNumber` | Policy/cert number |
| `insurance_expiry` | datetime | `insuranceExpiry` | ISO 8601 |
| `council_compliance_expiry` | datetime | `councilComplianceExpiry` (NEW) | Council compliance cert |
| `nct` | string | `motCertificateNumber` (NEW) | MOT cert number |
| `nct_expiry` | datetime | `motComplianceExpiry` | MOT expiry |
| `road_tax_expiry` | datetime | `roadTaxExpiry` | Road tax expiry |
| `make` | string | `make` | e.g., "Mercedes", "VOLKSWAGEN" |
| `model` | string | `model` | e.g., "S-Class AMG", "TOURAN" |
| `colour` | string | `color` | e.g., "BLACK", "SILVER" |
| `vehicle_phone` | string | `vehiclePhone` (NEW) | Phone number in vehicle |
| `vehicle_owner` | object | - | Owner details (usually empty) |
| `co2_emission` | string | `co2Emission` (NEW) | CO2 emission value |
| `sites` | array | `linkedSites` (NEW) | Array of site IDs |
| `primary_site_id` | integer | `siteId` | Primary site assignment |

---

## Account Field Mapping

| iCabbi Field | Type | Our Field | Notes |
|--------------|------|-----------|-------|
| `id` | integer | `id` | **Immutable** |
| `name` | string | `name` | Account name |
| `name_alias` | string | `nameAlias` (NEW) | Alternative name |
| `si_id` | string | - | System integration ID |
| `ref` | string | `accountRef` (NEW) | Account reference (e.g., "AMEX 03") |
| `active` | string ("0"/"1") | `status` | Map: "1" → "Active", "0" → "Inactive" |
| `type` | string | `accountType` (NEW) | "CARD", "INVOICE", etc. |
| `identifier` | string | `identifier` (NEW) | Unique identifier (8 digits) |
| `notes` | string | `notes` | Account notes |
| `driver_notes` | string | `driverNotes` (NEW) | Notes visible to drivers |
| `address` | string | `address` | Full address |
| `address_id` | integer | - | Address reference ID |
| `primary_contact_name` | string | `primaryContactName` (NEW) | Main contact |
| `primary_contact_phone` | string | `primaryContactPhone` (NEW) | Contact phone |
| `email` | string\|null | `email` | May be null or comma-separated list |
| `priority` | integer | `priority` (NEW) | Priority level (2, 4, etc.) |
| `service_charge_type` | string | - | "PERCENTAGE", "ABSOLUTE" |
| `service_charge` | number | `serviceCharge` (NEW) | Service charge amount |
| `min_service_charge` | number | - | Minimum service charge |
| `booking_charge_type` | string | - | Charge calculation type |
| `booking_charge` | number | - | Booking charge amount |
| `min_booking_charge` | number | - | Minimum booking charge |
| `discount_cost_type` | string | - | Discount type |
| `discount_cost` | number | - | Cost discount |
| `discount_price_type` | string | - | Price discount type |
| `discount_price` | number | - | Price discount |
| `invoice_discount` | number | - | Invoice discount |
| `profile` | string | `profile` (NEW) | "DISPATCH", etc. |
| `pin` | string | `pin` (NEW) | Account PIN (may be empty) |
| `prepaid` | integer | `isPrepaid` (NEW) | 0 or 1 |
| `frequency` | string | `invoiceFrequency` (NEW) | "WEEKLY", "MONTHLY", "CMONTHLY" |
| `card_type` | string | `cardType` (NEW) | "VISA DEBIT", "MASTERCARD CREDIT", etc. |
| `site_id` | integer | `siteId` | Site assignment |
| `account_fields` | array | `customFields` (NEW) | Custom field definitions |
| `users` | array | `users` (NEW) | **See User mapping below** |
| `tags` | array | `tags` (NEW) | Account tags |

---

## User Field Mapping (Customers/App Users)

| iCabbi Field | Type | Our Field | Notes |
|--------------|------|-----------|-------|
| `id` | string | `id` | User ID as string |
| `ix` | string (UUID) | - | Alternative ID |
| `user_id` | string | - | Duplicate of `id` |
| `client_id` | string | - | Fleet/client ID |
| `phone` | string | `phone` | E.164 format (e.g., "00447071234567") |
| `email` | string\|null | `email` | May be null or empty |
| `name` | string | `name` | Full name (may be empty) |
| `first_name` | string | `firstName` | May be empty |
| `last_name` | string | `lastName` | May be empty |
| `bookingreceipts` | boolean | - | Receipt preference |
| `payment_type` | string | - | Preferred payment type |
| `sms` | integer | - | SMS preference |
| `forgot_password_link` | string | - | Password reset URL |
| `score` | integer | `customerScore` (NEW) | Customer score (0-100) |
| `vip` | boolean | `isVip` (NEW) | VIP status |
| `banned` | boolean | `isBanned` | Banned status |
| `trusted` | boolean | `isTrusted` (NEW) | Trusted customer |
| `card_banned` | boolean | `isCardBanned` (NEW) | Card payment banned |
| `anonymous` | boolean | `isAnonymous` (NEW) | Anonymous user |
| `accounts` | array | `linkedAccounts` (NEW) | Linked account IDs |
| `creditcards` | array | `savedCards` (NEW) | Saved credit cards |
| `userprofile` | object | `profile` (NEW) | User profile details |
| `account_admin` | boolean | `isAccountAdmin` (NEW) | Admin privileges |
| `customfields` | array | `customFields` (NEW) | Custom field values |

---

## Critical Differences from Our Mock Data

### 1. **Status Fields are Strings, not Enums**
```typescript
// iCabbi:
active: "1" | "0"  // STRING
deleted: "1" | "0"  // STRING

// Our app:
status: 'Active' | 'Inactive' | 'Archived'  // ENUM
```

### 2. **Driver Ref vs ID**
- Users see and edit `ref` (e.g., "AV999") - **This is what should be displayed and is editable**
- System uses `id` (e.g., 1, 2, 3) - **This is for database keys and is immutable**
- `ref` can be changed by users, `id` and `ix` cannot

### 3. **Nested Vehicle Object**
- iCabbi returns full vehicle object nested in driver
- Our model stores `vehicleRef` as a string
- Need to handle relationship differently

### 4. **Missing Fields in iCabbi**
Fields we have that iCabbi doesn't provide:
- ❌ `gender` - Not in iCabbi
- ❌ `dateOfBirth` - Not in iCabbi
- ❌ `emergencyContactName` / `emergencyContactNumber` - Not in iCabbi
- ❌ `schemeCode` - Our commission system, not iCabbi's
- ❌ `currentBalance` / `lastStatementBalance` - Our financial tracking
- ❌ `bankAccounts` - Our payment system
- ❌ `attributes` (custom tags) - Our tagging system
- ❌ `performance` metrics - Calculated by us
- ❌ `preferences` - Stored locally
- ❌ `complianceStatus` - Calculated from expiry dates

### 5. **Additional iCabbi Fields We Don't Use**
- `invoice_commission` - They track commission differently
- `imei` - Device tracking
- `is_transporter` - iCabbi-specific feature
- `exclusions` - iCabbi workflow settings
- `password` - **Never sync this!**

---

## Recommended Data Architecture

### Hybrid Model: iCabbi Core + Local Extensions

```typescript
// Core iCabbi data (synced)
interface IcabbiDriver {
  id: number;                    // Immutable system ID
  ref: string;                   // Immutable call sign
  ix: string;                    // UUID
  active: "0" | "1";            // String status
  deleted: "0" | "1";
  first_name: string;
  last_name: string;
  a_k_a: string;
  mobile: string;
  phone: string;
  phone_1: string;
  email: string;
  address: string;
  photo: string;
  psv: string;
  psv_expiry: string;
  badge_type: string;
  licence: string;
  licence_expiry: string;
  invoice_commission: number;
  start_date: string;
  school_badge_expiry: string;
  ni_number: string;
  frequency: string;
  vehicle: IcabbiVehicle | null;
}

// Local extensions (stored separately, linked by driverId)
interface DriverExtension {
  driverId: number;              // Links to iCabbi driver.id
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  schemeCode: string;            // Our commission scheme
  currentBalance: number;        // Our financial tracking
  lastStatementBalance: number;
  bankAccounts: BankAccount[];
  attributes: string[];          // Our custom tags
  preferences: DriverPreferences;
  // Cached/computed fields
  performance: PerformanceMetrics;
  complianceStatus: ComplianceStatus;
  updatedAt: string;
}

// Combined view for UI
type Driver = IcabbiDriver & DriverExtension;
```

---

## Next Steps

1. ✅ Update `icabbiAdapter.ts` with real field mappings
2. ✅ Create proper transformation functions
3. ✅ Handle string-to-enum conversions properly
4. ✅ Implement driver ref vs ID display logic
5. ✅ Update UI to show `ref` (call sign) instead of `id`
6. ✅ Create extension tables in IndexedDB
7. ✅ Implement sync strategy for iCabbi → Local

---

## Data Sync Strategy

### On Initial Sync:
1. Fetch all drivers from iCabbi `/drivers` endpoint
2. Transform iCabbi format → our format
3. Store in `COLLECTIONS.ICABBI_DRIVERS` (raw iCabbi data)
4. Create/update `COLLECTIONS.DRIVER_EXTENSIONS` for local fields
5. Merge for UI display

### On Webhook (Booking Complete):
1. Receive booking data
2. Extract driver_id, customer_id, vehicle_id
3. Update financial calculations
4. Trigger commission calculation
5. Update driver balance in extensions

### Periodic Refresh:
- Sync driver list every 15 minutes
- Sync vehicle list every hour
- Only update if `last_modified` changed

---

**Date**: 2025-11-04
**Source**: Real production iCabbi API responses
**Drivers Analyzed**: 2 sample drivers with full vehicle data
**Accounts Analyzed**: 10+ invoice and card accounts
**Users Analyzed**: 40+ customer/app user records
