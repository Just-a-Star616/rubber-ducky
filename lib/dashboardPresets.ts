import { DashboardPreset, StaffRole, DashboardLayout } from '../types';

export const DASHBOARD_PRESETS: Record<StaffRole, DashboardPreset> = {
  accounts: {
    role: 'accounts',
    name: 'Accounts Dashboard',
    description: 'Optimized for account management and customer information',
    widgets: [
      {
        id: 'stat-gross',
        type: 'stat-card',
        title: 'Gross Bookings',
        isVisible: true,
        width: 'small',
      },
      {
        id: 'stat-commission',
        type: 'stat-card',
        title: 'Commission',
        isVisible: true,
        width: 'small',
      },
      {
        id: 'stat-jobs',
        type: 'stat-card',
        title: 'Total Jobs',
        isVisible: true,
        width: 'small',
      },
      {
        id: 'top-accounts',
        type: 'top-accounts',
        title: 'Top Accounts',
        isVisible: true,
        width: 'large',
      },
      {
        id: 'payment-breakdown',
        type: 'payment-breakdown',
        title: 'Payment Breakdown',
        isVisible: true,
        width: 'medium',
      },
      {
        id: 'account-dispatch',
        type: 'account-dispatch-summary',
        title: 'Dispatch Summary',
        isVisible: true,
        width: 'medium',
      },
      {
        id: 'activity',
        type: 'activity-feed',
        title: 'Recent Activity',
        isVisible: true,
        width: 'medium',
      },
    ],
  },
  dispatch: {
    role: 'dispatch',
    name: 'Dispatch Dashboard',
    description: 'Real-time dispatch operations and driver status',
    widgets: [
      {
        id: 'stat-jobs',
        type: 'stat-card',
        title: 'Active Jobs',
        isVisible: true,
        width: 'small',
      },
      {
        id: 'stat-drivers',
        type: 'stat-card',
        title: 'Available Drivers',
        isVisible: true,
        width: 'small',
      },
      {
        id: 'stat-commission',
        type: 'stat-card',
        title: 'Today\'s Commission',
        isVisible: true,
        width: 'small',
      },
      {
        id: 'driver-status',
        type: 'driver-status',
        title: 'Driver Status',
        isVisible: true,
        width: 'large',
      },
      {
        id: 'account-dispatch',
        type: 'account-dispatch-summary',
        title: 'Dispatch Queue',
        isVisible: true,
        width: 'large',
      },
      {
        id: 'activity',
        type: 'activity-feed',
        title: 'Live Updates',
        isVisible: true,
        width: 'medium',
      },
    ],
  },
  management: {
    role: 'management',
    name: 'Management Dashboard',
    description: 'Comprehensive metrics and analytics for management',
    widgets: [
      {
        id: 'stat-gross',
        type: 'stat-card',
        title: 'Gross Bookings',
        isVisible: true,
        width: 'small',
      },
      {
        id: 'stat-commission',
        type: 'stat-card',
        title: 'Commission',
        isVisible: true,
        width: 'small',
      },
      {
        id: 'stat-jobs',
        type: 'stat-card',
        title: 'Total Jobs',
        isVisible: true,
        width: 'small',
      },
      {
        id: 'bookings-trend',
        type: 'bookings-trend',
        title: 'Bookings Trend',
        isVisible: true,
        width: 'full',
      },
      {
        id: 'automation',
        type: 'automation-breakdown',
        title: 'Automation Breakdown',
        isVisible: true,
        width: 'medium',
      },
      {
        id: 'commission-breakdown',
        type: 'commission-breakdown',
        title: 'Commission Breakdown',
        isVisible: true,
        width: 'medium',
      },
      {
        id: 'driver-status',
        type: 'driver-status',
        title: 'Driver Status',
        isVisible: true,
        width: 'medium',
      },
      {
        id: 'top-drivers',
        type: 'top-drivers',
        title: 'Top Drivers',
        isVisible: true,
        width: 'medium',
      },
      {
        id: 'ai-insights',
        type: 'ai-insights',
        title: 'AI-Powered Insights',
        isVisible: true,
        width: 'large',
      },
    ],
  },
  'driver-manager': {
    role: 'driver-manager',
    name: 'Fleet Manager Dashboard',
    description: 'Driver and fleet utilization metrics',
    widgets: [
      {
        id: 'stat-drivers',
        type: 'stat-card',
        title: 'Total Drivers',
        isVisible: true,
        width: 'small',
      },
      {
        id: 'stat-jobs',
        type: 'stat-card',
        title: 'Total Jobs',
        isVisible: true,
        width: 'small',
      },
      {
        id: 'stat-commission',
        type: 'stat-card',
        title: 'Commission',
        isVisible: true,
        width: 'small',
      },
      {
        id: 'driver-status',
        type: 'driver-status',
        title: 'Driver Status',
        isVisible: true,
        width: 'large',
      },
      {
        id: 'fleet-utilization',
        type: 'fleet-utilization',
        title: 'Fleet Utilization',
        isVisible: true,
        width: 'medium',
      },
      {
        id: 'driver-metrics',
        type: 'driver-metrics',
        title: 'Performance Metrics',
        isVisible: true,
        width: 'medium',
      },
      {
        id: 'top-drivers',
        type: 'top-drivers',
        title: 'Top Performers',
        isVisible: true,
        width: 'large',
      },
    ],
  },
  'call-staff': {
    role: 'call-staff',
    name: 'Call Center Dashboard',
    description: 'Call metrics and performance tracking',
    widgets: [
      {
        id: 'stat-calls',
        type: 'stat-card',
        title: 'Today\'s Calls',
        isVisible: true,
        width: 'small',
      },
      {
        id: 'stat-bookings',
        type: 'stat-card',
        title: 'Bookings Created',
        isVisible: true,
        width: 'small',
      },
      {
        id: 'stat-revenue',
        type: 'stat-card',
        title: 'Revenue',
        isVisible: true,
        width: 'small',
      },
      {
        id: 'call-staff-metrics',
        type: 'call-staff-metrics',
        title: 'Performance Metrics',
        isVisible: true,
        width: 'full',
      },
      {
        id: 'payment-breakdown',
        type: 'payment-breakdown',
        title: 'Payment Methods',
        isVisible: true,
        width: 'medium',
      },
      {
        id: 'top-accounts',
        type: 'top-accounts',
        title: 'Top Accounts',
        isVisible: true,
        width: 'medium',
      },
      {
        id: 'activity',
        type: 'activity-feed',
        title: 'Recent Bookings',
        isVisible: true,
        width: 'medium',
      },
    ],
  },
  admin: {
    role: 'admin',
    name: 'Admin Dashboard',
    description: 'Full system overview and management',
    widgets: [
      {
        id: 'stat-gross',
        type: 'stat-card',
        title: 'Gross Revenue',
        isVisible: true,
        width: 'small',
      },
      {
        id: 'stat-commission',
        type: 'stat-card',
        title: 'Total Commission',
        isVisible: true,
        width: 'small',
      },
      {
        id: 'stat-jobs',
        type: 'stat-card',
        title: 'Total Jobs',
        isVisible: true,
        width: 'small',
      },
      {
        id: 'bookings-trend',
        type: 'bookings-trend',
        title: 'Bookings Trend',
        isVisible: true,
        width: 'full',
      },
      {
        id: 'automation',
        type: 'automation-breakdown',
        title: 'Automation Breakdown',
        isVisible: true,
        width: 'medium',
      },
      {
        id: 'commission-breakdown',
        type: 'commission-breakdown',
        title: 'Commission Breakdown',
        isVisible: true,
        width: 'medium',
      },
      {
        id: 'fleet-utilization',
        type: 'fleet-utilization',
        title: 'Fleet Utilization',
        isVisible: true,
        width: 'medium',
      },
      {
        id: 'call-staff-metrics',
        type: 'call-staff-metrics',
        title: 'Call Metrics',
        isVisible: true,
        width: 'medium',
      },
      {
        id: 'driver-status',
        type: 'driver-status',
        title: 'Driver Status',
        isVisible: true,
        width: 'medium',
      },
      {
        id: 'ai-insights',
        type: 'ai-insights',
        title: 'AI Insights',
        isVisible: true,
        width: 'full',
      },
    ],
  },
};

export const createDefaultLayout = (role: StaffRole, userId?: string): DashboardLayout => {
  const preset = DASHBOARD_PRESETS[role];
  const now = new Date().toISOString();
  return {
    id: `layout-${role}-${userId || 'default'}`,
    userId,
    role,
    name: preset.name,
    description: preset.description,
    widgets: preset.widgets.map(w => ({ ...w })),
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  };
};

export const getUserDashboardLayout = (role: StaffRole, userId?: string): DashboardLayout => {
  // In a real app, this would fetch from localStorage or server
  const layoutKey = `dashboard-layout-${role}-${userId || 'default'}`;
  const stored = typeof window !== 'undefined' ? localStorage.getItem(layoutKey) : null;
  
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return createDefaultLayout(role, userId);
    }
  }
  
  return createDefaultLayout(role, userId);
};

export const saveUserDashboardLayout = (layout: DashboardLayout): void => {
  if (typeof window !== 'undefined') {
    const layoutKey = `dashboard-layout-${layout.role}-${layout.userId || 'default'}`;
    localStorage.setItem(layoutKey, JSON.stringify(layout));
  }
};
