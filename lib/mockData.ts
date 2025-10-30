import {
    Invoice, Transaction, CommissionScheme, Booking, RewardScheme, Promotion, PartnerOffer,
    PromotionParticipant, FAQItem, Notification, ActivityEvent, Automation, AutomationTrigger,
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
];

export const mockWebhookDefinitions: WebhookDefinition[] = [
    { id: 'WH01', eventName: 'Booking Created', targetUrl: 'https://my-analytics.com/hooks/booking', status: 'Active', conditions: 'booking.price > 100' },
];

export const mockMessageEvents: AppMessageEvent[] = [
    { id: 'MEVT01', name: 'Booking Confirmation', description: 'Sent to customer when a booking is created.', availablePlaceholders: ['customer.name', 'booking.pickupDateTime', 'booking.pickupAddress'] },
    { id: 'MEVT02', name: 'Driver Assigned', description: 'Sent to customer when a driver is assigned.', availablePlaceholders: ['customer.name', 'driver.firstName', 'vehicle.registration', 'vehicle.make', 'vehicle.model'] },
];

export const mockMessageTemplates: MessageTemplate[] = [
    { id: 'TPL01', eventId: 'MEVT01', name: 'Standard Booking Confirmation (SMS)', target: 'Customer', content: 'Hi {{customer.name}}, your booking for {{booking.pickupDateTime}} from {{booking.pickupAddress}} is confirmed.' },
    { id: 'TPL02', eventId: 'MEVT02', name: 'Driver Assigned Notification (SMS)', target: 'Customer', content: 'Your driver, {{driver.firstName}}, is on their way in a {{vehicle.make}} {{vehicle.model}} ({{vehicle.registration}}).' },
    { id: 'TPL03', eventId: 'MEVT01', name: 'New Booking Alert (Staff Notice)', target: 'Staff', content: 'New booking {{booking.id}} created for {{customer.name}}.', isNotice: true },
];

export const mockAutomationTriggers: AutomationTrigger[] = [
    { id: 'TRG01', name: 'Booking Status Changed', description: 'Fires when a booking\'s status is updated.', availableVariables: {'booking': [], 'customer': [], 'driver': []} },
];
export const mockAutomationActions: AutomationAction[] = [
    { id: 'ACT01', name: 'Send Message Template', description: 'Sends a pre-defined message template.', parameters: [{id: 'templateId', name: 'Template', type: 'template'}] },
    { id: 'ACT02', name: 'Add Attribute to Booking', description: 'Adds a system attribute to the booking.', parameters: [{id: 'attributeId', name: 'Attribute', type: 'attribute'}] },
];
export const mockAutomations: Automation[] = [
    { id: 'AUTO01', name: 'Notify VIP Booking', description: 'Sends a message when a VIP customer makes a booking.', isActive: true, triggerId: 'TRG01', conditions: 'customer.priorityLevel === "VIP"', actions: [{actionId: 'ACT01', parameters: {templateId: 'TPL03'}}] }
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
