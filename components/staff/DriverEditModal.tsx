
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Driver, Vehicle } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { XIcon, UploadIcon, LinkIcon, ArchiveIcon, ArrowUturnLeftIcon } from '../icons/Icon';
import { mockLicensingCouncils, mockSiteDetails, mockDriverAttributes, mockVehicles } from '../../lib/mockData';
import { Checkbox } from '../ui/checkbox';

interface DriverEditModalProps {
  driver: Driver;
  isNew: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSave: (driver: Driver) => void;
  onArchive: (driverId: string) => void;
}

const formatDateForDateTimeInput = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
};

const FormField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; isDriverEditable?: boolean }> = ({ label, isDriverEditable, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-muted-foreground">
            <span className="flex items-center">
                {label}
                {isDriverEditable && <span title="Editable by driver" className="ml-1.5 text-muted-foreground/80 font-mono text-xs border rounded-sm px-1">D</span>}
            </span>
        </label>
        <Input id={props.id} {...props} className="mt-1" />
    </div>
);

const SelectField: React.FC<{ label: string; children: React.ReactNode; isDriverEditable?: boolean, onValueChange: (value: string) => void, value: string, id?: string }> = ({ label, isDriverEditable, onValueChange, children, value, id }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-muted-foreground">
             <span className="flex items-center">
                {label}
                {isDriverEditable && <span title="Editable by driver" className="ml-1.5 text-muted-foreground/80 font-mono text-xs border rounded-sm px-1">D</span>}
            </span>
        </label>
        <Select onValueChange={onValueChange} value={value}>
            <SelectTrigger id={id} className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{children}</SelectContent>
        </Select>
    </div>
);


const TextareaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; isDriverEditable?: boolean }> = ({ label, isDriverEditable, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-muted-foreground">
             <span className="flex items-center">
                {label}
                {isDriverEditable && <span title="Editable by driver" className="ml-1.5 text-muted-foreground/80 font-mono text-xs border rounded-sm px-1">D</span>}
            </span>
        </label>
        <Textarea id={props.id} {...props} className="mt-1" />
    </div>
);

const DocumentSection: React.FC<{
    title: string;
    numberName: string;
    expiryName: string;
    numberValue: string | null | undefined;
    expiryValue: string | null | undefined;
    documentUrl?: string;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onExpiryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isDriverEditable?: boolean;
    children?: React.ReactNode;
}> = ({ title, numberName, expiryName, numberValue, expiryValue, documentUrl, onInputChange, onExpiryChange, isDriverEditable, children }) => (
    <div className="md:col-span-2 p-4 border rounded-lg space-y-3 bg-background">
        <h4 className="font-semibold">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField label="Number" name={numberName} value={numberValue || ''} onChange={onInputChange} isDriverEditable={isDriverEditable}/>
             <FormField type="datetime-local" label="Expiry" name={expiryName} value={formatDateForDateTimeInput(expiryValue)} onChange={onExpiryChange} isDriverEditable={isDriverEditable}/>
             {children}
             <div className="md:col-span-2 flex items-center justify-end space-x-2">
                {documentUrl && <Button variant="outline" size="sm" type="button"><LinkIcon className="w-4 h-4 mr-2"/> View Document</Button>}
                <Button variant="outline" size="sm" type="button"><UploadIcon className="w-4 h-4 mr-2"/> Upload New</Button>
            </div>
        </div>
    </div>
);


interface DriverFormProps {
  formData: Partial<Driver>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Driver>>>;
  showVehicleDetails: boolean;
}

export const DriverForm: React.FC<DriverFormProps> = ({ formData, setFormData, showVehicleDetails }) => {
    
    const [vehicleSearchTerm, setVehicleSearchTerm] = useState(formData.vehicleRef || '');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const vehicleInputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setVehicleSearchTerm(formData.vehicleRef || '');
    }, [formData.vehicleRef]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (vehicleInputRef.current && !vehicleInputRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const filteredVehicles = useMemo(() => {
        if (!vehicleSearchTerm) {
            return mockVehicles;
        }
        const lowercasedTerm = vehicleSearchTerm.toLowerCase();
        return mockVehicles.filter(vehicle => 
            vehicle.id.toLowerCase().includes(lowercasedTerm) ||
            vehicle.registration.toLowerCase().includes(lowercasedTerm)
        );
    }, [vehicleSearchTerm]);

    const handleVehicleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setVehicleSearchTerm(value);
        if (value === '') {
            setFormData(prev => ({ ...prev, vehicleRef: '' }));
        }
        if (!showSuggestions) {
            setShowSuggestions(true);
        }
    };

    const handleVehicleSelect = (vehicle: Vehicle) => {
        setVehicleSearchTerm(vehicle.id);
        setFormData(prev => ({ ...prev, vehicleRef: vehicle.id }));
        setShowSuggestions(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parentKey, childKey] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parentKey]: {
                    // @ts-ignore
                    ...(prev[parentKey] || {}),
                    [childKey]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleAttributeChange = (attribute: string) => {
        setFormData(prev => {
            const newAttributes = prev.attributes?.includes(attribute)
                ? prev.attributes.filter(a => a !== attribute)
                : [...(prev.attributes || []), attribute];
            return { ...prev, attributes: newAttributes };
        });
    };
    
    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const valueWithTime = value.includes('T') ? value : `${value}T23:59`;
        const date = new Date(valueWithTime);

        if (name.includes('.')) {
            const [parentKey, childKey] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parentKey]: {
                    // @ts-ignore
                    ...(prev[parentKey] || {}),
                    [childKey]: date.toISOString()
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: date.toISOString() }));
        }
    };

    return (
         <div className="space-y-8">
            <fieldset>
                <legend className="text-lg font-semibold text-foreground md:col-span-2 border-b pb-2 mb-4">Profile & Contact</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 flex flex-col items-center space-y-3">
                        <img src={formData.avatarUrl} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
                        <Button variant="outline" type="button"><UploadIcon className="w-4 h-4 mr-2"/> Upload Photo</Button>
                        <div className="relative w-full" ref={vehicleInputRef}>
                            <FormField
                                id="vehicleRef"
                                name="vehicleRef"
                                label="Assigned Vehicle"
                                value={vehicleSearchTerm}
                                onChange={handleVehicleSearchChange}
                                onFocus={() => setShowSuggestions(true)}
                                autoComplete="off"
                                placeholder="Search Ref or Reg..."
                            />
                            {showSuggestions && filteredVehicles.length > 0 && (
                                <div className="absolute z-20 w-full bg-card border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                                    {filteredVehicles.map(vehicle => (
                                        <div
                                            key={vehicle.id}
                                            className="p-2 hover:bg-muted cursor-pointer text-sm"
                                            onClick={() => handleVehicleSelect(vehicle)}
                                        >
                                            <p className="font-semibold">{vehicle.id} <span className="font-normal font-mono text-xs text-muted-foreground">({vehicle.registration})</span></p>
                                            <p className="text-xs text-muted-foreground">{vehicle.make} {vehicle.model}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField id="firstName" name="firstName" label="First Name" value={formData.firstName || ''} onChange={handleInputChange} isDriverEditable />
                        <FormField id="lastName" name="lastName" label="Last Name" value={formData.lastName || ''} onChange={handleInputChange} isDriverEditable />
                        <FormField id="dateOfBirth" name="dateOfBirth" type="date" label="D.O.B" value={formData.dateOfBirth?.split('T')[0] || ''} onChange={handleInputChange} />
                        <SelectField id="gender" label="Gender" value={formData.gender || ''} onValueChange={(v) => setFormData(p => ({...p, gender: v as any}))} isDriverEditable>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectField>
                        <FormField id="devicePhone" name="devicePhone" label="Device Phone" value={formData.devicePhone || ''} onChange={handleInputChange} isDriverEditable />
                        <FormField id="mobileNumber" name="mobileNumber" label="Mobile Phone" value={formData.mobileNumber || ''} onChange={handleInputChange} isDriverEditable />
                        <FormField id="email" name="email" label="Email Address" type="email" value={formData.email || ''} onChange={handleInputChange} className="md:col-span-2" isDriverEditable />
                        <FormField id="emergencyContactName" name="emergencyContactName" label="Emergency Contact Name" value={formData.emergencyContactName || ''} onChange={handleInputChange} isDriverEditable />
                        <FormField id="emergencyContactNumber" name="emergencyContactNumber" label="Emergency Contact Number" value={formData.emergencyContactNumber || ''} onChange={handleInputChange} isDriverEditable />
                        <TextareaField id="address" name="address" label="Address" value={formData.address || ''} onChange={handleInputChange} rows={3} className="md:col-span-2" isDriverEditable />
                    </div>
                </div>
            </fieldset>
            
            <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <legend className="text-lg font-semibold text-foreground md:col-span-3 border-b pb-2 mb-2">Admin & Scheme</legend>
                    <FormField id="id" name="id" label="Driver Ref" value={formData.id || ''} onChange={handleInputChange} />
                    <FormField id="niNumber" name="niNumber" label="NI Number" value={formData.niNumber || ''} onChange={handleInputChange} />
                    <FormField id="schemeCode" name="schemeCode" label="Scheme Code" type="number" step="0.01" value={formData.schemeCode || ''} onChange={handleInputChange} />
                    <SelectField id="status" label="Status" value={formData.status || ''} onValueChange={(v) => setFormData(p => ({...p, status: v as any}))}>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Archived">Archived</SelectItem>
                </SelectField>
                <div className="md:col-span-3">
                    <SelectField id="siteId" label="Assigned Site" value={formData.siteId || ''} onValueChange={(v) => setFormData(p => ({...p, siteId: v as any}))}>
                        {mockSiteDetails.map(site => <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>)}
                    </SelectField>
                </div>
                <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-muted-foreground">Attributes</label>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 p-3 rounded-lg border bg-background">
                        {mockDriverAttributes.map(attr => (
                            <div key={attr} className="flex items-center space-x-2">
                                <Checkbox id={`attr-${attr}`} checked={formData.attributes?.includes(attr)} onCheckedChange={() => handleAttributeChange(attr)} />
                                <label htmlFor={`attr-${attr}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{attr}</label>
                            </div>
                        ))}
                    </div>
                </div>
            </fieldset>

            <fieldset>
                <legend className="text-lg font-semibold text-foreground md:col-span-2 border-b pb-2 mb-4">Licensing & Documents</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DocumentSection title="Badge" numberName="badgeNumber" expiryName="badgeExpiry" numberValue={formData.badgeNumber} expiryValue={formData.badgeExpiry} onInputChange={handleInputChange} onExpiryChange={handleExpiryChange} documentUrl={formData.badgeDocumentUrl} isDriverEditable>
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectField id="badgeType" label="Badge Type" value={formData.badgeType || ''} onValueChange={(v) => setFormData(p => ({...p, badgeType: v as any}))}>
                                <SelectItem value="Private Hire">Private Hire</SelectItem>
                                <SelectItem value="Hackney Carriage">Hackney Carriage</SelectItem>
                            </SelectField>
                            <SelectField id="badgeIssuingCouncil" label="Badge Issuing Council" value={formData.badgeIssuingCouncil || ''} onValueChange={(v) => setFormData(p => ({...p, badgeIssuingCouncil: v as any}))} isDriverEditable>
                                {mockLicensingCouncils.map(council => <SelectItem key={council} value={council}>{council}</SelectItem>)}
                            </SelectField>
                        </div>
                    </DocumentSection>
                    <DocumentSection title="Driving License" numberName="drivingLicenseNumber" expiryName="drivingLicenseExpiry" numberValue={formData.drivingLicenseNumber} expiryValue={formData.drivingLicenseExpiry} onInputChange={handleInputChange} onExpiryChange={handleExpiryChange} documentUrl={formData.drivingLicenseDocumentUrl} isDriverEditable />
                    <DocumentSection title="School Badge" numberName="schoolBadgeNumber" expiryName="schoolBadgeExpiry" numberValue={formData.schoolBadgeNumber} expiryValue={formData.schoolBadgeExpiry} onInputChange={handleInputChange} onExpiryChange={handleExpiryChange} documentUrl={formData.schoolBadgeDocumentUrl} isDriverEditable />
                </div>
            </fieldset>

            {showVehicleDetails && formData.pendingNewVehicle && (
                <fieldset>
                    <legend className="text-lg font-semibold text-foreground md:col-span-2 border-b pb-2 mb-4">Vehicle Details</legend>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormField label="Vehicle Ref" name="pendingNewVehicle.id" value={formData.pendingNewVehicle.id || ''} onChange={handleInputChange} />
                        <FormField label="Make" name="pendingNewVehicle.make" value={formData.pendingNewVehicle.make || ''} onChange={handleInputChange} />
                        <FormField label="Model" name="pendingNewVehicle.model" value={formData.pendingNewVehicle.model || ''} onChange={handleInputChange} />
                        <FormField label="Registration" name="pendingNewVehicle.registration" value={formData.pendingNewVehicle.registration || ''} onChange={handleInputChange} />
                        <FormField label="Color" name="pendingNewVehicle.color" value={formData.pendingNewVehicle.color || ''} onChange={handleInputChange} />
                        
                        <div className="md:col-span-4 p-4 rounded-lg border bg-background space-y-3">
                           <h4 className="font-semibold">V5C & Plate</h4>
                           <DocumentSection title="V5C" numberName="v5cNumber" expiryName="v5cExpiry" numberValue={null} expiryValue={null} onInputChange={()=>{}} onExpiryChange={()=>{}} documentUrl={formData.pendingNewVehicle.v5cDocumentUrl}/>
                           <DocumentSection title="Plate" numberName="pendingNewVehicle.plateNumber" expiryName="pendingNewVehicle.plateExpiry" numberValue={formData.pendingNewVehicle.plateNumber} expiryValue={formData.pendingNewVehicle.plateExpiry} documentUrl={formData.pendingNewVehicle.plateDocumentUrl} onInputChange={handleInputChange} onExpiryChange={handleExpiryChange}>
                                 <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <SelectField id="pendingNewVehicle.plateType" label="Plate Type" value={formData.pendingNewVehicle.plateType || ''} onValueChange={(v) => setFormData(p => ({ ...p, pendingNewVehicle: { ...p.pendingNewVehicle!, plateType: v as any } }))}>
                                        <SelectItem value="Private Hire">Private Hire</SelectItem>
                                        <SelectItem value="Hackney Carriage">Hackney Carriage</SelectItem>
                                    </SelectField>
                                    <SelectField id="pendingNewVehicle.plateIssuingCouncil" label="Plate Issuing Council" value={formData.pendingNewVehicle.plateIssuingCouncil || ''} onValueChange={(v) => setFormData(p => ({ ...p, pendingNewVehicle: { ...p.pendingNewVehicle!, plateIssuingCouncil: v as any } }))}>
                                        {mockLicensingCouncils.map(council => <SelectItem key={council} value={council}>{council}</SelectItem>)}
                                    </SelectField>
                                </div>
                            </DocumentSection>
                        </div>
                         <div className="md:col-span-4 p-4 rounded-lg border bg-background space-y-3">
                           <h4 className="font-semibold">Insurance, MOT & Road Tax</h4>
                           <DocumentSection title="Insurance" numberName="pendingNewVehicle.insuranceCertificateNumber" expiryName="pendingNewVehicle.insuranceExpiry" numberValue={formData.pendingNewVehicle.insuranceCertificateNumber} expiryValue={formData.pendingNewVehicle.insuranceExpiry} documentUrl={formData.pendingNewVehicle.insuranceDocumentUrl} onInputChange={handleInputChange} onExpiryChange={handleExpiryChange}/>
                           <DocumentSection title="MOT" numberName="motNumber" expiryName="pendingNewVehicle.motComplianceExpiry" numberValue={null} expiryValue={formData.pendingNewVehicle.motComplianceExpiry} documentUrl={formData.pendingNewVehicle.motComplianceCertificateUrl} onInputChange={()=>{}} onExpiryChange={handleExpiryChange}/>
                           <FormField type="datetime-local" label="Road Tax Expiry" name="pendingNewVehicle.roadTaxExpiry" value={formatDateForDateTimeInput(formData.pendingNewVehicle.roadTaxExpiry)} onChange={handleExpiryChange} />
                        </div>
                    </div>
                </fieldset>
            )}
        </div>
    );
};


const DriverEditModal: React.FC<DriverEditModalProps> = ({ driver, isNew, isOpen, onClose, onSave, onArchive }) => {
  const [formData, setFormData] = useState<Driver>(driver);
  const [showVehicleDetails, setShowVehicleDetails] = useState(!!driver.pendingNewVehicle);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    setFormData(driver);
    setShowVehicleDetails(!!driver.pendingNewVehicle);
    if(isOpen) {
        document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [driver, isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleToggleVehicleDetails = () => {
    if (!showVehicleDetails && !formData.pendingNewVehicle) {
        setFormData(currentData => ({
           ...currentData,
           pendingNewVehicle: {
             id: `V_NEW_${Date.now()}`,
             status: 'Active',
             registration: '', make: '', model: '', color: '',
             firstRegistrationDate: new Date().toISOString().split('T')[0],
             plateType: 'Private Hire',
             plateIssuingCouncil: mockLicensingCouncils[0],
             plateNumber: '', plateExpiry: '', insuranceCertificateNumber: '', insuranceExpiry: '',
             motComplianceExpiry: '', roadTaxExpiry: '', attributes: [],
             ownershipType: 'Private',
             linkedDriverIds: [formData.id!],
             siteId: formData.siteId!,
         }
       }));
    }
    setShowVehicleDetails(prev => !prev);
  };

  const isArchived = formData.status === 'Archived';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="relative bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="sticky top-0 bg-card px-6 py-4 border-b border-border flex justify-between items-center z-10">
          <h2 className="text-xl font-bold">{isNew ? 'Add New Driver' : `Edit Driver #${driver.id}`}</h2>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}><XIcon className="w-6 h-6" /></Button>
        </header>
        
        <form className="flex-grow overflow-y-auto" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
            <div className="p-6">
                <DriverForm
                    formData={formData}
                    setFormData={setFormData as any}
                    showVehicleDetails={showVehicleDetails}
                />
                <div className="mt-8 pt-6 border-t">
                    <Button type="button" variant="outline" onClick={handleToggleVehicleDetails}>
                        {showVehicleDetails ? 'Hide Vehicle Details' : 'Add/Update Vehicle Details'}
                    </Button>
                </div>
            </div>

            <footer className="sticky bottom-0 bg-card/80 backdrop-blur-sm p-4 border-t border-border flex justify-between items-center">
                {!isNew ? (
                    <Button 
                        type="button" 
                        onClick={() => onArchive(formData.id)} 
                        variant={isArchived ? 'outline' : 'destructive'} 
                    >
                        <div className="flex items-center">
                            {isArchived ? <ArrowUturnLeftIcon className="w-4 h-4 mr-2" /> : <ArchiveIcon className="w-4 h-4 mr-2" />}
                            {isArchived ? 'Restore Driver' : 'Archive Driver'}
                        </div>
                    </Button>
                ) : (<div></div>) /* Placeholder for alignment */ }
                <div className="space-x-3">
                    <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </footer>
        </form>
      </div>
    </div>
  );
};

export default DriverEditModal;
