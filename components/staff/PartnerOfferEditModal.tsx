
import React, { useState, useEffect, useCallback } from 'react';
import { PartnerOffer } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { TrashIcon, XIcon } from '../icons/Icon';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';

interface PartnerOfferEditModalProps {
  offer: PartnerOffer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (offer: PartnerOffer) => void;
  onDelete: (offerId: string) => void;
}

const PartnerOfferEditModal: React.FC<PartnerOfferEditModalProps> = ({ offer, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<PartnerOffer>>({});
  
  const isNew = !offer?.id;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    setFormData(isNew ? { partnerName: '', title: '', description: '', promoCode: '', eligibilityRules: [], offerUrl: '' } : { ...offer });
    if (isOpen) {
        document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [offer, isOpen, isNew, handleKeyDown]);

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
    onSave(formData as PartnerOffer);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 transition-opacity" onClick={onClose}>
      <Card className="w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isNew ? 'Add New Partner Offer' : 'Edit Partner Offer'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 -mt-1 -mr-2">
            <XIcon className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-y-auto space-y-4">
            <div>
                <label htmlFor="partnerName" className="block text-sm font-medium text-muted-foreground">Partner Name</label>
                <Input id="partnerName" name="partnerName" value={formData.partnerName || ''} onChange={handleInputChange} className="mt-1" />
            </div>
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-muted-foreground">Title</label>
                <Input id="title" name="title" value={formData.title || ''} onChange={handleInputChange} className="mt-1" />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-muted-foreground">Description</label>
                <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} rows={3} className="mt-1" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="promoCode" className="block text-sm font-medium text-muted-foreground">Promo Code</label>
                    <Input id="promoCode" name="promoCode" value={formData.promoCode || ''} onChange={handleInputChange} className="mt-1" />
                </div>
                 <div>
                    <label htmlFor="offerUrl" className="block text-sm font-medium text-muted-foreground">Offer URL</label>
                    <Input id="offerUrl" name="offerUrl" type="url" value={formData.offerUrl || ''} onChange={handleInputChange} placeholder="https://partner.com/offer" className="mt-1" />
                </div>
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

export default PartnerOfferEditModal;
