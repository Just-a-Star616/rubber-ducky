# Dispatch Page Guide

The Dispatch Page is a modern, real-time booking and job management interface designed for dispatcher operations. It provides a three-column layout for efficient booking creation, job visualization, and task queue management.

## Access & Navigation

- **Menu Path**: Operations → Dispatch
- **Route**: `/staff/dispatch`
- **Permission Required**: `operations-dispatch-view` (Dispatcher, Administrator roles)
- **Tabs Available**: DISPATCH, BOOKINGS, DRIVERS, LOGS

## User Interface Layout

### Three-Column Design

The dispatch interface is split into three functional areas:

```
┌─────────────────────────────────────────────────────────────┐
│  DISPATCH | BOOKINGS | DRIVERS | LOGS  [Status Indicators]  │
├──────────────┬──────────────────────────┬──────────────────┤
│              │                          │                  │
│   BOOKING    │                          │   JOB QUEUE      │
│   FORM       │   GOOGLE MAPS-STYLE      │   TABLE          │
│              │   MAP WITH ETAs          │                  │
│   • Pickup   │   • Road network         │   • Time         │
│   • Dropoff  │   • Parks/Water          │   • PTA          │
│   • Passenger│   • Points of Interest   │   • Status       │
│   • Time     │   • Zoom/Pan controls    │   • Driver       │
│   • Fare     │   • Distance ETAs        │   • Pickup/Dest  │
│              │                          │   • Fare         │
├──────────────┴──────────────────────────┴──────────────────┤
│ DISPATCH 1 | Waiting: 3 | Assigned: 2 | En Route: 1 | ...  │
└─────────────────────────────────────────────────────────────┘
```

### Left Panel: Booking Form

**Compact Form Design** (h-6 inputs, dense spacing for rapid data entry)

- **Pickup Address** (required): Text input with location search
- **Dropoff Address** (required): Text input with location search
- **Passenger Name** (required): Text input
- **Passenger Phone** (required): Phone number input with validation
- **Pickup Time**: Time picker (default: now)
- **Fare Estimate**: Calculated automatically based on distance
- **Priority**: Dropdown (URGENT, HIGH, NORMAL, LOW)
- **Special Notes**: Text area for driver instructions
- **Action Buttons**:
  - **Create Booking** (primary): Submit form and add to queue
  - **Clear Form** (secondary): Reset all fields

**Keyboard Shortcuts** (when form is focused):
- `Enter` on Fare field: Submit booking
- `Ctrl+/` or `Cmd+/`: Clear form

### Center Panel: Map & ETAs

**Interactive Map Display**

- Shows road network with color-coded elements:
  - White/Light: Main roads
  - Green: Parks and green spaces
  - Blue: Water features
  - Red: Points of interest (landmarks)
- **Zoom Controls**: + (zoom in), - (zoom out), fit to bounds
- **Pan**: Click and drag map to navigate
- **Markers** (color-coded by status):
  - Red circle: Waiting for assignment
  - Yellow circle: Assigned to driver
  - Green circle: Driver en route
  - Blue circle: Completed

**Distance & ETA Panel**
- Shows estimated distance and ETA for selected job
- Updates in real-time as drivers move
- Displays multiple job routes if selected

### Right Panel: Job Queue Table

**Column Headers** (left to right):
- **TIME**: Booking time (HH:MM)
- **PTA**: Promised time of arrival
- **P**: Priority badge (U/H/N/L)
- **✓**: Confirmation status
- **N**: Notes indicator (icon if notes present)
- **Update**: Last update timestamp
- **Drv**: Assigned driver initials or "-"
- **Info**: Quick info button (click for details)
- **Pickup**: Pickup location (truncated)
- **V**: Vehicle type
- **Dest**: Destination (truncated)
- **Acc**: Account/customer type
- **Name**: Passenger name
- **Phone**: Passenger phone number
- **Zone**: Geographic zone code

**Row Styling** (Color-coded by status):
- **Red Background**: BIDDING (awaiting driver offers)
- **Yellow Background**: PRE-BOOKED (awaiting confirmation)
- **White Background**: BOOKED (confirmed)
- **Green Background**: COMPLETED (finished)

**Interactions**:
- **Click Row**: Open booking details and driver assignment panel
- **Hover Row**: Highlight on map with ETA projection
- **Scroll**: Infinite scroll for large job queues
- **Sort**: Click column header to sort (ascending/descending)
- **Filter**: See Status Bar filters below

### Bottom: Status Bar

**Real-Time Counters**:
- **DISPATCH 1**: Total active dispatch jobs
- **Waiting**: Jobs without driver assignment
- **Assigned**: Jobs assigned but not picked up
- **En Route**: Jobs in transit
- **Completed**: Jobs finished
- **Today**: Total jobs created today
- **This Hour**: Total jobs created this hour

**Quick Filters** (toggle on/off):
- Show only URGENT
- Show only unassigned
- Show only my zone
- Show only my driver pool

## Common Workflows

### Workflow 1: Create and Assign a Booking

1. **Enter pickup address** in Booking Form
   - Type or paste address
   - Select from search suggestions
2. **Enter dropoff address**
3. **Enter passenger details** (name, phone)
4. **Adjust pickup time** if needed (defaults to now)
5. **Review fare estimate** (updates based on distance)
6. **Set priority** (URGENT for quick jobs)
7. **Click "Create Booking"** → Job added to queue
8. **Job appears in red** (BIDDING status)
9. **Click job in queue** → Assignment panel opens
10. **Select driver** from available drivers
11. **Confirm assignment** → Job changes to yellow or white

### Workflow 2: Monitor En Route Deliveries

1. **Filter to "En Route"** in Status Bar
2. **Watch job queue** for status updates
3. **Track on map** - green markers show driver locations
4. **View ETA** in center panel
5. **Click job** for detailed delivery info
6. **Receive notification** when delivery completed

### Workflow 3: Handle Urgent/High Priority Bookings

1. **Booking arrives with URGENT priority**
2. **Row highlighted in red** (BIDDING status)
3. **Quickly assign available driver** (typically 30 sec max)
4. **Driver receives notification**
5. **Status changes to yellow** (PRE-BOOKED)
6. **Driver confirms acceptance**
7. **Status changes to white** (BOOKED)
8. **Driver begins en route** → Status changes to green
9. **Track on map** until completion

### Workflow 4: Export Job History

1. **Filter jobs** by date/zone/status as needed
2. **Select multiple jobs** (Ctrl+Click or Shift+Click)
3. **Right-click** → "Export Selected"
4. **Choose format**: CSV, PDF, or Excel
5. **Download** job details and invoicing data

## Logging & Activity Tracking

All dispatch actions are automatically logged:

**Events Logged**:
- Booking created (with pickup, dropoff, passenger)
- Driver assigned to job
- Booking status changed (BIDDING → BOOKED → COMPLETED)
- ETA updated
- Job cancelled
- Dispatcher notes added

**View Logs**:
1. Click **LOGS** tab in dispatch header
2. Filter by:
   - Date range
   - Event type (Booking Created, Driver Assigned, etc.)
   - User who performed action
   - Affected job ID
3. Export logs for compliance/auditing

## Permissions & Role Access

### Dispatcher
- ✅ Create bookings
- ✅ Assign drivers
- ✅ Cancel bookings
- ✅ View all jobs
- ✅ Add job notes
- ✅ Export job history
- ✅ View activity logs

### Dispatcher Manager
- ✅ All Dispatcher permissions
- ✅ Manage driver availability
- ✅ Reassign drivers between zones
- ✅ Override automatic assignments
- ✅ View detailed performance metrics

### Operations Admin
- ✅ All Dispatcher permissions
- ✅ Configure booking rules
- ✅ Manage pricing zones
- ✅ Archive old jobs
- ✅ Generate compliance reports

### Read-Only Driver
- ✅ View assigned jobs only
- ✅ View map (own location only)
- ✅ Accept/reject assignments

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` / `Cmd+N` | New booking (focus form) |
| `Ctrl+F` / `Cmd+F` | Filter jobs |
| `Ctrl+E` / `Cmd+E` | Export selected jobs |
| `Ctrl+L` / `Cmd+L` | View activity logs |
| `Escape` | Deselect job / Close panel |
| `/` | Focus search field |
| `+` | Zoom map in |
| `-` | Zoom map out |
| `?` | Show help overlay |

## Troubleshooting

### Issue: Map Not Loading

- **Cause**: Google Maps API not configured
- **Solution**: Check `lib/googleIntegration.ts` for API key
- **Workaround**: Map shows Google Maps-style placeholder (functional but non-interactive)

### Issue: Jobs Not Appearing in Queue

- **Cause**: Status filter may be hiding them
- **Solution**: Clear all filters in Status Bar
- **Check**: Verify job creation timestamp is today

### Issue: Driver Assignment Not Working

- **Cause**: Driver may have no available time slots
- **Solution**: Check driver availability calendar
- **Alternative**: Reassign to different driver

### Issue: Fare Estimate Not Calculating

- **Cause**: Addresses not recognized by mapping service
- **Solution**: Use more specific address with street number
- **Manual**: Override fare estimate in form

### Issue: Performance Slow with Large Job Queue

- **Cause**: Too many concurrent real-time updates
- **Solution**: Use date/zone filters to reduce visible jobs
- **Refresh**: Reload page to clear memory cache

## Performance Tips

1. **Use filters early** - Narrow down job queue before filtering
2. **Assign batches** - Batch similar jobs to same driver (reduces clicks)
3. **Keyboard shortcuts** - Use `Ctrl+N` for rapid booking entry
4. **Search addresses** - Use partial address for faster location lookup
5. **Archive old jobs** - Move completed jobs to archive to reduce queue
6. **Close map details** - Hide ETA panel when not needed to reduce updates

## Integration with Other Modules

### Drivers Dashboard
- View assigned jobs in real-time
- Accept/reject job offers
- Track completion status

### Invoicing System
- Jobs automatically generate invoice line items
- Fare amounts from dispatch used for invoicing
- Export jobs for billing

### Commission Rules
- Driver commission calculated from fare amount
- Commission rules applied to each job
- Payout generated from job history

### Analytics Dashboard
- Job completion metrics
- Driver performance statistics
- Zone utilization reports
- Peak hour analysis

## Related Documentation

- [LOGGING_AND_AUDIT_GUIDE.md](LOGGING_AND_AUDIT_GUIDE.md) - How to view and export dispatch logs
- [COMMISSION_RULES_SYSTEM.md](COMMISSION_RULES_SYSTEM.md) - How driver commissions are calculated
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick access to all features
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - System architecture overview

## FAQ

**Q: Can I edit a booking after creation?**
A: Yes, click the job in the queue and select "Edit Booking". You can modify all fields except the creation timestamp.

**Q: What happens if a driver goes offline during delivery?**
A: The job stays assigned but status changes to "DELIVERY_PENDING". Dispatcher gets notified and can reassign.

**Q: Can multiple dispatchers work simultaneously?**
A: Yes. Each dispatcher can manage their assigned zones independently. Dispatchers can see each other's jobs but can only modify their own.

**Q: How far back can I view job history?**
A: The system stores 6 months of job history. Older jobs are archived. See BACKEND_SETUP.md for archive retrieval.

**Q: Is there a maximum jobs per dispatcher?**
A: No hard limit, but UI performance degrades with >500 concurrent jobs. Use filters to manage queue size.

**Q: Can I set automatic booking rules?**
A: Currently manual assignment only. Automated assignment is planned for v2.0. See WEBHOOKS_AND_AUTOMATIONS_GUIDE.md for automation hooks.

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Active - Dispatch page fully functional and logging events
