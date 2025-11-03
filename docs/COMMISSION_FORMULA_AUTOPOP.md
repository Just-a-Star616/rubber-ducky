# Commission Scheme Formula Auto-Population Feature

## Overview

The Commission Scheme builder now includes intelligent **auto-population** of Stage 2 formulas based on the Tier configuration set in Basic Info. This streamlines the creation process by automatically generating complex tiered commission formulas from simple tier settings.

## How It Works

### The Process

1. **Basic Info → Configure Tiers**
   - User defines tier structure in Basic Info tab
   - Example: Tier 1: 20% up to £500, Tier 2: 25% up to £1000, Tier 3: 30% unlimited

2. **Stage 2 → Auto-Populate Formula**
   - User navigates to Stage 2: Formula tab
   - Blue info box appears showing configured tiers
   - User clicks "Auto-Populate" button
   - System generates complete tiered formula automatically

3. **Review & Adjust**
   - Formula displays in the textarea
   - User can see generated formula in real-time
   - User can manually edit/correct if needed
   - Changes are saved when "Save Changes" button is clicked

### Example

**Configured Tiers (in Basic Info):**
```
Tier 1: Rate 20%, Up To £500
Tier 2: Rate 25%, Up To £1000
Tier 3: Rate 30%, Up To Unlimited (999999)
```

**Auto-Generated Formula (Stage 2):**
```
sum <= 500 ? sum * 0.2 : (sum <= 1000 ? sum * 0.25 : sum * 0.3)
```

**What This Means:**
- If commission sum ≤ £500: Apply 20%
- If commission sum > £500 and ≤ £1000: Apply 25%
- If commission sum > £1000: Apply 30%

## UI Components

### Auto-Population Panel
```
┌─────────────────────────────────────────────────────┐
│ 💡 Auto-Populate from Tiers                         │
│ 3 tier(s) configured. Click "Auto-Populate" to      │
│ generate the formula below.                         │
│                          [Auto-Populate] ✓          │
└─────────────────────────────────────────────────────┘
```

### Features
- **Blue info box** - Highlights available auto-population
- **Status text** - Shows number of configured tiers or prompt to configure
- **"Auto-Populate" button** - One-click formula generation
- **Disabled state** - Button disabled if no tiers configured
- **Current Formula display** - Shows generated formula in green box after population

## User Workflow

### Quick Start - Create a Tiered Commission Scheme

1. **Open Commission Scheme Modal**
   - Click "Add New Scheme" or edit existing scheme

2. **Go to Basic Info Tab**
   - Set Scheme Name: "Tiered 20-25-30"
   - Set Type: "Tiered % on total £" (or other tiered type)
   - Click "Add Tier" button 3 times to create tiers:
     - Tier 1: Rate 20%, Up To 500
     - Tier 2: Rate 25%, Up To 1000
     - Tier 3: Rate 30%, Up To 999999 (for unlimited)

3. **Go to Stage 2: Formula Tab**
   - See blue info box: "3 tier(s) configured"
   - Click "Auto-Populate" button
   - Formula automatically generated:
     ```
     sum <= 500 ? sum * 0.2 : (sum <= 1000 ? sum * 0.25 : sum * 0.3)
     ```

4. **Review and Adjust (Optional)**
   - View the generated formula
   - Make manual edits if needed
   - Examples of adjustments:
     - Add caps: `Math.min(sum * 0.3, 500)` for max £500 commission
     - Add minimum: `Math.max(sum * 0.2, 10)` for min £10 commission

5. **Continue to Stage 3**
   - Define output rules (Driver Income, Company Income, etc.)
   - Save the scheme

## Formula Generation Algorithm

The auto-population generates nested ternary expressions for optimal performance:

```typescript
// Pseudo-code of generation logic
function generateTieredFormula(tiers: Tier[]): string {
  const sorted = tiers.sorted by upTo amount
  
  for each tier:
    rate = tier.rate / 100  // Convert % to decimal (20% → 0.2)
    
  Build nested ternary:
    sum <= tier1.upTo ? sum * rate1 : 
    (sum <= tier2.upTo ? sum * rate2 :
    sum * rate3)
}
```

**Example with 3 tiers:**
```
sum <= 500 ? sum * 0.2 : (sum <= 1000 ? sum * 0.25 : sum * 0.3)
  ↓           ↓              ↓             ↓            ↓
 check    20%              check       25%         30%
```

## Editing Behavior

### Scenario 1: User modifies tiers after auto-population
- Formula remains unchanged
- User can click "Auto-Populate" again to regenerate
- Or keep existing formula and edit manually

### Scenario 2: User manually edits the formula
- Formula can be freely edited
- Is independent of tiers
- Auto-Populate will overwrite manual changes if clicked again

### Scenario 3: User needs to save a partial formula
- Click "Auto-Populate" to generate base formula
- Manually adjust/enhance it
- Enhancements are preserved on save

## Use Cases

### Use Case 1: Progressive Commission Model
Create a tiered system where drivers earn more commission at higher volumes:

**Tiers:**
- 0-1000: 10% commission
- 1000-5000: 15% commission
- 5000+: 20% commission

**Auto-Generated Formula:**
```
sum <= 1000 ? sum * 0.1 : (sum <= 5000 ? sum * 0.15 : sum * 0.2)
```

### Use Case 2: Loyalty Tier System
Reward long-time drivers with better rates:

**Tiers:**
- New drivers (0-500): 25%
- Regular drivers (500-2000): 20%
- Premium drivers (2000+): 15%

**Auto-Generated Formula:**
```
sum <= 500 ? sum * 0.25 : (sum <= 2000 ? sum * 0.2 : sum * 0.15)
```

### Use Case 3: Performance-Based System
Higher performance gets better commission rates:

**Tiers:**
- Poor performance (0-100): 30%
- Good performance (100-500): 25%
- Excellent performance (500+): 20%

**Auto-Generated Formula:**
```
sum <= 100 ? sum * 0.3 : (sum <= 500 ? sum * 0.25 : sum * 0.2)
```

## Manual Formula Examples

If auto-population doesn't fit your needs, you can write custom formulas:

```javascript
// Capped commission (max £100)
Math.min(sum * 0.2, 100)

// Minimum commission (min £10)
Math.max(sum * 0.2, 10)

// Progressive with caps
Math.min(sum <= 500 ? sum * 0.2 : (sum <= 1000 ? sum * 0.25 : sum * 0.3), 500)

// Volume bonus
sum * 0.2 + (sum > 1000 ? 50 : 0)

// Efficiency-based
sum * (0.1 + (efficiency * 0.1))
```

## Technical Details

### Input
- `tiers`: Array of { rate: number, upTo: number }
- `schemeType`: String indicating commission type
- Only tiered scheme types support auto-population

### Output
- `formula`: String containing JavaScript expression
- Expression uses `sum` variable for commission calculation basis
- Expression is valid for evaluation via `eval()` or similar

### Validation
- Auto-populated formulas are syntactically valid
- No syntax errors from generation
- User can still introduce errors through manual editing

## Benefits

✅ **Faster Creation** - No need to write complex formulas manually
✅ **Error Reduction** - Automatically correct tiered logic
✅ **Visual Clarity** - See generated formula immediately
✅ **Flexibility** - Can adjust generated formula as needed
✅ **Learning** - See examples of proper formula syntax
✅ **Consistency** - Tiered schemes follow standard patterns

## Limitations

- ⚠️ Only works with tiered commission schemes
- ⚠️ Does not handle complex custom logic (use manual formula for that)
- ⚠️ Overwrites existing formula if clicked again
- ⚠️ Limited to ternary operator based formulas

## Future Enhancements

- Visual formula builder (drag-drop blocks)
- Formula validation and error highlighting
- Export/import formulas between schemes
- Formula templates for common scenarios
- Support for non-tiered auto-population
- AI-powered formula suggestions based on business rules

## Related Documentation

- [COMMISSION_RULES_SYSTEM.md](./COMMISSION_RULES_SYSTEM.md) - Complete commission system guide
- [RULE_BUILDER_GUIDE.md](./RULE_BUILDER_GUIDE.md) - Unified rule builder system
- [QA_TESTING_CHECKLIST.md](./QA_TESTING_CHECKLIST.md) - Testing procedures including commission tests

## Testing Checklist

- [ ] Create scheme with 2 tiers, auto-populate formula
- [ ] Create scheme with 3 tiers, auto-populate formula
- [ ] Verify formula has correct tier thresholds
- [ ] Verify formula has correct commission rates
- [ ] Edit tiers, auto-populate again (should regenerate)
- [ ] Edit formula manually, verify changes persisted
- [ ] Edit formula, then auto-populate (should overwrite)
- [ ] Test auto-populate disabled state (no tiers)
- [ ] Test formula evaluation with sample commission amounts

---

**Last Updated**: November 3, 2025
**Status**: Active Feature
**Version**: 1.0
