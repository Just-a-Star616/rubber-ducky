# Commission Rules System - Complete Guide

## 📋 Overview

The Commission Rules System is a sophisticated, 3-stage commission configuration engine that allows staff to define complex commission structures based on booking fields, custom formulas, and payment methods.

**Key Features:**
- ✅ 3-stage configuration workflow (like webhook editor)
- ✅ Payment method filtering (Cash/Card/Invoice separate reporting)
- ✅ Location-based conditional rules (airport-aware)
- ✅ 13 booking fields with category grouping
- ✅ JavaScript formula support for commission calculation
- ✅ 9+ predefined output templates
- ✅ Full TypeScript type safety

## 🏗️ Architecture

### 3-Stage System

```
┌─────────────────────────────────────────────────┐
│  Stage 1: Select Booking Fields                │
│  Select which fields calculate commission base │
│  - Optional location/condition filtering       │
│  - Airport-aware field handling                │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│  Stage 2: Define Commission Formula            │
│  Calculate commission from selected field sum  │
│  - JavaScript expression support               │
│  - Access to sum, commissionRate, etc          │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│  Stage 3: Define Output Rules                  │
│  How to distribute calculated values           │
│  - Driver income, company income, etc          │
│  - Payment method specific reporting           │
└─────────────────────────────────────────────────┘
```

## 📁 Files & Components

### Types Definition
**File:** `types.ts`

```typescript
// Field rule with optional conditional logic and airport handling
export interface CommissionFieldRule {
  fieldName: string;
  include: boolean; // true = include in sum, false = exclude
  description?: string;
  condition?: string; // JavaScript expression (optional)
  airportHandling?: 'all' | 'airport_only' | 'exclude_airport';
}

// Output rule with payment method filtering
export interface CommissionOutputRule {
  outputName: string;
  formula: string;
  description?: string;
  paymentMethods?: ('Cash' | 'Card' | 'Invoice')[];
}

// Extended commission scheme
export interface CommissionScheme {
  // ... existing fields ...
  stage1FieldRules?: CommissionFieldRule[];
  stage2CommissionFormula?: string;
  stage3OutputRules?: CommissionOutputRule[];
}
```

### Main Component
**File:** `components/staff/CommissionRuleBuilder.tsx`

Provides 3 sub-components:

#### 1. Stage1FieldSelector
Displays available booking fields in categories with:
- Checkbox selection for field inclusion
- Airport handling options (for airport-aware fields)
- Optional condition editor for custom JavaScript expressions
- Visual feedback and grouping

**Available Fields:**
```
Financial:
  - price (Customer price charged)
  - cost (Operational cost)

Charges:
  - toll_fee (Toll charges) [AIRPORT-AWARE]
  - surge_charge (Surge pricing charge) [AIRPORT-AWARE]
  - platform_fee (Platform/booking fee)
  - congestion_charge (London congestion charge)
  - fuel_surcharge (Fuel surcharge)

Income:
  - passenger_tip (Passenger tip/gratuity) [AIRPORT-AWARE]
  - bonus (Quest or promotional bonus)

Metrics:
  - pickup_distance (Distance traveled km)
  - waiting_time (Waiting time minutes)
  - num_passengers (Number of passengers)
```

#### 2. Stage2FormulaEditor
JavaScript expression editor for commission calculation:
- Textarea with code highlighting
- Example formulas provided
- Access to variables: `sum`, `commissionRate`, `fixed_charges`

**Example Formulas:**
```javascript
sum * 15 / 100                    // 15% of sum
(sum * commissionRate) / 100      // Variable rate
sum * 0.15                        // Decimal calculation
```

#### 3. Stage3OutputRules
Output rule builder with:
- Predefined templates (quick start)
- Custom rule creation
- Payment method filtering
- Formula editor for each rule

**Predefined Templates (9 total):**
```
1. Driver Income - All payments
2. Driver Income (Cash) - Cash only
3. Driver Income (Card) - Card only
4. Driver Income (Invoice) - Invoice/account only
5. Company Income - All payments
6. Company Income (Cash) - Cash only
7. Company Income (Card) - Card only
8. Total Booking Value - Sum of all fields
9. Net to Driver - After fixed fees
```

### Integration Component
**File:** `components/staff/SchemeEditModal.tsx`

Modal with 4 tabs:
1. **Basic Info** - Scheme name, type, rates
2. **Stage 1: Fields** - Field selection
3. **Stage 2: Formula** - Commission calculation
4. **Stage 3: Outputs** - Output rule definition

## 🎯 Available Features

### 1. Airport-Aware Fields

**Airport List (12 major UK airports):**
- Heathrow
- Gatwick
- Stansted
- Luton
- City Airport
- Southend
- Bristol
- Manchester
- Birmingham
- Leeds
- Glasgow
- Edinburgh

**Handling Options for Airport-Aware Fields:**
- `all` (default) - Include for all bookings
- `airport_only` - Only for airport runs
- `exclude_airport` - Only for non-airport runs

**Example:**
```
User selects "surge_charge" field with "airport_only"
→ Surge charge only counted when pickup/dropoff is an airport
```

### 2. Conditional Rules

**JavaScript Expression Support:**
Custom conditions can filter field inclusion based on booking properties.

**Examples:**
```javascript
// Location-based
pickup_address.includes('Heathrow') || pickup_address.includes('Gatwick')

// Time-based
waiting_time > 30

// Distance-based
pickup_distance > 5

// Complex logic
(booking.pickupCoordinates.lat > 51.5) && (waiting_time > 20)
```

### 3. Payment Method Filtering

Report commission separately for different payment methods:
- Cash
- Card
- Invoice/Account

**Example Output Rules:**
```
Rule 1: "Driver Income (Cash)" - Cash payments only
Rule 2: "Driver Income (Card)" - Card payments only
Rule 3: "Company Income (Cash)" - Cash commission only
Rule 4: "Company Income (Card)" - Card commission only
```

## 💻 Usage Guide

### For Staff (UI Usage)

#### Step 1: Create/Edit Scheme
1. Go to Finance → Scheme Definitions
2. Click "Add New Scheme" or Edit existing scheme
3. Set Basic Info (name, type, rates)

#### Step 2: Stage 1 - Select Fields
1. Click "Stage 1: Fields" tab
2. Click fields to select/deselect
3. For airport-aware fields (toll_fee, surge_charge, passenger_tip):
   - Select airport handling option
   - Optionally add custom condition
4. Example: Select "price" + "surge_charge (airport_only)"

#### Step 3: Stage 2 - Define Formula
1. Click "Stage 2: Formula" tab
2. Enter JavaScript expression
3. Use variables: `sum` (selected fields total)
4. Example: `(sum * 18) / 100` for 18% commission

#### Step 4: Stage 3 - Output Rules
1. Click "Stage 3: Outputs" tab
2. Use presets or create custom rules
3. For payment method split:
   - Select "Driver Income (Cash)" for cash
   - Select "Driver Income (Card)" for card
   - Select "Company Income (Cash)" for company cut
4. Save scheme

### For Developers (Code Usage)

#### Loading a Scheme
```typescript
const scheme = commissionSchemes.find(s => s.id === 'S1');

// Access the 3-stage rules
const fieldRules = scheme.stage1FieldRules; // CommissionFieldRule[]
const formula = scheme.stage2CommissionFormula; // string
const outputRules = scheme.stage3OutputRules; // CommissionOutputRule[]
```

#### Calculating Commission
```typescript
// Stage 1: Sum selected fields
const selectedFieldsSum = calculateFieldSum(
  booking,
  fieldRules.filter(r => r.include)
);

// Stage 2: Apply formula
const commission = evalFormula(
  formula,
  {
    sum: selectedFieldsSum,
    commissionRate: scheme.commissionRate,
    fixed_charges: scheme.vehicleRent + scheme.insuranceDeposit
  }
);

// Stage 3: Apply output rules
const outputs = outputRules
  .filter(r => !r.paymentMethods || r.paymentMethods.includes(booking.paymentMethod))
  .map(r => ({
    name: r.outputName,
    value: evalFormula(r.formula, {
      sum: selectedFieldsSum,
      commission
    })
  }));
```

## 📊 Example Scenarios

### Scenario 1: Standard 15% Commission
```
Stage 1: Select "price" field (all bookings)
Stage 2: Formula = "(sum * 15) / 100"
Stage 3: 
  - "Driver Income" = "sum - commission"
  - "Company Income" = "commission"
```

### Scenario 2: Airport Premium (18% vs 15%)
```
Stage 1: 
  - price (all bookings)
  - surge_charge (airport_only - adds 20% to airport runs)
Stage 2: Formula = "(sum * 18) / 100"
Stage 3:
  - "Driver Income (Cash)" = "sum - commission"
  - "Driver Income (Card)" = "sum - commission"
  - "Company Income (Cash)" = "commission"
  - "Company Income (Card)" = "commission"
```

### Scenario 3: Conditional Tolls (Only Long Distance)
```
Stage 1:
  - price (all bookings)
  - toll_fee (condition: "pickup_distance > 5")
  - surge_charge (airport_only)
Stage 2: Formula = "(sum * 16) / 100"
Stage 3:
  - "Driver Income" = "sum - commission"
  - "Company Income" = "commission"
```

### Scenario 4: Payment Method Split with Airport Rules
```
Stage 1:
  - price (all bookings)
  - surge_charge (airport_only)
  - passenger_tip (exclude_airport - only street tips)
Stage 2: Formula = "(sum * 18) / 100"
Stage 3:
  - "Driver Income (Cash)" = "sum - commission"
  - "Driver Income (Card)" = "sum - commission"
  - "Driver Income (Invoice)" = "sum - commission"
  - "Company Income (Cash)" = "commission"
  - "Company Income (Card)" = "commission * 0.9" (10% discount for card)
```

## 🔄 Data Flow

```
User fills commission scheme form
        ↓
stage1FieldRules saved to CommissionScheme
stage2CommissionFormula saved to CommissionScheme
stage3OutputRules saved to CommissionScheme
        ↓
Data persisted to database/state
        ↓
Booking processed:
  1. Extract selected fields from booking
  2. Sum them (with conditions/airport rules applied)
  3. Calculate commission using formula
  4. Generate output values using output rules
  5. Filter by payment method
  6. Report separately for Cash/Card/Invoice
        ↓
Staff views commission reports
  - Cash commissions
  - Card commissions
  - Invoice commissions
  - By driver, by date range, etc
```

## 🎓 Advanced Usage

### Custom Condition Examples

**London Congestion Zone:**
```javascript
pickup_address.includes('London') && pickup_address.includes('Zone 1')
```

**Premium Airports Only:**
```javascript
['Heathrow', 'Gatwick', 'Stansted'].some(a => pickup_address.includes(a))
```

**Night Premium:**
```javascript
new Date(pickupDateTime).getHours() >= 22 || new Date(pickupDateTime).getHours() < 6
```

**VIP Customer:**
```javascript
booking.customerAttributes?.includes('VIP')
```

### Formula Examples

**Tiered Commission:**
```javascript
sum < 10 ? 0 : sum < 20 ? sum * 0.12 : sum * 0.15
```

**Flat Fee + Percentage:**
```javascript
5 + (sum * 0.10)
```

**Capped Commission:**
```javascript
Math.min(sum * 0.15, 10)
```

**Dynamic Rate:**
```javascript
sum > 50 ? (sum * 0.15) : (sum * 0.20)
```

## 🔐 Validation & Safety

### Field Selection
- ✅ Validates field names exist
- ✅ Prevents duplicate fields
- ✅ Type-checks include/exclude

### Formulas
- ✅ JavaScript syntax validation recommended
- ✅ Variables must exist in context
- ✅ Error handling on evaluation

### Conditions
- ✅ JavaScript syntax validation
- ✅ Safe evaluation in sandboxed context
- ✅ Fallback to default if error

### Payment Methods
- ✅ Only 'Cash', 'Card', 'Invoice' allowed
- ✅ Validates against booking paymentMethod
- ✅ Undefined = all methods

## 📈 Monitoring & Reporting

### Commission Scheme Usage
Track which schemes are active:
```
- Total bookings by scheme
- Average commission per scheme
- Driver earnings by scheme
- Commission by payment method
```

### Field Usage Analytics
Track which fields are most commonly used:
```
- Most selected fields
- Most conditional fields
- Airport-aware field usage
```

## 🆘 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Formula not working | Syntax error | Check JavaScript syntax |
| Condition not filtering | Incorrect property name | Verify booking object structure |
| Airport handling not applied | Field not marked airport-aware | Check AVAILABLE_BOOKING_FIELDS |
| Payment method rule not firing | Method mismatch | Verify booking.paymentMethod value |
| Output value always zero | Formula references wrong variable | Check available variables |

## 🚀 Deployment Notes

### Frontend
- CommissionRuleBuilder: `components/staff/CommissionRuleBuilder.tsx`
- SchemeEditModal: `components/staff/SchemeEditModal.tsx`
- SchemesPage: `views/staff/SchemesPage.tsx`

### Backend
- Store `stage1FieldRules` in database
- Store `stage2CommissionFormula` as text
- Store `stage3OutputRules` in database
- Validate formulas before storing
- Execute formulas in safe context

### Performance Considerations
- Cache compiled formulas
- Batch commission calculations
- Use indexes on scheme_id, payment_method
- Consider formula evaluation limits

## 📚 Related Documentation

- **Driver Signup**: `docs/DRIVER_SIGNUP_DEPLOYMENT.md`
- **Staff Dashboard**: `docs/STAFF_DASHBOARD_SETUP.md`
- **Backend Setup**: `docs/BACKEND_SETUP.md`
- **Architecture**: `docs/ARCHITECTURE_DIAGRAMS.md`

## 🎯 Future Enhancements

- [ ] Formula syntax highlighting
- [ ] Commission calculation preview
- [ ] A/B testing different schemes
- [ ] Commission scheme versioning
- [ ] Export/import schemes
- [ ] Commission impact calculator
- [ ] Real-time formula validation
- [ ] Commission reconciliation reports

## 📞 Support

For issues with the commission rules system:

1. Check the Troubleshooting section above
2. Review example scenarios that match your use case
3. Verify field names in AVAILABLE_BOOKING_FIELDS
4. Test JavaScript formula syntax separately
5. Check payment method values in booking object

---

**Created**: November 2, 2025  
**Status**: Production Ready  
**Last Updated**: November 2, 2025

