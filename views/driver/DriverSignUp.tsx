

import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { DriverApplication } from '../../types';
import { mockLicensingCouncils } from '../../lib/mockData';
import { ArrowUturnLeftIcon, UploadIcon } from '../../components/icons/Icon';

interface DriverSignUpProps {
    onApplicationSubmit: (application: Omit<DriverApplication, 'id' | 'applicationDate' | 'notes' | 'status' | 'siteId'>) => Promise<void>;
    onBackToLogin: () => void;
}

const DocumentUploadField = ({ label, onFileChange }: { label: string, onFileChange: (fileName: string) => void }) => {
  const [fileName, setFileName] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      onFileChange(file.name);
    }
  };

  return (
    <div className="p-3 border rounded-lg bg-background text-sm">
      <div className="flex justify-between items-center">
        <span>{label}</span>
        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <UploadIcon className="w-4 h-4 mr-2" /> Upload
        </Button>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
      </div>
      {fileName && <p className="text-xs text-primary mt-1">Selected: {fileName}</p>}
    </div>
  );
};

const DriverSignUp: React.FC<DriverSignUpProps> = ({ onApplicationSubmit, onBackToLogin }) => {
    const [isLicensed, setIsLicensed] = useState(false);
    const [formData, setFormData] = useState<Partial<DriverApplication>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    
    const handleFileChange = (fieldName: keyof DriverApplication, fileName: string) => {
        setFormData(prev => ({ ...prev, [fieldName]: fileName }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const applicationData = {
                firstName: formData.firstName || '',
                lastName: formData.lastName || '',
                email: formData.email || '',
                mobileNumber: formData.mobileNumber || '',
                area: formData.area || '',
                isLicensed: isLicensed,
                ...formData
            };
            await onApplicationSubmit(applicationData);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Driver Application</CardTitle>
                    <CardDescription>Join our team by filling out the form below. We'll be in touch shortly.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <fieldset className="space-y-4">
                             <legend className="text-lg font-semibold text-foreground border-b pb-2">Your Details</legend>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input name="firstName" placeholder="First Name" required onChange={handleInputChange} />
                                <Input name="lastName" placeholder="Last Name" required onChange={handleInputChange} />
                                <Input name="email" type="email" placeholder="Email Address" required onChange={handleInputChange} />
                                <Input name="mobileNumber" type="tel" placeholder="Mobile Number" required onChange={handleInputChange} />
                                <Input name="area" placeholder="Area / City of Work" required className="sm:col-span-2" onChange={handleInputChange} />
                             </div>
                        </fieldset>

                        <div className="flex items-center space-x-2 p-4 border rounded-lg">
                            <Checkbox id="isLicensed" checked={isLicensed} onCheckedChange={(checked) => setIsLicensed(!!checked)} />
                            <label htmlFor="isLicensed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                I am an existing licensed Taxi or Private Hire driver.
                            </label>
                        </div>
                        
                        {isLicensed && (
                            <fieldset className="space-y-4 animate-in fade-in-0 duration-500">
                                <legend className="text-lg font-semibold text-foreground border-b pb-2">License & Vehicle Details (Optional)</legend>
                                <p className="text-xs text-muted-foreground -mt-2">Please provide as much information as you can. You can add or update these details later.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input name="badgeNumber" placeholder="Badge Number" onChange={handleInputChange} />
                                    <Input name="badgeExpiry" type="date" onChange={handleInputChange} />
                                    <Select value={formData.badgeIssuingCouncil} onValueChange={(v) => setFormData(p => ({...p, badgeIssuingCouncil: v}))}>
                                        <SelectTrigger><SelectValue placeholder="Issuing Council" /></SelectTrigger>
                                        <SelectContent>{mockLicensingCouncils.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <DocumentUploadField label="Badge Document" onFileChange={(name) => handleFileChange('badgeDocumentName', name)} />
                                    
                                    <Input name="drivingLicenseNumber" placeholder="Driving License Number" onChange={handleInputChange} />
                                    <Input name="drivingLicenseExpiry" type="date" onChange={handleInputChange} />
                                     <div className="sm:col-span-2"><DocumentUploadField label="Driving License Document" onFileChange={(name) => handleFileChange('licenseDocumentName', name)} /></div>

                                    <Input name="vehicleMake" placeholder="Vehicle Make" onChange={handleInputChange} />
                                    <Input name="vehicleModel" placeholder="Vehicle Model" onChange={handleInputChange} />
                                    <Input name="vehicleRegistration" placeholder="Vehicle Registration" onChange={handleInputChange} />
                                    <DocumentUploadField label="V5C (Logbook)" onFileChange={(name) => handleFileChange('v5cDocumentName', name)} />
                                    <div className="sm:col-span-2"><DocumentUploadField label="Insurance Document" onFileChange={(name) => handleFileChange('insuranceDocumentName', name)} /></div>
                                </div>
                            </fieldset>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                         <Button type="button" variant="ghost" onClick={onBackToLogin} disabled={isSubmitting}>
                            <ArrowUturnLeftIcon className="mr-2 h-4 w-4" />
                            Back to Login
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default DriverSignUp;