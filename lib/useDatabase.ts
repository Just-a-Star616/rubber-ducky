/**
 * React hooks for database access
 * Provides reactive queries and mutations for IndexedDB collections
 */

import { useState, useEffect, useCallback } from 'react';
import { db, COLLECTIONS } from './db';

// ==================== TYPES ====================

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UseQueryAllResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UseMutationResult<T> {
  mutate: (item: T) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

// ==================== GENERIC HOOKS ====================

/**
 * Hook to fetch a single item by ID
 */
export function useQuery<T>(
  collection: string,
  id: string | undefined
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await db.get<T>(collection, id);
      setData(result || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [collection, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch all items from a collection
 */
export function useQueryAll<T>(collection: string): UseQueryAllResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await db.getAll<T>(collection);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [collection]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to add or update an item
 */
export function useMutation<T extends { id: string }>(
  collection: string,
  onSuccess?: () => void
): UseMutationResult<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (item: T) => {
      try {
        setLoading(true);
        setError(null);
        await db.update(collection, item);
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [collection, onSuccess]
  );

  return { mutate, loading, error };
}

/**
 * Hook to delete an item
 */
export function useDelete(
  collection: string,
  onSuccess?: () => void
): {
  deleteItem: (id: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteItem = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        await db.delete(collection, id);
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [collection, onSuccess]
  );

  return { deleteItem, loading, error };
}

// ==================== SPECIFIC COLLECTION HOOKS ====================

/**
 * Hook for commission schemes
 */
export function useCommissionSchemes() {
  return useQueryAll(COLLECTIONS.COMMISSION_SCHEMES);
}

/**
 * Hook for invoices
 */
export function useInvoices() {
  return useQueryAll(COLLECTIONS.INVOICES);
}

/**
 * Hook for driver applications
 */
export function useDriverApplications() {
  return useQueryAll(COLLECTIONS.DRIVER_APPLICATIONS);
}

/**
 * Hook for staff members
 */
export function useStaffMembers() {
  return useQueryAll(COLLECTIONS.STAFF_MEMBERS);
}

/**
 * Hook for permission templates
 */
export function usePermissionTemplates() {
  return useQueryAll(COLLECTIONS.PERMISSION_TEMPLATES);
}

/**
 * Hook for mock drivers (demo mode)
 */
export function useMockDrivers() {
  return useQueryAll(COLLECTIONS.MOCK_DRIVERS);
}

/**
 * Hook for mock bookings (demo mode)
 */
export function useMockBookings() {
  return useQueryAll(COLLECTIONS.MOCK_BOOKINGS);
}

/**
 * Hook for mock vehicles (demo mode)
 */
export function useMockVehicles() {
  return useQueryAll(COLLECTIONS.MOCK_VEHICLES);
}

/**
 * Hook for mock customers (demo mode)
 */
export function useMockCustomers() {
  return useQueryAll(COLLECTIONS.MOCK_CUSTOMERS);
}

/**
 * Hook for promotions
 */
export function usePromotions() {
  return useQueryAll(COLLECTIONS.PROMOTIONS);
}

/**
 * Hook for customer promotions
 */
export function useCustomerPromotions() {
  return useQueryAll(COLLECTIONS.CUSTOMER_PROMOTIONS);
}

/**
 * Hook for audit logs
 */
export function useAuditLogs() {
  return useQueryAll(COLLECTIONS.AUDIT_LOGS);
}

/**
 * Hook for notifications
 */
export function useNotifications() {
  return useQueryAll(COLLECTIONS.NOTIFICATIONS);
}

/**
 * Hook for activity feed
 */
export function useActivityFeed() {
  return useQueryAll(COLLECTIONS.ACTIVITY_FEED);
}

/**
 * Hook to add a new driver (demo mode)
 */
export function useAddDriver(onSuccess?: () => void) {
  return useMutation(COLLECTIONS.MOCK_DRIVERS, onSuccess);
}

/**
 * Hook to add a new booking (demo mode)
 */
export function useAddBooking(onSuccess?: () => void) {
  return useMutation(COLLECTIONS.MOCK_BOOKINGS, onSuccess);
}

/**
 * Hook to add a new vehicle (demo mode)
 */
export function useAddVehicle(onSuccess?: () => void) {
  return useMutation(COLLECTIONS.MOCK_VEHICLES, onSuccess);
}

/**
 * Hook to reset database
 */
export function useResetDatabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await db.reset();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to reset database'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { reset, loading, error };
}

// ==================== COMPOUND QUERIES ====================

/**
 * Get driver with extensions
 */
export async function getDriverWithExtensions(driverId: string) {
  const driver = await db.get(COLLECTIONS.MOCK_DRIVERS, driverId);
  const extension = await db.query(
    COLLECTIONS.DRIVER_EXTENSIONS,
    'driverId',
    driverId
  );

  return {
    ...driver,
    ...(extension[0] || {}),
  };
}

/**
 * Get booking with extensions
 */
export async function getBookingWithExtensions(bookingId: string) {
  const booking = await db.get(COLLECTIONS.MOCK_BOOKINGS, bookingId);
  const extension = await db.query(
    COLLECTIONS.BOOKING_EXTENSIONS,
    'bookingId',
    bookingId
  );

  return {
    ...booking,
    ...(extension[0] || {}),
  };
}

/**
 * Get vehicle with extensions
 */
export async function getVehicleWithExtensions(vehicleId: string) {
  const vehicle = await db.get(COLLECTIONS.MOCK_VEHICLES, vehicleId);
  const extension = await db.query(
    COLLECTIONS.VEHICLE_EXTENSIONS,
    'vehicleId',
    vehicleId
  );

  return {
    ...vehicle,
    ...(extension[0] || {}),
  };
}

/**
 * Get customer with extensions
 */
export async function getCustomerWithExtensions(customerId: string) {
  const customer = await db.get(COLLECTIONS.MOCK_CUSTOMERS, customerId);
  const extension = await db.query(
    COLLECTIONS.CUSTOMER_EXTENSIONS,
    'customerId',
    customerId
  );

  return {
    ...customer,
    ...(extension[0] || {}),
  };
}

// ==================== EXTENSION HOOKS ====================

/**
 * Hook for driver extensions
 */
export function useDriverExtensions() {
  return useQueryAll(COLLECTIONS.DRIVER_EXTENSIONS);
}

/**
 * Hook to get a specific driver extension by driverId
 */
export function useDriverExtension(driverId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const extensions = await db.query(
        COLLECTIONS.DRIVER_EXTENSIONS,
        'driverId',
        driverId
      );
      setData(extensions[0] || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch driver extension'));
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to save/update driver extension
 */
export function useSaveDriverExtension(onSuccess?: () => void) {
  return useMutation(COLLECTIONS.DRIVER_EXTENSIONS, onSuccess);
}

/**
 * Hook to get all drivers with their extensions merged
 * This provides the full Driver objects that the UI expects
 */
export function useDriversWithExtensions() {
  const { data: drivers, loading: driversLoading, error: driversError, refetch: refetchDrivers } = useMockDrivers();
  const { data: extensions, loading: extensionsLoading, error: extensionsError, refetch: refetchExtensions } = useDriverExtensions();

  const [mergedData, setMergedData] = useState<any[]>([]);
  const loading = driversLoading || extensionsLoading;
  const error = driversError || extensionsError;

  useEffect(() => {
    if (drivers && extensions) {
      // Create a map of extensions by driverId for quick lookup
      const extensionMap = new Map();
      extensions.forEach((ext: any) => {
        extensionMap.set(ext.driverId, ext);
      });

      // Merge drivers with their extensions
      const merged = drivers.map((driver: any) => {
        const extension = extensionMap.get(driver.id);
        if (extension) {
          return {
            ...driver,
            ...extension,
            // Ensure driver fields take precedence over extension fields for core data
            id: driver.id,
            firstName: driver.firstName,
            lastName: driver.lastName,
            email: driver.email,
          };
        }
        return driver;
      });

      setMergedData(merged);
    }
  }, [drivers, extensions]);

  const refetch = useCallback(async () => {
    await refetchDrivers();
    await refetchExtensions();
  }, [refetchDrivers, refetchExtensions]);

  return { data: mergedData, loading, error, refetch };
}
