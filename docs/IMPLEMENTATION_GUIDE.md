# IndexedDB Integration Implementation Guide

This guide explains how to integrate the new IndexedDB persistence layer into the application.

## What Was Implemented

### 1. Core Database Layer (`lib/db.ts`)
- IndexedDB wrapper with CRUD operations
- 30+ collections for different data types
- Automatic seeding from existing mock data files
- `db.reset()` functionality to restore initial state
- Support for both business logic data and demo mode data

### 2. React Hooks (`lib/useDatabase.ts`)
- `useQuery<T>(collection, id)` - Fetch single item
- `useQueryAll<T>(collection)` - Fetch all items from collection
- `useMutation<T>(collection)` - Add/update items
- `useDelete(collection)` - Delete items
- Specific hooks: `useMockDrivers()`, `useMockBookings()`, `useCommissionSchemes()`, etc.
- Compound queries: `getDriverWithExtensions()`, `getBookingWithExtensions()`, etc.

### 3. Test Component (`components/DatabaseTestPanel.tsx`)
- Visual demonstration of database functionality
- Add test drivers
- View statistics for all collections
- Reset database to initial state
- Shows persistence across page refreshes

### 4. Documentation
- `docs/ICABBI_DATA_MODEL_ANALYSIS.md` - Complete analysis of iCabbi API vs our data model
- Updated `CLAUDE.md` with database architecture info

## How to Use the Database

### Option 1: Use React Hooks (Recommended)

```typescript
import { useMockDrivers, useAddDriver } from '../lib/useDatabase';

function MyComponent() {
  const { data: drivers, loading, error, refetch } = useMockDrivers();
  const { mutate: addDriver } = useAddDriver(() => {
    console.log('Driver added!');
    refetch(); // Refresh the list
  });

  const handleAdd = async () => {
    await addDriver(newDriverData);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {drivers.map(driver => (
        <div key={driver.id}>{driver.firstName} {driver.lastName}</div>
      ))}
    </div>
  );
}
```

### Option 2: Direct Database Access

```typescript
import { db, COLLECTIONS } from '../lib/db';

// Get all drivers
const drivers = await db.getAll(COLLECTIONS.MOCK_DRIVERS);

// Get single driver
const driver = await db.get(COLLECTIONS.MOCK_DRIVERS, 'D001');

// Add new driver
await db.add(COLLECTIONS.MOCK_DRIVERS, newDriver);

// Update driver
await db.update(COLLECTIONS.MOCK_DRIVERS, updatedDriver);

// Delete driver
await db.delete(COLLECTIONS.MOCK_DRIVERS, 'D001');

// Query by index
const activeDrivers = await db.query(
  COLLECTIONS.MOCK_DRIVERS,
  'status',
  'Active'
);
```

## Migration Path for Existing Components

### Step 1: Replace Array State with Database Hooks

**Before:**
```typescript
const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
```

**After:**
```typescript
const { data: drivers, loading, refetch } = useMockDrivers();
```

### Step 2: Update Add/Edit/Delete Operations

**Before:**
```typescript
const handleAddDriver = (driver: Driver) => {
  setDrivers(prev => [...prev, driver]);
};
```

**After:**
```typescript
const { mutate: addDriver } = useAddDriver(() => refetch());

const handleAddDriver = async (driver: Driver) => {
  await addDriver(driver);
};
```

### Step 3: Remove Mock Data Imports

**Before:**
```typescript
import { mockDrivers } from './lib/mockData';
```

**After:**
```typescript
// No import needed - data comes from IndexedDB
```

## Testing the Database

### Option 1: Use the Test Panel Component

Add to any page to test database functionality:

```typescript
import DatabaseTestPanel from './components/DatabaseTestPanel';

function TestPage() {
  return (
    <div>
      <DatabaseTestPanel />
    </div>
  );
}
```

### Option 2: Browser DevTools

1. Open DevTools → Application tab
2. Navigate to IndexedDB → RubberDuckyDB
3. Inspect collections and data
4. Manually add/edit/delete records

### Option 3: Programmatic Testing

```typescript
// Check if database is seeded
const count = await db.count(COLLECTIONS.MOCK_DRIVERS);
console.log(`Database has ${count} drivers`);

// Reset to initial state
await db.reset();

// Load statistics
const stats = {};
for (const collection of Object.values(COLLECTIONS)) {
  stats[collection] = await db.count(collection);
}
console.table(stats);
```

## Integration Strategy

### Phase 1: Demo Mode (Current)
- Use `mockDrivers`, `mockBookings`, etc. collections
- All data editable and persistent
- No iCabbi API connection

### Phase 2: Hybrid Mode (Future)
- iCabbi API for operational data (drivers, bookings from dispatch)
- IndexedDB for business logic (commission schemes, invoices, staff)
- Extensions linked to iCabbi entities

### Phase 3: Production Mode (Future)
- Real-time sync with iCabbi API
- Local caching in IndexedDB
- Offline support

## Key Files Modified

### New Files Created:
- `lib/db.ts` - Core database wrapper
- `lib/useDatabase.ts` - React hooks
- `components/DatabaseTestPanel.tsx` - Test component
- `docs/ICABBI_DATA_MODEL_ANALYSIS.md` - API analysis
- `IMPLEMENTATION_GUIDE.md` - This file

### Files to Update:
- `App.tsx` - Replace `mockDrivers` import with `useMockDrivers()` hook
- `views/staff/DriversPage.tsx` - Use database hooks instead of prop drilling
- `views/staff/InvoicingPage.tsx` - Use database for invoices
- `views/driver/DriverPortal.tsx` - Use database for driver data
- Any component that imports from `mockData.ts` or `mockDriverStaffData.ts`

## Common Patterns

### Pattern 1: List with Add/Edit/Delete

```typescript
function DriverList() {
  const { data: drivers, loading, refetch } = useMockDrivers();
  const { mutate: updateDriver } = useAddDriver(refetch);
  const { deleteItem } = useDelete(COLLECTIONS.MOCK_DRIVERS, refetch);

  const handleEdit = async (driver: Driver) => {
    await updateDriver(driver);
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id);
  };

  return (
    <div>
      {drivers.map(driver => (
        <DriverCard
          key={driver.id}
          driver={driver}
          onEdit={handleEdit}
          onDelete={() => handleDelete(driver.id)}
        />
      ))}
    </div>
  );
}
```

### Pattern 2: Filter and Search

```typescript
function DriverSearch() {
  const { data: allDrivers, loading } = useMockDrivers();
  const [search, setSearch] = useState('');

  const filteredDrivers = allDrivers.filter(driver =>
    driver.firstName.toLowerCase().includes(search.toLowerCase()) ||
    driver.lastName.toLowerCase().includes(search.toLowerCase()) ||
    driver.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search drivers..."
      />
      {filteredDrivers.map(driver => <DriverCard key={driver.id} driver={driver} />)}
    </div>
  );
}
```

### Pattern 3: Detail View with Extensions

```typescript
import { getDriverWithExtensions } from '../lib/useDatabase';

function DriverDetail({ driverId }: { driverId: string }) {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDriverWithExtensions(driverId).then(data => {
      setDriver(data);
      setLoading(false);
    });
  }, [driverId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{driver.firstName} {driver.lastName}</h1>
      <p>Balance: £{driver.currentBalance}</p>
      <p>Commission Scheme: {driver.schemeCode}</p>
      {/* Extension data automatically included */}
    </div>
  );
}
```

## Benefits of This Implementation

✅ **Persistence** - Data survives page refreshes
✅ **Editable Demo** - Users can add/modify demo data
✅ **Type-Safe** - Full TypeScript support
✅ **Reactive** - React hooks auto-update on changes
✅ **Scalable** - Easy to add new collections
✅ **Production-Ready** - Clear path to iCabbi integration
✅ **Offline-First** - Works without internet connection
✅ **Resettable** - Easy to restore initial state

## Next Steps

1. **Test the implementation**: Add `DatabaseTestPanel` to a page and try adding drivers
2. **Migrate one component**: Start with a simple page like DriversPage
3. **Update App.tsx**: Replace session-based driver state with database
4. **Remove mock imports**: Clean up direct imports from mockData files
5. **Add sync layer**: When ready for production, add iCabbi sync manager

## Troubleshooting

### Database not seeding?
- Check browser console for errors
- Clear IndexedDB: DevTools → Application → IndexedDB → Delete Database
- Refresh page to trigger auto-seeding

### Data not persisting?
- Ensure you're using `await` with database operations
- Check that hooks are calling `refetch()` after mutations
- Verify collection name is correct

### Performance issues?
- Use indexes for frequently queried fields
- Consider pagination for large datasets
- Cache results in component state if needed

## Questions?

Refer to:
- `lib/db.ts` - Core implementation
- `lib/useDatabase.ts` - Hook examples
- `docs/ICABBI_DATA_MODEL_ANALYSIS.md` - Data model design
- `components/DatabaseTestPanel.tsx` - Working example
