import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Vehicle } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { XIcon, UploadIcon, LinkIcon, ArchiveIcon, ArrowUturnLeftIcon } from '../icons/Icon';
import { mockLicensingCouncils, mockVehicleAttributes, mockSiteDetails } from '../../lib/mockData';
import DocumentViewerModal from './DocumentViewerModal';

interface VehicleEditModalProps {
  vehicle: Vehicle;
  isNew: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void;
  onArchive: (vehicleId: string) => void;
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

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode; isDriverEditable?: boolean, onValueChange: (value: string) => void }> = ({ label, isDriverEditable, onValueChange, children, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-muted-foreground">
             <span className="flex items-center">
                {label}
                {isDriverEditable && <span title="Editable by driver" className="ml-1.5 text-muted-foreground/80 font-mono text-xs border rounded-sm px-1">D</span>}
            </span>
        </label>
        <Select onValueChange={onValueChange} value={props.value as string}>
            <SelectTrigger id={props.id} className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{children}</SelectContent>
        </Select>
    </div>
);

const DocumentUploadField: React.FC<{
  label: string;
  documentUrl?: string;
  onFileSelect: (file: File | null) => void;
  isDriverEditable?: boolean;
  onViewDocument?: (url: string, name: string) => void;
}> = ({ label, documentUrl, onFileSelect, isDriverEditable, onViewDocument }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    onFileSelect(file);
  };

  return (
    <div className="space-y-2">
        <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-muted-foreground">
                <span className="flex items-center">
                    {label}
                    {isDriverEditable && <span title="Editable by driver" className="ml-1.5 text-muted-foreground/80 font-mono text-xs border rounded-sm px-1">D</span>}
                </span>
            </label>
            <div className="flex items-center space-x-2 flex-shrink-0">
                {documentUrl && <Button type="button" variant="outline" size="sm" onClick={() => onViewDocument?.(documentUrl, label)}><LinkIcon className="w-4 h-4 mr-2"/> View Current</Button>}
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><UploadIcon className="w-4 h-4 mr-2"/> Upload New</Button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </div>
        </div>
        {selectedFile && <p className="text-xs text-primary">Selected for upload: {selectedFile.name}</p>}
    </div>
  );
};

const VehicleEditModal: React.FC<VehicleEditModalProps> = ({ vehicle, isNew, isOpen, onClose, onSave, onArchive }) => {
  const [formData, setFormData] = useState<Vehicle>(vehicle);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({});
  const [documentViewer, setDocumentViewer] = useState<{ isOpen: boolean; url: string; name: string }>({ 
    isOpen: false, 
    url: '', 
    name: '' 
  });

  const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);

  useEffect(() => {
    setFormData(vehicle);
    setUploadedFiles({});
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [vehicle, isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAttributeChange = (attribute: string) => {
    setFormData(prev => {
        const newAttributes = prev.attributes.includes(attribute)
            ? prev.attributes.filter(a => a !== attribute)
            : [...prev.attributes, attribute];
        return { ...prev, attributes: newAttributes };
    });
  }
  
  const handleFileSelect = (docType: string, file: File | null) => {
    setUploadedFiles(prev => ({ ...prev, [docType]: file }));
  };

  const handleViewDocument = (url: string, name: string) => {
    setDocumentViewer({ isOpen: true, url, name });
  };

  const handleCloseDocumentViewer = () => {
    setDocumentViewer({ isOpen: false, url: '', name: '' });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const valueWithTime = value.includes('T') ? value : `${value}T23:59`;
      const date = new Date(valueWithTime);
      setFormData(prev => ({...prev, [name]: date.toISOString() }));
  }
  
  const isArchived = formData.status === 'Archived';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="relative bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="sticky top-0 bg-card px-6 py-4 border-b border-border flex justify-between items-center z-10">
          <h2 className="text-xl font-bold">{isNew ? 'Add New Vehicle' : `Edit Vehicle #${vehicle.id}`}</h2>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}><XIcon className="w-6 h-6" /></Button>
        </header>
        
        <form className="flex-grow overflow-y-auto" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
            <div className="p-6 space-y-8">
                <fieldset>
                    <legend className="text-lg font-semibold text-foreground md:col-span-4 border-b pb-2 mb-4">Vehicle Details</legend>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormField id="id" name="id" label="Vehicle Ref" value={formData.id} onChange={handleInputChange} />
                        <FormField id="make" name="make" label="Make" value={formData.make} onChange={handleInputChange} />
                        <FormField id="model" name="model" label="Model" value={formData.model} onChange={handleInputChange} />
                        <FormField id="color" name="color" label="Color" value={formData.color} onChange={handleInputChange} />
                        <FormField type="date" id="firstRegistrationDate" name="firstRegistrationDate" label="First Registration Date" value={formData.firstRegistrationDate.split('T')[0]} onChange={handleInputChange} className="md:col-span-2" />
                        <SelectField id="ownershipType" name="ownershipType" label="Vehicle Type Tag" value={formData.ownershipType} onValueChange={(v) => setFormData(p => ({...p, ownershipType: v as any}))} className="md:col-span-2">
                            <SelectItem value="Company">Company</SelectItem>
                            <SelectItem value="Private">Private</SelectItem>
                            <SelectItem value="Supplier">Supplier</SelectItem>
                        </SelectField>
                        <SelectField id="siteId" name="siteId" label="Assigned Site" value={formData.siteId} onValueChange={(v) => setFormData(p => ({...p, siteId: v as any}))} className="md:col-span-2">
                            {mockSiteDetails.map(site => <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>)}
                        </SelectField>
                         <div className="md:col-span-4">
                             <label className="block text-sm font-medium text-muted-foreground">Attributes</label>
                             <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
                                 {mockVehicleAttributes.map(attr => (
                                     <div key={attr} className="flex items-center space-x-2">
                                         <Checkbox id={`attr-${attr}`} checked={formData.attributes.includes(attr)} onCheckedChange={() => handleAttributeChange(attr)} />
                                         <label htmlFor={`attr-${attr}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{attr}</label>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    </div>
                </fieldset>
                
                <fieldset>
                    <legend className="text-lg font-semibold text-foreground md:col-span-2 border-b pb-2 mb-4">Licensing & Documents</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 rounded-lg border space-y-3">
                           <h4 className="font-semibold">V5C (Registration)</h4>
                           <FormField id="registration" name="registration" label="Registration Number" value={formData.registration} onChange={handleInputChange} isDriverEditable />
                           <DocumentUploadField label="V5C Document" documentUrl={formData.v5cDocumentUrl} onFileSelect={(file) => handleFileSelect('v5c', file)} isDriverEditable onViewDocument={handleViewDocument} />
                        </div>
                        <div className="p-4 rounded-lg border space-y-3">
                           <h4 className="font-semibold">Plate</h4>
                           <SelectField id="plateType" name="plateType" label="Plate Type" value={formData.plateType} onValueChange={(v) => setFormData(p => ({...p, plateType: v as any}))}>
                               <SelectItem value="Private Hire">Private Hire</SelectItem>
                               <SelectItem value="Hackney Carriage">Hackney Carriage</SelectItem>
                           </SelectField>
                           <SelectField id="plateIssuingCouncil" name="plateIssuingCouncil" label="Plate Issuing Council" value={formData.plateIssuingCouncil} onValueChange={(v) => setFormData(p => ({...p, plateIssuingCouncil: v as any}))} isDriverEditable>
                                {mockLicensingCouncils.map(council => <SelectItem key={council} value={council}>{council}</SelectItem>)}
                           </SelectField>
                           <FormField id="plateNumber" name="plateNumber" label="Plate Number" value={formData.plateNumber} onChange={handleInputChange} isDriverEditable/>
                           <FormField type="datetime-local" id="plateExpiry" name="plateExpiry" label="Plate Expiry" value={formatDateForDateTimeInput(formData.plateExpiry)} onChange={handleExpiryChange} isDriverEditable/>
                           <DocumentUploadField label="Plate Document" documentUrl={formData.plateDocumentUrl} onFileSelect={(file) => handleFileSelect('plate', file)} isDriverEditable onViewDocument={handleViewDocument} />
                        </div>
                        <div className="p-4 rounded-lg border space-y-3">
                           <h4 className="font-semibold">Insurance</h4>
                           <FormField id="insuranceCertificateNumber" name="insuranceCertificateNumber" label="Insurance Certificate No." value={formData.insuranceCertificateNumber} onChange={handleInputChange} isDriverEditable/>
                           <FormField type="datetime-local" id="insuranceExpiry" name="insuranceExpiry" label="Insurance Expiry" value={formatDateForDateTimeInput(formData.insuranceExpiry)} onChange={handleExpiryChange} isDriverEditable/>
                           <DocumentUploadField label="Insurance Certificate" documentUrl={formData.insuranceDocumentUrl} onFileSelect={(file) => handleFileSelect('insurance', file)} isDriverEditable onViewDocument={handleViewDocument} />
                        </div>
                        <div className="p-4 rounded-lg border space-y-3">
                           <h4 className="font-semibold">MOT & Road Tax</h4>
                           <FormField type="datetime-local" id="motComplianceExpiry" name="motComplianceExpiry" label="MOT / Compliance Expiry" value={formatDateForDateTimeInput(formData.motComplianceExpiry)} onChange={handleExpiryChange} isDriverEditable/>
                           <DocumentUploadField label="MOT / Compliance Certificate" documentUrl={formData.motComplianceCertificateUrl} onFileSelect={(file) => handleFileSelect('mot', file)} isDriverEditable onViewDocument={handleViewDocument} />
                           <hr className="border-border"/>
                           <FormField type="datetime-local" id="roadTaxExpiry" name="roadTaxExpiry" label="Road Tax Expiry" value={formatDateForDateTimeInput(formData.roadTaxExpiry)} onChange={handleExpiryChange} isDriverEditable/>
                        </div>
                    </div>
                </fieldset>
            </div>

            <footer className="sticky bottom-0 bg-card/80 backdrop-blur-sm p-4 border-t border-border flex justify-between items-center">
                <Button 
                    type="button" 
                    onClick={() => onArchive(formData.id)} 
                    variant={isArchived ? 'outline' : 'destructive'} 
                    disabled={isNew}
                >
                    <div className="flex items-center">
                        {isArchived ? <ArrowUturnLeftIcon className="w-4 h-4 mr-2" /> : <ArchiveIcon className="w-4 h-4 mr-2" />}
                        {isArchived ? 'Restore Vehicle' : 'Archive Vehicle'}
                    </div>
                </Button>
                <div className="space-x-3">
                    <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </footer>
        </form>
        <DocumentViewerModal
          isOpen={documentViewer.isOpen}
          onClose={handleCloseDocumentViewer}
          documentUrl={documentViewer.url}
          documentName={documentViewer.name}
        />
      </div>
    </div>
  );
};

export default VehicleEditModal;