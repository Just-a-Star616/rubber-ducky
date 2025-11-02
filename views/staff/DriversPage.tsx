

import React, { useState, useMemo } from 'react';
import { mockDrivers, mockCommissionSchemes, mockSiteDetails } from '../../lib/mockData';
import { Driver, SortConfig, FilterDefinition, ActiveFilter } from '../../types';
import DriverEditModal from '../../components/staff/DriverEditModal';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import FilterBar from '../../components/staff/FilterBar';
import { ChevronUpDownIcon } from '../../components/icons/Icon';

const statusStyles: { [key in Driver['status']]: string } = {
  Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Archived: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const schemeNameMap = new Map(mockCommissionSchemes.map(s => [s.id, s.name]));

const driverFilterDefinitions: FilterDefinition[] = [
    { id: 'status', label: 'Status', type: 'select', options: [{label: 'Active', value: 'Active'}, {label: 'Inactive', value: 'Inactive'}, {label: 'Archived', value: 'Archived'}] },
    { id: 'siteId', label: 'Site', type: 'select', options: mockSiteDetails.map(s => ({ label: s.name, value: s.id })) },
    { id: 'schemeCode', label: 'Scheme', type: 'select', options: mockCommissionSchemes.map(s => ({ label: `${s.name} (${s.id})`, value: s.id })) },
];

const getNextExpiry = (driver: Driver): { name: string, date: string } => {
    const expiries = [
        { name: 'Badge', date: driver.badgeExpiry },
        { name: 'Driving License', date: driver.drivingLicenseExpiry },
        { name: 'School Badge', date: driver.schoolBadgeExpiry },
    ].filter(d => d.date);

    if (expiries.length === 0) return { name: 'N/A', date: 'N/A' };

    const now = new Date();
    const futureExpiries = expiries
        .map(d => ({ ...d, dateObj: new Date(d.date!) }))
        .filter(d => d.dateObj > now)
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    
    if (futureExpiries.length === 0) {
        const pastExpiries = expiries
            .map(d => ({ ...d, dateObj: new Date(d.date!) }))
            .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
        return { name: pastExpiries[0].name, date: pastExpiries[0].dateObj.toISOString().split('T')[0] };
    }

    const nextToExpire = futureExpiries[0];
    return { name: nextToExpire.name, date: nextToExpire.dateObj.toISOString().split('T')[0] };
};

const DriversPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isNewDriver, setIsNewDriver] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig<Driver>>({ key: 'firstName', direction: 'asc' });

  const handleOpenEditModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsNewDriver(false);
    setIsModalOpen(true);
  };
  
  const handleAddNewDriver = () => {
    const newDriver: Driver = {
        id: `NEW_${Date.now()}`,
        status: 'Active',
        firstName: '',
        lastName: '',
        email: '',
        devicePhone: '',
        mobileNumber: '',
        address: '',
        niNumber: '',
        schemeCode: '1',
        gender: 'Other',
        badgeType: 'Private Hire',
        badgeIssuingCouncil: 'Transport for London',
        badgeNumber: '',
        badgeExpiry: '',
        drivingLicenseNumber: '',
        drivingLicenseExpiry: '',
        schoolBadgeNumber: null,
        schoolBadgeExpiry: null,
        dateOfBirth: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
        avatarUrl: `https://picsum.photos/seed/NEW_${Date.now()}/100/100`,
        vehicleRef: '',
        lastStatementBalance: 0,
        commissionTotal: 0,
        currentBalance: 0,
        canWithdrawCredit: false,
        earnedCreditSinceInvoice: 0,
        attributes: [],
        siteId: mockSiteDetails[0].id,
        availability: { isOnline: false, shift: 'On-Demand', lastSeen: new Date().toISOString() },
        performance: { completionRate: 0, averageRating: 0, totalJobs: 0, monthlyEarnings: 0 },
        preferences: { maxJobDistance: 10, preferredAreas: [], acceptsLongDistance: false, acceptsAirportJobs: false },
        complianceStatus: { dueForTraining: false, documentExpiries: [] },
    };
    setSelectedDriver(newDriver);
    setIsNewDriver(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDriver(null);
    setIsNewDriver(false);
  };

  const handleSaveDriver = (updatedDriver: Driver) => {
    if (isNewDriver) {
        setDrivers(prev => [{...updatedDriver, id: `D${Math.floor(100 + Math.random() * 900)}`}, ...prev]);
    } else {
        setDrivers(prev => prev.map(d => (d.id === selectedDriver?.id ? updatedDriver : d)));
    }
    handleCloseModal();
  };
  
  const handleToggleArchiveDriver = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    if (driver.status === 'Archived') {
        if (window.confirm('Are you sure you want to restore this driver? Their status will be set to Inactive.')) {
            setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: 'Inactive' } : d));
            handleCloseModal();
        }
    } else {
        if (window.confirm('Are you sure you want to archive this driver?')) {
            setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: 'Archived' } : d));
            handleCloseModal();
        }
    }
  };
  
  const handleSort = (key: keyof Driver) => {
      setSortConfig(prev => ({
          key,
          direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
      }));
  };

  const filteredAndSortedDrivers = useMemo(() => {
    let filtered = [...drivers];

    // Search
    if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(driver => 
            driver.firstName.toLowerCase().includes(lowercasedTerm) ||
            driver.lastName.toLowerCase().includes(lowercasedTerm) ||
            driver.id.toLowerCase().includes(lowercasedTerm) ||
            driver.email.toLowerCase().includes(lowercasedTerm)
        );
    }

    // Filters
    activeFilters.forEach(filter => {
        filtered = filtered.filter(driver => String(driver[filter.id as keyof Driver]) === filter.value);
    });

    // Sorting
    // FIX: Implemented a more robust sorting function to handle different data types and prevent comparison errors.
    filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return 0;
    });

    return filtered;
  }, [drivers, searchTerm, activeFilters, sortConfig]);
  
  const SortableHeader: React.FC<{ sortKey: keyof Driver; children: React.ReactNode; className?: string }> = ({ sortKey, children, className }) => (
    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer ${className}`} onClick={() => handleSort(sortKey)}>
        <div className="flex items-center">
            {children}
            <ChevronUpDownIcon className={`ml-1 h-4 w-4 ${sortConfig.key === sortKey ? 'text-foreground' : 'text-muted-foreground/50'}`} />
        </div>
    </th>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm -mt-4 sm:-mt-6 lg:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 border-b border-border">
         <FilterBar 
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            filterDefinitions={driverFilterDefinitions}
            activeFilters={activeFilters}
            onActiveFiltersChange={setActiveFilters}
         >
            <Button onClick={handleAddNewDriver}>Add Driver</Button>
         </FilterBar>
      </div>
      
      <Card className="overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <SortableHeader sortKey="firstName">Name</SortableHeader>
                <SortableHeader sortKey="status">Status</SortableHeader>
                <SortableHeader sortKey="lastStatementBalance">Balance</SortableHeader>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Contact</th>
                <SortableHeader sortKey="schemeCode">Scheme</SortableHeader>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Next Expiry</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAndSortedDrivers.map((driver) => {
                const nextExpiry = getNextExpiry(driver);
                return (
                <tr key={driver.id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-10 w-10 rounded-full" src={driver.avatarUrl} alt="" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-foreground">{driver.firstName} {driver.lastName}</div>
                        <div className="text-sm text-muted-foreground">{driver.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[driver.status]}`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${driver.lastStatementBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    £{driver.lastStatementBalance.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    <div>{driver.mobileNumber}</div>
                    <div className="text-xs">{driver.email}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    <div className="font-mono text-foreground">{driver.schemeCode}</div>
                    <div className="text-xs">{schemeNameMap.get(driver.schemeCode) || 'Unknown'}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    <div>{nextExpiry.name}</div>
                    <div className="font-medium text-foreground">{nextExpiry.date}</div>
                  </td>
                   <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(driver)}>Edit</Button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </CardContent>
      </Card>
      
      {isModalOpen && selectedDriver && (
        <DriverEditModal
            driver={selectedDriver}
            isNew={isNewDriver}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveDriver}
            onArchive={handleToggleArchiveDriver}
        />
      )}
    </div>
  );
};

export default DriversPage;