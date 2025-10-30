
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { XIcon } from '../icons/Icon';
import { mockDrivers } from '../../lib/mockData';

export interface AdjustmentData {
  driverRef: string;
  driverName: string;
  type: string;
  description: string;
  amount: number;
}

interface AdjustmentAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (adjustment: AdjustmentData) => void;
}

const adjustmentTypes = [
    'Parking - Zone Charge Refund (ULEZ, Airport barrier etc)',
    'Parking Fine (PCN, bus lane etc)',
    'Credit Adjustment',
    'Debit Adjustment',
    'Admin Fee (parking fine admin charge etc)',
    'Fuel Refund'
];

export const AdjustmentAddModal: React.FC<AdjustmentAddModalProps> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({ driverRef: '', type: adjustmentTypes[0], description: '', amount: '' });

    const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);
    useEffect(() => { 
        if (isOpen) {
            setFormData({ driverRef: '', type: adjustmentTypes[0], description: '', amount: '' });
            document.addEventListener('keydown', handleKeyDown); 
        }
        return () => document.removeEventListener('keydown', handleKeyDown); 
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, type: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.driverRef || !formData.type || !formData.amount) {
            alert('Please fill Driver Ref, Type, and Amount fields.');
            return;
        }
        const driver = mockDrivers.find(d => d.id.toLowerCase() === formData.driverRef.toLowerCase());
        if (!driver) {
            alert(`Driver with ref ${formData.driverRef} not found.`);
            return;
        }
        
        const adjustment: AdjustmentData = {
            driverRef: formData.driverRef.toUpperCase(),
            driverName: `${driver.firstName} ${driver.lastName}`,
            type: formData.type,
            description: formData.description,
            amount: parseFloat(formData.amount),
        };
        onSave(adjustment);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="relative bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="sticky top-0 bg-card px-6 py-4 border-b border-border flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold">Add New Adjustment</h2>
                    <Button type="button" variant="ghost" size="icon" onClick={onClose}><XIcon className="w-6 h-6" /></Button>
                </header>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="driverRef" className="block text-sm font-medium text-muted-foreground mb-1">Driver Ref</label>
                        <Input id="driverRef" name="driverRef" value={formData.driverRef} onChange={handleInputChange} placeholder="e.g., D001" required />
                    </div>
                    <div>
                        <label htmlFor="adjustmentType" className="block text-sm font-medium text-muted-foreground mb-1">Type</label>
                        <Select value={formData.type} onValueChange={handleSelectChange}>
                            <SelectTrigger id="adjustmentType"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {adjustmentTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-muted-foreground mb-1">Description (Optional)</label>
                        <Input id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Add further detail..." />
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-muted-foreground mb-1">Amount (£)</label>
                        <Input id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleInputChange} placeholder="e.g., 25.00 or -10.50" required />
                    </div>
                </div>
                <footer className="bg-card/80 backdrop-blur-sm p-4 border-t border-border flex justify-end items-center space-x-3">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Add Adjustment</Button>
                </footer>
            </form>
        </div>
    );
};
