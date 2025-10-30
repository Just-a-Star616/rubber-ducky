
import React, { useState, useEffect, useCallback } from 'react';
import { EndpointDefinition, BaseApiConfig } from '../../types';
import { Button } from '../ui/button';
import { XIcon, TrashIcon } from '../icons/Icon';
import CodeEditor from '../ui/CodeEditor';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';


interface EndpointEditModalProps {
  endpoint: EndpointDefinition | null;
  baseApis: BaseApiConfig[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (endpoint: EndpointDefinition) => void;
  onDelete: (endpointId: string) => void;
}

const EndpointEditModal: React.FC<EndpointEditModalProps> = ({ endpoint, baseApis, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<EndpointDefinition>>({});
  const isNew = !endpoint?.id;

  const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    setFormData(isNew ? { name: '', path: '', method: 'GET', description: '', schema: '{\n  "key": "value"\n}', baseApiId: baseApis[0]?.id } : { ...endpoint });
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [endpoint, isOpen, isNew, baseApis, handleKeyDown]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = () => { onSave(formData as EndpointDefinition); };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isNew ? 'Add Endpoint' : 'Edit Endpoint'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 -mt-1 -mr-2"><XIcon className="w-5 h-5" /></Button>
        </CardHeader>
        <form className="flex-grow overflow-y-auto" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">Endpoint Name</label>
                    <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} required className="mt-1"/>
                </div>
                <div>
                    <label htmlFor="baseApiId" className="block text-sm font-medium text-muted-foreground">Base API</label>
                    <Select value={formData.baseApiId} onValueChange={(v) => setFormData(p => ({...p, baseApiId: v}))}><SelectTrigger id="baseApiId" className="mt-1"><SelectValue/></SelectTrigger><SelectContent>{baseApis.map(api => <SelectItem key={api.id} value={api.id}>{api.name}</SelectItem>)}</SelectContent></Select>
                </div>
            </div>
             <div>
                <label htmlFor="description" className="block text-sm font-medium text-muted-foreground">Description</label>
                <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} rows={2} className="mt-1" />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                    <label htmlFor="method" className="block text-sm font-medium text-muted-foreground">Method</label>
                    <Select value={formData.method} onValueChange={(v) => setFormData(p => ({...p, method: v as any}))}><SelectTrigger id="method" className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="GET">GET</SelectItem><SelectItem value="POST">POST</SelectItem><SelectItem value="PUT">PUT</SelectItem><SelectItem value="DELETE">DELETE</SelectItem></SelectContent></Select>
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="path" className="block text-sm font-medium text-muted-foreground">Path</label>
                    <Input id="path" name="path" value={formData.path || ''} onChange={handleInputChange} required placeholder="/users/:id" className="mt-1" />
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-muted-foreground">Expected Schema (JSON)</label>
                 <CodeEditor 
                    language="json"
                    value={formData.schema || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, schema: value }))}
                 />
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
export default EndpointEditModal;
