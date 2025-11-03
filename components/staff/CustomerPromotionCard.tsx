import React from 'react';
import { CustomerPromotion } from '../../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { PencilIcon, TrashIcon } from '../icons/Icon';
import { getScheduleDescription, isPromotionActiveNow } from '../../lib/promotionScheduling';

interface CustomerPromotionCardProps {
  promotion: CustomerPromotion;
  onEdit: (promotion: CustomerPromotion) => void;
  onDelete: (id: string) => void;
  onStats?: (promotion: CustomerPromotion) => void;
}

const CustomerPromotionCard: React.FC<CustomerPromotionCardProps> = ({
  promotion,
  onEdit,
  onDelete,
  onStats,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'Draft':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'loyalty-scheme' ? '🎁 Loyalty Scheme' : '🎟️ Promo Code';
  };

  const isExpired = new Date(promotion.endsAt) < new Date();
  const daysRemaining = Math.ceil(
    (new Date(promotion.endsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const renderDiscountValue = () => {
    if (promotion.type === 'loyalty-scheme') {
      return `${promotion.tierBenefits?.length || 0} Tiers`;
    }

    if (promotion.discountType === 'percentage') {
      return `${promotion.discountValue}% Off`;
    } else if (promotion.discountType === 'fixed') {
      return `£${promotion.discountValue} Off`;
    } else if (promotion.discountType === 'double-points') {
      return '2x Points';
    }
    return 'Free Ride';
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
              {getTypeLabel(promotion.type)}
            </p>
            <CardTitle className="text-lg">{promotion.name}</CardTitle>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
              promotion.status
            )}`}
          >
            {promotion.status}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{promotion.description}</p>

        <div className="bg-primary/10 p-3 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Discount:</p>
            <p className="text-sm font-bold text-primary">{renderDiscountValue()}</p>
          </div>

          {promotion.type === 'promo-code' && promotion.maxRedemptions && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Usage:</p>
              <p className="text-sm font-semibold">
                {promotion.redeemCount || 0} / {promotion.maxRedemptions}
              </p>
            </div>
          )}

          {promotion.targetAudience && promotion.targetAudience !== 'all' && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Target:</p>
              <p className="text-xs font-medium capitalize">
                {promotion.targetAudience.replace(/-/g, ' ')}
              </p>
            </div>
          )}

          {promotion.schedule && (
            <div className="flex items-start justify-between">
              <p className="text-xs text-muted-foreground">Schedule:</p>
              <p className="text-xs font-medium text-right">
                {getScheduleDescription(promotion.schedule)}
              </p>
            </div>
          )}

          {promotion.schedule && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Status:</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                isPromotionActiveNow(promotion.schedule)
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
              }`}>
                {isPromotionActiveNow(promotion.schedule) ? '✓ Active Now' : '⏱ Scheduled'}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {isExpired
              ? 'Expired'
              : daysRemaining === 0
              ? 'Expires today'
              : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`}
          </span>
          {promotion.voucherifyId && (
            <span className="flex items-center gap-1">
              ✓ Voucherify synced
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 flex-col sm:flex-row">
        <Button
          className="flex-1"
          variant="outline"
          size="sm"
          onClick={() => onEdit(promotion)}
        >
          <PencilIcon className="w-4 h-4 mr-2" />
          Edit
        </Button>
        {onStats && (
          <Button
            className="flex-1"
            variant="outline"
            size="sm"
            onClick={() => onStats(promotion)}
          >
            📊 Stats
          </Button>
        )}
        <Button
          className="flex-1 text-destructive hover:text-destructive"
          variant="outline"
          size="sm"
          onClick={() => onDelete(promotion.id)}
        >
          <TrashIcon className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CustomerPromotionCard;
