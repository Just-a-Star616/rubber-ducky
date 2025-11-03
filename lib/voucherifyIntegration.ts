/**
 * Voucherify Integration
 * Handles loyalty programs, promotion codes, and discount campaigns
 * Integrates with Voucherify API for managing customer promotions
 */

import { CustomerPromotion, VoucherifyConfig } from '../types';

/**
 * Get Voucherify configuration from environment variables
 */
export const getVoucherifyConfig = (): VoucherifyConfig | null => {
  const apiKey = (import.meta as any).env?.VITE_VOUCHERIFY_API_KEY;
  const workspaceId = (import.meta as any).env?.VITE_VOUCHERIFY_WORKSPACE_ID;
  const clientId = (import.meta as any).env?.VITE_VOUCHERIFY_CLIENT_ID;

  if (!apiKey || !workspaceId || !clientId) {
    console.warn('Voucherify configuration incomplete. Some features may not work.');
    return null;
  }

  return {
    apiKey,
    workspaceId,
    clientId,
    environment: (import.meta as any).env?.VITE_VOUCHERIFY_ENV || 'production',
  };
};

/**
 * Fetch all campaigns from Voucherify
 */
export const fetchVoucherifyCampaigns = async (
  config: VoucherifyConfig
): Promise<any[]> => {
  try {
    const response = await fetch(
      `https://api.voucherify.io/v1/campaigns?limit=100`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'X-App-Id': config.workspaceId,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Voucherify API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.campaigns || [];
  } catch (error) {
    console.error('Error fetching Voucherify campaigns:', error);
    return [];
  }
};

/**
 * Create a new loyalty program in Voucherify
 */
export const createLoyaltyProgram = async (
  config: VoucherifyConfig,
  promotion: CustomerPromotion
): Promise<string | null> => {
  try {
    const payload = {
      name: promotion.name,
      type: 'LOYALTY_PROGRAM',
      description: promotion.description,
      validityPeriod: {
        duration: Math.ceil(
          (new Date(promotion.endsAt).getTime() - new Date(promotion.startsAt).getTime()) /
          (1000 * 60 * 60 * 24)
        ),
        unit: 'DAYS',
      },
      tiers: promotion.tierBenefits?.map((tier) => ({
        name: tier.tier,
        earnRules: [
          {
            type: 'CUSTOM',
            description: `${tier.tier} tier`,
          },
        ],
        redeemRules: [
          {
            type: 'CUSTOM',
            description: `${tier.rewardDescription}`,
          },
        ],
      })),
      metadata: {
        targetAudience: promotion.targetAudience,
        applicableServices: promotion.applicableServices,
      },
    };

    const response = await fetch(
      `https://api.voucherify.io/v1/loyalty-programs`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'X-App-Id': config.workspaceId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create loyalty program: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error creating loyalty program:', error);
    return null;
  }
};

/**
 * Create a promotion campaign in Voucherify
 */
export const createPromotionCampaign = async (
  config: VoucherifyConfig,
  promotion: CustomerPromotion
): Promise<string | null> => {
  try {
    const discountEffect = promotion.voucherifyConfig?.discountEffect || 'APPLY_TO_ORDER';
    const discount =
      promotion.discountType === 'percentage'
        ? {
            type: 'PERCENT',
            percentOff: promotion.discountValue,
            percentOffFormula: `${promotion.discountValue}`,
          }
        : {
            type: 'FIXED',
            amountOff: promotion.discountValue,
            amountOffFormula: `${promotion.discountValue}`,
          };

    const payload = {
      name: promotion.name,
      type: 'PROMOTION',
      description: promotion.description,
      discount,
      startDate: new Date(promotion.startsAt).toISOString(),
      expirationDate: new Date(promotion.endsAt).toISOString(),
      redeemable: {
        limit: promotion.maxRedemptions,
      },
      validityPeriod: {
        duration: Math.ceil(
          (new Date(promotion.endsAt).getTime() - new Date(promotion.startsAt).getTime()) /
          (1000 * 60 * 60 * 24)
        ),
        unit: 'DAYS',
      },
      metadata: {
        targetAudience: promotion.targetAudience,
        applicableServices: promotion.applicableServices,
        minimumOrderValue: promotion.minimumOrderValue,
        maximumDiscountValue: promotion.maximumDiscountValue,
      },
    };

    const response = await fetch(
      `https://api.voucherify.io/v1/campaigns`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'X-App-Id': config.workspaceId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create promotion: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error creating promotion campaign:', error);
    return null;
  }
};

/**
 * Generate promo codes for a campaign
 */
export const generatePromoCodes = async (
  config: VoucherifyConfig,
  campaignId: string,
  count: number = 100
): Promise<string[]> => {
  try {
    const response = await fetch(
      `https://api.voucherify.io/v1/campaigns/${campaignId}/vouchers?count=${count}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'X-App-Id': config.workspaceId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generate: {
            count,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to generate vouchers: ${response.statusText}`);
    }

    const data = await response.json();
    return data.vouchers?.map((v: any) => v.code) || [];
  } catch (error) {
    console.error('Error generating promo codes:', error);
    return [];
  }
};

/**
 * Validate a promo code
 */
export const validatePromoCode = async (
  config: VoucherifyConfig,
  code: string,
  orderValue?: number
): Promise<{ valid: boolean; discount?: number; message?: string }> => {
  try {
    const payload: any = {
      code,
    };

    if (orderValue) {
      payload.orderValue = Math.round(orderValue * 100); // Convert to cents
    }

    const response = await fetch(
      `https://api.voucherify.io/v1/vouchers/${code}/validate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'X-App-Id': config.workspaceId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      return {
        valid: false,
        message: 'Invalid or expired promo code',
      };
    }

    const data = await response.json();
    return {
      valid: data.valid,
      discount: data.discount?.value,
      message: data.message,
    };
  } catch (error) {
    console.error('Error validating promo code:', error);
    return {
      valid: false,
      message: 'Error validating promo code',
    };
  }
};

/**
 * Redeem a promo code
 */
export const redeemPromoCode = async (
  config: VoucherifyConfig,
  code: string,
  customerId: string,
  orderValue?: number
): Promise<{ success: boolean; discount?: number; message?: string }> => {
  try {
    const payload: any = {
      customer: {
        id: customerId,
        source_id: customerId,
      },
      metadata: {
        redeemedAt: new Date().toISOString(),
      },
    };

    if (orderValue) {
      payload.orderValue = Math.round(orderValue * 100);
    }

    const response = await fetch(
      `https://api.voucherify.io/v1/vouchers/${code}/redemption`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'X-App-Id': config.workspaceId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      return {
        success: false,
        message: 'Failed to redeem promo code',
      };
    }

    const data = await response.json();
    return {
      success: true,
      discount: data.discount?.value,
      message: 'Promo code redeemed successfully',
    };
  } catch (error) {
    console.error('Error redeeming promo code:', error);
    return {
      success: false,
      message: 'Error redeeming promo code',
    };
  }
};

/**
 * Add points to customer loyalty account
 */
export const addLoyaltyPoints = async (
  config: VoucherifyConfig,
  customerId: string,
  points: number,
  programId: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://api.voucherify.io/v1/customers/${customerId}/loyalty/${programId}/points`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'X-App-Id': config.workspaceId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          points,
          description: 'Ride completion bonus',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to add points: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error adding loyalty points:', error);
    return false;
  }
};

/**
 * Get customer loyalty balance
 */
export const getLoyaltyBalance = async (
  config: VoucherifyConfig,
  customerId: string,
  programId: string
): Promise<{ points: number; tier?: string } | null> => {
  try {
    const response = await fetch(
      `https://api.voucherify.io/v1/customers/${customerId}/loyalty/${programId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'X-App-Id': config.workspaceId,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch loyalty balance: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      points: data.points || 0,
      tier: data.tier?.name,
    };
  } catch (error) {
    console.error('Error fetching loyalty balance:', error);
    return null;
  }
};

/**
 * Update campaign status in Voucherify
 */
export const updateCampaignStatus = async (
  config: VoucherifyConfig,
  campaignId: string,
  status: 'ACTIVE' | 'INACTIVE'
): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://api.voucherify.io/v1/campaigns/${campaignId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'X-App-Id': config.workspaceId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          active: status === 'ACTIVE',
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error updating campaign status:', error);
    return false;
  }
};

/**
 * Get campaign statistics
 */
export const getCampaignStats = async (
  config: VoucherifyConfig,
  campaignId: string
): Promise<{
  totalRedemptions: number;
  uniqueCustomers: number;
  totalDiscount: number;
} | null> => {
  try {
    const response = await fetch(
      `https://api.voucherify.io/v1/campaigns/${campaignId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'X-App-Id': config.workspaceId,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch campaign stats: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      totalRedemptions: data.redemptions?.redeemCount || 0,
      uniqueCustomers: data.redemptions?.rollupRedeemCount || 0,
      totalDiscount: data.redemptions?.rollupAmount || 0,
    };
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    return null;
  }
};
