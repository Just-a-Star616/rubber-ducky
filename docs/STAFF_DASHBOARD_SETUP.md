# Staff Dashboard Setup Guide (Stretch Goal)

This guide covers building a staff management interface for reviewing, approving, and managing driver applications.

## Overview

The staff dashboard provides:
- **Application Review**: View submitted driver applications with all details
- **Status Management**: Approve, reject, or request changes
- **Document Verification**: Review uploaded documents
- **Task Assignment**: Assign follow-up tasks to team members
- **Communication**: Send messages to applicants
- **Analytics**: Track application metrics and trends
- **Google Sheets Integration**: Sync with the application log

## Architecture

```
┌────────────────────────────────────────────┐
│        Staff Dashboard                      │
│     (Protected Routes)                      │
├────────────────────────────────────────────┤
│  1. Applications List & Filter              │
│  2. Application Detail View                 │
│  3. Document Review Panel                   │
│  4. Action Panel (Approve/Reject)          │
│  5. Task Management                         │
│  6. Analytics Dashboard                     │
└────────────────────────────────────────────┘
         │
         │ API Calls
         ▼
┌────────────────────────────────────────────┐
│        Backend API                          │
├────────────────────────────────────────────┤
│  • GET /api/applications                    │
│  • GET /api/applications/:id                │
│  • POST /api/applications/:id/approve       │
│  • POST /api/applications/:id/reject        │
│  • POST /api/tasks                          │
│  • PUT /api/applications/:id/notes          │
└────────────────────────────────────────────┘
```

## File Structure

```
views/staff/
├── DriverSignupManagement.tsx    # Main dashboard component
├── ApplicationsList.tsx           # Applications list with filters
├── ApplicationDetail.tsx          # Individual application view
├── DocumentViewer.tsx             # View uploaded documents
├── TaskPanel.tsx                  # Task assignment
└── Analytics.tsx                  # Dashboard analytics

components/staff/
├── ApplicationCard.tsx            # Card for application list
├── StatusBadge.tsx               # Status indicator
├── TaskForm.tsx                  # Task creation form
├── MessageComposer.tsx           # Message to applicant
└── MetricsCard.tsx               # Metric display

lib/
├── staffApi.ts                   # API calls for staff functions
└── staffServices.ts              # Business logic
```

## Implementation

### Step 1: Update Types

Add to `types.ts`:

```typescript
export type ApplicationStatus = 'Submitted' | 'Under Review' | 'Contacted' | 'Meeting Scheduled' | 'Approved' | 'Rejected';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'Manager' | 'Reviewer' | 'Admin';
}

export interface ApplicationTask {
  id: string;
  applicationId: string;
  assignedTo: StaffMember;
  taskType: 'Review Documents' | 'Schedule Interview' | 'Verify References' | 'Other';
  description: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface ApplicationNote {
  id: string;
  applicationId: string;
  author: StaffMember;
  content: string;
  timestamp: string;
  isInternal: boolean; // Not visible to applicant
}
```

### Step 2: Create Main Dashboard Component

Create `views/staff/DriverSignupManagement.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DriverApplication, ApplicationTask, ApplicationNote } from '../../types';
import { Sidebar } from '../../components/staff/Sidebar';
import ApplicationsList from './ApplicationsList';
import ApplicationDetail from './ApplicationDetail';
import Analytics from './Analytics';

type ViewMode = 'list' | 'detail' | 'analytics';

interface DriverSignupManagementProps {
  staffMember: StaffMember;
  onLogout: () => void;
}

const DriverSignupManagement: React.FC<DriverSignupManagementProps> = ({
  staffMember,
  onLogout,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedApplication, setSelectedApplication] = useState<DriverApplication | null>(null);
  const [applications, setApplications] = useState<DriverApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // Call backend API
        const response = await fetch('/api/applications?status=' + (filter !== 'all' ? filter : ''));
        const data = await response.json();
        setApplications(data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [filter]);

  const handleSelectApplication = (app: DriverApplication) => {
    setSelectedApplication(app);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedApplication(null);
  };

  const handleApplicationUpdate = (updated: DriverApplication) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === updated.id ? updated : app))
    );
    setSelectedApplication(updated);
  };

  const filteredApplications = applications.filter((app) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      app.firstName.toLowerCase().includes(searchLower) ||
      app.lastName.toLowerCase().includes(searchLower) ||
      app.email.toLowerCase().includes(searchLower) ||
      app.mobileNumber.includes(searchTerm)
    );
  });

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Navigation */}
      <Sidebar
        staffMember={staffMember}
        currentView={viewMode}
        onNavigate={(view) => {
          setViewMode(view as ViewMode);
          setSelectedApplication(null);
        }}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Driver Application Management</h1>
            <p className="text-muted-foreground">
              Manage and review driver applications
            </p>
          </div>

          {/* View Selector */}
          {viewMode === 'list' && (
            <>
              {/* Search and Filter Bar */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="md:col-span-2"
                />
                <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Meeting Scheduled">Meeting Scheduled</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Applications List */}
              <ApplicationsList
                applications={filteredApplications}
                loading={loading}
                onSelectApplication={handleSelectApplication}
              />
            </>
          )}

          {viewMode === 'detail' && selectedApplication && (
            <ApplicationDetail
              application={selectedApplication}
              staffMember={staffMember}
              onBack={handleBackToList}
              onUpdate={handleApplicationUpdate}
            />
          )}

          {viewMode === 'analytics' && (
            <Analytics applications={applications} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverSignupManagement;
```

### Step 3: Create Applications List Component

Create `views/staff/ApplicationsList.tsx`:

```typescript
import React from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { DriverApplication } from '../../types';
import ApplicationCard from '../../components/staff/ApplicationCard';

interface ApplicationsListProps {
  applications: DriverApplication[];
  loading: boolean;
  onSelectApplication: (app: DriverApplication) => void;
}

const ApplicationsList: React.FC<ApplicationsListProps> = ({
  applications,
  loading,
  onSelectApplication,
}) => {
  if (loading) {
    return <div className="text-center py-8">Loading applications...</div>;
  }

  if (applications.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground mb-2">No applications found</p>
        <p className="text-sm text-muted-foreground">
          Driver applications will appear here when submitted
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {applications.map((application) => (
        <ApplicationCard
          key={application.id}
          application={application}
          onClick={() => onSelectApplication(application)}
        />
      ))}
    </div>
  );
};

export default ApplicationsList;
```

### Step 4: Create Application Detail Component

Create `views/staff/ApplicationDetail.tsx`:

```typescript
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { DriverApplication, StaffMember, ApplicationNote, ApplicationTask } from '../../types';
import DocumentViewer from './DocumentViewer';
import TaskPanel from './TaskPanel';

interface ApplicationDetailProps {
  application: DriverApplication;
  staffMember: StaffMember;
  onBack: () => void;
  onUpdate: (updated: DriverApplication) => void;
}

const ApplicationDetail: React.FC<ApplicationDetailProps> = ({
  application,
  staffMember,
  onBack,
  onUpdate,
}) => {
  const [notes, setNotes] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  const handleApprove = async () => {
    setActionInProgress(true);
    try {
      const response = await fetch(`/api/applications/${application.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvedBy: staffMember.name,
          notes: notes || 'Approved',
        }),
      });
      const updated = await response.json();
      onUpdate(updated);
      setNotes('');
    } catch (error) {
      console.error('Error approving application:', error);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReject = async () => {
    setActionInProgress(true);
    try {
      const response = await fetch(`/api/applications/${application.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rejectedBy: staffMember.name,
          reason: notes || 'Rejected',
        }),
      });
      const updated = await response.json();
      onUpdate(updated);
      setNotes('');
    } catch (error) {
      console.error('Error rejecting application:', error);
    } finally {
      setActionInProgress(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Application Details */}
      <div className="lg:col-span-2 space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">
                  {application.firstName} {application.lastName}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Application ID: {application.id}
                </p>
              </div>
              <Button variant="outline" onClick={onBack}>
                Back to List
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><strong>Email:</strong> {application.email}</div>
            <div><strong>Phone:</strong> {application.mobileNumber}</div>
            <div><strong>Area:</strong> {application.area}</div>
            <div><strong>Status:</strong> {application.status}</div>
            <div><strong>Licensed:</strong> {application.isLicensed ? 'Yes' : 'No'}</div>
            <div><strong>Submitted:</strong> {new Date(application.applicationDate).toLocaleString()}</div>
          </CardContent>
        </Card>

        {/* License Details (if licensed) */}
        {application.isLicensed && (
          <Card>
            <CardHeader>
              <CardTitle>License & Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>Badge Number:</strong> {application.badgeNumber || 'N/A'}</div>
              <div><strong>Badge Expiry:</strong> {application.badgeExpiry || 'N/A'}</div>
              <div><strong>Issuing Council:</strong> {application.badgeIssuingCouncil || 'N/A'}</div>
              <div><strong>Driving License #:</strong> {application.drivingLicenseNumber || 'N/A'}</div>
              <div><strong>License Expiry:</strong> {application.drivingLicenseExpiry || 'N/A'}</div>
              <div><strong>Vehicle:</strong> {application.vehicleMake} {application.vehicleModel}</div>
              <div><strong>Registration:</strong> {application.vehicleRegistration || 'N/A'}</div>
            </CardContent>
          </Card>
        )}

        {/* Document Viewer */}
        <DocumentViewer application={application} />

        {/* Notes and History */}
        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Add internal notes about this application..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
            <div>
              {application.notes && application.notes.length > 0 && (
                <div className="space-y-2 text-sm">
                  {application.notes.map((note, idx) => (
                    <div key={idx} className="bg-muted p-3 rounded">
                      <p className="font-medium">{note.author}</p>
                      <p className="text-xs text-muted-foreground">{note.date}</p>
                      <p>{note.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar - Actions */}
      <div className="space-y-4">
        {/* Status Actions */}
        {application.status !== 'Approved' && application.status !== 'Rejected' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={handleApprove}
                disabled={actionInProgress}
              >
                Approve Application
              </Button>
              <Button
                className="w-full"
                variant="destructive"
                onClick={handleReject}
                disabled={actionInProgress}
              >
                Reject Application
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Task Assignment */}
        <TaskPanel
          applicationId={application.id}
          applicantName={`${application.firstName} ${application.lastName}`}
          staffMember={staffMember}
        />

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <a href={`mailto:${application.email}`}>Send Email</a>
            </Button>
            <Button variant="outline" className="w-full mt-2" asChild>
              <a href={`tel:${application.mobileNumber}`}>Call Applicant</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApplicationDetail;
```

### Step 5: Create Document Viewer

Create `views/staff/DocumentViewer.tsx`:

```typescript
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { DriverApplication } from '../../types';

interface DocumentViewerProps {
  application: DriverApplication;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ application }) => {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const documents = [
    {
      name: 'Badge Document',
      url: application.badgeDocumentUrl,
      fileName: application.badgeDocumentName,
    },
    {
      name: 'Driving License',
      url: application.licenseDocumentUrl,
      fileName: application.licenseDocumentName,
    },
    {
      name: 'V5C (Logbook)',
      url: application.v5cDocumentUrl,
      fileName: application.v5cDocumentName,
    },
    {
      name: 'Insurance',
      url: application.insuranceDocumentUrl,
      fileName: application.insuranceDocumentName,
    },
  ].filter((doc) => doc.url);

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-6 text-muted-foreground">
          No documents uploaded
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {documents.map((doc) => (
          <Button
            key={doc.name}
            variant="outline"
            className="w-full justify-start"
            asChild
          >
            <a href={doc.url} target="_blank" rel="noopener noreferrer">
              📄 {doc.name}
            </a>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default DocumentViewer;
```

### Step 6: Create Task Panel

Create `views/staff/TaskPanel.tsx`:

```typescript
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { StaffMember } from '../../types';

interface TaskPanelProps {
  applicationId: string;
  applicantName: string;
  staffMember: StaffMember;
}

const TaskPanel: React.FC<TaskPanelProps> = ({
  applicationId,
  applicantName,
  staffMember,
}) => {
  const [taskType, setTaskType] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateTask = async () => {
    if (!taskType || !dueDate) return;

    setSubmitting(true);
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          taskType,
          description,
          dueDate,
          assignedBy: staffMember.name,
        }),
      });

      // Reset form
      setTaskType('');
      setDescription('');
      setDueDate('');
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Create Task</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-sm font-medium">Task Type</label>
          <Select value={taskType} onValueChange={setTaskType}>
            <SelectTrigger>
              <SelectValue placeholder="Select task type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Review Documents">Review Documents</SelectItem>
              <SelectItem value="Schedule Interview">Schedule Interview</SelectItem>
              <SelectItem value="Verify References">Verify References</SelectItem>
              <SelectItem value="Background Check">Background Check</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Due Date</label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            placeholder="Task details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
        <Button
          className="w-full"
          onClick={handleCreateTask}
          disabled={!taskType || !dueDate || submitting}
        >
          {submitting ? 'Creating...' : 'Create Task'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TaskPanel;
```

### Step 7: Create Analytics Component

Create `views/staff/Analytics.tsx`:

```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DriverApplication } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsProps {
  applications: DriverApplication[];
}

const Analytics: React.FC<AnalyticsProps> = ({ applications }) => {
  // Calculate metrics
  const totalApplications = applications.length;
  const approved = applications.filter((a) => a.status === 'Approved').length;
  const rejected = applications.filter((a) => a.status === 'Rejected').length;
  const licensed = applications.filter((a) => a.isLicensed).length;

  // Status breakdown for chart
  const statusData = [
    { status: 'Submitted', count: applications.filter((a) => a.status === 'Submitted').length },
    { status: 'Under Review', count: applications.filter((a) => a.status === 'Under Review').length },
    { status: 'Approved', count: approved },
    { status: 'Rejected', count: rejected },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalApplications}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{approved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{rejected}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Licensed Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{licensed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Application Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
```

## Backend API Endpoints

Add these endpoints to your backend:

```typescript
// GET /api/applications - List all applications
GET /api/applications?status=Under Review&page=1&limit=20

// GET /api/applications/:id - Get specific application
GET /api/applications/:id

// POST /api/applications/:id/approve - Approve application
POST /api/applications/:id/approve
{
  "approvedBy": "Staff Name",
  "notes": "Optional notes"
}

// POST /api/applications/:id/reject - Reject application
POST /api/applications/:id/reject
{
  "rejectedBy": "Staff Name",
  "reason": "Reason for rejection"
}

// POST /api/tasks - Create task
POST /api/tasks
{
  "applicationId": "APP-123",
  "taskType": "Review Documents",
  "description": "Check vehicle documents",
  "dueDate": "2024-11-10",
  "assignedBy": "Staff Name"
}

// PUT /api/applications/:id/notes - Add notes
PUT /api/applications/:id/notes
{
  "note": "Application looks good",
  "author": "Staff Name"
}
```

## Authentication

Protect staff routes by adding Google Workspace email verification:

```typescript
async function verifyStaffAccess(email: string): Promise<boolean> {
  // Check if email is in your approved staff group
  const staffEmails = ['staff1@yourcompany.com', 'staff2@yourcompany.com'];
  return staffEmails.includes(email);
}
```

## Deployment

Deploy the staff dashboard with the main application to the same hosting platform.

---

**Related Documentation:**
- [DRIVER_SIGNUP_DEPLOYMENT.md](./DRIVER_SIGNUP_DEPLOYMENT.md)
- [BACKEND_SETUP.md](./BACKEND_SETUP.md)
