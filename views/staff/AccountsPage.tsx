

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { mockAccounts, mockBookings, mockSiteDetails } from '../../lib/mockData';
import { Account, Booking } from '../../types';
import { PencilIcon, CurrencyPoundIcon, UserCircleIcon, BriefcaseIcon, CalendarIcon, TagIcon, BanIcon, ChatBubbleLeftEllipsisIcon, PlusCircleIcon } from '../../components/icons/Icon';
import { BookingsTable } from './BookingsPage';
import AccountEditModal from '../../components/staff/AccountEditModal';
import BookingEditModal from '../../components/staff/BookingEditModal';
import PaymentModal from '../../components/staff/PaymentModal';
import MessageComposerModal from '../../components/staff/MessageComposerModal';
import FilterBar from '../../components/staff/FilterBar';
import { Textarea } from '../../components/ui/textarea';

const priorityConfig: { [key in Account['priorityLevel']]: { color: string; icon: React.ElementType } } = {
  Normal: { color: 'text-muted-foreground', icon: UserCircleIcon },
  High: { color: 'text-blue-600 dark:text-blue-200', icon: BriefcaseIcon },
  VIP: { color: 'text-amber-600 dark:text-amber-300', icon: BriefcaseIcon },
};

const DetailItem: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({ label, value, className }) => (
    <div className={className}>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value || <span className="text-muted-foreground italic">Not Set</span>}</p>
    </div>
);

const AccountDetail: React.FC<{ account: Account; onUpdateAccount: (updatedAccount: Account) => void; onEdit: () => void; onEditBooking: (booking: Booking) => void; onOpenPaymentModal: (booking: Booking) => void; onOpenMessageComposer: () => void; }> = ({ account, onUpdateAccount, onEdit, onEditBooking, onOpenPaymentModal, onOpenMessageComposer }) => {
  const PriorityIcon = priorityConfig[account.priorityLevel].icon;
  const bookingsForAccount = mockBookings.filter(b => b.accountName === account.name);
  const site = mockSiteDetails.find(s => s.id === account.siteId);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  const formatFee = (type: Account['serviceChargeType'], value?: number, min?: number) => {
    if (type === 'none' || !value) return 'None';
    let str = type === '%' ? `${value}%` : `£${value.toFixed(2)}`;
    if (min) str += ` (min £${min.toFixed(2)})`;
    return str;
  }
  
  const handleSaveNote = () => {
    if (!newNoteText.trim()) return;
    const newNote = {
        date: new Date().toISOString(),
        author: 'Alex Johnson', // mock current user
        text: newNoteText,
    };
    const updatedAccount = {
        ...account,
        notes: [newNote, ...account.notes],
    };
    onUpdateAccount(updatedAccount);
    setIsAddingNote(false);
    setNewNoteText('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
              <div>
                  <CardTitle className="flex items-center space-x-2">
                      <span>{account.name}</span>
                      {account.isBanned && <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-destructive text-destructive-foreground">Banned</span>}
                  </CardTitle>
                  <CardDescription>Account ID: {account.id}</CardDescription>
              </div>
               <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 p-2 rounded-lg bg-muted ${priorityConfig[account.priorityLevel].color}`}>
                      <PriorityIcon className="w-4 h-4"/>
                      <span className="text-xs font-semibold">{account.priorityLevel}</span>
                  </div>
                  <Button onClick={onOpenMessageComposer} variant="outline"><ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-2"/> Message</Button>
                  <Button onClick={onEdit}><PencilIcon className="w-4 h-4 mr-2"/> Edit Account</Button>
               </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">Outstanding Balance</p><p className="text-lg font-bold text-destructive">£{account.outstandingBalance.toFixed(2)}</p></div>
              <div className="p-3 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">Total Spend</p><p className="text-lg font-bold">£{account.totalSpend.toFixed(2)}</p></div>
              <div className="p-3 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">Credit Limit</p><p className="text-lg font-bold">{account.creditLimit ? `£${account.creditLimit.toLocaleString()}` : 'N/A'}</p></div>
              <div className="p-3 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">Member Since</p><p className="text-sm font-bold">{new Date(account.joinDate).toLocaleDateString('en-GB')}</p></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
             {/* Contact & Billing */}
            <div className="space-y-4">
                <h4 className="font-semibold flex items-center border-b pb-2"><UserCircleIcon className="w-5 h-5 mr-2 text-muted-foreground"/> Contact & Billing</h4>
                 <div className="space-y-3">
                    <DetailItem label="Main Contact" value={account.mainContactName} />
                    <DetailItem label="Contact Email" value={account.mainContactEmail} />
                    <DetailItem label="Contact Phone" value={account.mainContactPhone} />
                    <DetailItem label="Invoice Email" value={account.invoiceEmailAddress || account.mainContactEmail} />
                    <DetailItem label="Assigned Site" value={site?.name} />
                    <DetailItem label="Billing Address" value={<p className="whitespace-pre-wrap">{account.billingAddress}</p>} />
                    {account.vatNumber && <DetailItem label="VAT Number" value={account.vatNumber} />}
                 </div>
            </div>
            
            {/* Invoicing & Booking Rules */}
             <div className="space-y-4">
                <h4 className="font-semibold flex items-center border-b pb-2"><CalendarIcon className="w-5 h-5 mr-2 text-muted-foreground"/> Invoicing & Rules</h4>
                 <div className="space-y-3">
                    <DetailItem label="Invoice Schedule" value={account.invoiceSchedule} />
                    <DetailItem label="Payment Terms" value={account.paymentTerms} />
                    <DetailItem label="Invoice Template" value={account.invoiceTemplate} />
                    <DetailItem label="Validation Types" value={account.validationTypes.join(', ')} />
                    <DetailItem label="Allowed Payment Types" value={account.allowedPaymentTypes?.join(', ')} />
                    <DetailItem label="Allowed Attributes" value={account.allowedBookingAttributes.length > 0 ? account.allowedBookingAttributes.join(', ') : 'Any'} />
                    {account.maxBookingPrice && <DetailItem label="Max Booking Price" value={`£${account.maxBookingPrice.toFixed(2)}`} />}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Tags</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                            {account.tags && account.tags.length > 0 ? account.tags.map(tag => (
                                <span key={tag} className="px-2.5 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">{tag}</span>
                            )) : <span className="text-sm text-muted-foreground italic">Not Set</span>}
                        </div>
                    </div>
                 </div>
            </div>

            {/* Pricing & Fees */}
            <div className="space-y-4">
                <h4 className="font-semibold flex items-center border-b pb-2"><CurrencyPoundIcon className="w-5 h-5 mr-2 text-muted-foreground"/> Pricing & Fees</h4>
                <div className="space-y-3">
                    <DetailItem label="Service Charge" value={formatFee(account.serviceChargeType, account.serviceChargeValue, account.serviceChargeMinimum)} />
                    <DetailItem label="Booking Fee" value={formatFee(account.bookingFeeType, account.bookingFeeValue, account.bookingFeeMinimum)} />
                    <DetailItem label="Price Uplift" value={formatFee(account.upliftType, account.upliftValue)} />
                    <DetailItem label="VAT Rate" value={`${account.vatRate || 0}%`} />
                    <DetailItem label="VAT Applies To" value={account.vatAppliesTo} />
                </div>
            </div>
          </div>
          
            {/* Notes */}
            <div>
              <h4 className="font-semibold mb-2 flex justify-between items-center">Notes<Button variant="ghost" size="sm" className="text-xs" onClick={() => setIsAddingNote(true)}><PlusCircleIcon className="w-4 h-4 mr-1"/> Add Note</Button></h4>
              <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
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
                  {account.notes.map((note, index) => (
                      <div key={index} className="p-3 rounded-lg bg-muted text-sm">
                          <p>{note.text}</p>
                          <p className="text-right mt-2 text-xs text-muted-foreground"><strong>{note.author}</strong> - {new Date(note.date).toLocaleString('en-GB')}</p>
                      </div>
                  ))}
                  {account.notes.length === 0 && !isAddingNote && <p className="text-sm text-muted-foreground italic">No notes for this account.</p>}
              </div>
            </div>
        </CardContent>
      </Card>

            <Card>
                <CardHeader><CardTitle>Booking History</CardTitle></CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                        <BookingsTable 
                                bookings={bookingsForAccount} 
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


const AccountsPage: React.FC = () => {
    const [accounts, setAccounts] = useState(mockAccounts);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(accounts[0]?.id || null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [bookingForPayment, setBookingForPayment] = useState<Booking | null>(null);
    const [isMessageComposerOpen, setIsMessageComposerOpen] = useState(false);

    const filteredAccounts = useMemo(() => {
        if (!searchTerm) return [];
        const lowercasedTerm = searchTerm.toLowerCase();
        return accounts.filter(c =>
            c.name.toLowerCase().includes(lowercasedTerm) ||
            c.phone.includes(lowercasedTerm) ||
            c.email.toLowerCase().includes(lowercasedTerm)
        );
    }, [searchTerm, accounts]);

    const selectedAccount = accounts.find(c => c.id === selectedAccountId);

    const handleUpdateAccount = (updatedAccount: Account) => {
        setAccounts(prev => prev.map(c => c.id === updatedAccount.id ? updatedAccount : c));
        setIsEditModalOpen(false);
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm -mt-4 sm:-mt-6 lg:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 border-b border-border">
        <div className="relative">
            <FilterBar
                searchTerm={isSearchFocused ? searchTerm : (selectedAccount?.name || '')}
                onSearchTermChange={setSearchTerm}
                filterDefinitions={[]}
                activeFilters={[]}
                onActiveFiltersChange={() => {}}
                onFocus={() => {
                    setSearchTerm('');
                    setIsSearchFocused(true);
                }}
                onBlur={() => { setTimeout(() => setIsSearchFocused(false), 200); }}
            />
            {isSearchFocused && searchTerm && (
                <Card className="absolute top-full mt-2 w-full z-20 max-h-80 overflow-y-auto">
                    <CardContent className="p-2">
                        {filteredAccounts.length > 0 ? (
                            filteredAccounts.map(account => (
                                <button
                                    key={account.id}
                                    onClick={() => {
                                        setSelectedAccountId(account.id);
                                        setSearchTerm('');
                                        setIsSearchFocused(false);
                                    }}
                                    className="w-full text-left p-3 rounded-lg transition-colors hover:bg-muted"
                                >
                                    <p className="font-semibold">{account.name}</p>
                                    <p className="text-xs text-muted-foreground">{account.id} &bull; {account.mainContactName}</p>
                                </button>
                            ))
                        ) : (
                            <p className="p-3 text-sm text-center text-muted-foreground">No accounts found.</p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
      </div>

      {selectedAccount ? (
            <AccountDetail 
                account={selectedAccount} 
                onUpdateAccount={handleUpdateAccount} 
                onEdit={() => setIsEditModalOpen(true)}
                onEditBooking={handleOpenBookingModal}
                onOpenPaymentModal={handleOpenPaymentModal}
                onOpenMessageComposer={() => setIsMessageComposerOpen(true)}
            />
        ) : (
             <div className="flex-1 flex items-center justify-center h-96 bg-muted rounded-lg">
                <p className="text-muted-foreground">Search for a business account to view their details</p>
            </div>
        )}
        
        {isEditModalOpen && selectedAccount && (
            <AccountEditModal 
                account={selectedAccount}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleUpdateAccount}
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

        {isMessageComposerOpen && selectedAccount && (
            <MessageComposerModal
                isOpen={isMessageComposerOpen}
                onClose={() => setIsMessageComposerOpen(false)}
                initialRecipient={{ type: 'Account', id: selectedAccount.id, name: selectedAccount.name }}
            />
        )}
    </div>
  );
};

export default AccountsPage;