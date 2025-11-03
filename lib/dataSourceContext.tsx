/**
 * Data Source Context Provider
 * Enables switching between mock (development) and real (production) iCabbi data sources
 * without changing component code
 */

import React, { createContext, useContext, ReactNode } from 'react';
import {
  IcabbiConnector,
  createIcabbiConnector,
  getIcabbiConnectorFromEnv,
} from './icabbiAdapter';
import { Driver, Booking, Vehicle, Customer } from '../types';

// ==================== CONTEXT TYPES ====================

interface DataSourceContextType {
  connector: IcabbiConnector;
  mode: 'mock' | 'production';
  isHealthy: boolean;
  lastHealthCheck: Date | null;
}

// ==================== CONTEXT CREATION ====================

const DataSourceContext = createContext<DataSourceContextType | undefined>(
  undefined
);

// ==================== PROVIDER COMPONENT ====================

interface DataSourceProviderProps {
  children: ReactNode;
  mode?: 'mock' | 'production' | 'auto';
  config?: {
    baseUrl?: string;
    apiKey?: string;
    mockData?: any;
  };
}

export function DataSourceProvider({
  children,
  mode = 'auto',
  config,
}: DataSourceProviderProps) {
  const [isHealthy, setIsHealthy] = React.useState(true);
  const [lastHealthCheck, setLastHealthCheck] = React.useState<Date | null>(
    null
  );

  // Determine mode and create connector
  const { connector, resolvedMode } = React.useMemo(() => {
    let m: 'mock' | 'production';

    if (mode === 'auto') {
      // Auto-detect from environment
      m = (import.meta as any).env?.VITE_ICABBI_MODE === 'production'
        ? 'production'
        : 'mock';
    } else {
      m = mode;
    }

    const conn =
      m === 'production' && !config
        ? getIcabbiConnectorFromEnv()
        : createIcabbiConnector(m, config);

    return { connector: conn, resolvedMode: m };
  }, [mode, config]);

  // Health check on mount and periodically
  React.useEffect(() => {
    const performHealthCheck = async () => {
      try {
        const healthy = await connector.healthCheck();
        setIsHealthy(healthy);
        setLastHealthCheck(new Date());
      } catch (error) {
        console.warn('[DataSourceProvider] Health check failed:', error);
        setIsHealthy(false);
        setLastHealthCheck(new Date());
      }
    };

    performHealthCheck();

    // Check every 5 minutes
    const interval = setInterval(performHealthCheck, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [connector]);

  const value: DataSourceContextType = {
    connector,
    mode: resolvedMode,
    isHealthy,
    lastHealthCheck,
  };

  return (
    <DataSourceContext.Provider value={value}>
      {children}
    </DataSourceContext.Provider>
  );
}

// ==================== HOOKS ====================

/**
 * Hook to access the data source connector
 */
export function useDataSource(): DataSourceContextType {
  const context = useContext(DataSourceContext);
  if (!context) {
    throw new Error(
      'useDataSource must be used within DataSourceProvider'
    );
  }
  return context;
}

/**
 * Hook for querying drivers
 */
export function useDrivers() {
  const { connector } = useDataSource();
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchDrivers = React.useCallback(async (filter?: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await connector.listDrivers(filter);
      setDrivers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [connector]);

  const getDriver = React.useCallback(
    async (id: string): Promise<Driver> => {
      return connector.getDriver(id);
    },
    [connector]
  );

  const updateDriver = React.useCallback(
    async (id: string, data: Partial<Driver>): Promise<Driver> => {
      return connector.updateDriver(id, data);
    },
    [connector]
  );

  return {
    drivers,
    loading,
    error,
    fetchDrivers,
    getDriver,
    updateDriver,
  };
}

/**
 * Hook for querying bookings
 */
export function useBookings() {
  const { connector } = useDataSource();
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchBookings = React.useCallback(async (filter?: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await connector.listBookings(filter);
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [connector]);

  const getBooking = React.useCallback(
    async (id: string): Promise<Booking> => {
      return connector.getBooking(id);
    },
    [connector]
  );

  const createBooking = React.useCallback(
    async (data: Partial<Booking>): Promise<Booking> => {
      return connector.createBooking(data);
    },
    [connector]
  );

  const updateBooking = React.useCallback(
    async (id: string, data: Partial<Booking>): Promise<Booking> => {
      return connector.updateBooking(id, data);
    },
    [connector]
  );

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    getBooking,
    createBooking,
    updateBooking,
  };
}

/**
 * Hook for querying customers
 */
export function useCustomers() {
  const { connector } = useDataSource();
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchCustomers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await connector.listCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [connector]);

  const getCustomer = React.useCallback(
    async (id: string): Promise<Customer> => {
      return connector.getCustomer(id);
    },
    [connector]
  );

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    getCustomer,
  };
}

/**
 * Hook for querying vehicles
 */
export function useVehicles() {
  const { connector } = useDataSource();
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchVehicles = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await connector.listVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [connector]);

  const getVehicle = React.useCallback(
    async (id: string): Promise<Vehicle> => {
      return connector.getVehicle(id);
    },
    [connector]
  );

  return {
    vehicles,
    loading,
    error,
    fetchVehicles,
    getVehicle,
  };
}
