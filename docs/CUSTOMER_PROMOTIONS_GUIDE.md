# Customer Promotions & Loyalty Programs Guide

## Overview

This guide covers the customer promotions system, which enables you to create and manage:
- **Loyalty Schemes**: Tier-based reward programs with points and tier benefits
- **Promo Codes**: Time-limited discount campaigns with various discount types

The system integrates with **Voucherify**, a leading promotion management platform, to handle:
- Campaign creation and management
- Voucher code generation
- Redemption tracking
- Analytics and reporting

---

## Features

### Loyalty Schemes

Create multi-tier loyalty programs that reward customer engagement:

- **Tier-Based Structure**: Bronze, Silver, Gold, Platinum (customizable)
- **Point System**: Earn points on transactions, redeem for rewards
- **Progressive Rewards**: Higher tiers unlock better discounts
- **Flexible Reward Types**: Percentage discounts, fixed amounts, free rides, double points

**Example Tiers**:
```
Bronze (0 points)      → Base member, 1 point per ride
Silver (500 points)    → 5% discount
Gold (1500 points)     → 10% discount  
Platinum (3000 points) → Free ride
```

### Promo Codes

Launch limited-time discount campaigns:

- **Multiple Discount Types**: Percentage, fixed amount, free ride, or double points
- **Usage Controls**: Set max redemptions per campaign
- **Targeting**: Target specific customer segments
- **Order Minimums**: Enforce minimum order values
- **Date-Based Expiry**: Set start and end dates

**Campaign Types**:
- Welcome bonuses for new customers
- Re-engagement campaigns for inactive drivers
- Seasonal promotions
- Partner collaborations

---

## Voucherify Integration

### Setup Requirements

1. **Create Voucherify Account**
   - Visit https://www.voucherify.io
   - Sign up for an account
   - Create a new workspace

2. **Get API Credentials**
   - Go to Settings → API Keys
   - Copy your:
     - `API Key`
     - `Workspace ID`
     - `Client ID`

3. **Configure Environment Variables**
   ```bash
   VITE_VOUCHERIFY_API_KEY=your_api_key_here
   VITE_VOUCHERIFY_WORKSPACE_ID=your_workspace_id
   VITE_VOUCHERIFY_CLIENT_ID=your_client_id
   VITE_VOUCHERIFY_ENV=production  # or 'sandbox' for testing
   ```

### How Integration Works

When you create or update a customer promotion:

1. **Loyalty Scheme Creation**
   - Creates a LOYALTY_PROGRAM in Voucherify
   - Sets up tier structure and rules
   - Enables point earning and redemption

2. **Promo Code Creation**
   - Creates a PROMOTION campaign in Voucherify
   - Generates unique voucher codes
   - Sets discount rules and validity dates

3. **Redemption Tracking**
   - Each redemption is logged in Voucherify
   - Usage counts update in real-time
   - Analytics are available in both systems

---

## User Guide

### Creating a Loyalty Scheme

1. **Navigate** to Staff Dashboard → Promotions Management
2. **Click** "Add Loyalty Scheme"
3. **Fill in Details**:
   - Name: e.g., "Loyalty Rewards Program"
   - Description: What customers earn
   - Status: Draft, Active, Paused, etc.
   - Target Audience: All, New Drivers, etc.
4. **Configure Tiers**:
   - Define tier names (Bronze, Silver, etc.)
   - Set points required for each tier
   - Specify rewards (discount %, free rides, etc.)
5. **Set Dates**:
   - Starts At: When the program begins
   - Ends At: When it expires
6. **Services**: Select which services participate
7. **Save**: Click "Create Loyalty Scheme"

The system will:
- Create the loyalty program in Voucherify
- Generate a Campaign ID for syncing
- Display it on the Promotions page with status

### Creating a Promo Code Campaign

1. **Navigate** to Staff Dashboard → Promotions Management
2. **Click** "Add Promo Code"
3. **Fill in Details**:
   - Name: e.g., "Black Friday Sale"
   - Description: What discount applies
   - Status: Draft or Active
4. **Configure Discount**:
   - Type: Percentage, Fixed Amount, Free Ride, Double Points
   - Value: Amount/percentage
   - Max Redemptions: How many times it can be used
5. **Set Targeting**:
   - Audience: All, New Drivers, Inactive, High-Value
   - Minimum Order Value (if applicable)
6. **Set Validity**:
   - Starts At & Ends At dates
7. **Services**: Which services apply
8. **Save**: System generates voucher codes

### Managing Existing Promotions

**View Promotions**:
- See all active, paused, and expired promotions
- Filter by Loyalty Schemes or Promo Codes tabs
- Status indicators show campaign health

**Edit**:
- Click the "Edit" button on any promotion
- Modify details, dates, or discount values
- Sync changes to Voucherify

**Delete**:
- Click "Delete" to remove a promotion
- Confirm the action
- Note: Voucherify campaign is NOT deleted (for audit trail)

**View Stats** (when available):
- Click "Stats" to see:
  - Total redemptions
  - Unique customers
  - Total discount given
  - Revenue impact

---

## Integration with Passenger App

Since iCabbi already uses Voucherify for the passenger app, you can:

1. **Reuse Existing Infrastructure**
   - Same API credentials
   - Same Voucherify workspace
   - Unified promotion management

2. **Cross-Platform Promotions**
   - Create promotions in this staff system
   - They automatically sync to Voucherify
   - Can be used in passenger app or driver incentives

3. **Analytics**
   - View redemptions across all platforms
   - Track customer engagement
   - Measure campaign ROI

---

## API Functions

### Core Functions

**Get Configuration**:
```typescript
const config = getVoucherifyConfig();
// Returns: { apiKey, workspaceId, clientId, environment }
```

**Create Loyalty Program**:
```typescript
const campaignId = await createLoyaltyProgram(config, promotion);
// Creates tiers, earn rules, redeem rules
```

**Create Promotion**:
```typescript
const campaignId = await createPromotionCampaign(config, promotion);
// Sets discount, validity, redeemable limits
```

**Generate Codes**:
```typescript
const codes = await generatePromoCodes(config, campaignId, 100);
// Returns array of unique promo codes
```

**Validate Code**:
```typescript
const result = await validatePromoCode(config, 'BLACKFRI20', 25.00);
// { valid: true, discount: 5.00 }
```

**Redeem Code**:
```typescript
const result = await redeemPromoCode(config, 'BLACKFRI20', 'customer-123', 25.00);
// Marks code as redeemed, returns discount value
```

**Loyalty Points**:
```typescript
await addLoyaltyPoints(config, 'customer-123', 100, 'program-id');
// Adds points to customer account

const balance = await getLoyaltyBalance(config, 'customer-123', 'program-id');
// Returns: { points: 750, tier: 'Gold' }
```

---

## Best Practices

### For Loyalty Schemes

1. **Start Conservative**
   - Don't require unrealistic point targets
   - Initial tier should be achievable
   - Increase difficulty for higher tiers

2. **Regular Campaigns**
   - Use tiers strategically
   - Combine with seasonal promotions
   - Update tier structure annually

3. **Transparency**
   - Clearly communicate tier benefits
   - Show progress to customers
   - Make redemption process obvious

### For Promo Codes

1. **Segment Campaigns**
   - Different codes for different audiences
   - Track which audiences respond best
   - Tailor future campaigns

2. **Usage Limits**
   - Set realistic limits
   - Monitor redemption rate
   - Adjust if needed mid-campaign

3. **Timing**
   - Plan campaigns around:
     - Seasonal demand
     - Competitor activity
     - Local events
   - Always test with early-bird codes

4. **Minimum Orders**
   - Prevent profiteering
   - Encourage larger transactions
   - Protect margin

---

## Troubleshooting

### Promotion Not Syncing

**Problem**: Campaign ID shows as "Not synced"

**Solution**:
1. Check environment variables are set correctly
2. Verify Voucherify API key has required permissions
3. Check network connectivity
4. Try saving promotion again
5. Check Voucherify API status

### Codes Not Working

**Problem**: Users can't redeem promo codes

**Solution**:
1. Verify code hasn't expired
2. Check max redemptions haven't been reached
3. Confirm order meets minimum value
4. Check code is associated with correct services
5. Contact Voucherify support if issue persists

### Analytics Missing

**Problem**: Stats don't load when clicking "Stats" button

**Solution**:
1. Wait 5-10 minutes after campaign sync
2. Refresh page and try again
3. Check Voucherify workspace has data
4. Verify API permissions include analytics

---

## Examples

### Creating a New Year Promotion

```
Name: "New Year New Rides"
Type: Promo Code
Discount: 20% off
Max Redemptions: 500
Valid: Jan 1 - Jan 31
Target: All customers
Min Order: £5
```

### Loyalty Program Setup

```
Name: "RidePoints Plus"
Type: Loyalty Scheme
Bronze Tier: 0 points → 1 point per ride
Silver Tier: 500 points → 5% discount
Gold Tier: 1,500 points → 10% discount + priority booking
Platinum Tier: 3,000 points → Free ride per month
```

### Re-engagement Campaign

```
Name: "We Miss You"
Type: Promo Code
Target: Inactive drivers (no rides in 30 days)
Discount: £10 fixed
Max Uses: 200
Valid: 30 days from send
Min Order: £3
```

---

## Time-Based Scheduling

### Overview

The system now supports advanced time-based scheduling for promotions. You can configure when each promotion is active:

- **Day-of-Week Schedules**: Active on specific days (e.g., Mon/Wed/Fri)
- **Multiple Time Periods**: Different availability in morning, afternoon, evening
- **Specific Dates**: Set exact dates with custom times
- **Blackout Dates**: Exclude holidays or special events
- **Timezone Support**: Set promotions for different time zones

### Schedule Types

#### 1. Always On
The promotion is active 24/7 with no time restrictions.

```
Example: "Free ride for all drivers" - Valid every day, all day
```

#### 2. Specific Days and Times

The promotion is active on selected days during specified time periods.

**Example: Midweek Momentum**
```
10% off on Monday, Wednesday, Friday
10:00 AM - 1:00 PM
Timezone: Europe/London
```

**Example: Rush Hour Boost**
```
Double points Monday - Friday
7:00 AM - 10:00 AM (morning)
5:00 PM - 8:00 PM (evening)
Timezone: Europe/London
```

#### 3. Specific Dates

The promotion is only active on specific calendar dates.

**Example: Anniversary Special**
```
£5 off on June 15, 2025
10:00 AM - 11:59 PM
```

#### 4. Blackout Dates

The promotion is active everywhere except on specific dates (holidays, maintenance, etc.).

**Example: Daily Campaign (except holidays)**
```
Active: Every day 8:00 AM - 10:00 PM
Except: Dec 25, Jan 1, Dec 31
```

### Quick Presets

The schedule builder includes pre-configured templates:

1. **Weekdays 9am-5pm**: Office workers and business customers
2. **Mon/Wed/Fri 10am-1pm**: Mid-day promotions  
3. **Weekend Nights**: Fri-Sun after 8 PM
4. **Rush Hours**: Mon-Fri 7-10am & 5-8pm
5. **Late Night**: Every day 8 PM - 2 AM
6. **Always On**: 24/7 availability

### Timezone Support

Supported timezones:
- **Europe/London** - GMT/BST
- **Europe/Paris** - CET/CEST
- **Europe/Berlin** - CET/CEST
- **America/New_York** - EST/EDT
- **America/Los_Angeles** - PST/PDT
- **Asia/Tokyo** - JST
- **Australia/Sydney** - AEDT/AEST

### Creating a Scheduled Promotion

1. **Create/Edit Promotion**
   - Go to Staff Dashboard → Promotions → Customer Promotions
   - Click "Add Promotion" or edit existing one

2. **Configure Schedule**
   - In the edit modal, scroll to "Schedule" section
   - Select schedule type from tabs
   - Configure days and times
   - Choose timezone
   - Review coverage % indicator

3. **Save and Verify**
   - Check "Currently active" indicator on promotion card
   - Verify schedule displays correctly
   - Promotion syncs to Voucherify

### How Time-Based Promotions Work

**Availability Checking**:
- Real-time status checks current time against schedule
- "Currently active" badge shows if promotion is available now
- Schedule respects configured timezone
- Handles overnight periods (e.g., 10 PM - 2 AM)

**Customer View**:
- Customers see active promotions in their app
- Schedule shown with readable format
- Inactive promotions hidden until they become active
- Timezone converted to customer's local time

**Analytics**:
- Track which time periods drive most redemptions
- Optimize scheduling based on usage patterns
- A/B test different time slots

### Advanced Scheduling Examples

**Example 1: Peak Hours Boost**
```
Type: Specific Days and Times
Active: Mon-Fri (5 days)
Times: 7am-10am, 5pm-8pm (2 periods)
Coverage: 30% of day
Use: Target commute times
```

**Example 2: Weekend Exclusive**
```
Type: Specific Days and Times
Active: Fri-Sun (3 days)
Times: 8pm-2am (overnight)
Coverage: 15% of day
Use: Weekend nightlife promotion
```

**Example 3: VIP Access Window**
```
Type: Specific Dates
Dates: Dec 26, 2025 (specific day)
Times: 12pm-3pm (3 hours)
Target Audience: High-value drivers
Use: Post-holiday exclusive sale
```

**Example 4: Around-the-Clock (with breaks)**
```
Type: Specific Days and Times
Active: Every day
Times: 6am-11pm (closed midnight-6am)
Coverage: 62.5% of day
Use: Service hours alignment
```

### Best Practices

1. **Align with Business Hours**
   - Schedule promotions when drivers are most active
   - Consider peak demand times
   - Account for timezone differences if multi-regional

2. **Test Before Launch**
   - Use specific date schedule to test limited time
   - Verify "Currently active" shows correct status
   - Check timezone conversion if needed

3. **Monitor Performance**
   - Track redemptions by time period
   - Identify peak engagement windows
   - Adjust schedule based on data

4. **Communicate Clearly**
   - Use simple, readable schedule descriptions
   - Avoid complex overlapping periods
   - Include timezone info if international

5. **Handle Edge Cases**
   - Use blackout dates for holidays
   - Set maintenance windows in advance
   - Consider daylight saving time transitions

---

## Reference

### Discount Types

| Type | Example | Use Case |
|------|---------|----------|
| Percentage | 20% off | General discounts, flash sales |
| Fixed Amount | £5 off | Specific incentives, loyalty rewards |
| Free Ride | 1 free ride | High-value rewards, special events |
| Double Points | 2x points | Loyalty boosts, member promotions |

### Target Audiences

| Audience | Best For |
|----------|----------|
| All Customers | Seasonal campaigns, universal offers |
| New Drivers | Welcome bonuses, onboarding incentives |
| Inactive Drivers | Re-engagement, win-back campaigns |
| High-Value Drivers | VIP treatment, exclusive deals |

---

## Support

For issues with:

- **Voucherify API**: https://docs.voucherify.io
- **Promo Codes**: Check Voucherify dashboard
- **System Features**: Contact development team
- **Configuration**: Review .env setup

---

**Last Updated**: November 3, 2025  
**Version**: 1.1 - Added time-based scheduling  
**Status**: Documented & Ready for Use
