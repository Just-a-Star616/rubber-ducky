## iCabbi Integration Configuration

This document explains how to configure the project for iCabbi integration using the new adapter layer.

### Overview

The project now supports seamless switching between **mock** (development) and **production** (real iCabbi) data sources without changing component code. This is achieved through:

1. **IcabbiConnector Interface** - Abstraction layer for all iCabbi operations
2. **DataSourceProvider** - React context for dependency injection
3. **Custom Hooks** - Easy data access from components (`useDrivers`, `useBookings`, etc.)

### Quick Start

#### Development (Mock Mode - Default)

No configuration needed! Mock data is used by default:

```tsx
// App.tsx
import { DataSourceProvider } from './lib/dataSourceContext';

export default function App() {
  return (
    <DataSourceProvider mode="mock">
      <YourComponents />
    </DataSourceProvider>
  );
}
```

#### Production (Real iCabbi)

Create a `.env.local` file:

```env
VITE_ICABBI_MODE=production
VITE_ICABBI_BASE_URL=https://api.icabbi.com
VITE_ICABBI_API_KEY=your_api_key_here
```

Or pass config directly:

```tsx
<DataSourceProvider
  mode="production"
  config={{
    baseUrl: 'https://api.icabbi.com',
    apiKey: process.env.REACT_APP_ICABBI_KEY,
  }}
>
  <YourComponents />
</DataSourceProvider>
```

### Using Data in Components

Instead of importing mock data directly, use the provided hooks:

**Before (hardcoded mock data):**
```tsx
import { mockDrivers } from './lib/mockData';

export function DriverList() {
  return (
    <div>
      {mockDrivers.map(d => <DriverCard key={d.id} driver={d} />)}
    </div>
  );
}
```

**After (flexible data source):**
```tsx
import { useDrivers } from './lib/dataSourceContext';

export function DriverList() {
  const { drivers, loading, fetchDrivers } = useDrivers();

  useEffect(() => {
    fetchDrivers();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      {drivers.map(d => <DriverCard key={d.id} driver={d} />)}
    </div>
  );
}
```

### Available Hooks

#### `useDataSource()`
Access the connector and connection status:

```tsx
const { connector, mode, isHealthy, lastHealthCheck } = useDataSource();
```

#### `useDrivers()`
Query and manage drivers:

```tsx
const {
  drivers,           // Driver[]
  loading,           // boolean
  error,             // Error | null
  fetchDrivers,      // (filter?) => Promise<void>
  getDriver,         // (id) => Promise<Driver>
  updateDriver,      // (id, data) => Promise<Driver>
} = useDrivers();
```

#### `useBookings()`
Query and manage bookings:

```tsx
const {
  bookings,          // Booking[]
  loading,           // boolean
  error,             // Error | null
  fetchBookings,     // (filter?) => Promise<void>
  getBooking,        // (id) => Promise<Booking>
  createBooking,     // (data) => Promise<Booking>
  updateBooking,     // (id, data) => Promise<Booking>
} = useBookings();
```

#### `useCustomers()`
Query customers:

```tsx
const {
  customers,         // Customer[]
  loading,           // boolean
  error,             // Error | null
  fetchCustomers,    // () => Promise<void>
  getCustomer,       // (id) => Promise<Customer>
} = useCustomers();
```

#### `useVehicles()`
Query vehicles:

```tsx
const {
  vehicles,          // Vehicle[]
  loading,           // boolean
  error,             // Error | null
  fetchVehicles,     // () => Promise<void>
  getVehicle,        // (id) => Promise<Vehicle>
} = useVehicles();
```

### Architecture

```
┌─────────────────────────────────────────┐
│         React Components                 │
│     (DriverList, BookingForm, etc)      │
└──────────────┬──────────────────────────┘
               │ useDrivers(), useBookings()
               ▼
┌─────────────────────────────────────────┐
│      DataSourceContext + Provider        │
│   (Dependency Injection & Health Check)  │
└──────────────┬──────────────────────────┘
               │ connector
               ▼
┌─────────────────────────────────────────┐
│       IcabbiConnector Interface          │
│  (Unified API - Abstract Operations)     │
└──────────────┬──────────────────────────┘
               │
      ┌────────┴────────┐
      ▼                 ▼
┌───────────────┐  ┌──────────────────┐
│   Mock Mode   │  │ Production Mode  │
│  (localhost)  │  │  (Real iCabbi)   │
└───────────────┘  └──────────────────┘
```

### File Structure

```
lib/
├── icabbiAdapter.ts         # Connector interface, transformations, implementations
├── dataSourceContext.tsx    # React context, provider, hooks
├── mockData.ts              # Mock development data
├── googleIntegration.ts     # Google Workspace integration
└── ...
```

### Transforming iCabbi Data

The adapter includes transformation functions that map iCabbi API responses to app types:

```typescript
// Automatic in RealIcabbiConnector
const driver = await connector.getDriver('123');

// Behind the scenes:
// 1. Fetch from iCabbi API
// 2. Transform via transformIcabbiDriver()
// 3. Return as app Driver type
```

If iCabbi's API schema changes, only update the transformation functions in `icabbiAdapter.ts` - components remain unchanged.

### Health Checks

The DataSourceProvider performs automatic health checks:
- On component mount
- Every 5 minutes during runtime
- Result available via `useDataSource().isHealthy`

Use to show connection status UI:

```tsx
const { isHealthy, lastHealthCheck } = useDataSource();

return (
  <div className="status-bar">
    <div className={`indicator ${isHealthy ? 'green' : 'red'}`} />
    {isHealthy ? 'Connected' : 'Offline'}
  </div>
);
```

### Environment Variables

| Variable | Default | Required | Example |
|----------|---------|----------|---------|
| `VITE_ICABBI_MODE` | `mock` | No | `production` or `mock` |
| `VITE_ICABBI_BASE_URL` | - | Yes (prod) | `https://api.icabbi.com` |
| `VITE_ICABBI_API_KEY` | - | Yes (prod) | `sk_live_...` |

### Migration Checklist

To integrate iCabbi into an existing component:

- [ ] Wrap app root with `<DataSourceProvider mode="auto">`
- [ ] Replace `import { mockDrivers }` with `const { drivers } = useDrivers()`
- [ ] Remove direct mock data passing to components
- [ ] Add loading states to components
- [ ] Add error boundaries for API failures
- [ ] Test with mock mode: `VITE_ICABBI_MODE=mock`
- [ ] Test with production: set `.env.local` variables
- [ ] Deploy with environment variables configured

### Error Handling

Hooks include error states:

```tsx
const { drivers, error, loading } = useDrivers();

if (error) {
  return <ErrorMessage error={error} retry={() => fetchDrivers()} />;
}

if (loading) return <Spinner />;

return <DriverList drivers={drivers} />;
```

### Extending the Adapter

To add new operations to the connector:

1. Add method to `IcabbiConnector` interface
2. Implement in `RealIcabbiConnector` class
3. Implement in `MockIcabbiConnector` class
4. Add hook in `dataSourceContext.tsx`
5. Use in components

Example - Adding driver performance stats:

```typescript
// icabbiAdapter.ts
export interface IcabbiConnector {
  // ... existing methods
  getDriverStats(driverId: string): Promise<DriverStats>;
}

// dataSourceContext.tsx
export function useDriverStats() {
  const { connector } = useDataSource();
  // ... hook implementation
}
```

### Testing

In tests, create a mock connector directly:

```typescript
import { MockIcabbiConnector } from './lib/icabbiAdapter';

const mockConnector = new MockIcabbiConnector({
  drivers: [{ id: '1', firstName: 'John', ... }],
  bookings: [{ id: 'B1', ... }],
});

const driver = await mockConnector.getDriver('1');
```

### Next Steps

1. ✅ Adapter layer created (`icabbiAdapter.ts`)
2. ✅ Data source context created (`dataSourceContext.tsx`)
3. ⏳ Update `App.tsx` to wrap with `DataSourceProvider`
4. ⏳ Migrate components to use hooks instead of hardcoded mock data
5. ⏳ Set up `.env.local` for production credentials
6. ⏳ Implement iCabbi-specific error handling
7. ⏳ Add authentication flow for iCabbi OAuth2

### Support & Troubleshooting

**Components show no data:**
- Check `DataSourceProvider` wraps your app
- Verify `useDrivers()` calls `fetchDrivers()` in useEffect
- Check browser console for errors

**"useDataSource must be used within DataSourceProvider":**
- Ensure app is wrapped with `<DataSourceProvider>`
- Check hook is called inside component (not at module level)

**API returns 401 Unauthorized:**
- Verify `VITE_ICABBI_API_KEY` is correct
- Check API key hasn't expired in iCabbi dashboard

**Mock data doesn't load:**
- Verify `mode="mock"` or `VITE_ICABBI_MODE=mock`
- Check mock data files exist in `lib/mockData.ts`
