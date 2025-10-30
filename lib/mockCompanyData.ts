import { CompanyDetails, SiteDetails, OfficeHours } from '../types';

export const mockLicensingCouncils: string[] = [
    'Transport for London',
    'Manchester City Council',
    'Birmingham City Council',
    'Leeds City Council',
    'Glasgow City Council',
    'Liverpool City Council',
];

export const mockCompanyDetails: CompanyDetails = {
    name: "Project Rubber Ducky Ltd.",
    logoUrl: "data:image/svg+xml,%3csvg viewBox='150 80 350 220' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='M481.44,148.22C384.08,82.4,192.28,131,164.24,293.26c83.56-116.32,234.3-131,234.3-131S476.48,153.18,481.44,148.22Z'/%3e%3c/svg%3e",
    address: "123 Innovation Drive\nTech City, TC 54321",
    registrationNumber: "12345678",
    vatNumber: "GB123456789",
};

const manchesterOfficeHours: OfficeHours[] = [
    { day: 'Monday', isOff: false, start: '09:00', end: '17:00', location: 'Manchester Office' },
    { day: 'Tuesday', isOff: false, start: '09:00', end: '17:00', location: 'Manchester Office' },
    { day: 'Wednesday', isOff: false, start: '09:00', end: '17:00', location: 'Manchester Office' },
    { day: 'Thursday', isOff: false, start: '09:00', end: '17:00', location: 'Manchester Office' },
    { day: 'Friday', isOff: false, start: '09:00', end: '17:00', location: 'Manchester Office' },
    { day: 'Saturday', isOff: true, start: '00:00', end: '00:00' },
    { day: 'Sunday', isOff: true, start: '00:00', end: '00:00' },
];

const liverpoolOfficeHours: OfficeHours[] = [
    { day: 'Monday', isOff: false, start: '08:30', end: '16:30', location: 'Liverpool Office' },
    { day: 'Tuesday', isOff: false, start: '08:30', end: '16:30', location: 'Liverpool Office' },
    { day: 'Wednesday', isOff: false, start: '08:30', end: '16:30', location: 'Liverpool Office' },
    { day: 'Thursday', isOff: false, start: '08:30', end: '16:30', location: 'Liverpool Office' },
    { day: 'Friday', isOff: false, start: '08:30', end: '16:30', location: 'Liverpool Office' },
    { day: 'Saturday', isOff: true, start: '00:00', end: '00:00' },
    { day: 'Sunday', isOff: true, start: '00:00', end: '00:00' },
];

export const mockSiteDetails: SiteDetails[] = [
    {
        id: 'SITE01',
        name: "Manchester (North)",
        address: "Unit 5, Business Park, Manchester, M4 1AN",
        bookingTel: "0161 123 4567",
        officeEmail: "manchester.north@example.com",
        areaManagerName: "Alex Johnson",
        areaManagerEmail: "alex.j@example.com",
        officeHours: manchesterOfficeHours,
    },
    {
        id: 'SITE02',
        name: "Liverpool",
        address: "1 Dock Road, Liverpool, L3 1DL",
        bookingTel: "0151 987 6543",
        // FIX: Added missing properties to conform to the SiteDetails interface.
        officeEmail: "liverpool@example.com",
        areaManagerName: "Jane Doe",
        areaManagerEmail: "jane.d@example.com",
        officeHours: liverpoolOfficeHours,
    },
];