import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { DriverApplication, ApplicationStatus, ApplicationPendingChanges, DocumentUpdateRequest } from '../../types';
import { LogoutIcon, CheckIcon, ClockIcon, PencilIcon, UploadIcon, DocumentDownloadIcon } from '../../components/icons/Icon';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { mockLicensingCouncils } from '../../lib/mockData';

interface ApplicantPortalProps {
    application: DriverApplication;
    handleLogout: () => void;
    onUpdateApplication: (application: DriverApplication) => void;
}

const timelineDescriptions: Record<ApplicationStatus, string> = {
    Submitted: "We've received your application and will review it shortly.",
    'Under Review': "A member of our team is currently reviewing your details.",
    Contacted: "We have reached out to you to discuss the next steps.",
    'Meeting Scheduled': "An in-person meeting has been scheduled.",
    Approved: "Congratulations! Your application has been approved.",
    Rejected: "Unfortunately, we are not moving forward with your application at this time."
};

type TimelineStepProps = { title: string; description: string; isCompleted: boolean; isCurrent: boolean };
const TimelineStep: React.FC<TimelineStepProps> = ({ title, description, isCompleted, isCurrent }) => {
    return (
        <li className="relative flex items-start pb-8">
            <div className="absolute top-1 left-3 -ml-px mt-0.5 h-full w-0.5 bg-border" />
            <div className={`relative flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-card border-2 ${isCompleted || isCurrent ? 'border-primary' : 'border-border'}`}>
                {isCompleted ? <CheckIcon className="h-4 w-4 text-primary" /> : isCurrent ? <div className="h-2.5 w-2.5 rounded-full bg-primary" /> : <div className="h-2.5 w-2.5 rounded-full bg-border" />}
            </div>
            <div className="ml-4"><p className={`font-semibold ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{title}</p><p className="text-sm text-muted-foreground">{description}</p></div>
        </li>
    );
};

const formatDateForDisplay = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD
};

const PendingChip = ({ newValue }: { newValue: string | undefined | null }) => (
    <div className="mt-1 flex items-center space-x-2 text-xs text-yellow-800 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50 rounded-full px-2.5 py-1">
        <ClockIcon className="w-4 h-4" />
        <span>Pending Approval: <strong>{newValue || 'Update'}</strong></span>
    </div>
);

const ProfileField = ({ label, value, pendingValue }: { label: string, value: string | null | undefined, pendingValue?: string | null }) => (
    <div><dt className="text-sm font-medium text-muted-foreground">{label}</dt><dd className="mt-1 text-sm text-foreground">{value || 'N/A'}</dd>{pendingValue && <PendingChip newValue={pendingValue} />}</div>
);

const DocumentField = ({ docType, docName, docUrl, pendingUpdate }: { docType: string, docName: string, docUrl?: string, pendingUpdate?: DocumentUpdateRequest }) => (
    <div className="sm:col-span-2 border-t border-border pt-4 mt-4">
        <div className="flex justify-between items-center"><h4 className="text-base font-medium text-foreground">{docName}</h4>{docUrl && <a href={docUrl} target="_blank" rel="noopener noreferrer" title="View current document" className="text-sm font-medium text-primary hover:underline flex items-center space-x-1"><DocumentDownloadIcon className="w-4 h-4" /><span>View Current</span></a>}</div>
        {pendingUpdate?.fileName && (
            <div className="mt-2"><dt className="text-sm font-medium text-muted-foreground">New Document Upload</dt><dd className="mt-1"><div className="flex items-center space-x-2 text-xs text-yellow-800 dark:text-yellow-300"><div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-full px-2.5 py-1"><ClockIcon className="w-4 h-4 flex-shrink-0" /><span className="truncate">Pending: <strong>{pendingUpdate.fileName}</strong></span></div>{pendingUpdate.fileUrl && <a href={pendingUpdate.fileUrl} target="_blank" rel="noopener noreferrer" title="View pending document" className="p-1 rounded-full text-primary hover:bg-primary/10"><DocumentDownloadIcon className="w-5 h-5" /></a>}</div></dd></div>
        )}
    </div>
);

const ApplicantPortal: React.FC<ApplicantPortalProps> = ({ application: initialApplication, handleLogout, onUpdateApplication }) => {
    const [application, setApplication] = useState(initialApplication);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<DriverApplication>>({});
    const [files, setFiles] = useState<Record<string, File | null>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { setApplication(initialApplication); }, [initialApplication]);

    const handleEdit = () => { setFormData({ ...application }); setIsEditing(true); };
    const handleCancel = () => { setIsEditing(false); setFormData({}); setFiles({}); };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => { setFormData(prev => ({...prev, [name]: value})); };
    const handleFileChange = (file: File | null, docType: string) => { setFiles(prev => ({ ...prev, [docType]: file })); };

    const handleSave = () => {
        const newPendingChanges: ApplicationPendingChanges = { ...(application.pendingChanges || {}) };
        
        const fields: (keyof DriverApplication)[] = ['firstName', 'lastName', 'email', 'mobileNumber', 'area', 'badgeNumber', 'badgeExpiry', 'badgeIssuingCouncil', 'drivingLicenseNumber', 'drivingLicenseExpiry', 'vehicleMake', 'vehicleModel', 'vehicleRegistration'];
        fields.forEach(field => {
            if (formData[field] !== application[field]) {
                (newPendingChanges as any)[field] = formData[field];
            }
        });

        const docTypes: { [key: string]: keyof ApplicationPendingChanges } = {
            badge: 'badgeUpdate', license: 'licenseUpdate', v5c: 'v5cUpdate', insurance: 'insuranceUpdate'
        };

        Object.entries(docTypes).forEach(([key, updateKey]) => {
            if (files[key]) {
                const updateRequest: DocumentUpdateRequest = {
                    fileName: files[key]!.name,
                    fileUrl: URL.createObjectURL(files[key]!),
                    expiry: (formData as any)[`${key}Expiry`] || (application as any)[`${key}Expiry`] || '',
                    number: (formData as any)[`${key}Number`] || (application as any)[`${key}Number`],
                    issuingCouncil: key === 'badge' ? formData.badgeIssuingCouncil || application.badgeIssuingCouncil : undefined
                };
                (newPendingChanges as any)[updateKey] = updateRequest;
            }
        });

        const updatedApplication = { ...application, pendingChanges: newPendingChanges };
        onUpdateApplication(updatedApplication);
        setApplication(updatedApplication);
        setIsEditing(false);
        alert("Your changes have been submitted for approval.");
    };

    // Client-side submission to the serverless /api/google endpoint.
    const handleSubmitToPortal = async () => {
        try {
            setSubmitting(true);
            // Build applicant payload from current application state
            const applicant = {
                firstName: application.firstName,
                lastName: application.lastName,
                email: application.email,
                phone: application.mobileNumber,
                area: application.area,
                isLicensed: application.isLicensed,
            };

            // Convert selected files to base64
            const attachments: Array<{ name: string; mimeType?: string; dataBase64: string }> = [];
            const fileKeys = Object.keys(files) as string[];
            for (const k of fileKeys) {
                const f = files[k];
                if (!f) continue;
                const dataBase64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result as string;
                        const comma = result.indexOf(',');
                        resolve(comma >= 0 ? result.slice(comma + 1) : result);
                    };
                    reader.onerror = () => reject(new Error('Failed to read file'));
                    reader.readAsDataURL(f);
                });
                attachments.push({ name: f.name, mimeType: f.type || 'application/octet-stream', dataBase64 });
            }

            const apiKey = (import.meta as any).env?.VITE_PUBLIC_API_KEY || '';

            const resp = await fetch('/api/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(apiKey ? { 'x-api-key': apiKey } : {})
                },
                body: JSON.stringify({ applicant, attachments })
            });

            if (!resp.ok) {
                const txt = await resp.text();
                throw new Error(`Server error: ${resp.status} ${txt}`);
            }

            const json = await resp.json();
            alert('Application submitted successfully.');
            // Optionally update UI or pending state
            if (json && json.success) {
                // mark submitted status locally
                setApplication(prev => ({ ...prev, status: 'Submitted' } as any));
            }
        } catch (err: any) {
            console.error('Submit failed', err);
            alert('Failed to submit application: ' + (err?.message || String(err)));
        } finally {
            setSubmitting(false);
        }
    };

    const statuses: ApplicationStatus[] = ['Submitted', 'Under Review', 'Contacted', 'Meeting Scheduled', 'Approved'];
    const currentStatusIndex = statuses.indexOf(application.status);

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-card shadow-sm"><div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center"><h1 className="text-xl font-bold">Your Application</h1><Button variant="ghost" onClick={handleLogout}><LogoutIcon className="mr-2 h-4 w-4"/> Log Out</Button></div></header>
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1"><Card><CardHeader><CardTitle>Application Status</CardTitle></CardHeader><CardContent><ol>{statuses.map((status, index) => (<TimelineStep key={status} title={status} description={timelineDescriptions[status]} isCompleted={index < currentStatusIndex} isCurrent={index === currentStatusIndex} />))}</ol></CardContent></Card></div>
                <div className="md:col-span-2">
                     <Card>
                        <CardHeader><div className="flex justify-between items-center"><CardTitle>Submitted Information</CardTitle>{isEditing ? (<div className="flex gap-2"><Button variant="ghost" onClick={handleCancel}>Cancel</Button><Button onClick={handleSave}>Save Changes</Button></div>) : (<Button variant="outline" onClick={handleEdit}><PencilIcon className="w-4 h-4 mr-2"/>Edit Information</Button>)}</div><CardDescription>This is the information we have on file for your application.</CardDescription></CardHeader>
                        <CardContent className="space-y-6">
                            {isEditing ? (
                                <form className="space-y-6">
                                    <fieldset className="space-y-4"><legend className="font-semibold">Personal Details</legend><div className="grid grid-cols-2 gap-4"><Input name="firstName" placeholder="First Name" value={formData.firstName || ''} onChange={handleInputChange} /><Input name="lastName" placeholder="Last Name" value={formData.lastName || ''} onChange={handleInputChange} /><Input name="email" type="email" placeholder="Email Address" value={formData.email || ''} onChange={handleInputChange} /><Input name="mobileNumber" placeholder="Mobile Number" value={formData.mobileNumber || ''} onChange={handleInputChange} /><Input name="area" placeholder="Area / City" value={formData.area || ''} onChange={handleInputChange} className="col-span-2" /></div></fieldset>
                                    {application.isLicensed && <fieldset className="space-y-4"><legend className="font-semibold">License, Vehicle & Documents</legend><div className="grid grid-cols-2 gap-4"><Input name="badgeNumber" placeholder="Badge Number" value={formData.badgeNumber || ''} onChange={handleInputChange} /><Input name="badgeExpiry" type="date" value={formatDateForInput(formData.badgeExpiry)} onChange={handleInputChange} /><Select value={formData.badgeIssuingCouncil} onValueChange={(v) => handleSelectChange('badgeIssuingCouncil', v)}><SelectTrigger><SelectValue placeholder="Issuing Council" /></SelectTrigger><SelectContent>{mockLicensingCouncils.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><Input name="drivingLicenseNumber" placeholder="Driving License Number" value={formData.drivingLicenseNumber || ''} onChange={handleInputChange} /><Input name="drivingLicenseExpiry" type="date" value={formatDateForInput(formData.drivingLicenseExpiry)} onChange={handleInputChange} /><Input name="vehicleMake" placeholder="Vehicle Make" value={formData.vehicleMake || ''} onChange={handleInputChange} /><Input name="vehicleModel" placeholder="Vehicle Model" value={formData.vehicleModel || ''} onChange={handleInputChange} /><Input name="vehicleRegistration" placeholder="Vehicle Registration" value={formData.vehicleRegistration || ''} onChange={handleInputChange} /></div><div className="space-y-2 mt-4"><h4 className="text-sm font-medium">Upload New Documents</h4><div className="p-3 border rounded-lg bg-background text-sm flex items-center justify-between"><span>Badge</span><Input type="file" onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'badge')} className="text-xs"/></div><div className="p-3 border rounded-lg bg-background text-sm flex items-center justify-between"><span>License</span><Input type="file" onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'license')} className="text-xs"/></div><div className="p-3 border rounded-lg bg-background text-sm flex items-center justify-between"><span>V5C</span><Input type="file" onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'v5c')} className="text-xs"/></div><div className="p-3 border rounded-lg bg-background text-sm flex items-center justify-between"><span>Insurance</span><Input type="file" onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'insurance')} className="text-xs"/></div></div></fieldset>}
                                </form>
                            ) : (
                                <>
                                    <dl className="grid grid-cols-2 gap-x-4 gap-y-6"><ProfileField label="First Name" value={application.firstName} pendingValue={application.pendingChanges?.firstName} /><ProfileField label="Last Name" value={application.lastName} pendingValue={application.pendingChanges?.lastName} /><ProfileField label="Email" value={application.email} pendingValue={application.pendingChanges?.email} /><ProfileField label="Mobile" value={application.mobileNumber} pendingValue={application.pendingChanges?.mobileNumber} /><ProfileField label="Area" value={application.area} pendingValue={application.pendingChanges?.area} /><ProfileField label="Existing License" value={application.isLicensed ? 'Yes' : 'No'} /></dl>
                                    {application.isLicensed && (<><dl className="grid grid-cols-2 gap-x-4 gap-y-6 border-t pt-6 mt-6"><ProfileField label="Badge Number" value={application.badgeNumber} pendingValue={application.pendingChanges?.badgeUpdate?.number} /><ProfileField label="Badge Expiry" value={formatDateForDisplay(application.badgeExpiry)} pendingValue={formatDateForDisplay(application.pendingChanges?.badgeUpdate?.expiry)} /><ProfileField label="Issuing Council" value={application.badgeIssuingCouncil} pendingValue={application.pendingChanges?.badgeUpdate?.issuingCouncil} /><ProfileField label="Driving License No." value={application.drivingLicenseNumber} pendingValue={application.pendingChanges?.licenseUpdate?.number} /><ProfileField label="License Expiry" value={formatDateForDisplay(application.drivingLicenseExpiry)} pendingValue={formatDateForDisplay(application.pendingChanges?.licenseUpdate?.expiry)} /></dl><dl className="grid grid-cols-2 gap-x-4 gap-y-6 border-t pt-6 mt-6"><ProfileField label="Vehicle Make" value={application.vehicleMake} pendingValue={application.pendingChanges?.vehicleMake} /><ProfileField label="Vehicle Model" value={application.vehicleModel} pendingValue={application.pendingChanges?.vehicleModel} /><ProfileField label="Vehicle Reg" value={application.vehicleRegistration} pendingValue={application.pendingChanges?.vehicleRegistration} /></dl></>)}
                                    {application.isLicensed && (<dl className="grid grid-cols-1 gap-x-4 gap-y-6 border-t pt-6 mt-6"><DocumentField docType="badge" docName="Badge Document" docUrl={application.badgeDocumentUrl} pendingUpdate={application.pendingChanges?.badgeUpdate} /><DocumentField docType="license" docName="License Document" docUrl={application.licenseDocumentUrl} pendingUpdate={application.pendingChanges?.licenseUpdate} /><DocumentField docType="v5c" docName="V5C Document" docUrl={application.v5cDocumentUrl} pendingUpdate={application.pendingChanges?.v5cUpdate} /><DocumentField docType="insurance" docName="Insurance Document" docUrl={application.insuranceDocumentUrl} pendingUpdate={application.pendingChanges?.insuranceUpdate} /></dl>)}
                                </>
                            )}
                            {!isEditing && (
                                <div className="mt-4 flex justify-end">
                                    <Button onClick={handleSubmitToPortal} disabled={submitting || application.status === 'Submitted'}>
                                        <UploadIcon className="w-4 h-4 mr-2" />
                                        {application.status === 'Submitted' ? 'Submitted' : submitting ? 'Submitting...' : 'Submit Application'}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default ApplicantPortal;