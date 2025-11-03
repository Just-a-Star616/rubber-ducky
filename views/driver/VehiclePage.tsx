
import React, { useState, useEffect } from 'react';
import { Driver, Vehicle, DocumentUpdateRequest, VehiclePendingChanges } from '../../types';
import { Button } from '../../components/ui/button';
import { PencilIcon, ClockIcon, UploadIcon, DocumentDownloadIcon } from '../../components/icons/Icon';
import AddVehicleModal from '../../components/driver/AddVehicleModal';
import { mockLicensingCouncils } from '../../lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';

const formatDateForDisplay = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
}

const PendingChip = ({ message }: { message: string }) => (
    <div className="mt-1 flex items-center gap-2 text-xs text-yellow-800 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50 rounded-full px-2.5 py-1">
        <ClockIcon className="w-4 h-4" />
        <span>Pending: <strong>{message}</strong></span>
    </div>
);

const VehicleField = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-1 text-sm text-foreground">{value || 'N/A'}</dd>
    </div>
);

const FormField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-muted-foreground">{label}</label>
        <Input {...props} className="mt-1" />
    </div>
);

const DocumentUploadField: React.FC<{
  label: string;
  onFileChange: (file: File | null) => void;
  fileName?: string;
}> = ({ label, onFileChange, fileName }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    return (
        <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
            <div className="flex items-center justify-center w-full px-6 py-4 border-2 border-border border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <UploadIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
                    <div className="flex text-sm text-muted-foreground">
                        <label htmlFor={`file-${label}`} className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                            <span>Select a file</span>
                            <input id={`file-${label}`} name={`file-${label}`} type="file" className="sr-only" onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setSelectedFile(file);
                                onFileChange(file);
                            }} />
                        </label>
                    </div>
                    <p className="text-xs text-muted-foreground/80">{selectedFile?.name || fileName || 'PDF, PNG, JPG up to 10MB'}</p>
                </div>
            </div>
        </div>
    );
};


interface VehiclePageProps {
    driver: Driver;
    setDriver: (d: Driver) => void;
    vehicles: Vehicle[];
    setVehicles: (updater: (prev: Vehicle[]) => Vehicle[]) => void;
}

const VehiclePage: React.FC<VehiclePageProps> = ({ driver, setDriver, vehicles, setVehicles }) => {
    const currentVehicle = vehicles.find(v => v.id === driver.vehicleRef);
    
    const [isEditing, setIsEditing] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Vehicle>>({});
    const [files, setFiles] = useState<{ [key: string]: File | null }>({});

    useEffect(() => {
        if (currentVehicle) {
            setFormData(currentVehicle);
        }
    }, [currentVehicle]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const handleFileChange = (file: File | null, docType: string) => {
        setFiles(prev => ({ ...prev, [docType]: file }));
    };

    const handleSave = () => {
        if (!currentVehicle) return;

        const newPendingChanges: VehiclePendingChanges = { ...currentVehicle.pendingChanges };

        const docTypes = {
            v5c: 'registrationUpdate',
            plate: 'plateUpdate',
            insurance: 'insuranceUpdate',
            mot: 'motUpdate',
        } as const;

        Object.entries(docTypes).forEach(([fileKey, changeKey]) => {
            const hasNewFile = !!files[fileKey];
            let detailsChanged = false;
            
            const existingUpdate: Partial<DocumentUpdateRequest> = newPendingChanges[changeKey] || {};
            const newUpdate: Partial<DocumentUpdateRequest> = {};

            if (changeKey === 'plateUpdate') {
                if(formData.plateIssuingCouncil !== currentVehicle.plateIssuingCouncil) { detailsChanged = true; newUpdate.issuingCouncil = formData.plateIssuingCouncil; }
                if(formData.plateNumber !== currentVehicle.plateNumber) { detailsChanged = true; newUpdate.number = formData.plateNumber; }
                if(formatDateForInput(formData.plateExpiry) !== formatDateForInput(currentVehicle.plateExpiry)) { detailsChanged = true; newUpdate.expiry = formData.plateExpiry!; }
            }
            if (changeKey === 'insuranceUpdate') {
                if(formData.insuranceCertificateNumber !== currentVehicle.insuranceCertificateNumber) { detailsChanged = true; newUpdate.number = formData.insuranceCertificateNumber; }
                if(formatDateForInput(formData.insuranceExpiry) !== formatDateForInput(currentVehicle.insuranceExpiry)) { detailsChanged = true; newUpdate.expiry = formData.insuranceExpiry!; }
            }
             if (changeKey === 'motUpdate') {
                if(formatDateForInput(formData.motComplianceExpiry) !== formatDateForInput(currentVehicle.motComplianceExpiry)) { detailsChanged = true; newUpdate.expiry = formData.motComplianceExpiry!; }
            }

            if(hasNewFile || detailsChanged) {
                 newPendingChanges[changeKey] = {
                    fileName: files[fileKey]?.name || existingUpdate.fileName || 'Document Updated',
                    expiry: newUpdate.expiry || existingUpdate.expiry || '',
                    number: newUpdate.number || existingUpdate.number,
                    issuingCouncil: newUpdate.issuingCouncil || existingUpdate.issuingCouncil
                 };
            }
        });
        
        if (formatDateForInput(formData.roadTaxExpiry) !== formatDateForInput(currentVehicle.roadTaxExpiry)) {
            newPendingChanges.roadTaxExpiry = formData.roadTaxExpiry;
        }

        setVehicles(prevVehicles => prevVehicles.map(v => 
            v.id === currentVehicle.id ? { ...v, pendingChanges: newPendingChanges } : v
        ));
        
        alert("Your changes have been submitted for approval.");
        setIsEditing(false);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">My Vehicle</h2>
                    <p className="text-sm text-muted-foreground">Manage your assigned vehicle and submit updates.</p>
                </div>
                {!isEditing && currentVehicle && (
                     <Button onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 mr-2"/>Edit Details</Button>
                )}
            </div>

            {driver.pendingNewVehicle && (
                <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/50 dark:border-blue-700">
                    <CardContent className="pt-6 flex items-center space-x-3">
                        <ClockIcon className="w-6 h-6 text-blue-500" />
                        <div>
                            <h3 className="text-base font-semibold text-blue-800 dark:text-blue-200">New Vehicle Submitted for Approval</h3>
                            <p className="text-sm text-blue-600 dark:text-blue-300">
                                Your new vehicle ({driver.pendingNewVehicle.make} {driver.pendingNewVehicle.model}, Reg: {driver.pendingNewVehicle.registration}) is awaiting approval from staff.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!currentVehicle ? (
                <Card><CardContent className="pt-6"><p className="text-center text-muted-foreground">No vehicle is currently assigned to you.</p></CardContent></Card>
            ) : isEditing ? (
                 <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
                    <Card>
                        <CardHeader><CardTitle>Static Vehicle Details</CardTitle></CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                <VehicleField label="Vehicle Ref" value={currentVehicle.id} />
                                <VehicleField label="Make & Model" value={`${currentVehicle.make} ${currentVehicle.model}`} />
                                <VehicleField label="Color" value={currentVehicle.color} />
                                <VehicleField label="Registration" value={currentVehicle.registration} />
                            </dl>
                        </CardContent>
                    </Card>
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Update Documents & Expiry Dates</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <DocumentUploadField label="Registration (V5C) Document" onFileChange={(file) => handleFileChange(file, 'v5c')} />
                            
                            <div className="p-4 border rounded-lg space-y-4">
                                <h4 className="font-semibold">Plate</h4>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Issuing Council</label>
                                    {/* FIX: Removed unsupported 'name' prop from Select component. */}
                                    <Select value={formData.plateIssuingCouncil} onValueChange={(v) => handleSelectChange('plateIssuingCouncil', v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{mockLicensingCouncils.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                                </div>
                                <FormField label="Plate Number" id="plateNumber" name="plateNumber" value={formData.plateNumber || ''} onChange={handleInputChange} />
                                <FormField type="datetime-local" label="Plate Expiry" id="plateExpiry" name="plateExpiry" value={formatDateForInput(formData.plateExpiry)} onChange={handleInputChange} />
                                <DocumentUploadField label="Plate Document" onFileChange={(file) => handleFileChange(file, 'plate')} />
                            </div>

                            <div className="p-4 border rounded-lg space-y-4">
                                <h4 className="font-semibold">Insurance</h4>
                                <FormField label="Certificate Number" id="insuranceCertificateNumber" name="insuranceCertificateNumber" value={formData.insuranceCertificateNumber || ''} onChange={handleInputChange} />
                                <FormField type="datetime-local" label="Insurance Expiry" id="insuranceExpiry" name="insuranceExpiry" value={formatDateForInput(formData.insuranceExpiry)} onChange={handleInputChange} />
                                <DocumentUploadField label="Insurance Certificate" onFileChange={(file) => handleFileChange(file, 'insurance')} />
                            </div>
                            
                            <div className="p-4 border rounded-lg space-y-4">
                                <h4 className="font-semibold">MOT & Road Tax</h4>
                                <FormField type="datetime-local" label="MOT/Compliance Expiry" id="motComplianceExpiry" name="motComplianceExpiry" value={formatDateForInput(formData.motComplianceExpiry)} onChange={handleInputChange} />
                                <DocumentUploadField label="MOT/Compliance Certificate" onFileChange={(file) => handleFileChange(file, 'mot')} />
                                <FormField type="datetime-local" label="Road Tax Expiry" id="roadTaxExpiry" name="roadTaxExpiry" value={formatDateForInput(formData.roadTaxExpiry)} onChange={handleInputChange} />
                            </div>
                        </CardContent>
                         <div className="p-6 flex justify-end gap-x-3">
                            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button type="submit">Submit for Approval</Button>
                        </div>
                    </Card>
                </form>
            ) : (
                <Card>
                    <CardHeader><CardTitle>Current Vehicle Details</CardTitle></CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                            <VehicleField label="Vehicle Ref" value={currentVehicle.id} />
                            <VehicleField label="Make & Model" value={`${currentVehicle.make} ${currentVehicle.model}`} />
                            <VehicleField label="Color" value={currentVehicle.color} />
                            <VehicleField label="Registration" value={<span className="font-mono">{currentVehicle.registration}</span>} />
                            <VehicleField label="Plate Number" value={currentVehicle.plateNumber} />
                            <VehicleField label="Plate Expiry" value={formatDateForDisplay(currentVehicle.plateExpiry)} />
                            {currentVehicle.pendingChanges?.plateUpdate && <div className="sm:col-span-2"><PendingChip message={`Plate details updated`} /></div>}
                            
                            <VehicleField label="Insurance Cert. No." value={currentVehicle.insuranceCertificateNumber} />
                            <VehicleField label="Insurance Expiry" value={formatDateForDisplay(currentVehicle.insuranceExpiry)} />
                            {currentVehicle.pendingChanges?.insuranceUpdate && <div className="sm:col-span-2"><PendingChip message={`Insurance details updated`} /></div>}
                            
                            <VehicleField label="MOT/Compliance Expiry" value={formatDateForDisplay(currentVehicle.motComplianceExpiry)} />
                             {currentVehicle.pendingChanges?.motUpdate && <div className="sm:col-span-2"><PendingChip message={`MOT expiry updated`} /></div>}
                            
                            <VehicleField label="Road Tax Expiry" value={formatDateForDisplay(currentVehicle.roadTaxExpiry)} />
                            {currentVehicle.pendingChanges?.roadTaxExpiry && <div className="sm:col-span-2"><PendingChip message={`Road Tax expiry updated`} /></div>}
                        </dl>
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-end pt-4 border-t border-border">
                <Button onClick={() => setIsAddModalOpen(true)}>Add a New Vehicle</Button>
            </div>

            {currentVehicle && !isEditing && (
                <Card>
                    <CardHeader><CardTitle>Vehicle Documents</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {/* V5C Registration Document */}
                        <div className="border-b pb-4 last:border-b-0 last:pb-0">
                            <h4 className="font-semibold mb-3">V5C Registration Document</h4>
                            {currentVehicle.v5cDocumentUrl ? (
                                <div className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card/75 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-semibold text-foreground">Current Document</p>
                                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded font-medium">✓ Verified</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground truncate">Document verified</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <a href={currentVehicle.v5cDocumentUrl} target="_blank" rel="noopener noreferrer" download className="p-2 rounded-md text-primary hover:bg-primary/10"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></a>
                                            <a href={currentVehicle.v5cDocumentUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md text-primary hover:bg-primary/10"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></a>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 rounded-lg border border-dashed border-border bg-card/25"><p className="text-sm text-muted-foreground">No document uploaded yet</p></div>
                            )}
                        </div>

                        {/* Plate Document */}
                        <div className="border-b pb-4 last:border-b-0 last:pb-0">
                            <h4 className="font-semibold mb-3">Plate Document</h4>
                            {currentVehicle.plateDocumentUrl ? (
                                <div className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card/75 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-semibold text-foreground">Current Document</p>
                                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded font-medium">✓ Verified</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground truncate">Document verified</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <a href={currentVehicle.plateDocumentUrl} target="_blank" rel="noopener noreferrer" download className="p-2 rounded-md text-primary hover:bg-primary/10"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></a>
                                            <a href={currentVehicle.plateDocumentUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md text-primary hover:bg-primary/10"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></a>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 rounded-lg border border-dashed border-border bg-card/25"><p className="text-sm text-muted-foreground">No document uploaded yet</p></div>
                            )}
                        </div>

                        {/* Insurance Document */}
                        <div className="border-b pb-4 last:border-b-0 last:pb-0">
                            <h4 className="font-semibold mb-3">Insurance Certificate</h4>
                            {currentVehicle.insuranceDocumentUrl ? (
                                <div className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card/75 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-semibold text-foreground">Current Document</p>
                                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded font-medium">✓ Verified</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground truncate">Document verified</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <a href={currentVehicle.insuranceDocumentUrl} target="_blank" rel="noopener noreferrer" download className="p-2 rounded-md text-primary hover:bg-primary/10"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></a>
                                            <a href={currentVehicle.insuranceDocumentUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md text-primary hover:bg-primary/10"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></a>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 rounded-lg border border-dashed border-border bg-card/25"><p className="text-sm text-muted-foreground">No document uploaded yet</p></div>
                            )}
                        </div>

                        {/* MOT Compliance Certificate */}
                        <div>
                            <h4 className="font-semibold mb-3">MOT/Compliance Certificate</h4>
                            {currentVehicle.motComplianceCertificateUrl ? (
                                <div className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card/75 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-semibold text-foreground">Current Document</p>
                                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded font-medium">✓ Verified</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground truncate">Document verified</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <a href={currentVehicle.motComplianceCertificateUrl} target="_blank" rel="noopener noreferrer" download className="p-2 rounded-md text-primary hover:bg-primary/10"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></a>
                                            <a href={currentVehicle.motComplianceCertificateUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md text-primary hover:bg-primary/10"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></a>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 rounded-lg border border-dashed border-border bg-card/25"><p className="text-sm text-muted-foreground">No document uploaded yet</p></div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-end pt-4 border-t border-border">
                <Button onClick={() => setIsAddModalOpen(true)}>Add a New Vehicle</Button>
            </div>

            {isAddModalOpen && (
                <AddVehicleModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={(newVehicle) => {
                        setDriver({ ...driver, pendingNewVehicle: newVehicle });
                        setIsAddModalOpen(false);
                        alert('New vehicle submitted for approval.');
                    }}
                />
            )}
        </div>
    );
};

export default VehiclePage;