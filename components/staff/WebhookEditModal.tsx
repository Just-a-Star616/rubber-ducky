
import React, { useState, useEffect } from 'react';
import { WebhookDefinition, WebhookEvent } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { XIcon, TrashIcon } from '../icons/Icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import BaseRuleBuilder, { RuleConfig } from '../BaseRuleBuilder';
import { RULE_CONTEXTS } from '../../lib/ruleBuilder';

interface WebhookEditModalProps {
  webhook: WebhookDefinition | null;
  events: WebhookEvent[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (webhook: WebhookDefinition) => void;
  onDelete: (webhookId: string) => void;
}

const WebhookEditModal: React.FC<WebhookEditModalProps> = ({ webhook, events, isOpen, onClose, onSave, onDelete }) => {
  const [targetUrl, setTargetUrl] = useState('');
  const [headerTemplate, setHeaderTemplate] = useState('');
  const [bodyTemplate, setBodyTemplate] = useState('');
  const [status, setStatus] = useState('Active');
  const [selectedEventName, setSelectedEventName] = useState(webhook?.eventName || events[0]?.name || '');

  const isNew = !webhook?.id;

  useEffect(() => {
    if (webhook) {
      setTargetUrl(webhook.targetUrl || '');
      setHeaderTemplate(webhook.headerTemplate || '');
      setBodyTemplate(webhook.bodyTemplate || '');
      setStatus(webhook.status || 'Active');
      setSelectedEventName(webhook.eventName || '');
    } else if (events.length > 0) {
      setTargetUrl('');
      setHeaderTemplate('{\n  "Content-Type": "application/json"\n}');
      setBodyTemplate('{\n  "key": "value"\n}');
      setStatus('Active');
      setSelectedEventName(events[0].name);
    }
  }, [webhook, events, isOpen]);

  if (!isOpen) return null;

  const handleSaveRule = (config: RuleConfig) => {
    if (!targetUrl.trim()) {
      alert('Target URL is required');
      return;
    }

    const newWebhook: WebhookDefinition = {
      id: webhook?.id || `WH${Date.now()}`,
      eventName: selectedEventName,
      targetUrl,
      headerTemplate,
      bodyTemplate,
      status: status as any,
      conditions: config.expression,
    };

    onSave(newWebhook);
    onClose();
  };

  const handleDeleteClick = () => {
    if (webhook?.id && confirm('Delete this webhook?')) {
      onDelete(webhook.id);
      onClose();
    }
  };

  const selectedEvent = events.find(e => e.name === selectedEventName);
  const initialConfig = webhook ? {
    name: `Webhook: ${webhook.eventName}`,
    description: webhook.eventName,
    trigger: 'webhook_booking',
    conditions: [],
    expression: webhook.conditions || '',
    enabled: webhook.status === 'Active',
  } : undefined;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="relative bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="sticky top-0 bg-card px-6 py-4 border-b border-border flex justify-between items-center z-10">
          <h2 className="text-xl font-bold">{isNew ? 'Add Webhook' : 'Edit Webhook'}</h2>
          <button type="button" onClick={onClose} className="hover:opacity-75"><XIcon className="w-6 h-6" /></button>
        </header>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* Event & URL Configuration */}
          <div className="bg-background/50 border border-border rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Trigger Event</label>
              <Select value={selectedEventName} onValueChange={setSelectedEventName}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {events.map(event => (
                    <SelectItem key={event.id} value={event.name}>{event.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEvent && <p className="text-xs text-muted-foreground mt-2">{selectedEvent.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Target URL</label>
              <Input 
                type="url" 
                value={targetUrl} 
                onChange={(e) => setTargetUrl(e.target.value)} 
                placeholder="https://api.example.com/webhook"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conditions using unified builder */}
          <div>
            <h3 className="font-semibold mb-3">Trigger Conditions</h3>
            <BaseRuleBuilder
              title=""
              description=""
              context={RULE_CONTEXTS.webhook_booking}
              onSave={handleSaveRule}
              onCancel={onClose}
              initialConfig={initialConfig}
              showAdvancedOptions={false}
            />
          </div>

          {/* JSON Templates */}
          <div className="bg-background/50 border border-border rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Header Template (JSON)</label>
              <textarea
                value={headerTemplate}
                onChange={(e) => setHeaderTemplate(e.target.value)}
                className="w-full bg-muted rounded p-2 font-mono text-sm h-32"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Body Template (JSON)</label>
              <textarea
                value={bodyTemplate}
                onChange={(e) => setBodyTemplate(e.target.value)}
                className="w-full bg-muted rounded p-2 font-mono text-sm h-32"
              />
            </div>
          </div>
        </div>

        <footer className="sticky bottom-0 bg-card/80 backdrop-blur-sm px-6 py-4 border-t border-border flex justify-between items-center">
          <button 
            type="button" 
            onClick={handleDeleteClick}
            disabled={isNew}
            className="px-4 py-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrashIcon className="w-4 h-4 inline mr-2"/> Delete
          </button>
          <div className="space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-border rounded hover:bg-muted"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={() => {
                if (!targetUrl.trim()) {
                  alert('Target URL is required');
                  return;
                }
                handleSaveRule({
                  name: `Webhook: ${selectedEventName}`,
                  description: selectedEventName,
                  trigger: 'webhook_booking',
                  conditions: [],
                  expression: '',
                  enabled: status === 'Active',
                });
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Save Webhook
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
export default WebhookEditModal;
