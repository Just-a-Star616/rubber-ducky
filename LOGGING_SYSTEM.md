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

## Future Enhancements

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

## Security Considerations

- **Sensitive Data**: Currently logs include user/entity IDs. Consider:
  - Removing or hashing sensitive PII
  - Implementing access controls on log viewer
  - Encrypting stored logs

- **Storage Limits**: Monitor localStorage usage to avoid quota exceeded errors

- **Admin Access**: ActivityLogViewer should be restricted to authenticated admin users
