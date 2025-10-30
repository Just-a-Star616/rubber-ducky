
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { SystemAttribute, AttributeEligibility, FeeType } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { XIcon, TrashIcon } from '../icons/Icon';
import { Checkbox } from '../ui/checkbox';
import CodeEditor from '../ui/CodeEditor';
import { variableDefinitions } from '../../lib/variables';

interface AttributeEditModalProps {
    attribute: SystemAttribute | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (attribute: SystemAttribute) => void;
    onDelete: (attributeId: string) => void;
}

const eligibilityOptions: AttributeEligibility[] = ['Driver', 'Vehicle', 'Account', 'Customer', 'Booking'];

const AttributeEditModal: React.FC<AttributeEditModalProps> = ({ attribute, isOpen, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState<Partial<SystemAttribute>>({});
    const isNew = !attribute;

    const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);
    useEffect(() => {
        setFormData(isNew ? { 
            name: '', 
            description: '', 
            isActive: true, 
            eligibility: [], 
            pricing: { type: 'none', costEffect: 0, priceEffect: 0, applyCommission: false }, 
            conditions: { autoApplyRule: '' } 
        } : JSON.parse(JSON.stringify(attribute))); // Deep copy
        if (isOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [attribute, isOpen, isNew, handleKeyDown]);
    
    const availableVariables = useMemo(() => {
        const vars: Record<string, string[]> = {};
        if (formData.eligibility?.includes('Booking')) vars.booking = variableDefinitions.booking;
        if (formData.eligibility?.includes('Customer')) vars.customer = variableDefinitions.customer;
        if (formData.eligibility?.includes('Account')) vars.account = variableDefinitions.account;
        if (formData.eligibility?.includes('Driver')) vars.driver = variableDefinitions.driver;
        if (formData.eligibility?.includes('Vehicle')) vars.vehicle = variableDefinitions.vehicle;
        return vars;
    }, [formData.eligibility]);


    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNestedInputChange = (parentKey: keyof SystemAttribute, childKey: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parentKey]: {
                // @ts-ignore
                ...prev[parentKey],
                [childKey]: value
            }
        }));
    };

    const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const [object, key] = name.split('.');
        setFormData(prev => ({
            ...prev,
            [object]: {
                // @ts-ignore
                ...prev[object],
                [key]: parseFloat(value) || 0
            }
        }));
    };

    const handleEligibilityChange = (eligibility: AttributeEligibility) => {
        setFormData(prev => {
            const current = prev.eligibility || [];
            const newEligibility = current.includes(eligibility)
                ? current.filter(e => e !== eligibility)
                : [...current, eligibility];
            return { ...prev, eligibility: newEligibility };
        });
    };
    
    const handleSave = () => {
        if (!formData.name) {
            alert('Attribute Name is required.');
            return;
        }
        onSave(formData as SystemAttribute);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="relative bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="sticky top-0 bg-card px-6 py-4 border-b border-border flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold">{isNew ? 'Add New Attribute' : `Edit Attribute: ${attribute?.name}`}</h2>
                    <Button type="button" variant="ghost" size="icon" onClick={onClose} className="rounded-full"><XIcon className="w-6 h-6" /></Button>
                </header>
                
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    <fieldset>
                        <legend className="text-md font-semibold text-foreground mb-2">General Details</legend>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-muted-foreground">Attribute Name</label>
                                    <Input name="name" value={formData.name || ''} onChange={handleInputChange} required className="mt-1" />
                                </div>
                                 <div className="flex items-end">
                                    <label className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted cursor-pointer">
                                        <Checkbox id="isActive" checked={formData.isActive} onCheckedChange={(checked) => setFormData(p => ({ ...p, isActive: !!checked }))} />
                                        <span className="text-sm font-medium">Active</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground">Description</label>
                                <Textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows={2} className="mt-1"/>
                            </div>
                        </div>
                    </fieldset>

                     <fieldset>
                        <legend className="text-md font-semibold text-foreground mb-2">Eligibility</legend>
                        <p className="text-sm text-muted-foreground mb-2">Select where this attribute can be applied.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {eligibilityOptions.map(option => (
                                <label key={option} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted cursor-pointer">
                                    <Checkbox 
                                        id={`eligibility-${option}`}
                                        checked={formData.eligibility?.includes(option)}
                                        onCheckedChange={() => handleEligibilityChange(option)}
                                    />
                                    <span className="text-sm font-medium">{option}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend className="text-md font-semibold text-foreground mb-2">Pricing Impact</legend>
                        <p className="text-xs text-muted-foreground -mt-1 mb-4">Enter a positive value for an uplift (surcharge) and a negative value for a discount.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground">Type</label>
                                <Select value={formData.pricing?.type} onValueChange={(v) => handleNestedInputChange('pricing', 'type', v as FeeType)}>
                                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="%">%</SelectItem>
                                        <SelectItem value="fixed">Fixed (£)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-muted-foreground">Price Effect (+/-)</label>
                                <Input type="number" step="0.01" name="pricing.priceEffect" value={formData.pricing?.priceEffect || 0} onChange={handleNumericInputChange} disabled={formData.pricing?.type === 'none'} className="mt-1" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-muted-foreground">Cost Effect (+/-)</label>
                                <Input type="number" step="0.01" name="pricing.costEffect" value={formData.pricing?.costEffect || 0} onChange={handleNumericInputChange} disabled={formData.pricing?.type === 'none'} className="mt-1" />
                            </div>
                            <div className="sm:col-span-3 pt-2">
                                <label className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-muted cursor-pointer has-[:disabled]:opacity-50 has-[:disabled]:cursor-not-allowed">
                                    <Checkbox
                                        id="applyCommission"
                                        checked={formData.pricing?.applyCommission}
                                        onCheckedChange={(checked) => handleNestedInputChange('pricing', 'applyCommission', !!checked)}
                                        disabled={formData.pricing?.type === 'none'}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <span className="font-medium">Apply Commission to Value</span>
                                        <p className="text-xs text-muted-foreground">
                                            If checked, commission will be calculated on this attribute's value during driver invoicing.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset>
                         <legend className="text-md font-semibold text-foreground mb-2">Conditions</legend>
                         <div>
                            <label className="block text-sm font-medium text-muted-foreground">Auto-Apply Rule</label>
                             <CodeEditor 
                                language="js"
                                value={formData.conditions?.autoApplyRule || ''}
                                onChange={(v) => handleNestedInputChange('conditions', 'autoApplyRule', v)}
                                placeholder="e.g., booking.destinationAddress.includes('Airport')"
                                availableVariables={availableVariables}
                             />
                            <div className="text-xs text-muted-foreground mt-1">
                                <p>Optional JS expression. If it evaluates to true, the attribute will be automatically added. Available variables:</p>
                                <div className="flex flex-wrap gap-x-2 mt-1">{availableVariables && Object.keys(availableVariables).map(v => <code key={v} className="bg-muted p-0.5 rounded">{v}</code>)}</div>
                            </div>
                         </div>
                    </fieldset>
                </div>

                <footer className="sticky bottom-0 bg-card/80 backdrop-blur-sm p-4 border-t border-border flex justify-between items-center">
                    <Button type="button" onClick={() => onDelete(formData.id!)} variant="destructive" disabled={isNew}><TrashIcon className="w-4 h-4 mr-2" />Delete Attribute</Button>
                    <div className="space-x-3">
                        <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                        <Button type="submit">Save Attribute</Button>
                    </div>
                </footer>
            </form>
        </div>
    );
};

export default AttributeEditModal;
