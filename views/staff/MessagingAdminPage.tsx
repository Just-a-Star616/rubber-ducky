

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
// FIX: Import the aliased AppMessageEvent type via the mock data import to resolve type conflicts.
import { mockMessageEvents, mockMessageTemplates, mockBaseApis, mockEndpointDefinitions, mockStaffList } from '../../lib/mockData';
import { MessageTemplate, StaffMember, MessageEvent as AppMessageEvent } from '../../types';
import MessageTemplateEditModal from '../../components/staff/MessageTemplateEditModal';
import NotificationAssignmentModal from '../../components/staff/NotificationAssignmentModal';
import { PencilIcon, PlusCircleIcon, CodeBracketIcon, ClockIcon, ServerStackIcon, XIcon, TrashIcon } from '../../components/icons/Icon';

interface AssignmentGroup {
    id: string;
    name: string;
    description: string;
    assignedIds: Set<string>;
}

const MessagingAdminPage: React.FC = () => {
    const [templates, setTemplates] = useState<MessageTemplate[]>(mockMessageTemplates);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

    const [assignmentGroups, setAssignmentGroups] = useState<AssignmentGroup[]>([
        {
            id: 'AG01',
            name: 'Driver Document Updates',
            description: 'Receive alerts for expiring or updated driver documents.',
            assignedIds: new Set(['SM01', 'SM03']),
        }
    ]);
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');

    const handleSaveAssignments = (newIds: Set<string>) => {
        if (editingGroupId) {
            setAssignmentGroups(prev => prev.map(g => g.id === editingGroupId ? {...g, assignedIds: newIds} : g));
        }
        setEditingGroupId(null);
    };

    const handleCreateNewGroup = () => {
        if (!newGroupName.trim()) return;
        const newGroup: AssignmentGroup = {
            id: `AG${Date.now()}`,
            name: newGroupName,
            description: newGroupDescription,
            assignedIds: new Set(),
        };
        setAssignmentGroups(prev => [...prev, newGroup]);
        setNewGroupName('');
        setNewGroupDescription('');
        setIsCreatingNewGroup(false);
    };

    const handleDeleteGroup = (groupId: string) => {
        if (window.confirm('Are you sure you want to delete this assignment group?')) {
            setAssignmentGroups(prev => prev.filter(g => g.id !== groupId));
        }
    };

    const groupedTemplates = useMemo(() => {
        return mockMessageEvents.map(event => ({
            ...event,
            templates: templates.filter(t => t.eventId === event.id),
        }));
    }, [templates]);

    const handleAddTemplate = () => {
        setEditingTemplate(null);
        setIsModalOpen(true);
    };

    const handleEditTemplate = (template: MessageTemplate) => {
        setEditingTemplate(template);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTemplate(null);
    };

    const handleSaveTemplate = (savedTemplate: MessageTemplate) => {
        if (editingTemplate) { // Editing
            setTemplates(prev => prev.map(t => t.id === savedTemplate.id ? savedTemplate : t));
        } else { // Adding new
            setTemplates(prev => [...prev, { ...savedTemplate, id: `TPL${Date.now()}` }]);
        }
        handleCloseModal();
    };
    
    const handleDeleteTemplate = (templateId: string) => {
        if (window.confirm("Are you sure you want to delete this message template?")) {
            setTemplates(prev => prev.filter(t => t.id !== templateId));
            handleCloseModal();
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm -mt-4 sm:-mt-6 lg:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 border-b border-border">
                <div className="flex justify-end">
                    <Button onClick={handleAddTemplate}><PlusCircleIcon className="w-4 h-4 mr-2"/> Add Template</Button>
                </div>
            </div>
            
            <Card>
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle>Notification Assignments</CardTitle>
                        <CardDescription>Assign staff members to receive system notifications for specific events.</CardDescription>
                    </div>
                    <Button onClick={() => setIsCreatingNewGroup(true)} variant="outline" size="sm"><PlusCircleIcon className="w-4 h-4 mr-2"/> New Assignment Group</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isCreatingNewGroup && (
                        <div className="p-4 border border-dashed rounded-lg bg-muted/20 space-y-3">
                            <h4 className="font-semibold">Create New Assignment Group</h4>
                            <Input 
                                placeholder="Group name (e.g., Driver Incidents)" 
                                value={newGroupName} 
                                onChange={(e) => setNewGroupName(e.target.value)}
                            />
                            <Input 
                                placeholder="Description (e.g., Receive alerts for driver incidents)" 
                                value={newGroupDescription} 
                                onChange={(e) => setNewGroupDescription(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => { setIsCreatingNewGroup(false); setNewGroupName(''); setNewGroupDescription(''); }}>Cancel</Button>
                                <Button onClick={handleCreateNewGroup} disabled={!newGroupName.trim()}>Create Group</Button>
                            </div>
                        </div>
                    )}
                    
                    <div className="space-y-3">
                        {assignmentGroups.map(group => {
                            const assignedStaff = mockStaffList.filter(s => group.assignedIds.has(s.id));
                            return (
                                <div key={group.id} className="p-4 border rounded-lg bg-background hover:bg-muted/20 transition">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-grow">
                                            <h4 className="font-semibold">{group.name}</h4>
                                            <p className="text-sm text-muted-foreground">{group.description}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="secondary" 
                                                size="sm"
                                                onClick={() => {
                                                    setEditingGroupId(group.id);
                                                    setIsAssignmentModalOpen(true);
                                                }}
                                            >
                                                Manage Assignees
                                            </Button>
                                            {assignmentGroups.length > 1 && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleDeleteGroup(group.id)}
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <p className="text-sm font-medium">Assigned to:</p>
                                        {assignedStaff.length > 0 ? (
                                            assignedStaff.map(staff => (
                                                <div key={staff.id} className="flex items-center space-x-2 bg-muted rounded-full px-2 py-1">
                                                    <img src={staff.avatarUrl} alt={staff.name} className="h-5 w-5 rounded-full" />
                                                    <span className="text-xs font-medium">{staff.name}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">No staff assigned.</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-8">
                {groupedTemplates.map(group => (
                    <Card key={group.id}>
                        <CardHeader>
                            <CardTitle>Message Templates: {group.name}</CardTitle>
                            <CardDescription>{group.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {group.templates.length > 0 ? (
                                <ul className="divide-y divide-border border rounded-lg">
                                    {group.templates.map(template => (
                                        <li key={template.id} className="p-3 flex justify-between items-center hover:bg-muted/50">
                                            <div>
                                                <p className="font-semibold">{template.name}</p>
                                                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                                                    <span>Target: <span className="font-medium text-foreground">{template.target}</span></span>
                                                    {template.conditions && (
                                                        <div className="flex items-center space-x-1" title={template.conditions}>
                                                            <CodeBracketIcon className="w-4 h-4" />
                                                            <span>Conditional</span>
                                                        </div>
                                                    )}
                                                     {template.scheduledTime && (
                                                        <div className="flex items-center space-x-1" title={`Scheduled for ${new Date(template.scheduledTime).toLocaleString()}`}>
                                                            <ClockIcon className="w-4 h-4" />
                                                            <span>Scheduled</span>
                                                        </div>
                                                    )}
                                                     {template.deliveryMethod === 'API' && (
                                                        <div className="flex items-center space-x-1" title={`Uses API Endpoint`}>
                                                            <ServerStackIcon className="w-4 h-4" />
                                                            <span>API Delivery</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                                                <PencilIcon className="w-4 h-4 mr-2" />
                                                Edit
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-sm text-muted-foreground py-4">No templates configured for this event.</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            {isModalOpen && (
                <MessageTemplateEditModal
                    template={editingTemplate}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveTemplate}
                    onDelete={handleDeleteTemplate}
                    baseApis={mockBaseApis}
                    endpoints={mockEndpointDefinitions}
                />
            )}

            {isAssignmentModalOpen && editingGroupId && (
                <NotificationAssignmentModal
                    isOpen={isAssignmentModalOpen}
                    onClose={() => { setIsAssignmentModalOpen(false); setEditingGroupId(null); }}
                    onSave={handleSaveAssignments}
                    staffList={mockStaffList}
                    assignedIds={assignmentGroups.find(g => g.id === editingGroupId)?.assignedIds || new Set()}
                    notificationType={assignmentGroups.find(g => g.id === editingGroupId)?.name || ''}
                />
            )}
        </div>
    );
};

export default MessagingAdminPage;