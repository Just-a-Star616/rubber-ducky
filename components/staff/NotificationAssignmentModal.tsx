
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StaffMember } from '../../types';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { XIcon } from '../icons/Icon';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Input } from '../ui/input';

interface NotificationAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (assignedIds: Set<string>) => void;
    staffList: StaffMember[];
    assignedIds: Set<string>;
    notificationType: string;
}

const NotificationAssignmentModal: React.FC<NotificationAssignmentModalProps> = ({ isOpen, onClose, onSave, staffList, assignedIds, notificationType }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(assignedIds));
    const [searchTerm, setSearchTerm] = useState('');
    const [isAllSelected, setIsAllSelected] = useState(false);

    const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);
    useEffect(() => { if (isOpen) document.addEventListener('keydown', handleKeyDown); return () => document.removeEventListener('keydown', handleKeyDown); }, [isOpen, handleKeyDown]);

    const filteredStaff = useMemo(() => staffList.filter(staff => 
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        staff.email.toLowerCase().includes(searchTerm.toLowerCase())
    ), [staffList, searchTerm]);

    const filteredStaffIds = useMemo(() => new Set(filteredStaff.map(s => s.id)), [filteredStaff]);

    useEffect(() => {
        if (filteredStaffIds.size === 0) {
            setIsAllSelected(false);
            return;
        }
        const allFilteredAreSelected = [...filteredStaffIds].every(id => selectedIds.has(id));
        setIsAllSelected(allFilteredAreSelected);
    }, [selectedIds, filteredStaffIds]);

    if (!isOpen) return null;

    const handleToggle = (staffId: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(staffId)) {
                newSet.delete(staffId);
            } else {
                newSet.add(staffId);
            }
            return newSet;
        });
    };

    const handleSelectAll = (isChecked: boolean) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (isChecked) {
                filteredStaffIds.forEach(id => newSet.add(id));
            } else {
                filteredStaffIds.forEach(id => newSet.delete(id));
            }
            return newSet;
        });
    };
    
    const handleSave = () => {
        onSave(selectedIds);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <Card className="w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle>Manage Assignees ({selectedIds.size} selected)</CardTitle>
                        <p className="text-sm text-muted-foreground">{notificationType}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 -mt-1 -mr-2"><XIcon className="w-5 h-5" /></Button>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col overflow-hidden">
                    <Input placeholder="Search staff..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <div className="mt-4 border rounded-lg flex-grow flex flex-col overflow-hidden">
                        <div className="flex-shrink-0 border-b p-2">
                             <label htmlFor="select-all" className="flex items-center space-x-3 p-1 cursor-pointer">
                                <Checkbox
                                    id="select-all"
                                    checked={isAllSelected}
                                    onCheckedChange={handleSelectAll}
                                    disabled={filteredStaff.length === 0}
                                />
                                <span className="text-sm font-medium">Select All ({filteredStaff.length} visible)</span>
                            </label>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                             <div className="space-y-1 p-1">
                                {filteredStaff.map(staff => (
                                    <label key={staff.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                                        <Checkbox
                                            id={`staff-${staff.id}`}
                                            checked={selectedIds.has(staff.id)}
                                            onCheckedChange={() => handleToggle(staff.id)}
                                        />
                                        <img src={staff.avatarUrl} alt={staff.name} className="h-8 w-8 rounded-full" />
                                        <div className="flex-grow">
                                            <p className="text-sm font-medium">{staff.name}</p>
                                            <p className="text-xs text-muted-foreground">{staff.title}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-end space-x-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default NotificationAssignmentModal;
