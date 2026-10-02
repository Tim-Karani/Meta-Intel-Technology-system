import {
  User,
  Client,
  Location,
  Product,
  Campaign,
  Team,
  FormTemplate,
  Assignment,
  AttendanceRecord,
  FieldVisit,
  FieldIssue,
  AuditLogEntry
} from '../types';

import {
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_LOCATIONS,
  INITIAL_PRODUCTS,
  INITIAL_CAMPAIGNS,
  INITIAL_TEAMS,
  INITIAL_FORMS,
  INITIAL_ASSIGNMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_VISITS,
  INITIAL_ISSUES,
  INITIAL_AUDIT_LOGS
} from '../data/mockDatabase';

const STORAGE_KEYS = {
  USERS: 'mit_users',
  ACTIVE_USER: 'mit_active_user',
  CLIENTS: 'mit_clients',
  LOCATIONS: 'mit_locations',
  PRODUCTS: 'mit_products',
  CAMPAIGNS: 'mit_campaigns',
  TEAMS: 'mit_teams',
  FORMS: 'mit_forms',
  ASSIGNMENTS: 'mit_assignments',
  ATTENDANCE: 'mit_attendance',
  VISITS: 'mit_visits',
  ISSUES: 'mit_issues',
  AUDIT_LOGS: 'mit_audit_logs',
  OFFLINE_QUEUE: 'mit_offline_queue'
};

class StorageService {
  private listeners: (() => void)[] = [];

  constructor() {
    this.initDefaults();
  }

  private initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_USER)) {
      // Default to Operations Manager for full administrative view
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(INITIAL_USERS[1]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOCATIONS)) {
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(INITIAL_LOCATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CAMPAIGNS)) {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(INITIAL_CAMPAIGNS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TEAMS)) {
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FORMS)) {
      localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(INITIAL_FORMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(INITIAL_ASSIGNMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VISITS)) {
      localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(INITIAL_VISITS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ISSUES)) {
      localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(INITIAL_ISSUES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE)) {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // Active User / Role Switching
  public getActiveUser(): User {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    return raw ? JSON.parse(raw) : INITIAL_USERS[1];
  }

  public setActiveUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
    this.logAction('USER_SWITCHED_SESSION', 'Authentication', user.id, user.name, `Active session switched to ${user.name} (${user.role})`);
    this.notify();
  }

  // Users
  public getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  }

  public addUser(user: User) {
    const users = this.getUsers();
    users.unshift(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.logAction('USER_CREATED', 'Workforce Management', user.id, user.name, `Created workforce member ${user.name} (${user.role})`);
    this.notify();
  }

  // Clients
  public getClients(): Client[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return raw ? JSON.parse(raw) : INITIAL_CLIENTS;
  }

  public addClient(client: Client) {
    const clients = this.getClients();
    clients.unshift(client);
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    this.logAction('CLIENT_CREATED', 'Client Management', client.id, client.name, `New client registered: ${client.name}`);
    this.notify();
  }

  // Locations
  public getLocations(): Location[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    return raw ? JSON.parse(raw) : INITIAL_LOCATIONS;
  }

  public addLocation(location: Location) {
    const locations = this.getLocations();
    locations.unshift(location);
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
    this.logAction('LOCATION_CREATED', 'Master Locations', location.id, location.name, `Registered new location ${location.name} in ${location.county}`);
    this.notify();
  }

  public updateLocation(location: Location) {
    const locations = this.getLocations().map(l => l.id === location.id ? location : l);
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
    this.logAction('LOCATION_UPDATED', 'Master Locations', location.id, location.name, `Updated geofence & contact for ${location.name}`);
    this.notify();
  }

  // Products
  public getProducts(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return raw ? JSON.parse(raw) : INITIAL_PRODUCTS;
  }

  public addProduct(product: Product) {
    const products = this.getProducts();
    products.unshift(product);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify();
  }

  // Campaigns
  public getCampaigns(): Campaign[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
    return raw ? JSON.parse(raw) : INITIAL_CAMPAIGNS;
  }

  public addCampaign(campaign: Campaign) {
    const campaigns = this.getCampaigns();
    campaigns.unshift(campaign);
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
    this.logAction('CAMPAIGN_CREATED', 'Campaign Management', campaign.id, campaign.name, `Initialized campaign ${campaign.name} for ${campaign.clientName}`);
    this.notify();
  }

  public updateCampaignStatus(campaignId: string, status: Campaign['status']) {
    const campaigns = this.getCampaigns().map(c => {
      if (c.id === campaignId) {
        return { ...c, status };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
    this.logAction('CAMPAIGN_STATUS_UPDATED', 'Campaign Management', campaignId, campaignId, `Status transitioned to ${status}`);
    this.notify();
  }

  // Teams
  public getTeams(): Team[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TEAMS);
    return raw ? JSON.parse(raw) : INITIAL_TEAMS;
  }

  public addTeam(team: Team) {
    const teams = this.getTeams();
    teams.unshift(team);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    this.logAction('TEAM_CREATED', 'Team Management', team.id, team.name, `Created field team ${team.name} under ${team.supervisorName}`);
    this.notify();
  }

  // Forms
  public getForms(): FormTemplate[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FORMS);
    return raw ? JSON.parse(raw) : INITIAL_FORMS;
  }

  public addForm(form: FormTemplate) {
    const forms = this.getForms();
    forms.unshift(form);
    localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(forms));
    this.logAction('FORM_TEMPLATE_CREATED', 'Dynamic Form Builder', form.id, form.title, `Published form template ${form.title} v${form.version}`);
    this.notify();
  }

  // Assignments
  public getAssignments(): Assignment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    return raw ? JSON.parse(raw) : INITIAL_ASSIGNMENTS;
  }

  public addAssignment(assignment: Assignment) {
    const assignments = this.getAssignments();
    assignments.unshift(assignment);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    this.logAction('ASSIGNMENT_CREATED', 'Operations Dispatch', assignment.id, assignment.locationName, `Assigned ${assignment.agentName} to ${assignment.locationName}`);
    this.notify();
  }

  public updateAssignmentStatus(assignmentId: string, status: Assignment['status']) {
    const assignments = this.getAssignments().map(a => a.id === assignmentId ? { ...a, status } : a);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    this.notify();
  }

  // Attendance
  public getAttendance(): AttendanceRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return raw ? JSON.parse(raw) : INITIAL_ATTENDANCE;
  }

  public recordClockIn(record: AttendanceRecord) {
    const attendance = this.getAttendance();
    attendance.unshift(record);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
    this.logAction('ATTENDANCE_CLOCK_IN', 'Field Attendance', record.id, record.agentName, `Clock-in recorded at ${record.locationName} (Distance: ${Math.round(record.distanceFromAssignedMeters)}m)`);
    this.notify();
  }

  // Visits
  public getVisits(): FieldVisit[] {
    const raw = localStorage.getItem(STORAGE_KEYS.VISITS);
    return raw ? JSON.parse(raw) : INITIAL_VISITS;
  }

  public submitVisit(visit: FieldVisit) {
    const visits = this.getVisits();
    // Check for idempotency UUID
    const existingIndex = visits.findIndex(v => v.clientUuid === visit.clientUuid);
    if (existingIndex >= 0) {
      visits[existingIndex] = visit;
    } else {
      visits.unshift(visit);
    }
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));

    // Update assignment if linked
    if (visit.assignmentId) {
      this.updateAssignmentStatus(visit.assignmentId, 'completed');
    }

    this.logAction('VISIT_SUBMITTED', 'Field Operations', visit.id, visit.locationName, `Visit submitted by ${visit.agentName} (Fraud Score: ${visit.fraudRiskScore})`);
    this.notify();
  }

  public verifyVisit(visitId: string, status: 'approved' | 'rejected', reason?: string) {
    const activeUser = this.getActiveUser();
    const visits = this.getVisits().map(v => {
      if (v.id === visitId) {
        return {
          ...v,
          status,
          verifiedBy: activeUser.id,
          verifiedAt: new Date().toISOString(),
          rejectionReason: reason
        };
      }
      return v;
    });
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
    this.logAction(
      status === 'approved' ? 'VISIT_APPROVED' : 'VISIT_REJECTED',
      'Quality Assurance',
      visitId,
      visitId,
      `Supervisor ${activeUser.name} marked visit ${status}. ${reason ? 'Reason: ' + reason : ''}`
    );
    this.notify();
  }

  // Issues
  public getIssues(): FieldIssue[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ISSUES);
    return raw ? JSON.parse(raw) : INITIAL_ISSUES;
  }

  public addIssue(issue: FieldIssue) {
    const issues = this.getIssues();
    issues.unshift(issue);
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
    this.logAction('FIELD_ISSUE_RAISED', 'Incident Center', issue.id, issue.title, `Field issue logged: ${issue.title} (${issue.priority.toUpperCase()})`);
    this.notify();
  }

  public updateIssueStatus(issueId: string, status: FieldIssue['status'], notes?: string) {
    const issues = this.getIssues().map(iss => {
      if (iss.id === issueId) {
        return {
          ...iss,
          status,
          resolutionNotes: notes || iss.resolutionNotes
        };
      }
      return iss;
    });
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
    this.logAction('ISSUE_STATUS_CHANGED', 'Incident Center', issueId, issueId, `Issue marked ${status}`);
    this.notify();
  }

  // Audit Logs
  public getAuditLogs(): AuditLogEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : INITIAL_AUDIT_LOGS;
  }

  public logAction(action: string, module: string, entityId: string, entityTitle: string, diffSummary: string) {
    const activeUser = this.getActiveUser();
    const logs = this.getAuditLogs();
    const entry: AuditLogEntry = {
      id: 'aud_' + Date.now().toString(36),
      userId: activeUser.id,
      userName: activeUser.name,
      userRole: activeUser.role,
      action,
      module,
      entityId,
      entityTitle,
      diffSummary,
      ipAddress: '197.232.' + Math.floor(Math.random() * 200 + 10) + '.' + Math.floor(Math.random() * 250 + 1),
      timestamp: new Date().toISOString()
    };
    logs.unshift(entry);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 200)));
  }

  // Reset to clean seed data
  public resetToSeed() {
    localStorage.clear();
    this.initDefaults();
    this.notify();
  }
}

export const storageService = new StorageService();
