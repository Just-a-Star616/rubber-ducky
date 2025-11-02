

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { mockDriverApplications, mockSiteDetails, mockDrivers } from '../../lib/mockData';
import { DriverApplication, ApplicationStatus, SiteDetails, ActiveFilter, FilterDefinition, SortConfig, Driver } from '../../types';
import FilterBar from '../../components/staff/FilterBar';
import { ChevronUpDownIcon } from '../../components/icons/Icon';
import ApplicationDetailModal from '../../components/staff/ApplicationDetailModal';

const statusStyles: { [key in ApplicationStatus]: string } = {
    Submitted: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'Under Review': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Contacted: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    'Meeting Scheduled': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    Approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const applicationFilterDefinitions: FilterDefinition[] = [
    { id: 'status', label: 'Status', type: 'select', options: Object.keys(statusStyles).map(s => ({label: s, value: s})) },
    { id: 'siteId', label: 'Site', type: 'select', options: mockSiteDetails.map(s => ({ label: s.name, value: s.id })) },
];

const ApplicationsPage: React.FC = () => {
    const [applications, setApplications] = useState<DriverApplication[]>(mockDriverApplications);
    const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<DriverApplication | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
    const [sortConfig, setSortConfig] = useState<SortConfig<DriverApplication>>({ key: 'applicationDate', direction: 'desc' });
    
    const siteMap = useMemo(() => new Map(mockSiteDetails.map(s => [s.id, s.name])), []);

    const handleOpenModal = (application: DriverApplication) => {
        setSelectedApplication(application);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedApplication(null);
    };

    const handleUpdateApplication = (updatedApp: DriverApplication) => {
        setApplications(prev => prev.map(app => app.id === updatedApp.id ? updatedApp : app));
    };

    const handleOnboard = (appDataToOnboard: Partial<Driver>) => {
        if (window.confirm(`Are you sure you want to onboard ${appDataToOnboard.firstName} ${appDataToOnboard.lastName}? This will create a new driver profile and remove this application.`)) {
            const newDriver: Driver = {
                // Default fields for a new driver not present in the form
                id: `D${Math.floor(1000 + Math.random() * 9000)}`,
                status: 'Active',
                vehicleRef: '',
                lastStatementBalance: 0,
                commissionTotal: 0,
                currentBalance: 0,
                canWithdrawCredit: false,
                earnedCreditSinceInvoice: 0,
                pendingChanges: {},
                availability: { isOnline: false, shift: 'On-Demand', lastSeen: new Date().toISOString() },
                performance: { completionRate: 0, averageRating: 0, totalJobs: 0, monthlyEarnings: 0 },
                preferences: { maxJobDistance: 10, preferredAreas: [], acceptsLongDistance: false, acceptsAirportJobs: false },
                complianceStatus: { dueForTraining: false, documentExpiries: [] },
                // Merge data from the form
                ...appDataToOnboard,
            } as Driver;

            setDrivers(prev => [newDriver, ...prev]);
            setApplications(prev => prev.filter(app => app.id !== appDataToOnboard.id));
            handleCloseModal();
            alert('Driver has been successfully onboarded!');
        }
    };
    
    const handleArchive = (appToArchive: DriverApplication) => {
        if (window.confirm('Are you sure you want to archive this application?')) {
            setApplications(prev => prev.filter(app => app.id !== appToArchive.id));
            // In a real app, you might set a status to 'Archived' instead of deleting
            handleCloseModal();
        }
    };

    const handleSort = (key: keyof DriverApplication) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };

    const filteredAndSortedApps = useMemo(() => {
        let filtered = [...applications];
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(app => `${app.firstName} ${app.lastName}`.toLowerCase().includes(lower) || app.email.toLowerCase().includes(lower));
        }
        activeFilters.forEach(filter => {
            filtered = filtered.filter(app => String(app[filter.id as keyof DriverApplication]) === filter.value);
        });
        filtered.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return filtered;
    }, [applications, searchTerm, activeFilters, sortConfig]);

    const SortableHeader: React.FC<{ sortKey: keyof DriverApplication, children: React.ReactNode }> = ({ sortKey, children }) => (
        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer" onClick={() => handleSort(sortKey)}>
            <div className="flex items-center">{children}<ChevronUpDownIcon className={`ml-1 h-4 w-4 ${sortConfig.key === sortKey ? 'text-foreground' : 'text-muted-foreground/50'}`} /></div>
        </th>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm -mt-4 sm:-mt-6 lg:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 border-b border-border">
                <FilterBar
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    filterDefinitions={applicationFilterDefinitions}
                    activeFilters={activeFilters}
                    onActiveFiltersChange={setActiveFilters}
                />
            </div>

            <Card className="overflow-hidden">
                <CardContent className="p-0 overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/50">
                            <tr>
                                <SortableHeader sortKey="firstName">Applicant</SortableHeader>
                                <SortableHeader sortKey="siteId">Site/Area</SortableHeader>
                                <SortableHeader sortKey="applicationDate">Application Date</SortableHeader>
                                <SortableHeader sortKey="status">Status</SortableHeader>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredAndSortedApps.map((app) => (
                                <tr key={app.id}>
                                    <td className="px-4 py-4 whitespace-nowrap"><div className="text-sm font-medium">{app.firstName} {app.lastName}</div><div className="text-xs text-muted-foreground">{app.email}</div></td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{siteMap.get(app.siteId)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{new Date(app.applicationDate).toLocaleDateString('en-GB')}</td>
                                    <td className="px-4 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[app.status]}`}>{app.status}</span></td>
                                    <td className="px-4 py-4 whitespace-nowrap"><Button variant="outline" size="sm" onClick={() => handleOpenModal(app)}>View Details</Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {isModalOpen && selectedApplication && (
                <ApplicationDetailModal
                    application={selectedApplication}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onUpdateApplication={handleUpdateApplication}
                    onOnboard={handleOnboard}
                    onArchive={handleArchive}
                />
            )}
        </div>
    );
};

export default ApplicationsPage;