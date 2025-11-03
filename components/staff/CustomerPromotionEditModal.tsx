import React, { useState, useMemo } from 'react';
import { CustomerPromotion, CustomerPromotionType, PromotionStatus } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import PromotionScheduleBuilder from './PromotionScheduleBuilder';
import BaseRuleBuilder, { RuleConfig } from '../BaseRuleBuilder';
import { RULE_CONTEXTS } from '../../lib/ruleBuilder';
import { validateSchedule } from '../../lib/promotionScheduling';

interface CustomerPromotionEditModalProps {
  promotion: CustomerPromotion | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (promotion: CustomerPromotion) => void;
  onDelete?: (id: string) => void;
}

const CustomerPromotionEditModal: React.FC<CustomerPromotionEditModalProps> = ({
  promotion,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<Partial<CustomerPromotion>>(
    promotion || {
      type: 'promo-code',
      status: 'Draft',
      targetAudience: 'all',
      voucherifyConfig: {
        campaignType: 'PROMOTION',
        discountType: 'PERCENT',
        discountEffect: 'APPLY_TO_ORDER',
      },
      redeemCount: 0,
    }
  );

  const [error, setError] = useState<string>('');

  const isLoyaltyScheme = formData.type === 'loyalty-scheme';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSave = () => {
    // Validate schedule if present
    if (formData.schedule) {
      const scheduleError = validateSchedule(formData.schedule);
      if (scheduleError) {
        setError(scheduleError);
        return;
      }
    }

    if (!formData.id) {
      formData.id = `CP-${Date.now()}`;
      formData.createdAt = new Date().toISOString();
      formData.createdBy = 'current-user';
    }
    
    formData.updatedAt = new Date().toISOString();
    setError(''); // Clear any previous errors
    onSave(formData as CustomerPromotion);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              {promotion ? 'Edit Customer Promotion' : 'Create Customer Promotion'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Promotion Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, type: 'promo-code' }))}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    formData.type === 'promo-code'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold">🎟️ Promo Code</div>
                  <div className="text-xs text-muted-foreground">Discount codes</div>
                </button>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, type: 'loyalty-scheme' }))}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    formData.type === 'loyalty-scheme'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold">🎁 Loyalty Scheme</div>
                  <div className="text-xs text-muted-foreground">Loyalty programs</div>
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                  placeholder="e.g., Black Friday Sale"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status || 'Draft'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Expired">Expired</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg"
                placeholder="Describe this promotion..."
              />
            </div>

            {/* Promo Code Specific */}
            {!isLoyaltyScheme && (
              <div className="space-y-4 p-4 bg-primary/5 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount Type</label>
                    <select
                      name="discountType"
                      value={formData.discountType || 'percentage'}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (£)</option>
                      <option value="free-ride">Free Ride</option>
                      <option value="double-points">Double Points</option>
                    </select>
                  </div>
                  {formData.discountType && formData.discountType !== 'free-ride' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Value</label>
                      <input
                        type="number"
                        name="discountValue"
                        value={formData.discountValue || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-border rounded-lg"
                        placeholder="e.g., 20"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Redemptions</label>
                    <input
                      type="number"
                      name="maxRedemptions"
                      value={formData.maxRedemptions || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                      placeholder="e.g., 500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Order Value (£)</label>
                    <input
                      type="number"
                      name="minimumOrderValue"
                      value={formData.minimumOrderValue || ''}
                      onChange={handleChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-border rounded-lg"
                      placeholder="e.g., 5.00"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Starts At *</label>
                <input
                  type="datetime-local"
                  name="startsAt"
                  value={formData.startsAt ? new Date(formData.startsAt).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    startsAt: new Date(e.target.value).toISOString()
                  }))}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ends At *</label>
                <input
                  type="datetime-local"
                  name="endsAt"
                  value={formData.endsAt ? new Date(formData.endsAt).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endsAt: new Date(e.target.value).toISOString()
                  }))}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>
            </div>

            {/* Target Audience - Using unified rule builder */}
            <div className="mt-6 pt-6 border-t border-border">
              <BaseRuleBuilder
                initialConfig={{
                  name: `Promo: ${formData.name || 'New'}`,
                  description: `Target audience: ${formData.targetAudience || 'all'}`,
                  trigger: 'promotion_targeting',
                  expression: formData.targetAudience || 'all',
                  enabled: true,
                }}
                context={RULE_CONTEXTS.promotion_targeting}
                onSave={(config: RuleConfig) => {
                  setFormData(prev => ({
                    ...prev,
                    targetAudience: (config.expression as any) || 'all',
                  }));
                }}
              />
            </div>

            {/* Promotion Schedule */}
            <div className="mt-6 pt-6 border-t border-border">
              <PromotionScheduleBuilder
                schedule={formData.schedule}
                onChange={(schedule) => setFormData(prev => ({
                  ...prev,
                  schedule
                }))}
              />
            </div>

            {/* Services */}
            <div>
              <label className="block text-sm font-medium mb-2">Applicable Services</label>
              <div className="flex gap-2 flex-wrap">
                {['rides', 'delivery', 'premium'].map(service => (
                  <label key={service} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.applicableServices?.includes(service) || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        applicableServices: e.target.checked
                          ? [...(prev.applicableServices || []), service]
                          : (prev.applicableServices || []).filter(s => s !== service)
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Voucherify Integration */}
            <div className="p-3 bg-info/10 rounded-lg border border-info/20">
              <p className="text-sm font-medium mb-2">Voucherify Integration</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Campaign ID:</span>
                  <code className="bg-background px-2 py-1 rounded text-xs font-mono">
                    {formData.voucherifyId || 'Not synced'}
                  </code>
                </div>
                <p className="text-xs text-muted-foreground">
                  ✓ When saved, this promotion will be synced to Voucherify
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {onDelete && promotion && (
              <Button
                variant="outline"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this promotion?')) {
                    onDelete(promotion.id);
                  }
                }}
                className="text-destructive hover:text-destructive"
              >
                Delete
              </Button>
            )}
            <Button onClick={handleSave} variant="default">
              {promotion ? 'Update' : 'Create'} Promotion
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CustomerPromotionEditModal;
