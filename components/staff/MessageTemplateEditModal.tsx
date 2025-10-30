import React, { useState, useCallback, useEffect, useMemo } from 'react';
// FIX: Import the aliased AppMessageEvent type via the mock data import to resolve type conflicts.
import { MessageTemplate, MessageTarget, BaseApiConfig, EndpointDefinition, MessageEvent as AppMessageEvent } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { mockMessageEvents } from '../../lib/mockData';
import { XIcon, TrashIcon } from '../icons/Icon';
import { Checkbox } from '../ui/checkbox';
import CodeEditor from '../ui/CodeEditor';
import { parsePlaceholdersToVariables } from '../../lib/variables';

interface MessageTemplateEditModalProps {
  template: MessageTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: MessageTemplate) => void;
  onDelete: (templateId: string) => void;
  baseApis: BaseApiConfig[];
  endpoints: EndpointDefinition[];
}

const messageTargets: MessageTarget[] = ['Customer', 'Driver', 'Account', 'Staff'];

const MessageTemplateEditModal: React.FC<MessageTemplateEditModalProps> = ({ template, isOpen, onClose, onSave, onDelete, baseApis, endpoints }) => {
  const [formData, setFormData] = useState<Partial<MessageTemplate>>({});
  const isNew = !template;

  const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);
  
  useEffect(() => {
    setFormData(isNew ? { eventId: mockMessageEvents[0].id, target: 'Customer', name: '', content: '', deliveryMethod: 'Default' } : { ...template });
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [template, isOpen, isNew, handleKeyDown]);
  
  const selectedEvent = useMemo(() => {
      return mockMessageEvents.find(e => e.id === formData.eventId);
  }, [formData.eventId]);

  const availableVariables = useMemo(() => {
    if (!selectedEvent) return {};
    return parsePlaceholdersToVariables(selectedEvent.availablePlaceholders);
  }, [selectedEvent]);

  const apiEndpointOptions = useMemo(() => {
    const apiMap = new Map(baseApis.map(api => [api.id, api.name]));
    return endpoints.map(endpoint => ({
        id: endpoint.id,
        label: `${endpoint.method} /${apiMap.get(endpoint.baseApiId) || '?'}/${endpoint.path} - ${endpoint.name}`
    }));
  }, [baseApis, endpoints]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.content) {
      alert('Template Name and Content are required.');
      return;
    }
    onSave(formData as MessageTemplate);
  };
  
  const handleInsertPlaceholder = (placeholder: string) => {
      setFormData(prev => ({...prev, content: `${prev.content || ''}{{${placeholder}}}`}));
  };

  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="relative bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="sticky top-0 bg-card px-6 py-4 border-b border-border flex justify-between items-center z-10">
          <h2 className="text-xl font-bold">{isNew ? 'Add New Message Template' : 'Edit Message Template'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><XIcon className="w-6 h-6" /></Button>
        </header>
        
        <form className="flex-grow overflow-y-auto" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-muted-foreground">Template Name</label>
                        <Input name="name" value={formData.name || ''} onChange={handleInputChange} required className="mt-1" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-muted-foreground">Status</label>
                        <p className="mt-1 h-10 flex items-center text-sm font-medium text-green-600 dark:text-green-400">Active</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground">Trigger Event</label>
                        <Select value={formData.eventId} onValueChange={(v) => handleSelectChange('eventId', v)}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {mockMessageEvents.map(event => <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">{selectedEvent?.description}</p>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-muted-foreground">Target Audience</label>
                        <Select value={formData.target} onValueChange={(v) => handleSelectChange('target', v as MessageTarget)}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {messageTargets.map(target => <SelectItem key={target} value={target}>{target}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-muted-foreground">Message Content</label>
                        <Textarea name="content" value={formData.content || ''} onChange={handleInputChange} rows={8} className="mt-1"/>
                    </div>
                    <div className="md:col-span-1 flex flex-col">
                        <label className="block text-sm font-medium text-muted-foreground">Available Placeholders</label>
                        <div className="mt-1 p-2 border rounded-lg flex-grow overflow-y-auto bg-background">
                            {selectedEvent?.availablePlaceholders.map(p => (
                                <button type="button" key={p} onClick={() => handleInsertPlaceholder(p)} className="block w-full text-left text-xs font-mono p-1 rounded hover:bg-muted">
                                    {`{{${p}}}`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                 <div>
                    <label className="block text-sm font-medium text-muted-foreground">Conditions</label>
                    <CodeEditor
                        language="js"
                        value={formData.conditions || ''}
                        onChange={(v) => handleSelectChange('conditions', v)}
                        placeholder="e.g., booking.price > 100"
                        availableVariables={availableVariables}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                        <p>Optional. The message will only send if this expression evaluates to true. Available variables:</p>
                        <div className="flex flex-wrap gap-x-2 mt-1">{availableVariables && Object.keys(availableVariables).map(v => <code key={v} className="bg-muted p-0.5 rounded">{v}</code>)}</div>
                    </div>
                </div>
                
                <fieldset className="space-y-4">
                    <legend className="text-md font-semibold text-foreground border-b pb-2">Delivery & Scheduling</legend>
                    {formData.target === 'Staff' && (
                         <div className="flex items-center space-x-2">
                            <Checkbox id="isNotice" checked={formData.isNotice} onCheckedChange={(checked) => setFormData(p => ({...p, isNotice: !!checked}))} />
                            <label htmlFor="isNotice" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Display as a Staff Notice on Profile
                            </label>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground">Scheduled Send Time (Optional)</label>
                        <Input 
                            type="datetime-local" 
                            name="scheduledTime"
                            value={formatDateForInput(formData.scheduledTime)}
                            onChange={(e) => handleSelectChange('scheduledTime', e.target.value ? new Date(e.target.value).toISOString() : '')}
                            className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Leave blank to send immediately when the trigger event occurs.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground">Delivery Method</label>
                            <Select value={formData.deliveryMethod || 'Default'} onValueChange={(v) => handleSelectChange('deliveryMethod', v)}>
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Default">Default</SelectItem>
                                    <SelectItem value="API">API Endpoint</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {formData.deliveryMethod === 'API' && (
                             <div>
                                <label className="block text-sm font-medium text-muted-foreground">API Endpoint</label>
                                <Select value={formData.apiEndpointId} onValueChange={(v) => handleSelectChange('apiEndpointId', v)}>
                                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select an endpoint..."/></SelectTrigger>
                                    <SelectContent>
                                        {apiEndpointOptions.map(opt => <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </fieldset>
            </div>
            <footer className="sticky bottom-0 bg-card/80 backdrop-blur-sm p-4 border-t border-border flex justify-between items-center">
                <Button type="button" onClick={() => onDelete(formData.id!)} variant="destructive" disabled={isNew}><TrashIcon className="w-4 h-4 mr-2" />Delete Template</Button>
                <div className="space-x-3">
                    <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                    <Button type="submit">Save Template</Button>
                </div>
            </footer>
        </form>
      </div>
    </div>
  );
};

export default MessageTemplateEditModal;