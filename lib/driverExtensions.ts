/**
 * Driver Extensions - Local Business Logic Layer
 *
 * This module handles the "extension" data that we store locally but is not
 * part of the iCabbi API. This implements the hybrid model:
 *
 * - iCabbi provides: Core driver data (names, contacts, licenses)
 * - We extend with: Commission schemes, financial tracking, preferences, etc.
 *
 * See docs/REAL_ICABBI_FIELD_MAPPING.md for architecture details
 */

import { BankAccount } from '../types';

/**
 * Local extension data stored separately from iCabbi driver data
 * Linked by driverId (iCabbi driver.ref - the call sign like "AV999")
 */
export interface DriverExtension {
  // Link to iCabbi driver
  driverId: string;                    // Links to driver.ref (call sign like "AV999")
  icabbiNumericId?: number;            // Optional: Store iCabbi's numeric ID for reference

  // Personal Information (not in iCabbi)
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;

  // Our Commission System
  schemeCode: string;                  // Commission scheme identifier
  commissionRate?: number;             // Override rate if different from scheme

  // Financial Tracking (calculated by us from bookings)
  currentBalance: number;              // Real-time balance
  lastStatementBalance: number;        // Balance at last invoice
  commissionTotal: number;             // Total commission earned
  earnedCreditSinceInvoice: number;    // Earnings since last statement
  canWithdrawCredit: boolean;          // Business rule flag

  // Payment Information (our system)
  bankAccounts: BankAccount[];

  // Custom Tagging System
  attributes: string[];                // Our custom tags/categories

  // Driver Preferences (stored locally)
  preferences: {
    maxJobDistance: number;            // km
    preferredAreas: string[];          // Area names or postcodes
    acceptsLongDistance: boolean;
    acceptsAirportJobs: boolean;
    acceptsSchoolRuns?: boolean;
    acceptsWheelchairAccessible?: boolean;
  };

  // Performance Metrics (calculated from booking history)
  performance: {
    completionRate: number;            // 0.0 to 1.0
    averageRating: number;             // 0.0 to 5.0
    totalJobs: number;
    monthlyEarnings: number;
    acceptanceRate?: number;           // Jobs accepted / offered
    cancellationRate?: number;         // Jobs cancelled / accepted
  };

  // Compliance Status (computed from iCabbi + our rules)
  complianceStatus: {
    dueForTraining: boolean;           // Our business rule
    trainingCompletedDate?: string;
    trainingExpiryDate?: string;
    notes?: string;
  };

  // Metadata
  createdAt: string;                   // ISO 8601
  updatedAt: string;                   // ISO 8601
}

/**
 * Default extension data for new drivers
 */
export function createDefaultDriverExtension(driverId: string): DriverExtension {
  return {
    driverId,
    schemeCode: 'STANDARD',
    currentBalance: 0,
    lastStatementBalance: 0,
    commissionTotal: 0,
    earnedCreditSinceInvoice: 0,
    canWithdrawCredit: false,
    bankAccounts: [],
    attributes: [],
    preferences: {
      maxJobDistance: 50,
      preferredAreas: [],
      acceptsLongDistance: true,
      acceptsAirportJobs: true,
      acceptsSchoolRuns: true,
      acceptsWheelchairAccessible: false,
    },
    performance: {
      completionRate: 1.0,
      averageRating: 5.0,
      totalJobs: 0,
      monthlyEarnings: 0,
      acceptanceRate: 1.0,
      cancellationRate: 0,
    },
    complianceStatus: {
      dueForTraining: false,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Merge iCabbi driver data with local extensions
 * This creates the full Driver object that the UI expects
 */
export function mergeDriverWithExtensions(
  icabbiDriver: any,  // IcabbiDriver from icabbiAdapter
  extension?: DriverExtension
): any {  // Returns full Driver type
  // If no extension exists, create default
  const ext = extension || createDefaultDriverExtension(icabbiDriver.id);

  // Merge iCabbi data with local extensions
  return {
    ...icabbiDriver,
    // Override with local extension data
    gender: ext.gender || icabbiDriver.gender,
    dateOfBirth: ext.dateOfBirth || icabbiDriver.dateOfBirth,
    emergencyContactName: ext.emergencyContactName || icabbiDriver.emergencyContactName,
    emergencyContactNumber: ext.emergencyContactNumber || icabbiDriver.emergencyContactNumber,
    schemeCode: ext.schemeCode,
    currentBalance: ext.currentBalance,
    lastStatementBalance: ext.lastStatementBalance,
    commissionTotal: ext.commissionTotal,
    earnedCreditSinceInvoice: ext.earnedCreditSinceInvoice,
    canWithdrawCredit: ext.canWithdrawCredit,
    bankAccounts: ext.bankAccounts,
    attributes: ext.attributes,
    preferences: ext.preferences,
    performance: ext.performance,
    complianceStatus: {
      ...icabbiDriver.complianceStatus,
      ...ext.complianceStatus,
    },
  };
}

/**
 * Extract only the local extension fields from a full Driver object
 * Used when saving changes to separate iCabbi updates from local updates
 */
export function extractDriverExtension(driver: any): DriverExtension {
  return {
    driverId: driver.id,  // This is driver.ref from iCabbi
    gender: driver.gender,
    dateOfBirth: driver.dateOfBirth,
    emergencyContactName: driver.emergencyContactName,
    emergencyContactNumber: driver.emergencyContactNumber,
    schemeCode: driver.schemeCode,
    currentBalance: driver.currentBalance,
    lastStatementBalance: driver.lastStatementBalance,
    commissionTotal: driver.commissionTotal,
    earnedCreditSinceInvoice: driver.earnedCreditSinceInvoice,
    canWithdrawCredit: driver.canWithdrawCredit,
    bankAccounts: driver.bankAccounts || [],
    attributes: driver.attributes || [],
    preferences: driver.preferences || {
      maxJobDistance: 50,
      preferredAreas: [],
      acceptsLongDistance: true,
      acceptsAirportJobs: true,
    },
    performance: driver.performance || {
      completionRate: 0.95,
      averageRating: 4.5,
      totalJobs: 0,
      monthlyEarnings: 0,
    },
    complianceStatus: {
      dueForTraining: driver.complianceStatus?.dueForTraining || false,
      trainingCompletedDate: driver.complianceStatus?.trainingCompletedDate,
      trainingExpiryDate: driver.complianceStatus?.trainingExpiryDate,
      notes: driver.complianceStatus?.notes,
    },
    createdAt: driver.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Update financial metrics based on new booking
 * Called when webhook receives completed booking
 */
export function updateDriverFinancials(
  extension: DriverExtension,
  bookingCommission: number,
  bookingTotal: number
): DriverExtension {
  return {
    ...extension,
    currentBalance: extension.currentBalance + bookingCommission,
    earnedCreditSinceInvoice: extension.earnedCreditSinceInvoice + bookingCommission,
    commissionTotal: extension.commissionTotal + bookingCommission,
    performance: {
      ...extension.performance,
      totalJobs: extension.performance.totalJobs + 1,
      monthlyEarnings: extension.performance.monthlyEarnings + bookingCommission,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Reset statement balance (called when generating new invoice)
 */
export function resetStatementBalance(extension: DriverExtension): DriverExtension {
  return {
    ...extension,
    lastStatementBalance: extension.currentBalance,
    earnedCreditSinceInvoice: 0,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate if driver can withdraw credit
 * Business rule: Can withdraw if balance > £50 and no negative balance
 */
export function canDriverWithdrawCredit(extension: DriverExtension): boolean {
  return extension.currentBalance >= 50 && extension.currentBalance > 0;
}

/**
 * Update performance metrics from booking statistics
 */
export function updatePerformanceMetrics(
  extension: DriverExtension,
  stats: {
    completedJobs: number;
    totalJobs: number;
    averageRating: number;
    acceptedJobs: number;
    offeredJobs: number;
    cancelledJobs: number;
  }
): DriverExtension {
  return {
    ...extension,
    performance: {
      completionRate: stats.totalJobs > 0 ? stats.completedJobs / stats.totalJobs : 1.0,
      averageRating: stats.averageRating,
      totalJobs: stats.completedJobs,
      monthlyEarnings: extension.performance.monthlyEarnings,
      acceptanceRate: stats.offeredJobs > 0 ? stats.acceptedJobs / stats.offeredJobs : 1.0,
      cancellationRate: stats.acceptedJobs > 0 ? stats.cancelledJobs / stats.acceptedJobs : 0,
    },
    canWithdrawCredit: canDriverWithdrawCredit(extension),
    updatedAt: new Date().toISOString(),
  };
}
