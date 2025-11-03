# Logging and Audit Guide

This guide covers the activity logging and audit trail system for DarthStar Dispatch. The system automatically logs user actions, system events, and API interactions for compliance, debugging, and performance monitoring.

## Overview

### What Gets Logged?

The logging system captures **15 distinct properties** for each event:

- **timestamp**: When the event occurred (ISO 8601 format)
- **userId**: Which staff member performed the action
- **userName**: Display name of the staff member
- **action**: What happened (CREATE, UPDATE, DELETE, VIEW, EXPORT, IMPORT, API_CALL, etc.)
- **category**: What domain it affects (STAFF, DRIVER, COMMISSION, INVOICE, BOOKING, etc.)
- **resourceId**: Which record was affected (ID of staff, driver, booking, etc.)
- **resourceType**: Type of record (Staff, Driver, Commission Rule, Invoice, etc.)
- **changes**: What was modified (only for UPDATE/EDIT actions)
- **details**: Additional context and notes
- **status**: Success or failure of the action
- **ipAddress**: Where the action came from
- **userAgent**: Browser/client information
- **metadata**: Additional custom fields
- **duration**: How long the action took (for performance tracking)
- **error**: Error message if action failed

### Event Types (9 Total)

| Event Type | When Triggered | Example |
|-----------|----------------|---------|
| **CREATE** | New record created | Dispatcher creates booking |
| **UPDATE** | Record modified | Driver details edited |
| **DELETE** | Record removed | Booking cancelled |
| **VIEW** | Record accessed | Staff views invoice |
| **EXPORT** | Data exported | Export job history to CSV |
| **IMPORT** | Data imported | Import batch bookings |
| **API_CALL** | External API used | Call Google Maps API |
| **SYSTEM_EVENT** | Internal system action | Backup completed |
| **ERROR** | Something went wrong | Payment processing failed |

### Log Categories (15 Total)

| Category | What's Logged | Active? |
|----------|---------------|---------|
| **STAFF** | Staff account changes | ✅ Yes |
| **DRIVER** | Driver signups and edits | ✅ Yes |
| **COMMISSION** | Commission calculations | ✅ Yes |
| **INVOICE** | Invoice generation | 🔄 Partial |
| **BOOKING** | Booking lifecycle | 🔄 Partial |
| **PAYMENT** | Payment transactions | ❌ No |
| **AUTHENTICATION** | Login/logout/permissions | ❌ No |
| **CUSTOMER** | Customer account changes | ❌ No |
| **VEHICLE** | Vehicle management | ❌ No |
| **ROUTE** | Route planning | ❌ No |
| **DISPATCH** | Dispatch operations | ✅ Yes |
| **NOTIFICATION** | Message sending | ❌ No |
| **WEBHOOK** | Webhook triggers | ❌ No |
| **SYSTEM** | System maintenance | ❌ No |
| **SECURITY** | Permission changes | ❌ No |

## Accessing Activity Logs

### View Logs in Dispatch

1. Navigate to **Operations → Dispatch**
2. Click **LOGS** tab in the top navigation
3. View activity log for your zone/jobs

### View Full Audit Trail

1. Navigate to **Admin → Audit & Compliance → Activity Logs**
2. **ProtectedActivityLogViewer** will display based on your permissions
3. See only logs you have permission to view (role-based scoping)

### Activity Log Viewer Interface

```
┌──────────────────────────────────────────────────────────┐
│  Activity Log Viewer                                     │
├──────────────────────────────────────────────────────────┤
│  [Filter] [Search] [Export] [Refresh] [Statistics]       │
├──────────────────────────────────────────────────────────┤
│  Filters:                                                │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Date Range: [Start] - [End]                         │ │
│  │ User: [Dropdown with staff names]                   │ │
│  │ Action: [CREATE] [UPDATE] [DELETE] [VIEW] ...       │ │
│  │ Category: [STAFF] [DRIVER] [COMMISSION] ...         │ │
│  │ Status: [All] [Success] [Failed]                    │ │
│  │ Resource Type: [Staff] [Driver] [Booking] ...       │ │
│  └─────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│  Log Entries (showing 1-100 of 2,456):                  │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 2024-01-15 14:32  | John Smith    | UPDATE    | ... │ │
│  │ 2024-01-15 14:31  | Alice Jones   | CREATE    | ... │ │
│  │ 2024-01-15 14:29  | System        | API_CALL  | ... │ │
│  │ 2024-01-15 14:25  | Bob Williams  | ERROR     | ... │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Filtering & Searching Logs

### Filter Options

**Date Range**
- Select start and end dates
- Preset options: Today, Last 7 Days, Last 30 Days, Last 90 Days
- Custom range: Click "Custom" and set specific dates

**User**
- Dropdown with all staff members
- Select single user or multiple users
- Leave empty to see all users

**Action Type**
- Toggle filters: CREATE, UPDATE, DELETE, VIEW, EXPORT, IMPORT, API_CALL, SYSTEM_EVENT, ERROR
- Select multiple actions to filter by

**Category**
- Filter by domain: STAFF, DRIVER, COMMISSION, INVOICE, BOOKING, DISPATCH, etc.
- Useful for seeing all changes related to a specific feature

**Status**
- All: Show all entries
- Success: Only successful operations
- Failed: Only errors/failures (useful for debugging)

**Resource Type**
- View changes to specific record types: Staff, Driver, Booking, Invoice, etc.

### Search

- **Full-text search**: Type in search box to find logs containing keywords
- **Search fields**: Searches user name, resource ID, action type, resource type, details
- **Case-insensitive**: Search terms are case-insensitive
- **Partial matching**: Searches for partial matches (e.g., "job" finds "booking")

### Example Searches

```
Search "John" → Shows all logs by John (user) or affecting John's records
Search "commission" → Shows all commission-related log entries
Search "ERR" → Shows error entries and entries containing "error"
Search "2024-01-15" → Shows entries from that date
```

## Exporting Logs

### Export Data

1. **Apply filters** to narrow down logs you want to export
2. **Click "Export" button** in top toolbar
3. **Select format**:
   - **CSV** - Spreadsheet format (Excel, Google Sheets)
   - **PDF** - Professional report format
   - **JSON** - Technical/API format
   - **XLSX** - Excel format with formatting

### Exported Filename

Format: `activity-logs_[start-date]_[end-date]_[timestamp].csv`

Example: `activity-logs_2024-01-01_2024-01-31_20240201_143022.csv`

### CSV Export Columns

| Column | Content |
|--------|---------|
| Timestamp | ISO 8601 format |
| User | Staff member who performed action |
| Action | CREATE, UPDATE, DELETE, etc. |
| Category | STAFF, DRIVER, COMMISSION, etc. |
| Resource Type | Type of record affected |
| Resource ID | ID of affected record |
| Status | Success or Error |
| Changes | JSON of what was modified |
| Details | Text description |
| IP Address | Source IP |
| User Agent | Browser/client info |
| Duration (ms) | How long action took |

### Audit Report Generation

For compliance, generate audit reports:

1. Filter logs by criteria (date range, action type, users)
2. Click "Generate Report" (PDF only)
3. Includes:
   - Summary statistics
   - Activity timeline chart
   - User activity breakdown
   - Risk indicators (multiple failed attempts, off-hours access, etc.)
   - Certification footer for compliance

## Permission-Based Log Access

### Role-Based Visibility

Different roles can see different logs based on their permissions:

#### Administrator
- ✅ View all logs across entire system
- ✅ View logs for all users
- ✅ View logs for all categories
- ✅ Export all logs
- ✅ Filter by any criteria

#### Dispatcher
- ✅ View own logs
- ✅ View team logs (same zone)
- ✅ View dispatch/booking logs only
- ✅ View driver logs (assigned drivers only)
- ❌ View staff/admin logs
- ❌ View commission/invoice logs
- ✅ Export own filtered logs

#### Accounts Manager
- ✅ View own logs
- ✅ View staff logs
- ✅ View driver logs
- ✅ View customer logs
- ❌ View dispatch logs
- ❌ View payment logs
- ✅ Export staff/driver/customer logs

#### Finance Manager
- ✅ View own logs
- ✅ View commission logs
- ✅ View invoice logs
- ✅ View payment logs
- ✅ Export financial logs
- ❌ View staff personal logs
- ❌ View dispatch logs

#### Read-Only User
- ✅ View own logs only
- ✅ View filtered logs (assigned zone only)
- ❌ Export logs
- ❌ Filter by user (only own user)

### Scoped Access

Logs are scoped by permission settings:

- **audit-logs-view**: Can view logs (grants read access)
- **audit-logs-filter**: Can apply filters (grants search capability)
- **audit-logs-export**: Can export logs (grants download capability)
- **audit-scoped-staff**: Can view staff-related logs
- **audit-scoped-financial**: Can view financial logs
- **audit-scoped-dispatch**: Can view dispatch logs
- **audit-scoped-drivers**: Can view driver logs

## Log Storage & Retention

### Storage Limits

- **Max stored**: 10,000 entries per workspace
- **Current entries**: Shown in Statistics panel
- **Automatic pruning**: When limit reached, oldest entries deleted
- **Location**: Browser localStorage (survives page refresh, persists locally)

### Retention Policy

| Log Type | Retention Period |
|----------|-----------------|
| STAFF changes | 90 days |
| DRIVER changes | 90 days |
| COMMISSION calculations | 1 year |
| BOOKING events | 90 days |
| INVOICE events | 1 year |
| ERROR logs | 30 days |
| API calls | 7 days |
| System events | 30 days |
| Security/AUTH | 180 days |

**Note**: Current implementation stores in localStorage. For production, configure backend database with extended retention.

## Statistics & Analysis

### View Log Statistics

1. Click **"Statistics"** button in Activity Log Viewer
2. View dashboard with:

```
┌─────────────────────────────────────────┐
│  Activity Statistics                    │
├─────────────────────────────────────────┤
│  Total Entries: 2,456                   │
│  Date Range: Jan 1 - Jan 31, 2024       │
│                                         │
│  By Action Type:                        │
│  ├─ CREATE: 842 (34.3%)                 │
│  ├─ UPDATE: 1,204 (49.0%)               │
│  ├─ DELETE: 156 (6.3%)                  │
│  ├─ VIEW: 234 (9.5%)                    │
│  └─ ERROR: 20 (0.8%)                    │
│                                         │
│  By Category:                           │
│  ├─ STAFF: 445 (18.1%)                  │
│  ├─ DRIVER: 623 (25.4%)                 │
│  ├─ COMMISSION: 892 (36.3%)             │
│  └─ Other: 496 (20.2%)                  │
│                                         │
│  By User:                               │
│  ├─ John Smith: 634 (25.8%)             │
│  ├─ Alice Jones: 523 (21.3%)            │
│  ├─ Bob Williams: 456 (18.6%)           │
│  └─ Others: 843 (34.3%)                 │
│                                         │
│  Success Rate: 99.2%                    │
│  Failed Operations: 20                  │
│  Avg Duration: 245ms                    │
└─────────────────────────────────────────┘
```

### Key Metrics

- **Total Entries**: Count of all logged events
- **Date Range**: Span of visible logs
- **Action Distribution**: Breakdown by action type
- **Category Distribution**: Breakdown by system domain
- **User Distribution**: Who made the most changes
- **Success Rate**: % of successful vs failed operations
- **Avg Duration**: Average operation execution time

## Compliance & Audit Trails

### For Compliance Officers

The logging system supports compliance requirements:

1. **Create audit report**:
   - Filter by specific date range (quarter, year, etc.)
   - Select categories (all financial changes, all staff changes, etc.)
   - Export to PDF for archival

2. **Track user access**:
   - Filter by user to see all their actions
   - Review timestamps to verify work hours compliance
   - Export for access control audits

3. **Monitor sensitive operations**:
   - Filter by action type (DELETE, UPDATE on financial records)
   - Review who made changes and when
   - Identify unauthorized changes

4. **Generate compliance reports**:
   - Use "Generate Report" to create signed PDF
   - Includes summary statistics and timeline
   - Suitable for regulatory submission

### Example Compliance Checks

**Segregation of Duties**:
- Verify different users created vs approved records
- Filter by "CREATE" then "UPDATE" actions
- Export and analyze approval chain

**Change Control**:
- Filter by date range of maintenance window
- Review all system changes made
- Verify all changes approved before execution

**Access Control**:
- Filter by "VIEW" action for sensitive records
- Review who accessed what and when
- Identify inappropriate access patterns

## Troubleshooting

### Issue: Logs Not Appearing

**Cause**: Filters may be too restrictive
- **Solution**: Clear all filters (click "Reset Filters")
- **Check**: Ensure date range includes your target date
- **Verify**: Ensure action type is not filtering out your log

### Issue: Export Not Working

**Cause**: No logs match current filters
- **Solution**: Broaden filters (remove date restriction, clear user filter)
- **Browser**: Check browser console for errors (F12 → Console tab)
- **Permissions**: Verify you have "audit-logs-export" permission

### Issue: Logs Disappearing After Page Refresh

**Cause**: localStorage limit exceeded (max 10,000 entries)
- **Solution**: Export logs to external file for archival
- **Clear**: Click "Clear Old Entries" to prune old logs
- **Setup**: Configure backend database for persistent storage (see BACKEND_SETUP.md)

### Issue: Performance Slow with Many Logs

**Cause**: Browser handling 10,000+ log entries
- **Solution**: Filter to specific date range
- **Date**: Reduce to "Last 30 Days" or specific week
- **Export**: Export large ranges instead of viewing in UI

### Issue: Permission Denied When Viewing Logs

**Cause**: Your role lacks "audit-logs-view" permission
- **Solution**: Contact Administrator to grant permission
- **Check**: Go to Admin → Permissions to verify your role
- **Roles**: Ensure your role has the required permission node

## Best Practices

1. **Export regularly** - Download logs weekly to external storage for backup
2. **Monitor errors** - Filter by Status=Failed weekly to catch issues early
3. **Review staff actions** - Monitor staff changes for data quality
4. **Archive annually** - Export full year logs and archive to cold storage
5. **Automate reports** - Schedule weekly/monthly compliance reports
6. **Set alerts** - Enable email alerts for ERROR logs (setup in Admin)
7. **Retention policy** - Establish how long logs are kept for compliance

## Integration with Other Systems

### Dispatch Page Logs
- Every booking, driver assignment, and status change is logged
- View dispatch-specific logs via Dispatch tab
- Filter/export dispatch logs for operational analysis

### Commission System
- All commission calculations logged with formula used
- Track changes to commission rates and rules
- Export commission logs for accounting reconciliation

### Invoice System
- Invoice creation, modification, and payment logged
- Track payment receipt and processing
- Export invoices with audit trail

### Staff Administration
- Staff account creation, edits, and deletions logged
- Permission changes tracked
- Export staff change history for compliance

## Related Documentation

- [DISPATCH_PAGE_GUIDE.md](DISPATCH_PAGE_GUIDE.md) - Dispatch logging in action
- [COMMISSION_RULES_SYSTEM.md](COMMISSION_RULES_SYSTEM.md) - Commission audit trails
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - System architecture
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick access to all features

## FAQ

**Q: Can I delete logs?**
A: No, logs are immutable (cannot be deleted). Only automatic pruning occurs when storage limit is reached. For compliance, export and archive instead.

**Q: Are logs encrypted?**
A: Currently stored in localStorage (browser storage). For production, implement backend database with encryption. See BACKEND_SETUP.md.

**Q: Can I filter by IP address?**
A: Not in the UI filter, but IP is included in exported data. You can filter manually in exported CSV/Excel files.

**Q: How long does export take?**
A: <1 second for 1,000 entries, ~2-3 seconds for 10,000 entries.

**Q: Can I audit the auditor?**
A: Yes, "audit-logs-view" access itself is logged. Administrators viewing logs creates a log entry.

**Q: What if I need logs older than 90 days?**
A: Export logs regularly to external storage. Current system retains 90 days; older logs are pruned automatically.

**Q: Can I search across all dates at once?**
A: Not in current UI. Export logs via backend API to search across larger datasets.

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Active - STAFF, DRIVER, COMMISSION, DISPATCH categories actively logging
