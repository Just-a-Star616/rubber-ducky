
import React, { useState, useEffect, useCallback } from 'react';
import { Customer } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { XIcon } from '../icons/Icon';
import { Checkbox } from '../ui/checkbox';

interface CustomerEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (customer: Customer) => void;
    customer: Customer | null;
}

const CustomerEditModal: React.FC<CustomerEditModalProps> = ({ isOpen, onClose, onSave, customer }) => {
    const [formData, setFormData] = useState<Partial<Customer>>({});
    const isNew = !customer;

    const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);

    useEffect(() => {
        setFormData(isNew ? { name: '', phone: '', email: '', priorityLevel: 'Normal', isBanned: false } : { ...customer });
        if (isOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [customer, isOpen, isNew, handleKeyDown]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Customer);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="relative bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="px-6 py-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-bold">{isNew ? 'Add New Customer' : `Edit Customer: ${customer?.name}`}</h2>
                    <Button type="button" variant="ghost" size="icon" onClick={onClose}><XIcon className="w-6 h-6" /></Button>
                </header>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">Full Name</label>
                            <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} required className="mt-1" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground">Phone Number</label>
                            <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} required className="mt-1" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Email Address</label>
                        <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} required className="mt-1" />
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground">Priority Level</label>
                            <Select value={formData.priorityLevel} onValueChange={(v) => setFormData(p => ({...p, priorityLevel: v as any}))}>
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Normal">Normal</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="VIP">VIP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center h-10">
                            <label className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted cursor-pointer">
                                <Checkbox id="isBanned" checked={formData.isBanned} onCheckedChange={(checked) => setFormData(p => ({ ...p, isBanned: !!checked }))} />
                                <span className="text-sm font-medium text-destructive">Is Banned</span>
                            </label>
                        </div>
                    </div>
                </div>
                <footer className="bg-card/80 backdrop-blur-sm p-4 border-t border-border flex justify-end items-center space-x-3">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">{isNew ? 'Create Customer' : 'Save Changes'}</Button>
                </footer>
            </form>
        </div>
    );
};

export default CustomerEditModal;
