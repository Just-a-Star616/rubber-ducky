
import React, { useState, useEffect, useCallback } from 'react';
import { StaffMember, StaffStatus, PermissionTemplate, SiteDetails, OfficeHours } from '../../types';
import { logAction } from '../../lib/logging';
import { Button } from '../ui/button';
import { XIcon } from '../icons/Icon';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';

interface StaffEditModalProps {
  staff: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: StaffMember) => void;
  permissionTemplates: PermissionTemplate[];
  availableSites?: SiteDetails[];
}

const defaultOfficeHours: OfficeHours[] = [
    { day: 'Monday', isOff: false, start: '09:00', end: '17:00' },
    { day: 'Tuesday', isOff: false, start: '09:00', end: '17:00' },
    { day: 'Wednesday', isOff: false, start: '09:00', end: '17:00' },
    { day: 'Thursday', isOff: false, start: '09:00', end: '17:00' },
    { day: 'Friday', isOff: false, start: '09:00', end: '17:00' },
    { day: 'Saturday', isOff: true, start: '00:00', end: '00:00' },
    { day: 'Sunday', isOff: true, start: '00:00', end: '00:00' },
];

const OfficeHoursEditor = ({ hours, onHoursChange }: { hours: OfficeHours[], onHoursChange: (hours: OfficeHours[]) => void }) => {
    const handleHourChange = (day: string, field: keyof OfficeHours, value: string | boolean) => {
        const newHours = hours.map(h => h.day === day ? { ...h, [field]: value } : h);
        onHoursChange(newHours);
    };

    return (
        <div className="space-y-3">
            <h4 className="text-md font-medium text-card-foreground">Office Hours</h4>
            {hours.map(h => (
                <div key={h.day} className="p-3 rounded-lg bg-background">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm text-card-foreground">{h.day}</span>
                        <div className="flex items-center">
                            <label htmlFor={`staff-isOff-${h.day}`} className="mr-2 text-sm text-card-foreground/70">Off</label>
                            <input type="checkbox" id={`staff-isOff-${h.day}`} checked={h.isOff} onChange={(e) => handleHourChange(h.day, 'isOff', e.target.checked)} className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500" />
                        </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <Input type="time" value={h.start} onChange={e => handleHourChange(h.day, 'start', e.target.value)} disabled={h.isOff} className="disabled:opacity-50" />
                        <Input type="time" value={h.end} onChange={e => handleHourChange(h.day, 'end', e.target.value)} disabled={h.isOff} className="disabled:opacity-50" />
                    </div>
                </div>
            ))}
        </div>
    );
};

const StaffEditModal: React.FC<StaffEditModalProps> = ({ staff, isOpen, onClose, onSave, permissionTemplates, availableSites = [] }) => {
  const [formData, setFormData] = useState<Partial<StaffMember>>({});
  const [selectedSiteIds, setSelectedSiteIds] = useState<Set<string>>(new Set());
  const isNew = !staff;

  const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);

  useEffect(() => {
    if (isNew) {
      setFormData({ name: '', email: '', title: '', templateId: permissionTemplates.find(t => t.name === 'Login Only')?.id, status: 'Active', officeHours: defaultOfficeHours });
      setSelectedSiteIds(new Set());
    } else {
      setFormData({ ...staff });
      setSelectedSiteIds(new Set(staff?.siteIds || []));
    }
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [staff, isOpen, isNew, permissionTemplates, handleKeyDown]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof StaffMember, value: string) => {
    setFormData(prev => ({...prev, [name]: value}));
  }

  const handleSiteToggle = (siteId: string) => {
    const newSiteIds = new Set(selectedSiteIds);
    if (newSiteIds.has(siteId)) {
      newSiteIds.delete(siteId);
    } else {
      newSiteIds.add(siteId);
    }
    setSelectedSiteIds(newSiteIds);
  };

  const handleOfficeHoursChange = (newHours: OfficeHours[]) => {
    setFormData(prev => ({ ...prev, officeHours: newHours }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) {
        alert("Name and email are required.");
        return;
    }
    // Convert selected site IDs to array, undefined if empty (= main company)
    const siteIds = selectedSiteIds.size > 0 ? Array.from(selectedSiteIds) : undefined;
    const savedStaff = { ...formData, siteIds } as StaffMember;
    
    // Log the action
    if (isNew) {
      logAction('CREATE', 'STAFF', 'StaffMember', formData.id || 'NEW', `Created new staff member: ${formData.name}`, {
        entityName: formData.name,
        description: `Email: ${formData.email}, Title: ${formData.title}, Template: ${formData.templateId}, Sites: ${siteIds?.length || 0}`,
        level: 'success',
        metadata: {
          email: formData.email,
          title: formData.title,
          templateId: formData.templateId,
          siteIds,
        }
      });
    } else {
      // Track changes for UPDATE events
      const changes: Array<{ fieldName: string; oldValue: any; newValue: any }> = [];
      
      if (staff?.name !== formData.name) changes.push({ fieldName: 'name', oldValue: staff?.name, newValue: formData.name });
      if (staff?.title !== formData.title) changes.push({ fieldName: 'title', oldValue: staff?.title, newValue: formData.title });
      if (staff?.status !== formData.status) changes.push({ fieldName: 'status', oldValue: staff?.status, newValue: formData.status });
      if (staff?.templateId !== formData.templateId) changes.push({ fieldName: 'templateId', oldValue: staff?.templateId, newValue: formData.templateId });
      if (JSON.stringify(staff?.siteIds) !== JSON.stringify(siteIds)) changes.push({ fieldName: 'siteIds', oldValue: staff?.siteIds, newValue: siteIds });
      
      logAction('UPDATE', 'STAFF', 'StaffMember', staff?.id || 'UNKNOWN', `Updated staff member: ${formData.name}`, {
        entityName: formData.name,
        description: changes.length > 0 ? `Modified ${changes.length} field(s)` : 'No changes',
        changes: changes.length > 0 ? changes : undefined,
        level: 'success',
        metadata: {
          staffId: staff?.id,
          changedFields: changes.map(c => c.fieldName),
        }
      });
    }
    
    onSave(savedStaff);
  };

  const statuses: StaffStatus[] = ['Active', 'Pending Permissions', 'Deactivated'];
  const isLoginOnly = permissionTemplates.find(t => t.id === formData.templateId)?.name === 'Login Only';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
          <CardTitle>{isNew ? 'Add New Staff Member' : `Edit: ${staff?.name}`}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 -mt-1 -mr-2">
            <XIcon className="w-5 h-5" />
          </Button>
        </CardHeader>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex-grow flex flex-col overflow-hidden">
          <CardContent className="flex-grow overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">Full Name</label>
                  <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} disabled={!isNew} required className="mt-1"/>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Email Address</label>
                  <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} disabled={!isNew} required className="mt-1"/>
                </div>
            </div>
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-muted-foreground">Job Title</label>
                <Input id="title" name="title" value={formData.title || ''} onChange={handleInputChange} className="mt-1"/>
            </div>
            {!isNew && <div><label className="block text-sm font-medium text-muted-foreground">Source</label><Input value={formData.source} disabled className="mt-1"/></div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="templateId" className="block text-sm font-medium text-muted-foreground">Permission Template</label>
                  <Select value={formData.templateId} onValueChange={(v) => handleSelectChange('templateId', v)}><SelectTrigger id="templateId" className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{permissionTemplates.map(template => <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>)}</SelectContent></Select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-muted-foreground">Status</label>
                  <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v as StaffStatus)}><SelectTrigger id="status" className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{statuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select>
                </div>
            </div>
             {formData.status === 'Pending Permissions' && formData.source === 'Google Workspace' && (
                <div className="p-3 text-sm bg-yellow-100/50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 rounded-lg">
                    This user was automatically added via Google Workspace. Assign a suitable template and set their status to 'Active' to grant them portal access.
                </div>
            )}
             {isLoginOnly && (
                <div className="p-3 text-sm bg-orange-100/50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200 rounded-lg">
                    With this template, the user will be prompted to contact an administrator for full access.
                </div>
            )}
            {availableSites.length > 0 && (
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-muted-foreground mb-3">Site Assignments</label>
                <p className="text-xs text-muted-foreground mb-3">Select sites this staff member is assigned to (leave empty for main company only)</p>
                <div className="space-y-2">
                  {availableSites.map(site => (
                    <label key={site.id} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox 
                        checked={selectedSiteIds.has(site.id)}
                        onCheckedChange={() => handleSiteToggle(site.id)}
                      />
                      <span className="text-sm text-foreground">{site.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="border-t pt-4">
              <OfficeHoursEditor hours={formData.officeHours || []} onHoursChange={handleOfficeHoursChange} />
            </div>
          </CardContent>
          <CardFooter className="flex-shrink-0 flex justify-end items-center">
            <div className="space-x-3">
              <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default StaffEditModal;
