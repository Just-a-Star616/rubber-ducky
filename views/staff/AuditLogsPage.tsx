import React, { useMemo } from 'react';
import { Card } from '../../components/ui/card';
import { mockStaffList, mockPermissionTemplates } from '../../lib/mockData';
import ProtectedActivityLogViewer from '../../components/staff/ProtectedActivityLogViewer';

const AuditLogsPage: React.FC = () => {
  // Get current user (in production, this would come from auth context)
  const currentStaff = mockStaffList[0]; // SM01 - Alex Johnson
  
  // Get user's permission template
  const userTemplate = useMemo(() => {
    if (currentStaff?.templateId) {
      return mockPermissionTemplates.find(t => t.id === currentStaff.templateId);
    }
    return mockPermissionTemplates.find(t => t.id === 't-admin');
  }, []);

  // Extract audit log permissions
  const auditPermissions = useMemo(() => ({
    auditLogsView: userTemplate?.permissions['audit-logs-view'] as string | undefined,
    auditLogsFilter: userTemplate?.permissions['audit-logs-filter'] as string | undefined,
    auditLogsExport: userTemplate?.permissions['audit-logs-export'] as string | undefined,
    auditLogsOwn: userTemplate?.permissions['audit-logs-own'] as string | undefined,
    auditScopedStaff: userTemplate?.permissions['audit-scoped-staff'] as string | undefined,
    auditScopedFinancial: userTemplate?.permissions['audit-scoped-financial'] as string | undefined,
    auditScopedDispatch: userTemplate?.permissions['audit-scoped-dispatch'] as string | undefined,
    auditScopedDrivers: userTemplate?.permissions['audit-scoped-drivers'] as string | undefined,
  }), [userTemplate]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Activity Audit Logs</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Search and filter system activity logs to investigate changes, resolve disputes, and maintain compliance records.
          </p>
        </div>
      </Card>

      <ProtectedActivityLogViewer 
        staff={currentStaff} 
        permissions={auditPermissions}
        limit={100} 
        showFilters={true} 
        showStats={true} 
      />
    </div>
  );
};

export default AuditLogsPage;
