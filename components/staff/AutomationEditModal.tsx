


import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Automation, AutomationTrigger, AutomationAction, MessageTemplate, SystemAttribute, StaffMember } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { XIcon, TrashIcon, PlusCircleIcon } from '../icons/Icon';
import { Checkbox } from '../ui/checkbox';
import CodeEditor from '../ui/CodeEditor';

interface AutomationEditModalProps {
    automation: Automation | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (automation: Automation) => void;
    onDelete: (automationId: string) => void;
    triggers: AutomationTrigger[];
    actions: AutomationAction[];
    messageTemplates: MessageTemplate[];
    systemAttributes: SystemAttribute[];
    staffList: StaffMember[];
}

const AutomationEditModal: React.FC<AutomationEditModalProps> = ({ isOpen, onClose, onSave, onDelete, automation, triggers, actions, messageTemplates, systemAttributes, staffList }) => {
    const [formData, setFormData] = useState<Partial<Automation>>({});
    const isNew = !automation;

    const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);
    useEffect(() => {
        setFormData(isNew ? { name: '', description: '', isActive: true, triggerId: triggers[0].id, conditions: '', actions: [] } : JSON.parse(JSON.stringify(automation)));
        if (isOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [automation, isOpen, isNew, triggers, handleKeyDown]);
    
    const selectedTrigger = useMemo(() => triggers.find(t => t.id === formData.triggerId), [formData.triggerId, triggers]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleActionChange = (index: number, actionId: string) => {
        const newActions = [...(formData.actions || [])];
        newActions[index] = { actionId, parameters: {} };
        setFormData(prev => ({ ...prev, actions: newActions }));
    };

    const handleActionParamChange = (index: number, paramId: string, value: any) => {
        const newActions = [...(formData.actions || [])];
        newActions[index].parameters[paramId] = value;
        setFormData(prev => ({ ...prev, actions: newActions }));
    };
    
    const addAction = () => setFormData(prev => ({ ...prev, actions: [...(prev.actions || []), { actionId: actions[0].id, parameters: {} }] }));
    const removeAction = (index: number) => setFormData(prev => ({ ...prev, actions: (prev.actions || []).filter((_, i) => i !== index) }));

    const handleSave = () => {
        if (!formData.name) return alert('Automation name is required.');
        onSave(formData as Automation);
    };

    const renderActionParams = (action: { actionId: string; parameters: Record<string, any> }, index: number) => {
        const actionDef = actions.find(a => a.id === action.actionId);
        if (!actionDef) return null;

        return (
            <div className="pl-4 border-l-2 ml-4 mt-2 space-y-2">
                {actionDef.parameters.map(param => (
                    <div key={param.id}>
                        <label className="text-xs font-medium text-muted-foreground">{param.name}</label>
                        {param.type === 'string' && <Input type="text" value={action.parameters[param.id] || ''} onChange={(e) => handleActionParamChange(index, param.id, e.target.value)} className="mt-1" />}
                        {param.type === 'number' && <Input type="number" value={action.parameters[param.id] || ''} onChange={(e) => handleActionParamChange(index, param.id, parseFloat(e.target.value) || 0)} className="mt-1" />}
                        {param.type === 'template' && (
                            <Select value={action.parameters[param.id]} onValueChange={(v) => handleActionParamChange(index, param.id, v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select a template..." /></SelectTrigger><SelectContent>{messageTemplates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select>
                        )}
                        {param.type === 'attribute' && (
                            <Select value={action.parameters[param.id]} onValueChange={(v) => handleActionParamChange(index, param.id, v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select an attribute..." /></SelectTrigger><SelectContent>{systemAttributes.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select>
                        )}
                        {param.type === 'staffMember' && (
                            <Select value={action.parameters[param.id]} onValueChange={(v) => handleActionParamChange(index, param.id, v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select a staff member..." /></SelectTrigger><SelectContent>{staffList.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="relative bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="sticky top-0 bg-card px-6 py-4 border-b border-border flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold">{isNew ? 'Create Automation Rule' : 'Edit Automation Rule'}</h2>
                    <Button type="button" variant="ghost" size="icon" onClick={onClose}><XIcon className="w-6 h-6" /></Button>
                </header>
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    <Input name="name" placeholder="Automation Name" value={formData.name || ''} onChange={handleInputChange} className="text-lg font-semibold" required />
                    <Textarea name="description" placeholder="A brief description of what this automation does..." value={formData.description || ''} onChange={handleInputChange} rows={2} />

                    <fieldset><legend className="font-semibold mb-2">Trigger</legend>
                        <Select value={formData.triggerId} onValueChange={(v) => setFormData(p => ({...p, triggerId: v}))}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>{triggers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">{selectedTrigger?.description}</p>
                    </fieldset>

                    <fieldset><legend className="font-semibold mb-2">Conditions</legend>
                        <CodeEditor
                            language="js"
                            value={formData.conditions || ''}
                            onChange={(v) => setFormData(p => ({...p, conditions: v}))}
                            placeholder="e.g., booking.price > 100"
                            availableVariables={selectedTrigger?.availableVariables}
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                            <p>Optional. Rule only runs if this JS expression is true. Available variables:</p>
                            <div className="flex flex-wrap gap-x-2">{selectedTrigger?.availableVariables && Object.keys(selectedTrigger.availableVariables).map(v => <code key={v} className="bg-muted p-0.5 rounded">{v}</code>)}</div>
                        </div>
                    </fieldset>

                    <fieldset><legend className="font-semibold mb-2">Actions</legend>
                        <div className="space-y-4">
                            {(formData.actions || []).map((action, index) => (
                                <div key={index} className="p-3 border rounded-lg bg-background">
                                    <div className="flex items-center gap-2">
                                        <Select value={action.actionId} onValueChange={(v) => handleActionChange(index, v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{actions.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select>
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeAction(index)}><TrashIcon className="w-4 h-4"/></Button>
                                    </div>
                                    {renderActionParams(action, index)}
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={addAction}><PlusCircleIcon className="w-4 h-4 mr-2"/> Add Action</Button>
                        </div>
                    </fieldset>

                    <div className="flex items-center space-x-2 pt-4 border-t">
                        <Checkbox id="isActive" checked={formData.isActive} onCheckedChange={(checked) => setFormData(p => ({ ...p, isActive: !!checked }))} />
                        <label htmlFor="isActive" className="text-sm font-medium">Enable this automation</label>
                    </div>
                </div>

                <footer className="sticky bottom-0 bg-card/80 backdrop-blur-sm p-4 border-t border-border flex justify-between items-center">
                    <Button type="button" onClick={() => onDelete(formData.id!)} variant="destructive" disabled={isNew}><TrashIcon className="w-4 h-4 mr-2"/> Delete</Button>
                    <div className="space-x-3">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Automation</Button>
                    </div>
                </footer>
            </form>
        </div>
    );
};

export default AutomationEditModal;