
import React, { useState, useEffect, useCallback } from 'react';
import { BaseApiConfig } from '../../types';
import { Button } from '../ui/button';
import { XIcon, TrashIcon } from '../icons/Icon';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface BaseApiEditModalProps {
  api: BaseApiConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (api: BaseApiConfig) => void;
  onDelete: (apiId: string) => void;
}

const BaseApiEditModal: React.FC<BaseApiEditModalProps> = ({ api, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<BaseApiConfig>>({});
  const isNew = !api?.id;

  const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    setFormData(isNew ? { name: '', baseUrl: '', authType: 'None' } : { ...api });
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [api, isOpen, isNew, handleKeyDown]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = () => { onSave(formData as BaseApiConfig); };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isNew ? 'Add Base API' : 'Edit Base API'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 -mt-1 -mr-2"><XIcon className="w-5 h-5" /></Button>
        </CardHeader>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">API Name</label>
              <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} required className="mt-1" />
            </div>
            <div>
              <label htmlFor="baseUrl" className="block text-sm font-medium text-muted-foreground">Base URL</label>
              <Input id="baseUrl" name="baseUrl" type="url" value={formData.baseUrl || ''} onChange={handleInputChange} required placeholder="https://api.example.com/v1" className="mt-1" />
            </div>
            <div>
              <label htmlFor="authType" className="block text-sm font-medium text-muted-foreground">Authentication Type</label>
              <Select value={formData.authType} onValueChange={(v) => setFormData(p => ({...p, authType: v as any}))}><SelectTrigger id="authType" className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="None">None</SelectItem><SelectItem value="API Key">API Key</SelectItem><SelectItem value="Bearer Token">Bearer Token</SelectItem></SelectContent></Select>
            </div>
            {formData.authType === 'API Key' && (
              <>
                <div>
                  <label htmlFor="headerName" className="block text-sm font-medium text-muted-foreground">API Key Header Name</label>
                  <Input id="headerName" name="headerName" value={formData.headerName || ''} onChange={handleInputChange} placeholder="e.g., X-API-Key" className="mt-1" />
                </div>
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-muted-foreground">API Key</label>
                  <Input id="apiKey" name="apiKey" type="password" value={formData.apiKey || ''} onChange={handleInputChange} className="mt-1" />
                </div>
              </>
            )}
            {formData.authType === 'Bearer Token' && (
              <div>
                  <label htmlFor="bearerToken" className="block text-sm font-medium text-muted-foreground">Bearer Token</label>
                  <Input id="bearerToken" name="bearerToken" type="password" value={formData.bearerToken || ''} onChange={handleInputChange} className="mt-1" />
              </div>
            )}
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
export default BaseApiEditModal;
