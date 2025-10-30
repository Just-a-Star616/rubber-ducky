import { Account, Customer } from '../types';

export const mockCustomerAttributesList: string[] = ['Requires wheelchair access', 'Has pet carrier', 'Nervous passenger', 'Frequent airport traveler'];

export const mockCustomers: Customer[] = [
    { 
        id: 'C001', name: 'Alice Johnson', phone: '07111222333', email: 'alice.j@example.com',
        notes: [{ date: new Date().toISOString(), author: 'System', text: 'First booking completed.' }],
        priorityLevel: 'VIP', isBanned: false, bannedDriverIds: [], accountCredit: 50.00,
        loyaltyPoints: 1250, totalSpend: 4500.75, joinDate: '2024-01-15T09:00:00Z',
        attributes: ['Frequent airport traveler'],
        addresses: [
            { id: 'ADDR1', fullAddress: '123 Main St, Manchester', notes: 'Main entrance is around the back.'},
            { id: 'ADDR2', fullAddress: 'Manchester Airport, Terminal 1'}
        ]
    },
    { 
        id: 'C002', name: 'Bob Williams', phone: '07444555666', email: 'bob.w@example.com',
        notes: [], priorityLevel: 'Normal', isBanned: false, bannedDriverIds: [], accountCredit: 0,
        loyaltyPoints: 300, totalSpend: 850.20, joinDate: '2024-05-20T14:00:00Z',
        attributes: ['Has pet carrier'],
        addresses: [{ id: 'ADDR3', fullAddress: '456 Oak Ave, Liverpool'}]
    }
];

export const mockAccounts: Account[] = [
    {
        id: 'A001', name: 'Innovate Corp', phone: '0161 999 8888', email: 'billing@innovate.com',
        notes: [], priorityLevel: 'High', isBanned: false, bannedDriverIds: [],
        outstandingBalance: 1250.50, totalSpend: 25000.00, joinDate: '2023-01-01',
        invoiceSchedule: 'Monthly', paymentTerms: 'Net 30', validationTypes: ['Purchase Order'],
        mainContactName: 'David Chen', mainContactEmail: 'david.c@innovate.com', mainContactPhone: '07123123123',
        billingAddress: 'Innovate Tower, 1 Tech Way, Manchester', vatNumber: 'GB123456789',
        allowedBookingAttributes: ['Executive Saloon'], siteId: 'SITE01',
        serviceChargeType: '%', serviceChargeValue: 10, vatRate: 20, vatAppliesTo: 'serviceChargeAndPrice', tags: ['Corporate', 'Tier 1']
    },
    {
        id: 'A002', name: 'Liverpool Events Co.', phone: '0151 555 4444', email: 'accounts@livevents.co.uk',
        notes: [{ date: new Date().toISOString(), author: 'Jane Doe', text: 'Requires MPVs for weekend events.' }], 
        priorityLevel: 'Normal', isBanned: false, bannedDriverIds: [],
        outstandingBalance: 350.00, totalSpend: 12000.00, joinDate: '2023-06-15',
        invoiceSchedule: 'Weekly', paymentTerms: 'Net 7', validationTypes: ['None'],
        mainContactName: 'Sarah Jones', mainContactEmail: 'sarah.j@livevents.co.uk', mainContactPhone: '07987987987',
        billingAddress: 'The Cunard Building, Liverpool',
        allowedBookingAttributes: ['MPV (6-seater)'], siteId: 'SITE02',
        serviceChargeType: 'none', vatRate: 0, tags: ['Events']
    }
];
