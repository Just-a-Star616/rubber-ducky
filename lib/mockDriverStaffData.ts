import { Driver, DriverApplication, Transaction, Vehicle, StaffMember, PermissionTemplate, PermissionNode, StaffNotice } from '../types';

// --- DRIVER DATA ---

export const mockDriverAttributes: string[] = ['Airport Specialist', 'Executive Saloon', 'MPV (6-seater)', 'Pet Friendly', 'Child Seat Available', 'Contactless Payment'];

export const mockDrivers: Driver[] = [
    {
        id: 'D-JEXAMPLE', vehicleRef: 'V001', avatarUrl: 'https://randomuser.me/api/portraits/lego/1.jpg',
        firstName: 'J', lastName: 'Example', devicePhone: '07000000001', mobileNumber: '07000000000',
        email: 'j@example.com', address: '1 Test St, Testville', niNumber: 'XX123456X',
        schemeCode: '1.00', gender: 'Other', badgeType: 'Private Hire', badgeIssuingCouncil: 'Manchester City Council',
        badgeNumber: 'PH00000', badgeExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        drivingLicenseNumber: 'EXAMP000000LE', drivingLicenseExpiry: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString(),
        schoolBadgeNumber: null, schoolBadgeExpiry: null,
        dateOfBirth: '1999-01-01', emergencyContactName: 'Test Contact', emergencyContactNumber: '07111222333',
        status: 'Active', lastStatementBalance: 100, commissionTotal: 1000, currentBalance: 200.00,
        canWithdrawCredit: true, earnedCreditSinceInvoice: 50.00, attributes: ['Test Driver'], siteId: 'SITE01',
        availability: { isOnline: true, shift: 'Day', lastSeen: new Date().toISOString() },
        performance: { completionRate: 100, averageRating: 5.0, totalJobs: 100, monthlyEarnings: 5000 },
        preferences: { maxJobDistance: 25, preferredAreas: ['M1'], acceptsLongDistance: true, acceptsAirportJobs: true },
        complianceStatus: { dueForTraining: false, documentExpiries: [] }
    },
    {
        id: 'D001', vehicleRef: 'V001', avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        firstName: 'John', lastName: 'Doe', devicePhone: '07123456789', mobileNumber: '07987654321',
        email: 'john.doe@example.com', address: '123 Main St, Manchester', niNumber: 'AB123456C',
        schemeCode: '1.23', gender: 'Male', badgeType: 'Private Hire', badgeIssuingCouncil: 'Manchester City Council',
        badgeNumber: 'PH12345', badgeExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        drivingLicenseNumber: 'DOE123456789AB', drivingLicenseExpiry: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString(),
        schoolBadgeNumber: 'SB987', schoolBadgeExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        dateOfBirth: '1985-05-20', emergencyContactName: 'Jane Doe', emergencyContactNumber: '07111222333',
        status: 'Active', lastStatementBalance: 150.75, commissionTotal: 1250.50, currentBalance: 250.00,
        canWithdrawCredit: true, earnedCreditSinceInvoice: 50.25, attributes: ['Airport Specialist', 'Executive Saloon'], siteId: 'SITE01',
        availability: { isOnline: true, shift: 'Day', lastSeen: new Date().toISOString() },
        performance: { completionRate: 98, averageRating: 4.9, totalJobs: 543, monthlyEarnings: 4500 },
        preferences: { maxJobDistance: 15, preferredAreas: ['M1', 'M2'], acceptsLongDistance: true, acceptsAirportJobs: true },
        complianceStatus: { dueForTraining: false, documentExpiries: [] }
    },
    {
        id: 'D002', vehicleRef: 'V002', avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
        firstName: 'Jane', lastName: 'Smith', devicePhone: '07234567890', mobileNumber: '07876543210',
        email: 'jane.smith@example.com', address: '456 Oak Ave, Liverpool', niNumber: 'CD234567E',
        schemeCode: '2.00', gender: 'Female', badgeType: 'Hackney Carriage', badgeIssuingCouncil: 'Liverpool City Council',
        badgeNumber: 'HC67890', badgeExpiry: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
        drivingLicenseNumber: 'SMITH987654321FG', drivingLicenseExpiry: new Date(Date.now() + 365 * 3 * 24 * 60 * 60 * 1000).toISOString(),
        schoolBadgeNumber: null, schoolBadgeExpiry: null,
        dateOfBirth: '1990-11-12', emergencyContactName: 'John Smith', emergencyContactNumber: '07333222111',
        status: 'Active', lastStatementBalance: -50.25, commissionTotal: 980.00, currentBalance: -25.00,
        canWithdrawCredit: false, earnedCreditSinceInvoice: 25.25, attributes: ['Pet Friendly'], siteId: 'SITE02',
        availability: { isOnline: false, shift: 'Night', lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        performance: { completionRate: 95, averageRating: 4.7, totalJobs: 412, monthlyEarnings: 3800 },
        preferences: { maxJobDistance: 10, preferredAreas: ['L1', 'L2'], acceptsLongDistance: false, acceptsAirportJobs: true },
        complianceStatus: { dueForTraining: false, documentExpiries: [] }
    },
     {
        id: 'D003', vehicleRef: 'V003', avatarUrl: 'https://randomuser.me/api/portraits/men/46.jpg',
        firstName: 'Peter', lastName: 'Jones', devicePhone: '07345678901', mobileNumber: '07765432109',
        email: 'peter.jones@example.com', address: '789 Pine Rd, Manchester', niNumber: 'EF345678G',
        schemeCode: '3.11', gender: 'Male', badgeType: 'Private Hire', badgeIssuingCouncil: 'Manchester City Council',
        badgeNumber: 'PH54321', badgeExpiry: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // Expired
        drivingLicenseNumber: 'JONES543210987HI', drivingLicenseExpiry: new Date(Date.now() + 365 * 1 * 24 * 60 * 60 * 1000).toISOString(),
        schoolBadgeNumber: null, schoolBadgeExpiry: null,
        dateOfBirth: '1988-08-30', emergencyContactName: 'Mary Jones', emergencyContactNumber: '07555444333',
        status: 'Inactive', lastStatementBalance: 0, commissionTotal: 2500.75, currentBalance: 0,
        canWithdrawCredit: false, earnedCreditSinceInvoice: 0, attributes: ['MPV (6-seater)'], siteId: 'SITE01',
        availability: { isOnline: false, shift: 'On-Demand', lastSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        performance: { completionRate: 99, averageRating: 4.95, totalJobs: 890, monthlyEarnings: 5200 },
        preferences: { maxJobDistance: 20, preferredAreas: ['M1', 'M17', 'SK9'], acceptsLongDistance: true, acceptsAirportJobs: true },
        complianceStatus: { dueForTraining: true, documentExpiries: [{ document: 'Badge', expiryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), daysUntilExpiry: -10 }] }
    },
];

export const mockDriverApplications: DriverApplication[] = [
    {
        id: 'APP-JEXAMPLE', applicationDate: '2025-01-01T12:00:00.000Z', firstName: 'J', lastName: 'Example',
        email: 'j@example.com', mobileNumber: '07000000000', area: 'Manchester', isLicensed: true,
        status: 'Approved', notes: [{ date: '2025-01-01T12:00:00.000Z', author: 'System', text: 'Test application.' }], siteId: 'SITE01',
        password: 'password123', badgeNumber: 'TEST12345', badgeIssuingCouncil: 'Manchester City Council',
        tasks: [],
        pendingChanges: {},
    },
    {
        id: 'APP-1678886400000', applicationDate: '2025-03-15T12:00:00.000Z', firstName: 'Emily', lastName: 'White',
        email: 'emily.w@example.com', mobileNumber: '07123123123', area: 'Manchester', isLicensed: true,
        status: 'Under Review', notes: [{ date: '2025-03-15T12:00:00.000Z', author: 'System', text: 'Application received.' }], siteId: 'SITE01',
        password: 'password123', badgeNumber: 'PH99887', badgeIssuingCouncil: 'Manchester City Council',
        tasks: [],
        pendingChanges: {},
        vehicleMake: 'Toyota',
        vehicleModel: 'Prius',
        vehicleRegistration: 'EM11 WHY',
        v5cDocumentUrl: '#',
        insuranceDocumentUrl: '#',
    },
    {
        id: 'APP-1678972800000', applicationDate: '2025-03-16T14:00:00.000Z', firstName: 'Michael', lastName: 'Green',
        email: 'michael.g@example.com', mobileNumber: '07456456456', area: 'Liverpool', isLicensed: false,
        status: 'Submitted', notes: [], siteId: 'SITE02',
        tasks: [],
        pendingChanges: {},
    }
];

export const mockDriverTransactions: Transaction[] = [
    { id: 'TR001', datetime: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 35.50 },
    { id: 'TR002', datetime: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), type: 'Cash', amount: 20.00 },
    { id: 'TR003', datetime: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), type: 'Account', amount: 45.00 },
    { id: 'TR004', datetime: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 15.75 },
    { id: 'TR005', datetime: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 65.00 },
    { id: 'TR006', datetime: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), type: 'Account', amount: 80.20 },
    { id: 'TR007', datetime: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(), type: 'Cash', amount: 12.00 },
];

// --- VEHICLE DATA ---

export const mockVehicleAttributes: string[] = ['Wheelchair Accessible', 'Pet Friendly', 'Executive Saloon', 'MPV (6-seater)', 'Airport Specialist', 'Contactless Payment', 'Child Seat Available'];

export const mockVehicles: Vehicle[] = [
    {
        id: 'V001', status: 'Active', registration: 'AB12 CDE', make: 'Mercedes-Benz', model: 'E-Class', color: 'Black',
        firstRegistrationDate: '2022-01-15', plateType: 'Private Hire', plateIssuingCouncil: 'Manchester City Council',
        plateNumber: 'P1234', plateExpiry: '2025-06-30T23:59:59Z', insuranceCertificateNumber: 'INS123',
        insuranceExpiry: '2025-05-31T23:59:59Z', motComplianceExpiry: '2025-01-14T23:59:59Z', roadTaxExpiry: '2025-07-31T23:59:59Z',
        attributes: ['Executive Saloon', 'Airport Specialist'], ownershipType: 'Company', linkedDriverIds: ['D001'], siteId: 'SITE01'
    },
    {
        id: 'V002', status: 'Active', registration: 'FG34 HJK', make: 'Ford', model: 'Galaxy', color: 'Silver',
        firstRegistrationDate: '2021-08-20', plateType: 'Hackney Carriage', plateIssuingCouncil: 'Liverpool City Council',
        plateNumber: 'H5678', plateExpiry: '2025-09-30T23:59:59Z', insuranceCertificateNumber: 'INS456',
        insuranceExpiry: '2025-08-31T23:59:59Z', motComplianceExpiry: '2025-08-19T23:59:59Z', roadTaxExpiry: '2025-09-30T23:59:59Z',
        attributes: ['MPV (6-seater)', 'Pet Friendly'], ownershipType: 'Private', linkedDriverIds: ['D002'], siteId: 'SITE02'
    },
    {
        id: 'V003', status: 'Inactive', registration: 'LM56 NOP', make: 'Skoda', model: 'Superb', color: 'Grey',
        firstRegistrationDate: '2020-03-10', plateType: 'Private Hire', plateIssuingCouncil: 'Manchester City Council',
        plateNumber: 'P9012', plateExpiry: '2025-04-30T23:59:59Z', insuranceCertificateNumber: 'INS789',
        insuranceExpiry: '2025-03-31T23:59:59Z', motComplianceExpiry: '2025-03-09T23:59:59Z', roadTaxExpiry: '2025-04-30T23:59:59Z',
        attributes: [], ownershipType: 'Company', linkedDriverIds: ['D003'], siteId: 'SITE01'
    }
];

// --- STAFF DATA ---

export const mockStaffList: StaffMember[] = [
    { id: 'SM01', name: 'Alex Johnson', email: 'alex.j@example.com', title: 'Area Manager', avatarUrl: 'https://randomuser.me/api/portraits/men/75.jpg', officeHours: [], templateId: 't-admin', source: 'Manual', status: 'Active' },
    { id: 'SM02', name: 'Ben Carter', email: 'ben.c@example.com', title: 'Dispatcher', avatarUrl: 'https://randomuser.me/api/portraits/men/76.jpg', officeHours: [], templateId: 't-dispatcher', source: 'Google Workspace', status: 'Active' },
    { id: 'SM03', name: 'Chloe Davis', email: 'chloe.d@example.com', title: 'Accounts', avatarUrl: 'https://randomuser.me/api/portraits/women/75.jpg', officeHours: [], templateId: 't-accounts', source: 'Manual', status: 'Active' },
];

export const mockPermissionStructure: PermissionNode[] = [
    { id: 'home', name: 'Home' },
    { id: 'operations', name: 'Operations', children: [
        { id: 'drivers', name: 'Drivers' },
        { id: 'vehicles', name: 'Vehicles' },
        { id: 'bookings', name: 'Bookings' },
        { id: 'accounts', name: 'Accounts' }
    ]},
    { id: 'finance', name: 'Finance' },
    { id: 'admin', name: 'Admin' },
];

export const mockPermissionTemplates: PermissionTemplate[] = [
    { id: 't-admin', name: 'Administrator', permissions: { home: 'edit', operations: 'edit', drivers: 'edit', vehicles: 'edit', bookings: 'edit', accounts: 'edit', finance: 'edit', admin: 'edit' } },
    { id: 't-dispatcher', name: 'Dispatcher', permissions: { home: 'view', operations: 'edit', drivers: 'view', vehicles: 'view', bookings: 'edit', accounts: 'view' } },
    { id: 't-accounts', name: 'Accounts', permissions: { home: 'view', finance: 'edit', accounts: 'edit' } },
    { id: 't-readonly', name: 'Read Only', permissions: { home: 'view', operations: 'view', drivers: 'view', vehicles: 'view', bookings: 'view', accounts: 'view', finance: 'view', admin: 'view' } },
    { id: 't-loginonly', name: 'Login Only', permissions: {} },
];

export const mockStaffNotices: StaffNotice[] = [
    { id: 'NTC01', title: 'System Maintenance', content: 'There will be scheduled maintenance this Sunday at 2 AM.', author: 'IT Department', date: new Date().toISOString(), isRead: false },
];

export const mockShortcutLinks = [
    { id: 'SL01', title: 'Company Handbook', description: 'View the latest version of the company handbook.', url: '#', isCopyable: false },
    { id: 'SL02', title: 'IT Support Portal', description: 'Log a ticket with the IT helpdesk.', url: '#', isCopyable: false },
    { id: 'SL03', title: 'Driver Referral Link', description: 'Share this link to refer new drivers.', url: 'https://example.com/refer?sid=SM01', isCopyable: true },
];