# Logging System Documentation

## Overview

A comprehensive logging system for tracking user actions, system events, API calls, and audit trails throughout the application. All logs are persisted to localStorage and accessible through filtering, statistics, and export capabilities.

## Components

### 1. Types (`types.ts`)

**LogEntry Interface:**
- `id`: Unique identifier (timestamp + random string)
- `timestamp`: ISO string of when event occurred
- `userId` / `userName`: Who performed the action
- `eventType`: CREATE | UPDATE | DELETE | VIEW | EXPORT | IMPORT | API_CALL | SYSTEM_EVENT | ERROR
- `category`: STAFF | DRIVER | COMMISSION | INVOICE | PERMISSION | SITE | BOOKING | PAYMENT | SYSTEM | AUTH | etc.
- `level`: info | warning | error | success
- `entityType` / `entityId` / `entityName`: What was affected
- `action`: Human-readable description
- `description`: Detailed information
- `changes`: Array of field changes (for UPDATE events)
- `endpoint` / `method` / `status`: For API calls
- `metadata`: Additional context

**LogFilter Interface:**
- Enables filtering by date range, user, event type, category, entity, or level

### 2. Logging Service (`lib/logging.ts`)

**Core Functions:**

#### Action Logging
```typescript
logAction(
  eventType: LogEventType,
  category: LogCategory,
  entityType: string,
  entityId: string,
  action: string,
  options?: { entityName?, description?, changes?, level?, metadata? }
): LogEntry
```

#### System Events
```typescript
logSystemEvent(
  eventType: LogEventType,
  category: LogCategory,
  action: string,
  options?: { endpoint?, method?, status?, errorMessage?, duration?, metadata? }
): LogEntry
```

#### Error Logging
```typescript
logError(
  category: LogCategory,
  error: Error | string,
  context?: { entityType?, entityId?, action?, metadata? }
): LogEntry
```

#### Query Functions
- `queryLogs(filter?: LogFilter): LogEntry[]` - Get filtered logs
- `getRecentLogs(limit: number = 50): LogEntry[]` - Last N entries
- `getEntityLogs(entityType, entityId): LogEntry[]` - Logs for specific entity
- `getUserLogs(userId, limit?): LogEntry[]` - Logs from specific user
- `getCategoryLogs(category, limit?): LogEntry[]` - Logs in category
- `getLogsByDateRange(startDate, endDate): LogEntry[]` - Date range query

#### Analytics & Export
- `getLogStatistics(filter?): { totalLogs, byEventType, byCategory, byLevel, byUser }`
- `exportLogs(filter?): string` - Export as JSON
- `exportLogsAsCSV(filter?): string` - Export as CSV
- `clearLogs()` - Admin function to clear all logs

### 3. Activity Log Viewer Component (`components/staff/ActivityLogViewer.tsx`)

**Features:**
- Real-time activity log display with pagination
- Filters:
  - Date range (start/end datetime)
  - Event types (CREATE, UPDATE, DELETE, etc.)
  - Categories (STAFF, DRIVER, COMMISSION, etc.)
  - Log levels (info, warning, error, success)
- Expandable log entries showing:
  - Detailed changes (old vs new values)
  - API information (endpoint, method, status, duration)
  - Error messages
  - Metadata/context
- Statistics panel showing:
  - Total logs, event type distribution, category breakdown, user activity
- Export capabilities:
  - Download as JSON or CSV
- Pagination with 20 items per page

## Integration Points

### Current Integrations

#### StaffEditModal (`components/staff/StaffEditModal.tsx`)
- Logs CREATE event when adding new staff member
- Logs UPDATE event when modifying staff, including:
  - Field-by-field change tracking
  - Site assignments
  - Permission template changes
- Tracks all field modifications

#### SchemeEditModal (`components/staff/SchemeEditModal.tsx`)
- Logs CREATE for new commission schemes
- Logs UPDATE for scheme modifications
- Tracks configuration changes across 3 stages

#### CompanyAdminPage (`views/staff/CompanyAdminPage.tsx`)
- Embedded ActivityLogViewer showing all system logs
- Accessible to administrators for audit purposes

## Usage Examples

### Log a User Action
```typescript
import { logAction } from '../../lib/logging';

logAction(
  'CREATE',
  'STAFF',
  'StaffMember',
  staffId,
  `Created new staff member: ${staffName}`,
  {
    entityName: staffName,
    description: `Email: ${email}, Title: ${title}`,
    level: 'success',
    metadata: { email, title, siteIds }
  }
);
```

### Log a System Event
```typescript
import { logSystemEvent } from '../../lib/logging';

logSystemEvent(
  'API_CALL',
  'SYSTEM',
  'User login successful',
  {
    endpoint: '/api/auth/login',
    method: 'POST',
    status: 200,
    duration: 245,
    level: 'success'
  }
);
```

### Query Logs
```typescript
import { queryLogs, getRecentLogs, getUserLogs } from '../../lib/logging';

// Get recent staff changes
const recentStaffLogs = queryLogs({
  category: 'STAFF',
  eventType: 'UPDATE',
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
});

// Get user's activity
const userActivity = getUserLogs(userId, 50);

// Get statistics
const stats = getLogStatistics({
  startDate: weekStart,
  endDate: weekEnd
});
```

## Storage

- **Backend**: localStorage with key `app_logs`
- **Max Capacity**: 10,000 most recent logs (auto-pruned)
- **Format**: JSON array of LogEntry objects
- **Persistence**: Survives browser refresh, persists across sessions

## 5. Permission-Based Access Control

The logging system includes comprehensive permission-based access to allow different staff roles to view and filter logs relevant to their responsibilities.

### Permission Structure

Audit log permissions are organized under the `AUDIT_LOGS` section in the permission system:

- **audit-logs-view**: Controls basic access to activity logs
  - `edit`: Full access to all logs
  - `view`: Limited access based on scoped permissions
  - `hidden`: No access

- **audit-logs-filter**: Controls ability to filter and search logs
  - `edit`: Can filter all logs
  - `view`: Can filter within allowed scope
  - `hidden`: Filter feature disabled

- **audit-logs-export**: Controls log export functionality
  - `edit`: Can export logs (JSON/CSV)
  - `hidden`: Export disabled (read-only)

- **audit-scoped-staff**: View staff changes and permission modifications
- **audit-scoped-financial**: View financial/commission/payment logs
- **audit-scoped-dispatch**: View booking and dispatch activity
- **audit-scoped-drivers**: View driver-related changes

### Role-Based Access Matrix

| Role | View Logs | Can Filter | Can Export | Can See |
|------|-----------|-----------|-----------|---------|
| Administrator | ✅ Full | ✅ All | ✅ All | All logs |
| Finance | ✅ View | ✅ Financial | ✅ Yes | Financial logs only |
| Accounts | ✅ View | ✅ Financial | ✅ Yes | Financial logs only |
| Dispatcher | ✅ View | ✅ Dispatch | ❌ No | Dispatch & driver activity |
| Read-Only | ✅ View | ✅ Limited | ❌ No | All logs (read-only) |
| Login Only | ❌ None | ❌ No | ❌ No | No access |

### Access Control Components

#### ProtectedActivityLogViewer (`components/staff/ProtectedActivityLogViewer.tsx`)

Wrapper component that:
- Checks if user has permission to view logs
- Shows "Access Denied" message if no permissions
- Displays access level description
- Passes filtered logs to ActivityLogViewer
- Disables export button if user lacks export permission

```typescript
<ProtectedActivityLogViewer 
  staff={currentUser}
  permissions={{
    auditLogsView: 'view',
    auditLogsFilter: 'view',
    auditLogsExport: 'hidden',
    auditScopedStaff: 'hidden',
    auditScopedFinancial: 'view',
    auditScopedDispatch: 'hidden',
    auditScopedDrivers: 'hidden'
  }}
  limit={100}
  showFilters={true}
  showStats={true}
/>
```

#### Audit Permissions Utility (`lib/auditPermissions.ts`)

Helper functions for permission checks:

```typescript
// Check basic access
hasAuditLogAccess(staff, permissionLevel): boolean

// Check specific capabilities
canFilterLogs(staff, permissionLevel): boolean
canExportLogs(staff, permissionLevel): boolean

// Filter logs based on user's role and scoped permissions
filterLogsForUser(logs, staff, permissions): LogEntry[]

// Get human-readable access description
getAuditAccessDescription(permissions): string
```

## 6. Dispute Resolution & Investigation Workflow

The logging system supports dispute resolution and change tracking for investigations:

### Use Case 1: Driver Commission Dispute
1. **Finance staff** views financial logs filtered for the specific driver
2. Searches commission scheme changes and payment adjustments
3. Exports logs as CSV for dispute documentation
4. Tracks exact changes with timestamps and responsible staff member

### Use Case 2: Driver Payment Correction
1. **Accounts staff** searches for payment transaction in logs
2. Views who made changes and exactly what was modified
3. Filters by date range to find when correction was applied
4. Generates audit trail for customer communication

### Use Case 3: Staff Member Investigation
1. **Administrator** views all staff-related log entries
2. Searches for suspicious activity or unauthorized changes
3. Tracks which staff member made changes and when
4. Exports full audit trail for compliance

### Use Case 4: Booking Dispute Tracking
1. **Dispatcher** views dispatch activity logs
2. Filters by booking ID or driver to track all changes
3. Views exact time and details of modifications
4. Provides evidence of what happened during disputed booking

## 7. Security Considerations

1. **Backend Integration**: Move logs to server-side database for:
   - Unlimited retention
   - Cross-device access
   - Better performance at scale

2. **Advanced Analytics**:
   - User activity heatmaps
   - Operation timing analysis
   - Error pattern detection

3. **Alerting**:
   - Real-time notifications for critical errors
   - Threshold-based alerts

4. **Audit Reports**:
   - Scheduled log reports
   - Compliance exports

5. **Log Retention Policies**:
   - Automatic archival by age
   - Category-specific retention periods

6. **Enhanced Scoped Access**:
   - Site-specific log filtering (for multi-site operations)
   - Department-specific access controls
   - Team-based log views

## Security & Compliance

### Permission Enforcement
- ✅ View permissions enforced at component level (ProtectedActivityLogViewer)
- ✅ Role-based log filtering prevents unauthorized data exposure
- ✅ Export controls restrict sensitive data downloads
- ✅ Access levels logged for security audit trails

### Data Protection
- Logs include user/entity IDs for traceability
- PII handled according to data retention policies
- localStorage encryption recommended for production
- Consider field-level PII masking for sensitive logs

### Storage & Performance
- localStorage used for quick access (10k max entries)
- Automatic pruning prevents quota exceeded errors
- Recommend server-side database for long-term retention

### Compliance Features
- Full audit trail for regulatory requirements
- Exportable logs for compliance reports
- Timestamped entries for legal proceedings
- User identification for accountability
