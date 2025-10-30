import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Account, Customer, Driver, MessageEvent as AppMessageEvent } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
// FIX: Imported AppMessageEvent (via mockMessageEvents) to resolve the "Cannot find name" error and type conflicts.
import { mockDrivers, mockCustomers, mockAccounts, mockMessageTemplates, mockMessageEvents } from '../../lib/mockData';
import { XIcon, PaperAirplaneIcon } from '../icons/Icon';

type RecipientType = 'Driver' | 'Customer' | 'Account';
interface InitialRecipient {
    type: RecipientType;
    id: string;
    name: string;
}

interface MessageComposerModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialRecipient?: InitialRecipient | null;
}

const MessageComposerModal: React.FC<MessageComposerModalProps> = ({ isOpen, onClose, initialRecipient }) => {
    const [recipientType, setRecipientType] = useState<RecipientType>(initialRecipient?.type || 'Customer');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState<Driver | Customer | Account | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [messageContent, setMessageContent] = useState('');

    const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);
    useEffect(() => { if (isOpen) document.addEventListener('keydown', handleKeyDown); return () => document.removeEventListener('keydown', handleKeyDown); }, [isOpen, handleKeyDown]);

    useEffect(() => {
        if (initialRecipient) {
            setRecipientType(initialRecipient.type);
            const dataMap = {
                Driver: mockDrivers,
                Customer: mockCustomers,
                Account: mockAccounts,
            };
            const recipient = dataMap[initialRecipient.type].find(r => r.id === initialRecipient.id);
            if (recipient) setSelectedRecipient(recipient);
        } else {
            setSelectedRecipient(null);
        }
        setSearchTerm('');
        setSelectedTemplateId('');
        setMessageContent('');
    }, [isOpen, initialRecipient]);
    
    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        const lowercasedTerm = searchTerm.toLowerCase();
        const dataMap = {
            Driver: mockDrivers,
            Customer: mockCustomers,
            Account: mockAccounts,
        };
        return dataMap[recipientType].filter(item => 'name' in item ? item.name.toLowerCase().includes(lowercasedTerm) : `${item.firstName} ${item.lastName}`.toLowerCase().includes(lowercasedTerm));
    }, [searchTerm, recipientType]);

    const handleTemplateChange = (templateId: string) => {
        setSelectedTemplateId(templateId);
        const template = mockMessageTemplates.find(t => t.id === templateId);
        if (template) {
            setMessageContent(template.content);
        } else {
            setMessageContent('');
        }
    };
    
    const handleInsertPlaceholder = (placeholder: string) => {
        setMessageContent(prev => `${prev}{{${placeholder}}}`);
    };

    const handleSend = () => {
        if (!selectedRecipient || !messageContent) {
            alert('Please select a recipient and enter a message.');
            return;
        }
        alert(`Message sent to ${'name' in selectedRecipient ? selectedRecipient.name : `${selectedRecipient.firstName} ${selectedRecipient.lastName}`}!`);
        onClose();
    };

    const currentTemplate = mockMessageTemplates.find(t => t.id === selectedTemplateId);
    const placeholders = currentTemplate ? mockMessageEvents.find(e => e.id === currentTemplate.eventId)?.availablePlaceholders : [];
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="relative bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="sticky top-0 bg-card px-6 py-4 border-b border-border flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold">Compose Message</h2>
                    <Button type="button" variant="ghost" size="icon" onClick={onClose}><XIcon className="w-6 h-6" /></Button>
                </header>
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {/* Recipient Selection */}
                    <fieldset>
                        <legend className="text-lg font-semibold text-foreground border-b pb-2 mb-2">Recipient</legend>
                        {!initialRecipient && (
                            <div className="flex items-center gap-2 p-1 bg-muted rounded-full w-fit mb-4">
                                {(['Customer', 'Account', 'Driver'] as RecipientType[]).map(type => (
                                    <Button key={type} size="sm" variant={recipientType === type ? 'default' : 'ghost'} className="rounded-full" onClick={() => { setRecipientType(type); setSelectedRecipient(null); }}>{type}</Button>
                                ))}
                            </div>
                        )}
                        {selectedRecipient ? (
                            <div className="p-3 rounded-lg bg-muted flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{'name' in selectedRecipient ? selectedRecipient.name : `${selectedRecipient.firstName} ${selectedRecipient.lastName}`}</p>
                                    <p className="text-xs text-muted-foreground">{selectedRecipient.id}</p>
                                </div>
                                {!initialRecipient && <Button variant="link" size="sm" onClick={() => setSelectedRecipient(null)}>Change</Button>}
                            </div>
                        ) : (
                            <div className="relative">
                                <Input placeholder={`Search for a ${recipientType.toLowerCase()}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                {searchTerm && (
                                    <div className="absolute top-full mt-1 w-full bg-card border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                        {searchResults.map(res => (
                                            <button key={res.id} onClick={() => { setSelectedRecipient(res); setSearchTerm(''); }} className="block w-full text-left p-2 hover:bg-muted">
                                                {'name' in res ? res.name : `${res.firstName} ${res.lastName}`}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </fieldset>

                    {/* Message Content */}
                    <fieldset>
                         <legend className="text-lg font-semibold text-foreground border-b pb-2 mb-2">Message</legend>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <Select onValueChange={handleTemplateChange} value={selectedTemplateId}>
                                    <SelectTrigger><SelectValue placeholder="Or select a template..." /></SelectTrigger>
                                    <SelectContent>
                                        {mockMessageTemplates.filter(t => t.target === recipientType).map(template => (
                                            <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Textarea value={messageContent} onChange={(e) => setMessageContent(e.target.value)} rows={10} className="mt-2 font-mono text-xs"/>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-muted-foreground">Placeholders</label>
                                <div className="mt-1 p-2 border rounded-lg h-full overflow-y-auto bg-background">
                                    {placeholders && placeholders.length > 0 ? placeholders.map(p => (
                                        <button type="button" key={p} onClick={() => handleInsertPlaceholder(p)} className="block w-full text-left text-xs font-mono p-1 rounded hover:bg-muted">
                                            {`{{${p}}}`}
                                        </button>
                                    )) : <p className="text-xs text-muted-foreground italic">Select a template to see available placeholders.</p>}
                                </div>
                            </div>
                         </div>
                    </fieldset>
                </div>
                <footer className="sticky bottom-0 bg-card/80 backdrop-blur-sm p-4 border-t border-border flex justify-end items-center space-x-3">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="button" onClick={handleSend} disabled={!selectedRecipient || !messageContent}><PaperAirplaneIcon className="w-4 h-4 mr-2"/> Send Message</Button>
                </footer>
            </div>
        </div>
    );
};

export default MessageComposerModal;