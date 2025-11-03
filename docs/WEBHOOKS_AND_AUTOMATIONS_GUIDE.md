# Webhooks and Automations Guide

This guide covers the webhook and automation system for DarthStar Dispatch. Webhooks allow external systems to receive real-time notifications of events, while automations enable business rules to trigger actions automatically within the system.

## Overview

### What Are Webhooks?

Webhooks are HTTP callbacks that notify external systems when specific events occur in DarthStar Dispatch. When an event happens (e.g., booking created, driver assigned), the system sends a POST request to your configured webhook URL with the event data.

**Example**: When a booking is created, a webhook can notify your CRM, accounting system, or analytics platform instantly.

### What Are Automations?

Automations are rules that automatically execute actions within DarthStar Dispatch when certain conditions are met. They eliminate manual, repetitive tasks.

**Example**: When a booking is created with URGENT priority, automatically assign the nearest available driver and send SMS notification to passenger.

### What Are Message Templates?

Message templates are pre-written messages (SMS, Email, In-app) that can be sent to drivers, passengers, or staff based on automation triggers or manual dispatch.

**Example**: When a booking is assigned to a driver, send SMS: "You have a new booking: {{passenger_name}} from {{pickup_location}} to {{destination}}. ETA: {{eta}}"

## Webhook System

### Available Webhook Events (18 Total)

#### Booking Events (5)
| Event | When Triggered | Example Payload |
|-------|----------------|-----------------|
| **booking.created** | New booking submitted | `{id, pickup, dropoff, passenger, time, fare}` |
| **booking.updated** | Booking details modified | `{id, changes: {fare, pickup}, timestamp}` |
| **booking.confirmed** | Booking confirmed/paid | `{id, confirmation_code, payment_method}` |
| **booking.cancelled** | Booking cancelled | `{id, cancellation_reason, cancelled_by}` |
| **booking.completed** | Booking finished | `{id, completion_time, distance, actual_fare}` |

#### Driver Assignment Events (3)
| Event | When Triggered | Payload |
|-------|----------------|---------|
| **driver.assigned** | Driver assigned to booking | `{booking_id, driver_id, driver_name, eta}` |
| **driver.accepted** | Driver accepted assignment | `{booking_id, driver_id, acceptance_time}` |
| **driver.rejected** | Driver rejected assignment | `{booking_id, driver_id, reason}` |

#### Journey Events (4)
| Event | When Triggered | Payload |
|-------|----------------|---------|
| **journey.started** | Driver began journey to pickup | `{booking_id, driver_id, start_time, location}` |
| **journey.pickup_arrived** | Driver arrived at pickup | `{booking_id, driver_id, arrival_time, location}` |
| **journey.passenger_picked** | Passenger picked up | `{booking_id, driver_id, pickup_time, location}` |
| **journey.destination_arrived** | Driver arrived at destination | `{booking_id, driver_id, arrival_time, location}` |

#### Invoice & Payment Events (4)
| Event | When Triggered | Payload |
|-------|----------------|---------|
| **invoice.created** | Invoice generated | `{invoice_id, booking_id, amount, due_date}` |
| **invoice.paid** | Invoice paid | `{invoice_id, payment_method, amount, date}` |
| **payment.received** | Payment received | `{payment_id, amount, method, timestamp}` |
| **payment.failed** | Payment processing failed | `{payment_id, error_code, amount, timestamp}` |

#### Driver Management Events (2)
| Event | When Triggered | Payload |
|-------|----------------|---------|
| **driver.online** | Driver came online | `{driver_id, timestamp, location}` |
| **driver.offline** | Driver went offline | `{driver_id, timestamp, last_location}` |

### Webhook Configuration

#### Setup Webhook Endpoint

1. Navigate to **Admin → Integrations → Webhooks**
2. Click **"Add Webhook"**
3. Enter webhook details:
   - **Webhook URL**: `https://your-domain.com/webhooks/dispatch`
   - **Event**: Select from dropdown (e.g., "booking.created")
   - **Description**: "Sync bookings to CRM system"
   - **Authorization**: Select auth type (see below)
   - **Retry Policy**: Choose retry strategy (see below)

#### Authorization Methods

**1. No Authentication**
- ❌ Not recommended for production
- Use only for development/testing
- Anyone with URL can send fake events

**2. API Key (Header)**
```
Authorization: Bearer YOUR_API_KEY
Header: X-DarthStar-API-Key: YOUR_API_KEY
```
- Configure your API key in webhook settings
- System sends key in request header
- Your endpoint verifies key matches

**3. HMAC Signature**
```
X-DarthStar-Signature: sha256=HMAC_VALUE
```
- System signs request body with shared secret
- Your endpoint verifies signature
- Most secure option (recommended)
- Prevents request tampering

**4. OAuth 2.0**
- For webhooks to third-party services
- System obtains access token from your OAuth provider
- Token used to authorize webhook requests

#### Retry Policy

**Configuration Options**:

| Option | Retry Behavior | Use Case |
|--------|----------------|----------|
| **No Retry** | Send once, fail silently | Analytics events (data loss acceptable) |
| **Retry 3x** | Retry 3 times on failure, 10s delay | Important events (moderate tolerance) |
| **Retry 5x** | Retry 5 times, exponential backoff | Critical events (payment, driver events) |
| **Retry Forever** | Keep retrying hourly for 7 days | Mission-critical events (billing) |

**Exponential Backoff Example** (Retry 5x):
- Attempt 1: Immediate
- Attempt 2: 10s delay
- Attempt 3: 20s delay
- Attempt 4: 40s delay
- Attempt 5: 80s delay
- Give up after 5 attempts

#### Test Webhook

1. Click **"Test"** button next to webhook URL
2. Send sample event to your endpoint
3. View response and logs
4. Confirm endpoint is accessible and responding correctly

### Webhook Request Format

When an event is triggered, the system sends:

```http
POST /webhooks/dispatch HTTP/1.1
Host: your-domain.com
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
X-DarthStar-Signature: sha256=HMAC_SIGNATURE
X-DarthStar-Event: booking.created
X-DarthStar-Request-ID: req_1234567890

{
  "event": "booking.created",
  "timestamp": "2024-01-15T14:32:00Z",
  "request_id": "req_1234567890",
  "data": {
    "booking": {
      "id": "bk_xyz789",
      "passenger": {
        "name": "John Doe",
        "phone": "555-0123",
        "email": "john@example.com"
      },
      "pickup": {
        "address": "123 Main St, City, ST 12345",
        "coordinates": {
          "latitude": 40.7128,
          "longitude": -74.0060
        }
      },
      "destination": {
        "address": "456 Oak Ave, City, ST 67890",
        "coordinates": {
          "latitude": 40.7580,
          "longitude": -73.9855
        }
      },
      "scheduled_time": "2024-01-15T15:00:00Z",
      "fare_estimate": 25.50,
      "priority": "NORMAL",
      "status": "PENDING",
      "created_at": "2024-01-15T14:32:00Z"
    }
  }
}
```

### Example Webhook Implementations

#### Example 1: Send to CRM (Booking Created)

**Destination**: Salesforce API
**Goal**: Sync booking data to customer record

```javascript
// Your webhook endpoint
app.post('/webhooks/dispatch', (req, res) => {
  const event = req.body;
  
  if (event.event === 'booking.created') {
    const booking = event.data.booking;
    
    // Create/update Salesforce contact
    salesforce.contacts.create({
      Name: booking.passenger.name,
      Phone: booking.passenger.phone,
      Email: booking.passenger.email,
      Related_Booking__c: booking.id,
      Booking_Date__c: booking.scheduled_time
    });
    
    res.json({ status: 'ok' });
  }
});
```

#### Example 2: Update Analytics (Journey Events)

**Destination**: Google Analytics/Mixpanel
**Goal**: Track user journey for analytics

```javascript
app.post('/webhooks/dispatch', (req, res) => {
  const event = req.body;
  
  if (event.event.startsWith('journey.')) {
    analytics.track('Booking Journey Event', {
      event_type: event.event,
      booking_id: event.data.booking_id,
      driver_id: event.data.driver_id,
      timestamp: event.timestamp
    });
    
    res.json({ status: 'ok' });
  }
});
```

#### Example 3: Send Notifications (Driver Events)

**Destination**: Your notification service
**Goal**: Notify driver management of online/offline status

```javascript
app.post('/webhooks/dispatch', (req, res) => {
  const event = req.body;
  
  if (event.event === 'driver.online') {
    notificationService.send({
      channel: 'driver-status',
      message: `Driver ${event.data.driver_id} is now online`,
      data: event.data
    });
  }
  
  res.json({ status: 'ok' });
});
```

### Webhook Dashboard

1. Navigate to **Admin → Integrations → Webhooks**
2. View all configured webhooks:

```
Webhook URL | Event | Status | Delivery Rate | Last Delivery
────────────────────────────────────────────────────────────────
https://crm.example.com/sync | booking.created | ✅ Active | 99.2% | 5m ago
https://analytics.example.com | journey.* | ✅ Active | 97.8% | 2m ago
https://notify.example.com | driver.online | ⚠️ Retrying | 85.1% | Error
https://backup.example.com | booking.* | ✅ Active | 100% | 12m ago
```

**Columns**:
- **Webhook URL**: Destination endpoint
- **Event**: Which event(s) trigger this webhook
- **Status**: Active, Retrying, Failed, or Disabled
- **Delivery Rate**: % of successful deliveries
- **Last Delivery**: When last event was sent

### Webhook Logs

1. Click webhook URL to view detailed logs
2. See all delivery attempts for this webhook
3. View request/response for each delivery

```
Delivery History:
┌─────────┬──────────────────────┬────────┬─────────────────┐
│ Status  │ Timestamp            │ Event  │ Response        │
├─────────┼──────────────────────┼────────┼─────────────────┤
│ ✅ 200  │ 2024-01-15 14:32:15  │ bk.cr  │ {status: ok}    │
│ ✅ 200  │ 2024-01-15 14:31:45  │ bk.cr  │ {status: ok}    │
│ ❌ 500  │ 2024-01-15 14:30:12  │ drv.on │ Error: timeout  │
│ ⏳ 2s   │ 2024-01-15 14:29:33  │ bk.cf  │ (retrying...)   │
│ ✅ 201  │ 2024-01-15 14:28:00  │ pay.rc │ {id: xyz}       │
└─────────┴──────────────────────┴────────┴─────────────────┘
```

## Automation System

### Available Automation Triggers (10 Total)

| Trigger | When Fires | Actions Available |
|---------|-----------|-------------------|
| **On Booking Created** | New booking submitted | Assign driver, Send SMS, Log event, Call webhook |
| **On Booking Confirmed** | Booking confirmed/paid | Send confirmation email, Update CRM, Notify driver |
| **On Driver Assigned** | Driver assigned to job | Send SMS to driver & passenger, Create calendar event |
| **On Driver Arrived (Pickup)** | Driver at pickup location | Send SMS to passenger, Update ETA |
| **On Driver Arrived (Destination)** | Driver at destination | Send completion SMS, Generate invoice, Log activity |
| **On Payment Received** | Payment processed | Thank you email, Invoice marked paid, Commission calculated |
| **On Payment Failed** | Payment declined/failed | Retry notification email, Flag for manual review, Alert staff |
| **On Driver Online** | Driver comes online | Broadcast availability, Update dispatch queue |
| **On Driver Offline** | Driver goes offline | Release active bookings, Reassign to other drivers |
| **On Invoice Due** | Invoice due date passed | Send payment reminder email, Escalate to collections |

### Automation Rules Configuration

#### Create New Automation Rule

1. Navigate to **Admin → Automations & Workflows → Automation Rules**
2. Click **"Create Rule"**
3. Configure:

```
Rule Name: Auto-assign URGENT bookings

Trigger: On Booking Created
Condition: priority == "URGENT" AND 
          status == "PENDING" AND
          fare > 15.00

Actions:
  1. Assign driver (type: "NEAREST_AVAILABLE")
  2. Send SMS to driver (template: "urgent_booking")
  3. Send SMS to passenger (template: "driver_assigned")
  4. Log automation event
```

#### Condition Builder

Build complex conditions:

```
IF (booking.priority == "URGENT")
  AND (booking.fare >= 15.00)
  AND (available_drivers > 0)
  AND (time_of_day >= "06:00" AND time_of_day <= "23:00")
THEN
  Assign nearest driver
  Send notifications
```

**Available Operators**:
- `==` (equals)
- `!=` (not equals)
- `>`, `<`, `>=`, `<=` (numeric comparison)
- `contains` (string contains)
- `in` (value in list)
- `AND`, `OR`, `NOT` (logical)

#### Actions

**Available Actions**:

| Action | Parameters | Example |
|--------|-----------|---------|
| **Assign Driver** | Strategy (nearest, random, load-balance) | Assign nearest available driver |
| **Send SMS** | Recipient, template | Send SMS to driver with booking details |
| **Send Email** | Recipient, template | Send confirmation email to passenger |
| **Send In-App** | Recipient, message | Send notification to driver app |
| **Create Task** | Task type, assignee | Create follow-up task for staff |
| **Log Event** | Category, description | Log automation trigger to audit trail |
| **Call Webhook** | URL, event data | POST event to external system |
| **Update Record** | Field, value | Set booking status to CONFIRMED |
| **Calculate Commission** | Method, rate | Calculate driver commission |
| **Generate Invoice** | Template, items | Create invoice from booking |
| **Delay Action** | Duration | Wait 5 minutes before sending email |

### Automation Rule Examples

#### Example 1: Auto-Assign High-Priority Bookings

```
Name: Urgent Booking Auto-Assignment
Enabled: ✅

Trigger: On Booking Created

Conditions:
  • booking.priority == "URGENT"
  • available_drivers.count > 0
  • current_hour between 7 and 22 (daytime only)

Actions:
  1. Assign Driver (strategy: "nearest")
  2. Send SMS (to: driver, template: "new_urgent_booking")
  3. Send SMS (to: passenger, template: "driver_assigned")
  4. Log Event (category: DISPATCH, desc: "Auto-assigned urgent booking")
```

#### Example 2: Payment Reminder Automation

```
Name: Invoice Payment Reminders
Enabled: ✅

Trigger: On Invoice Due

Conditions:
  • invoice.status == "UNPAID"
  • invoice.amount >= 25.00
  • days_overdue == 3

Actions:
  1. Send Email (to: customer, template: "payment_reminder_3days")
  2. Create Task (for: accounting_team, desc: "Follow up on overdue invoice")
  3. Log Event (category: INVOICE, desc: "Payment reminder sent")
```

#### Example 3: Driver Availability Broadcast

```
Name: Driver Online Notification
Enabled: ✅

Trigger: On Driver Online

Conditions:
  • driver.status == "AVAILABLE"
  • pending_bookings.count > 3

Actions:
  1. Send Push Notification (to: driver, message: "You have {{booking_count}} waiting bookings")
  2. Delay Action (duration: 30 seconds)
  3. Call Webhook (url: "https://dispatch.example.com/driver-online")
  4. Log Event (category: DRIVER, desc: "Driver online notification sent")
```

### Automation Dashboard

1. Navigate to **Admin → Automations & Workflows → Rules**
2. View all automation rules:

```
Rule Name | Trigger | Enabled | Executions | Success Rate | Last Run
─────────────────────────────────────────────────────────────────────
Auto-assign Urgent | booking.created | ✅ | 342 | 98.2% | 5m ago
Payment Reminders | invoice.due | ✅ | 45 | 100% | 2h ago
Driver Online BC | driver.online | ⚠️ | 128 | 94.5% | 12m ago (error)
```

**Details Available**:
- Edit rule (click rule name)
- View execution history
- View error logs
- Enable/disable rule
- Delete rule
- Test rule with sample data

### Automation Execution History

1. Click rule name to view detailed execution history
2. See each time automation ran:

```
Timestamp | Status | Trigger Event | Actions Executed | Duration | Notes
──────────────────────────────────────────────────────────────────────────
14:32:15 | ✅ OK | booking_123 | 4/4 actions | 245ms | All successful
14:31:45 | ✅ OK | booking_122 | 3/4 actions | 189ms | SMS failed, retrying
14:30:12 | ❌ FAIL | booking_121 | 1/4 actions | 1250ms | Webhook timeout
14:28:00 | ✅ OK | booking_120 | 4/4 actions | 312ms | All successful
```

## Message Templates

### Available Message Templates (8 Built-In)

#### 1. New Booking Notification (SMS to Passenger)
```
Hi {{passenger_name}}, your booking #{{booking_id}} has been created.
Pickup: {{pickup_location}}
Destination: {{destination}}
Scheduled time: {{scheduled_time}}
Estimated fare: ${{fare_estimate}}
```

#### 2. Driver Assigned Notification (SMS to Both)
```
Driver {{driver_name}} ({{driver_phone}}) is on the way.
Vehicle: {{vehicle_type}} {{vehicle_plate}}
ETA: {{eta}} minutes
Your booking: {{booking_id}}
```

#### 3. Pickup Arrival Notification (SMS to Passenger)
```
Your driver {{driver_name}} has arrived at {{pickup_location}}.
Please come downstairs. Booking: {{booking_id}}
```

#### 4. Destination Arrival (SMS to Passenger)
```
You've arrived at {{destination}}.
Trip ID: {{booking_id}}
Total fare: ${{actual_fare}}
Thank you for using DarthStar Dispatch!
```

#### 5. Payment Confirmation (Email)
```
Payment Confirmation

Dear {{customer_name}},

Your payment of ${{amount}} has been received.

Invoice: {{invoice_id}}
Date: {{payment_date}}
Method: {{payment_method}}

Thank you!
DarthStar Dispatch
```

#### 6. Payment Reminder (Email)
```
Payment Reminder

Dear {{customer_name}},

Invoice {{invoice_id}} is now {{days_overdue}} days overdue.
Amount due: ${{amount}}
Due date was: {{due_date}}

Please remit payment to avoid service interruption.

DarthStar Dispatch
```

#### 7. Driver Acceptance Confirmation (In-App)
```
Booking Confirmed
{{passenger_name}} → {{destination}}
Pickup: {{pickup_time}}
Your rating: {{driver_rating}} ⭐
```

#### 8. New Booking Alert (In-App to Dispatcher)
```
⚠️ {{priority}} Booking
{{passenger_name}} from {{pickup_location}}
Estimated fare: ${{fare_estimate}}
Waiting for assignment
```

### Create Custom Template

1. Navigate to **Admin → Automations & Workflows → Message Templates**
2. Click **"Create Template"**
3. Configure:

```
Template Name: urgent_booking
Channel: SMS
Recipients: Driver
Content:
---
⚠️ URGENT: New booking
{{passenger_name}} from {{pickup_location}}
To: {{destination}}
Fare: ${{fare_estimate}}
Reply to accept: Y/N
---

Variables Available:
- {{passenger_name}}
- {{passenger_phone}}
- {{pickup_location}}
- {{destination}}
- {{fare_estimate}}
- {{priority}}
- {{booking_id}}
- {{driver_name}}
- {{eta}}
```

### Template Variables

**Booking Variables**:
- `{{booking_id}}` - Booking ID
- `{{passenger_name}}` - Full name
- `{{passenger_phone}}` - Phone number
- `{{passenger_email}}` - Email address
- `{{pickup_location}}` - Pickup address
- `{{destination}}` - Destination address
- `{{pickup_time}}` - Scheduled pickup time
- `{{fare_estimate}}` - Fare estimate
- `{{actual_fare}}` - Final fare (after completion)
- `{{priority}}` - Priority level
- `{{special_notes}}` - Any special requests

**Driver Variables**:
- `{{driver_id}}` - Driver ID
- `{{driver_name}}` - Driver name
- `{{driver_phone}}` - Driver phone
- `{{vehicle_type}}` - Vehicle type (Sedan, SUV, etc.)
- `{{vehicle_plate}}` - License plate
- `{{driver_rating}}` - Driver average rating
- `{{eta}}` - Estimated arrival time

**Date/Time Variables**:
- `{{scheduled_time}}` - Booking scheduled time
- `{{current_time}}` - Current time
- `{{payment_date}}` - Date payment received
- `{{due_date}}` - Invoice due date
- `{{days_overdue}}` - Days overdue

## System Status & Monitoring

### View Webhook/Automation Status

1. Navigate to **Admin → System Health**
2. View status of all active webhooks and automations:

```
System Health Dashboard
────────────────────────────────────────────
Webhooks Status:
  • Total configured: 8
  • Active: 7
  • Errors (24h): 2
  • Delivery rate: 98.3%
  • Avg response time: 245ms

Automations Status:
  • Total rules: 12
  • Enabled: 11
  • Executions (24h): 2,456
  • Success rate: 99.1%
  • Failed rules: 1 (payment_reminder)

Recent Errors:
  ❌ 14:32 | webhook: crm.example.com | timeout
  ❌ 14:15 | rule: payment_reminder | queue size limit
```

### Performance Metrics

**Webhook Metrics**:
- Average delivery time: 245ms
- Failed deliveries: 2 in last 24h
- Retry rate: 1.2%
- Slowest endpoint: analytics.example.com (1250ms)
- Fastest endpoint: crm.example.com (89ms)

**Automation Metrics**:
- Rules executed: 2,456 in last 24h
- Success rate: 99.1%
- Avg execution time: 125ms
- Most frequent trigger: booking.created (1,234 times)
- Most used action: send_sms (1,892 times)

## API Reference

### Webhook API

**Trigger Event** (for manual testing):
```bash
POST /api/webhooks/test
Content-Type: application/json

{
  "webhook_id": "wh_123",
  "event": "booking.created",
  "data": { ... }
}
```

**List Webhooks**:
```bash
GET /api/webhooks
Headers: Authorization: Bearer YOUR_API_KEY

Response: [
  {
    "id": "wh_123",
    "url": "https://...",
    "event": "booking.created",
    "active": true,
    "delivery_rate": 0.992,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Automation API

**List Rules**:
```bash
GET /api/automations/rules
Headers: Authorization: Bearer YOUR_API_KEY

Response: [
  {
    "id": "rule_123",
    "name": "Auto-assign Urgent",
    "enabled": true,
    "executions_24h": 342,
    "success_rate": 0.982
  }
]
```

**Execute Rule** (manual trigger):
```bash
POST /api/automations/rules/{rule_id}/execute
Headers: Authorization: Bearer YOUR_API_KEY

{
  "trigger_data": {
    "booking_id": "bk_123"
  }
}
```

## Troubleshooting

### Issue: Webhooks Not Firing

**Cause**: Event triggers not occurring
- **Check**: Verify trigger event is enabled
- **Logs**: View webhook logs for delivery attempts
- **Test**: Click "Test" button to send sample event

**Cause**: Webhook URL unreachable
- **Check**: Verify URL is accessible from internet
- **Firewall**: Check if firewall blocking requests
- **HTTPS**: Ensure SSL certificate valid
- **Test**: Use `curl https://your-url.com` to verify

### Issue: Automations Not Executing

**Cause**: Rule conditions not matching
- **Check**: View automation execution history
- **Test**: Click "Test" to verify conditions with sample data
- **Debug**: Add logging to see condition evaluation

**Cause**: Rule disabled
- **Check**: Verify rule is enabled (toggle switch)
- **Fix**: Enable rule and re-test

### Issue: Message Templates Not Sending

**Cause**: Template variables not found
- **Check**: Verify all variables exist in template
- **Example**: `{{booking_id}}` vs `{{bookingId}}`
- **Case**: Variables are case-sensitive

**Cause**: SMS/Email service not configured
- **Check**: Verify SMS/Email provider credentials in Admin
- **Setup**: Configure Twilio (SMS) or SendGrid (Email)
- **Test**: Send test message from template

## Best Practices

1. **Start with essential events** - Begin with booking.created and booking.completed
2. **Monitor delivery rates** - Check webhook dashboard weekly
3. **Set up retries** - Critical events should retry (at least 3x)
4. **Test with sample data** - Use "Test" button before enabling rules
5. **Version your endpoints** - Include API version in webhook URL
6. **Log all receives** - Log every webhook received for debugging
7. **Implement idempotency** - Handle duplicate webhook deliveries
8. **Monitor error logs** - Set up alerts for repeated failures

## Related Documentation

- [DISPATCH_PAGE_GUIDE.md](DISPATCH_PAGE_GUIDE.md) - Dispatch system overview
- [LOGGING_AND_AUDIT_GUIDE.md](LOGGING_AND_AUDIT_GUIDE.md) - Activity logging
- [BACKEND_SETUP.md](BACKEND_SETUP.md) - Backend webhook implementation
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick access to all features

## FAQ

**Q: Are webhooks synchronous or asynchronous?**
A: Asynchronous. Webhooks are sent after the event completes. Response doesn't affect booking creation.

**Q: What's the maximum payload size?**
A: Currently 5MB per webhook. Contact support for larger payloads.

**Q: Can I filter webhook events by data?**
A: Not directly in UI, but you can implement filtering in your endpoint.

**Q: How long are webhook logs kept?**
A: 30 days by default. Export for long-term storage.

**Q: Can automations trigger other automations?**
A: Not in current version. Chaining is planned for v2.0.

**Q: What happens if both webhook and automation are configured?**
A: Both execute independently. Webhook sends HTTP request; automation executes internal action.

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Mock Implementation - Webhook/Automation definitions complete, execution engines pending backend implementation
