/**
 * iCabbi Adapter Layer
 * Transforms iCabbi API responses into app-compatible types
 * Supports both mock (development) and real (production) modes
 */

import {
  Driver,
  Booking,
  Vehicle,
  Customer,
  Invoice,
  FinancialTransaction,
} from '../types';

// ==================== ICABBI DATA TYPES ====================
// Based on real iCabbi API responses - see docs/REAL_ICABBI_FIELD_MAPPING.md

export interface IcabbiDriver {
  // Immutable System Fields
  id: number;                          // System ID (1, 2, 3...)
  ix: string;                          // UUID (e.g., "11EA062AC2A96677B30A0A5A23E1E9BE")
  ref: string;                         // Call sign (e.g., "AV999") - immutable, what users see

  // Status Fields (STRING, not boolean!)
  active: "0" | "1";                   // "1" = Active, "0" = Inactive
  deleted: "0" | "1";                  // "1" = Deleted, "0" = Not deleted

  // Personal Information
  name: string;                        // Full name (computed from first+last)
  first_name: string;
  last_name: string;
  a_k_a: string;                       // Alias/nickname

  // Contact Information
  mobile: string;                      // E.164 format (e.g., "00441143503195")
  phone: string;                       // Primary phone
  phone_1: string;                     // Secondary phone
  email: string;                       // May be empty string
  address: string;                     // Full address as single string

  // Badge/License Information
  psv: string;                         // Badge/PSV number
  psv_expiry: string;                  // ISO 8601 datetime
  badge_type: string;                  // "PRIVATE HIRE", "HACKNEY", etc.
  licence: string;                     // Driving license number (may be "NOT KNOWN")
  licence_expiry: string;              // ISO 8601 datetime
  school_badge_expiry: string | null;  // ISO 8601 datetime or null

  // Financial
  invoice_commission: number;          // Commission rate (e.g., 1.54)
  frequency: string;                   // "WEEKLY", "MONTHLY", etc.
  last_payment_date: string | null;    // ISO 8601 datetime or null

  // Additional Information
  photo: string;                       // S3 URL or default image
  ni_number: string;                   // May be "N/A"
  start_date: string;                  // Unix timestamp as string

  // Location (may be null if offline)
  lat: number | null;
  lng: number | null;
  lat_lng_last_updated: string | null; // ISO 8601 datetime or null

  // Vehicle (nested object)
  vehicle: IcabbiVehicle | null;

  // System Fields (not typically used)
  imei: string;                        // Device IMEI
  si_id: string;                       // System integration ID
  is_transporter: boolean;             // iCabbi-specific flag
  password?: string;                   // DO NOT sync - security risk
  exclusions?: Record<string, any>;    // iCabbi workflow settings
}

export interface IcabbiBooking {
  id: string;
  customerId: string;
  driverId?: string;
  pickupTime: string;
  pickupAddress: string;
  dropoffAddress: string;
  price: number;
  cost?: number;
  status: string;
  paymentMethod?: string;
  distance?: number;
  duration?: number;
  attributes?: string[];
  customFields?: Record<string, any>;
}

export interface IcabbiVehicle {
  // Immutable System Fields
  id: string;                          // Vehicle ID as string
  ix: string;                          // UUID
  ref: string;                         // Vehicle call sign (e.g., "9999")

  // Status
  active: boolean;                     // BOOLEAN for vehicles (unlike drivers!)
  a_k_a: string;                       // Vehicle alias/nickname

  // Basic Information
  year: number;                        // Manufacturing year
  reg: string;                         // UK registration (e.g., "GSW 7")
  make: string;                        // e.g., "Mercedes", "VOLKSWAGEN"
  model: string;                       // e.g., "S-Class AMG", "TOURAN"
  colour: string;                      // e.g., "BLACK", "SILVER"

  // License & Compliance
  plate: string;                       // Plate number
  plate_expiry: string;                // ISO 8601 datetime
  hire_expiry: string;                 // Private hire license expiry
  council_compliance_expiry: string;   // Council compliance certificate

  // Insurance
  insurer: string;                     // Insurance company name
  insurance: string;                   // Policy/certificate number
  insurance_expiry: string;            // ISO 8601 datetime

  // MOT & Tax
  nct: string;                         // MOT certificate number
  nct_expiry: string;                  // MOT expiry
  road_tax_expiry: string;             // Road tax expiry

  // Additional Information
  vehicle_phone: string;               // Phone number in vehicle
  co2_emission: string;                // CO2 emission value

  // Site Assignment
  sites: number[];                     // Array of site IDs
  primary_site_id: number;             // Primary site assignment

  // Owner (usually empty/null)
  vehicle_owner: Record<string, any> | null;
}

export interface IcabbiCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  accountType: 'Individual' | 'Corporate';
}

export interface IcabbiApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
  };
}

// ==================== CONNECTOR INTERFACE ====================

export interface IcabbiConnector {
  // Drivers
  getDriver(id: string): Promise<Driver>;
  listDrivers(filter?: DriverFilter): Promise<Driver[]>;
  updateDriver(id: string, data: Partial<Driver>): Promise<Driver>;

  // Bookings
  getBooking(id: string): Promise<Booking>;
  listBookings(filter?: BookingFilter): Promise<Booking[]>;
  createBooking(data: Partial<Booking>): Promise<Booking>;
  updateBooking(id: string, data: Partial<Booking>): Promise<Booking>;

  // Vehicles
  getVehicle(id: string): Promise<Vehicle>;
  listVehicles(): Promise<Vehicle[]>;

  // Customers
  getCustomer(id: string): Promise<Customer>;
  listCustomers(): Promise<Customer[]>;

  // Financial
  getInvoices(driverId: string): Promise<Invoice[]>;
  getTransactions(driverId: string): Promise<FinancialTransaction[]>;

  // Health check
  healthCheck(): Promise<boolean>;
}

export interface DriverFilter {
  status?: 'Active' | 'Inactive' | 'Archived';
  siteId?: string;
  searchText?: string;
  limit?: number;
  offset?: number;
}

export interface BookingFilter {
  status?: string;
  driverId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// ==================== TRANSFORMATION FUNCTIONS ====================

/**
 * Transform iCabbi Driver to App Driver
 * Maps real iCabbi API structure to our application model
 * See docs/REAL_ICABBI_FIELD_MAPPING.md for complete field mapping
 */
export function transformIcabbiDriver(icabbiDriver: IcabbiDriver): Driver {
  // Convert iCabbi string status to our enum
  const status: 'Active' | 'Inactive' | 'Archived' =
    icabbiDriver.deleted === "1" ? 'Archived' :
    icabbiDriver.active === "1" ? 'Active' : 'Inactive';

  // Calculate document expiries
  const calculateDaysUntilExpiry = (expiryDate: string | null): number => {
    if (!expiryDate) return -1;
    try {
      return Math.floor((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    } catch {
      return -1;
    }
  };

  const documentExpiries = [
    {
      document: 'Driving License',
      expiryDate: icabbiDriver.licence_expiry,
      daysUntilExpiry: calculateDaysUntilExpiry(icabbiDriver.licence_expiry),
    },
    {
      document: 'Badge',
      expiryDate: icabbiDriver.psv_expiry,
      daysUntilExpiry: calculateDaysUntilExpiry(icabbiDriver.psv_expiry),
    },
  ];

  // Add school badge if present
  if (icabbiDriver.school_badge_expiry) {
    documentExpiries.push({
      document: 'School Badge',
      expiryDate: icabbiDriver.school_badge_expiry,
      daysUntilExpiry: calculateDaysUntilExpiry(icabbiDriver.school_badge_expiry),
    });
  }

  return {
    // IMPORTANT: Use driver ref (call sign) as display ID, not integer id
    id: icabbiDriver.ref,                    // "AV999" - what users see

    // Personal Information
    firstName: icabbiDriver.first_name,
    lastName: icabbiDriver.last_name,
    email: icabbiDriver.email || '',

    // Contact Information
    mobileNumber: icabbiDriver.mobile,
    devicePhone: icabbiDriver.phone,
    address: icabbiDriver.address,

  // License & Badge
  drivingLicenseNumber: icabbiDriver.licence === "NOT KNOWN" ? '' : icabbiDriver.licence,
  drivingLicenseExpiry: icabbiDriver.licence_expiry,
  badgeNumber: icabbiDriver.psv,
  badgeExpiry: icabbiDriver.psv_expiry,
  // Normalize badge type to our union type
  badgeType: (icabbiDriver.badge_type === 'Hackney Carriage' ? 'Hackney Carriage' : 'Private Hire'),
    badgeIssuingCouncil: '', // Not provided by iCabbi

    // School Badge (optional)
    schoolBadgeNumber: icabbiDriver.psv, // Usually same as main badge
    schoolBadgeExpiry: icabbiDriver.school_badge_expiry,

    // National Insurance
    niNumber: icabbiDriver.ni_number === "N/A" ? '' : icabbiDriver.ni_number,

    // Status
    status,

    // Vehicle - Extract from nested object
    vehicleRef: icabbiDriver.vehicle?.ref || icabbiDriver.vehicle?.reg || '',

    // Profile
    avatarUrl: icabbiDriver.photo || '',

    // Fields not in iCabbi - must be stored in local extensions
    schemeCode: '',                          // Our commission system
    gender: 'Other',                         // Not in iCabbi
    dateOfBirth: '',                         // Not in iCabbi
    emergencyContactName: '',                // Not in iCabbi
    emergencyContactNumber: '',              // Not in iCabbi
    lastStatementBalance: 0,                 // Calculated by us
    currentBalance: 0,                       // Calculated by us
    commissionTotal: 0,                      // Calculated by us
    canWithdrawCredit: false,                // Our business rule
    earnedCreditSinceInvoice: 0,             // Calculated by us
    attributes: [],                          // Our tagging system
    siteId: '',                              // Could map from vehicle.primary_site_id

    // Availability - computed from location data
    availability: {
      isOnline: icabbiDriver.active === "1" && icabbiDriver.lat !== null && icabbiDriver.lng !== null,
      shift: 'On-Demand',
      lastSeen: icabbiDriver.lat_lng_last_updated || new Date().toISOString(),
    },

    // Performance - not provided by iCabbi, must be calculated
    performance: {
      completionRate: 0.95,                  // Calculate from booking history
      averageRating: 4.5,                    // Calculate from booking ratings
      totalJobs: 0,                          // Calculate from booking count
      monthlyEarnings: 0,                    // Calculate from financial data
    },

    // Preferences - stored in local extensions
    preferences: {
      maxJobDistance: 50,
      preferredAreas: [],
      acceptsLongDistance: true,
      acceptsAirportJobs: true,
    },

    // Compliance Status - computed from document expiries
    complianceStatus: {
      dueForTraining: false,                 // Our business rule
      documentExpiries,
    },

    // Bank Accounts - our payment system
    bankAccounts: [],
  };
}

/**
 * Transform App Driver back to iCabbi format (for updates)
 * Note: Only updates editable fields - immutable fields (id, ix, ref) are excluded
 */
export function transformDriverToIcabbi(driver: Driver): Partial<IcabbiDriver> {
  return {
    // Personal Information (editable)
    first_name: driver.firstName,
    last_name: driver.lastName,
    email: driver.email,

    // Contact Information (editable)
    mobile: driver.mobileNumber,
    phone: driver.devicePhone,
    address: driver.address,

    // License & Badge (editable)
    licence: driver.drivingLicenseNumber || "NOT KNOWN",
    licence_expiry: driver.drivingLicenseExpiry,
    psv: driver.badgeNumber,
    psv_expiry: driver.badgeExpiry,
    badge_type: driver.badgeType,
    school_badge_expiry: driver.schoolBadgeExpiry,

    // National Insurance (editable)
    ni_number: driver.niNumber || "N/A",

    // Status (editable)
    active: driver.status === 'Active' ? "1" : "0",
    deleted: driver.status === 'Archived' ? "1" : "0",

    // Photo (editable)
    photo: driver.avatarUrl,

    // NOTE: Do not include immutable fields (id, ix, ref)
    // NOTE: Do not include local-only fields (schemeCode, gender, dateOfBirth, etc.)
  };
}

/**
 * Transform iCabbi Vehicle to App Vehicle
 */
export function transformIcabbiVehicle(icabbiVehicle: IcabbiVehicle): Vehicle {
  return {
    id: icabbiVehicle.ref || icabbiVehicle.id,   // Use ref as ID for consistency
    registration: icabbiVehicle.reg,
    make: icabbiVehicle.make,
    model: icabbiVehicle.model,
    color: icabbiVehicle.colour,
    firstRegistrationDate: icabbiVehicle.year ? `${icabbiVehicle.year}-01-01` : '',
    plateType: 'Private Hire',
    plateIssuingCouncil: '',                      // Not in iCabbi
    plateNumber: icabbiVehicle.plate,
    plateExpiry: icabbiVehicle.plate_expiry,
    insuranceCertificateNumber: icabbiVehicle.insurance,
    insuranceExpiry: icabbiVehicle.insurance_expiry,
    motComplianceExpiry: icabbiVehicle.nct_expiry,
    roadTaxExpiry: icabbiVehicle.road_tax_expiry,
    status: icabbiVehicle.active ? 'Active' : 'Inactive',
    attributes: [],
    ownershipType: 'Company',                     // Default, not in iCabbi
    linkedDriverIds: [],                          // Must be computed from driver data
    siteId: icabbiVehicle.primary_site_id?.toString() || '',
  };
}

/**
 * Transform iCabbi Booking to App Booking
 */
export function transformIcabbiBooking(icabbiBooking: IcabbiBooking): Booking {
  return {
    id: icabbiBooking.id,
    customerId: icabbiBooking.customerId,
    driverId: icabbiBooking.driverId || '',
    vehicleId: '',
    pickupDateTime: icabbiBooking.pickupTime,
    pickupAddress: icabbiBooking.pickupAddress,
    destinationAddress: icabbiBooking.dropoffAddress,
    customerName: '',
    customerPhone: '',
    cost: icabbiBooking.cost || 0,
    price: icabbiBooking.price,
    status: icabbiBooking.status as any,
    siteId: '',
    attributes: icabbiBooking.attributes || [],
    estimatedDuration: icabbiBooking.duration || 0,
    routeDistance: icabbiBooking.distance || 0,
    paymentStatus: 'Paid',
    paymentMethod: (icabbiBooking.paymentMethod || 'Card') as any,
    vias: [],
    pickupCoordinates: { lat: 0, lng: 0 },
    destinationCoordinates: { lat: 0, lng: 0 },
  };
}

// ==================== REAL ICABBI CONNECTOR ====================

export class RealIcabbiConnector implements IcabbiConnector {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number = 10000;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
  }

  private async fetch<T>(method: string, endpoint: string, body?: any): Promise<T> {
    const url = `${this.baseUrl}/api/${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'X-Request-ID': `${Date.now()}-${Math.random()}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`iCabbi API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error(`[iCabbi] Error calling ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get driver by ID or ref
   * @param id - Can be either numeric ID or driver ref (call sign like "AV999")
   */
  async getDriver(id: string): Promise<Driver> {
    const response = await this.fetch<IcabbiApiResponse<IcabbiDriver>>(
      'GET',
      `drivers/${id}`
    );
    if (!response.data) throw new Error('Driver not found');
    return transformIcabbiDriver(response.data);
  }

  async listDrivers(filter?: DriverFilter): Promise<Driver[]> {
    const params = new URLSearchParams();
    if (filter?.status) params.append('status', filter.status);
    if (filter?.searchText) params.append('search', filter.searchText);
    if (filter?.limit) params.append('limit', filter.limit.toString());
    if (filter?.offset) params.append('offset', filter.offset.toString());

    const response = await this.fetch<IcabbiApiResponse<IcabbiDriver[]>>(
      'GET',
      `drivers?${params.toString()}`
    );
    if (!response.data) return [];
    return response.data.map(transformIcabbiDriver);
  }

  /**
   * Update driver in iCabbi
   * Note: Automatically converts app format to iCabbi format
   * @param id - Driver ref (call sign like "AV999")
   * @param data - Partial driver data in app format
   */
  async updateDriver(id: string, data: Partial<Driver>): Promise<Driver> {
    // Convert app format to iCabbi format for update
    const icabbiData = transformDriverToIcabbi(data as Driver);

    const response = await this.fetch<IcabbiApiResponse<IcabbiDriver>>(
      'PUT',
      `drivers/${id}`,
      icabbiData
    );
    if (!response.data) throw new Error('Failed to update driver');
    return transformIcabbiDriver(response.data);
  }

  async getBooking(id: string): Promise<Booking> {
    const response = await this.fetch<IcabbiApiResponse<IcabbiBooking>>(
      'GET',
      `bookings/${id}`
    );
    if (!response.data) throw new Error('Booking not found');
    return transformIcabbiBooking(response.data);
  }

  async listBookings(filter?: BookingFilter): Promise<Booking[]> {
    const params = new URLSearchParams();
    if (filter?.status) params.append('status', filter.status);
    if (filter?.driverId) params.append('driverId', filter.driverId);
    if (filter?.customerId) params.append('customerId', filter.customerId);
    if (filter?.startDate) params.append('startDate', filter.startDate);
    if (filter?.endDate) params.append('endDate', filter.endDate);
    if (filter?.limit) params.append('limit', filter.limit.toString());
    if (filter?.offset) params.append('offset', filter.offset.toString());

    const response = await this.fetch<IcabbiApiResponse<IcabbiBooking[]>>(
      'GET',
      `bookings?${params.toString()}`
    );
    if (!response.data) return [];
    return response.data.map(transformIcabbiBooking);
  }

  async createBooking(data: Partial<Booking>): Promise<Booking> {
    const response = await this.fetch<IcabbiApiResponse<IcabbiBooking>>(
      'POST',
      'bookings',
      data
    );
    if (!response.data) throw new Error('Failed to create booking');
    return transformIcabbiBooking(response.data);
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
    const response = await this.fetch<IcabbiApiResponse<IcabbiBooking>>(
      'PUT',
      `bookings/${id}`,
      data
    );
    if (!response.data) throw new Error('Failed to update booking');
    return transformIcabbiBooking(response.data);
  }

  async getVehicle(id: string): Promise<Vehicle> {
    const response = await this.fetch<IcabbiApiResponse<IcabbiVehicle>>(
      'GET',
      `vehicles/${id}`
    );
    if (!response.data) throw new Error('Vehicle not found');
    return transformIcabbiVehicle(response.data);
  }

  async listVehicles(): Promise<Vehicle[]> {
    const response = await this.fetch<IcabbiApiResponse<IcabbiVehicle[]>>(
      'GET',
      'vehicles'
    );
    if (!response.data) return [];
    return response.data.map(transformIcabbiVehicle);
  }

  async getCustomer(id: string): Promise<Customer> {
    const response = await this.fetch<IcabbiApiResponse<IcabbiCustomer>>(
      'GET',
      `customers/${id}`
    );
    if (!response.data) throw new Error('Customer not found');
    return {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email || '',
      phone: response.data.phone || '',
      notes: [],
      priorityLevel: 'Normal',
      isBanned: false,
      bannedDriverIds: [],
      accountCredit: 0,
      loyaltyPoints: 0,
      totalSpend: 0,
      joinDate: new Date().toISOString(),
      attributes: [],
      addresses: response.data.address
        ? [{ id: '1', fullAddress: response.data.address }]
        : [],
    };
  }

  async listCustomers(): Promise<Customer[]> {
    const response = await this.fetch<IcabbiApiResponse<IcabbiCustomer[]>>(
      'GET',
      'customers'
    );
    if (!response.data) return [];
    return response.data.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email || '',
      phone: c.phone || '',
      notes: [],
      priorityLevel: 'Normal',
      isBanned: false,
      bannedDriverIds: [],
      accountCredit: 0,
      loyaltyPoints: 0,
      totalSpend: 0,
      joinDate: new Date().toISOString(),
      attributes: [],
      addresses: c.address
        ? [{ id: '1', fullAddress: c.address }]
        : [],
    }));
  }

  async getInvoices(driverId: string): Promise<Invoice[]> {
    const response = await this.fetch<IcabbiApiResponse<any[]>>(
      'GET',
      `drivers/${driverId}/invoices`
    );
    if (!response.data) return [];
    return response.data.map((inv) => ({
      id: inv.id,
      weekEnding: inv.weekEnding,
      grossEarnings: inv.grossEarnings,
      commission: inv.commission,
      netEarnings: inv.netEarnings,
      statementUrl: inv.statementUrl || '#',
      items: inv.items || [],
    }));
  }

  async getTransactions(driverId: string): Promise<FinancialTransaction[]> {
    const response = await this.fetch<IcabbiApiResponse<any[]>>(
      'GET',
      `drivers/${driverId}/transactions`
    );
    if (!response.data) return [];
    return response.data.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      currency: 'GBP',
      description: tx.description,
      driverId: driverId,
      timestamp: tx.timestamp,
      status: tx.status,
      taxable: tx.taxable,
      vatRate: tx.vatRate,
      bookingId: tx.bookingId,
    }));
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.fetch<{ status: string }>(
        'GET',
        'health'
      );
      return response.status === 'ok';
    } catch {
      return false;
    }
  }
}

// ==================== MOCK ICABBI CONNECTOR ====================

export class MockIcabbiConnector implements IcabbiConnector {
  // Import mock data
  private drivers: Map<string, Driver> = new Map();
  private bookings: Map<string, Booking> = new Map();

  constructor(mockData?: { drivers?: Driver[]; bookings?: Booking[] }) {
    if (mockData?.drivers) {
      mockData.drivers.forEach((d) => this.drivers.set(d.id, d));
    }
    if (mockData?.bookings) {
      mockData.bookings.forEach((b) => this.bookings.set(b.id, b));
    }
  }

  async getDriver(id: string): Promise<Driver> {
    const driver = this.drivers.get(id);
    if (!driver) throw new Error(`Driver ${id} not found`);
    return driver;
  }

  async listDrivers(filter?: DriverFilter): Promise<Driver[]> {
    let results = Array.from(this.drivers.values());

    if (filter?.status) {
      results = results.filter((d) => d.status === filter.status);
    }
    if (filter?.searchText) {
      const text = filter.searchText.toLowerCase();
      results = results.filter(
        (d) =>
          d.firstName.toLowerCase().includes(text) ||
          d.lastName.toLowerCase().includes(text) ||
          d.email.toLowerCase().includes(text)
      );
    }

    return results.slice(
      filter?.offset || 0,
      (filter?.offset || 0) + (filter?.limit || 50)
    );
  }

  async updateDriver(id: string, data: Partial<Driver>): Promise<Driver> {
    const driver = this.drivers.get(id);
    if (!driver) throw new Error(`Driver ${id} not found`);
    const updated = { ...driver, ...data };
    this.drivers.set(id, updated);
    return updated;
  }

  async getBooking(id: string): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) throw new Error(`Booking ${id} not found`);
    return booking;
  }

  async listBookings(filter?: BookingFilter): Promise<Booking[]> {
    let results = Array.from(this.bookings.values());

    if (filter?.driverId) {
      results = results.filter((b) => b.driverId === filter.driverId);
    }
    if (filter?.customerId) {
      results = results.filter((b) => b.customerId === filter.customerId);
    }
    if (filter?.status) {
      results = results.filter((b) => b.status === filter.status);
    }

    return results.slice(
      filter?.offset || 0,
      (filter?.offset || 0) + (filter?.limit || 50)
    );
  }

  async createBooking(data: Partial<Booking>): Promise<Booking> {
    const booking = { ...data, id: `B${Date.now()}` } as Booking;
    this.bookings.set(booking.id, booking);
    return booking;
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) throw new Error(`Booking ${id} not found`);
    const updated = { ...booking, ...data };
    this.bookings.set(id, updated);
    return updated;
  }

  async getVehicle(): Promise<any> {
    throw new Error('Not implemented in mock');
  }

  async listVehicles(): Promise<any[]> {
    return [];
  }

  async getCustomer(): Promise<any> {
    throw new Error('Not implemented in mock');
  }

  async listCustomers(): Promise<any[]> {
    return [];
  }

  async getInvoices(driverId: string): Promise<Invoice[]> {
    // Mock returns invoices from in-memory bookings/invoices if available
    // For now return empty list to satisfy interface during tests
    return [];
  }

  async getTransactions(driverId: string): Promise<FinancialTransaction[]> {
    // Mock returns transactions for a driver; not implemented yet
    return [];
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

// ==================== FACTORY & INITIALIZATION ====================

export function createIcabbiConnector(
  mode: 'mock' | 'production',
  config?: { baseUrl?: string; apiKey?: string; mockData?: any }
): IcabbiConnector {
  if (mode === 'mock') {
    return new MockIcabbiConnector(config?.mockData);
  }

  if (!config?.baseUrl || !config?.apiKey) {
    throw new Error('baseUrl and apiKey required for production mode');
  }

  return new RealIcabbiConnector(config.baseUrl, config.apiKey);
}

export function getIcabbiConnectorFromEnv(): IcabbiConnector {
  const mode = (import.meta as any).env?.VITE_ICABBI_MODE || 'mock';
  const baseUrl = (import.meta as any).env?.VITE_ICABBI_BASE_URL;
  const apiKey = (import.meta as any).env?.VITE_ICABBI_API_KEY;

  return createIcabbiConnector(mode as 'mock' | 'production', {
    baseUrl,
    apiKey,
  });
}
