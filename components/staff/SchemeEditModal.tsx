

import React, { useState, useEffect, useCallback } from 'react';
import { CommissionScheme, CommissionSchemeType, Tier, CommissionFieldRule, CommissionOutputRule } from '../../types';
import { Button } from '../ui/button';
import { TrashIcon, PlusCircleIcon, XIcon } from '../icons/Icon';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import CommissionRuleBuilder, { Stage1FieldSelector, Stage2FormulaEditor, Stage3OutputRules } from './CommissionRuleBuilder';

interface SchemeEditModalProps {
  scheme: CommissionScheme;
  isOpen: boolean;
  onClose: () => void;
  onSave: (scheme: CommissionScheme) => void;
  onDelete: (schemeId: string) => void;
}

const schemeTypeOptions: CommissionSchemeType[] = [
  'PAYE',
  '%',
  '% + Fixed',
  '% Upto Fixed £ Value',
  'Fixed',
  'Tiered % on total £',
  'Tiered % Then Fixed',
  'Tiered % per £ banding',
];

const CurrencyField = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-muted-foreground">{props.label}</label>
        <div className="relative mt-1">
             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-muted-foreground sm:text-sm">£</span></div>
            <Input type="number" step="0.01" {...props} className="pl-7" />
        </div>
    </div>
);

const PercentageField = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-muted-foreground">{props.label}</label>
        <div className="relative mt-1">
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><span className="text-muted-foreground sm:text-sm">%</span></div>
            <Input type="number" step="0.01" {...props} className="pr-7" />
        </div>
    </div>
);


const SchemeEditModal: React.FC<SchemeEditModalProps> = ({ scheme, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<CommissionScheme>(scheme);
  const [activeTab, setActiveTab] = useState<'basic' | 'stage1' | 'stage2' | 'stage3'>('basic');
  const [stage1FieldRules, setStage1FieldRules] = useState<CommissionFieldRule[]>(scheme.stage1FieldRules || []);
  const [stage2CommissionFormula, setStage2CommissionFormula] = useState<string>(scheme.stage2CommissionFormula || '');
  const [stage3OutputRules, setStage3OutputRules] = useState<CommissionOutputRule[]>(scheme.stage3OutputRules || []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    setFormData(scheme);
    if (isOpen) {
        document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [scheme, isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
  };

  const addTier = () => {
    const newTier: Tier = { rate: 0, upTo: 0 };
    setFormData(prev => ({ ...prev, tiers: [...(prev.tiers || []), newTier] }));
  };

  const updateTier = (index: number, field: keyof Tier, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    const updatedTiers = [...(formData.tiers || [])];
    updatedTiers[index] = { ...updatedTiers[index], [field]: numericValue };
    setFormData(prev => ({ ...prev, tiers: updatedTiers }));
  };

  const removeTier = (index: number) => {
    setFormData(prev => ({ ...prev, tiers: (prev.tiers || []).filter((_, i) => i !== index) }));
  };
  
  const handleSave = () => {
    const cleanedScheme = {
        ...formData,
        stage1FieldRules: stage1FieldRules.length > 0 ? stage1FieldRules : undefined,
        stage2CommissionFormula: stage2CommissionFormula ? stage2CommissionFormula : undefined,
        stage3OutputRules: stage3OutputRules.length > 0 ? stage3OutputRules : undefined,
        tiers: formData.tiers?.filter(t => t.rate > 0 || t.upTo > 0)
    };
    onSave(cleanedScheme);
  };
  
  const isTiered = formData.type.includes('Tiered');
  const isNew = scheme.id.startsWith('new-');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 transition-opacity" onClick={onClose}>
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isNew ? 'Add New Scheme' : `Edit Scheme #${scheme.id}`}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 -mt-1 -mr-2">
            <XIcon className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        {/* Tab Navigation */}
        <div className="border-b border-border px-6 pt-4 flex gap-1">
          {['basic', 'stage1', 'stage2', 'stage3'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'basic' | 'stage1' | 'stage2' | 'stage3')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'basic' && 'Basic Info'}
              {tab === 'stage1' && 'Stage 1: Fields'}
              {tab === 'stage2' && 'Stage 2: Formula'}
              {tab === 'stage3' && 'Stage 3: Outputs'}
            </button>
          ))}
        </div>
        
        <CardContent className="flex-grow overflow-y-auto space-y-6 pt-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">Scheme Name</label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="mt-1"/>
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-muted-foreground">Scheme Type</label>
                  <Select value={formData.type} onValueChange={(v) => setFormData(p => ({...p, type: v as any}))}>
                    <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
                    <SelectContent>{schemeTypeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              
               <div>
                  <label htmlFor="details" className="block text-sm font-medium text-muted-foreground">Description</label>
                   <Textarea id="details" name="details" value={formData.details} onChange={handleInputChange} rows={2} className="mt-1"/>
                </div>

              <hr className="border-border" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(formData.type === '%' || formData.type === '% + Fixed' || formData.type === '% Upto Fixed £ Value') &&
                  <PercentageField id="commissionRate" name="commissionRate" label="Commission Rate" value={formData.commissionRate || ''} onChange={handleNumericInputChange} />
                }
                {formData.type === '%' &&
                  <CurrencyField id="minimumCharge" name="minimumCharge" label="Minimum Charge" value={formData.minimumCharge || ''} onChange={handleNumericInputChange} />
                }
                {(formData.type === '% + Fixed' || formData.type === 'Fixed' || formData.type === 'Tiered % Then Fixed') &&
                  <CurrencyField id="dataCharge" name="dataCharge" label="Data / Fixed Charge" value={formData.dataCharge || ''} onChange={handleNumericInputChange} />
                }
                 {formData.type === '% Upto Fixed £ Value' &&
                  <CurrencyField id="capAmount" name="capAmount" label="Cap Amount" value={formData.capAmount || ''} onChange={handleNumericInputChange} />
                }
                <CurrencyField id="vehicleRent" name="vehicleRent" label="Vehicle Rent" value={formData.vehicleRent || ''} onChange={handleNumericInputChange} />
                <CurrencyField id="insuranceDeposit" name="insuranceDeposit" label="Insurance Deposit" value={formData.insuranceDeposit || ''} onChange={handleNumericInputChange} />
              </div>

              {isTiered && (
                <>
                <hr className="border-border" />
                <div>
                  <h3 className="text-md font-medium text-foreground">Tier Configuration</h3>
                  <div className="mt-4 space-y-4">
                    {(formData.tiers || []).map((tier, index) => (
                      <div key={index} className="flex items-end space-x-3">
                        <span className="font-mono text-sm text-muted-foreground pt-8">Tier {index + 1}:</span>
                        <PercentageField label="Rate" id={`tier-rate-${index}`} value={tier.rate || ''} onChange={(e) => updateTier(index, 'rate', e.target.value)} />
                        <CurrencyField label="Up To" id={`tier-upto-${index}`} value={tier.upTo >= 999999 ? '' : (tier.upTo || '')} onChange={(e) => updateTier(index, 'upTo', e.target.value)} placeholder="Use 999999 for ∞"/>
                        <Button variant="ghost" size="icon" onClick={() => removeTier(index)} className="mb-1"><TrashIcon className="h-5 w-5 text-destructive" /></Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addTier} className="mt-4"><PlusCircleIcon className="w-4 h-4 mr-2"/> Add Tier</Button>
                  </div>
                </div>
                </>
              )}
            </>
          )}

          {/* Stage 1: Field Selection Tab */}
          {activeTab === 'stage1' && (
            <div className="space-y-6">
              <Stage1FieldSelector
                rules={stage1FieldRules}
                onChange={setStage1FieldRules}
              />

              {/* Example Rules Section */}
              <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20">
                <CardHeader>
                  <CardTitle className="text-base">📋 Example Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">Example 1: Add toll fee only for airport pickups</p>
                    <div className="bg-card p-3 rounded border border-border text-xs">
                      <p className="font-mono mb-2">✓ Select "toll_fee" field</p>
                      <p className="font-mono mb-2">✓ Check airport at: <span className="text-primary">Pickup</span></p>
                      <p className="font-mono">✓ Include for: <span className="text-primary">Airport only</span></p>
                    </div>
                    <p className="text-muted-foreground text-xs">Result: Toll fee is only included in commission calculations when the pickup location is an airport.</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">Example 2: Exclude surge pricing for airport destinations</p>
                    <div className="bg-card p-3 rounded border border-border text-xs">
                      <p className="font-mono mb-2">✓ Select "surge_charge" field</p>
                      <p className="font-mono mb-2">✓ Check airport at: <span className="text-primary">Destination</span></p>
                      <p className="font-mono">✓ Include for: <span className="text-primary">Non-airport only</span></p>
                    </div>
                    <p className="text-muted-foreground text-xs">Result: Surge charges are included everywhere except when the destination is an airport.</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">Example 3: Advanced - Custom pickup condition</p>
                    <div className="bg-card p-3 rounded border border-border text-xs">
                      <p className="font-mono mb-2">✓ Select any field</p>
                      <p className="font-mono mb-2">✓ Click "+ Add condition (optional)"</p>
                      <p className="font-mono mb-2">Sample: <code className="bg-muted px-1 rounded">pickup_address.includes('Heathrow') || pickup_address.includes('Gatwick')</code></p>
                      <p className="font-mono">Result: Field only included for Heathrow or Gatwick pickups</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Stage 2: Formula Tab */}
          {activeTab === 'stage2' && (
            <Stage2FormulaEditor
              formula={stage2CommissionFormula}
              onChange={setStage2CommissionFormula}
            />
          )}

          {/* Stage 3: Output Rules Tab */}
          {activeTab === 'stage3' && (
            <Stage3OutputRules
              rules={stage3OutputRules}
              onChange={setStage3OutputRules}
            />
          )}
        </CardContent>

        <CardFooter className="flex justify-between items-center">
            <Button onClick={() => onDelete(formData.id!)} variant="destructive" disabled={isNew}>
                <TrashIcon className="w-4 h-4 mr-2"/> Delete
            </Button>
            <div className="space-x-3">
                <Button onClick={onClose} variant="outline">Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SchemeEditModal;
