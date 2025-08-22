export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  
  // Dates
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  
  // Location & Client
  location: ProjectLocation;
  clientId: string;
  clientName?: string; // Populated from client data
  
  // Team & Resources
  projectManagerId: string;
  projectManagerName?: string; // Populated from staff data
  teamMembers: ProjectTeamMember[];
  
  // Progress & Metrics
  progress: ProjectProgress;
  plannedProgress?: number;
  actualProgress?: number;
  schedulePerformance?: number;
  costPerformance?: number;
  qualityScore?: number;
  budget: ProjectBudget;
  actualCost?: number;
  
  // Project Management
  phase?: string;
  milestones?: ProjectMilestone[];
  risks?: ProjectRisk[];
  
  // SOW & Documentation
  sowDocuments: SOWDocument[];
  documents?: ProjectDocument[];
  
  // Updates & Activity
  updates?: ProjectUpdate[];
  
  // Custom Fields
  metadata?: Record<string, any>;
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ProjectLocation {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  region?: string; // Cape Town, Johannesburg, etc.
}

export interface ProjectTeamMember {
  id?: string;
  staffId: string;
  name: string;
  role: string;
  position: string;
  email?: string;
  phone?: string;
  assignedDate: string;
  isActive: boolean;
  isLead?: boolean;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description?: string;
  dueDate: string;
  completedDate?: string;
  completed?: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
}

export interface ProjectRisk {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'low' | 'medium' | 'high';
  impact: string;
  mitigation?: string;
  status: 'identified' | 'mitigated' | 'resolved' | 'active';
  owner?: string;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  title: string;
  description: string;
  message?: string; // Alternative to description
  type: 'progress' | 'milestone' | 'issue' | 'change' | 'general';
  author?: string; // Alternative to createdByName
  date?: string; // Alternative to createdAt
  createdAt: string;
  createdBy: string;
  createdByName?: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  size?: number;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface ProjectProgress {
  overallPercentage: number;
  tasksCompleted: number;
  totalTasks: number;
  
  // Detailed progress by phase
  phases: ProjectPhase[];
  
  // KPIs
  polesInstalled: number;
  totalPoles: number;
  dropsCompleted: number;
  totalDrops: number;
  fibreCableInstalled: number; // in meters
  totalFibreCableRequired: number; // in meters
}

export interface ProjectPhase {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  progress: number;
  tasks: PhaseTask[];
}

export interface PhaseTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignedTo?: string;
  assignedToName?: string;
  dueDate?: string;
  completedDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: string[]; // Task IDs
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

export interface ProjectBudget {
  totalBudget: number;
  allocatedBudget: number;
  spentAmount: number;
  remainingBudget: number;
  currency: string; // 'ZAR'
  
  // Budget breakdown
  categories: BudgetCategory[];
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  description?: string;
}

export interface SOWDocument {
  id: string;
  name: string;
  type: SOWDocumentType;
  fileUrl: string;
  uploadDate: string;
  uploadedBy: string;
  uploadedByName?: string;
  version: number;
  status: DocumentStatus;
  description?: string;
  metadata?: {
    poleCount?: number;
    dropCount?: number;
    cableLength?: number;
    estimatedCost?: number;
  };
}

export enum SOWDocumentType {
  PROPOSAL = 'proposal',
  CONTRACT = 'contract',
  SOW = 'sow',
  TECHNICAL_SPEC = 'technical_spec',
  BUDGET = 'budget',
  SCHEDULE = 'schedule',
  REPORT = 'report',
  OTHER = 'other',
  // Project-specific types
  POLES = 'poles',
  DROPS = 'drops',
  FIBRE = 'fibre',
  GENERAL = 'general',
  SITE_SURVEY = 'site_survey',
  TECHNICAL_SPECS = 'technical_specs',
  CABLE = 'cable',
  EQUIPMENT = 'equipment',
}

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_REVIEW = 'needs_review',
}

// Query and filter types
export interface ProjectFilters {
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  clientId?: string;
  projectManagerId?: string;
  region?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  searchTerm?: string;
}

export interface ProjectSortOptions {
  field: 'name' | 'startDate' | 'endDate' | 'progress' | 'priority' | 'status';
  direction: 'asc' | 'desc';
}

export interface ProjectListQuery {
  filters?: ProjectFilters;
  sort?: ProjectSortOptions;
  page: number;
  limit: number;
}

// Form types
export interface CreateProjectRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  durationMonths?: number; // Duration in months for automatic end date calculation
  location: ProjectLocation;
  clientId: string;
  projectManagerId: string;
  priority: ProjectPriority;
  budget?: Partial<ProjectBudget>;
  teamMembers?: string[]; // Staff IDs
  metadata?: Record<string, any>;
  notes?: string; // Additional notes field
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: string;
  status?: ProjectStatus;
}

// Analytics types
export interface ProjectAnalytics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  
  // Progress metrics
  averageProgress: number;
  projectsOnSchedule: number;
  projectsDelayed: number;
  
  // Budget metrics
  totalBudget: number;
  totalSpent: number;
  budgetUtilization: number;
  projectsOverBudget: number;
  
  // Performance metrics
  averageProjectDuration: number; // in days
  onTimeCompletionRate: number; // percentage
  
  // By status breakdown
  statusBreakdown: {
    [K in ProjectStatus]: number;
  };
  
  // By priority breakdown
  priorityBreakdown: {
    [K in ProjectPriority]: number;
  };
}