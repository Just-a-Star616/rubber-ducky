
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WebhookDefinition, WebhookEvent } from '../../types';
import { Button } from '../ui/button';
import { XIcon, TrashIcon } from '../icons/Icon';
import CodeEditor from '../ui/CodeEditor';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface WebhookEditModalProps {
  webhook: WebhookDefinition | null;
  events: WebhookEvent[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (webhook: WebhookDefinition) => void;
  onDelete: (webhookId: string) => void;
}

const WebhookEditModal: React.FC<WebhookEditModalProps> = ({ webhook, events, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<WebhookDefinition>>({});
  const isNew = !webhook?.id;

  const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    setFormData(isNew ? { eventName: events[0]?.name, targetUrl: '', status: 'Active', bodyTemplate: '{\n  "key": "value"\n}', headerTemplate: '{\n  "Content-Type": "application/json"\n}', conditions: '' } : { ...webhook });
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [webhook, isOpen, isNew, events, handleKeyDown]);
  
  const selectedEvent = useMemo(() => {
      return events.find(e => e.name === formData.eventName);
  }, [formData.eventName, events]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = () => { onSave(formData as WebhookDefinition); };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isNew ? 'Add Webhook' : 'Edit Webhook'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 -mt-1 -mr-2"><XIcon className="w-5 h-5" /></Button>
        </CardHeader>
        <form className="flex-grow overflow-y-auto" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="eventName" className="block text-sm font-medium text-muted-foreground">Trigger Event</label>
              <Select value={formData.eventName} onValueChange={(v) => setFormData(p => ({...p, eventName: v}))}>
                <SelectTrigger id="eventName" className="mt-1"><SelectValue/></SelectTrigger>
                <SelectContent>{events.map(event => <SelectItem key={event.id} value={event.name}>{event.name}</SelectItem>)}</SelectContent>
              </Select>
              {selectedEvent && <p className="text-xs text-muted-foreground mt-1">{selectedEvent.description}</p>}
            </div>

            <div>
              <label htmlFor="targetUrl" className="block text-sm font-medium text-muted-foreground">Target URL</label>
              <Input id="targetUrl" name="targetUrl" type="url" value={formData.targetUrl || ''} onChange={handleInputChange} required placeholder="https://api.example.com/webhook" className="mt-1"/>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-muted-foreground">Conditions (JavaScript Expression)</label>
                 <CodeEditor 
                    language="js"
                    value={formData.conditions || ''}
                    onChange={(value) => setFormData(prev => ({...prev, conditions: value}))}
                    placeholder="e.g., driver.status === 'Active' && driver.commissionTotal > 1000"
                    availableVariables={selectedEvent?.availableVariables}
                 />
                <p className="mt-1 text-xs text-muted-foreground">Optional. The webhook will only fire if this expression evaluates to true.</p>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-muted-foreground">Header Template (JSON)</label>
                <CodeEditor language="json" value={formData.headerTemplate || ''} onChange={(value) => setFormData(prev => ({...prev, headerTemplate: value}))} />
            </div>

            <div>
                <label className="block text-sm font-medium text-muted-foreground">Body Template (JSON)</label>
                <CodeEditor language="json" value={formData.bodyTemplate || ''} onChange={(value) => setFormData(prev => ({...prev, bodyTemplate: value}))} />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-muted-foreground">Status</label>
              <Select value={formData.status} onValueChange={(v) => setFormData(p => ({...p, status: v as any}))}><SelectTrigger id="status" className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Button type="button" onClick={() => onDelete(formData.id!)} variant="destructive" disabled={isNew}><TrashIcon className="w-4 h-4 mr-2"/>Delete</Button>
            <div className="space-x-3">
              <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
export default WebhookEditModal;
