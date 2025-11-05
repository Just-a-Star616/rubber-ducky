import React, { useEffect, useState } from 'react';
import { MenuIcon, LogoutIcon, SunIcon, MoonIcon, SparklesIcon, BellIcon } from './icons/Icon';
import ApiStatusIndicator, { ApiStatus } from './ApiStatusIndicator';
import { StaffMember } from '../types';
import { getBrandingConfig } from '../lib/branding';

interface HeaderProps {
  onToggleSidebar: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  handleLogout: () => void;
  apiStatus: ApiStatus;
  staffMember: StaffMember;
  unreadNoticesCount: number;
  onProfileClick: () => void;
  onToggleCommandPalette: () => void;
  unreadAlertsCount: number;
  onToggleNotificationCenter: () => void;
  pageTitle?: string;
  pageDescription?: string;
  /** Optional short title to show on very small viewports */
  pageTitleShort?: string;
}

function useIsSmall() {
  const [isSmall, setIsSmall] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') return;
    const mq = window.matchMedia('(max-width: 640px)');
    const handler = (e: MediaQueryListEvent) => setIsSmall(e.matches);
    setIsSmall(mq.matches);
    // modern API
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, []);
  return isSmall;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isDarkMode, toggleDarkMode, handleLogout, apiStatus, staffMember, unreadNoticesCount, onProfileClick, onToggleCommandPalette, unreadAlertsCount, onToggleNotificationCenter, pageTitle, pageDescription, pageTitleShort }) => {
  const isSmall = useIsSmall();
  const displayTitle = (() => {
    if (!pageTitle) return undefined;
    if (!isSmall) return pageTitle;
    if (pageTitleShort) return pageTitleShort;
    // fallback abbreviation: keep up to ~20 chars, prefer trimming to last full word if possible
    const max = 20;
    if (pageTitle.length <= max) return pageTitle;
    const trimmed = pageTitle.slice(0, max - 1);
    const lastSpace = trimmed.lastIndexOf(' ');
    if (lastSpace > 8) return trimmed.slice(0, lastSpace) + '…';
    return trimmed.slice(0, max - 1) + '…';
  })();
  return (
  <header className="sticky top-0 z-10 flex flex-shrink-0 border-b border-border bg-card py-2 overflow-visible">
      <button
        type="button"
        className="border-r border-border px-4 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
        onClick={onToggleSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <MenuIcon className="h-6 w-6" />
      </button>
  <div className="flex flex-1 items-center justify-between px-4 sm:px-6 lg:px-8 pr-6 sm:pr-8">
        <div className="flex-1 min-w-0 pr-4">
          {pageTitle && <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{pageTitle}</h1>}
          {pageDescription && <p className="mt-1 text-sm text-muted-foreground truncate hidden sm:block">{pageDescription}</p>}
        </div>
        
  <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <button
            onClick={onToggleCommandPalette}
            className="flex items-center gap-2 p-2 rounded-lg text-foreground/70 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-primary-500"
            aria-label="Ask AI (Cmd+K)"
          >
            <SparklesIcon className="h-5 w-5" />
            <span className="text-sm hidden md:inline">Ask AI...</span>
            <kbd className="hidden md:inline-flex items-center px-2 py-1 text-xs font-sans font-medium text-foreground/60 bg-black/5 dark:bg-white/10 rounded border border-border">⌘K</kbd>
          </button>
          <div className="h-6 w-px bg-border hidden sm:block"></div>
          <ApiStatusIndicator status={apiStatus} />
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-foreground/70 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-primary-500"
            aria-label="Toggle light/dark mode"
          >
            {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
          </button>
          
          <button
            onClick={onToggleNotificationCenter}
            className="relative p-2 rounded-full text-foreground/70 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-primary-500"
            aria-label="Toggle notifications"
          >
            <BellIcon className="h-6 w-6" />
            {unreadAlertsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-600"></span>
                </span>
            )}
          </button>

          <button
            onClick={onProfileClick}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-primary-500"
          >
            <span className="text-sm font-medium text-card-foreground hidden sm:inline">{staffMember.name}</span>
            <div className="relative">
              <img
                className="h-8 w-8 rounded-full"
                src={staffMember.avatarUrl}
                alt={staffMember.name}
              />
              {unreadNoticesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-full text-foreground/70 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-primary-500"
            title="Logout"
            aria-label="Logout"
          >
            <LogoutIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;