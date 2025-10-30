



import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { mockAccountingDefaults } from '../../lib/mockData';
import { FeeType, VatApplication } from '../../types';

const FeeInputGroup: React.FC<{
  label: string;
  type: FeeType;
  onTypeChange: (type: FeeType) => void;
  value: number;
  onValueChange: (value: number) => void;
  minValue?: number;
  onMinValueChange?: (value: number) => void;
}> = ({ label, type, onTypeChange, value, onValueChange, minValue, onMinValueChange }) => (
    <div className="p-3 border rounded-lg bg-background space-y-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Select value={type} onValueChange={(v) => onTypeChange(v as FeeType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="%">%</SelectItem>
                    <SelectItem value="fixed">Fixed (£)</SelectItem>
                </SelectContent>
            </Select>
            <Input 
                type="number"
                placeholder="Value"
                value={value || ''}
                onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
                disabled={type === 'none'}
            />
            {onMinValueChange && (
                <Input
                    type="number"
                    placeholder="Minimum (£)"
                    value={minValue || ''}
                    onChange={(e) => onMinValueChange(parseFloat(e.target.value) || 0)}
                    disabled={type === 'none'}
                />
            )}
        </div>
    </div>
);


const AccountingSettingsPage: React.FC = () => {
    // FIX: Explicitly type the useState hook with a more general type than the one inferred from
    // mockAccountingDefaults. The 'as const' assertions in mockAccountingDefaults cause a very narrow
    // type to be inferred (e.g., { serviceChargeType: '%' }), which causes type errors when trying
    // to set it to other valid FeeType values (e.g., 'fixed').
    const [settings, setSettings] = useState<{
        invoiceTemplate: string;
        invoiceTerms: string;
        invoiceFooter: string;
        serviceChargeType: FeeType;
        serviceChargeValue: number;
        serviceChargeMinimum: number;
        bookingFeeType: FeeType;
        bookingFeeValue: number;
        bookingFeeMinimum: number;
        upliftType: FeeType;
        upliftValue: number;
        vatRate: number;
        vatAppliesTo: VatApplication;
    }>(mockAccountingDefaults);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would save to a database
        alert('System-wide accounting defaults have been saved.');
    };

  return (
    <form className="space-y-6" onSubmit={handleSave}>
      <Card>
        <CardHeader>
          <CardTitle>Accounting Defaults</CardTitle>
          <CardDescription>
            Set the system-wide default accounting and invoicing settings. These can be overridden on a per-account basis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            {/* INVOICING */}
            <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-foreground border-b pb-2">Invoicing</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-sm font-medium">Default Invoice Template</label>
                         <Select value={settings.invoiceTemplate} onValueChange={(v) => setSettings(s => ({...s, invoiceTemplate: v}))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Default">Default</SelectItem>
                                <SelectItem value="Detailed">Detailed</SelectItem>
                                <SelectItem value="Compact">Compact</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium">Default Invoice Terms</label>
                    <Textarea 
                        placeholder="e.g., Payment is due within 14 days..."
                        value={settings.invoiceTerms}
                        onChange={(e) => setSettings(s => ({...s, invoiceTerms: e.target.value}))}
                        className="mt-1"
                    />
                </div>
                 <div>
                    <label className="text-sm font-medium">Default Invoice Footer</label>
                    <Input 
                        placeholder="e.g., Thank you for your business."
                        value={settings.invoiceFooter}
                        onChange={(e) => setSettings(s => ({...s, invoiceFooter: e.target.value}))}
                    />
                </div>
            </fieldset>

            {/* PRICING & FEES */}
            <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-foreground border-b pb-2">Pricing & Fees</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FeeInputGroup
                        label="Service Charge"
                        type={settings.serviceChargeType}
                        onTypeChange={(v) => setSettings(s => ({...s, serviceChargeType: v}))}
                        value={settings.serviceChargeValue}
                        onValueChange={(v) => setSettings(s => ({...s, serviceChargeValue: v}))}
                        minValue={settings.serviceChargeMinimum}
                        onMinValueChange={(v) => setSettings(s => ({...s, serviceChargeMinimum: v}))}
                    />
                     <FeeInputGroup
                        label="Booking Fee (deducted from driver)"
                        type={settings.bookingFeeType}
                        onTypeChange={(v) => setSettings(s => ({...s, bookingFeeType: v}))}
                        value={settings.bookingFeeValue}
                        onValueChange={(v) => setSettings(s => ({...s, bookingFeeValue: v}))}
                        minValue={settings.bookingFeeMinimum}
                        onMinValueChange={(v) => setSettings(s => ({...s, bookingFeeMinimum: v}))}
                    />
                    <FeeInputGroup
                        label="Price Uplift (over tariff/fixed)"
                        type={settings.upliftType}
                        onTypeChange={(v) => setSettings(s => ({...s, upliftType: v}))}
                        value={settings.upliftValue}
                        onValueChange={(v) => setSettings(s => ({...s, upliftValue: v}))}
                    />
                </div>
            </fieldset>
            
            {/* VAT */}
            <fieldset className="space-y-4">
                 <legend className="text-lg font-semibold text-foreground border-b pb-2">VAT</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                         <label className="text-sm font-medium">Default VAT Rate (%)</label>
                         <Input 
                            type="number"
                            value={settings.vatRate}
                            onChange={(e) => setSettings(s => ({...s, vatRate: parseFloat(e.target.value) || 0}))}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">VAT Applies To</label>
                        <Select value={settings.vatAppliesTo} onValueChange={(v) => setSettings(s => ({...s, vatAppliesTo: v as VatApplication}))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="nothing">Nothing</SelectItem>
                                <SelectItem value="serviceCharge">Service Charge Only</SelectItem>
                                <SelectItem value="serviceChargeAndPrice">Service Charge & Journey Price</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                 </div>
            </fieldset>
            
            <div className="flex justify-end">
                <Button type="submit">Save Defaults</Button>
            </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default AccountingSettingsPage;