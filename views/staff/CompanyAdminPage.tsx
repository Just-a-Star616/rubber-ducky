import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { mockCompanyDetails, mockSiteDetails } from '../../lib/mockData';
import { mockStaffList, mockPermissionTemplates } from '../../lib/mockData';
import { CompanyDetails, SiteDetails, InvoiceTemplate } from '../../types';
import { PencilIcon } from '../../components/icons/Icon';
import SiteEditModal from '../../components/staff/SiteEditModal';
import ProtectedActivityLogViewer from '../../components/staff/ProtectedActivityLogViewer';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { saveBrandingConfig, updateBrandingSingleton, getBrandingConfig } from '../../lib/branding';

const CompanyDetailsSection: React.FC = () => {
    const branding = getBrandingConfig();
    const [details, setDetails] = useState<CompanyDetails>({
        ...mockCompanyDetails,
        name: branding.companyName,
        logoUrl: branding.companyLogoUrl
    });
    const [isEditing, setIsEditing] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDetails(prev => ({...prev, [name]: value}));
    }

    const handleSave = () => {
        if (logoPreview) {
            setDetails(prev => ({...prev, logoUrl: logoPreview}));
            // Save to localStorage for use across the app
            saveBrandingConfig({ 
                companyLogoUrl: logoPreview,
                companyName: details.name 
            });
            updateBrandingSingleton();
        }
        setIsEditing(false);
        // API call would go here
    }

    const handleCancel = () => {
        setDetails({
            ...mockCompanyDetails,
            name: branding.companyName,
            logoUrl: branding.companyLogoUrl
        });
        setLogoPreview(null);
        setIsEditing(false);
    }
    
    return (
        <div className="pt-8 first:pt-0 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-card-foreground">Company Details</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Manage core company information.</p>
                </div>
                {!isEditing && <Button variant="outline" onClick={() => setIsEditing(true)}><PencilIcon className="w-4 h-4 mr-2"/>Edit</Button>}
            </div>

            <div className="mt-6">
                {isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 border border-border rounded-lg bg-background">
                        <div className="sm:col-span-1">
                            <label className="block text-sm font-medium text-muted-foreground">Company Logo</label>
                            <div className="mt-1 flex items-center space-x-4">
                                <img src={logoPreview || branding.companyLogoUrl} alt="Company Logo" className="h-16 w-16 object-contain rounded-md bg-muted p-1" />
                                <Button variant="secondary" type="button" onClick={() => document.getElementById('logo-upload')?.click()}>Change</Button>
                                <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>
                        </div>
                         <div className="sm:col-span-1"></div>
                        <div className="sm:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">Company Name</label>
                            <Input type="text" name="name" id="name" value={details.name} onChange={handleInputChange} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                             <label htmlFor="address" className="block text-sm font-medium text-muted-foreground">Registered Address</label>
                            <Textarea name="address" id="address" value={details.address} onChange={handleInputChange} rows={3} className="mt-1" />
                        </div>
                        <div className="sm:col-span-1">
                             <label htmlFor="registrationNumber" className="block text-sm font-medium text-muted-foreground">Registration Number</label>
                            <Input type="text" name="registrationNumber" id="registrationNumber" value={details.registrationNumber} onChange={handleInputChange} className="mt-1" />
                        </div>
                        <div className="sm:col-span-1">
                            <label htmlFor="vatNumber" className="block text-sm font-medium text-muted-foreground">VAT Number</label>
                            <Input type="text" name="vatNumber" id="vatNumber" value={details.vatNumber} onChange={handleInputChange} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2 flex justify-end space-x-3">
                            <Button type="button" variant="ghost" onClick={handleCancel}>Cancel</Button>
                            <Button type="button" onClick={handleSave}>Save Company Details</Button>
                        </div>
                    </div>
                ) : (
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 border border-border rounded-lg">
                         <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-muted-foreground">Company Logo</dt>
                            <dd><img src={branding.companyLogoUrl} alt={branding.companyLogoAlt} className="mt-1 h-20 w-auto object-contain rounded-md bg-white p-2" /></dd>
                        </div>
                        <div className="sm:col-span-1"></div>
                        <div className="sm:col-span-1"><dt className="text-sm font-medium text-muted-foreground">Company Name</dt><dd className="text-sm text-foreground">{branding.companyName}</dd></div>
                        <div className="sm:col-span-1"><dt className="text-sm font-medium text-muted-foreground">Registration No.</dt><dd className="text-sm text-foreground">{details.registrationNumber}</dd></div>
                        <div className="sm:col-span-1"><dt className="text-sm font-medium text-muted-foreground">Registered Address</dt><dd className="text-sm text-foreground whitespace-pre-line">{details.address}</dd></div>
                        <div className="sm:col-span-1"><dt className="text-sm font-medium text-muted-foreground">VAT No.</dt><dd className="text-sm text-foreground">{details.vatNumber}</dd></div>
                    </dl>
                )}
            </div>
        </div>
    );
};

const SiteDetailsSection: React.FC = () => {
    const [sites, setSites] = useState<SiteDetails[]>(mockSiteDetails);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSite, setEditingSite] = useState<Partial<SiteDetails> | null>(null);

    // Default invoice templates (in a real app, these would come from AccountingSettingsPage)
    const [invoiceTemplates] = useState<InvoiceTemplate[]>([
        {
            id: 'default-template',
            name: 'Default',
            columns: ['date', 'pickup', 'destination', 'fare', 'charges'],
            summaryMethod: 'detailed',
            summaryTotals: ['total'],
            vatApplication: 'nothing',
            includeNotes: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: 'detailed-template',
            name: 'Detailed',
            columns: ['date', 'time', 'pickup', 'destination', 'distance', 'duration', 'fare', 'charges', 'tips', 'reference'],
            summaryMethod: 'detailed',
            summaryTotals: ['subtotal', 'serviceCharge', 'tax', 'total'],
            vatApplication: 'serviceChargeAndPrice',
            includeNotes: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: 'compact-template',
            name: 'Compact',
            columns: ['date', 'pickup', 'fare'],
            summaryMethod: 'summarized',
            summaryTotals: ['total'],
            vatApplication: 'nothing',
            includeNotes: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ]);

    const handleOpenModal = (site: SiteDetails | null) => {
        setEditingSite(site);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSite(null);
    };

    const handleSaveSite = (savedSite: SiteDetails) => {
        if (savedSite.id) {
            setSites(prev => prev.map(s => s.id === savedSite.id ? savedSite : s));
        } else {
            setSites(prev => [...prev, { ...savedSite, id: `SITE${Date.now()}` }]);
        }
        handleCloseModal();
    };

    const handleDeleteSite = (siteId: string) => {
        if(window.confirm('Are you sure you want to delete this site?')) {
            setSites(prev => prev.filter(s => s.id !== siteId));
            handleCloseModal();
        }
    };
    
    return (
         <div className="pt-8 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-card-foreground">Site Details</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Manage office locations and contact information.</p>
                </div>
                <Button onClick={() => handleOpenModal(null)}>Add New Site</Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-6">
                {sites.map(site => (
                    <Card key={site.id} className="flex-1 min-w-[320px]">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                 <h4 className="text-base font-bold text-card-foreground">{site.name}</h4>
                                 <Button variant="secondary" size="sm" onClick={() => handleOpenModal(site)}>Edit</Button>
                            </div>
                            <div className="mt-4 space-y-3 text-sm">
                                <p><strong className="font-medium text-muted-foreground">Address:</strong> {site.address}</p>
                                <p><strong className="font-medium text-muted-foreground">Booking Tel:</strong> {site.bookingTel}</p>
                                <p><strong className="font-medium text-muted-foreground">Office Email:</strong> {site.officeEmail}</p>
                                <p><strong className="font-medium text-muted-foreground">Area Manager:</strong> {site.areaManagerName} ({site.areaManagerEmail})</p>
                                <div>
                                    <strong className="font-medium text-muted-foreground">Opening Hours:</strong>
                                    <ul className="text-xs list-disc pl-5 mt-1">
                                        {site.officeHours.filter(h => !h.isOff).map(h => (
                                            <li key={h.day}>{h.day}: {h.start} - {h.end}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
             {isModalOpen && (
                <SiteEditModal
                    site={editingSite}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveSite}
                    onDelete={handleDeleteSite}
                    availableTemplates={invoiceTemplates.map(t => ({ id: t.id, name: t.name }))}
                />
            )}
        </div>
    );
};

const CompanyAdminPage: React.FC = () => {
  // Get current user (in production, this would come from auth context)
  const currentStaff = mockStaffList[0]; // SM01 - Alex Johnson (admin-like user)
  
  // Get user's permission template
  const userTemplate = useMemo(() => {
    if (currentStaff?.templateId) {
      return mockPermissionTemplates.find(t => t.id === currentStaff.templateId);
    }
    return mockPermissionTemplates.find(t => t.id === 't-admin');
  }, []);

  // Extract audit log permissions
  const auditPermissions = useMemo(() => ({
    auditLogsView: userTemplate?.permissions['audit-logs-view'] as string | undefined,
    auditLogsFilter: userTemplate?.permissions['audit-logs-filter'] as string | undefined,
    auditLogsExport: userTemplate?.permissions['audit-logs-export'] as string | undefined,
    auditLogsOwn: userTemplate?.permissions['audit-logs-own'] as string | undefined,
    auditScopedStaff: userTemplate?.permissions['audit-scoped-staff'] as string | undefined,
    auditScopedFinancial: userTemplate?.permissions['audit-scoped-financial'] as string | undefined,
    auditScopedDispatch: userTemplate?.permissions['audit-scoped-dispatch'] as string | undefined,
    auditScopedDrivers: userTemplate?.permissions['audit-scoped-drivers'] as string | undefined,
  }), [userTemplate]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <Card>
        <div className="divide-y divide-border">
            <CompanyDetailsSection />
            <SiteDetailsSection />
        </div>
      </Card>
      
      <ProtectedActivityLogViewer 
        staff={currentStaff} 
        permissions={auditPermissions}
        limit={100} 
        showFilters={true} 
        showStats={true} 
      />
    </div>
  );
};

export default CompanyAdminPage;
