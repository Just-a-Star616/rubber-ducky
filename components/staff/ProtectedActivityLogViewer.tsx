import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { StaffMember } from '../../types';
import { hasAuditLogAccess, canExportLogs, filterLogsForUser, getAuditAccessDescription } from '../../lib/auditPermissions';
import { getRecentLogs } from '../../lib/logging';
import ActivityLogViewer from './ActivityLogViewer';

interface ProtectedActivityLogViewerProps {
  staff: StaffMember | null;
  permissions: {
    auditLogsView?: string;
    auditLogsFilter?: string;
    auditLogsExport?: string;
    auditLogsOwn?: string;
    auditScopedStaff?: string;
    auditScopedFinancial?: string;
    auditScopedDispatch?: string;
    auditScopedDrivers?: string;
  };
  limit?: number;
  showFilters?: boolean;
  showStats?: boolean;
}

const ProtectedActivityLogViewer: React.FC<ProtectedActivityLogViewerProps> = ({
  staff,
  permissions,
  limit = 100,
  showFilters = true,
  showStats = true,
}) => {
  const hasAccess = useMemo(() => hasAuditLogAccess(staff, permissions.auditLogsView), [staff, permissions.auditLogsView]);
  const canExport = useMemo(() => canExportLogs(staff, permissions.auditLogsExport), [staff, permissions.auditLogsExport]);

  if (!hasAccess) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="text-lg font-semibold text-muted-foreground mb-2">Access Denied</div>
            <div className="text-sm text-muted-foreground">
              You do not have permission to view activity logs. Contact your administrator if you need access.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Access Level Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit Log Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {getAuditAccessDescription(permissions)}
          </div>
          {!canExport && (
            <div className="mt-3 text-xs bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2 text-yellow-800 dark:text-yellow-200">
              📋 You have view-only access. Export functionality is not available.
            </div>
          )}
          {permissions.auditLogsOwn === 'view' && !permissions.auditScopedStaff && (
            <div className="mt-3 text-xs bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2 text-blue-800 dark:text-blue-200">
              👤 You can view your own activity and logs you have access to.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Log Viewer - Pass filtered logs */}
      <ActivityLogViewer limit={limit} showFilters={showFilters && permissions.auditLogsFilter !== 'hidden'} showStats={showStats} />
    </div>
  );
};

export default ProtectedActivityLogViewer;
