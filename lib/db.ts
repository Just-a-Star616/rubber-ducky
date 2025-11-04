/**
 * IndexedDB Database Layer
 * Provides persistent storage for:
 * 1. Business logic data (commission schemes, invoices, staff, etc.)
 * 2. Demo mode mock data (editable drivers, bookings, etc.)
 * 3. Extensions to iCabbi entities (custom attributes, preferences, etc.)
 */

import {
  Driver,
  Booking,
  Vehicle,
  Customer,
  CommissionScheme,
  Invoice,
  DriverApplication,
  StaffMember,
  PermissionTemplate,
  SiteDetails,
  Promotion,
  CustomerPromotion,
  LogEntry,
  SystemAttribute,
  Automation,
  WebhookDefinition,
  MessageTemplate,
  Account,
  HistoricInvoice,
  Transaction,
  RewardScheme,
  PartnerOffer,
  Notification,
  ActivityEvent,
} from '../types';

// ==================== DATABASE CONFIGURATION ====================

const DB_NAME = 'RubberDuckyDB';
const DB_VERSION = 1;

// Collection names
export const COLLECTIONS = {
  // Business Logic (Always stored locally)
  COMMISSION_SCHEMES: 'commissionSchemes',
  INVOICES: 'invoices',
  HISTORIC_INVOICES: 'historicInvoices',
  DRIVER_APPLICATIONS: 'driverApplications',
  STAFF_MEMBERS: 'staffMembers',
  PERMISSION_TEMPLATES: 'permissionTemplates',
  SITES: 'sites',
  PROMOTIONS: 'promotions',
  CUSTOMER_PROMOTIONS: 'customerPromotions',
  AUDIT_LOGS: 'auditLogs',
  SYSTEM_ATTRIBUTES: 'systemAttributes',
  AUTOMATIONS: 'automations',
  WEBHOOKS: 'webhooks',
  MESSAGE_TEMPLATES: 'messageTemplates',
  REWARD_SCHEMES: 'rewardSchemes',
  PARTNER_OFFERS: 'partnerOffers',
  NOTIFICATIONS: 'notifications',
  ACTIVITY_FEED: 'activityFeed',

  // Demo/Mock Data (Only used in demo mode)
  MOCK_DRIVERS: 'mockDrivers',
  MOCK_BOOKINGS: 'mockBookings',
  MOCK_VEHICLES: 'mockVehicles',
  MOCK_CUSTOMERS: 'mockCustomers',
  MOCK_ACCOUNTS: 'mockAccounts',
  MOCK_TRANSACTIONS: 'mockTransactions',

  // Extensions (Linked to iCabbi entities by ID)
  DRIVER_EXTENSIONS: 'driverExtensions',
  BOOKING_EXTENSIONS: 'bookingExtensions',
  VEHICLE_EXTENSIONS: 'vehicleExtensions',
  CUSTOMER_EXTENSIONS: 'customerExtensions',
} as const;

// ==================== EXTENSION TYPES ====================
// Note: Full implementation in lib/driverExtensions.ts
// This is kept for backwards compatibility

export interface DriverExtension {
  driverId: string;
  icabbiNumericId?: number;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  schemeCode: string;
  commissionRate?: number;
  currentBalance: number;
  lastStatementBalance: number;
  commissionTotal: number;
  earnedCreditSinceInvoice: number;
  canWithdrawCredit: boolean;
  bankAccounts: any[];
  attributes: string[];
  preferences: {
    maxJobDistance: number;
    preferredAreas: string[];
    acceptsLongDistance: boolean;
    acceptsAirportJobs: boolean;
    acceptsSchoolRuns?: boolean;
    acceptsWheelchairAccessible?: boolean;
  };
  performance: {
    completionRate: number;
    averageRating: number;
    totalJobs: number;
    monthlyEarnings: number;
    acceptanceRate?: number;
    cancellationRate?: number;
  };
  complianceStatus: {
    dueForTraining: boolean;
    trainingCompletedDate?: string;
    trainingExpiryDate?: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BookingExtension {
  bookingId: string;
  attributes: string[];
  commissionAmount?: number;
  notes?: string;
  updatedAt: string;
}

export interface VehicleExtension {
  vehicleId: string;
  plateType: string;
  plateNumber: string;
  plateExpiry: string;
  plateIssuingCouncil: string;
  insuranceCertificateNumber: string;
  insuranceExpiry: string;
  motComplianceExpiry: string;
  roadTaxExpiry: string;
  attributes: string[];
  ownershipType: 'Company' | 'Driver-owned' | 'Rental';
  linkedDriverIds: string[];
  updatedAt: string;
}

export interface CustomerExtension {
  customerId: string;
  notes: Array<{ id: string; text: string; createdAt: string; createdBy: string }>;
  priorityLevel: 'VIP' | 'High' | 'Normal' | 'Low';
  isBanned: boolean;
  bannedDriverIds: string[];
  attributes: string[];
  loyaltyPoints: number;
  totalSpend: number;
  updatedAt: string;
}

// ==================== DATABASE CLASS ====================

class AppDatabase {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  /**
   * Initialize the database connection
   */
  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });

    return this.initPromise;
  }

  /**
   * Create all object stores (tables)
   */
  private createObjectStores(db: IDBDatabase): void {
    const collections = Object.values(COLLECTIONS);

    collections.forEach((collectionName) => {
      if (!db.objectStoreNames.contains(collectionName)) {
        const store = db.createObjectStore(collectionName, { keyPath: 'id' });

        // Create indexes based on collection type
        if (collectionName.includes('Extensions')) {
          // Extensions are linked by foreign key
          const fkField = collectionName.replace('Extensions', 'Id');
          store.createIndex(fkField, fkField, { unique: true });
        }

        // Common indexes
        if (collectionName === COLLECTIONS.AUDIT_LOGS) {
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('category', 'category', { unique: false });
        }

        if (collectionName === COLLECTIONS.DRIVER_APPLICATIONS) {
          store.createIndex('email', 'email', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }

        if (collectionName === COLLECTIONS.MOCK_DRIVERS) {
          store.createIndex('email', 'email', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }

        if (collectionName === COLLECTIONS.MOCK_BOOKINGS) {
          store.createIndex('driverId', 'driverId', { unique: false });
          store.createIndex('customerId', 'customerId', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }
      }
    });
  }

  /**
   * Generic CRUD operations
   */

  // CREATE
  async add<T extends { id: string }>(collection: string, item: T): Promise<T> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collection], 'readwrite');
      const store = transaction.objectStore(collection);
      const request = store.add(item);

      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  }

  // READ - Get by ID
  async get<T>(collection: string, id: string): Promise<T | undefined> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collection], 'readonly');
      const store = transaction.objectStore(collection);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // READ - Get all
  async getAll<T>(collection: string): Promise<T[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collection], 'readonly');
      const store = transaction.objectStore(collection);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // READ - Query by index
  async query<T>(
    collection: string,
    indexName: string,
    query: IDBValidKey | IDBKeyRange
  ): Promise<T[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collection], 'readonly');
      const store = transaction.objectStore(collection);
      const index = store.index(indexName);
      const request = index.getAll(query);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // UPDATE
  async update<T extends { id: string }>(collection: string, item: T): Promise<T> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collection], 'readwrite');
      const store = transaction.objectStore(collection);
      const request = store.put(item);

      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  }

  // DELETE
  async delete(collection: string, id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collection], 'readwrite');
      const store = transaction.objectStore(collection);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // BULK INSERT
  async bulkAdd<T extends { id: string }>(
    collection: string,
    items: T[]
  ): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collection], 'readwrite');
      const store = transaction.objectStore(collection);

      let completed = 0;
      const total = items.length;

      items.forEach((item) => {
        const request = store.add(item);
        request.onsuccess = () => {
          completed++;
          if (completed === total) resolve();
        };
        request.onerror = () => reject(request.error);
      });

      if (total === 0) resolve();
    });
  }

  // CLEAR COLLECTION
  async clear(collection: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collection], 'readwrite');
      const store = transaction.objectStore(collection);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // COUNT
  async count(collection: string): Promise<number> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collection], 'readonly');
      const store = transaction.objectStore(collection);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Seed database with mock data
   */
  async seedMockData(): Promise<void> {
    // Import mock data
    const {
      mockDrivers,
      mockBookings,
      mockVehicles,
      mockCustomers,
      mockAccounts,
      mockCommissionSchemes,
      mockInvoices,
      mockDriverApplications,
      mockStaffList,
      mockPermissionTemplates,
      mockSiteDetails,
      mockPromotions,
      mockCustomerPromotions,
      mockRewardSchemes,
      mockPartnerOffers,
      mockNotifications,
      mockActivityFeed,
      mockDriverTransactions,
      mockHistoricInvoices,
    } = await import('./mockData');

    const {
      mockDrivers: mockDriversStaff,
      mockDriverApplications: mockApps,
      mockVehicles: mockVehiclesStaff,
      mockStaffList: staff,
      mockPermissionTemplates: templates,
    } = await import('./mockDriverStaffData');

    const { mockCustomers: customers, mockAccounts: accounts } = await import(
      './mockCustomerAccountData'
    );

    const financial = await import('./mockFinancialData');
    const invoices = financial.mockInvoices;
    const transactions = financial.mockDriverTransactions;
    // mockHistoricInvoices may live in mockData or in mockFinancialData; prefer financial if present
    const historicInv = (financial as any).mockHistoricInvoices;

    const { mockSiteDetails: sites } = await import('./mockCompanyData');

    // Check if already seeded
    const driverCount = await this.count(COLLECTIONS.MOCK_DRIVERS);
    if (driverCount > 0) {
      console.log('[DB] Already seeded, skipping...');
      return;
    }

    console.log('[DB] Seeding database with mock data...');

    // Seed demo mode collections
    await this.bulkAdd(COLLECTIONS.MOCK_DRIVERS, mockDriversStaff || mockDrivers);
    await this.bulkAdd(COLLECTIONS.MOCK_BOOKINGS, mockBookings);
    await this.bulkAdd(COLLECTIONS.MOCK_VEHICLES, mockVehiclesStaff || mockVehicles);
    await this.bulkAdd(COLLECTIONS.MOCK_CUSTOMERS, customers || mockCustomers);
    await this.bulkAdd(COLLECTIONS.MOCK_ACCOUNTS, accounts || mockAccounts);
    await this.bulkAdd(COLLECTIONS.MOCK_TRANSACTIONS, transactions || mockDriverTransactions);

    // Seed business logic collections
    await this.bulkAdd(COLLECTIONS.COMMISSION_SCHEMES, mockCommissionSchemes);
    await this.bulkAdd(COLLECTIONS.INVOICES, invoices || mockInvoices);
    await this.bulkAdd(COLLECTIONS.HISTORIC_INVOICES, historicInv || mockHistoricInvoices);
    await this.bulkAdd(COLLECTIONS.DRIVER_APPLICATIONS, mockApps || mockDriverApplications);
    await this.bulkAdd(COLLECTIONS.STAFF_MEMBERS, staff || mockStaffList);
    await this.bulkAdd(COLLECTIONS.PERMISSION_TEMPLATES, templates || mockPermissionTemplates);
    await this.bulkAdd(COLLECTIONS.SITES, sites || mockSiteDetails);
    await this.bulkAdd(COLLECTIONS.PROMOTIONS, mockPromotions);
    await this.bulkAdd(COLLECTIONS.CUSTOMER_PROMOTIONS, mockCustomerPromotions);
    await this.bulkAdd(COLLECTIONS.REWARD_SCHEMES, mockRewardSchemes);
    await this.bulkAdd(COLLECTIONS.PARTNER_OFFERS, mockPartnerOffers);
    await this.bulkAdd(COLLECTIONS.NOTIFICATIONS, mockNotifications);
    await this.bulkAdd(COLLECTIONS.ACTIVITY_FEED, mockActivityFeed);

    console.log('[DB] Seeding complete!');
  }

  /**
   * Reset database to initial state
   */
  async reset(): Promise<void> {
    console.log('[DB] Resetting database...');

    // Clear all collections
    const collections = Object.values(COLLECTIONS);
    for (const collection of collections) {
      await this.clear(collection);
    }

    // Re-seed
    await this.seedMockData();

    console.log('[DB] Reset complete!');
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

// ==================== SINGLETON INSTANCE ====================

export const db = new AppDatabase();

// Auto-initialize on import (but don't block or cause re-renders)
if (typeof window !== 'undefined') {
  // Use a flag to prevent multiple initializations
  let isInitializing = false;

  const initDB = async () => {
    if (isInitializing) return;
    isInitializing = true;

    try {
      await db.init();
      console.log('[DB] IndexedDB initialized');

      // Check if we need to seed
      const count = await db.count(COLLECTIONS.MOCK_DRIVERS);
      if (count === 0) {
        await db.seedMockData();
      }
    } catch (error) {
      console.error('[DB] Failed to initialize:', error);
    } finally {
      isInitializing = false;
    }
  };

  // Initialize on next tick to avoid blocking
  setTimeout(initDB, 0);
}

export default db;
