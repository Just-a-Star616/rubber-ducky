

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { mockCustomers, mockBookings, mockCustomerAttributesList } from '../../lib/mockData';
import { Customer, CustomerAddress, Booking } from '../../types';
import { SparklesIcon, BanIcon, PencilIcon, PlusCircleIcon, CurrencyPoundIcon, UserCircleIcon, TrashIcon, TagIcon, MapPinIcon, ChatBubbleLeftEllipsisIcon, CheckIcon as CheckMarkIcon, ChevronDownIcon } from '../../components/icons/Icon';
import { BookingsTable } from './BookingsPage';
import CustomerEditModal from '../../components/staff/CustomerEditModal';
import BookingEditModal from '../../components/staff/BookingEditModal';
import PaymentModal from '../../components/staff/PaymentModal';
import MessageComposerModal from '../../components/staff/MessageComposerModal';
import FilterBar from '../../components/staff/FilterBar';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';

const priorityConfig: { [key in Customer['priorityLevel']]: { color: string; icon: React.ElementType } } = {
  Normal: { color: 'text-muted-foreground', icon: UserCircleIcon },
  High: { color: 'text-blue-600 dark:text-blue-200', icon: SparklesIcon },
  VIP: { color: 'text-amber-600 dark:text-amber-300', icon: SparklesIcon },
};

const CustomerDetail: React.FC<{ customer: Customer; onUpdateCustomer: (updatedCustomer: Customer) => void; onEditCustomer: () => void; onEditBooking: (booking: Booking) => void; onOpenPaymentModal: (booking: Booking) => void; onOpenMessageComposer: () => void; }> = ({ customer, onUpdateCustomer, onEditCustomer, onEditBooking, onOpenPaymentModal, onOpenMessageComposer }) => {
  const PriorityIcon = priorityConfig[customer.priorityLevel].icon;
  const [isEditingAttributes, setIsEditingAttributes] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressNote, setAddressNote] = useState('');
  const [tempAttributes, setTempAttributes] = useState<string[]>([]);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  
  const bookingsForCustomer = mockBookings.filter(b => b.customerId === customer.id);
  
  const handleEditAttributes = () => {
    setTempAttributes([...customer.attributes]);
    setIsEditingAttributes(true);
  };
  
  const handleAttributeToggle = (attr: string) => {
    setTempAttributes(prev => prev.includes(attr) ? prev.filter(a => a !== attr) : [...prev, attr]);
  };

  const handleSaveAttributes = () => {
    onUpdateCustomer({ ...customer, attributes: tempAttributes });
    setIsEditingAttributes(false);
  };
  
  const handleEditAddressNote = (address: CustomerAddress) => {
    setEditingAddressId(address.id);
    setAddressNote(address.notes || '');
  };
  
  const handleSaveAddressNote = () => {
    if (!editingAddressId) return;
    const updatedAddresses = customer.addresses.map(addr =>
        addr.id === editingAddressId ? { ...addr, notes: addressNote } : addr
    );
    onUpdateCustomer({ ...customer, addresses: updatedAddresses });
    setEditingAddressId(null);
    setAddressNote('');
  };
  
  const handleRemoveAddress = (addressId: string) => {
    if (window.confirm('Are you sure you want to remove this address?')) {
        const updatedAddresses = customer.addresses.filter(addr => addr.id !== addressId);
        onUpdateCustomer({ ...customer, addresses: updatedAddresses });
    }
  };

  const handleSaveNote = () => {
    if (!newNoteText.trim()) return;
    const newNote = {
        date: new Date().toISOString(),
        author: 'Alex Johnson', // mock current user
        text: newNoteText,
    };
    const updatedCustomer = {
        ...customer,
        notes: [newNote, ...customer.notes],
    };
    onUpdateCustomer(updatedCustomer);
    setIsAddingNote(false);
    setNewNoteText('');
  };

  const visibleAddresses = showAllAddresses ? customer.addresses : customer.addresses.slice(0, 3);
  const visibleNotes = showAllNotes ? customer.notes : customer.notes.slice(0, 2);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
              <div>
                  <CardTitle className="flex items-center space-x-2">
                      <span>{customer.name}</span>
                      {customer.isBanned && <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-destructive text-destructive-foreground">Banned</span>}
                  </CardTitle>
                  <CardDescription>{customer.email} &bull; {customer.phone}</CardDescription>
              </div>
               <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 p-2 rounded-lg bg-muted ${priorityConfig[customer.priorityLevel].color}`}>
                      <PriorityIcon className="w-4 h-4"/>
                      <span className="text-xs font-semibold">{customer.priorityLevel}</span>
                  </div>
                  <Button onClick={onOpenMessageComposer} variant="outline"><ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-2"/> Message</Button>
                  <Button onClick={onEditCustomer}><PencilIcon className="w-4 h-4 mr-2"/> Edit Customer</Button>
               </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">Total Spend</p><p className="text-lg font-bold">£{customer.totalSpend.toFixed(2)}</p></div>
              <div className="p-3 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">Account Credit</p><p className="text-lg font-bold">£{customer.accountCredit.toFixed(2)}</p></div>
              <div className="p-3 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">Loyalty Points</p><p className="text-lg font-bold">{customer.loyaltyPoints.toLocaleString()}</p></div>
              <div className="p-3 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">Member Since</p><p className="text-lg font-bold">{new Date(customer.joinDate).toLocaleDateString('en-GB')}</p></div>
          </div>

          <div className="space-y-4">
            {/* Attributes */}
            <div>
              <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold flex items-center"><TagIcon className="w-4 h-4 mr-2 text-muted-foreground"/> Attributes</h4>
                  {isEditingAttributes ? (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingAttributes(false)}>Cancel</Button>
                      <Button size="sm" onClick={handleSaveAttributes}><CheckMarkIcon className="w-4 h-4 mr-1"/> Save</Button>
                    </div>
                  ) : <Button variant="ghost" size="sm" onClick={handleEditAttributes}><PencilIcon className="w-4 h-4 mr-1"/> Manage</Button>}
              </div>
              {isEditingAttributes ? (
                 <div className="p-3 rounded-lg bg-muted grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {mockCustomerAttributesList.map(attr => (
                      <label key={attr} className="flex items-center space-x-2 text-sm p-1 rounded hover:bg-background">
                          <input type="checkbox" checked={tempAttributes.includes(attr)} onChange={() => handleAttributeToggle(attr)} className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"/>
                          <span>{attr}</span>
                      </label>
                    ))}
                 </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                    {customer.attributes.length > 0 ? customer.attributes.map(attr => (
                      <div key={attr} className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">{attr}</div>
                    )) : <p className="text-sm text-muted-foreground italic">No attributes assigned.</p>}
                </div>
              )}
            </div>

             {/* Addresses */}
            <div>
                <h4 className="font-semibold mb-2 flex items-center"><MapPinIcon className="w-4 h-4 mr-2 text-muted-foreground"/> Addresses & Notes</h4>
                <div className="space-y-2">
                    {visibleAddresses.map(address => (
                        <div key={address.id} className="p-3 rounded-lg bg-muted">
                           <div className="flex justify-between items-start">
                               <p className="text-sm font-medium mr-4">{address.fullAddress}</p>
                               <div className="flex-shrink-0 flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditAddressNote(address)}><PencilIcon className="w-4 h-4"/></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveAddress(address.id)}><TrashIcon className="w-4 h-4 text-destructive/70"/></Button>
                               </div>
                           </div>
                           {editingAddressId === address.id ? (
                                <div className="mt-2 flex items-center gap-2">
                                    <Input value={addressNote} onChange={(e) => setAddressNote(e.target.value)} placeholder="Add note for this address..."/>
                                    <Button size="sm" onClick={handleSaveAddressNote}>Save</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingAddressId(null)}>Cancel</Button>
                                </div>
                           ) : address.notes && (
                                <div className="mt-1 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/50 p-2 rounded">
                                    <ChatBubbleLeftEllipsisIcon className="w-4 h-4 flex-shrink-0 mt-0.5"/>
                                    <p>{address.notes}</p>
                                </div>
                           )}
                        </div>
                    ))}
                </div>
                 {customer.addresses.length > 3 && (
                    <Button variant="link" size="sm" onClick={() => setShowAllAddresses(!showAllAddresses)} className="mt-2">
                        {showAllAddresses ? 'Show fewer' : `Show ${customer.addresses.length - 3} more addresses`}
                        <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${showAllAddresses ? 'rotate-180' : ''}`} />
                    </Button>
                )}
            </div>

            {/* General Notes */}
            <div>
              <h4 className="font-semibold mb-2 flex justify-between items-center">General Notes<Button variant="ghost" size="sm" className="text-xs" onClick={() => setIsAddingNote(true)}><PlusCircleIcon className="w-4 h-4 mr-1"/> Add Note</Button></h4>
              <div className="space-y-3">
                  {isAddingNote && (
                    <div className="p-3 rounded-lg bg-muted space-y-2">
                        <Textarea 
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            placeholder="Type your note here..."
                            rows={3}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setIsAddingNote(false)}>Cancel</Button>
                            <Button size="sm" onClick={handleSaveNote}>Save Note</Button>
                        </div>
                    </div>
                  )}
                  {visibleNotes.map((note, index) => (
                      <div key={index} className="p-3 rounded-lg bg-muted text-sm">
                          <p>{note.text}</p>
                          <p className="text-right mt-2 text-xs text-muted-foreground"><strong>{note.author}</strong> - {new Date(note.date).toLocaleString('en-GB')}</p>
                      </div>
                  ))}
              </div>
               {customer.notes.length > 2 && (
                    <Button variant="link" size="sm" onClick={() => setShowAllNotes(!showAllNotes)} className="mt-2">
                        {showAllNotes ? 'Show fewer' : `Show ${customer.notes.length - 2} more notes`}
                        <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${showAllNotes ? 'rotate-180' : ''}`} />
                    </Button>
                )}
            </div>

            {/* Actions */}
            <div>
              <h4 className="font-semibold mb-2">Actions</h4>
              <div className="flex flex-wrap gap-2">
                  <Button variant="outline"><CurrencyPoundIcon className="w-4 h-4 mr-2"/> Apply Credit</Button>
                  <Button variant="outline">Ban Driver</Button>
                  <Button variant="destructive"><BanIcon className="w-4 h-4 mr-2"/> Ban Customer</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
            <BookingsTable 
                bookings={bookingsForCustomer} 
                customerAddressNotes={customer.addresses} 
                onEditBooking={onEditBooking} 
                onOpenPaymentModal={onOpenPaymentModal} 
                sortConfig={{key: 'pickupDateTime', direction: 'desc'}} 
                onSort={() => {}} 
            />
        </CardContent>
      </Card>
    </div>
  );
};

const CustomersPage: React.FC = () => {
    const [customers, setCustomers] = useState(mockCustomers);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(customers[0]?.id || null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [bookingForPayment, setBookingForPayment] = useState<Booking | null>(null);
    const [isMessageComposerOpen, setIsMessageComposerOpen] = useState(false);


    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return [];
        const lowercasedTerm = searchTerm.toLowerCase();
        return customers.filter(c =>
            c.name.toLowerCase().includes(lowercasedTerm) ||
            c.phone.includes(lowercasedTerm) ||
            c.email.toLowerCase().includes(lowercasedTerm)
        );
    }, [searchTerm, customers]);

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

    const handleOpenModal = (customer: Customer | null) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    const handleSaveCustomer = (customerToSave: Customer) => {
        if (editingCustomer) { // Update
            setCustomers(prev => prev.map(c => c.id === customerToSave.id ? customerToSave : c));
        } else { // Create
            const newCustomer: Customer = {
                ...customerToSave,
                id: `C${Date.now()}`,
                joinDate: new Date().toISOString(),
                notes: [],
                addresses: [],
                attributes: [],
                bannedDriverIds: [],
                totalSpend: 0,
                loyaltyPoints: 0,
                accountCredit: 0,
            };
            setCustomers(prev => [newCustomer, ...prev]);
            setSelectedCustomerId(newCustomer.id);
        }
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    const handleOpenBookingModal = (booking: Booking) => {
        setSelectedBooking(booking);
        setIsBookingModalOpen(true);
    };

    const handleSaveBooking = (updatedBooking: Booking) => {
        // This view uses mock data directly, so we can't update it.
        // In a real app, this would trigger a data refetch or update a global store.
        console.log("Booking update requested:", updatedBooking);
        setIsBookingModalOpen(false);
        setSelectedBooking(null);
    };

    const handleOpenPaymentModal = (booking: Booking) => {
        setBookingForPayment(booking);
        setIsPaymentModalOpen(true);
    };
    
    const handleUpdatePayment = (updatedBooking: Booking) => {
        // This view uses mock data directly, so we can't update it.
        // In a real app, this would trigger a data refetch or update a global store.
        console.log("Payment update requested:", updatedBooking);
        setIsPaymentModalOpen(false);
        setBookingForPayment(null);
    };


  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm -mt-4 sm:-mt-6 lg:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 border-b border-border">
        <div className="relative">
            <FilterBar
                searchTerm={isSearchFocused ? searchTerm : (selectedCustomer?.name || '')}
                onSearchTermChange={setSearchTerm}
                filterDefinitions={[]}
                activeFilters={[]}
                onActiveFiltersChange={() => {}}
                onFocus={() => {
                    setSearchTerm('');
                    setIsSearchFocused(true);
                }}
                onBlur={() => {
                    setTimeout(() => setIsSearchFocused(false), 200);
                }}
            >
                <Button onClick={() => handleOpenModal(null)}>
                    <PlusCircleIcon className="w-4 h-4 mr-2" />
                    Add Customer
                </Button>
            </FilterBar>
            {isSearchFocused && searchTerm && (
                <Card className="absolute top-full mt-2 w-full z-20 max-h-80 overflow-y-auto">
                    <CardContent className="p-2">
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(customer => (
                                <button
                                    key={customer.id}
                                    onClick={() => {
                                        setSelectedCustomerId(customer.id);
                                        setSearchTerm('');
                                        setIsSearchFocused(false);
                                    }}
                                    className="w-full text-left p-3 rounded-lg transition-colors hover:bg-muted"
                                >
                                    <p className="font-semibold">{customer.name}</p>
                                    <p className="text-xs text-muted-foreground">{customer.phone}</p>
                                </button>
                            ))
                        ) : (
                            <p className="p-3 text-sm text-center text-muted-foreground">No customers found.</p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
      </div>

      {selectedCustomer ? (
            <CustomerDetail 
              customer={selectedCustomer} 
              onUpdateCustomer={(c) => setCustomers(prev => prev.map(pc => pc.id === c.id ? c : pc))} 
              onEditCustomer={() => handleOpenModal(selectedCustomer)}
              onEditBooking={handleOpenBookingModal}
              onOpenPaymentModal={handleOpenPaymentModal}
              onOpenMessageComposer={() => setIsMessageComposerOpen(true)}
            />
        ) : (
             <div className="flex-1 flex items-center justify-center h-96 bg-muted rounded-lg">
                <p className="text-muted-foreground">Search for a customer to view their details</p>
            </div>
        )}

      {isModalOpen && (
        <CustomerEditModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCustomer(null);
          }}
          onSave={handleSaveCustomer}
          customer={editingCustomer}
        />
      )}

      {isBookingModalOpen && selectedBooking && (
        <BookingEditModal
          booking={selectedBooking}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onSave={handleSaveBooking}
        />
      )}

      {isPaymentModalOpen && bookingForPayment && (
        <PaymentModal
            booking={bookingForPayment}
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            onSave={handleUpdatePayment}
        />
      )}
      
      {isMessageComposerOpen && selectedCustomer && (
        <MessageComposerModal
            isOpen={isMessageComposerOpen}
            onClose={() => setIsMessageComposerOpen(false)}
            initialRecipient={{ type: 'Customer', id: selectedCustomer.id, name: selectedCustomer.name }}
        />
      )}
    </div>
  );
};

export default CustomersPage;