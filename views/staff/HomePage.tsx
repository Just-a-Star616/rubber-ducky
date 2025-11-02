

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../types';
import CustomizableDashboard from '../../components/staff/CustomizableDashboard';
import { getUserDashboardLayout, saveUserDashboardLayout } from '../../lib/dashboardPresets';

const HomePage: React.FC = () => {
  const [layout, setLayout] = useState<DashboardLayout | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Load user's dashboard layout (default role is 'admin' for demo)
    const userLayout = getUserDashboardLayout('admin');
    setLayout(userLayout);
  }, []);

  const handleLayoutChange = (newLayout: DashboardLayout) => {
    setLayout(newLayout);
    saveUserDashboardLayout(newLayout);
  };

  if (!layout) {
    return <div className="p-4 sm:p-6 lg:p-8 text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <CustomizableDashboard
        layout={layout}
        onLayoutChange={handleLayoutChange}
        isEditMode={isEditMode}
        setEditMode={setIsEditMode}
      />
    </div>
  );
};

export default HomePage;
