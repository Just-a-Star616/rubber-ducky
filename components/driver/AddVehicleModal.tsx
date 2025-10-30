
import React, { useState, useCallback, useEffect } from 'react';
import { Vehicle } from '../../types';
import { Button } from '../ui/button';
import { XIcon } from '../icons/Icon';
import { mockLicensingCouncils, mockVehicleAttributes, mockSiteDetails } from '../../lib/mockData';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';

interface AddVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (vehicle: Vehicle) => void;
}

const formatDateForDateTimeInput = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
};

const FormField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div><label htmlFor={props.id} className="block text-sm font-medium text-muted-foreground">{label}</label><Input {...props} className="mt-1" /></div>
);

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Vehicle>>({
        status: 'Inactive', // New vehicles are inactive until approved
        attributes: [],
        ownershipType: 'Private',
        plateType: 'Private Hire',
        plateIssuingCouncil: mockLicensingCouncils[0],
        firstRegistrationDate: new Date().toISOString().split('T')[0],
        siteId: mockSiteDetails[0].id,
    });

    const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);
    useEffect(() => { if (isOpen) document.addEventListener('keydown', handleKeyDown); return () => document.removeEventListener('keydown', handleKeyDown); }, [isOpen, handleKeyDown]);
    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const valueWithTime = value.includes('T') ? value : `${value}T23:59`;
        const date = new Date(valueWithTime);
        setFormData(prev => ({...prev, [name]: date.toISOString() }));
    }

    const handleAttributeChange = (attribute: string) => {
        setFormData(prev => {
            const newAttributes = prev.attributes?.includes(attribute) ? prev.attributes.filter(a => a !== attribute) : [...(prev.attributes || []), attribute];
            return { ...prev, attributes: newAttributes };
        });
    }

    const handleSubmit = () => {
        // Basic validation
        if (!formData.registration || !formData.make || !formData.model) {
            alert('Please fill in Registration, Make, and Model.');
            return;
        }
        // In a real app, you would also validate document uploads
        const newVehicle: Vehicle = {
            id: 'PENDING', // Staff will assign a real ID on approval
            linkedDriverIds: [], // Staff will link on approval
            ...formData,
        } as Vehicle;
        onSave(newVehicle);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Add New Vehicle</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8"><XIcon className="w-5 h-5" /></Button>
                </CardHeader>
                <form className="flex-grow overflow-y-auto" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <CardContent className="space-y-6">
                        <section>
                            <h3 className="text-lg font-medium text-foreground border-b pb-2 mb-4">Vehicle Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField id="registration" name="registration" label="Registration Number" value={formData.registration || ''} onChange={handleInputChange} required />
                                <FormField id="make" name="make" label="Make" value={formData.make || ''} onChange={handleInputChange} required />
                                <FormField id="model" name="model" label="Model" value={formData.model || ''} onChange={handleInputChange} required />
                                <FormField id="color" name="color" label="Color" value={formData.color || ''} onChange={handleInputChange} />
                                <FormField type="date" id="firstRegistrationDate" name="firstRegistrationDate" label="First Registration Date" value={formData.firstRegistrationDate?.split('T')[0] || ''} onChange={handleInputChange} />
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Ownership</label>
                                    <Select value={formData.ownershipType} onValueChange={(v) => handleSelectChange('ownershipType', v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Private">Private</SelectItem><SelectItem value="Supplier">Supplier</SelectItem></SelectContent></Select>
                                </div>
                                 <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-muted-foreground">Site / Operating Area</label>
                                    <Select value={formData.siteId} onValueChange={(v) => handleSelectChange('siteId', v as string)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{mockSiteDetails.map(site => <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>)}</SelectContent></Select>
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-muted-foreground">Attributes</label>
                                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                        {mockVehicleAttributes.map(attr => (<div key={attr} className="flex items-center space-x-2"><Checkbox id={`attr-${attr}`} checked={formData.attributes?.includes(attr)} onCheckedChange={() => handleAttributeChange(attr)} /> <label htmlFor={`attr-${attr}`} className="text-sm font-medium leading-none">{attr}</label></div>))}
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section>
                            <h3 className="text-lg font-medium text-foreground border-b pb-2 mb-4">Documents & Licensing</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4 p-4 border rounded-lg">
                                    <h4 className="font-semibold">V5C, Plate & MOT</h4>
                                    <FormField type="file" id="v5cDocumentUrl" name="v5cDocumentUrl" label="V5C (Logbook) Document" />
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground">Plate Type</label>
                                        <Select value={formData.plateType} onValueChange={(v) => handleSelectChange('plateType', v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Private Hire">Private Hire</SelectItem><SelectItem value="Hackney Carriage">Hackney Carriage</SelectItem></SelectContent></Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground">Plate Issuing Council</label>
                                        <Select value={formData.plateIssuingCouncil} onValueChange={(v) => handleSelectChange('plateIssuingCouncil', v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{mockLicensingCouncils.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                                    </div>
                                    <FormField id="plateNumber" name="plateNumber" label="Plate Number" value={formData.plateNumber || ''} onChange={handleInputChange} />
                                    <FormField type="datetime-local" id="plateExpiry" name="plateExpiry" label="Plate Expiry" value={formatDateForDateTimeInput(formData.plateExpiry)} onChange={handleExpiryChange} />
                                    <FormField type="file" id="plateDocumentUrl" name="plateDocumentUrl" label="Plate Document" />
                                    <FormField type="datetime-local" id="motComplianceExpiry" name="motComplianceExpiry" label="MOT / Compliance Expiry" value={formatDateForDateTimeInput(formData.motComplianceExpiry)} onChange={handleExpiryChange} />
                                    <FormField type="file" id="motComplianceCertificateUrl" name="motComplianceCertificateUrl" label="MOT / Compliance Certificate" />
                                </div>
                                <div className="space-y-4 p-4 border rounded-lg">
                                    <h4 className="font-semibold">Insurance & Road Tax</h4>
                                    <FormField id="insuranceCertificateNumber" name="insuranceCertificateNumber" label="Insurance Certificate No." value={formData.insuranceCertificateNumber || ''} onChange={handleInputChange} />
                                    <FormField type="datetime-local" id="insuranceExpiry" name="insuranceExpiry" label="Insurance Expiry" value={formatDateForDateTimeInput(formData.insuranceExpiry)} onChange={handleExpiryChange} />
                                    <FormField type="file" id="insuranceDocumentUrl" name="insuranceDocumentUrl" label="Insurance Certificate" />
                                    <hr />
                                    <FormField type="datetime-local" id="roadTaxExpiry" name="roadTaxExpiry" label="Road Tax Expiry" value={formatDateForDateTimeInput(formData.roadTaxExpiry)} onChange={handleExpiryChange} />
                                </div>
                            </div>
                        </section>
                    </CardContent>
                    <CardFooter className="flex justify-end items-center space-x-3">
                        <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                        <Button type="submit">Submit for Approval</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default AddVehicleModal;
