import {
    Invoice, Transaction, CommissionScheme, Booking, RewardScheme, Promotion, PartnerOffer,
    PromotionParticipant, CustomerPromotion, FAQItem, Notification, ActivityEvent, Automation, AutomationTrigger,
    AutomationAction, SystemAttribute, FinancialTransaction, HistoricInvoice, MessageTemplate,
    // FIX: Add missing type imports and correct the type for mockWebhookEvents.
    MessageEvent as AppMessageEvent,
    BaseApiConfig,
    EndpointDefinition,
    WebhookDefinition,
    WebhookEvent
} from '../types';

export * from './mockCompanyData';
export * from './mockCustomerAccountData';
export * from './mockDriverStaffData';

// --- BOOKING & INVOICING DATA ---

export const mockInvoices: Invoice[] = [
    { id: 'INV001', weekEnding: new Date(Date.now() - 7 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1250.50, commission: 250.10, netEarnings: 1000.40, statementUrl: '#', items: [
        {id: '1', date: new Date().toISOString(), description: 'Booking B001', amount: 50},
        {id: '2', date: new Date().toISOString(), description: 'Booking B002', amount: 30},
    ]},
    { id: 'INV002', weekEnding: new Date(Date.now() - 14 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1100.00, commission: 220.00, netEarnings: 880.00, statementUrl: '#', items: [] },
    { id: 'INV003', weekEnding: new Date(Date.now() - 21 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1350.25, commission: 270.05, netEarnings: 1080.20, statementUrl: '#', items: [] },
    { id: 'INV004', weekEnding: new Date(Date.now() - 28 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1425.75, commission: 285.15, netEarnings: 1140.60, statementUrl: '#', items: [] },
    { id: 'INV005', weekEnding: new Date(Date.now() - 35 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1180.00, commission: 236.00, netEarnings: 944.00, statementUrl: '#', items: [] },
    { id: 'INV006', weekEnding: new Date(Date.now() - 42 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1520.50, commission: 304.10, netEarnings: 1216.40, statementUrl: '#', items: [] },
    { id: 'INV007', weekEnding: new Date(Date.now() - 49 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 995.25, commission: 199.05, netEarnings: 796.20, statementUrl: '#', items: [] },
    { id: 'INV008', weekEnding: new Date(Date.now() - 56 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1275.00, commission: 255.00, netEarnings: 1020.00, statementUrl: '#', items: [] },
    { id: 'INV009', weekEnding: new Date(Date.now() - 63 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1380.75, commission: 276.15, netEarnings: 1104.60, statementUrl: '#', items: [] },
    { id: 'INV010', weekEnding: new Date(Date.now() - 70 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1150.50, commission: 230.10, netEarnings: 920.40, statementUrl: '#', items: [] },
];

export const mockFinancialTransactions: FinancialTransaction[] = [
    { id: 'FT001', type: 'Booking', amount: 50.00, currency: 'GBP', description: 'Booking B00123', bookingId: 'B00123', driverId: 'D001', timestamp: new Date().toISOString(), status: 'Completed', taxable: true, vatRate: 20 },
    { id: 'FT002', type: 'Commission', amount: -10.00, currency: 'GBP', description: 'Commission for B00123', bookingId: 'B00123', driverId: 'D001', timestamp: new Date().toISOString(), status: 'Completed', taxable: false },
];

export const mockHistoricInvoices: HistoricInvoice[] = [
    { id: 'HINV001', type: 'Driver', recipientId: 'D001', recipientName: 'John Doe', recipientEmail: 'john.doe@example.com', periodStart: '2025-08-01', periodEnd: '2025-08-07', netAmount: 1000.40, grossAmount: 1250.50, commission: 250.10, emailStatus: 'Sent', sentDate: '2025-08-08T10:00:00Z', transactionIds: ['FT001', 'FT002'] },
    { id: 'HINV002', type: 'Account', recipientId: 'A001', recipientName: 'Innovate Corp', recipientEmail: 'billing@innovate.com', periodStart: '2025-08-01', periodEnd: '2025-08-31', netAmount: 5250.00, grossAmount: 5250.00, commission: 0, emailStatus: 'Sent', sentDate: '2025-09-01T10:00:00Z' },
    { id: 'HINV003', type: 'Driver', recipientId: 'D002', recipientName: 'Jane Smith', recipientEmail: 'jane.smith@example.com', periodStart: '2025-08-01', periodEnd: '2025-08-07', netAmount: 880.00, grossAmount: 1100.00, commission: 220.00, emailStatus: 'Failed', sentDate: '2025-08-08T10:01:00Z' },
];

export const mockCommissionSchemes: CommissionScheme[] = [
    { id: '1', name: 'Standard 20%', type: '%', details: 'A flat 20% commission on all jobs.', commissionRate: 20 },
    { id: '2', name: 'Tiered Commission', type: 'Tiered % per £ banding', details: 'Commission rate varies based on weekly earnings.', tiers: [{ rate: 25, upTo: 500 }, { rate: 20, upTo: 1000 }, { rate: 15, upTo: 999999 }] },
    { id: '3', name: 'Fixed Fee + Rent', type: 'Fixed', details: 'A fixed weekly charge for data and services.', dataCharge: 50, vehicleRent: 150, insuranceDeposit: 25 },
];

export const mockBookingAttributesList: string[] = ['Wheelchair Accessible', 'Pet Friendly', 'Executive Saloon', 'MPV (6-seater)', 'Airport Specialist', 'Contactless Payment', 'Child Seat Available'];

export const mockBookings: Booking[] = [
    { id: 'B001', customerId: 'C001', driverId: 'D001', vehicleId: 'V001', pickupDateTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(), pickupAddress: 'Manchester Airport', vias: [], destinationAddress: '123 Main St, Manchester', customerName: 'Alice', customerPhone: '07111222333', cost: 40.00, price: 50.00, status: 'Upcoming', siteId: 'SITE01', attributes: ['Airport Specialist'], estimatedDuration: 45, routeDistance: 15, paymentStatus: 'Paid', paymentMethod: 'Card', pickupCoordinates: {lat: 53.36, lng: -2.27}, destinationCoordinates: {lat: 53.48, lng: -2.24} },
    { id: 'B002', customerId: 'C002', driverId: 'D002', vehicleId: 'V002', pickupDateTime: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), pickupAddress: 'Anfield, Liverpool', vias: [], destinationAddress: 'Lime Street Station, Liverpool', customerName: 'Bob', customerPhone: '07444555666', cost: 12.00, price: 15.00, status: 'Completed', siteId: 'SITE02', attributes: ['Pet Friendly'], estimatedDuration: 20, routeDistance: 5, paymentStatus: 'Paid', paymentMethod: 'Cash', pickupCoordinates: {lat: 53.43, lng: -2.96}, destinationCoordinates: {lat: 53.40, lng: -2.98} },
    { id: 'B003', customerId: 'C001', accountName: 'Innovate Corp', pickupDateTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), pickupAddress: '123 Main St, Manchester', vias: [], destinationAddress: 'MediaCityUK, Salford', customerName: 'Alice', customerPhone: '07111222333', cost: 18.00, price: 25.00, status: 'Upcoming', siteId: 'SITE01', attributes: [], estimatedDuration: 30, routeDistance: 8, paymentStatus: 'Pending', paymentMethod: 'Account', pickupCoordinates: {lat: 53.48, lng: -2.24}, destinationCoordinates: {lat: 53.47, lng: -2.29} },
    { id: 'B004', customerId: 'C003', driverId: 'D003', vehicleId: 'V003', pickupDateTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), pickupAddress: 'Manchester City Centre', vias: [], destinationAddress: 'Manchester Piccadilly', customerName: 'Carol', customerPhone: '07888999000', cost: 8.50, price: 12.00, status: 'Completed', siteId: 'SITE01', attributes: ['Wheelchair Accessible'], estimatedDuration: 15, routeDistance: 3, paymentStatus: 'Paid', paymentMethod: 'Card', pickupCoordinates: {lat: 53.48, lng: -2.24}, destinationCoordinates: {lat: 53.47, lng: -2.18} },
    { id: 'B005', customerId: 'C005', driverId: 'D004', vehicleId: 'V004', pickupDateTime: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), pickupAddress: 'Altrincham Station', vias: ['Stockport Town Centre'], destinationAddress: 'Trafford Park Business Centre', customerName: 'Emma', customerPhone: '07555666777', cost: 28.00, price: 35.00, status: 'Completed', siteId: 'SITE01', attributes: ['Executive Saloon'], estimatedDuration: 35, routeDistance: 12, paymentStatus: 'Paid', paymentMethod: 'Card', pickupCoordinates: {lat: 53.39, lng: -2.34}, destinationCoordinates: {lat: 53.43, lng: -2.31} },
    { id: 'B006', customerId: 'C002', accountName: 'Liverpool Events Co.', pickupDateTime: new Date(Date.now() + 48 * 3600 * 1000).toISOString(), pickupAddress: 'Liverpool Town Hall', vias: [], destinationAddress: 'Sefton Park', customerName: 'Bob', customerPhone: '07444555666', cost: 22.00, price: 30.00, status: 'Upcoming', siteId: 'SITE02', attributes: ['MPV (6-seater)'], estimatedDuration: 25, routeDistance: 7, paymentStatus: 'Pending', paymentMethod: 'Account', pickupCoordinates: {lat: 53.41, lng: -2.98}, destinationCoordinates: {lat: 53.41, lng: -2.96} },
    { id: 'B007', customerId: 'C004', driverId: 'D005', vehicleId: 'V005', pickupDateTime: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), pickupAddress: 'Salford Quays', vias: [], destinationAddress: 'Manchester Airport', customerName: 'David', customerPhone: '07222333444', cost: 35.00, price: 45.00, status: 'Completed', siteId: 'SITE01', attributes: ['Airport Specialist', 'Contactless Payment'], estimatedDuration: 40, routeDistance: 14, paymentStatus: 'Paid', paymentMethod: 'Card', pickupCoordinates: {lat: 53.47, lng: -2.29}, destinationCoordinates: {lat: 53.36, lng: -2.27} },
    { id: 'B008', customerId: 'C006', driverId: 'D002', vehicleId: 'V002', pickupDateTime: new Date(Date.now() - 72 * 3600 * 1000).toISOString(), pickupAddress: 'Liverpool Central Station', vias: [], destinationAddress: 'Chester', customerName: 'Frank', customerPhone: '07666777888', cost: 42.00, price: 55.00, status: 'Completed', siteId: 'SITE02', attributes: ['Pet Friendly'], estimatedDuration: 55, routeDistance: 18, paymentStatus: 'Paid', paymentMethod: 'Cash', pickupCoordinates: {lat: 53.40, lng: -2.98}, destinationCoordinates: {lat: 53.19, lng: -2.89} },
    { id: 'B009', customerId: 'C001', driverId: 'D001', vehicleId: 'V001', pickupDateTime: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(), pickupAddress: '123 Main St, Manchester', vias: [], destinationAddress: 'Manchester Exhibition Centre', customerName: 'Alice', customerPhone: '07111222333', cost: 15.00, price: 20.00, status: 'Upcoming', siteId: 'SITE01', attributes: [], estimatedDuration: 20, routeDistance: 6, paymentStatus: 'Pending', paymentMethod: 'Card', pickupCoordinates: {lat: 53.48, lng: -2.24}, destinationCoordinates: {lat: 53.47, lng: -2.28} },
    { id: 'B010', customerId: 'C003', accountName: 'Manchester University', pickupDateTime: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), pickupAddress: 'University of Manchester', vias: [], destinationAddress: 'Royal Infirmary', customerName: 'Carol', customerPhone: '07888999000', cost: 18.00, price: 25.00, status: 'Completed', siteId: 'SITE01', attributes: ['Wheelchair Accessible'], estimatedDuration: 25, routeDistance: 8, paymentStatus: 'Paid', paymentMethod: 'Account', pickupCoordinates: {lat: 53.47, lng: -2.23}, destinationCoordinates: {lat: 53.41, lng: -2.18} },
    { id: 'B011', customerId: 'C005', driverId: 'D003', vehicleId: 'V003', pickupDateTime: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), pickupAddress: 'Stockport', vias: [], destinationAddress: 'Manchester City Centre', customerName: 'Emma', customerPhone: '07555666777', cost: 16.00, price: 22.00, status: 'Completed', siteId: 'SITE01', attributes: [], estimatedDuration: 30, routeDistance: 9, paymentStatus: 'Paid', paymentMethod: 'Card', pickupCoordinates: {lat: 53.41, lng: -2.15}, destinationCoordinates: {lat: 53.48, lng: -2.24} },
    { id: 'B012', customerId: 'C002', driverId: 'D005', vehicleId: 'V005', pickupDateTime: new Date(Date.now() - 96 * 3600 * 1000).toISOString(), pickupAddress: 'Wirral', vias: [], destinationAddress: 'Liverpool Station', customerName: 'Bob', customerPhone: '07444555666', cost: 38.00, price: 50.00, status: 'Completed', siteId: 'SITE02', attributes: ['MPV (6-seater)'], estimatedDuration: 50, routeDistance: 16, paymentStatus: 'Paid', paymentMethod: 'Cash', pickupCoordinates: {lat: 53.38, lng: -3.07}, destinationCoordinates: {lat: 53.40, lng: -2.98} },
];

export const mockBookingTrendData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
        date: date.toISOString().split('T')[0],
        bookings: Math.floor(Math.random() * 50) + 150,
        revenue: Math.floor(Math.random() * 2000) + 6000,
    };
});

// --- PROMOTIONS & REWARDS ---

export const mockRewardSchemes: RewardScheme[] = [
    { id: 'RS01', title: 'Weekend Warrior', description: 'Complete 50 jobs over a weekend to earn a bonus.', currentProgress: 0, target: 50, rewardDescription: '£50 Credit Bonus', eligibilityRules: [], participantIds: ['D001'] },
    { id: 'RS02', title: 'Airport Ace', description: 'Complete 10 airport jobs in a week for a commission rebate.', currentProgress: 0, target: 10, rewardDescription: '5% Commission Rebate', eligibilityRules: ['attributes.includes("Airport Specialist")'], participantIds: [] },
];

export const mockPromotions: Promotion[] = [
    { id: 'P01', title: 'Refer a Driver', description: 'Refer a new driver and earn a bonus when they complete 100 jobs.', callToAction: 'Refer Now', eligibilityRules: [], participantIds: ['D001', 'D002'] },
];

export const mockPartnerOffers: PartnerOffer[] = [
    { id: 'PO01', partnerName: 'Halfords', title: '10% off Car Maintenance', description: 'Get 10% off any in-store service.', promoCode: 'TAXI10', eligibilityRules: [], participantIds: ['D001', 'D002', 'D003'] },
];

export const mockPromotionParticipants: PromotionParticipant[] = [
    { id: 'PP01', promotionId: 'RS01', driverId: 'D001', status: 'Active', progress: 35, joinDate: new Date().toISOString() },
    { id: 'PP02', promotionId: 'P01', driverId: 'D002', status: 'Active', progress: 0, joinDate: new Date().toISOString() },
];

// --- CUSTOMER PROMOTIONS (Loyalty & Promo Codes via Voucherify) ---

export const mockCustomerPromotions: CustomerPromotion[] = [
    {
        id: 'CP01',
        type: 'loyalty-scheme',
        name: 'Loyalty Rewards Program',
        description: 'Earn points on every ride. Redeem for discounts and free rides.',
        status: 'Active',
        voucherifyId: 'loyalty_prog_123',
        voucherifyType: 'LOYALTY_PROGRAM',
        loyaltyTier: 'standard',
        pointsName: 'RidePoints',
        tierBenefits: [
            { tier: 'Bronze', pointsRequired: 0, rewardDescription: 'Base member', rewardValue: 1, rewardUnit: 'point-per-ride' },
            { tier: 'Silver', pointsRequired: 500, rewardDescription: '5% discount', rewardValue: 5, rewardUnit: '%' },
            { tier: 'Gold', pointsRequired: 1500, rewardDescription: '10% discount', rewardValue: 10, rewardUnit: '%' },
            { tier: 'Platinum', pointsRequired: 3000, rewardDescription: 'Free ride', rewardValue: 1, rewardUnit: 'free-rides' }
        ],
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        targetAudience: 'all',
        applicableServices: ['rides', 'delivery'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'SM01',
        voucherifyConfig: {
            campaignType: 'LOYALTY_PROGRAM',
            discountType: 'PERCENT',
            discountEffect: 'APPLY_TO_ORDER',
            loyaltyPoints: 1
        }
    },
    {
        id: 'CP02',
        type: 'promo-code',
        name: 'Black Friday Sale',
        description: '20% off all rides this weekend. Use code BLACKFRI20',
        status: 'Active',
        voucherifyId: 'camp_blackfri_2024',
        voucherifyType: 'PROMOTION',
        discountType: 'percentage',
        discountValue: 20,
        maxRedemptions: 500,
        redeemCount: 187,
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        targetAudience: 'all',
        minimumOrderValue: 5,
        maximumDiscountValue: 25,
        applicableServices: ['rides'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'SM02',
        voucherifyConfig: {
            campaignType: 'PROMOTION',
            discountType: 'PERCENT',
            discountEffect: 'APPLY_TO_ORDER',
            redeemableLimit: 500
        }
    },
    {
        id: 'CP03',
        type: 'promo-code',
        name: 'New Driver Welcome Bonus',
        description: '£10 off your first 3 rides. Use code WELCOME10',
        status: 'Active',
        voucherifyId: 'camp_welcome_2024',
        voucherifyType: 'PROMOTION',
        discountType: 'fixed',
        discountValue: 10,
        maxRedemptions: 1000,
        redeemCount: 432,
        startsAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endsAt: new Date(Date.now() + 330 * 24 * 60 * 60 * 1000).toISOString(),
        targetAudience: 'new-drivers',
        minimumOrderValue: 3,
        applicableServices: ['rides'],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'SM01',
        voucherifyConfig: {
            campaignType: 'PROMOTION',
            discountType: 'FIXED',
            discountEffect: 'APPLY_TO_ORDER',
            redeemableLimit: 1000
        }
    },
    {
        id: 'CP04',
        type: 'promo-code',
        name: 'Inactive Driver Re-engagement',
        description: '15% off to come back and take a ride. Use code COMEBACK15',
        status: 'Active',
        voucherifyId: 'camp_reeng_2024',
        voucherifyType: 'PROMOTION',
        discountType: 'percentage',
        discountValue: 15,
        maxRedemptions: 200,
        redeemCount: 45,
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        targetAudience: 'inactive-drivers',
        applicableServices: ['rides'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'SM02',
        voucherifyConfig: {
            campaignType: 'PROMOTION',
            discountType: 'PERCENT',
            discountEffect: 'APPLY_TO_ORDER',
            redeemableLimit: 200
        }
    },
    {
        id: 'CP05',
        type: 'promo-code',
        name: 'Midweek Momentum',
        description: '10% off on Mon, Wed, Fri between 10am-1pm. Use code XX10',
        status: 'Active',
        voucherifyId: 'camp_midweek_2024',
        voucherifyType: 'PROMOTION',
        discountType: 'percentage',
        discountValue: 10,
        maxRedemptions: 1000,
        redeemCount: 342,
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        targetAudience: 'all',
        applicableServices: ['rides'],
        schedule: {
            type: 'specific-days-and-times',
            timezone: 'Europe/London',
            daysOfWeek: [
                { day: 'Monday', enabled: true, timePeriods: [{ startTime: '10:00', endTime: '13:00' }] },
                { day: 'Tuesday', enabled: false, timePeriods: [] },
                { day: 'Wednesday', enabled: true, timePeriods: [{ startTime: '10:00', endTime: '13:00' }] },
                { day: 'Thursday', enabled: false, timePeriods: [] },
                { day: 'Friday', enabled: true, timePeriods: [{ startTime: '10:00', endTime: '13:00' }] },
                { day: 'Saturday', enabled: false, timePeriods: [] },
                { day: 'Sunday', enabled: false, timePeriods: [] },
            ],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'SM01',
        voucherifyConfig: {
            campaignType: 'PROMOTION',
            discountType: 'PERCENT',
            discountEffect: 'APPLY_TO_ORDER',
            redeemableLimit: 1000
        }
    },
    {
        id: 'CP06',
        type: 'promo-code',
        name: 'Rush Hour Boost',
        description: 'Double points during peak hours: Mon-Fri 7-10am & 5-8pm',
        status: 'Active',
        voucherifyId: 'camp_rush_2024',
        voucherifyType: 'PROMOTION',
        discountType: 'double-points',
        maxRedemptions: 5000,
        redeemCount: 1823,
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        targetAudience: 'all',
        applicableServices: ['rides'],
        schedule: {
            type: 'specific-days-and-times',
            timezone: 'Europe/London',
            daysOfWeek: [
                { day: 'Monday', enabled: true, timePeriods: [
                    { startTime: '07:00', endTime: '10:00' },
                    { startTime: '17:00', endTime: '20:00' }
                ]},
                { day: 'Tuesday', enabled: true, timePeriods: [
                    { startTime: '07:00', endTime: '10:00' },
                    { startTime: '17:00', endTime: '20:00' }
                ]},
                { day: 'Wednesday', enabled: true, timePeriods: [
                    { startTime: '07:00', endTime: '10:00' },
                    { startTime: '17:00', endTime: '20:00' }
                ]},
                { day: 'Thursday', enabled: true, timePeriods: [
                    { startTime: '07:00', endTime: '10:00' },
                    { startTime: '17:00', endTime: '20:00' }
                ]},
                { day: 'Friday', enabled: true, timePeriods: [
                    { startTime: '07:00', endTime: '10:00' },
                    { startTime: '17:00', endTime: '20:00' }
                ]},
                { day: 'Saturday', enabled: false, timePeriods: [] },
                { day: 'Sunday', enabled: false, timePeriods: [] },
            ],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'SM02',
        voucherifyConfig: {
            campaignType: 'PROMOTION',
            discountType: 'UNIT',
            discountEffect: 'APPLY_TO_ORDER',
            redeemableLimit: 5000,
            loyaltyPoints: 2
        }
    },
    {
        id: 'CP07',
        type: 'promo-code',
        name: 'Weekend Nights Bonanza',
        description: '£5 off Friday-Sunday after 8pm. Use code NITE5',
        status: 'Active',
        voucherifyId: 'camp_weekend_2024',
        voucherifyType: 'PROMOTION',
        discountType: 'fixed',
        discountValue: 5,
        maxRedemptions: 800,
        redeemCount: 567,
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
        targetAudience: 'all',
        minimumOrderValue: 8,
        applicableServices: ['rides'],
        schedule: {
            type: 'specific-days-and-times',
            timezone: 'Europe/London',
            daysOfWeek: [
                { day: 'Monday', enabled: false, timePeriods: [] },
                { day: 'Tuesday', enabled: false, timePeriods: [] },
                { day: 'Wednesday', enabled: false, timePeriods: [] },
                { day: 'Thursday', enabled: false, timePeriods: [] },
                { day: 'Friday', enabled: true, timePeriods: [{ startTime: '20:00', endTime: '23:59' }] },
                { day: 'Saturday', enabled: true, timePeriods: [{ startTime: '00:00', endTime: '23:59' }] },
                { day: 'Sunday', enabled: true, timePeriods: [{ startTime: '00:00', endTime: '23:59' }] },
            ],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'SM01',
        voucherifyConfig: {
            campaignType: 'PROMOTION',
            discountType: 'FIXED',
            discountEffect: 'APPLY_TO_ORDER',
            redeemableLimit: 800
        }
    }
];


// --- GENERAL & SYSTEM ---

export const mockFaqs: FAQItem[] = [
    { id: 'F01', question: 'How do I view my statement?', answer: 'You can view your current and past statements from the "Invoices" tab in your portal.', category: 'Payments' },
    { id: 'F02', question: 'When do I get paid?', answer: 'Payments are processed weekly on Tuesdays for the previous week\'s earnings.', category: 'Payments' },
    { id: 'F03', question: 'How do I update my documents?', answer: 'Navigate to the "Profile" tab to submit new documents for approval.', category: 'Using the App' },
];


export const mockNotifications: Notification[] = [
    { id: 'N01', type: 'Compliance', title: 'Badge Expiring Soon', description: 'Peter Jones\'s badge is expired.', timestamp: new Date().toISOString(), isRead: false, link: '#', linkText: 'View Driver' },
    { id: 'N02', type: 'DriverUpdate', title: 'Document Submitted', description: 'John Doe has submitted a new driving license.', timestamp: new Date().toISOString(), isRead: false, link: '#', linkText: 'Review Document' },
    { id: 'N03', type: 'System', title: 'API Status Degraded', description: 'Payment gateway API is experiencing intermittent issues.', timestamp: new Date().toISOString(), isRead: true, link: '#' },
];

export const mockActivityFeed: ActivityEvent[] = [
    { id: 'AE01', type: 'New Driver', description: 'Emily White completed her application.', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 'AE02', type: 'Account Payment', description: 'Innovate Corp paid invoice #HINV002.', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), actor: 'System' },
    { id: 'AE03', type: 'New Booking', description: 'New booking B003 created for Innovate Corp.', timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), actor: 'Alex Johnson' },
];

export const mockSystemAttributes: SystemAttribute[] = [
    { id: 'ATTR01', name: 'Wheelchair Accessible', description: 'Vehicle is equipped for wheelchair access.', isActive: true, eligibility: ['Vehicle', 'Booking'], pricing: { type: 'fixed', priceEffect: 5, costEffect: 5, applyCommission: true }, conditions: {} },
    { id: 'ATTR02', name: 'Pet Friendly', description: 'Driver is willing to accept passengers with pets.', isActive: true, eligibility: ['Driver', 'Vehicle', 'Booking'], pricing: { type: 'none', priceEffect: 0, costEffect: 0, applyCommission: false }, conditions: {} },
];

// --- CONNECTORS & AUTOMATIONS ---

export const mockBaseApis: BaseApiConfig[] = [
    { id: 'API01', name: 'Internal Messaging', baseUrl: 'https://api.internal.example.com', authType: 'API Key', apiKey: 'SECRET', headerName: 'X-Internal-Api-Key' },
];

export const mockEndpointDefinitions: EndpointDefinition[] = [
    { id: 'EP01', baseApiId: 'API01', name: 'Send SMS', path: '/sms/send', method: 'POST', description: 'Sends an SMS to a specified number.', schema: '{"to": "string", "message": "string"}' },
];

// FIX: Changed type from AppMessageEvent[] to WebhookEvent[] to match the object's properties (availableVariables) and how it's used in components.
export const mockWebhookEvents: WebhookEvent[] = [
    { id: 'EVT01', name: 'Booking Created', description: 'Fires when a new booking is created.', availableVariables: {'booking': [], 'customer': []} },
    { id: 'EVT02', name: 'Driver Document Expiring', description: 'Fires 30 days before a driver document expires.', availableVariables: {'driver': [], 'document': []} },
    { id: 'EVT03', name: 'Booking Updated', description: 'Fires when a booking is updated.', availableVariables: {'booking': [], 'customer': [], 'changes': []} },
    { id: 'EVT04', name: 'Booking Cancelled', description: 'Fires when a booking is cancelled.', availableVariables: {'booking': [], 'customer': [], 'reason': []} },
    { id: 'EVT05', name: 'Driver Assigned', description: 'Fires when a driver is assigned to a booking.', availableVariables: {'booking': [], 'driver': [], 'vehicle': []} },
    { id: 'EVT06', name: 'Driver Arrived', description: 'Fires when driver arrives at pickup location.', availableVariables: {'booking': [], 'driver': [], 'location': []} },
    { id: 'EVT07', name: 'Journey Started', description: 'Fires when a journey begins.', availableVariables: {'booking': [], 'driver': [], 'location': []} },
    { id: 'EVT08', name: 'Journey Completed', description: 'Fires when a journey is completed.', availableVariables: {'booking': [], 'driver': [], 'duration': [], 'distance': [], 'fare': []} },
    { id: 'EVT09', name: 'Journey No-Show', description: 'Fires when a journey is marked as no-show.', availableVariables: {'booking': [], 'customer': [], 'driver': [], 'reason': []} },
    { id: 'EVT10', name: 'Invoice Generated', description: 'Fires when an invoice is generated.', availableVariables: {'invoice': [], 'driver': [], 'amount': [], 'period': []} },
    { id: 'EVT11', name: 'Invoice Paid', description: 'Fires when an invoice payment is received.', availableVariables: {'invoice': [], 'driver': [], 'amount': [], 'paymentMethod': []} },
    { id: 'EVT12', name: 'Driver Created', description: 'Fires when a new driver is created.', availableVariables: {'driver': [], 'site': []} },
    { id: 'EVT13', name: 'Driver Updated', description: 'Fires when driver information is updated.', availableVariables: {'driver': [], 'changes': []} },
    { id: 'EVT14', name: 'Driver Status Changed', description: 'Fires when driver status is changed (Active/Inactive).', availableVariables: {'driver': [], 'status': [], 'reason': []} },
    { id: 'EVT15', name: 'Account Created', description: 'Fires when a new account is created.', availableVariables: {'account': [], 'site': []} },
    { id: 'EVT16', name: 'Account Updated', description: 'Fires when account information is updated.', availableVariables: {'account': [], 'changes': []} },
    { id: 'EVT17', name: 'Payment Processed', description: 'Fires when a payment is processed.', availableVariables: {'transaction': [], 'amount': [], 'method': [], 'account': []} },
    { id: 'EVT18', name: 'System Event', description: 'Fires for general system events and API calls.', availableVariables: {'event': [], 'details': []} },
];

export const mockWebhookDefinitions: WebhookDefinition[] = [
    { id: 'WH01', eventName: 'Booking Created', targetUrl: 'https://my-analytics.com/hooks/booking', status: 'Active', conditions: 'booking.price > 100' },
    { id: 'WH02', eventName: 'Driver Assigned', targetUrl: 'https://my-crm.com/hooks/driver-assignment', status: 'Active' },
    { id: 'WH03', eventName: 'Journey Completed', targetUrl: 'https://my-analytics.com/hooks/journey-complete', status: 'Active' },
    { id: 'WH04', eventName: 'Invoice Generated', targetUrl: 'https://my-accounting.com/hooks/invoice', status: 'Active' },
    { id: 'WH05', eventName: 'Journey No-Show', targetUrl: 'https://my-analytics.com/hooks/no-show', status: 'Inactive' },
];

export const mockMessageEvents: AppMessageEvent[] = [
    { id: 'MEVT01', name: 'Booking Confirmation', description: 'Sent to customer when a booking is created.', availablePlaceholders: ['customer.name', 'booking.pickupDateTime', 'booking.pickupAddress'] },
    { id: 'MEVT02', name: 'Driver Assigned', description: 'Sent to customer when a driver is assigned.', availablePlaceholders: ['customer.name', 'driver.firstName', 'vehicle.registration', 'vehicle.make', 'vehicle.model'] },
    { id: 'MEVT03', name: 'Driver Arrived', description: 'Sent to customer when driver arrives at pickup.', availablePlaceholders: ['driver.firstName', 'driver.mobileNumber', 'vehicle.registration'] },
    { id: 'MEVT04', name: 'Journey Completed', description: 'Sent to customer and driver when journey is completed.', availablePlaceholders: ['booking.id', 'duration', 'distance', 'fare', 'dropoffDateTime'] },
    { id: 'MEVT05', name: 'No-Show Alert', description: 'Sent to driver and dispatcher when booking is no-show.', availablePlaceholders: ['booking.id', 'customer.name', 'pickupTime', 'reason'] },
    { id: 'MEVT06', name: 'Invoice Generated', description: 'Sent to driver when invoice is generated.', availablePlaceholders: ['driver.firstName', 'invoice.id', 'invoice.amount', 'invoicePeriod'] },
    { id: 'MEVT07', name: 'Payment Confirmation', description: 'Sent to account when payment is processed.', availablePlaceholders: ['account.name', 'amount', 'paymentMethod', 'transactionId'] },
];

export const mockMessageTemplates: MessageTemplate[] = [
    { id: 'TPL01', eventId: 'MEVT01', name: 'Standard Booking Confirmation (SMS)', target: 'Customer', content: 'Hi {{customer.name}}, your booking for {{booking.pickupDateTime}} from {{booking.pickupAddress}} is confirmed.' },
    { id: 'TPL02', eventId: 'MEVT02', name: 'Driver Assigned Notification (SMS)', target: 'Customer', content: 'Your driver, {{driver.firstName}}, is on their way in a {{vehicle.make}} {{vehicle.model}} ({{vehicle.registration}}).' },
    { id: 'TPL03', eventId: 'MEVT01', name: 'New Booking Alert (Staff Notice)', target: 'Staff', content: 'New booking {{booking.id}} created for {{customer.name}}.', isNotice: true },
    { id: 'TPL04', eventId: 'MEVT03', name: 'Driver Arrived (SMS)', target: 'Customer', content: '{{driver.firstName}} has arrived. Call {{driver.mobileNumber}} or see {{vehicle.registration}}.' },
    { id: 'TPL05', eventId: 'MEVT04', name: 'Journey Complete Receipt (Email)', target: 'Customer', content: 'Journey completed in {{duration}} minutes. Distance: {{distance}} miles. Fare: {{fare}}. Thank you for using our service!' },
    { id: 'TPL06', eventId: 'MEVT05', name: 'No-Show Notification (Staff Notice)', target: 'Staff', content: 'Booking {{booking.id}} for {{customer.name}} is a no-show. Reason: {{reason}}', isNotice: true },
    { id: 'TPL07', eventId: 'MEVT06', name: 'Invoice Ready (SMS)', target: 'Driver', content: 'Hi {{driver.firstName}}, your invoice for {{invoicePeriod}} is ready. Total: {{invoice.amount}}' },
    { id: 'TPL08', eventId: 'MEVT07', name: 'Payment Received (Email)', target: 'Account', content: 'Payment of {{amount}} received via {{paymentMethod}}. Ref: {{transactionId}}' },
];

export const mockAutomationTriggers: AutomationTrigger[] = [
    { id: 'TRG01', name: 'Booking Created', description: 'Fires when a booking is created.', availableVariables: {'booking': [], 'customer': []} },
    { id: 'TRG02', name: 'Booking Status Changed', description: 'Fires when a booking\'s status is updated.', availableVariables: {'booking': [], 'customer': [], 'driver': [], 'oldStatus': [], 'newStatus': []} },
    { id: 'TRG03', name: 'Driver Assigned', description: 'Fires when a driver is assigned to a booking.', availableVariables: {'booking': [], 'driver': [], 'vehicle': []} },
    { id: 'TRG04', name: 'Driver Arrived', description: 'Fires when driver arrives at pickup location.', availableVariables: {'booking': [], 'driver': [], 'location': []} },
    { id: 'TRG05', name: 'Journey Completed', description: 'Fires when a journey is completed.', availableVariables: {'booking': [], 'driver': [], 'duration': [], 'distance': [], 'fare': []} },
    { id: 'TRG06', name: 'Journey No-Show', description: 'Fires when a journey is marked as no-show.', availableVariables: {'booking': [], 'customer': [], 'driver': [], 'reason': []} },
    { id: 'TRG07', name: 'Invoice Generated', description: 'Fires when an invoice is generated.', availableVariables: {'invoice': [], 'driver': [], 'amount': [], 'period': []} },
    { id: 'TRG08', name: 'Invoice Paid', description: 'Fires when an invoice payment is received.', availableVariables: {'invoice': [], 'driver': [], 'amount': [], 'paymentMethod': []} },
    { id: 'TRG09', name: 'Driver Status Changed', description: 'Fires when driver status changes (Active/Inactive).', availableVariables: {'driver': [], 'oldStatus': [], 'newStatus': [], 'reason': []} },
    { id: 'TRG10', name: 'Payment Processed', description: 'Fires when a payment is processed.', availableVariables: {'transaction': [], 'amount': [], 'method': [], 'account': []} },
];
export const mockAutomationActions: AutomationAction[] = [
    { id: 'ACT01', name: 'Send Message Template', description: 'Sends a pre-defined message template.', parameters: [{id: 'templateId', name: 'Template', type: 'template'}] },
    { id: 'ACT02', name: 'Add Attribute to Booking', description: 'Adds a system attribute to the booking.', parameters: [{id: 'attributeId', name: 'Attribute', type: 'attribute'}] },
];
export const mockAutomations: Automation[] = [
    { id: 'AUTO01', name: 'Notify VIP Booking', description: 'Sends a message when a VIP customer makes a booking.', isActive: true, triggerId: 'TRG01', conditions: 'customer.priorityLevel === "VIP"', actions: [{actionId: 'ACT01', parameters: {templateId: 'TPL03'}}] },
    { id: 'AUTO02', name: 'Alert Staff on VIP Booking Delays', description: 'Alerts staff and managers when a driver is running late for a VIP customer booking.', isActive: true, triggerId: 'TRG04', conditions: 'customer.account_type === "VIP" && estimated_arrival_delay > 10', actions: [{actionId: 'ACT01', parameters: {templateId: 'TPL02'}}] },
    { id: 'AUTO03', name: 'Driver Multi-Rejection Alert', description: 'Notifies driver manager when a driver rejects 3 jobs in a row.', isActive: true, triggerId: 'TRG09', conditions: 'driver.consecutive_rejections >= 3', actions: [{actionId: 'ACT01', parameters: {templateId: 'TPL06'}}] },
];

export const mockAccountingDefaults = {
    invoiceTemplate: 'Default',
    invoiceTerms: 'Payment is due within 14 days of the invoice date. Please contact accounts for any queries.',
    invoiceFooter: 'Thank you for your business!',
    serviceChargeType: '%' as const,
    serviceChargeValue: 10,
    serviceChargeMinimum: 0,
    bookingFeeType: 'fixed' as const,
    bookingFeeValue: 0.50,
    bookingFeeMinimum: 0.50,
    upliftType: 'none' as const,
    upliftValue: 0,
    vatRate: 20,
    vatAppliesTo: 'serviceCharge' as const,
};
