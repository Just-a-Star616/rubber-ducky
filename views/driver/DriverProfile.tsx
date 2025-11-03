
import React, { useState, useEffect } from 'react';
import { Driver, PendingChanges, DocumentUpdateRequest, BankAccount } from '../../types';
import { Button } from '../../components/ui/button';
import { PencilIcon, ClockIcon, UploadIcon, DocumentDownloadIcon } from '../../components/icons/Icon';
import { mockLicensingCouncils } from '../../lib/mockData';
import { themes } from '../../lib/themes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import BankAccountManager from '../../components/staff/BankAccountManager';
import BankAccountVerificationModal from '../../components/staff/BankAccountVerificationModal';

interface DriverProfileProps {
  driver: Driver;
  setDriver: (driver: Driver) => void;
  themeName: string;
  setThemeName: (name: string) => void;
}

const formatDateForDisplay = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
}

const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Adjust for timezone offset
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
}

const PendingChip = ({ newValue }: { newValue: string }) => (
    <div className="mt-1 flex items-center gap-2 text-xs text-yellow-800 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50 rounded-full px-2.5 py-1">
        <ClockIcon className="w-4 h-4" />
        <span>Pending Approval: <strong>{newValue}</strong></span>
    </div>
);

const ProfileField = ({ label, value, pendingValue }: { label: string, value: string | null, pendingValue?: string | null }) => (
    <div className="sm:col-span-1">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-1 text-sm text-foreground">{value || 'N/A'}</dd>
        {pendingValue && <PendingChip newValue={pendingValue} />}
    </div>
);

interface DocumentSectionProps {
    isEditing: boolean;
    docType: 'badge' | 'drivingLicense' | 'schoolBadge';
    docName: string;
    driver: Driver;
    formData: Partial<Driver>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: (name: string, value: string) => void;
    handleFileChange: (file: File | null, docType: string) => void;
}

const DocumentSection = ({ isEditing, docType, docName, driver, formData, handleInputChange, handleSelectChange, handleFileChange }: DocumentSectionProps) => {
    const currentNumber = driver[`${docType}Number` as const];
    const currentExpiry = driver[`${docType}Expiry` as const];
    const currentCouncil = driver.badgeIssuingCouncil;
    
    // Map docType to the actual Driver property names
    const documentUrlKey = docType === 'badge' ? 'badgeDocumentUrl' 
        : docType === 'drivingLicense' ? 'drivingLicenseDocumentUrl'
        : 'schoolBadgeDocumentUrl';
    const currentDocumentUrl = driver[documentUrlKey as keyof Driver] as string | undefined;
    
    const pendingUpdate = driver.pendingChanges?.[`${docType}Update` as const];

    const [file, setFile] = useState<File | null>(null);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            handleFileChange(e.target.files[0], docType);
        }
    }

    if (isEditing) {
        return (
            <fieldset className="sm:col-span-2 border-t pt-4 mt-4">
                <legend className="text-base font-medium text-foreground">{docName}</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground">{`${docName} Number`}</label>
                        <Input id={`${docType}Number`} name={`${docType}Number`} value={formData[`${docType}Number` as const] || ''} onChange={handleInputChange} className="mt-1" />
                    </div>
                    {docType === 'badge' && (
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground">Issuing Council</label>
                            <Select value={formData.badgeIssuingCouncil} onValueChange={(v) => handleSelectChange('badgeIssuingCouncil', v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{mockLicensingCouncils.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                        </div>
                    )}
                    <div className={docType !== 'badge' ? 'sm:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-muted-foreground">Expiry Date</label>
                        <Input id={`${docType}Expiry`} name={`${docType}Expiry`} type="datetime-local" value={formatDateForInput(formData[`${docType}Expiry` as const])} onChange={handleInputChange} className="mt-1" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-muted-foreground">Upload New Document</label>
                        <div className="mt-1 flex items-center justify-center w-full px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <div className="flex text-sm text-muted-foreground">
                                    <label htmlFor={`${docType}-file-upload`} className="relative cursor-pointer bg-card rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                                        <span>Select a file</span>
                                        <input id={`${docType}-file-upload`} name={`${docType}-file-upload`} type="file" className="sr-only" onChange={onFileChange} />
                                    </label>
                                </div>
                                <p className="text-xs text-muted-foreground/80">{file ? `${file.name} (${(file.size / 1024).toFixed(2)} KB)` : 'PDF, PNG, JPG up to 10MB'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </fieldset>
        );
    }

    return (
        <div className="sm:col-span-2 border-t border-border pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-base font-medium text-foreground">{docName}</h4>
            </div>
            <div className="space-y-3">
                <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    <div>
                        <p className="text-xs text-muted-foreground">Number</p>
                        <p className="text-sm font-medium">{currentNumber || 'N/A'}</p>
                        {pendingUpdate?.number && (
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                Pending: {pendingUpdate.number}
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Expiry Date</p>
                        <p className="text-sm font-medium">{formatDateForDisplay(currentExpiry)}</p>
                        {pendingUpdate?.expiry && (
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                Pending: {formatDateForDisplay(pendingUpdate.expiry)}
                            </p>
                        )}
                    </div>
                    {docType === 'badge' && (
                        <div>
                            <p className="text-xs text-muted-foreground">Issuing Council</p>
                            <p className="text-sm font-medium">{currentCouncil || 'N/A'}</p>
                            {pendingUpdate?.issuingCouncil && (
                                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                    Pending: {pendingUpdate.issuingCouncil}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Document Display Card */}
                {currentDocumentUrl ? (
                    <div className="mt-4 p-4 rounded-lg border border-border bg-card/50 hover:bg-card/75 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-foreground">Current Document</p>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded font-medium">
                                ✓ Verified
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground truncate">Document uploaded and verified</p>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={currentDocumentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    title="Download document"
                                    className="p-2 rounded-md text-primary hover:bg-primary/10 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </a>
                                <a
                                    href={currentDocumentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="View document"
                                    className="p-2 rounded-md text-primary hover:bg-primary/10 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 p-4 rounded-lg border border-dashed border-border bg-card/25">
                        <p className="text-sm text-muted-foreground">No document uploaded yet</p>
                    </div>
                )}

                {/* Pending Document Upload */}
                {pendingUpdate?.fileName && (
                    <div className="mt-3 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">Pending Verification</p>
                            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-xs rounded font-medium">
                                ⏳ Awaiting Approval
                            </span>
                        </div>
                        <p className="text-xs text-yellow-800 dark:text-yellow-300 mb-3">{pendingUpdate.fileName}</p>
                        {pendingUpdate.fileUrl && (
                            <div className="flex gap-2">
                                <a
                                    href={pendingUpdate.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="View pending document"
                                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View Pending
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const ThemeSelector: React.FC<{themeName: string, setThemeName: (name: string) => void}> = ({ themeName, setThemeName }) => (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {themes.map(theme => {
            const isActive = themeName === theme.name;
            const themeColors = theme.light; // Always show light preview for consistency
            return (
                <div key={theme.name} onClick={() => setThemeName(theme.name)} className="cursor-pointer text-center">
                    <div className={`w-full rounded-lg border-2 p-1 transition-colors ${isActive ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}>
                        <div className="aspect-square w-full flex rounded-md overflow-hidden shadow-inner" style={{ backgroundColor: themeColors.card }}>
                            <div className="w-1/3" style={{ backgroundColor: themeColors.sidebar }}></div>
                            <div className="w-2/3 p-1 flex flex-col justify-end" style={{ backgroundColor: themeColors.background }}>
                                <div className="space-y-1">
                                    <div className="h-1.5 rounded-sm" style={{ backgroundColor: themeColors.primary['400'] }}></div>
                                    <div className="h-1.5 rounded-sm" style={{ backgroundColor: themeColors.primary['600'] }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className={`mt-2 text-center text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {theme.name}
                    </p>
                </div>
            )
        })}
    </div>
);


const DriverProfile: React.FC<DriverProfileProps> = ({ driver, setDriver, themeName, setThemeName }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Driver>>({});
    const [files, setFiles] = useState<{ [key: string]: { file: File, url: string } | null }>({});
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [verifyingAccount, setVerifyingAccount] = useState<BankAccount | null>(null);
    
    useEffect(() => {
        return () => {
            Object.values(files).forEach(fileObj => {
                if (fileObj && typeof fileObj === 'object' && 'url' in fileObj) {
                    URL.revokeObjectURL((fileObj as { file: File, url: string }).url);
                }
            });
        };
    }, [files]);

    const handleEdit = () => {
        setFormData({ ...driver });
        setFiles({});
        setIsEditing(true);
    };
    
    const handleCancel = () => {
        setIsEditing(false);
        setFormData({});
        setFiles({});
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({...prev, [name]: value}));
    }

    const handleFileChange = (file: File | null, docType: string) => {
        if (files[docType]) {
            URL.revokeObjectURL(files[docType]!.url);
        }

        if (file) {
            setFiles(prev => ({ ...prev, [docType]: { file, url: URL.createObjectURL(file) } }));
        } else {
            setFiles(prev => ({ ...prev, [docType]: null }));
        }
    };

    const handleSave = () => {
        const newPendingChanges: PendingChanges = { ...driver.pendingChanges };
        const changedFields: (keyof Driver)[] = ['firstName', 'lastName', 'email', 'devicePhone', 'mobileNumber', 'address', 'gender', 'emergencyContactName', 'emergencyContactNumber', 'badgeIssuingCouncil'];

        changedFields.forEach(field => {
            if (formData[field] && formData[field] !== driver[field]) {
                (newPendingChanges as any)[field] = formData[field];
            }
        });

        const docTypes = ['badge', 'drivingLicense', 'schoolBadge'] as const;
        docTypes.forEach(docType => {
            const hasNewFile = !!files[docType];

            const numberKey = `${docType}Number` as const;
            const expiryKey = `${docType}Expiry` as const;
            const updateKey = `${docType}Update` as const;
            
            const numberChanged = formData[numberKey] !== driver[numberKey];
            const expiryChanged = formatDateForInput(formData[expiryKey]) !== formatDateForInput(driver[expiryKey]);
            const councilChanged = docType === 'badge' && formData.badgeIssuingCouncil !== driver.badgeIssuingCouncil;

            if(hasNewFile || numberChanged || expiryChanged || councilChanged) {
                 const existingUpdate = driver.pendingChanges?.[updateKey];
                 newPendingChanges[updateKey] = {
                    fileName: files[docType]?.file.name || existingUpdate?.fileName || 'Document Updated',
                    fileUrl: files[docType]?.url || existingUpdate?.fileUrl,
                    number: formData[numberKey] ?? undefined,
                    expiry: formData[expiryKey]!,
                    ...(docType === 'badge' && { issuingCouncil: formData.badgeIssuingCouncil as string })
                 };
            }
        });

        setDriver({ ...driver, pendingChanges: newPendingChanges });
        alert("Your changes have been submitted for approval.");
        setIsEditing(false);
    };

    const handleBankAccountAdd = (account: BankAccount) => {
        const updatedDriver = {
            ...driver,
            bankAccounts: [...driver.bankAccounts, account],
        };
        setDriver(updatedDriver);
        setVerifyingAccount(account);
        setIsVerificationModalOpen(true);
    };

    const handleBankAccountEdit = (account: BankAccount) => {
        const updatedDriver = {
            ...driver,
            bankAccounts: driver.bankAccounts.map(ba => ba.id === account.id ? account : ba),
        };
        setDriver(updatedDriver);
        setVerifyingAccount(account);
        setIsVerificationModalOpen(true);
    };

    const handleBankAccountDelete = (accountId: string) => {
        const updatedDriver = {
            ...driver,
            bankAccounts: driver.bankAccounts.filter(ba => ba.id !== accountId),
        };
        setDriver(updatedDriver);
    };

    const handleBankAccountSetDefault = (accountId: string) => {
        const updatedDriver = {
            ...driver,
            bankAccounts: driver.bankAccounts.map(ba => ({
                ...ba,
                isDefault: ba.id === accountId,
            })),
        };
        setDriver(updatedDriver);
    };

    const handleBankAccountVerificationRequired = (account: BankAccount) => {
        setVerifyingAccount(account);
        setIsVerificationModalOpen(true);
    };

    const handleVerificationConfirm = (code: string) => {
        if (verifyingAccount) {
            const updatedDriver = {
                ...driver,
                bankAccounts: driver.bankAccounts.map(ba =>
                    ba.id === verifyingAccount.id
                        ? {
                            ...ba,
                            verified: true,
                            verificationConfirmedAt: new Date().toISOString(),
                        }
                        : ba
                ),
            };
            setDriver(updatedDriver);
            setIsVerificationModalOpen(false);
            setVerifyingAccount(null);
            alert('Bank account verified successfully!');
        }
    };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col items-center">
        <img className="h-24 w-24 rounded-full" src={driver.avatarUrl} alt={`${driver.firstName} ${driver.lastName}`} />
        <h2 className="mt-4 text-2xl font-bold text-foreground">{driver.firstName} {driver.lastName}</h2>
        <p className="text-sm text-muted-foreground">Driver ID: {driver.id}</p>
      </div>
      
      <div className="flex justify-end gap-x-3">
        {isEditing ? (
            <>
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
            </>
        ) : (
             <Button onClick={handleEdit}><PencilIcon className="w-4 h-4 mr-2" />Edit Profile</Button>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    {isEditing ? (
                        <>
                           <div><label className="block text-sm font-medium text-muted-foreground">First Name</label><Input id="firstName" name="firstName" value={formData.firstName || ''} onChange={handleInputChange} className="mt-1" /></div>
                           <div><label className="block text-sm font-medium text-muted-foreground">Last Name</label><Input id="lastName" name="lastName" value={formData.lastName || ''} onChange={handleInputChange} className="mt-1" /></div>
                           <div><label className="block text-sm font-medium text-muted-foreground">Email Address</label><Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} className="mt-1" /></div>
                           <div><label className="block text-sm font-medium text-muted-foreground">Primary Phone</label><Input id="devicePhone" name="devicePhone" value={formData.devicePhone || ''} onChange={handleInputChange} className="mt-1" /></div>
                           <div><label className="block text-sm font-medium text-muted-foreground">Alternative Phone</label><Input id="mobileNumber" name="mobileNumber" value={formData.mobileNumber || ''} onChange={handleInputChange} className="mt-1" /></div>
                           <div><label className="block text-sm font-medium text-muted-foreground">Gender</label>
<Select value={formData.gender || ''} onValueChange={(v) => handleSelectChange('gender', v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
                           <div className="sm:col-span-2"><label className="block text-sm font-medium text-muted-foreground">Home Address</label><Textarea id="address" name="address" value={formData.address || ''} onChange={handleInputChange} rows={3} className="mt-1"/></div>
                           <div><label className="block text-sm font-medium text-muted-foreground">Emergency Contact Name</label><Input id="emergencyContactName" name="emergencyContactName" value={formData.emergencyContactName || ''} onChange={handleInputChange} className="mt-1" /></div>
                           <div><label className="block text-sm font-medium text-muted-foreground">Emergency Contact Number</label><Input id="emergencyContactNumber" name="emergencyContactNumber" value={formData.emergencyContactNumber || ''} onChange={handleInputChange} className="mt-1" /></div>
                        </>
                    ) : (
                        <>
                            <ProfileField label="Full Name" value={`${driver.firstName} ${driver.lastName}`} pendingValue={driver.pendingChanges?.firstName || driver.pendingChanges?.lastName ? `${driver.pendingChanges.firstName || driver.firstName} ${driver.pendingChanges.lastName || driver.lastName}`: null } />
                            <ProfileField label="Email Address" value={driver.email} pendingValue={driver.pendingChanges?.email} />
                            <ProfileField label="Primary Phone" value={driver.devicePhone} pendingValue={driver.pendingChanges?.devicePhone} />
                            <ProfileField label="Alternative Phone" value={driver.mobileNumber} pendingValue={driver.pendingChanges?.mobileNumber} />
                            <ProfileField label="Home Address" value={driver.address} pendingValue={driver.pendingChanges?.address} />
                            <ProfileField label="Gender" value={driver.gender} pendingValue={driver.pendingChanges?.gender} />
                            <ProfileField label="Date of Birth" value={formatDateForDisplay(driver.dateOfBirth)} />
                            <ProfileField label="Emergency Contact" value={`${driver.emergencyContactName} (${driver.emergencyContactNumber})`} pendingValue={driver.pendingChanges?.emergencyContactName || driver.pendingChanges?.emergencyContactNumber ? `${driver.pendingChanges.emergencyContactName || driver.emergencyContactName} (${driver.pendingChanges.emergencyContactNumber || driver.emergencyContactNumber})` : null} />
                        </>
                    )}
                </dl>
            </CardContent>
        </Card>

        <Card className="mt-6">
            <CardHeader><CardTitle>Licensing & Documents</CardTitle></CardHeader>
            <CardContent>
                 <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <DocumentSection isEditing={isEditing} docType="badge" docName="Private Hire / Hackney Badge" driver={driver} formData={formData} handleInputChange={handleInputChange} handleSelectChange={handleSelectChange} handleFileChange={handleFileChange} />
                    <DocumentSection isEditing={isEditing} docType="drivingLicense" docName="Driving License" driver={driver} formData={formData} handleInputChange={handleInputChange} handleSelectChange={handleSelectChange} handleFileChange={handleFileChange} />
                    <DocumentSection isEditing={isEditing} docType="schoolBadge" docName="School Badge" driver={driver} formData={formData} handleInputChange={handleInputChange} handleSelectChange={handleSelectChange} handleFileChange={handleFileChange} />
                </div>
            </CardContent>
        </Card>
      </form>
      
      <Card className="mt-6">
            <CardHeader><CardTitle>Bank Accounts for Withdrawals</CardTitle><CardDescription>Add and manage bank accounts for credit withdrawals.</CardDescription></CardHeader>
            <CardContent>
                <BankAccountManager
                    bankAccounts={driver.bankAccounts}
                    onAdd={handleBankAccountAdd}
                    onEdit={handleBankAccountEdit}
                    onDelete={handleBankAccountDelete}
                    onSetDefault={handleBankAccountSetDefault}
                    onVerificationRequired={handleBankAccountVerificationRequired}
                />
            </CardContent>
        </Card>

        <BankAccountVerificationModal
            isOpen={isVerificationModalOpen}
            onClose={() => {
                setIsVerificationModalOpen(false);
                setVerifyingAccount(null);
            }}
            account={verifyingAccount}
            onConfirm={handleVerificationConfirm}
        />
      
      <Card className="mt-6">
        <CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Choose a color theme for the portal.</CardDescription></CardHeader>
        <CardContent>
            <ThemeSelector themeName={themeName} setThemeName={setThemeName} />
        </CardContent>
      </Card>

    </div>
  );
};

export default DriverProfile;