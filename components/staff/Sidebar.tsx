import React, { useState, useEffect, useMemo } from 'react';
import { 
    HomeIcon, ChartBarIcon, UserGroupIcon, CogIcon, ShieldExclamationIcon, 
    StarIcon, UserCircleIcon, TruckIcon, CollectionIcon, BriefcaseIcon, 
    ClipboardListIcon, IdentificationIcon, SparklesIcon, ServerStackIcon, 
    CalendarIcon, CurrencyPoundIcon, ArchiveIcon, CreditCardIcon, ChatBubbleLeftEllipsisIcon, TagIcon, BoltIcon, UserPlusIcon
} from '../icons/Icon';
import { StaffPage } from '../../views/staff/StaffDashboard';
import { Logo } from '../icons/Logo';
import { getBrandingConfig } from '../../lib/branding';

// New navigation structure
type NavLink = {
    name: string;
    href: StaffPage;
    icon?: React.ElementType;
    children?: NavLink[];
};

type PrimaryNavItem = {
    id: string;
    name: string;
    icon: React.ElementType;
    href?: StaffPage;
    children?: NavLink[];
};

const navigationData: PrimaryNavItem[] = [
    { id: 'home', name: 'Home', href: 'home', icon: HomeIcon },
    {
        id: 'operations',
        name: 'Operations',
        icon: BriefcaseIcon,
        children: [
            { name: 'Drivers', href: 'drivers/list', icon: UserGroupIcon, children: [
                { name: 'Applications', href: 'drivers/applications' },
                { name: 'Promotions', href: 'drivers/promotions' }
            ]},
            { name: 'Vehicles', href: 'vehicles', icon: TruckIcon },
            { name: 'Bookings', href: 'bookings/list', icon: ClipboardListIcon, children: [
                { name: 'Customers', href: 'bookings/customers' }
            ]},
            { name: 'Accounts', href: 'accounts/list', icon: IdentificationIcon },
        ],
    },
    {
        id: 'finance',
        name: 'Finance',
        icon: CurrencyPoundIcon,
        children: [
            { name: 'Scheme Definitions', href: 'schemes', icon: ChartBarIcon },
            { name: 'Driver Invoicing', href: 'drivers/invoicing', icon: CurrencyPoundIcon, children: [
                { name: 'Historic', href: 'drivers/historic-invoices' }
            ]},
            { name: 'Account Invoicing', href: 'accounts/invoicing', icon: CurrencyPoundIcon, children: [
                { name: 'Historic', href: 'accounts/historic-invoices' }
            ]},
        ],
    },
    {
        id: 'admin',
        name: 'Admin',
        icon: ShieldExclamationIcon,
        children: [
            { name: 'Company', href: 'admin/company', icon: CollectionIcon },
            { name: 'Staff', href: 'admin/staff', icon: UserGroupIcon },
            { name: 'Driver', href: 'admin/driver', icon: UserCircleIcon },
            { name: 'Payments', href: 'admin/payments', icon: CreditCardIcon },
            { name: 'Messaging', href: 'admin/messaging', icon: ChatBubbleLeftEllipsisIcon },
            { name: 'Attributes & Extras', href: 'admin/attributes', icon: TagIcon },
            { name: 'Automations', href: 'admin/automations', icon: BoltIcon },
            { name: 'Accounting', href: 'settings/accounting', icon: CurrencyPoundIcon },
            { name: 'Connectors', href: 'admin/connectors', icon: ServerStackIcon },
            { name: 'System Settings', href: 'admin/system', icon: CogIcon },
        ],
    },
    {
        id: 'audit',
        name: 'Audit & Compliance',
        icon: ClipboardListIcon,
        children: [
            { name: 'Activity Logs', href: 'audit/logs', icon: ArchiveIcon },
        ],
    },
];

const userNavigationData: PrimaryNavItem[] = [
    { id: 'profile', name: 'Profile', href: 'profile', icon: UserCircleIcon },
];

const allPrimaryNavItems = [...navigationData, ...userNavigationData];

interface SidebarProps {
    currentPage: StaffPage;
    setCurrentPage: (page: StaffPage) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

// Helper to find the parent of a given page
const findParentId = (page: StaffPage): string => {
    for (const primaryItem of allPrimaryNavItems) {
        if (primaryItem.href === page) return primaryItem.id;
        if (primaryItem.children) {
            for (const child of primaryItem.children) {
                if (child.href === page) return primaryItem.id;
                if (child.children) {
                    for (const grandChild of child.children) {
                        if (grandChild.href === page) return primaryItem.id;
                    }
                }
            }
        }
    }
    return 'home'; // Default to home
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, setIsOpen }) => {
    const [activePrimaryNavId, setActivePrimaryNavId] = useState<string>(findParentId(currentPage));
    const [branding, setBranding] = useState(getBrandingConfig());

    useEffect(() => {
        setActivePrimaryNavId(findParentId(currentPage));
    }, [currentPage]);

    // Listen for branding changes
    useEffect(() => {
        const handleStorageChange = () => {
            setBranding(getBrandingConfig());
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const activePrimaryNavItem = useMemo(() => 
        allPrimaryNavItems.find(item => item.id === activePrimaryNavId),
    [activePrimaryNavId]);

    const handleNavigation = (page: StaffPage) => {
        setCurrentPage(page);
        if (window.innerWidth < 1024) {
            setIsOpen(false);
        }
    };
    
    const handlePrimaryNavClick = (item: PrimaryNavItem) => {
        setActivePrimaryNavId(item.id);
        if (item.href) {
            handleNavigation(item.href);
        }
    };

    const renderSecondaryLink = (link: NavLink, isSubItem: boolean = false) => {
        const isActive = currentPage === link.href || currentPage.startsWith(`${link.href}/`);
        const isParentActive = link.children?.some(c => c.href === currentPage);

        return (
            <div key={link.name}>
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleNavigation(link.href); }}
                    className={`group flex items-center w-full py-2 text-sm font-medium rounded-md
                    ${isSubItem ? 'pl-9 pr-2' : 'pl-3 pr-2'}
                    ${isActive || isParentActive
                        ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                        : 'text-sidebar-foreground/80 hover:bg-black/10 dark:hover:bg-white/5'
                    }`}
                >
                    {link.icon && !isSubItem && <link.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive || isParentActive ? 'text-primary-600 dark:text-primary-400' : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground/90'}`} />}
                    {link.name}
                </a>
                {link.children && (
                    <div className="mt-1 space-y-1">
                        {link.children.map(child => renderSecondaryLink(child, true))}
                    </div>
                )}
            </div>
        );
    };

    const SidebarContent = () => (
        <div className="flex h-full w-full overflow-hidden">
            {/* Primary Navigation Rail */}
            <div className="flex flex-col w-20 bg-sidebar-foreground/[.05] dark:bg-black/20 p-2 flex-shrink-0">
                <div className="flex-shrink-0 mb-4 pt-2 px-2">
                    {branding.companyLogoUrl ? (
                        <img 
                            src={branding.companyLogoUrl} 
                            alt={branding.companyLogoAlt}
                            className="h-8 w-auto object-contain"
                            title={branding.companyName}
                        />
                    ) : (
                        <Logo className="h-8 w-auto text-foreground" />
                    )}
                </div>
                <nav className="flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                        {navigationData.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handlePrimaryNavClick(item)}
                                className={`w-16 h-16 flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors
                                ${activePrimaryNavId === item.id 
                                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' 
                                    : 'text-sidebar-foreground/70 hover:bg-black/10 dark:hover:bg-white/5'
                                }`}
                                title={item.name}
                            >
                                <item.icon className="h-6 w-6" />
                                <span className="mt-1 truncate">{item.name}</span>
                            </button>
                        ))}
                    </div>
                    <div className="space-y-2">
                         {userNavigationData.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handlePrimaryNavClick(item)}
                                className={`w-16 h-16 flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors
                                ${activePrimaryNavId === item.id 
                                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' 
                                    : 'text-sidebar-foreground/70 hover:bg-black/10 dark:hover:bg-white/5'
                                }`}
                                title={item.name}
                            >
                                <item.icon className="h-6 w-6" />
                                <span className="mt-1">{item.name}</span>
                            </button>
                        ))}
                    </div>
                </nav>
            </div>

            {/* Secondary Navigation Panel */}
            <div className="flex flex-col flex-1 bg-sidebar text-sidebar-foreground border-r border-border pt-5 pb-4 overflow-hidden whitespace-nowrap">
                {activePrimaryNavItem?.children ? (
                    <>
                        <div className="px-3 mb-4">
                             <h2 className="text-xl font-bold">{activePrimaryNavItem.name}</h2>
                        </div>
                        <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
                            {activePrimaryNavItem.children.map(link => renderSecondaryLink(link))}
                        </nav>
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center px-3">
                        <h1 className="text-xl font-bold text-primary-500">Control Tower</h1>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile sidebar */}
            {isOpen && (
                <div className="lg:hidden fixed inset-0 flex z-40">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setIsOpen(false)}></div>
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-sidebar">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                             <button type="button" className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" onClick={() => setIsOpen(false)}>
                                <span className="sr-only">Close sidebar</span>
                                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <SidebarContent />
                    </div>
                    <div className="flex-shrink-0 w-14" aria-hidden="true"></div>
                </div>
            )}
            
            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className={`flex flex-col transition-all duration-300 ease-in-out ${activePrimaryNavItem?.children ? 'w-80' : 'w-20'}`}>
                    <SidebarContent />
                </div>
            </div>
        </>
    );
};

export default Sidebar;