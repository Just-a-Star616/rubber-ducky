
import React, { useState, useEffect, useCallback } from 'react';
import { SiteDetails, OfficeHours } from '../../types';
import { Button } from '../ui/button';
import { XIcon, TrashIcon } from '../icons/Icon';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

interface SiteEditModalProps {
  site: Partial<SiteDetails> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (site: SiteDetails) => void;
  onDelete: (siteId: string) => void;
}

const FormField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-muted-foreground">{label}</label>
        <Input {...props} className="mt-1" />
    </div>
);

const TextareaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-muted-foreground">{label}</label>
        <Textarea {...props} className="mt-1" />
    </div>
);

const OfficeHoursEditor = ({ hours, onHoursChange }: { hours: OfficeHours[], onHoursChange: (hours: OfficeHours[]) => void }) => {
    const handleHourChange = (day: string, field: keyof OfficeHours, value: string | boolean) => {
        const newHours = hours.map(h => h.day === day ? { ...h, [field]: value } : h);
        onHoursChange(newHours);
    };

    return (
        <div className="space-y-3">
            <h4 className="text-md font-medium text-card-foreground">Opening Hours</h4>
            {hours.map(h => (
                <div key={h.day} className="p-3 rounded-lg bg-background">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm text-card-foreground">{h.day}</span>
                        <div className="flex items-center">
                            <label htmlFor={`isOff-${h.day}`} className="mr-2 text-sm text-card-foreground/70">Off</label>
                            <input type="checkbox" id={`isOff-${h.day}`} checked={h.isOff} onChange={(e) => handleHourChange(h.day, 'isOff', e.target.checked)} className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500" />
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

const defaultHours: OfficeHours[] = [
    { day: 'Monday', isOff: false, start: '09:00', end: '17:00' },
    { day: 'Tuesday', isOff: false, start: '09:00', end: '17:00' },
    { day: 'Wednesday', isOff: false, start: '09:00', end: '17:00' },
    { day: 'Thursday', isOff: false, start: '09:00', end: '17:00' },
    { day: 'Friday', isOff: false, start: '09:00', end: '17:00' },
    { day: 'Saturday', isOff: true, start: '00:00', end: '00:00' },
    { day: 'Sunday', isOff: true, start: '00:00', end: '00:00' },
];

const SiteEditModal: React.FC<SiteEditModalProps> = ({ site, isOpen, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState<Partial<SiteDetails>>({});
    const isNew = !site?.id;

    const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);

    useEffect(() => {
        setFormData(isNew ? { name: '', officeHours: defaultHours } : { ...site });
        if (isOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [site, isOpen, isNew, handleKeyDown]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleHoursChange = (newHours: OfficeHours[]) => {
        setFormData(prev => ({ ...prev, officeHours: newHours }));
    }

    const handleSave = () => {
        if (!formData.name) {
            alert("Site name is required.");
            return;
        }
        onSave(formData as SiteDetails);
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{isNew ? 'Add New Site' : `Edit Site: ${site?.name}`}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 -mt-1 -mr-2">
                        <XIcon className="w-5 h-5" />
                    </Button>
                </CardHeader>
                <form className="flex-grow flex flex-col overflow-hidden" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <CardContent className="flex-grow overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <FormField label="Site Name (inc. Service Area)" id="name" name="name" value={formData.name || ''} onChange={handleInputChange} required />
                            <TextareaField label="Address" id="address" name="address" value={formData.address || ''} onChange={handleInputChange} rows={3} />
                            <FormField label="Booking Telephone" id="bookingTel" name="bookingTel" value={formData.bookingTel || ''} onChange={handleInputChange} />
                            <FormField label="Office Email" id="officeEmail" name="officeEmail" type="email" value={formData.officeEmail || ''} onChange={handleInputChange} />
                            <FormField label="Area Manager Name" id="areaManagerName" name="areaManagerName" value={formData.areaManagerName || ''} onChange={handleInputChange} />
                            <FormField label="Area Manager Email" id="areaManagerEmail" name="areaManagerEmail" type="email" value={formData.areaManagerEmail || ''} onChange={handleInputChange} />
                        </div>
                        <div>
                            <OfficeHoursEditor hours={formData.officeHours || []} onHoursChange={handleHoursChange} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex-shrink-0 flex justify-between items-center">
                        <Button type="button" onClick={() => onDelete(formData.id!)} variant="destructive" disabled={isNew}><TrashIcon className="w-4 h-4 mr-2"/>Delete Site</Button>
                        <div className="space-x-3">
                            <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                            <Button type="submit">Save Site</Button>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};
export default SiteEditModal;
