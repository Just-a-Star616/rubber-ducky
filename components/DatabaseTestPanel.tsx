/**
 * Database Test Panel
 * Component to test and demonstrate the IndexedDB persistence layer
 * Shows database statistics, allows adding demo data, and reset functionality
 */

import React, { useState } from 'react';
import { db, COLLECTIONS } from '../lib/db';
import {
  useMockDrivers,
  useMockBookings,
  useAddDriver,
  useResetDatabase,
} from '../lib/useDatabase';
import { Driver } from '../types';

const DatabaseTestPanel: React.FC = () => {
  const { data: drivers, loading: driversLoading, refetch: refetchDrivers } = useMockDrivers();
  const { data: bookings, loading: bookingsLoading, refetch: refetchBookings } = useMockBookings();
  const { mutate: addDriver } = useAddDriver(() => {
    refetchDrivers();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  });
  const { reset, loading: resetting } = useResetDatabase();

  const [showSuccess, setShowSuccess] = useState(false);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loadingStats, setLoadingStats] = useState(false);

  // Load statistics for all collections
  const loadStats = async () => {
    setLoadingStats(true);
    const newStats: Record<string, number> = {};

    for (const [key, collection] of Object.entries(COLLECTIONS)) {
      try {
        const count = await db.count(collection);
        newStats[key] = count;
      } catch (error) {
        console.error(`Error counting ${collection}:`, error);
        newStats[key] = -1;
      }
    }

    setStats(newStats);
    setLoadingStats(false);
  };

  // Add a test driver
  const handleAddTestDriver = async () => {
    const newDriver: Driver = {
      id: `D${Date.now()}`,
      firstName: 'Test',
      lastName: `Driver ${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      mobileNumber: '+447700900000',
      devicePhone: '+447700900000',
      drivingLicenseNumber: `TEST${Date.now()}`,
      drivingLicenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      badgeNumber: `BADGE${Date.now()}`,
      badgeExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      badgeIssuingCouncil: 'Test Council',
      badgeType: 'Private Hire',
      status: 'Active',
      vehicleRef: '',
      avatarUrl: '',
      address: '123 Test Street, Test City',
      niNumber: 'AB123456C',
      schemeCode: '1',
      gender: 'Other',
      dateOfBirth: '1990-01-01',
      emergencyContactName: 'Test Contact',
      emergencyContactNumber: '+447700900001',
      lastStatementBalance: 0,
      currentBalance: 0,
      commissionTotal: 0,
      canWithdrawCredit: false,
      earnedCreditSinceInvoice: 0,
      attributes: ['Test'],
      siteId: 'SITE01',
      schoolBadgeNumber: null,
      schoolBadgeExpiry: null,
      availability: {
        isOnline: true,
        shift: 'On-Demand',
        lastSeen: new Date().toISOString(),
      },
      performance: {
        completionRate: 0.95,
        averageRating: 4.5,
        totalJobs: 0,
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
        documentExpiries: [],
      },
      bankAccounts: [],
    };

    await addDriver(newDriver);
  };

  // Handle reset
  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset the database? This will restore all mock data to its initial state.')) {
      await reset();
      refetchDrivers();
      refetchBookings();
      loadStats();
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-blue-500">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        🗄️ IndexedDB Test Panel
      </h2>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded">
          ✓ Driver added successfully!
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded">
          <div className="text-sm text-blue-600 dark:text-blue-300">Drivers</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {driversLoading ? '...' : drivers.length}
          </div>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900 rounded">
          <div className="text-sm text-green-600 dark:text-green-300">Bookings</div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {bookingsLoading ? '...' : bookings.length}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={handleAddTestDriver}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          + Add Test Driver
        </button>
        <button
          onClick={loadStats}
          disabled={loadingStats}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition disabled:opacity-50"
        >
          {loadingStats ? 'Loading...' : '📊 Load All Stats'}
        </button>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
        >
          {resetting ? 'Resetting...' : '🔄 Reset Database'}
        </button>
      </div>

      {/* Recent Drivers */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          Recent Drivers (Last 5)
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {drivers.slice(-5).reverse().map((driver) => (
            <div
              key={driver.id}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm"
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {driver.firstName} {driver.lastName}
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-xs">
                {driver.email} • {driver.id}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collection Stats */}
      {Object.keys(stats).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            Collection Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {Object.entries(stats).map(([key, count]) => (
              <div
                key={key}
                className="p-2 bg-gray-50 dark:bg-gray-700 rounded flex justify-between"
              >
                <span className="text-gray-600 dark:text-gray-300 truncate">
                  {key}
                </span>
                <span className="font-mono font-bold text-gray-900 dark:text-white ml-2">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 rounded text-sm">
        <p className="text-yellow-800 dark:text-yellow-100">
          <strong>💡 Note:</strong> This database persists across page refreshes.
          Data is stored in IndexedDB in your browser. Use "Reset Database" to
          restore to initial mock data.
        </p>
      </div>
    </div>
  );
};

export default DatabaseTestPanel;
