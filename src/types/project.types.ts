// Project Management Types for FibreFlow
// Based on 4-Level Hierarchy: Project > Phase > Step > Task

import { Timestamp } from 'firebase/firestore';

// Main Project Interface
export interface Project {
  id?: string;
  projectCode: string; // Unique project identifier
  name: string;
  description: string;

  // Client Information
  clientId: string;
  clientName: string;
  clientOrganization: string;
  clientContact: string;
  clientEmail: string;
  clientPhone: string;

  // Project Details
  location: string;
  projectType: ProjectType;
  priorityLevel: Priority;
  status: ProjectStatus;
  currentPhase: PhaseType;
  currentPhaseName?: string;

  // Dates
  startDate: Timestamp;
  expectedEndDate: Timestamp;
  actualEndDate?: Timestamp;

  // People
  projectManagerId: string;
  projectManagerName: string;
  teamIds?: string[];

  // Financial
  budget: number;
  budgetUsed: number;
  actualCost?: number;

  // Progress Tracking
  overallProgress: number; // 0-100
  activeTasksCount: number;
  completedTasksCount: number;
  currentPhaseProgress: number; // 0-100

  // Work Constraints
  workingHours: string; // e.g., "8:00 AM - 5:00 PM"
  allowWeekendWork: boolean;
  allowNightWork: boolean;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastModifiedBy: string;
  metadata?: ProjectMetadata;
}

export interface Phase {
  id?: string;
  projectId: string;
  type: PhaseType;
  name: string;
  status: PhaseStatus;
  order: number;
  startDate?: Timestamp;
  endDate?: Timestamp;
  dependencies?: string[]; // IDs of dependent phases
  progress: number; // 0-100
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Step {
  id?: string;
  projectId: string;
  phaseId: string;
  name: string;
  description?: string;
  status: StepStatus;
  order: number;
  startDate?: Timestamp;
  endDate?: Timestamp;
  progress: number; // 0-100
  feedback?: string;
  assignedTeamId?: string;
  estimatedHours: number;
  actualHours?: number;
  dependencies?: string[]; // IDs of dependent steps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Task {
  id?: string;
  projectId: string;
  phaseId: string;
  stepId: string;
  name: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: Timestamp;
  completedDate?: Timestamp;
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: string[]; // IDs of dependent tasks
  attachments?: Attachment[];
  comments?: Comment[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Enums and Supporting Types

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ProjectType {
  FTTH = 'ftth', // Fiber to the Home
  FTTB = 'fttb', // Fiber to the Building
  FTTC = 'fttc', // Fiber to the Curb
  BACKBONE = 'backbone',
  LASTMILE = 'lastmile',
  ENTERPRISE = 'enterprise',
  MAINTENANCE = 'maintenance',
}

export enum PhaseType {
  PLANNING = 'planning',
  INITIATE_PROJECT = 'initiate_project',
  WORK_IN_PROGRESS = 'work_in_progress',
  HANDOVER = 'handover',
  HANDOVER_COMPLETE = 'handover_complete',
  FINAL_ACCEPTANCE = 'final_acceptance',
}

export enum PhaseStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

export enum StepStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
  SKIPPED = 'skipped',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Supporting Interfaces

export interface ProjectMetadata {
  fiberType?: string;
  totalDistance?: number; // in meters
  numberOfSites?: number;
  networkType?: string;
  tags?: string[];
  
  // KPI Targets with Daily Rates and Smart Start Dates
  kpiTargets?: ProjectKPITargets;
}

export interface ProjectKPITargets {
  // Core KPI Targets (Required)
  polePermissions: KPITarget; // Start immediately
  homeSignups: KPITarget; // Start immediately
  polesPlanted: KPITarget; // Start after permissions phase
  fibreStringing: KPITarget; // Start after poles planted
  trenchingMeters: KPITarget; // Start with civils phase
  homesConnected: KPITarget; // Start after fibre stringing
  
  // Calculated Project Timeline
  calculatedDuration?: number; // Total days based on targets
  estimatedEndDate?: Date; // Based on start date + duration
}

export interface KPITarget {
  // Target Values
  totalTarget: number; // Total quantity to complete
  dailyTarget: number; // Target per working day
  unit: string; // 'poles', 'meters', 'homes', etc.
  
  // Smart Start Logic
  startPhase: PhaseType; // When this KPI should start
  dependsOn?: string[]; // Other KPIs that must start first
  startDelayDays?: number; // Days after phase/dependency starts
  
  // Calculated Timeline
  estimatedDays?: number; // totalTarget / dailyTarget
  estimatedStartDate?: Date; // Calculated based on dependencies
  estimatedEndDate?: Date; // Start + estimated days
  
  // Progress Tracking (populated during project execution)
  actualStartDate?: Date; // When first KPI entry was made
  currentTotal?: number; // Current progress
  averageDailyActual?: number; // Actual daily rate so far
  onTrack?: boolean; // Is progress on schedule
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Timestamp | Date;
}

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

// Template Interfaces for Reusable Hierarchies

export interface ProjectTemplate {
  id?: string;
  name: string;
  description: string;
  phases: PhaseTemplate[];
  createdBy: string;
  createdAt: Timestamp | Date;
}

export interface PhaseTemplate {
  type: PhaseType;
  name: string;
  steps: StepTemplate[];
  order: number;
}

export interface StepTemplate {
  name: string;
  description?: string;
  tasks: TaskTemplate[];
  estimatedHours: number;
  order: number;
}

export interface TaskTemplate {
  name: string;
  description?: string;
  estimatedHours?: number;
  priority: Priority;
}

// Hierarchy Helper Types

export interface ProjectHierarchy extends Project {
  phases: PhaseHierarchy[];
}

export interface PhaseHierarchy extends Phase {
  steps: StepHierarchy[];
}

export interface StepHierarchy extends Step {
  tasks: Task[];
}

// Phase Configuration for Fiber Projects

export const FIBER_PROJECT_PHASES: PhaseTemplate[] = [
  {
    type: PhaseType.PLANNING,
    name: 'Planning',
    order: 1,
    steps: [
      {
        name: 'Site Survey',
        estimatedHours: 40,
        order: 1,
        tasks: [
          { name: 'Initial Site Assessment', priority: Priority.HIGH, estimatedHours: 8 },
          { name: 'Route Planning', priority: Priority.HIGH, estimatedHours: 16 },
          { name: 'Permit Requirements Analysis', priority: Priority.MEDIUM, estimatedHours: 16 },
        ],
      },
      {
        name: 'Design & Engineering',
        estimatedHours: 80,
        order: 2,
        tasks: [
          { name: 'Network Design', priority: Priority.HIGH, estimatedHours: 32 },
          { name: 'Bill of Materials', priority: Priority.HIGH, estimatedHours: 24 },
          { name: 'Technical Drawings', priority: Priority.MEDIUM, estimatedHours: 24 },
        ],
      },
    ],
  },
  {
    type: PhaseType.INITIATE_PROJECT,
    name: 'Initiate Project (IP)',
    order: 2,
    steps: [
      {
        name: 'Project Setup',
        estimatedHours: 20,
        order: 1,
        tasks: [
          { name: 'Kick-off Meeting', priority: Priority.HIGH, estimatedHours: 4 },
          { name: 'Resource Allocation', priority: Priority.HIGH, estimatedHours: 8 },
          { name: 'Budget Approval', priority: Priority.CRITICAL, estimatedHours: 8 },
        ],
      },
      {
        name: 'Permits & Approvals',
        estimatedHours: 160,
        order: 2,
        tasks: [
          { name: 'Submit Permit Applications', priority: Priority.CRITICAL, estimatedHours: 40 },
          { name: 'Wayleave Negotiations', priority: Priority.HIGH, estimatedHours: 80 },
          { name: 'Environmental Clearances', priority: Priority.MEDIUM, estimatedHours: 40 },
        ],
      },
    ],
  },
  {
    type: PhaseType.WORK_IN_PROGRESS,
    name: 'Work in Progress (WIP)',
    order: 3,
    steps: [
      {
        name: 'Civils',
        estimatedHours: 320,
        order: 1,
        tasks: [
          { name: 'Pole Permissions', priority: Priority.HIGH, estimatedHours: 80 },
          { name: 'Trenching', priority: Priority.HIGH, estimatedHours: 80 },
          { name: 'Duct Installation', priority: Priority.HIGH, estimatedHours: 80 },
          { name: 'Cable Laying', priority: Priority.CRITICAL, estimatedHours: 80 },
        ],
      },
      {
        name: 'Optical',
        estimatedHours: 160,
        order: 2,
        tasks: [
          { name: 'Fiber Splicing', priority: Priority.CRITICAL, estimatedHours: 60 },
          { name: 'OTDR Testing', priority: Priority.HIGH, estimatedHours: 40 },
          { name: 'Power Meter Testing', priority: Priority.HIGH, estimatedHours: 40 },
          { name: 'Documentation', priority: Priority.MEDIUM, estimatedHours: 20 },
        ],
      },
    ],
  },
  {
    type: PhaseType.HANDOVER,
    name: 'Handover',
    order: 4,
    steps: [
      {
        name: 'Quality Assurance',
        estimatedHours: 40,
        order: 1,
        tasks: [
          { name: 'End-to-End Testing', priority: Priority.CRITICAL, estimatedHours: 20 },
          { name: 'Quality Checklist', priority: Priority.HIGH, estimatedHours: 10 },
          { name: 'Punch List Items', priority: Priority.MEDIUM, estimatedHours: 10 },
        ],
      },
      {
        name: 'Documentation',
        estimatedHours: 30,
        order: 2,
        tasks: [
          { name: 'As-Built Drawings', priority: Priority.HIGH, estimatedHours: 12 },
          { name: 'Test Certificates', priority: Priority.HIGH, estimatedHours: 10 },
          { name: 'Handover Package', priority: Priority.HIGH, estimatedHours: 8 },
        ],
      },
    ],
  },
  {
    type: PhaseType.HANDOVER_COMPLETE,
    name: 'Handover Complete (HOC)',
    order: 5,
    steps: [
      {
        name: 'Client Acceptance',
        estimatedHours: 20,
        order: 1,
        tasks: [
          { name: 'Client Walkthrough', priority: Priority.HIGH, estimatedHours: 8 },
          { name: 'Sign-off Documents', priority: Priority.CRITICAL, estimatedHours: 8 },
          { name: 'Training Delivery', priority: Priority.MEDIUM, estimatedHours: 4 },
        ],
      },
    ],
  },
  {
    type: PhaseType.FINAL_ACCEPTANCE,
    name: 'Final Acceptance Certificate (FAC)',
    order: 6,
    steps: [
      {
        name: 'Project Closure',
        estimatedHours: 20,
        order: 1,
        tasks: [
          { name: 'Final Invoice', priority: Priority.HIGH, estimatedHours: 8 },
          { name: 'Warranty Documentation', priority: Priority.MEDIUM, estimatedHours: 8 },
          { name: 'Project Archive', priority: Priority.LOW, estimatedHours: 4 },
        ],
      },
    ],
  },
];

// Default KPI Target Configurations
export const DEFAULT_KPI_CONFIGURATIONS: { [key: string]: Partial<KPITarget> } = {
  polePermissions: {
    unit: 'permissions',
    startPhase: PhaseType.INITIATE_PROJECT,
    startDelayDays: 0, // Start immediately
  },
  homeSignups: {
    unit: 'homes',
    startPhase: PhaseType.INITIATE_PROJECT,
    startDelayDays: 0, // Start immediately with marketing
  },
  polesPlanted: {
    unit: 'poles',
    startPhase: PhaseType.WORK_IN_PROGRESS,
    dependsOn: ['polePermissions'],
    startDelayDays: 7, // Wait for permissions to get ahead
  },
  fibreStringing: {
    unit: 'meters',
    startPhase: PhaseType.WORK_IN_PROGRESS,
    dependsOn: ['polesPlanted'],
    startDelayDays: 14, // Wait for reasonable number of poles
  },
  trenchingMeters: {
    unit: 'meters',
    startPhase: PhaseType.WORK_IN_PROGRESS,
    startDelayDays: 0, // Can start with civils immediately
  },
  homesConnected: {
    unit: 'homes',
    startPhase: PhaseType.WORK_IN_PROGRESS,
    dependsOn: ['fibreStringing'],
    startDelayDays: 21, // Wait for fibre to be strung before connecting homes
  },
};

// Form Types for Creating/Editing
export interface ProjectFormData {
  projectCode: string;
  name: string;
  description: string;
  clientId: string;
  location: string;
  projectType: ProjectType;
  priorityLevel: Priority;
  status: ProjectStatus;
  startDate: Date;
  expectedEndDate: Date;
  projectManagerId: string;
  budget: number;
  workingHours: string;
  allowWeekendWork: boolean;
  allowNightWork: boolean;
}

// Filter Types for Lists
export interface ProjectFilter {
  status?: ProjectStatus[];
  projectType?: ProjectType[];
  priorityLevel?: Priority[];
  clientId?: string;
  projectManagerId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Summary Types for Dashboard
export interface ProjectSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  totalBudget: number;
  budgetUsed: number;
  averageProgress: number;
  projectsByType: Record<ProjectType, number>;
  projectsByStatus: Record<ProjectStatus, number>;
}