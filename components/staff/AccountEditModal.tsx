

import React, { useState, useCallback, useEffect } from 'react';
import { Account, FeeType, VatApplication, PaymentType, ValidationType } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { XIcon } from '../icons/Icon';
import { Checkbox } from '../ui/checkbox';
import { mockSiteDetails } from '../../lib/mockData';

interface AccountEditModalProps {
    account: Account;
    isOpen: boolean;
    onClose: () => void;
    onSave: (account: Account) => void;
}

const FormField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-muted-foreground">{label}</label>
        <Input id={props.id} {...props} className="mt-1" />
    </div>
);

const TextareaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-muted-foreground">{label}</label>
        <Textarea id={props.id} {...props} className="mt-1" />
    </div>
);

const FeeInputGroup: React.FC<{
  label: string;
  type?: FeeType;
  onTypeChange: (type: FeeType) => void;
  value?: number;
  onValueChange: (value: number) => void;
  minValue?: number;
  onMinValueChange?: (value: number) => void;
}> = ({ label, type, onTypeChange, value, onValueChange, minValue, onMinValueChange }) => (
    <div className="p-3 border rounded-lg bg-background space-y-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Select value={type} onValueChange={onTypeChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="%">%</SelectItem>
                    <SelectItem value="fixed">Fixed (£)</SelectItem>
                </SelectContent>
            </Select>
            <Input type="number" step="0.01" placeholder="Value" value={value || ''} onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)} disabled={type === 'none'} />
            {onMinValueChange && <Input type="number" step="0.01" placeholder="Minimum (£)" value={minValue || ''} onChange={(e) => onMinValueChange(parseFloat(e.target.value) || 0)} disabled={type === 'none'} />}
        </div>
    </div>
);

const validationTypes: ValidationType[] = ['None', 'PIN', 'Password', 'Purchase Order'];

const AccountEditModal: React.FC<AccountEditModalProps> = ({ account, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<Account>(account);

    const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);
    useEffect(() => { if (isOpen) document.addEventListener('keydown', handleKeyDown); return () => document.removeEventListener('keydown', handleKeyDown); }, [isOpen, handleKeyDown]);

    useEffect(() => {
        setFormData(account);
    }, [account]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag);
        setFormData(prev => ({...prev, tags: tagsArray}));
    };
    
    const handleValidationTypeChange = (type: ValidationType) => {
        setFormData(prev => {
            const currentTypes = prev.validationTypes || [];
            let newTypes = currentTypes.includes(type)
                ? currentTypes.filter(t => t !== type)
                : [...currentTypes, type];
            
            if (type === 'None' && newTypes.includes('None')) {
                newTypes = ['None'];
            } else if (newTypes.length > 1 && newTypes.includes('None')) {
                newTypes = newTypes.filter(t => t !== 'None');
            }
    
            if (newTypes.length === 0) {
                newTypes = ['None'];
            }
    
            return { ...prev, validationTypes: newTypes };
        });
    };

    const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value === '' ? undefined : parseFloat(value)}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="relative bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="sticky top-0 bg-card px-6 py-4 border-b border-border flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold">Edit Account: {account.name}</h2>
                    <Button type="button" variant="ghost" size="icon" onClick={onClose}><XIcon className="w-6 h-6" /></Button>
                </header>
                <div className="flex-grow overflow-y-auto p-6 space-y-8">
                    {/* General & Contact */}
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <legend className="text-lg font-semibold text-foreground md:col-span-2 border-b pb-2 mb-2">General & Contact</legend>
                        <FormField label="Account Name" name="name" value={formData.name} onChange={handleInputChange} />
                        <FormField label="Main Contact Name" name="mainContactName" value={formData.mainContactName} onChange={handleInputChange} />
                        <FormField label="Main Contact Email" name="mainContactEmail" type="email" value={formData.mainContactEmail} onChange={handleInputChange} />
                        <FormField label="Main Contact Phone" name="mainContactPhone" type="tel" value={formData.mainContactPhone} onChange={handleInputChange} />
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-muted-foreground">Assigned Site</label>
                            <Select value={formData.siteId} onValueChange={(v) => setFormData(s => ({...s, siteId: v as any}))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{mockSiteDetails.map(site => <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>)}</SelectContent></Select>
                        </div>
                        <FormField label="Tags (comma-separated)" name="tags" value={formData.tags?.join(', ') || ''} onChange={handleTagsChange} className="md:col-span-2" />
                    </fieldset>
                    
                    {/* Invoicing */}
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <legend className="text-lg font-semibold text-foreground md:col-span-2 border-b pb-2 mb-2">Invoicing</legend>
                        <FormField label="Invoice Email Address" name="invoiceEmailAddress" type="email" value={formData.invoiceEmailAddress || ''} onChange={handleInputChange} />
                        <div>
                             <label className="block text-sm font-medium text-muted-foreground">Invoice Schedule</label>
                             <Select value={formData.invoiceSchedule} onValueChange={(v) => setFormData(s => ({...s, invoiceSchedule: v as any}))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Weekly">Weekly</SelectItem><SelectItem value="Monthly">Monthly</SelectItem></SelectContent></Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground">Payment Terms</label>
                            <Select value={formData.paymentTerms} onValueChange={(v) => setFormData(s => ({...s, paymentTerms: v as any}))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Net 7">Net 7</SelectItem><SelectItem value="Net 14">Net 14</SelectItem><SelectItem value="Net 30">Net 30</SelectItem></SelectContent></Select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-muted-foreground">Invoice Template</label>
                             <Select value={formData.invoiceTemplate} onValueChange={(v) => setFormData(s => ({...s, invoiceTemplate: v}))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Default">Default</SelectItem><SelectItem value="Detailed">Detailed</SelectItem><SelectItem value="Compact">Compact</SelectItem></SelectContent></Select>
                        </div>
                        <TextareaField label="Invoice Terms" name="invoiceTerms" value={formData.invoiceTerms || ''} onChange={handleInputChange} className="md:col-span-2" rows={3}/>
                        <FormField label="Invoice Footer" name="invoiceFooter" value={formData.invoiceFooter || ''} onChange={handleInputChange} className="md:col-span-2" />
                    </fieldset>

                    {/* Booking Rules */}
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <legend className="text-lg font-semibold text-foreground md:col-span-2 border-b pb-2 mb-2">Booking Rules</legend>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-muted-foreground">Validation Types</label>
                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 rounded-lg border bg-background">
                                {validationTypes.map(type => (
                                    <div key={type} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`validation-${type}`}
                                            checked={formData.validationTypes?.includes(type)}
                                            onCheckedChange={() => handleValidationTypeChange(type)}
                                        />
                                        <label htmlFor={`validation-${type}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            {type}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                         <FormField label="Credit Limit (£)" name="creditLimit" type="number" step="100" value={formData.creditLimit || ''} onChange={handleNumericInputChange} />
                         <div />
                         <FormField label="Start Date" name="startDate" type="date" value={formData.startDate?.split('T')[0] || ''} onChange={handleInputChange} />
                         <FormField label="End Date (optional)" name="endDate" type="date" value={formData.endDate?.split('T')[0] || ''} onChange={handleInputChange} />
                    </fieldset>

                    {/* Pricing & Fees */}
                    <fieldset className="space-y-4">
                        <legend className="text-lg font-semibold text-foreground border-b pb-2 mb-2">Pricing, Fees & VAT</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FeeInputGroup label="Service Charge" type={formData.serviceChargeType} onTypeChange={(v) => setFormData(s => ({...s, serviceChargeType: v}))} value={formData.serviceChargeValue} onValueChange={(v) => setFormData(s => ({...s, serviceChargeValue: v}))} minValue={formData.serviceChargeMinimum} onMinValueChange={(v) => setFormData(s => ({...s, serviceChargeMinimum: v}))} />
                            <FeeInputGroup label="Booking Fee" type={formData.bookingFeeType} onTypeChange={(v) => setFormData(s => ({...s, bookingFeeType: v}))} value={formData.bookingFeeValue} onValueChange={(v) => setFormData(s => ({...s, bookingFeeValue: v}))} minValue={formData.bookingFeeMinimum} onMinValueChange={(v) => setFormData(s => ({...s, bookingFeeMinimum: v}))} />
                            <FeeInputGroup label="Price Uplift" type={formData.upliftType} onTypeChange={(v) => setFormData(s => ({...s, upliftType: v}))} value={formData.upliftValue} onValueChange={(v) => setFormData(s => ({...s, upliftValue: v}))} />
                            <div className="p-3 border rounded-lg bg-background grid grid-cols-2 gap-2">
                                <FormField label="VAT Rate (%)" name="vatRate" type="number" step="0.1" value={formData.vatRate || ''} onChange={handleNumericInputChange} />
                                <div>
                                     <label className="block text-sm font-medium text-muted-foreground">VAT applies to</label>
                                     <Select value={formData.vatAppliesTo} onValueChange={(v) => setFormData(s => ({...s, vatAppliesTo: v as VatApplication}))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="nothing">Nothing</SelectItem><SelectItem value="serviceCharge">Service Charge</SelectItem><SelectItem value="serviceChargeAndPrice">Service & Price</SelectItem></SelectContent></Select>
                                </div>
                            </div>
                        </div>
                    </fieldset>

                </div>
                <footer className="sticky bottom-0 bg-card/80 backdrop-blur-sm p-4 border-t border-border flex justify-end items-center space-x-3">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Account</Button>
                </footer>
            </form>
        </div>
    );
};

export default AccountEditModal;