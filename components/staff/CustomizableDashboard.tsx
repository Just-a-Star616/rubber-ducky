import React, { useState, useCallback, useMemo } from 'react';
import { DashboardLayout, DashboardWidget, DashboardWidgetType } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  PlusCircleIcon, 
  CogIcon, 
  TrashIcon,
  XIcon,
  PencilIcon,
  ChartBarIcon
} from '../icons/Icon';
import BookingsTrendChart from './charts/BookingsTrendChart';
import DriverStatusPieChart from './charts/DriverStatusPieChart';
import ActivityFeed from './ActivityFeed';
import { mockBookingTrendData, mockActivityFeed } from '../../lib/mockData';

interface CustomizableDashboardProps {
  layout: DashboardLayout;
  onLayoutChange: (layout: DashboardLayout) => void;
  isEditMode?: boolean;
  setEditMode?: (enabled: boolean) => void;
}

const StatCard = ({ title, value, change, icon: Icon }: { title: string; value: string; change: string; icon: React.ElementType }) => (
  <div className="bg-card text-card-foreground p-4 rounded-lg shadow-sm border border-border">
    <div className="flex justify-between items-start">
      <h3 className="text-sm font-medium text-foreground/70 truncate">{title}</h3>
      <Icon className="w-5 h-5 text-foreground/40" />
    </div>
    <div className="mt-2 flex items-baseline">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className={`ml-2 text-sm font-semibold ${change.startsWith('+') ? 'text-green-700 dark:text-green-500' : 'text-red-600 dark:text-red-400'}`}>
        {change}
      </p>
    </div>
  </div>
);

const DashboardWidgetComponent: React.FC<{
  widget: DashboardWidget;
  isEditMode: boolean;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onRemove: (id: string) => void;
}> = ({ widget, isEditMode, onToggleVisibility, onToggleLock, onRemove }) => {
  const renderWidget = () => {
    switch (widget.type) {
      case 'stat-card':
        return <StatCard title={widget.title} value="£8,132" change="+5.2%" icon={() => <div />} />;
      case 'bookings-trend':
        return <BookingsTrendChart data={mockBookingTrendData} />;
      case 'driver-status':
        return <DriverStatusPieChart />;
      case 'activity-feed':
        return <ActivityFeed events={mockActivityFeed.slice(0, 5)} />;
      case 'driver-metrics':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Driver Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Average Rating: 4.8/5 • On-time: 97%</CardContent>
          </Card>
        );
      case 'automation-breakdown':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Automation Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Manual: 35% • Automated: 65%</CardContent>
          </Card>
        );
      case 'call-staff-metrics':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Call Staff Performance</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Avg Handle Time: 3.2m • Quality Score: 92%</CardContent>
          </Card>
        );
      case 'payment-breakdown':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Payment Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Card: 65% • Cash: 20% • Invoice: 15%</CardContent>
          </Card>
        );
      case 'commission-breakdown':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Commission Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Scheme A: 45% • Scheme B: 35% • Other: 20%</CardContent>
          </Card>
        );
      case 'fleet-utilization':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Fleet Utilization</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Active: 82 • Idle: 18 • Availability: 94%</CardContent>
          </Card>
        );
      case 'account-dispatch-summary':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Dispatch Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Pending: 12 • In Progress: 45 • Completed: 287</CardContent>
          </Card>
        );
      default:
        return <Card><CardContent className="text-sm">Widget not yet implemented</CardContent></Card>;
    }
  };

  if (!widget.isVisible && !isEditMode) return null;

  return (
    <div 
      className={`relative group ${
        widget.width === 'full' ? 'col-span-full' : 
        widget.width === 'large' ? 'col-span-2' : 
        'col-span-1'
      } ${
        widget.height === 'large' ? 'row-span-2' : 'row-span-1'
      } ${
        !widget.isVisible ? 'opacity-40 border-2 border-dashed' : ''
      }`}
    >
      {isEditMode && (
        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card p-1 rounded-lg shadow-lg">
          <button
            onClick={() => onToggleLock(widget.id)}
            title={widget.isLocked ? 'Unlock' : 'Lock'}
            className="p-1.5 bg-muted rounded hover:bg-muted/80 text-xs font-medium"
          >
            {widget.isLocked ? '🔒' : '🔓'}
          </button>
          <button
            onClick={() => onRemove(widget.id)}
            title="Remove"
            className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
          >
            <TrashIcon className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}
      {renderWidget()}
    </div>
  );
};

const CustomizableDashboard: React.FC<CustomizableDashboardProps> = ({
  layout,
  onLayoutChange,
  isEditMode = false,
  setEditMode,
}) => {
  const handleToggleVisibility = useCallback((widgetId: string) => {
    const updatedWidgets = layout.widgets.map(w =>
      w.id === widgetId ? { ...w, isVisible: !w.isVisible } : w
    );
    onLayoutChange({ ...layout, widgets: updatedWidgets });
  }, [layout, onLayoutChange]);

  const handleToggleLock = useCallback((widgetId: string) => {
    const updatedWidgets = layout.widgets.map(w =>
      w.id === widgetId ? { ...w, isLocked: !w.isLocked } : w
    );
    onLayoutChange({ ...layout, widgets: updatedWidgets });
  }, [layout, onLayoutChange]);

  const handleRemove = useCallback((widgetId: string) => {
    const updatedWidgets = layout.widgets.filter(w => w.id !== widgetId);
    onLayoutChange({ ...layout, widgets: updatedWidgets });
  }, [layout, onLayoutChange]);

  const availableWidgets = useMemo(() => {
    const widgetIds = new Set(layout.widgets.map(w => w.id));
    const allWidgets: DashboardWidget[] = [
      { id: 'stat-gross', type: 'stat-card', title: 'Gross Bookings', isVisible: true, width: 'small' },
      { id: 'stat-commission', type: 'stat-card', title: 'Commission', isVisible: true, width: 'small' },
      { id: 'stat-jobs', type: 'stat-card', title: 'Total Jobs', isVisible: true, width: 'small' },
      { id: 'bookings', type: 'bookings-trend', title: 'Bookings Trend', isVisible: true, width: 'large' },
      { id: 'driver-status', type: 'driver-status', title: 'Driver Status', isVisible: true, width: 'medium' },
      { id: 'ai-insights', type: 'ai-insights', title: 'AI Insights', isVisible: true, width: 'medium' },
      { id: 'driver-metrics', type: 'driver-metrics', title: 'Driver Metrics', isVisible: true, width: 'medium' },
      { id: 'automation', type: 'automation-breakdown', title: 'Automation Breakdown', isVisible: true, width: 'medium' },
      { id: 'call-staff', type: 'call-staff-metrics', title: 'Call Staff Metrics', isVisible: true, width: 'medium' },
      { id: 'payments', type: 'payment-breakdown', title: 'Payment Breakdown', isVisible: true, width: 'medium' },
      { id: 'commission', type: 'commission-breakdown', title: 'Commission Breakdown', isVisible: true, width: 'medium' },
      { id: 'fleet', type: 'fleet-utilization', title: 'Fleet Utilization', isVisible: true, width: 'medium' },
      { id: 'dispatch', type: 'account-dispatch-summary', title: 'Dispatch Summary', isVisible: true, width: 'medium' },
    ];
    return allWidgets.filter(w => !widgetIds.has(w.id));
  }, [layout.widgets]);

  const handleAddWidget = useCallback((widget: DashboardWidget) => {
    onLayoutChange({
      ...layout,
      widgets: [...layout.widgets, { ...widget, id: `${widget.id}-${Date.now()}` }],
    });
  }, [layout, onLayoutChange]);

  return (
    <div className="space-y-6">
      {/* Edit Mode Header */}
      {isEditMode && (
        <Card className="border-primary/50">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold">Customize Dashboard</h3>
                <p className="text-sm text-muted-foreground">Add, remove, or manage widgets. Changes save automatically.</p>
              </div>
              <Button onClick={() => setEditMode?.(false)} variant="outline">Done Editing</Button>
            </div>
            
            {/* Add Widget Section */}
            {availableWidgets.length > 0 && (
              <div className="mt-4 p-3 bg-muted/20 rounded-lg">
                <p className="text-sm font-medium mb-2">Available Widgets ({availableWidgets.length})</p>
                <div className="flex flex-wrap gap-2">
                  {availableWidgets.map(widget => (
                    <Button
                      key={widget.id}
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddWidget(widget)}
                    >
                      <PlusCircleIcon className="w-4 h-4 mr-1" />
                      {widget.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
        {layout.widgets.map(widget => (
          <DashboardWidgetComponent
            key={widget.id}
            widget={widget}
            isEditMode={isEditMode}
            onToggleVisibility={handleToggleVisibility}
            onToggleLock={handleToggleLock}
            onRemove={handleRemove}
          />
        ))}
      </div>

      {/* Edit Button (when not in edit mode) */}
      {!isEditMode && (
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={() => setEditMode?.(true)}
            className="rounded-full h-14 w-14 shadow-lg"
            size="icon"
          >
            <CogIcon className="w-6 h-6" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomizableDashboard;
