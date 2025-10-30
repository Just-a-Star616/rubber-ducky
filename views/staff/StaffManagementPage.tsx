



import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { mockStaffList, mockPermissionTemplates } from '../../lib/mockData';
import { StaffMember, StaffStatus, StaffSource, PermissionTemplate } from '../../types';
import StaffEditModal from '../../components/staff/StaffEditModal';
import PermissionTemplateEditModal from '../../components/staff/PermissionTemplateEditModal';

const statusStyles: { [key in StaffStatus]: string } = {
  Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Pending Permissions': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Deactivated: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

type SortKey = 'name' | 'email' | 'source' | 'templateId' | 'status';
type SortDirection = 'asc' | 'desc';

const StaffManagementPage: React.FC = () => {
    const [staffList, setStaffList] = useState<StaffMember[]>(mockStaffList);
    const [permissionTemplates, setPermissionTemplates] = useState<PermissionTemplate[]>(mockPermissionTemplates);

    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<PermissionTemplate | null>(null);
    
    const [sortBy, setSortBy] = useState<SortKey>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const templateNameMap = useMemo(() => 
        new Map(permissionTemplates.map(t => [t.id, t.name])), 
    [permissionTemplates]);

    // --- Staff Handlers ---
    const handleOpenStaffModal = (staff: StaffMember | null) => {
        setEditingStaff(staff);
        setIsStaffModalOpen(true);
    };
    const handleCloseStaffModal = () => {
        setIsStaffModalOpen(false);
        setEditingStaff(null);
    };
    const handleSaveStaff = (savedStaff: StaffMember) => {
        if (editingStaff) { // Editing
            setStaffList(prev => prev.map(s => s.id === savedStaff.id ? savedStaff : s));
        } else { // Adding new
            const newStaff: StaffMember = {
                ...savedStaff,
                id: `SM${Date.now()}`,
                avatarUrl: `https://picsum.photos/seed/SM${Date.now()}/100/100`,
                officeHours: [],
                source: 'Manual',
            };
            setStaffList(prev => [...prev, newStaff]);
        }
        handleCloseStaffModal();
    };

    // --- Template Handlers ---
    const handleOpenTemplateModal = (template: PermissionTemplate | null) => {
        setEditingTemplate(template);
        setIsTemplateModalOpen(true);
    };
    const handleCloseTemplateModal = () => {
        setIsTemplateModalOpen(false);
        setEditingTemplate(null);
    };
    const handleSaveTemplate = (savedTemplate: PermissionTemplate) => {
        if (editingTemplate) { // Editing
            setPermissionTemplates(prev => prev.map(t => t.id === savedTemplate.id ? savedTemplate : t));
        } else { // Adding new
            setPermissionTemplates(prev => [...prev, { ...savedTemplate, id: `t-${Date.now()}` }]);
        }
        handleCloseTemplateModal();
    };
    const handleDeleteTemplate = (templateId: string) => {
        if (staffList.some(s => s.templateId === templateId)) {
            alert("Cannot delete a template that is currently assigned to staff members.");
            return;
        }
         if (window.confirm("Are you sure you want to delete this permission template?")) {
            setPermissionTemplates(prev => prev.filter(t => t.id !== templateId));
            handleCloseTemplateModal();
        }
    };

    const handleSort = (key: SortKey) => {
        if (sortBy === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortDirection('asc');
        }
    };
    
    const sortedStaffList = useMemo(() => {
        return [...staffList].sort((a, b) => {
            let valA: string, valB: string;
            if (sortBy === 'templateId') {
                valA = (templateNameMap.get(a.templateId) || '').toLowerCase();
                valB = (templateNameMap.get(b.templateId) || '').toLowerCase();
            } else {
                valA = a[sortBy].toLowerCase();
                valB = b[sortBy].toLowerCase();
            }
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [staffList, sortBy, sortDirection, templateNameMap]);

    const SortableHeader = ({ sortKey, children }: { sortKey: SortKey, children: React.ReactNode }) => (
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer" onClick={() => handleSort(sortKey)}>
            <div className="flex items-center">
                <span>{children}</span>
                {sortBy === sortKey && <span className="ml-2">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
            </div>
        </th>
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Permission Templates</CardTitle>
                        <Button onClick={() => handleOpenTemplateModal(null)}>Add New Template</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {permissionTemplates.map(template => (
                            <button 
                                key={template.id} 
                                onClick={() => handleOpenTemplateModal(template)}
                                className="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-100 rounded-lg hover:bg-primary-200 dark:bg-primary-900/50 dark:text-primary-200 dark:hover:bg-primary-900"
                            >
                                {template.name}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Staff List</CardTitle>
                        <Button onClick={() => handleOpenStaffModal(null)}>Add Staff Member</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted/50">
                                <tr>
                                    <SortableHeader sortKey="name">Name</SortableHeader>
                                    <SortableHeader sortKey="email">Email</SortableHeader>
                                    <SortableHeader sortKey="source">Source</SortableHeader>
                                    <SortableHeader sortKey="templateId">Permission Template</SortableHeader>
                                    <SortableHeader sortKey="status">Status</SortableHeader>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {sortedStaffList.map(staff => (
                                    <tr key={staff.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img className="h-10 w-10 rounded-full" src={staff.avatarUrl} alt={staff.name} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-foreground">{staff.name}</div>
                                                    <div className="text-sm text-muted-foreground">{staff.title}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{staff.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{staff.source}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                            {templateNameMap.get(staff.templateId) || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[staff.status]}`}>
                                                {staff.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Button variant="link" size="sm" onClick={() => handleOpenStaffModal(staff)} className="px-0">Edit</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {isStaffModalOpen && (
                <StaffEditModal
                    staff={editingStaff}
                    isOpen={isStaffModalOpen}
                    onClose={handleCloseStaffModal}
                    onSave={handleSaveStaff}
                    permissionTemplates={permissionTemplates}
                />
            )}

            {isTemplateModalOpen && (
                <PermissionTemplateEditModal
                    template={editingTemplate}
                    isOpen={isTemplateModalOpen}
                    onClose={handleCloseTemplateModal}
                    onSave={handleSaveTemplate}
                    onDelete={handleDeleteTemplate}
                />
            )}
        </div>
    );
};

export default StaffManagementPage;
