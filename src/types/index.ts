// Master domain types for Meta Intel Technologies Field Operations Platform

export type UserRole = 
  | 'system_admin'
  | 'ops_manager'
  | 'campaign_manager'
  | 'supervisor'
  | 'field_agent'
  | 'client_user';

export type AgentSubtype = 
  | 'brand_ambassador'
  | 'merchandiser'
  | 'sales_rep'
  | 'field_auditor'
  | 'promoter';

export type CampaignStatus = 
  | 'draft'
  | 'planned'
  | 'active'
  | 'paused'
  | 'completed'
  | 'archived';

export type ActivityType = 
  | 'merchandising'
  | 'sampling'
  | 'brand_activation'
  | 'sales_drive'
  | 'store_audit'
  | 'osa_audit'
  | 'posm_deployment'
  | 'roadshow';

export type LocationCategory = 
  | 'modern_trade' // Supermarket, Hypermarket
  | 'general_trade' // Duka, Kiosk, Wholesaler
  | 'on_premise' // Bar, Restaurant, Lounge
  | 'outdoor' // Bus park, Open market, Campus
  | 'event_venue';

export type AssignmentStatus = 
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'cancelled';

export type VisitStatus = 
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'draft_offline';

export type GeofenceStatus = 
  | 'inside_geofence'
  | 'outside_warning'
  | 'outside_rejected';

export type AttendanceStatus = 
  | 'present'
  | 'late'
  | 'absent'
  | 'approved_leave'
  | 'off_duty';

export type IssueCategory = 
  | 'stock_out'
  | 'posm_damaged'
  | 'store_closed'
  | 'access_denied'
  | 'competitor_activity'
  | 'pricing_dispute'
  | 'technical';

export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

export type IssueStatus = 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed';

export type QuestionType = 
  | 'short_text'
  | 'long_text'
  | 'number'
  | 'currency_kes'
  | 'yes_no'
  | 'single_select'
  | 'multi_select'
  | 'dropdown'
  | 'rating_5'
  | 'percentage'
  | 'photo'
  | 'signature'
  | 'barcode'
  | 'date'
  | 'product_audit';

export interface User {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  agentSubtype?: AgentSubtype;
  supervisorId?: string;
  supervisorName?: string;
  clientId?: string;
  clientName?: string;
  avatarUrl?: string;
  isActive: boolean;
  assignedCampaignIds: string[];
  assignedTeamId?: string;
  territoryId?: string;
  lastLoginAt?: string;
  currentDevice?: {
    model: string;
    osVersion: string;
    appVersion: string;
    isDeviceTrusted: boolean;
  };
}

export interface Client {
  id: string;
  code: string;
  name: string;
  industry: string;
  primaryContactName: string;
  email: string;
  phone: string;
  address: string;
  county: string;
  status: 'active' | 'inactive';
  activeCampaignsCount: number;
  totalBudgetKes: number;
  notes?: string;
  createdAt: string;
}

export interface Location {
  id: string;
  code: string;
  name: string;
  category: LocationCategory;
  county: string;
  subCounty: string;
  town: string;
  address: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  contactPerson?: string;
  contactPhone?: string;
  isActive: boolean;
  channelType: string;
  averageComplianceScore?: number;
}

export interface Product {
  id: string;
  brand: string;
  category: string;
  name: string;
  sku: string;
  barcode: string;
  unit: string; // e.g. "Pack of 6", "500ml Can", "1kg Bag"
  recommendedRetailPriceKes: number;
  isActive: boolean;
}

export interface Activity {
  id: string;
  campaignId: string;
  name: string;
  type: ActivityType;
  description: string;
  startDate: string;
  endDate: string;
  targetVisitsCount: number;
  formId?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Campaign {
  id: string;
  code: string;
  name: string;
  clientId: string;
  clientName: string;
  type: string;
  description: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  managerId: string;
  managerName: string;
  budgetKes: number;
  targetVisits: number;
  completedVisits: number;
  attendanceRate: number; // percentage
  osaScore: number; // percentage
  salesTotalKes: number;
  activities: Activity[];
  assignedTeamIds: string[];
  productIds: string[];
  locationIds: string[];
}

export interface Team {
  id: string;
  name: string;
  supervisorId: string;
  supervisorName: string;
  territory: string;
  county: string;
  memberIds: string[];
  activeCampaignIds: string[];
  isActive: boolean;
}

export interface FormQuestion {
  id: string;
  section: string;
  questionText: string;
  questionType: QuestionType;
  isRequired: boolean;
  options?: string[];
  scoreWeight?: number;
  conditionalOnQuestionId?: string;
  conditionalExpectedValue?: string;
  helpText?: string;
}

export interface FormTemplate {
  id: string;
  title: string;
  category: string;
  version: number;
  sections: string[];
  questions: FormQuestion[];
  isPublished: boolean;
  createdAt: string;
}

export interface Assignment {
  id: string;
  campaignId: string;
  campaignName: string;
  activityId: string;
  activityName: string;
  locationId: string;
  locationName: string;
  locationCategory: LocationCategory;
  locationAddress: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  agentId: string;
  agentName: string;
  scheduledDate: string;
  status: AssignmentStatus;
  targetSalesKes?: number;
  notes?: string;
  formId: string;
}

export interface AttendanceRecord {
  id: string;
  agentId: string;
  agentName: string;
  campaignId: string;
  campaignName: string;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
  clockInLat: number;
  clockInLng: number;
  clockInAccuracy: number;
  locationName: string;
  distanceFromAssignedMeters: number;
  status: AttendanceStatus;
  isGeofenceCompliant: boolean;
  supervisorOverrideApproved?: boolean;
}

export interface VisitResponseAnswer {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  answer: string | number | boolean | string[];
}

export interface OSARecord {
  productId: string;
  productName: string;
  sku: string;
  isAvailable: boolean;
  outOfStockReason?: string;
  currentShelfPriceKes?: number;
  facingsCount: number;
  competitorFacingsCount: number;
  posmPresent: boolean;
}

export interface SalesRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceKes: number;
  totalPriceKes: number;
  paymentMethod: 'cash' | 'mpesa' | 'credit';
  mpesaReference?: string;
}

export interface VisitEvidence {
  id: string;
  visitId: string;
  photoUrl: string;
  caption: string;
  capturedAt: string;
  latitude: number;
  longitude: number;
  tag: 'before_merchandising' | 'after_merchandising' | 'posm_display' | 'competitor_activity' | 'store_front';
}

export interface FieldVisit {
  id: string;
  clientUuid: string; // Idempotency token
  assignmentId?: string;
  campaignId: string;
  campaignName: string;
  activityId: string;
  activityName: string;
  locationId: string;
  locationName: string;
  locationCounty: string;
  locationLat: number;
  locationLng: number;
  agentId: string;
  agentName: string;
  visitDate: string;
  checkInTime: string;
  checkOutTime?: string;
  checkInLat: number;
  checkInLng: number;
  checkInAccuracyMeters: number;
  distanceFromLocationMeters: number;
  geofenceStatus: GeofenceStatus;
  fraudRiskScore: number; // 0 - 100
  fraudFlags: string[];
  status: VisitStatus;
  formResponses: VisitResponseAnswer[];
  osaRecords: OSARecord[];
  salesRecords: SalesRecord[];
  evidencePhotos: VisitEvidence[];
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  isSynced: boolean;
}

export interface FieldIssue {
  id: string;
  campaignId: string;
  campaignName: string;
  locationId: string;
  locationName: string;
  agentId: string;
  agentName: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  title: string;
  description: string;
  reportedAt: string;
  photoUrl?: string;
  assignedSupervisorName?: string;
  resolutionNotes?: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string; // e.g. "CAMPAIGN_STATUS_UPDATED", "VISIT_VERIFIED"
  module: string;
  entityId: string;
  entityTitle: string;
  diffSummary: string;
  ipAddress: string;
  timestamp: string;
}
