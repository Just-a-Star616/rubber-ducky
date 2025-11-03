



import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { mockAccountingDefaults } from '../../lib/mockData';
import { FeeType, VatApplication, InvoiceTemplate } from '../../types';
import { InvoiceTemplateBuilder } from '../../components/staff/InvoiceTemplateBuilder';

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

    const [invoiceTemplates, setInvoiceTemplates] = useState<InvoiceTemplate[]>([
        {
            id: 'default-template',
            name: 'Default',
            columns: ['date', 'pickup', 'destination', 'fare', 'charges'],
            summaryMethod: 'detailed',
            summaryTotals: ['total'],
            vatApplication: 'nothing',
            includeNotes: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: 'detailed-template',
            name: 'Detailed',
            columns: ['date', 'time', 'pickup', 'destination', 'distance', 'duration', 'fare', 'charges', 'tips', 'reference'],
            summaryMethod: 'detailed',
            summaryTotals: ['subtotal', 'serviceCharge', 'tax', 'total'],
            vatApplication: 'serviceChargeAndPrice',
            includeNotes: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: 'compact-template',
            name: 'Compact',
            columns: ['date', 'pickup', 'fare'],
            summaryMethod: 'summarized',
            summaryTotals: ['total'],
            vatApplication: 'nothing',
            includeNotes: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ]);

    const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | undefined>();

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would save to a database
        alert('System-wide accounting defaults have been saved.');
    };

    const handleSaveTemplate = (template: InvoiceTemplate) => {
        if (editingTemplate) {
            // Update existing template
            setInvoiceTemplates(invoiceTemplates.map((t) => (t.id === template.id ? template : t)));
        } else {
            // Add new template
            setInvoiceTemplates([...invoiceTemplates, template]);
        }
        setShowTemplateBuilder(false);
        setEditingTemplate(undefined);
    };

    const handleEditTemplate = (template: InvoiceTemplate) => {
        setEditingTemplate(template);
        setShowTemplateBuilder(true);
    };

    const handleDeleteTemplate = (templateId: string) => {
        if (invoiceTemplates.length === 1) {
            alert('You must keep at least one invoice template.');
            return;
        }
        if (confirm('Are you sure you want to delete this template?')) {
            setInvoiceTemplates(invoiceTemplates.filter((t) => t.id !== templateId));
            if (settings.invoiceTemplate === templateId) {
                setSettings((s) => ({ ...s, invoiceTemplate: invoiceTemplates[0].id }));
            }
        }
    };

    const handleCancelTemplate = () => {
        setShowTemplateBuilder(false);
        setEditingTemplate(undefined);
    };

  return (
    <form className="p-4 sm:p-6 lg:p-8 space-y-6" onSubmit={handleSave}>
      <Card>
        <CardHeader>
          <CardTitle>Accounting Defaults</CardTitle>
          <CardDescription>
            Set the system-wide default accounting and invoicing settings. These can be overridden on a per-account basis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            {/* INVOICE TEMPLATES SECTION */}
            <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-foreground border-b pb-2">Invoice Templates</legend>
                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600">{invoiceTemplates.length} template{invoiceTemplates.length !== 1 ? 's' : ''} configured</p>
                    <button
                        type="button"
                        onClick={() => {
                            setEditingTemplate(undefined);
                            setShowTemplateBuilder(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
                    >
                        + Create New Template
                    </button>
                </div>

                {showTemplateBuilder && (
                    <div className="border-t pt-6">
                        <InvoiceTemplateBuilder
                            template={editingTemplate}
                            onSave={handleSaveTemplate}
                            onCancel={handleCancelTemplate}
                        />
                    </div>
                )}

                {!showTemplateBuilder && (
                    <div className="grid grid-cols-1 gap-3">
                        {invoiceTemplates.map((template) => (
                            <div key={template.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                                        {template.description && (
                                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                                        )}
                                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                                            <div><span className="font-medium">Columns:</span> {template.columns.length}</div>
                                            <div><span className="font-medium">Display:</span> {template.summaryMethod}</div>
                                            <div><span className="font-medium">Totals:</span> {template.summaryTotals.length}</div>
                                            <div><span className="font-medium">VAT:</span> {template.vatApplication === 'nothing' ? 'None' : 'Applied'}</div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 ml-4">
                                        <button
                                            type="button"
                                            onClick={() => handleEditTemplate(template)}
                                            className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteTemplate(template.id)}
                                            className="px-3 py-1 text-sm border border-red-300 text-red-700 rounded hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="space-y-1 pt-4">
                    <label className="text-sm font-medium">Default Invoice Template</label>
                    <Select value={settings.invoiceTemplate} onValueChange={(v) => setSettings(s => ({...s, invoiceTemplate: v}))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {invoiceTemplates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </fieldset>

            {/* INVOICING */}
            <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-foreground border-b pb-2">Invoicing</legend>
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