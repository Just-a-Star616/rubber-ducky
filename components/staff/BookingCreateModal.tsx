
import React, { useState, useCallback, useEffect } from 'react';
import { Booking } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { XIcon, TrashIcon, PlusCircleIcon } from '../icons/Icon';
import { mockBookingAttributesList, mockSiteDetails } from '../../lib/mockData';
import { Checkbox } from '../ui/checkbox';

interface BookingCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (booking: Booking) => void;
}

const BookingCreateModal: React.FC<BookingCreateModalProps> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Booking>>({
        vias: [],
        attributes: [],
        status: 'Upcoming',
        siteId: mockSiteDetails[0].id,
    });

    const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);
    useEffect(() => { if (isOpen) document.addEventListener('keydown', handleKeyDown); return () => document.removeEventListener('keydown', handleKeyDown); }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
    };
    
    const handleViaChange = (index: number, value: string) => {
        const newVias = [...(formData.vias || [])];
        newVias[index] = value;
        setFormData(prev => ({ ...prev, vias: newVias }));
    };

    const addVia = () => setFormData(prev => ({ ...prev, vias: [...(prev.vias || []), ''] }));
    const removeVia = (index: number) => setFormData(prev => ({ ...prev, vias: (prev.vias || []).filter((_, i) => i !== index) }));
    
    const handleAttributeChange = (attribute: string) => {
        setFormData(prev => {
            const newAttributes = prev.attributes?.includes(attribute)
                ? prev.attributes.filter(a => a !== attribute)
                : [...(prev.attributes || []), attribute];
            return { ...prev, attributes: newAttributes };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newBooking: Booking = {
            id: `B${Date.now()}`,
            customerId: `CUST${Date.now()}`,
            ...formData,
        } as Booking;
        onSave(newBooking);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="relative bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="sticky top-0 bg-card px-6 py-4 border-b border-border flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold">Create New Booking</h2>
                    <Button type="button" variant="ghost" size="icon" onClick={onClose}><XIcon className="w-6 h-6" /></Button>
                </header>
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {/* Customer & Account */}
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <legend className="text-lg font-semibold text-foreground md:col-span-2 border-b pb-2 mb-2">Customer</legend>
                        <Input name="customerName" placeholder="Customer Name" value={formData.customerName || ''} onChange={handleInputChange} required />
                        <Input name="customerPhone" placeholder="Customer Phone" value={formData.customerPhone || ''} onChange={handleInputChange} required />
                        <Input name="accountName" placeholder="Account Name (Optional)" value={formData.accountName || ''} onChange={handleInputChange} className="md:col-span-2" />
                    </fieldset>

                    {/* Journey Details */}
                    <fieldset>
                        <legend className="text-lg font-semibold text-foreground border-b pb-2 mb-2">Journey</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="text-sm font-medium">Pickup Date & Time</label>
                                <Input name="pickupDateTime" type="datetime-local" value={formData.pickupDateTime || ''} onChange={handleInputChange} required className="mt-1" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Site</label>
                                <Select value={formData.siteId} onValueChange={(v) => setFormData(p => ({...p, siteId: v}))}>
                                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>{mockSiteDetails.map(site => <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <Textarea name="pickupAddress" placeholder="Pickup Address" value={formData.pickupAddress || ''} onChange={handleInputChange} required className="md:col-span-2" rows={2}/>
                            {formData.vias?.map((via, index) => (
                                <div key={index} className="flex items-center gap-2 md:col-span-2">
                                    <Textarea placeholder={`Via Point ${index + 1}`} value={via} onChange={(e) => handleViaChange(index, e.target.value)} rows={1} className="flex-grow"/>
                                    <Button type="button" variant="destructive" size="icon" onClick={() => removeVia(index)}><TrashIcon className="w-4 h-4"/></Button>
                                </div>
                            ))}
                             <div className="md:col-span-2">
                                <Button type="button" variant="outline" size="sm" onClick={addVia}><PlusCircleIcon className="w-4 h-4 mr-2" /> Add Via</Button>
                            </div>
                            <Textarea name="destinationAddress" placeholder="Destination Address" value={formData.destinationAddress || ''} onChange={handleInputChange} required className="md:col-span-2" rows={2}/>
                        </div>
                    </fieldset>
                    
                     {/* Attributes & Pricing */}
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <legend className="text-lg font-semibold text-foreground border-b pb-2 mb-2">Attributes & Extras</legend>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {mockBookingAttributesList.map(attr => (
                                    <div key={attr} className="flex items-center space-x-2">
                                        <Checkbox id={`attr-${attr}`} checked={formData.attributes?.includes(attr)} onCheckedChange={() => handleAttributeChange(attr)} />
                                        <label htmlFor={`attr-${attr}`} className="text-sm font-medium leading-none">{attr}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <legend className="text-lg font-semibold text-foreground border-b pb-2 mb-2">Pricing</legend>
                             <div>
                                <label className="text-sm font-medium">Price (Customer)</label>
                                <Input name="price" type="number" step="0.01" placeholder="0.00" value={formData.price || ''} onChange={handleNumericInputChange} required className="mt-1" />
                            </div>
                             <div>
                                <label className="text-sm font-medium">Cost (Driver)</label>
                                <Input name="cost" type="number" step="0.01" placeholder="0.00" value={formData.cost || ''} onChange={handleNumericInputChange} required className="mt-1" />
                            </div>
                        </div>
                    </fieldset>

                </div>
                <footer className="sticky bottom-0 bg-card/80 backdrop-blur-sm p-4 border-t border-border flex justify-end items-center space-x-3">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Create Booking</Button>
                </footer>
            </form>
        </div>
    );
};

export default BookingCreateModal;
