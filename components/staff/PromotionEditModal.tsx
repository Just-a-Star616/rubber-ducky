
import React, { useState, useEffect, useCallback } from 'react';
import { Promotion } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { TrashIcon, XIcon } from '../icons/Icon';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';

interface PromotionEditModalProps {
  promotion: Promotion | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (promotion: Promotion) => void;
  onDelete: (promotionId: string) => void;
}

const PromotionEditModal: React.FC<PromotionEditModalProps> = ({ promotion, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Promotion>>({});
  
  const isNew = !promotion?.id;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    setFormData(isNew ? { title: '', description: '', callToAction: '', eligibilityRules: [], termsSummary: '', termsUrl: '' } : { ...promotion });
    if (isOpen) {
        document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [promotion, isOpen, isNew, handleKeyDown]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRulesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, eligibilityRules: value.split('\n').filter(rule => rule.trim() !== '') }));
  };

  const handleSave = () => {
    onSave(formData as Promotion);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 transition-opacity" onClick={onClose}>
      <Card className="w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isNew ? 'Add New Promotion' : 'Edit Promotion'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 -mt-1 -mr-2">
            <XIcon className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-y-auto space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-muted-foreground">Title</label>
                <Input id="title" name="title" value={formData.title || ''} onChange={handleInputChange} className="mt-1" />
            </div>
             <div>
                <label htmlFor="description" className="block text-sm font-medium text-muted-foreground">Description</label>
                <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} rows={3} className="mt-1"/>
            </div>
            <div>
                <label htmlFor="callToAction" className="block text-sm font-medium text-muted-foreground">Call To Action Text</label>
                <Input id="callToAction" name="callToAction" value={formData.callToAction || ''} onChange={handleInputChange} placeholder="e.g., Refer a Driver" className="mt-1" />
            </div>
            <div>
                <label htmlFor="termsSummary" className="block text-sm font-medium text-muted-foreground">Terms & Conditions Summary</label>
                <Textarea id="termsSummary" name="termsSummary" value={formData.termsSummary || ''} onChange={handleInputChange} rows={3} className="mt-1" />
            </div>
            <div>
                <label htmlFor="termsUrl" className="block text-sm font-medium text-muted-foreground">Full Terms & Conditions URL</label>
                <Input id="termsUrl" name="termsUrl" type="url" value={formData.termsUrl || ''} onChange={handleInputChange} placeholder="https://example.com/terms" className="mt-1" />
            </div>
            <div>
                <label htmlFor="eligibilityRules" className="block text-sm font-medium text-muted-foreground">Eligibility Rules</label>
                <Textarea 
                    id="eligibilityRules"
                    name="eligibilityRules"
                    value={formData.eligibilityRules?.join('\n') || ''}
                    onChange={handleRulesChange}
                    rows={3}
                    className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">One rule per line. Example: 'prefix != CR' or 'schemeCode == S07'. Leave blank for all drivers.</p>
            </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center">
            <Button onClick={() => onDelete(formData.id!)} variant="destructive" disabled={isNew}><TrashIcon className="w-4 h-4 mr-2" />Delete</Button>
            <div className="space-x-3">
                <Button onClick={onClose} variant="outline">Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PromotionEditModal;
