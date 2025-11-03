import React, { useState } from 'react';
import { InvoiceTemplate, InvoiceColumnType, SummaryTotalType, VatApplication } from '../../types';

interface InvoiceTemplateBuilderProps {
  template?: InvoiceTemplate;
  onSave: (template: InvoiceTemplate) => void;
  onCancel: () => void;
}

const AVAILABLE_COLUMNS: { id: InvoiceColumnType; label: string; description: string }[] = [
  { id: 'date', label: 'Date', description: 'Journey date' },
  { id: 'time', label: 'Time', description: 'Pickup time' },
  { id: 'pickup', label: 'Pickup Location', description: 'Pickup address' },
  { id: 'destination', label: 'Destination', description: 'Destination address' },
  { id: 'distance', label: 'Distance', description: 'Journey distance (miles)' },
  { id: 'duration', label: 'Duration', description: 'Journey duration (minutes)' },
  { id: 'fare', label: 'Fare', description: 'Base fare amount' },
  { id: 'charges', label: 'Charges', description: 'Additional charges (tolls, extras, etc.)' },
  { id: 'tips', label: 'Tips', description: 'Passenger tips' },
  { id: 'reference', label: 'Reference', description: 'Journey reference number' },
];

const AVAILABLE_TOTALS: { id: SummaryTotalType; label: string; description: string }[] = [
  { id: 'subtotal', label: 'Subtotal', description: 'Sum of all fares' },
  { id: 'serviceCharge', label: 'Service Charge', description: 'Service charge amount' },
  { id: 'tax', label: 'Tax/VAT', description: 'Tax amount' },
  { id: 'total', label: 'Total', description: 'Final total payable' },
  { id: 'payment', label: 'Payment Received', description: 'Amount actually received' },
];

const VAT_OPTIONS: { id: VatApplication; label: string; description: string }[] = [
  { id: 'nothing', label: 'No VAT', description: 'Do not apply VAT' },
  { id: 'serviceCharge', label: 'VAT on Service Charge Only', description: 'Apply VAT to service charge only' },
  { id: 'serviceChargeAndPrice', label: 'VAT on Total', description: 'Apply VAT to service charge and fare' },
];

export const InvoiceTemplateBuilder: React.FC<InvoiceTemplateBuilderProps> = ({ template, onSave, onCancel }) => {
  const [formData, setFormData] = useState<InvoiceTemplate>(
    template || {
      id: `template-${Date.now()}`,
      name: '',
      description: '',
      columns: ['date', 'pickup', 'destination', 'fare', 'charges'],
      summaryMethod: 'detailed',
      summaryTotals: ['total'],
      vatApplication: 'nothing',
      includeNotes: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, description: e.target.value });
  };

  const toggleColumn = (columnId: InvoiceColumnType) => {
    setFormData({
      ...formData,
      columns: formData.columns.includes(columnId)
        ? formData.columns.filter((c) => c !== columnId)
        : [...formData.columns, columnId],
    });
  };

  const toggleTotal = (totalId: SummaryTotalType) => {
    setFormData({
      ...formData,
      summaryTotals: formData.summaryTotals.includes(totalId)
        ? formData.summaryTotals.filter((t) => t !== totalId)
        : [...formData.summaryTotals, totalId],
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Please enter a template name');
      return;
    }
    if (formData.columns.length === 0) {
      alert('Please select at least one column');
      return;
    }
    if (formData.summaryTotals.length === 0) {
      alert('Please select at least one total to display');
      return;
    }
    onSave({ ...formData, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg border border-gray-200">
      {/* Section 1: Template Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Information</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g., Standard Invoice, Premium Invoice"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Optional description for this template"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Column Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Journey Columns to Display</h3>
        <p className="text-sm text-gray-600 mb-3">Select which information to show for each journey</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {AVAILABLE_COLUMNS.map((column) => (
            <label key={column.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.columns.includes(column.id)}
                onChange={() => toggleColumn(column.id)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900">{column.label}</div>
                <div className="text-xs text-gray-600">{column.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Section 3: Journey Summarization */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Journey Summarization</h3>
        <p className="text-sm text-gray-600 mb-3">How should journeys be displayed?</p>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="summary"
              checked={formData.summaryMethod === 'detailed'}
              onChange={() => setFormData({ ...formData, summaryMethod: 'detailed' })}
            />
            <div>
              <div className="font-medium text-gray-900">Detailed</div>
              <div className="text-sm text-gray-600">Show each journey as a separate line</div>
            </div>
          </label>
          <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="summary"
              checked={formData.summaryMethod === 'summarized'}
              onChange={() => setFormData({ ...formData, summaryMethod: 'summarized' })}
            />
            <div>
              <div className="font-medium text-gray-900">Summarized</div>
              <div className="text-sm text-gray-600">Group journeys by contract/account (e.g., "2x runs for Contract X123 @ £50.00")</div>
            </div>
          </label>
        </div>
      </div>

      {/* Section 4: Summary Totals */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Totals to Display</h3>
        <p className="text-sm text-gray-600 mb-3">Select which totals to show at the bottom of the invoice</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {AVAILABLE_TOTALS.map((total) => (
            <label key={total.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.summaryTotals.includes(total.id)}
                onChange={() => toggleTotal(total.id)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900">{total.label}</div>
                <div className="text-xs text-gray-600">{total.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Section 5: Tax Application */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax/VAT Application</h3>
        <p className="text-sm text-gray-600 mb-3">How should VAT be calculated and applied?</p>
        <div className="space-y-3">
          {VAT_OPTIONS.map((option) => (
            <label key={option.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="vat"
                checked={formData.vatApplication === option.id}
                onChange={() => setFormData({ ...formData, vatApplication: option.id })}
              />
              <div>
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Section 6: Additional Options */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Options</h3>
        <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.includeNotes}
            onChange={(e) => setFormData({ ...formData, includeNotes: e.target.checked })}
          />
          <div>
            <div className="font-medium text-gray-900">Include Notes Section</div>
            <div className="text-sm text-gray-600">Add a notes field at the bottom of the invoice</div>
          </div>
        </label>
      </div>

      {/* Section 7: Preview & Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm text-gray-700">
          <div className="font-medium mb-2">Template Summary:</div>
          <ul className="space-y-1 ml-4">
            <li>• <span className="font-medium">Name:</span> {formData.name || '(not set)'}</li>
            <li>• <span className="font-medium">Columns:</span> {formData.columns.length} selected</li>
            <li>• <span className="font-medium">Display:</span> {formData.summaryMethod === 'detailed' ? 'Detailed' : 'Summarized'}</li>
            <li>• <span className="font-medium">Totals:</span> {formData.summaryTotals.join(', ')}</li>
            <li>• <span className="font-medium">VAT:</span> {VAT_OPTIONS.find((v) => v.id === formData.vatApplication)?.label}</li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          {template ? 'Update Template' : 'Create Template'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
