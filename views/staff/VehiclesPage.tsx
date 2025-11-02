

import React, { useState, useMemo } from 'react';
import { mockVehicles, mockSiteDetails } from '../../lib/mockData';
import { Vehicle, FilterDefinition, ActiveFilter, SortConfig } from '../../types';
import VehicleEditModal from '../../components/staff/VehicleEditModal';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import VehicleInspectionModal from '../../components/staff/VehicleInspectionModal';
import VehicleMaintenanceModal from '../../components/staff/VehicleMaintenanceModal';
import FilterBar from '../../components/staff/FilterBar';
import { ChevronUpDownIcon } from '../../components/icons/Icon';

const statusStyles: { [key in Vehicle['status']]: string } = {
  Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Archived: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const vehicleFilterDefinitions: FilterDefinition[] = [
    { id: 'status', label: 'Status', type: 'select', options: [{label: 'Active', value: 'Active'}, {label: 'Inactive', value: 'Inactive'}, {label: 'Archived', value: 'Archived'}] },
    { id: 'siteId', label: 'Site', type: 'select', options: mockSiteDetails.map(s => ({ label: s.name, value: s.id })) },
    { id: 'ownershipType', label: 'Ownership', type: 'select', options: [{label: 'Company', value: 'Company'}, {label: 'Private', value: 'Private'}, {label: 'Supplier', value: 'Supplier'}] },
];

const getVehicleAge = (firstRegistrationDate: string): string => {
    const regDate = new Date(firstRegistrationDate);
    const month = (regDate.getMonth() + 1).toString().padStart(2, '0');
    const year = regDate.getFullYear().toString().slice(-2);
    return `${month}-${year}`;
};

const getNextVehicleExpiry = (vehicle: Vehicle): { name: string, date: string } => {
    const expiries = [
        { name: 'Plate', date: vehicle.plateExpiry },
        { name: 'Insurance', date: vehicle.insuranceExpiry },
        { name: 'MOT/Compliance', date: vehicle.motComplianceExpiry },
        { name: 'Road Tax', date: vehicle.roadTaxExpiry },
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

const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isNewVehicle, setIsNewVehicle] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig<Vehicle>>({ key: 'id', direction: 'asc' });

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsNewVehicle(false);
    setIsEditModalOpen(true);
  };
  
  const handleAddNewVehicle = () => {
      const newVehicle: Vehicle = {
        id: `V${Date.now()}`,
        status: 'Active',
        registration: '',
        make: '',
        model: '',
        color: '',
        firstRegistrationDate: new Date().toISOString().split('T')[0],
        plateType: 'Private Hire',
        plateIssuingCouncil: 'Transport for London',
        plateNumber: '',
        plateExpiry: '',
        insuranceCertificateNumber: '',
        insuranceExpiry: '',
        motComplianceExpiry: '',
        roadTaxExpiry: '',
        attributes: [],
        ownershipType: 'Company',
        linkedDriverIds: [],
        siteId: 'SITE01',
    };
    setSelectedVehicle(newVehicle);
    setIsNewVehicle(true);
    setIsEditModalOpen(true);
  }

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsInspectionModalOpen(false);
    setIsMaintenanceModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleSaveVehicle = (updatedVehicle: Vehicle) => {
    if (isNewVehicle) {
        setVehicles(prev => [updatedVehicle, ...prev]);
    } else {
        setVehicles(prev => prev.map(v => (v.id === selectedVehicle?.id ? updatedVehicle : v)));
    }
    handleCloseModals();
  };
  
  const handleToggleArchiveVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    if (vehicle.status === 'Archived') {
        if (window.confirm('Are you sure you want to restore this vehicle? Its status will be set to Inactive.')) {
            setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: 'Inactive' } : v));
            handleCloseModals();
        }
    } else {
        if (window.confirm('Are you sure you want to archive this vehicle?')) {
            setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: 'Archived' } : v));
            handleCloseModals();
        }
    }
  };

  const handleOpenInspectionModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsInspectionModalOpen(true);
  };

  const handleOpenMaintenanceModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsMaintenanceModalOpen(true);
  };
  
  const handleSort = (key: keyof Vehicle) => {
    setSortConfig(prev => ({
        key,
        direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedVehicles = useMemo(() => {
    let filtered = [...vehicles];

    // Search
    if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(v => 
            v.registration.toLowerCase().includes(lowercasedTerm) ||
            v.make.toLowerCase().includes(lowercasedTerm) ||
            v.model.toLowerCase().includes(lowercasedTerm) ||
            v.id.toLowerCase().includes(lowercasedTerm)
        );
    }

    // Filters
    activeFilters.forEach(filter => {
        filtered = filtered.filter(v => String(v[filter.id as keyof Vehicle]) === filter.value);
    });

    // Sorting
    filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return filtered;
  }, [vehicles, searchTerm, activeFilters, sortConfig]);

  const SortableHeader: React.FC<{ sortKey: keyof Vehicle; children: React.ReactNode; className?: string }> = ({ sortKey, children, className }) => (
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
                filterDefinitions={vehicleFilterDefinitions}
                activeFilters={activeFilters}
                onActiveFiltersChange={setActiveFilters}
             >
                <Button onClick={handleAddNewVehicle}>Add Vehicle</Button>
            </FilterBar>
        </div>
      
      <Card className="overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <SortableHeader sortKey="id">Ref & Status</SortableHeader>
                <SortableHeader sortKey="registration">Registration</SortableHeader>
                <SortableHeader sortKey="make">Make & Model</SortableHeader>
                <SortableHeader sortKey="plateNumber">Plate Number</SortableHeader>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Linked Driver(s)</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Next Expiry</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAndSortedVehicles.map((vehicle) => {
                const nextExpiry = getNextVehicleExpiry(vehicle);
                return (
                <tr key={vehicle.id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">{vehicle.id}</div>
                    <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[vehicle.status]}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    <div className="font-mono text-foreground text-base">{vehicle.registration}</div>
                    <div className="text-xs">{getVehicleAge(vehicle.firstRegistrationDate)} / {vehicle.color}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                    <div>{vehicle.make}</div>
                    <div className="text-muted-foreground">{vehicle.model}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{vehicle.plateNumber}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{vehicle.linkedDriverIds.join(', ')}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    <div>{nextExpiry.name}</div>
                    <div className="font-medium text-foreground">{nextExpiry.date}</div>
                  </td>
                   <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(vehicle)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenInspectionModal(vehicle)}>Inspection</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenMaintenanceModal(vehicle)}>Maintenance</Button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </CardContent>
      </Card>
      
      {isEditModalOpen && selectedVehicle && (
        <VehicleEditModal
            vehicle={selectedVehicle}
            isNew={isNewVehicle}
            isOpen={isEditModalOpen}
            onClose={handleCloseModals}
            onSave={handleSaveVehicle}
            onArchive={handleToggleArchiveVehicle}
        />
      )}

      {isInspectionModalOpen && selectedVehicle && (
        <VehicleInspectionModal
            vehicle={selectedVehicle}
            isOpen={isInspectionModalOpen}
            onClose={handleCloseModals}
            onSave={handleSaveVehicle}
        />
      )}

      {isMaintenanceModalOpen && selectedVehicle && (
        <VehicleMaintenanceModal
            vehicle={selectedVehicle}
            isOpen={isMaintenanceModalOpen}
            onClose={handleCloseModals}
            onSave={handleSaveVehicle}
        />
      )}
    </div>
  );
};

export default VehiclesPage;