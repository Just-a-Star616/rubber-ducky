import { StaffMember, LogEntry } from '../types';

/**
 * Check if a user has permission to view audit logs
 */
export function hasAuditLogAccess(staff: StaffMember | null, permissionLevel: string | undefined): boolean {
  return permissionLevel === 'edit' || permissionLevel === 'view';
}

/**
 * Check if user can filter and search logs
 */
export function canFilterLogs(staff: StaffMember | null, permissionLevel: string | undefined): boolean {
  return permissionLevel === 'edit' || permissionLevel === 'view';
}

/**
 * Check if user can export logs
 */
export function canExportLogs(staff: StaffMember | null, permissionLevel: string | undefined): boolean {
  return permissionLevel === 'edit';
}

/**
 * Check if user can view their own activity only
 */
export function canViewOwnActivityOnly(staff: StaffMember | null, permissionLevel: string | undefined): boolean {
  return permissionLevel === 'view' || (permissionLevel === 'hidden' && hasAuditLogAccess(staff, permissionLevel));
}

/**
 * Filter logs based on user permissions and scoped access
 */
export function filterLogsForUser(
  logs: LogEntry[],
  staff: StaffMember | null,
  permissions: {
    auditLogsView?: string;
    auditLogsFilter?: string;
    auditLogsExport?: string;
    auditLogsOwn?: string;
    auditScopedStaff?: string;
    auditScopedFinancial?: string;
    auditScopedDispatch?: string;
    auditScopedDrivers?: string;
  }
): LogEntry[] {
  if (!staff) return [];

  // Admin/Full access
  if (permissions.auditLogsView === 'edit') {
    return logs;
  }

  // No access
  if (!permissions.auditLogsView || permissions.auditLogsView === 'hidden') {
    return [];
  }

  // Own activity only
  if (permissions.auditLogsOwn === 'view' && !permissions.auditScopedStaff) {
    return logs.filter(log => log.userId === staff.id);
  }

  // Scoped access - filter by category based on permissions
  const filtered = logs.filter(log => {
    // Staff changes
    if (log.category === 'STAFF' || log.category === 'PERMISSION') {
      return permissions.auditScopedStaff === 'view';
    }
    // Financial logs
    if (log.category === 'INVOICE' || log.category === 'COMMISSION' || log.category === 'PAYMENT') {
      return permissions.auditScopedFinancial === 'view';
    }
    // Dispatch logs
    if (log.category === 'BOOKING' || log.category === 'AUTOMATION') {
      return permissions.auditScopedDispatch === 'view';
    }
    // Driver changes
    if (log.category === 'DRIVER') {
      return permissions.auditScopedDrivers === 'view';
    }
    // Allow SYSTEM logs if any permission is granted
    if (log.category === 'SYSTEM') {
      return Object.values(permissions).some(p => p === 'view' || p === 'edit');
    }
    return false;
  });

  return filtered;
}

/**
 * Get a user-friendly description of audit log access level
 */
export function getAuditAccessDescription(permissions: {
  auditLogsView?: string;
  auditScopedStaff?: string;
  auditScopedFinancial?: string;
  auditScopedDispatch?: string;
  auditScopedDrivers?: string;
}): string {
  if (!permissions.auditLogsView || permissions.auditLogsView === 'hidden') {
    return 'No audit log access';
  }

  if (permissions.auditLogsView === 'edit') {
    return 'Full access to all activity logs';
  }

  // View-only with scoped access
  const scopes = [];
  if (permissions.auditScopedStaff === 'view') scopes.push('Staff changes');
  if (permissions.auditScopedFinancial === 'view') scopes.push('Financial logs');
  if (permissions.auditScopedDispatch === 'view') scopes.push('Dispatch activity');
  if (permissions.auditScopedDrivers === 'view') scopes.push('Driver changes');

  if (scopes.length > 0) {
    return `View access to: ${scopes.join(', ')}`;
  }

  return 'View access to activity logs';
}
