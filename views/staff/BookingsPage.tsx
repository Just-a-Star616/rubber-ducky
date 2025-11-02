

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { mockBookings, mockSiteDetails } from '../../lib/mockData';
import { Booking, CustomerAddress, FilterDefinition, ActiveFilter, SortConfig } from '../../types';
import { AccessibleIcon, ClockIcon, CreditCardIcon, GlobeAltIcon, PawPrintIcon, TruckIcon, UsersIcon, StarIcon, XIcon as XCircleIcon, CheckIcon, ChatBubbleLeftEllipsisIcon, ChevronUpDownIcon } from '../../components/icons/Icon';
import BookingEditModal from '../../components/staff/BookingEditModal';
import BookingCreateModal from '../../components/staff/BookingCreateModal';
import PaymentModal from '../../components/staff/PaymentModal';
import FilterBar from '../../components/staff/FilterBar';

const attributeIcons: { [key: string]: React.ElementType } = {
  'Wheelchair Accessible': AccessibleIcon,
  'Pet Friendly': PawPrintIcon,
  'Executive Saloon': TruckIcon,
  'MPV (6-seater)': UsersIcon,
  'Airport Specialist': GlobeAltIcon,
  'Contactless Payment': CreditCardIcon,
  'Child Seat Available': StarIcon,
};

const statusConfig: { [key in Booking['status']]: { color: string; icon: React.ElementType } } = {
  Upcoming: { color: 'text-blue-600 dark:text-blue-400', icon: ClockIcon },
  'In Progress': { color: 'text-yellow-600 dark:text-yellow-400', icon: ClockIcon },
  Completed: { color: 'text-green-600 dark:text-green-400', icon: CheckIcon },
  Cancelled: { color: 'text-red-600 dark:text-red-400', icon: XCircleIcon },
};

const bookingFilterDefinitions: FilterDefinition[] = [
    { id: 'status', label: 'Status', type: 'select', options: [{label: 'Upcoming', value: 'Upcoming'}, {label: 'In Progress', value: 'In Progress'}, {label: 'Completed', value: 'Completed'}, {label: 'Cancelled', value: 'Cancelled'}] },
    { id: 'siteId', label: 'Site', type: 'select', options: mockSiteDetails.map(s => ({ label: s.name, value: s.id })) },
    { id: 'paymentStatus', label: 'Payment Status', type: 'select', options: [{label: 'Pending', value: 'Pending'}, {label: 'Paid', value: 'Paid'}, {label: 'Failed', value: 'Failed'}, {label: 'Refunded', value: 'Refunded'}] },
];


interface BookingsTableProps {
  bookings: Booking[];
  customerAddressNotes?: CustomerAddress[];
  onEditBooking: (booking: Booking) => void;
  onOpenPaymentModal: (booking: Booking) => void;
  sortConfig: SortConfig<Booking>;
  onSort: (key: keyof Booking) => void;
}

export const BookingsTable: React.FC<BookingsTableProps> = ({ bookings, customerAddressNotes = [], onEditBooking, onOpenPaymentModal, sortConfig, onSort }) => {
    const addressNotesMap = new Map(customerAddressNotes.map(a => [a.fullAddress, a.notes]));
    const siteMap = new Map(mockSiteDetails.map(s => [s.id, s.name]));

    const SortableHeader: React.FC<{ sortKey: keyof Booking; children: React.ReactNode }> = ({ sortKey, children }) => (
        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer" onClick={() => onSort(sortKey)}>
            <div className="flex items-center">
                {children}
                <ChevronUpDownIcon className={`ml-1 h-4 w-4 ${sortConfig.key === sortKey ? 'text-foreground' : 'text-muted-foreground/50'}`} />
            </div>
        </th>
    );

    return (
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <SortableHeader sortKey="id">Ref</SortableHeader>
              <SortableHeader sortKey="pickupDateTime">Pickup</SortableHeader>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Journey</th>
              <SortableHeader sortKey="customerName">Customer</SortableHeader>
              <SortableHeader sortKey="price">Pricing</SortableHeader>
              <SortableHeader sortKey="status">Status</SortableHeader>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map((booking) => {
              const StatusIcon = statusConfig[booking.status].icon;
              const pickupNote = addressNotesMap.get(booking.pickupAddress);

              return (
                <tr key={booking.id}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {booking.id}
                    <p className="text-xs text-muted-foreground">{siteMap.get(booking.siteId)}</p>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(booking.pickupDateTime).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground max-w-xs">
                    <p><strong>From:</strong> {booking.pickupAddress}</p>
                    {booking.vias.length > 0 && <p className="text-xs text-muted-foreground">({booking.vias.length} via point(s))</p>}
                    <p><strong>To:</strong> {booking.destinationAddress}</p>
                    <div className="flex items-center space-x-2 mt-1">
                        {booking.attributes.map(attr => {
                          const Icon = attributeIcons[attr];
                          return Icon ? <span key={attr} title={attr}><Icon className="w-4 h-4 text-muted-foreground" /></span> : null;
                        })}
                        {pickupNote && (
                            <div title={`Note: ${pickupNote}`} className="text-amber-600 dark:text-amber-400">
                                <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <p className="font-medium text-foreground">{booking.customerName}</p>
                      <p className="text-muted-foreground">{booking.customerPhone}</p>
                      {booking.accountName && <p className="text-xs font-semibold text-primary/80">{booking.accountName}</p>}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <p><strong>Price:</strong> £{booking.price.toFixed(2)}</p>
                      <p className="text-muted-foreground"><strong>Cost:</strong> £{booking.cost.toFixed(2)}</p>
                  </td>
                   <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className={`flex items-center space-x-2 ${statusConfig[booking.status].color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="font-medium">{booking.status}</span>
                      </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onEditBooking(booking)}>Edit</Button>
                    <Button variant="secondary" size="sm" onClick={() => onOpenPaymentModal(booking)}>Payment</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
    )
}

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [bookingForPayment, setBookingForPayment] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig<Booking>>({ key: 'pickupDateTime', direction: 'desc' });

  const handleOpenEditModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };
  
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedBooking(null);
  };

  const handleSaveBooking = (updatedBooking: Booking) => {
    setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
    handleCloseEditModal();
  };
  
  const handleSaveNewBooking = (newBooking: Booking) => {
      setBookings(prev => [newBooking, ...prev]);
      setIsCreateModalOpen(false);
  };

  const handleOpenPaymentModal = (booking: Booking) => {
    setBookingForPayment(booking);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setBookingForPayment(null);
  };

  const handleUpdatePayment = (updatedBooking: Booking) => {
    setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
    handleClosePaymentModal();
  };

  const handleSort = (key: keyof Booking) => {
    setSortConfig(prev => ({
        key,
        direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedBookings = useMemo(() => {
    let filtered = [...bookings];
    
    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        filtered = filtered.filter(b => 
            b.id.toLowerCase().includes(lower) ||
            b.customerName.toLowerCase().includes(lower) ||
            b.pickupAddress.toLowerCase().includes(lower) ||
            b.destinationAddress.toLowerCase().includes(lower) ||
            b.accountName?.toLowerCase().includes(lower)
        );
    }
    
    activeFilters.forEach(filter => {
        filtered = filtered.filter(b => String(b[filter.id as keyof Booking]) === filter.value);
    });

    filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return filtered;
  }, [bookings, searchTerm, activeFilters, sortConfig]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm -mt-4 sm:-mt-6 lg:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 border-b border-border">
          <FilterBar 
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            filterDefinitions={bookingFilterDefinitions}
            activeFilters={activeFilters}
            onActiveFiltersChange={setActiveFilters}
          >
            <Button onClick={() => setIsCreateModalOpen(true)}>Add Booking</Button>
          </FilterBar>
      </div>
      
      <Card className="overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <BookingsTable 
              bookings={filteredAndSortedBookings} 
              onEditBooking={handleOpenEditModal} 
              onOpenPaymentModal={handleOpenPaymentModal}
              sortConfig={sortConfig}
              onSort={handleSort}
          />
        </CardContent>
      </Card>

      {isEditModalOpen && selectedBooking && (
        <BookingEditModal
          booking={selectedBooking}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveBooking}
        />
      )}
      
      {isCreateModalOpen && (
        <BookingCreateModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleSaveNewBooking}
        />
      )}

      {isPaymentModalOpen && bookingForPayment && (
        <PaymentModal
            booking={bookingForPayment}
            isOpen={isPaymentModalOpen}
            onClose={handleClosePaymentModal}
            onSave={handleUpdatePayment}
        />
      )}
    </div>
  );
};

export default BookingsPage;