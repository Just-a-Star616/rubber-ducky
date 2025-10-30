
import React, { useState, useEffect, useCallback } from 'react';
import { PermissionTemplate, PermissionLevel } from '../../types';
import { Button } from '../ui/button';
import { XIcon, TrashIcon } from '../icons/Icon';
import PermissionTree from './PermissionTree';
import { mockPermissionStructure } from '../../lib/mockData';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

interface PermissionTemplateEditModalProps {
  template: PermissionTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: PermissionTemplate) => void;
  onDelete: (templateId: string) => void;
}

// Helper to find the path to a node
const findNodePath = (nodes: any[], nodeId: string, path: string[] = []): string[] | null => {
    for (const node of nodes) {
        const currentPath = [...path, node.id];
        if (node.id === nodeId) return currentPath;
        if (node.children) {
            const childPath = findNodePath(node.children, nodeId, currentPath);
            if (childPath) return childPath;
        }
    }
    return null;
};

const PermissionTemplateEditModal: React.FC<PermissionTemplateEditModalProps> = ({ template, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<PermissionTemplate>>({});
  const isNew = !template;

  const handleKeyDown = useCallback((event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }, [onClose]);
  
  useEffect(() => {
    setFormData(isNew ? { name: '', permissions: {} } : { ...template });
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [template, isOpen, isNew, handleKeyDown]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (nodeId: string, level: PermissionLevel) => {
    setFormData(prev => {
        const newPermissions = { ...prev.permissions };
        newPermissions[nodeId] = level;

        // Smart ancestor logic: if a child is visible, its parents must be visible too
        if (level === 'view' || level === 'edit') {
            const path = findNodePath(mockPermissionStructure, nodeId);
            if (path) {
                // Iterate up to the root, but not including the current node
                for (let i = 0; i < path.length - 1; i++) {
                    const ancestorId = path[i];
                    if (newPermissions[ancestorId] === 'hidden' || !newPermissions[ancestorId]) {
                        newPermissions[ancestorId] = 'view';
                    }
                }
            }
        }
        return { ...prev, permissions: newPermissions };
    });
  };

  const handleSave = () => { onSave(formData as PermissionTemplate); };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isNew ? 'Add New Template' : `Edit: ${template.name}`}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 -mt-1 -mr-2"><XIcon className="w-5 h-5" /></Button>
        </CardHeader>
        <form className="flex-grow overflow-y-auto" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <CardContent className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">Template Name</label>
                <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} required className="mt-1" />
            </div>
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Permissions</label>
                <div className="p-3 border rounded-lg bg-background">
                    <PermissionTree 
                        nodes={mockPermissionStructure}
                        permissions={formData.permissions || {}}
                        onPermissionChange={handlePermissionChange}
                    />
                </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Button type="button" onClick={() => onDelete(formData.id!)} variant="destructive" disabled={isNew}><TrashIcon className="w-4 h-4 mr-2"/>Delete Template</Button>
            <div className="space-x-3">
              <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
              <Button type="submit">Save Template</Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
export default PermissionTemplateEditModal;
