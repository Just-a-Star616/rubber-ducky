/**
 * Enhanced Driver Sign Up with Google Integration
 * Uploads documents to Google Drive and logs application to Google Sheets
 */

import React, { useState, useRef, FC, ChangeEvent, FormEvent } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { DriverApplication } from '../../types';
import { mockLicensingCouncils } from '../../lib/mockData';
import { ArrowUturnLeftIcon, UploadIcon } from '../../components/icons/Icon';
import { uploadDocumentToDrive, logApplicationToSheet, notifyWorkspaceGroup, getGoogleConfig } from '../../lib/googleIntegration';

interface EnhancedDriverSignUpProps {
  onApplicationSubmit: (application: Omit<DriverApplication, 'id' | 'applicationDate' | 'notes' | 'status' | 'siteId'>, fileUrls?: Record<string, string>) => void;
  onBackToLogin: () => void;
  googleAccessToken?: string;
}

interface UploadProgress {
  fileName: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
}

const DocumentUploadField = ({
  label,
  onFileChange,
  onUploadStart,
  onUploadComplete,
  documentKey,
}: {
  label: string;
  onFileChange: (fileName: string, file: File) => void;
  onUploadStart?: () => void;
  onUploadComplete?: (success: boolean) => void;
  documentKey: string;
}) => {
  const [fileName, setFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setUploadStatus('idle');
      onFileChange(file.name, file);
    }
  };

  return (
    <div className="p-3 border rounded-lg bg-background text-sm">
      <div className="flex justify-between items-center">
        <span>{label}</span>
        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <UploadIcon className="w-4 h-4 mr-2" />
          {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload'}
        </Button>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
      </div>
      <div className="flex items-center justify-between mt-2">
        {fileName && <p className="text-xs text-primary">{fileName}</p>}
        {uploadStatus === 'uploading' && <span className="text-xs text-muted-foreground">Uploading...</span>}
        {uploadStatus === 'success' && <span className="text-xs text-green-600">✓ Uploaded</span>}
        {uploadStatus === 'error' && <span className="text-xs text-red-600">✗ Failed</span>}
      </div>
    </div>
  );
};

const EnhancedDriverSignUp: FC<EnhancedDriverSignUpProps> = ({
  onApplicationSubmit,
  onBackToLogin,
  googleAccessToken,
}) => {
  const [isLicensed, setIsLicensed] = useState(false);
  const [formData, setFormData] = useState<Partial<DriverApplication>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (fieldName: string, fileName: string, file: File) => {
    setFormData((prev) => ({ ...prev, [fieldName]: fileName }));
    setUploadedFiles((prev) => ({ ...prev, [fieldName]: file }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitStatus('idle');

    try {
      const applicationData = {
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        email: formData.email || '',
        mobileNumber: formData.mobileNumber || '',
        area: formData.area || '',
        isLicensed: isLicensed,
        ...formData,
      };

      // Upload files to Google Drive if token is available
      let fileUrls: Record<string, string> = {};
      const googleConfig = getGoogleConfig();

      if (googleAccessToken && googleConfig.driveFolderId) {
        for (const [key, file] of Object.entries(uploadedFiles)) {
          try {
            const fileId = await uploadDocumentToDrive(
              file as File,
              googleConfig.driveFolderId,
              googleAccessToken
            );
            if (fileId) {
              fileUrls[key] = `https://drive.google.com/file/d/${fileId}/view`;
              console.log(`${key} uploaded successfully`);
            }
          } catch (error) {
            console.error(`Failed to upload ${key}:`, error);
          }
        }
      }

      // Log to Google Sheets if configured
      if (googleAccessToken && googleConfig.sheetsId) {
        const fullData = {
          ...applicationData,
          id: `APP-${Date.now()}`,
          applicationDate: new Date().toISOString(),
          ...fileUrls,
        };

        try {
          await logApplicationToSheet(fullData, googleAccessToken, googleConfig.sheetsId);
          console.log('Application logged to Google Sheets');
        } catch (error) {
          console.error('Failed to log application to Google Sheets:', error);
        }
      }

      // Send notification to Google Workspace group
      if (googleConfig.workspaceGroupEmail) {
        try {
          await notifyWorkspaceGroup(
            googleConfig.workspaceGroupEmail,
            {
              ...applicationData,
              id: `APP-${Date.now()}`,
              applicationDate: new Date().toISOString(),
            }
          );
          console.log('Notification sent to staff');
        } catch (error) {
          console.error('Failed to send notification:', error);
        }
      }

      setSubmitStatus('success');
      onApplicationSubmit(applicationData, fileUrls);
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitStatus('error');
      setSubmitError('There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Driver Application</CardTitle>
          <CardDescription>
            Join our team by filling out the form below. We'll be in touch shortly.
          </CardDescription>
        </CardHeader>
        {submitStatus === 'success' && (
          <div className="px-6 py-3 bg-green-50 border-b border-green-200 text-green-800 text-sm">
            ✓ Application submitted successfully! You will receive a confirmation email shortly.
          </div>
        )}
        {submitStatus === 'error' && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200 text-red-800 text-sm">
            ✗ {submitError}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-foreground border-b pb-2">
                Your Details
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  name="firstName"
                  placeholder="First Name"
                  required
                  onChange={handleInputChange}
                />
                <Input
                  name="lastName"
                  placeholder="Last Name"
                  required
                  onChange={handleInputChange}
                />
                <Input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  required
                  onChange={handleInputChange}
                />
                <Input
                  name="mobileNumber"
                  type="tel"
                  placeholder="Mobile Number"
                  required
                  onChange={handleInputChange}
                />
                <Input
                  name="area"
                  placeholder="Area / City of Work"
                  required
                  className="sm:col-span-2"
                  onChange={handleInputChange}
                />
              </div>
            </fieldset>

            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <Checkbox
                id="isLicensed"
                checked={isLicensed}
                onCheckedChange={(checked) => setIsLicensed(!!checked)}
              />
              <label
                htmlFor="isLicensed"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I am an existing licensed Taxi or Private Hire driver.
              </label>
            </div>

            {isLicensed && (
              <fieldset className="space-y-4 animate-in fade-in-0 duration-500">
                <legend className="text-lg font-semibold text-foreground border-b pb-2">
                  License & Vehicle Details (Optional)
                </legend>
                <p className="text-xs text-muted-foreground -mt-2">
                  Please provide as much information as you can. You can add or update these details
                  later.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    name="badgeNumber"
                    placeholder="Badge Number"
                    onChange={handleInputChange}
                  />
                  <Input name="badgeExpiry" type="date" onChange={handleInputChange} />
                  <Select
                    value={formData.badgeIssuingCouncil || ''}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, badgeIssuingCouncil: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Issuing Council" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockLicensingCouncils.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <DocumentUploadField
                    label="Badge Document"
                    onFileChange={(name, file) =>
                      handleFileChange('badgeDocumentName', name, file)
                    }
                    documentKey="badgeDocument"
                  />

                  <Input
                    name="drivingLicenseNumber"
                    placeholder="Driving License Number"
                    onChange={handleInputChange}
                  />
                  <Input
                    name="drivingLicenseExpiry"
                    type="date"
                    onChange={handleInputChange}
                  />
                  <div className="sm:col-span-2">
                    <DocumentUploadField
                      label="Driving License Document"
                      onFileChange={(name, file) =>
                        handleFileChange('licenseDocumentName', name, file)
                      }
                      documentKey="licenseDocument"
                    />
                  </div>

                  <Input
                    name="vehicleMake"
                    placeholder="Vehicle Make"
                    onChange={handleInputChange}
                  />
                  <Input
                    name="vehicleModel"
                    placeholder="Vehicle Model"
                    onChange={handleInputChange}
                  />
                  <Input
                    name="vehicleRegistration"
                    placeholder="Vehicle Registration"
                    onChange={handleInputChange}
                  />
                  <DocumentUploadField
                    label="V5C (Logbook)"
                    onFileChange={(name, file) =>
                      handleFileChange('v5cDocumentName', name, file)
                    }
                    documentKey="v5cDocument"
                  />
                  <div className="sm:col-span-2">
                    <DocumentUploadField
                      label="Insurance Document"
                      onFileChange={(name, file) =>
                        handleFileChange('insuranceDocumentName', name, file)
                      }
                      documentKey="insuranceDocument"
                    />
                  </div>
                </div>
              </fieldset>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="ghost" onClick={onBackToLogin}>
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

export default EnhancedDriverSignUp;
