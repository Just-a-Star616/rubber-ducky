

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/staff/Sidebar';
import Header from '../../components/Header';
import HomePage from './HomePage';
import SchemesPage from './SchemesPage';
import DriversPage from './DriversPage';
import InvoicingPage from './InvoicingPage';
import AdminPage from './AdminPage';
import SettingsPage from './SettingsPage';
import PromotionsPage from './PromotionsPage';
import ProfilePage from './ProfilePage';
import VehiclesPage from './VehiclesPage';
import BookingsPage from './BookingsPage';
import CustomersPage from './CustomersPage';
import StaffManagementPage from './StaffManagementPage';
import CompanyAdminPage from './CompanyAdminPage';
import AccountsPage from './AccountsPage';
import AccountingSettingsPage from './AccountingSettingsPage';
import { ApiStatus } from '../../components/ApiStatusIndicator';
import { mockStaffList, mockStaffNotices, mockNotifications } from '../../lib/mockData';
import { StaffNotice, Notification } from '../../types';
import HistoricInvoicesPage from './HistoricInvoicesPage';
import AccountInvoicingPage from './AccountInvoicingPage';
import DriverAdminPage from './DriverAdminPage';
import PaymentsAdminPage from './PaymentsAdminPage';
import CommandPalette from '../../components/staff/CommandPalette';
import MessagingAdminPage from './MessagingAdminPage';
import AttributesAdminPage from './AttributesAdminPage';
import NotificationCenterPanel from '../../components/staff/NotificationCenterPanel';
import AutomationsAdminPage from './AutomationsAdminPage';
import ConnectorsPage from './ConnectorsPage';
import ApplicationsPage from './ApplicationsPage';
import AuditLogsPage from './AuditLogsPage';
import DispatchPage from './DispatchPage';

export type StaffPage = 'home' | 'dispatch' | 'schemes' | 'drivers/list' | 'drivers/applications' | 'drivers/promotions' | 'drivers/invoicing' | 'drivers/historic-invoices' | 'vehicles' | 'bookings/list' | 'bookings/customers' | 'accounts/list' | 'accounts/invoicing' | 'accounts/historic-invoices' | 'admin/company' | 'admin/staff' | 'admin/driver' | 'admin/payments' | 'admin/messaging' | 'admin/attributes' | 'admin/automations' | 'admin/connectors' | 'admin/system' | 'audit/logs' | 'settings/accounting' | 'profile';

interface StaffDashboardProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  handleLogout: () => void;
  themeName: string;
  setThemeName: (name: string) => void;
}

const PAGE_METADATA: Record<StaffPage, { title: string; description: string }> = {
    'home': { title: 'Home Dashboard', description: 'A high-level overview of your operations, key metrics, and recent activity.' },
    'dispatch': { title: 'Dispatch & Booking Management', description: 'Real-time dispatch, booking creation, driver assignment, and trip management.' },
    'schemes': { title: 'Commission Scheme Definitions', description: "Define charges for vehicle rent and insurance, and manage commission schemes." },
    'drivers/list': { title: 'Drivers', description: "A detailed list of all drivers with their current status, contact details, and scheme information." },
    'drivers/applications': { title: 'Driver Applications', description: "Review and manage new driver applications." },
    'drivers/promotions': { title: 'Promotions Management', description: "Manage reward schemes, promotions, and partner offers available to drivers." },
    'drivers/invoicing': { title: 'Driver Invoicing', description: "Upload data, filter, and process driver invoices." },
    'drivers/historic-invoices': { title: 'Historic Driver Invoices', description: "Review and manage previously generated driver invoices." },
    'vehicles': { title: 'Vehicles', description: "A detailed list of all vehicles with their current status and compliance information." },
    'bookings/list': { title: 'Bookings', description: "Look-up and modify journeys, and manage payment links." },
    'bookings/customers': { title: 'Customers', description: "Manage customer profiles, notes, priority, and status." },
    'accounts/list': { title: 'Business Accounts', description: "Manage business customer accounts, invoicing, and booking rules." },
    'accounts/invoicing': { title: 'Account Invoicing', description: "Upload data, filter, and process business account invoices." },
    'accounts/historic-invoices': { title: 'Historic Account Invoices', description: "Review and manage previously generated account invoices." },
    'admin/company': { title: 'Company Administration', description: "Manage company-wide details and site-specific information." },
    'admin/staff': { title: 'Staff Management', description: "Manage user accounts and access permissions for the staff portal." },
    'admin/driver': { title: 'Driver Administration', description: "Configure system-wide default settings and rules related to drivers." },
    'admin/payments': { title: 'Payment System Settings', description: "Manage default payment gateways, transaction fees, and withdrawal policies." },
    'admin/messaging': { title: 'Messaging Administration', description: "Create and manage automated message templates for customers, drivers, and accounts." },
    'admin/attributes': { title: 'Attributes, Extras & Tolls', description: "Centrally manage system-wide attributes and their properties." },
    'admin/automations': { title: 'Workflow Automations', description: "Create rules to automate tasks based on system events." },
    'admin/connectors': { title: 'Connectors', description: "Manage external system integrations, API endpoints, and webhooks." },
    'admin/system': { title: 'System Settings', description: "Global configuration options for the application." },
    'audit/logs': { title: 'Activity Audit Logs', description: "Search, filter, and investigate system activity logs and changes for compliance, dispute resolution, and auditing." },
    'settings/accounting': { title: 'Accounting Defaults', description: "Set the system-wide default accounting and invoicing settings. These can be overridden on a per-account basis." },
    'profile': { title: 'Profile & Settings', description: "Manage your personal information, office hours, and application appearance." },
};

const StaffDashboard: React.FC<StaffDashboardProps> = ({ isDarkMode, toggleDarkMode, handleLogout, themeName, setThemeName }) => {
  const [currentPage, setCurrentPage] = useState<StaffPage>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>('operational');
  const [staffNotices, setStaffNotices] = useState<StaffNotice[]>(mockStaffNotices);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);


  const unreadNoticesCount = useMemo(() => {
    return staffNotices.filter(n => !n.isRead).length;
  }, [staffNotices]);
  
  const unreadAlertsCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const handleViewProfile = () => {
    setCurrentPage('profile');
  };
  
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };


  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.8) {
        setApiStatus('operational');
      } else if (rand < 0.95) {
        setApiStatus('degraded');
      } else {
        setApiStatus('down');
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // When navigating away from profile, the page automatically closes
  // by not rendering the profile view anymore (handled by renderCurrentPage)

  const currentPageMetadata = useMemo(() => {
    return PAGE_METADATA[currentPage] || { title: 'Dashboard', description: '' };
  }, [currentPage]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'dispatch':
        return <DispatchPage />;
      case 'schemes':
        return <SchemesPage />;
      case 'drivers/list':
        return <DriversPage />;
      case 'drivers/applications':
        return <ApplicationsPage />;
      case 'drivers/promotions':
        return <PromotionsPage />;
      case 'drivers/invoicing':
        return <InvoicingPage />;
      case 'drivers/historic-invoices':
        return <HistoricInvoicesPage type="driver" />;
      case 'vehicles':
        return <VehiclesPage />;
      case 'bookings/list':
        return <BookingsPage />;
      case 'bookings/customers':
        return <CustomersPage />;
      case 'accounts/list':
        return <AccountsPage />;
      case 'accounts/invoicing':
        return <AccountInvoicingPage />;
      case 'accounts/historic-invoices':
        return <HistoricInvoicesPage type="account" />;
      case 'admin/company':
        return <CompanyAdminPage />;
      case 'admin/connectors':
        return <ConnectorsPage />;
      case 'admin/system':
        return <AdminPage />;
      case 'admin/staff':
        return <StaffManagementPage />;
      case 'admin/driver':
        return <DriverAdminPage />;
      case 'admin/payments':
        return <PaymentsAdminPage />;
      case 'admin/messaging':
        return <MessagingAdminPage />;
      case 'admin/attributes':
        return <AttributesAdminPage />;
      case 'admin/automations':
        return <AutomationsAdminPage />;
      case 'audit/logs':
        return <AuditLogsPage />;
      case 'settings/accounting':
        return <AccountingSettingsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
  <div className="h-screen flex overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div className="flex flex-col flex-1 w-0">
        <Header 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={handleLogout}
          apiStatus={apiStatus}
          staffMember={mockStaffList[0]}
          unreadNoticesCount={unreadNoticesCount}
          onProfileClick={handleViewProfile}
          onToggleCommandPalette={() => setIsCommandPaletteOpen(true)}
          unreadAlertsCount={unreadAlertsCount}
          onToggleNotificationCenter={() => setIsNotificationCenterOpen(prev => !prev)}
          pageTitle={currentPageMetadata.title}
          pageDescription={currentPageMetadata.description}
        />
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
            {renderCurrentPage()}
        </main>
      </div>
       <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
      <NotificationCenterPanel
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={markAllNotificationsAsRead}
      />
    </div>
  );
};

export default StaffDashboard;