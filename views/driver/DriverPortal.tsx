
import React, { useState, useEffect } from 'react';
import { HomeIcon, UserCircleIcon, LogoutIcon, SunIcon, MoonIcon, GiftIcon, QuestionMarkCircleIcon, TruckIcon } from '../../components/icons/Icon';
import DriverDashboard from './DriverDashboard';
import InvoicesHistory from './InvoicesHistory';
import DriverProfile from './DriverProfile';
import Rewards from './Rewards';
import FAQ from './FAQ';
import VehiclePage from './VehiclePage';
import { mockDrivers, mockVehicles } from '../../lib/mockData';
import { getBrandingConfig } from '../../lib/branding';
import { Driver, Vehicle, Invoice } from '../../types';
import InvoicePreviewModal from '../../components/driver/InvoicePreviewModal';
import WithdrawCreditModal from '../../components/driver/WithdrawCreditModal';

export type DriverPage = 'dashboard' | 'invoices' | 'rewards' | 'faq' | 'profile' | 'vehicle';

interface DriverPortalProps {
  driver: Driver;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  handleLogout: () => void;
  themeName: string;
  setThemeName: (name: string) => void;
}

const DriverPortal: React.FC<DriverPortalProps> = ({ driver: loggedInDriver, isDarkMode, toggleDarkMode, handleLogout, themeName, setThemeName }) => {
  const [currentPage, setCurrentPage] = useState<DriverPage>('dashboard');
  const [driver, setDriver] = useState<Driver>(loggedInDriver);
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  useEffect(() => {
    setDriver(loggedInDriver);
  }, [loggedInDriver]);

  // Dev-only helper: on small screens, detect any full-screen fixed overlays
  // that might be covering the UI (useful to debug the "black" profile on mobile).
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const isSmall = window.innerWidth <= 640; // mobile breakpoint
      if (!isSmall) return;

      const styleId = 'debug-overlay-outline-style';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `.debug-overlay-outline { outline: 3px solid rgba(255,0,0,0.85) !important; }`;
        document.head.appendChild(style);
      }

      const checkOverlays = () => {
        const els = Array.from(document.querySelectorAll('*')) as HTMLElement[];
        // Broaden the detection: include any fixed/sticky elements (regardless of z-index)
        const fixedEls = els.filter(el => {
          try {
            const cs = window.getComputedStyle(el);
            return cs && (cs.position === 'fixed' || cs.position === 'sticky');
          } catch (e) {
            return false;
          }
        });

        console.groupCollapsed('[debug] fixed/sticky elements (mobile)');
        fixedEls.forEach(el => {
          try {
            const cs = window.getComputedStyle(el);
            console.log('fixed element:', el.tagName, el.className, { top: cs.top, left: cs.left, right: cs.right, bottom: cs.bottom, zIndex: cs.zIndex, bg: cs.backgroundColor, display: cs.display, opacity: cs.opacity });
            // mark element with visible outline so developer can see it on the page
            el.classList.add('debug-overlay-outline');
          } catch (e) {}
        });

        // Also log which element is at the center of the viewport — useful to see what's covering the main content
        try {
          const cx = Math.floor(window.innerWidth / 2);
          const cy = Math.floor(window.innerHeight / 2);
          const centerEl = document.elementFromPoint(cx, cy) as HTMLElement | null;
          if (centerEl) {
            const cs = window.getComputedStyle(centerEl);
            console.log('[debug] elementAtCenter:', centerEl.tagName, centerEl.className, { zIndex: cs.zIndex, bg: cs.backgroundColor, display: cs.display, opacity: cs.opacity });
            centerEl.classList.add('debug-overlay-outline');
          } else {
            console.log('[debug] elementAtCenter: <none>');
          }
        } catch (e) {
          // ignore
        }

        console.groupEnd();
      };

      // run once and also on resize
      checkOverlays();
      window.addEventListener('resize', checkOverlays);
      return () => {
        window.removeEventListener('resize', checkOverlays);
        try {
          const els = Array.from(document.querySelectorAll('.debug-overlay-outline')) as HTMLElement[];
          els.forEach(el => el.classList.remove('debug-overlay-outline'));
        } catch (e) {}
      };
    } catch (e) {
      // swallow errors in production
    }
  }, []);

  const navItems = [
    { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
    { name: 'Rewards', page: 'rewards', icon: GiftIcon },
    { name: 'Profile', page: 'profile', icon: UserCircleIcon },
    { name: 'Vehicle', page: 'vehicle', icon: TruckIcon },
    { name: 'F.A.Q', page: 'faq', icon: QuestionMarkCircleIcon },
  ];

  const handleViewInvoice = (invoice: Invoice) => {
    setViewingInvoice(invoice);
  };

  const handleConfirmWithdrawal = (amount: number, accountId?: string) => {
      const bankAccount = driver.bankAccounts?.find(ba => ba.id === accountId);
      const accountInfo = bankAccount 
        ? ` from ${bankAccount.bankName} (${bankAccount.accountHolderName})` 
        : '';
      alert(`Withdrawal of £${amount.toFixed(2)} has been requested${accountInfo}.`);
      // In a real app, you'd update the driver's balance here after an API call
      setIsWithdrawModalOpen(false);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DriverDashboard driver={driver} onNavigate={setCurrentPage} onViewInvoice={handleViewInvoice} onOpenWithdrawModal={() => setIsWithdrawModalOpen(true)} />;
      case 'invoices':
        return <InvoicesHistory driver={driver} onViewInvoice={handleViewInvoice} />;
      case 'rewards':
        return <Rewards driver={driver} />;
      case 'faq':
        return <FAQ />;
      case 'profile':
        return <DriverProfile driver={driver} setDriver={setDriver} themeName={themeName} setThemeName={setThemeName} />;
      case 'vehicle':
        return <VehiclePage driver={driver} setDriver={setDriver} vehicles={vehicles} setVehicles={setVehicles} />;
      default:
        return <DriverDashboard driver={driver} onNavigate={setCurrentPage} onViewInvoice={handleViewInvoice} onOpenWithdrawModal={() => setIsWithdrawModalOpen(true)} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-card shadow-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <img className="h-10 w-10 rounded-full" src={driver.avatarUrl} alt={`${driver.firstName} ${driver.lastName}`} />
              <div>
                <h1 className="text-lg font-bold text-card-foreground">Welcome, {driver.firstName}</h1>
                <p className="text-xs text-card-foreground/70">Driver Portal</p>
              </div>
            </div>
             <div className="flex items-center gap-2">
                <button onClick={toggleDarkMode} className="p-2 rounded-full text-card-foreground/70 hover:bg-black/5 dark:hover:bg-white/10">
                    {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                </button>
                <button onClick={handleLogout} className="p-2 rounded-full text-card-foreground/70 hover:bg-black/5 dark:hover:bg-white/10">
                    <LogoutIcon className="h-5 w-5" />
                </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {renderContent()}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-20">
        <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 flex justify-around">
          {navItems.map(item => (
            <button
              key={item.page}
              onClick={() => setCurrentPage(item.page as DriverPage)}
              className={`flex flex-col items-center justify-center w-full pt-3 pb-2 text-xs font-medium transition-colors duration-200 ${
                currentPage === item.page
                  ? 'text-primary-600 dark:text-primary-400 border-t-2 border-primary-600 -mt-px'
                  : 'text-card-foreground/60 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </nav>

        <InvoicePreviewModal
          isOpen={!!viewingInvoice}
          invoice={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
        />
        <WithdrawCreditModal
            isOpen={isWithdrawModalOpen}
            onClose={() => setIsWithdrawModalOpen(false)}
            onConfirm={handleConfirmWithdrawal}
            withdrawableBalance={driver.currentBalance > 0 ? driver.currentBalance : 0}
            bankAccounts={driver.bankAccounts}
        />
    </div>
  );
};

export default DriverPortal;