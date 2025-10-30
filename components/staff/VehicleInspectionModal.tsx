
import React, { useState, useCallback, useEffect } from 'react';
import { Vehicle, VehicleInspection } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
// FIX: Removed non-existent XCircleIcon import and will use XIcon instead.
import { XIcon, CheckIcon, PlusCircleIcon } from '../icons/Icon';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent } from '../ui/card';

interface VehicleInspectionModalProps {
    vehicle: Vehicle;
    isOpen: boolean;
    onClose: () => void;
    onSave: (vehicle: Vehicle) => void;
}

const VehicleInspectionModal: React.FC<VehicleInspectionModalProps> = ({ vehicle, isOpen, onClose, onSave }) => {
    const [inspections, setInspections] = useState<VehicleInspection[]>(vehicle.inspections || []);
    const [isAdding, setIsAdding] = useState(false);
    const [newInspection, setNewInspection] = useState<Partial<VehicleInspection>>({
        checklist: { tires: true, brakes: true, lights: true, bodywork: true },
        notes: '',
        passed: true,
        inspectorName: 'Alex Johnson',
    });

    const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);
    useEffect(() => { if (isOpen) document.addEventListener('keydown', handleKeyDown); return () => document.removeEventListener('keydown', handleKeyDown); }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const handleChecklistChange = (key: keyof VehicleInspection['checklist']) => {
        setNewInspection(prev => {
            const newChecklist = { ...prev.checklist, [key]: !prev.checklist![key] };
            const allPassed = Object.values(newChecklist).every(val => val);
            return { ...prev, checklist: newChecklist, passed: allPassed };
        });
    };
    
    const handleSaveInspection = () => {
        if (!newInspection.notes) {
            alert('Please add some inspection notes.');
            return;
        }
        const inspectionToSave: VehicleInspection = {
            ...newInspection,
            id: `INSP${Date.now()}`,
            date: new Date().toISOString(),
        } as VehicleInspection;
        
        const updatedInspections = [inspectionToSave, ...inspections];
        setInspections(updatedInspections);
        onSave({ ...vehicle, inspections: updatedInspections });
        setIsAdding(false);
        setNewInspection({
            checklist: { tires: true, brakes: true, lights: true, bodywork: true },
            notes: '', passed: true, inspectorName: 'Alex Johnson',
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="relative bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="sticky top-0 bg-card px-6 py-4 border-b border-border flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-xl font-bold">Vehicle Inspection</h2>
                        <p className="text-sm text-muted-foreground">{vehicle.registration} - {vehicle.make} {vehicle.model}</p>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={onClose}><XIcon className="w-6 h-6" /></Button>
                </header>
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {!isAdding && (
                        <div className="flex justify-end">
                            <Button onClick={() => setIsAdding(true)}><PlusCircleIcon className="w-4 h-4 mr-2"/> Add New Inspection</Button>
                        </div>
                    )}

                    {isAdding && (
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <h3 className="font-semibold">New Inspection Record</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(newInspection.checklist!).map(([key, value]) => (
                                        <div key={key} className="flex items-center space-x-2">
                                            <Checkbox id={key} checked={value} onCheckedChange={() => handleChecklistChange(key as keyof VehicleInspection['checklist'])} />
                                            <label htmlFor={key} className="text-sm font-medium capitalize">{key}</label>
                                        </div>
                                    ))}
                                </div>
                                <Textarea placeholder="Inspector notes..." value={newInspection.notes} onChange={(e) => setNewInspection(p => ({...p, notes: e.target.value}))} />
                                <div className="flex justify-between items-center">
                                    <div className={`text-sm font-semibold flex items-center ${newInspection.passed ? 'text-green-600' : 'text-red-600'}`}>
{/* FIX: Replaced non-existent XCircleIcon with XIcon for consistency. */}
                                        {newInspection.passed ? <CheckIcon className="w-4 h-4 mr-1"/> : <XIcon className="w-4 h-4 mr-1"/>}
                                        Overall Result: {newInspection.passed ? 'Pass' : 'Fail'}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                                        <Button onClick={handleSaveInspection}>Save Inspection</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Inspection History</h3>
                         <div className="space-y-3">
                            {inspections.length > 0 ? inspections.map(insp => (
                                <div key={insp.id} className="p-3 border rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{new Date(insp.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            <p className="text-xs text-muted-foreground">Inspected by: {insp.inspectorName}</p>
                                        </div>
                                        <div className={`px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1 ${insp.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
{/* FIX: Replaced non-existent XCircleIcon with XIcon for consistency. */}
                                            {insp.passed ? <CheckIcon className="w-3 h-3"/> : <XIcon className="w-3 h-3"/>}
                                            {insp.passed ? 'Pass' : 'Fail'}
                                        </div>
                                    </div>
                                    <p className="text-sm mt-2">{insp.notes}</p>
                                </div>
                            )) : (
                                <p className="text-center text-sm text-muted-foreground py-4">No inspection history found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleInspectionModal;
