

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { mockAutomations, mockAutomationTriggers, mockAutomationActions, mockMessageTemplates, mockSystemAttributes, mockStaffList } from '../../lib/mockData';
import { Automation } from '../../types';
import AutomationEditModal from '../../components/staff/AutomationEditModal';
import { PlusCircleIcon, PencilIcon, CodeBracketIcon, BoltIcon } from '../../components/icons/Icon';

const statusStyles: { [key: string]: string } = {
  true: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  false: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

const AutomationsAdminPage: React.FC = () => {
    const [automations, setAutomations] = useState<Automation[]>(mockAutomations);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

    // FIX: Explicitly type the Map to ensure correct type inference for .get()
    const triggerMap = useMemo(() => new Map<string, string>(mockAutomationTriggers.map(t => [t.id, t.name])), []);
    const actionMap = useMemo(() => new Map<string, string>(mockAutomationActions.map(a => [a.id, a.name])), []);

    const handleAdd = () => {
        setEditingAutomation(null);
        setIsModalOpen(true);
    };

    const handleEdit = (automation: Automation) => {
        setEditingAutomation(automation);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAutomation(null);
    };

    const handleSave = (savedAutomation: Automation) => {
        if (editingAutomation) {
            setAutomations(prev => prev.map(a => a.id === savedAutomation.id ? savedAutomation : a));
        } else {
            setAutomations(prev => [...prev, { ...savedAutomation, id: `AUTO${Date.now()}` }]);
        }
        handleCloseModal();
    };
    
    const handleDelete = (automationId: string) => {
        if (window.confirm("Are you sure you want to delete this automation?")) {
            setAutomations(prev => prev.filter(a => a.id !== automationId));
            handleCloseModal();
        }
    };
    
    return (
        <div className="space-y-6">
             <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm -mt-4 sm:-mt-6 lg:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 border-b border-border">
                <div className="flex justify-end">
                    <Button onClick={handleAdd}><PlusCircleIcon className="w-4 h-4 mr-2"/> Add Automation</Button>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Automation Rules</CardTitle>
                    <CardDescription>Manage your automated workflows.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Automation</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Trigger</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {automations.map(auto => (
                                    <tr key={auto.id}>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <p className="font-semibold">{auto.name}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-xs">{auto.description}</p>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-2">
                                                <BoltIcon className="w-4 h-4 text-muted-foreground"/>
                                                <span>{triggerMap.get(auto.triggerId) || 'Unknown'}</span>
                                            </div>
                                            {auto.conditions && (
                                                <div title={`Conditions: ${auto.conditions}`} className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                    <CodeBracketIcon className="w-4 h-4"/>
                                                    <span>Conditional</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            <ul className="list-disc list-inside">
                                                {auto.actions.map((action, index) => (
                                                    <li key={index}>{actionMap.get(action.actionId) || 'Unknown Action'}</li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[String(auto.isActive)]}`}>
                                              {auto.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(auto)}><PencilIcon className="w-4 h-4 mr-1"/> Edit</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {isModalOpen && (
                <AutomationEditModal
                    automation={editingAutomation}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    triggers={mockAutomationTriggers}
                    actions={mockAutomationActions}
                    messageTemplates={mockMessageTemplates}
                    systemAttributes={mockSystemAttributes}
                    staffList={mockStaffList}
                />
            )}
        </div>
    );
};

export default AutomationsAdminPage;