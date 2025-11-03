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

export interface IcabbiDriver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  badgeNumber: string;
  badgeExpiry: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  rating?: number;
  totalJobs?: number;
  accountBalance?: number;
  vehicleId?: string;
  attributes?: string[];
  customFields?: Record<string, any>;
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
  id: string;
  registration: string;
  make: string;
  model: string;
  year: number;
  seats: number;
  status: 'Active' | 'Inactive';
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
 */
export function transformIcabbiDriver(icabbiDriver: IcabbiDriver): Driver {
  return {
    id: icabbiDriver.id,
    firstName: icabbiDriver.firstName,
    lastName: icabbiDriver.lastName,
    email: icabbiDriver.email,
    mobileNumber: icabbiDriver.phone,
    devicePhone: icabbiDriver.phone,
    drivingLicenseNumber: icabbiDriver.licenseNumber,
    drivingLicenseExpiry: icabbiDriver.licenseExpiry,
    badgeNumber: icabbiDriver.badgeNumber,
    badgeExpiry: icabbiDriver.badgeExpiry,
    badgeIssuingCouncil: '', // Map from customFields if available
    badgeType: 'Private Hire',
    status: icabbiDriver.status === 'Active' ? 'Active' : 'Inactive',
    vehicleRef: icabbiDriver.vehicleId || '',
    avatarUrl: '',
    address: '',
    niNumber: '',
    schemeCode: '',
    gender: 'Other',
    dateOfBirth: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    lastStatementBalance: icabbiDriver.accountBalance || 0,
    currentBalance: icabbiDriver.accountBalance || 0,
    commissionTotal: 0,
    canWithdrawCredit: false,
    earnedCreditSinceInvoice: 0,
    attributes: icabbiDriver.attributes || [],
    siteId: '',
    schoolBadgeNumber: null,
    schoolBadgeExpiry: null,
    availability: {
      isOnline: icabbiDriver.status === 'Active',
      shift: 'On-Demand',
      lastSeen: new Date().toISOString(),
    },
    performance: {
      completionRate: 0.95,
      averageRating: icabbiDriver.rating || 4.5,
      totalJobs: icabbiDriver.totalJobs || 0,
      monthlyEarnings: 0,
    },
    preferences: {
      maxJobDistance: 50,
      preferredAreas: [],
      acceptsLongDistance: true,
      acceptsAirportJobs: true,
    },
    complianceStatus: {
      dueForTraining: false,
      documentExpiries: [
        {
          document: 'Driving License',
          expiryDate: icabbiDriver.licenseExpiry,
          daysUntilExpiry: Math.floor(
            (new Date(icabbiDriver.licenseExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          ),
        },
        {
          document: 'Badge',
          expiryDate: icabbiDriver.badgeExpiry,
          daysUntilExpiry: Math.floor(
            (new Date(icabbiDriver.badgeExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          ),
        },
      ],
    },
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

  async updateDriver(id: string, data: Partial<Driver>): Promise<Driver> {
    const response = await this.fetch<IcabbiApiResponse<IcabbiDriver>>(
      'PUT',
      `drivers/${id}`,
      data
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
    return {
      id: response.data.id,
      registration: response.data.registration,
      make: response.data.make,
      model: response.data.model,
      color: '',
      firstRegistrationDate: new Date().toISOString(),
      plateType: 'Private Hire',
      plateIssuingCouncil: '',
      plateNumber: '',
      plateExpiry: new Date().toISOString(),
      insuranceCertificateNumber: '',
      insuranceExpiry: new Date().toISOString(),
      motComplianceExpiry: new Date().toISOString(),
      roadTaxExpiry: new Date().toISOString(),
      status: response.data.status,
      attributes: [],
      ownershipType: 'Company',
      linkedDriverIds: [],
      siteId: '',
    };
  }

  async listVehicles(): Promise<Vehicle[]> {
    const response = await this.fetch<IcabbiApiResponse<IcabbiVehicle[]>>(
      'GET',
      'vehicles'
    );
    if (!response.data) return [];
    return response.data.map((v) => ({
      id: v.id,
      registration: v.registration,
      make: v.make,
      model: v.model,
      color: '',
      firstRegistrationDate: new Date().toISOString(),
      plateType: 'Private Hire',
      plateIssuingCouncil: '',
      plateNumber: '',
      plateExpiry: new Date().toISOString(),
      insuranceCertificateNumber: '',
      insuranceExpiry: new Date().toISOString(),
      motComplianceExpiry: new Date().toISOString(),
      roadTaxExpiry: new Date().toISOString(),
      status: v.status,
      attributes: [],
      ownershipType: 'Company',
      linkedDriverIds: [],
      siteId: '',
    }));
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

  async getInvoices(): Promise<Invoice[]> {
    return [];
  }

  async getTransactions(): Promise<FinancialTransaction[]> {
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
