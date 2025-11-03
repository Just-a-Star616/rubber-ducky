// ==================== LOGGING TYPES ====================

export type LogLevel = 'info' | 'warning' | 'error' | 'success';
export type LogEventType = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'IMPORT' | 'API_CALL' | 'SYSTEM_EVENT' | 'ERROR';
export type LogCategory = 'STAFF' | 'DRIVER' | 'COMMISSION' | 'INVOICE' | 'PERMISSION' | 'SITE' | 'BOOKING' | 'PAYMENT' | 'SYSTEM' | 'AUTH' | 'DASHBOARD' | 'NOTIFICATION' | 'AUTOMATION' | 'CONNECTOR' | 'TEMPLATE';

export interface LogEntry {
  id: string; // UUID
  timestamp: string; // ISO string
  userId: string; // Staff member ID or 'SYSTEM'
  userName: string; // Staff name or 'System'
  eventType: LogEventType; // CREATE, UPDATE, DELETE, etc.
  category: LogCategory; // STAFF, DRIVER, COMMISSION, etc.
  level: LogLevel; // info, warning, error, success
  
  // Subject of the action
  entityType: string; // 'StaffMember', 'Driver', 'CommissionScheme', etc.
  entityId: string; // ID of the affected entity
  entityName?: string; // Human-readable name (e.g., staff member name)
  
  // Action details
  action: string; // Human-readable: "Created new staff member", "Updated commission scheme"
  description?: string; // Detailed description
  
  // Changes tracking (for UPDATE events)
  changes?: {
    fieldName: string;
    oldValue: any;
    newValue: any;
  }[];
  
  // For API/system events
  endpoint?: string; // API endpoint called
  method?: string; // GET, POST, PUT, DELETE
  status?: number; // HTTP status
  errorMessage?: string; // Error details if failed
  duration?: number; // ms for performance tracking
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  siteId?: string; // For site-specific logging
  metadata?: Record<string, any>;
}

export interface LogFilter {
  startDate?: string;
  endDate?: string;
  userId?: string;
  eventType?: LogEventType;
  category?: LogCategory;
  entityType?: string;
  level?: LogLevel;
  entityId?: string;
}

export interface DocumentUpdateRequest {
    fileName: string;
    fileUrl?: string;
    expiry: string;
    number?: string;
    issuingCouncil?: string;
}

export interface PendingChanges {
    firstName?: string;

    lastName?: string;
    devicePhone?: string;
    mobileNumber?: string;
    email?: string;
    address?: string;
    gender?: 'Male' | 'Female' | 'Other';
    emergencyContactName?: string;
    emergencyContactNumber?: string;
    badgeIssuingCouncil?: string;

    badgeUpdate?: DocumentUpdateRequest;
    drivingLicenseUpdate?: DocumentUpdateRequest;
    schoolBadgeUpdate?: DocumentUpdateRequest;
}

export interface Driver {
  id: string; // Ref
  vehicleRef: string;
  avatarUrl: string;
  firstName: string;
  lastName: string;
  devicePhone: string;
  mobileNumber: string; // Mobile Phone
  email: string;
  address: string;
  niNumber: string;
  schemeCode: string;
  gender: 'Male' | 'Female' | 'Other';
  badgeType: 'Private Hire' | 'Hackney Carriage';
  badgeIssuingCouncil: string;
  badgeNumber: string;
  badgeExpiry: string; // ISO string date
  badgeDocumentUrl?: string;
  drivingLicenseNumber: string;
  drivingLicenseExpiry: string; // ISO string date
  drivingLicenseDocumentUrl?: string;
  schoolBadgeNumber: string | null;
  schoolBadgeExpiry: string | null;
  schoolBadgeDocumentUrl?: string;
  dateOfBirth: string; // YYYY-MM-DD
  emergencyContactName: string;
  emergencyContactNumber: string;
  
  status: 'Active' | 'Inactive' | 'Archived';
  lastStatementBalance: number;
  commissionTotal: number;
  pendingChanges?: PendingChanges;
  currentBalance: number;
  canWithdrawCredit: boolean;
  earnedCreditSinceInvoice: number;
  pendingNewVehicle?: Vehicle;
  attributes: string[];
  siteId: string;
  
  // Enhanced fields
  availability: {
    isOnline: boolean;
    shift: 'Day' | 'Night' | 'Split' | 'On-Demand';
    currentLocation?: { lat: number; lng: number };
    lastSeen: string; // ISO string
  };
  performance: {
    completionRate: number;
    averageRating: number;
    totalJobs: number;
    monthlyEarnings: number;
  };
  preferences: {
    maxJobDistance: number;
    preferredAreas: string[];
    acceptsLongDistance: boolean;
    acceptsAirportJobs: boolean;
  };
  complianceStatus: {
    dueForTraining: boolean;
    documentExpiries: Array<{
      document: string;
      expiryDate: string;
      daysUntilExpiry: number;
    }>;
  };
}


export interface Invoice {
  id: string;
  weekEnding: string;
  grossEarnings: number;
  commission: number;
  netEarnings: number;
  statementUrl: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  date: string;
  description: string;
  amount: number;
}

export interface Tier {
  rate: number;
  upTo: number; // Use a high number like 999999 for infinity
}

export type CommissionSchemeType = 
  'PAYE' |
  '%' |
  '% + Fixed' |
  '% Upto Fixed £ Value' |
  'Fixed' |
  'Tiered % on total £' |
  'Tiered % Then Fixed' |
  'Tiered % per £ banding';

export interface CommissionFieldRule {
  fieldName: string;
  include: boolean; // true = include in sum, false = exclude
  description?: string;
  condition?: string; // Optional conditional logic, e.g., "pickup_address.includes('Heathrow') || pickup_address.includes('Gatwick')"
  airportHandling?: 'all' | 'airport_only' | 'exclude_airport'; // How to handle airport-flagged fields
  airportLocationType?: 'pickup' | 'destination'; // Whether airport check applies to pickup or destination
}

export interface CommissionOutputRule {
  outputName: string; // e.g., "Driver Income (Cash)", "Company Income (Card)", etc.
  formula: string; // e.g., "sum - commission" or "commission * 0.8"
  description?: string;
  paymentMethods?: ('Cash' | 'Card' | 'Invoice')[]; // Filter by payment method (undefined = all methods)
}

export interface CommissionScheme {
  id: string;
  name: string;
  type: CommissionSchemeType;
  details: string;
  commissionRate?: number;
  minimumCharge?: number;
  dataCharge?: number;
  capAmount?: number;
  tiers?: Tier[];
  vehicleRent?: number;
  insuranceDeposit?: number;
  // New 3-stage system
  stage1FieldRules?: CommissionFieldRule[]; // Select fields for sum calculation
  stage2CommissionFormula?: string; // How to apply commission to sum (e.g., "sum * commissionRate / 100")
  stage3OutputRules?: CommissionOutputRule[]; // How to distribute the calculated values
}

export interface Rejection {
    jobId: string;
    reason: string;
    date: string;
    driverId: string;
}

export interface ApiEndpoint {
    method: 'GET' | 'POST';
    path: string;
    description: string;
}

export interface Transaction {
  id: string;
  datetime: string; // ISO string
  type: 'Cash' | 'Card' | 'Account';
  amount: number;
}

export interface RewardScheme {
    id: string;
    title: string;
    description: string;
    currentProgress: number; // Note: This might be deprecated in favor of participant-specific progress
    target: number;
    rewardDescription: string;
    eligibilityRules: string[];
    participantIds: string[];
    termsSummary?: string;
    termsUrl?: string;
}

export interface Promotion {
    id: string;
    title: string;
    description: string;
    callToAction: string;
    eligibilityRules: string[];
    participantIds: string[];
    termsSummary?: string;
    termsUrl?: string;
}

export interface PartnerOffer {
    id: string;
    partnerName: string;
    title: string;
    description: string;
    promoCode: string;
    eligibilityRules: string[];
    participantIds: string[];
    offerUrl?: string;
}

export interface PromotionParticipant {
    id: string;
    promotionId: string; // Links to RewardScheme, Promotion, or PartnerOffer id
    driverId: string;
    status: 'Active' | 'Completed' | 'Removed';
    progress: number;
    joinDate: string; // ISO Date string
    notes?: string;
    referredDriverId?: string; // Specific to referral promotions
}


export type FaqCategory = 'General' | 'Payments' | 'Using the App' | 'Training Materials';

export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: FaqCategory;
    videoUrl?: string;
    documentUrl?: string;
}

export interface OfficeHours {
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    isOff: boolean;
    start: string; // "HH:mm"
    end: string;   // "HH:mm"
    location?: string;
}

export type StaffSource = 'Google Workspace' | 'Manual';
export type StaffStatus = 'Active' | 'Pending Permissions' | 'Deactivated';

export type PermissionLevel = 'hidden' | 'view' | 'edit';

export interface PermissionNode {
  id: string;
  name: string;
  children?: PermissionNode[];
}

export interface PermissionTemplate {
    id: string;
    name: string;
    permissions: Record<string, PermissionLevel>;
}

export interface StaffMember {
    id: string;
    name: string;
    email: string;
    title: string;
    avatarUrl: string;
    officeHours: OfficeHours[];
    templateId: string;
    source: StaffSource;
    status: StaffStatus;
    siteIds?: string[]; // Optional site assignments (empty/undefined = main company); enables site-specific messaging & permissions
}

export interface ShortcutLink {
    id: string;
    title: string;
    description: string;
    url: string;
    isCopyable: boolean;
}

export interface StaffNotice {
    id: string;
    title: string;
    content: string;
    author: string;
    date: string; // ISO Date string
    isRead: boolean;
}

export interface VehiclePendingChanges {
    registrationUpdate?: DocumentUpdateRequest;
    plateUpdate?: DocumentUpdateRequest;
    insuranceUpdate?: DocumentUpdateRequest;
    motUpdate?: DocumentUpdateRequest;
    roadTaxExpiry?: string;
}

export interface VehicleInspection {
  id: string;
  date: string; // ISO string
  inspectorName: string;
  notes: string;
  passed: boolean;
  checklist: {
    tires: boolean;
    brakes: boolean;
    lights: boolean;
    bodywork: boolean;
  };
}

export interface VehicleMaintenance {
  id: string;
  date: string; // ISO string
  garage: string;
  description: string;
  cost: number;
  invoiceUrl?: string;
}

export interface Vehicle {
    id: string; // Vehicle Ref
    status: 'Active' | 'Inactive' | 'Archived';
    registration: string;
    make: string;
    model: string;
    color: string;
    firstRegistrationDate: string; // ISO date
    v5cDocumentUrl?: string;
    plateType: 'Private Hire' | 'Hackney Carriage';
    plateIssuingCouncil: string;
    plateNumber: string;
    plateDocumentUrl?: string;
    plateExpiry: string; // ISO datetime
    insuranceCertificateNumber: string;
    insuranceDocumentUrl?: string;
    insuranceExpiry: string; // ISO datetime
    motComplianceCertificateUrl?: string;
    motComplianceExpiry: string; // ISO datetime
    roadTaxExpiry: string; // ISO datetime
    attributes: string[];
    ownershipType: 'Company' | 'Private' | 'Supplier';
    linkedDriverIds: string[];
    pendingChanges?: VehiclePendingChanges;
    siteId: string;
    inspections?: VehicleInspection[];
    maintenance?: VehicleMaintenance[];
}

export interface Booking {
  id: string; // Booking Ref
  customerId: string;
  driverId?: string;
  vehicleId?: string;
  pickupDateTime: string; // ISO string
  estimatedArrival?: string; // ISO string
  actualArrival?: string; // ISO string
  pickupAddress: string;
  vias: string[];
  destinationAddress: string;
  accountName?: string;
  attributes: string[]; // e.g., 'Wheelchair Accessible', 'Pet Friendly'
  extras?: string[]; // e.g., 'Extra Luggage', 'Meet & Greet'
  customerName: string;
  customerPhone: string;
  cost: number; // Driver's value
  price: number; // Customer's price
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';
  siteId: string;
  
  // Enhanced fields
  estimatedDuration: number; // minutes
  actualDuration?: number; // minutes
  routeDistance: number; // miles/km
  fuelSurcharge?: number;
  waitingTime?: number; // minutes
  cancellationReason?: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  paymentMethod: 'Cash' | 'Card' | 'Account' | 'App';
  specialInstructions?: string;
  pickupCoordinates: { lat: number; lng: number };
  destinationCoordinates: { lat: number; lng: number };
  feedback?: {
    driverRating?: number;
    customerRating?: number;
    comments?: string;
  };
}


export interface CustomerNote {
    date: string; // ISO string
    author: string; // Staff member name
    text: string;
}

export interface CustomerAddress {
  id: string;
  fullAddress: string;
  notes?: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    notes: CustomerNote[];
    priorityLevel: 'Normal' | 'High' | 'VIP';
    isBanned: boolean;
    bannedDriverIds: string[];
    accountCredit: number;
    loyaltyPoints: number;
    totalSpend: number;
    joinDate: string; // ISO string
    attributes: string[];
    addresses: CustomerAddress[];
}

export type FeeType = 'fixed' | '%' | 'none';
export type VatApplication = 'nothing' | 'serviceCharge' | 'serviceChargeAndPrice';
export type PaymentType = 'Cash' | 'Card' | 'Account';
export type ValidationType = 'None' | 'PIN' | 'Password' | 'Purchase Order';

// Invoice Template System
export type InvoiceColumnType = 
  | 'date' 
  | 'time' 
  | 'pickup' 
  | 'destination' 
  | 'distance' 
  | 'duration' 
  | 'fare' 
  | 'charges' 
  | 'tips' 
  | 'reference';

export type SummaryMethod = 'detailed' | 'summarized'; // detailed = line per journey, summarized = grouped by contract
export type SummaryTotalType = 'subtotal' | 'serviceCharge' | 'tax' | 'total' | 'payment';

export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  columns: InvoiceColumnType[];
  summaryMethod: SummaryMethod;
  summaryTotals: SummaryTotalType[];
  vatApplication: VatApplication;
  includeNotes: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
    id: string;
    name: string;
    phone: string;
    email: string;
    notes: CustomerNote[];
    priorityLevel: 'Normal' | 'High' | 'VIP';
    isBanned: boolean;
    bannedDriverIds: string[];
    outstandingBalance: number;
    totalSpend: number;
    joinDate: string; // ISO string
    
    // Original Account-specific fields
    invoiceSchedule: 'Weekly' | 'Monthly';
    paymentTerms: 'Net 7' | 'Net 14' | 'Net 30';
    validationTypes: ValidationType[];
    mainContactName: string;
    mainContactEmail: string;
    mainContactPhone: string;
    billingAddress: string;
    vatNumber?: string;
    allowedBookingAttributes: string[];
    maxBookingPrice?: number;
    
    // New editable fields
    invoiceEmailAddress?: string;
    allowedPaymentTypes?: PaymentType[];
    startDate?: string; // ISO string date
    endDate?: string | null; // ISO string date
    creditLimit?: number | null;
    invoiceTerms?: string;
    invoiceFields?: string[];
    invoiceTemplate?: string;
    invoiceFooter?: string;
    serviceChargeType?: FeeType;
    serviceChargeValue?: number;
    serviceChargeMinimum?: number;
    bookingFeeType?: FeeType;
    bookingFeeValue?: number;
    bookingFeeMinimum?: number;
    vatRate?: number;
    vatAppliesTo?: VatApplication;
    upliftType?: FeeType;
    upliftValue?: number;
    tags?: string[];
    siteId: string;
}


export interface CompanyDetails {
    name: string;
    logoUrl: string;
    address: string;
    registrationNumber: string;
    vatNumber: string;
}

export interface SiteDetails {
    id: string;
    name: string; // e.g., "Manchester (North)"
    address: string;
    bookingTel: string;
    officeEmail: string;
    areaManagerName: string;
    areaManagerEmail: string;
    officeHours: OfficeHours[];
    siteLogo?: string; // Optional site-specific logo; falls back to company logo if not set
    defaultInvoiceTemplates?: {
        driverInvoice: string; // Template ID for driver invoices
        factoringInvoice: string; // Template ID for factoring invoices
        standardInvoice: string; // Template ID for standard/account invoices
    };
}

export interface BaseApiConfig {
    id: string;
    name: string;
    baseUrl: string;
    authType: 'None' | 'API Key' | 'Bearer Token';
    apiKey?: string;
    bearerToken?: string;
    headerName?: string;
}

export interface EndpointDefinition {
    id: string;
    baseApiId: string;
    name: string;
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    description: string;
    schema: string; // JSON string
}

export interface WebhookDefinition {
    id: string;
    eventName: string;
    targetUrl: string;
    status: 'Active' | 'Inactive';
    bodyTemplate?: string; // JSON string
    headerTemplate?: string; // JSON string
    conditions?: string; // JS expression string
}

export interface WebhookEvent {
    id: string;
    name: string;
    description: string;
    // FIX: Add 'availableVariables' to match mock data and provide context for webhooks.
    availableVariables: Record<string, string[]>;
}

export interface TaskReminder {
  id: string;
  text: string;
  dueDate: string; // ISO date string
  isCompleted: boolean;
  authorId: string; // StaffMember ID
}

export type MessageTarget = 'Customer' | 'Driver' | 'Account' | 'Staff';

export interface MessageEvent {
    id: string;
    name: string;
    description: string;
    availablePlaceholders: string[];
}

export interface MessageTemplate {
    id: string;
    name: string;
    eventId: string;
    target: MessageTarget;
    content: string;
    conditions?: string;
    isNotice?: boolean; // For staff notices
    scheduledTime?: string; // ISO string for one-off scheduled messages
    deliveryMethod?: 'Default' | 'API';
    apiEndpointId?: string;
}

export type AttributeEligibility = 'Driver' | 'Vehicle' | 'Account' | 'Customer' | 'Booking';

export interface AttributePricing {
    type: 'none' | 'fixed' | '%';
    costEffect: number; // can be negative for discount
    priceEffect: number; // can be negative for discount
    applyCommission: boolean;
}

export interface AttributeCondition {
    autoApplyRule?: string; // e.g., "booking.destinationAddress.includes('Airport')"
    scheduleId?: string; // Link to a schedule template
}

export interface SystemAttribute {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    eligibility: AttributeEligibility[];
    pricing: AttributePricing;
    conditions: AttributeCondition;
}

export interface FinancialTransaction {
  id: string;
  type: 'Booking' | 'Commission' | 'Fee' | 'Refund' | 'Bonus' | 'Deduction';
  amount: number;
  currency: 'GBP' | 'EUR' | 'USD';
  description: string;
  bookingId?: string;
  driverId?: string;
  accountId?: string;
  timestamp: string; // ISO string
  status: 'Pending' | 'Completed' | 'Failed' | 'Cancelled';
  paymentMethod?: string;
  reference?: string;
  taxable: boolean;
  vatRate?: number;
  invoiceId?: string;
}

export interface HistoricInvoice {
  id: string;
  type: 'Driver' | 'Account';
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  periodStart: string;
  periodEnd: string;
  netAmount: number;
  grossAmount: number;
  commission: number;
  emailStatus: 'Sent' | 'Failed' | 'Pending';
  sentDate?: string;
  transactionIds?: string[];
}

export interface Notification {
  id: string;
  type: 'System' | 'DriverUpdate' | 'Message' | 'Compliance';
  title: string;
  description: string;
  timestamp: string; // ISO string
  isRead: boolean;
  link?: string; // e.g., link to a driver's profile
  linkText?: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDefinition {
  id: string; 
  label: string;
  type: 'select' | 'date-range';
  options?: FilterOption[];
}

export interface ActiveFilter {
  id: string;
  value: string;
  label: string; 
}

export interface SortConfig<T> {
    key: keyof T;
    direction: 'asc' | 'desc';
}

export interface ActivityEvent {
  id: string;
  type: 'New Booking' | 'New Driver' | 'System Alert' | 'Account Payment';
  description: string;
  timestamp: string; // ISO string
  actor?: string; // e.g., Staff member name
  link?: string;
}

export interface AutomationTrigger {
    id: string;
    name: string;
    description: string;
    // FIX: Change type to `Record<string, string[]>` to match mock data and intended usage.
    availableVariables: Record<string, string[]>;
}

export interface AutomationAction {
    id: string;
    name: string;
    description: string;
    parameters: {
        id: string;
        name: string;
        type: 'string' | 'number' | 'template' | 'attribute' | 'staffMember';
    }[];
}

export interface Automation {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    triggerId: string;
    conditions: string;
    actions: {
        actionId: string;
        parameters: Record<string, any>;
    }[];
}

export type ApplicationStatus = 'Submitted' | 'Under Review' | 'Contacted' | 'Meeting Scheduled' | 'Approved' | 'Rejected';

export interface ApplicationNote {
    date: string; // ISO string
    author: string; // Staff name
    text: string;
}

export interface ApplicationTask {
    id: string;
    createdAt: string; // ISO string
    author: string; // Staff name
    assignedToId: string; // Staff ID
    assignedToName: string;
    taskType: 'Re-contact' | 'Schedule F2F' | 'Check References' | 'Document Verification';
    dueDate?: string; // ISO string date
    notes?: string;
    isCompleted: boolean;
}

export interface ApplicationPendingChanges {
    firstName?: string;
    lastName?: string;
    email?: string;
    mobileNumber?: string;
    area?: string;

    // Vehicle details are strings
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleRegistration?: string;
    
    // Document updates
    badgeUpdate?: DocumentUpdateRequest;
    licenseUpdate?: DocumentUpdateRequest;
    v5cUpdate?: DocumentUpdateRequest;
    insuranceUpdate?: DocumentUpdateRequest;
}

export interface DriverApplication {
  id: string;
  applicationDate: string; // ISO string
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  area: string;
  isLicensed: boolean;
  status: ApplicationStatus;
  notes: ApplicationNote[];
  siteId: string;
  password?: string;
  tasks?: ApplicationTask[];
  
  // Optional licensed driver details
  badgeNumber?: string;
  badgeExpiry?: string;
  badgeIssuingCouncil?: string;
  drivingLicenseNumber?: string;
  drivingLicenseExpiry?: string;

  // Optional vehicle details
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleRegistration?: string;
  
  // Optional documents
  badgeDocumentName?: string;
  badgeDocumentUrl?: string;
  licenseDocumentName?: string;
  licenseDocumentUrl?: string;
  v5cDocumentName?: string;
  v5cDocumentUrl?: string;
  insuranceDocumentName?: string;
  insuranceDocumentUrl?: string;
  
  // Pending changes
  pendingChanges?: ApplicationPendingChanges;
}

// Dashboard Widget System
export type DashboardWidgetType = 
  | 'stat-card' 
  | 'bookings-trend' 
  | 'driver-status' 
  | 'top-drivers' 
  | 'top-accounts' 
  | 'ai-insights' 
  | 'activity-feed'
  | 'driver-metrics'
  | 'automation-breakdown'
  | 'call-staff-metrics'
  | 'payment-breakdown'
  | 'commission-breakdown'
  | 'fleet-utilization'
  | 'account-dispatch-summary';

export type StaffRole = 'accounts' | 'dispatch' | 'management' | 'driver-manager' | 'call-staff' | 'admin';

export interface DashboardWidget {
  id: string;
  type: DashboardWidgetType;
  title: string;
  description?: string;
  gridColumn?: number; // 1-12 for grid sizing
  gridRow?: number;
  width?: 'small' | 'medium' | 'large' | 'full';
  height?: 'small' | 'medium' | 'large';
  isVisible: boolean;
  isLocked?: boolean;
  config?: Record<string, any>; // Widget-specific configuration
}

export interface DashboardLayout {
  id: string;
  userId?: string;
  role: StaffRole;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardPreset {
  role: StaffRole;
  name: string;
  description: string;
  widgets: DashboardWidget[];
}
