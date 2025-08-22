// Staff Management Types for FibreFlow
// Based on Angular Firebase implementation

import { Timestamp } from 'firebase/firestore';

export interface StaffMember {
  id?: string;
  
  // Personal Information
  name: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  
  // Employment Details
  employeeId: string;
  position: Position | string; // Allow Position enum or custom string
  department: Department;
  level?: StaffLevel; // Optional for backward compatibility
  status: StaffStatus;
  
  // Manager/Reporting
  managerId?: string;
  managerName?: string;
  reportsTo?: string;
  
  // Skills and Certifications
  skills: Skill[];
  certifications: Certification[];
  experienceYears: number;
  specializations: string[];
  
  // Contact Information
  address: string;
  city: string;
  province: string;
  postalCode: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  
  // Employment Terms
  startDate: Timestamp;
  endDate?: Timestamp;
  contractType: ContractType;
  salaryGrade?: string;
  hourlyRate?: number;
  
  // Availability and Scheduling
  workingHours: string;
  availableWeekends: boolean;
  availableNights: boolean;
  timeZone: string;
  
  // Project Assignments (current active projects)
  activeProjectIds: string[];
  currentProjectCount: number;
  maxProjectCount: number;
  
  // Performance Metrics
  totalProjectsCompleted: number;
  averageProjectRating: number;
  onTimeCompletionRate: number;
  
  // Equipment and Tools
  assignedEquipment: Equipment[];
  vehicleAssigned?: string;
  toolsAssigned: string[];
  
  // Training and Development
  trainingRecords: TrainingRecord[];
  nextTrainingDue?: Timestamp;
  safetyTrainingExpiry?: Timestamp;
  
  // Notes and Comments
  notes?: string;
  performanceNotes?: string;
  
  // Audit Fields
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastModifiedBy: string;
  
  // Profile
  profilePhotoUrl?: string;
  bio?: string;
}

// Enums

export enum Department {
  MANAGEMENT = 'management',
  PROJECT_MANAGEMENT = 'project_management',
  FIELD_OPERATIONS = 'field_operations',
  NETWORK_OPERATIONS = 'network_operations',
  ENGINEERING = 'engineering',
  INSTALLATION = 'installation',
  MAINTENANCE = 'maintenance',
  QUALITY_ASSURANCE = 'quality_assurance',
  TECHNICAL_SUPPORT = 'technical_support',
  SALES = 'sales',
  CUSTOMER_SERVICE = 'customer_service',
  LOGISTICS = 'logistics',
  ADMINISTRATION = 'administration',
  FINANCE = 'finance',
  HR = 'hr',
  IT = 'it',
  SAFETY = 'safety',
}

// Position enum for standardized roles
export enum Position {
  PROJECT_MANAGER = 'Project Manager',
  SENIOR_PROJECT_MANAGER = 'Senior Project Manager',
  SITE_SUPERVISOR = 'Site Supervisor',
  FIELD_TECHNICIAN = 'Field Technician',
  SENIOR_TECHNICIAN = 'Senior Technician',
  CABLE_JOINTER = 'Cable Jointer',
  FIBRE_SPLICER = 'Fibre Splicer',
  NETWORK_ENGINEER = 'Network Engineer',
  QUALITY_INSPECTOR = 'Quality Inspector',
  SAFETY_OFFICER = 'Safety Officer',
  TEAM_LEAD = 'Team Lead',
  OPERATIONS_MANAGER = 'Operations Manager',
  CONSTRUCTION_MANAGER = 'Construction Manager',
  LOGISTICS_COORDINATOR = 'Logistics Coordinator',
  ADMIN_ASSISTANT = 'Administrative Assistant',
  DATA_CAPTURER = 'Data Capturer',
  DRIVER = 'Driver',
  GENERAL_WORKER = 'General Worker',
  INTERN = 'Intern',
  OTHER = 'Other'
}

// Keep StaffLevel for backward compatibility but mark as deprecated
/**
 * @deprecated Use Position enum instead
 */
export enum StaffLevel {
  INTERN = 'intern',
  JUNIOR = 'junior',
  INTERMEDIATE = 'intermediate',
  SENIOR = 'senior',
  LEAD = 'lead',
  MANAGER = 'manager',
  SENIOR_MANAGER = 'senior_manager',
  DIRECTOR = 'director',
  EXECUTIVE = 'executive',
}

export enum StaffStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
  RESIGNED = 'resigned',
  RETIRED = 'retired',
}

export enum ContractType {
  PERMANENT = 'permanent',
  CONTRACT = 'contract',
  TEMPORARY = 'temporary',
  FREELANCE = 'freelance',
  INTERN = 'intern',
  CONSULTANT = 'consultant',
}

export enum Skill {
  // Technical Skills
  FIBRE_SPLICING = 'fibre_splicing',
  OTDR_TESTING = 'otdr_testing',
  POWER_METER_TESTING = 'power_meter_testing',
  CABLE_INSTALLATION = 'cable_installation',
  POLE_INSTALLATION = 'pole_installation',
  TRENCHING = 'trenching',
  DUCT_INSTALLATION = 'duct_installation',
  
  // Network Skills
  NETWORK_DESIGN = 'network_design',
  NETWORK_CONFIGURATION = 'network_configuration',
  TROUBLESHOOTING = 'troubleshooting',
  MAINTENANCE = 'maintenance',
  
  // Project Management
  PROJECT_MANAGEMENT = 'project_management',
  TEAM_LEADERSHIP = 'team_leadership',
  PLANNING = 'planning',
  COORDINATION = 'coordination',
  
  // Safety and Compliance
  SAFETY_PROTOCOLS = 'safety_protocols',
  QUALITY_CONTROL = 'quality_control',
  COMPLIANCE = 'compliance',
  
  // Customer Service
  CUSTOMER_RELATIONS = 'customer_relations',
  COMMUNICATION = 'communication',
  PROBLEM_SOLVING = 'problem_solving',
}

export interface Certification {
  name: string;
  issuedBy: string;
  issuedDate: Timestamp;
  expiryDate?: Timestamp;
  certificateNumber?: string;
  status: CertificationStatus;
}

export enum CertificationStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  PENDING_RENEWAL = 'pending_renewal',
  SUSPENDED = 'suspended',
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  serialNumber?: string;
  assignedDate: Timestamp;
  condition: EquipmentCondition;
  returnDate?: Timestamp;
}

export enum EquipmentType {
  VEHICLE = 'vehicle',
  TOOL = 'tool',
  TESTING_DEVICE = 'testing_device',
  SAFETY_EQUIPMENT = 'safety_equipment',
  LAPTOP = 'laptop',
  PHONE = 'phone',
  TABLET = 'tablet',
  OTHER = 'other',
}

export enum EquipmentCondition {
  NEW = 'new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  DAMAGED = 'damaged',
  NEEDS_REPAIR = 'needs_repair',
}

export interface TrainingRecord {
  id: string;
  trainingName: string;
  trainingType: TrainingType;
  provider: string;
  completedDate: Timestamp;
  expiryDate?: Timestamp;
  certificateUrl?: string;
  score?: number;
  status: TrainingStatus;
}

export enum TrainingType {
  SAFETY = 'safety',
  TECHNICAL = 'technical',
  MANAGEMENT = 'management',
  COMPLIANCE = 'compliance',
  SOFT_SKILLS = 'soft_skills',
  CERTIFICATION = 'certification',
}

export enum TrainingStatus {
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
  SCHEDULED = 'scheduled',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

// Form Types

export interface StaffFormData {
  id?: string; // For editing
  name: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  employeeId: string;
  position: Position | string;
  department: Department | string; // Allow string for new departments
  level?: StaffLevel;
  bio?: string;
  specializations?: string[];
  status: StaffStatus;
  managerId?: string;
  reportsTo?: string; // Employee ID of manager
  skills: Skill[];
  experienceYears: number;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  startDate: Date;
  endDate?: Date;
  contractType: ContractType;
  salaryGrade?: string;
  hourlyRate?: number;
  workingHours: string;
  availableWeekends: boolean;
  availableNights: boolean;
  timeZone: string;
  maxProjectCount: number;
  notes?: string;
}

// Filter Types

export interface StaffFilter {
  department?: Department[];
  level?: StaffLevel[];
  status?: StaffStatus[];
  skills?: Skill[];
  contractType?: ContractType[];
  managerId?: string;
  city?: string;
  province?: string;
  availableWeekends?: boolean;
  availableNights?: boolean;
  searchTerm?: string;
}

// Summary Types

export interface StaffSummary {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  onLeaveStaff: number;
  availableStaff?: number;
  monthlyGrowth?: number;
  averageProjectLoad?: number;
  staffByDepartment: { [key: string]: number };
  staffByLevel: { [key: string]: number };
  staffBySkill: { [key: string]: number };
  staffByContractType?: { [key: string]: number };
  averageExperience: number;
  utilizationRate: number;
  overallocatedStaff: number;
  underutilizedStaff: number;
  topPerformers?: any[];
  topSkills?: any[];
}

// Dropdown Data Types for UI

export interface StaffDropdownOption {
  id: string;
  name: string;
  email: string;
  position: Position | string;
  department: Department;
  level?: StaffLevel; // Optional for backward compatibility
  status: StaffStatus;
  currentProjectCount: number;
  maxProjectCount: number;
}

// Project Assignment Types

export interface ProjectAssignment {
  id?: string;
  staffId: string;
  staffName: string;
  projectId: string;
  projectName: string;
  role: ProjectRole;
  startDate: Timestamp;
  endDate?: Timestamp;
  allocation: number; // Percentage of time allocated (0-100)
  status: AssignmentStatus;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export enum ProjectRole {
  PROJECT_MANAGER = 'project_manager',
  LEAD_ENGINEER = 'lead_engineer',
  SENIOR_TECHNICIAN = 'senior_technician',
  TECHNICIAN = 'technician',
  INSTALLER = 'installer',
  QUALITY_INSPECTOR = 'quality_inspector',
  SUPPORT = 'support',
  COORDINATOR = 'coordinator',
}

export enum AssignmentStatus {
  ASSIGNED = 'assigned',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
}

// Performance and Review Types

export interface PerformanceReview {
  id?: string;
  staffId: string;
  reviewerId: string;
  reviewerName: string;
  reviewPeriod: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
  overallRating: number; // 1-5 scale
  technicalSkills: number;
  communication: number;
  reliability: number;
  teamwork: number;
  problemSolving: number;
  comments: string;
  goals: string[];
  improvements: string[];
  achievements: string[];
  reviewDate: Timestamp;
  nextReviewDate: Timestamp;
  status: ReviewStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export enum ReviewStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  COMPLETED = 'completed',
  ACKNOWLEDGED = 'acknowledged',
}

// Timesheet Types

export interface Timesheet {
  id?: string;
  staffId: string;
  staffName: string;
  projectId?: string;
  projectName?: string;
  date: Timestamp;
  hoursWorked: number;
  workType: WorkType;
  description: string;
  location?: string;
  approvedBy?: string;
  approvedDate?: Timestamp;
  status: TimesheetStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export enum WorkType {
  REGULAR = 'regular',
  OVERTIME = 'overtime',
  WEEKEND = 'weekend',
  NIGHT_SHIFT = 'night_shift',
  TRAINING = 'training',
  MEETING = 'meeting',
  TRAVEL = 'travel',
  ADMIN = 'admin',
}

export enum TimesheetStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
}

// Import Types for CSV/Excel

export interface StaffImportRow {
  name: string;
  email: string;
  phone?: string;
  alternativePhone?: string;
  employeeId?: string;
  position?: string;
  department?: string;
  level?: string;
  status?: string;
  skills?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  startDate?: string;
  contractType?: string;
  workingHours?: string;
}

export interface StaffImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: StaffImportError[];
  staffMembers: StaffMember[];
}

export interface StaffImportError {
  row: number;
  field: string;
  message: string;
  value?: any;
}