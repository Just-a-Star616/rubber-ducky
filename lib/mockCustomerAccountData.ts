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
    },
    {
        id: 'C003', name: 'Carol Bennett', phone: '07555666777', email: 'carol.b@example.com',
        notes: [{ date: new Date().toISOString(), author: 'System', text: 'Preferred driver: John Doe' }],
        priorityLevel: 'High', isBanned: false, bannedDriverIds: [], accountCredit: 25.50,
        loyaltyPoints: 750, totalSpend: 2200.00, joinDate: '2024-02-28T11:30:00Z',
        attributes: ['Nervous passenger', 'Requires wheelchair access'],
        addresses: [
            { id: 'ADDR4', fullAddress: '789 Queen Rd, Manchester'},
            { id: 'ADDR5', fullAddress: 'Manchester Royal Infirmary, Oxford Rd'}
        ]
    },
    {
        id: 'C004', name: 'David Lee', phone: '07666777888', email: 'david.lee@example.com',
        notes: [], priorityLevel: 'Normal', isBanned: false, bannedDriverIds: [], accountCredit: 100.00,
        loyaltyPoints: 500, totalSpend: 1500.50, joinDate: '2024-04-10T16:45:00Z',
        attributes: [],
        addresses: [{ id: 'ADDR6', fullAddress: '321 Park Lane, Salford'}]
    },
    {
        id: 'C005', name: 'Emma Watson', phone: '07777888999', email: 'emma.w@example.com',
        notes: [{ date: new Date().toISOString(), author: 'Ben Carter', text: 'Corporate account - frequent bookings' }],
        priorityLevel: 'VIP', isBanned: false, bannedDriverIds: [], accountCredit: 200.00,
        loyaltyPoints: 2100, totalSpend: 7850.00, joinDate: '2023-09-01T10:00:00Z',
        attributes: ['Frequent airport traveler'],
        addresses: [
            { id: 'ADDR7', fullAddress: 'Innovate Tower, 1 Tech Way, Manchester'},
            { id: 'ADDR8', fullAddress: 'Manchester Airport, Terminal 2'}
        ]
    },
    {
        id: 'C006', name: 'Frank Murphy', phone: '07888999000', email: 'frank.m@example.com',
        notes: [], priorityLevel: 'Normal', isBanned: false, bannedDriverIds: [], accountCredit: 0,
        loyaltyPoints: 200, totalSpend: 450.00, joinDate: '2024-08-15T13:20:00Z',
        attributes: ['Has pet carrier'],
        addresses: [{ id: 'ADDR9', fullAddress: '555 Church St, Liverpool'}]
    },
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
    },
    {
        id: 'A003', name: 'Manchester University', phone: '0161 275 7000', email: 'procurement@manchester.ac.uk',
        notes: [{ date: new Date().toISOString(), author: 'Alex Johnson', text: 'Educational institution - bulk bookings' }],
        priorityLevel: 'High', isBanned: false, bannedDriverIds: [],
        outstandingBalance: 5200.00, totalSpend: 42500.00, joinDate: '2022-09-01',
        invoiceSchedule: 'Monthly', paymentTerms: 'Net 30', validationTypes: ['Purchase Order'],
        mainContactName: 'Prof. Catherine Smith', mainContactEmail: 'c.smith@manchester.ac.uk', mainContactPhone: '0161 275 7005',
        billingAddress: 'Admin Building, Oxford Rd, Manchester', vatNumber: 'GB987654321',
        allowedBookingAttributes: ['Executive Saloon', 'Wheelchair Accessible'], siteId: 'SITE01',
        serviceChargeType: '%', serviceChargeValue: 5, vatRate: 0, tags: ['Education', 'Tier 1']
    },
    {
        id: 'A004', name: 'Salford Media Group', phone: '0161 888 7777', email: 'finance@salfordmedia.co.uk',
        notes: [], priorityLevel: 'Normal', isBanned: false, bannedDriverIds: [],
        outstandingBalance: 750.00, totalSpend: 8500.00, joinDate: '2024-01-15',
        invoiceSchedule: 'Weekly', paymentTerms: 'Net 14', validationTypes: ['Purchase Order'],
        mainContactName: 'James Mitchell', mainContactEmail: 'j.mitchell@salfordmedia.co.uk', mainContactPhone: '07456123456',
        billingAddress: 'MediaCityUK, Salford Quays',
        allowedBookingAttributes: [], siteId: 'SITE01',
        serviceChargeType: 'fixed', serviceChargeValue: 50, vatRate: 20, tags: ['Media', 'Regular']
    },
    {
        id: 'A005', name: 'Trafford Business Services', phone: '0161 666 5555', email: 'accounts@tfbservices.com',
        notes: [{ date: new Date().toISOString(), author: 'Chloe Davis', text: 'High volume corporate account' }],
        priorityLevel: 'High', isBanned: false, bannedDriverIds: [],
        outstandingBalance: 0, totalSpend: 65000.00, joinDate: '2022-03-01',
        invoiceSchedule: 'Weekly', paymentTerms: 'Net 7', validationTypes: ['Purchase Order'],
        mainContactName: 'Margaret Wilson', mainContactEmail: 'm.wilson@tfbservices.com', mainContactPhone: '0161 666 5560',
        billingAddress: '100 Corporate Way, Trafford Park',  vatNumber: 'GB555666777',
        allowedBookingAttributes: ['Executive Saloon', 'MPV (6-seater)'], siteId: 'SITE01',
        serviceChargeType: '%', serviceChargeValue: 8, vatRate: 20, vatAppliesTo: 'serviceChargeAndPrice', tags: ['Corporate', 'Tier 1', 'High Volume']
    },
];
