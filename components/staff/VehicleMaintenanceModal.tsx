import React, { useState, useCallback, useEffect } from 'react';
import { Vehicle, VehicleMaintenance } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { XIcon, PlusCircleIcon, UploadIcon, LinkIcon } from '../icons/Icon';
import { Card, CardContent } from '../ui/card';

interface VehicleMaintenanceModalProps {
    vehicle: Vehicle;
    isOpen: boolean;
    onClose: () => void;
    onSave: (vehicle: Vehicle) => void;
}

const VehicleMaintenanceModal: React.FC<VehicleMaintenanceModalProps> = ({ vehicle, isOpen, onClose, onSave }) => {
    const [maintenance, setMaintenance] = useState<VehicleMaintenance[]>(vehicle.maintenance || []);
    const [isAdding, setIsAdding] = useState(false);
    const [newRecord, setNewRecord] = useState<Partial<VehicleMaintenance>>({
        garage: '',
        description: '',
        cost: 0,
    });

    const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);
    useEffect(() => { if (isOpen) document.addEventListener('keydown', handleKeyDown); return () => document.removeEventListener('keydown', handleKeyDown); }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewRecord(prev => ({...prev, [name]: value}));
    };
    
    const handleSaveRecord = () => {
        if (!newRecord.garage || !newRecord.description || !newRecord.cost) {
            alert('Please fill all fields.');
            return;
        }
        const recordToSave: VehicleMaintenance = {
            ...newRecord,
            id: `MAINT${Date.now()}`,
            date: new Date().toISOString(),
        } as VehicleMaintenance;
        
        const updatedMaintenance = [recordToSave, ...maintenance];
        setMaintenance(updatedMaintenance);
        onSave({ ...vehicle, maintenance: updatedMaintenance });
        setIsAdding(false);
        setNewRecord({ garage: '', description: '', cost: 0 });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="relative bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="sticky top-0 bg-card px-6 py-4 border-b border-border flex justify-between items-center z-10">
                     <div>
                        <h2 className="text-xl font-bold">Vehicle Maintenance Log</h2>
                        <p className="text-sm text-muted-foreground">{vehicle.registration} - {vehicle.make} {vehicle.model}</p>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={onClose}><XIcon className="w-6 h-6" /></Button>
                </header>
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {!isAdding && (
                        <div className="flex justify-end">
                            <Button onClick={() => setIsAdding(true)}><PlusCircleIcon className="w-4 h-4 mr-2"/> Add New Record</Button>
                        </div>
                    )}
                    
                    {isAdding && (
                         <Card>
                            <CardContent className="pt-6 space-y-4">
                                <h3 className="font-semibold">New Maintenance Record</h3>
                                <Input placeholder="Garage / Supplier Name" name="garage" value={newRecord.garage} onChange={handleInputChange} />
                                <Textarea placeholder="Description of work" name="description" value={newRecord.description} onChange={handleInputChange} />
                                <Input type="number" step="0.01" placeholder="Cost (£)" name="cost" value={newRecord.cost || ''} onChange={handleInputChange} />
                                <Button variant="outline" className="w-full"><UploadIcon className="w-4 h-4 mr-2"/> Upload Invoice/Receipt</Button>
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                                    <Button onClick={handleSaveRecord}>Save Record</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Maintenance History</h3>
                        <div className="space-y-3">
                            {maintenance.length > 0 ? maintenance.map(maint => (
                                <div key={maint.id} className="p-3 border rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{maint.garage}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(maint.date).toLocaleDateString('en-GB')}</p>
                                        </div>
                                        <p className="font-semibold text-lg">£{maint.cost.toFixed(2)}</p>
                                    </div>
                                    <p className="text-sm mt-2">{maint.description}</p>
                                    {maint.invoiceUrl && <a href={maint.invoiceUrl} className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"><LinkIcon className="w-4 h-4"/> View Invoice</a>}
                                </div>
                            )) : (
                                <p className="text-center text-sm text-muted-foreground py-4">No maintenance history found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleMaintenanceModal;