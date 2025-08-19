// Scope of Work (SOW) Types for FibreFlow
// Based on Angular Firebase implementation analysis

import { Timestamp } from 'firebase/firestore';

// Core SOW Entity
export interface SOWData {
  id?: string;
  projectId: string;
  version: number;
  status: SOWStatus;
  
  // Data Collections
  poles: PoleData[];
  drops: DropData[];
  fibre: FibreData[];
  
  // Calculations and Aggregations
  calculations: SOWCalculations;
  estimatedDays: number;
  totalCost: number;
  
  // Import Metadata
  importSummary: ImportSummary;
  validationResults: ValidationResults;
  
  // Audit Fields
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastModifiedBy: string;
}

export enum SOWStatus {
  DRAFT = 'draft',
  VALIDATED = 'validated',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Pole Data Structure
export interface PoleData {
  id?: string;
  projectId: string;
  
  // Core Identifiers
  label_1: string;        // Unique pole number (e.g., "LAW.P.B001")
  pole_number?: string;   // Alternative pole identifier
  
  // Status and Classification
  status: PoleStatus;
  pole_type?: PoleType;
  
  // Location Data
  latitude: number;
  longitude: number;
  address?: string;
  zone_no?: string;
  
  // Network Information
  pon_no?: string;        // PON network number
  network_segment?: string;
  
  // Installation Details
  installation_date?: Date;
  completion_date?: Date;
  assigned_contractor?: string;
  assigned_team?: string;
  
  // Capacity and Connections
  max_drops: number;      // Maximum drops per pole (default 12)
  current_drops: number;  // Current number of connected drops
  available_capacity: number; // Calculated available capacity
  
  // Import Metadata
  source_file?: string;
  source_row?: number;
  import_date?: Timestamp;
  validation_status: ValidationStatus;
  validation_errors: string[];
  
  // Audit Fields
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export enum PoleStatus {
  PENDING_PERMISSION = 'pending_permission',
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_DENIED = 'permission_denied',
  READY_FOR_INSTALLATION = 'ready_for_installation',
  INSTALLATION_IN_PROGRESS = 'installation_in_progress',
  INSTALLED = 'installed',
  ACTIVE = 'active',
  MAINTENANCE_REQUIRED = 'maintenance_required',
  DECOMMISSIONED = 'decommissioned',
}

export enum PoleType {
  WOODEN = 'wooden',
  CONCRETE = 'concrete',
  STEEL = 'steel',
  EXISTING = 'existing',
  NEW = 'new',
}

// Drop Data Structure
export interface DropData {
  id?: string;
  projectId: string;
  
  // Core Identifiers (UID)
  drop_number: string;    // Unique drop number
  label?: string;         // Alternative drop identifier
  
  // Pole Connection
  pole_number: string;    // Connected pole reference (FK to PoleData.label_1)
  strtfeat?: string;      // Connected pole (from Excel import)
  
  // Property Information
  premises_id?: string;   // Property identifier
  address: string;        // Drop installation address
  ont_reference?: string; // ONT equipment reference
  endfeat?: string;       // ONT reference (from Excel import)
  
  // Status and Progress
  status: DropStatus;
  signup_status?: SignupStatus;
  installation_priority: Priority;
  
  // Location Data
  latitude?: number;
  longitude?: number;
  distance_to_pole?: number; // Distance in meters
  
  // Installation Details
  installation_date?: Date;
  completion_date?: Date;
  assigned_contractor?: string;
  assigned_technician?: string;
  
  // Service Information
  service_type?: ServiceType;
  connection_type?: ConnectionType;
  bandwidth_requirement?: string;
  
  // Customer Information
  customer_name?: string;
  customer_contact?: string;
  customer_email?: string;
  
  // Import Metadata
  source_file?: string;
  source_row?: number;
  import_date?: Timestamp;
  validation_status: ValidationStatus;
  validation_errors: string[];
  
  // Audit Fields
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export enum DropStatus {
  PLANNED = 'planned',
  SURVEY_REQUIRED = 'survey_required',
  SURVEY_COMPLETED = 'survey_completed',
  READY_FOR_INSTALLATION = 'ready_for_installation',
  INSTALLATION_SCHEDULED = 'installation_scheduled',
  INSTALLATION_IN_PROGRESS = 'installation_in_progress',
  INSTALLED = 'installed',
  TESTING = 'testing',
  ACTIVE = 'active',
  FAULT = 'fault',
  DISCONNECTED = 'disconnected',
}

export enum SignupStatus {
  NO_SIGNUP = 'no_signup',
  INTERESTED = 'interested',
  SIGNED_UP = 'signed_up',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  VIP = 'vip',
}

export enum ServiceType {
  RESIDENTIAL = 'residential',
  BUSINESS = 'business',
  ENTERPRISE = 'enterprise',
  GOVERNMENT = 'government',
}

export enum ConnectionType {
  AERIAL = 'aerial',
  UNDERGROUND = 'underground',
  MIXED = 'mixed',
}

// Fibre Data Structure
export interface FibreData {
  id?: string;
  projectId: string;
  
  // Core Identifiers
  segment_id: string;     // Unique segment identifier
  segment_name?: string;  // Human readable segment name
  
  // Route Information
  from_point: string;     // Start point (pole, junction, etc.)
  to_point: string;       // End point (pole, junction, etc.)
  route_description?: string;
  
  // Distance and Measurements
  distance: number;       // Distance in meters
  cable_length_required: number; // Including slack and redundancy
  slack_percentage: number; // Default 10%
  
  // Cable Specifications
  fibre_type: FibreType;
  cable_size: string;     // e.g., "96 Core", "48 Core"
  cable_specification?: string;
  cable_manufacturer?: string;
  cable_model?: string;
  
  // Installation Method
  installation_method: InstallationMethod;
  trenching_required: boolean;
  stringing_required: boolean;
  ducting_required: boolean;
  
  // Network Information
  pon_no?: string;        // PON number
  zone_no?: string;       // Zone number
  network_segment?: string;
  
  // Status and Progress
  status: FibreStatus;
  completion_percentage: number;
  
  // Installation Details
  assigned_contractor?: string;
  assigned_crew?: string;
  scheduled_date?: Date;
  start_date?: Date;
  completion_date?: Date;
  
  // Cost Estimates
  estimated_cost: number;
  actual_cost?: number;
  cost_per_meter: number;
  
  // Import Metadata
  source_file?: string;
  source_row?: number;
  import_date?: Timestamp;
  validation_status: ValidationStatus;
  validation_errors: string[];
  
  // Audit Fields
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export enum FibreType {
  SINGLE_MODE = 'single_mode',
  MULTI_MODE = 'multi_mode',
  ARMORED = 'armored',
  AERIAL = 'aerial',
  UNDERGROUND = 'underground',
}

export enum InstallationMethod {
  AERIAL_STRINGING = 'aerial_stringing',
  UNDERGROUND_TRENCHING = 'underground_trenching',
  DUCT_INSTALLATION = 'duct_installation',
  MICRO_TRENCHING = 'micro_trenching',
  DIRECTIONAL_DRILLING = 'directional_drilling',
  EXISTING_DUCT = 'existing_duct',
}

export enum FibreStatus {
  PLANNED = 'planned',
  SURVEYED = 'surveyed',
  APPROVED = 'approved',
  MATERIALS_ORDERED = 'materials_ordered',
  READY_FOR_INSTALLATION = 'ready_for_installation',
  INSTALLATION_IN_PROGRESS = 'installation_in_progress',
  INSTALLED = 'installed',
  TESTING = 'testing',
  SPLICING = 'splicing',
  ACTIVE = 'active',
  MAINTENANCE_REQUIRED = 'maintenance_required',
}

// SOW Calculations and Aggregations
export interface SOWCalculations {
  // Pole Summary
  totalPoles: number;
  polesWithPermission: number;
  polesReadyForInstallation: number;
  polesInstalled: number;
  
  // Drop Summary  
  totalDrops: number;
  dropsWithSignup: number;
  dropsReadyForInstallation: number;
  dropsInstalled: number;
  dropsActive: number;
  
  // Fibre Summary
  totalFibreLength: number;        // Total cable length in meters
  fibreForTrenching: number;       // Length requiring trenching
  fibreForStringing: number;       // Length requiring stringing
  fibreInstalled: number;          // Completed cable length
  
  // Cost Estimates
  totalEstimatedCost: number;
  poleInstallationCost: number;
  dropInstallationCost: number;
  fibreInstallationCost: number;
  
  // Time Estimates (in days)
  estimatedProjectDuration: number;
  poleInstallationDays: number;
  fibreInstallationDays: number;
  dropInstallationDays: number;
  
  // KPI Calculations (for project targets)
  kpiTargets: KPITargets;
}

export interface KPITargets {
  polePermissions: {
    total: number;
    daily: number;
  };
  homeSignups: {
    total: number;
    daily: number;
  };
  polesPlanted: {
    total: number;
    daily: number;
  };
  fibreStringing: {
    total: number;    // Total meters
    daily: number;    // Meters per day
  };
  trenchingMeters: {
    total: number;
    daily: number;
  };
  homesConnected: {
    total: number;
    daily: number;
  };
}

// Import and Validation Types
export interface ImportSummary {
  polesImported: number;
  dropsImported: number;
  fibreImported: number;
  totalRecordsProcessed: number;
  successfulRecords: number;
  failedRecords: number;
  warningRecords: number;
  processingTime: number; // milliseconds
  importDate: Timestamp;
  importedBy: string;
  sourceFiles: string[];
}

export interface ValidationResults {
  isValid: boolean;
  criticalErrors: ValidationError[];
  errors: ValidationError[];
  warnings: ValidationError[];
  
  // Relationship Validation
  orphanedDrops: string[];        // Drops without valid pole reference
  overCapacityPoles: string[];    // Poles with > 12 drops
  duplicateIdentifiers: string[]; // Duplicate pole/drop numbers
  
  // Data Quality Metrics
  dataQualityScore: number;       // 0-100 score
  completenessScore: number;      // 0-100 score
  accuracyScore: number;          // 0-100 score
}

export interface ValidationError {
  type: ValidationErrorType;
  severity: ValidationSeverity;
  message: string;
  field?: string;
  recordId?: string;
  rowNumber?: number;
  suggestedFix?: string;
}

export enum ValidationErrorType {
  REQUIRED_FIELD_MISSING = 'required_field_missing',
  INVALID_FORMAT = 'invalid_format',
  DUPLICATE_IDENTIFIER = 'duplicate_identifier',
  INVALID_REFERENCE = 'invalid_reference',
  OUT_OF_RANGE = 'out_of_range',
  BUSINESS_RULE_VIOLATION = 'business_rule_violation',
  DATA_INCONSISTENCY = 'data_inconsistency',
}

export enum ValidationSeverity {
  CRITICAL = 'critical',
  ERROR = 'error',  
  WARNING = 'warning',
  INFO = 'info',
}

export enum ValidationStatus {
  NOT_VALIDATED = 'not_validated',
  VALID = 'valid',
  VALID_WITH_WARNINGS = 'valid_with_warnings',
  INVALID = 'invalid',
}

// Excel Import Types
export interface ExcelImportResult {
  success: boolean;
  data: any[];
  errors: ImportError[];
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    skippedRows: number;
  };
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  severity: ValidationSeverity;
}

export enum ImportDataType {
  POLES = 'poles',
  DROPS = 'drops',
  FIBRE = 'fibre',
}

// Excel Sheet Detection
export interface SheetDetectionResult {
  detectedType: ImportDataType | 'unknown';
  confidence: number;
  suggestedMapping: FieldMapping[];
  detectedHeaders: string[];
}

export interface FieldMapping {
  sourceField: string;    // Excel column header
  targetField: string;    // Our data model field
  required: boolean;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  validator?: string;     // Validation rule name
}

// Form and UI Types
export interface SOWImportFormData {
  importType: ImportDataType;
  file: File | null;
  validateData: boolean;
  overwriteExisting: boolean;
  fieldMappings: FieldMapping[];
}

export interface SOWImportProgress {
  stage: ImportStage;
  progress: number;       // 0-100
  currentRecord: number;
  totalRecords: number;
  message: string;
  errors: ImportError[];
}

export enum ImportStage {
  UPLOADING = 'uploading',
  PARSING = 'parsing',
  VALIDATING = 'validating',
  PROCESSING = 'processing',
  SAVING = 'saving',
  CALCULATING = 'calculating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// Session Storage Types (for cross-page data transfer)
export interface SOWSessionData {
  projectId?: string;
  sowData?: Partial<SOWData>;
  importProgress?: SOWImportProgress;
  returnUrl?: string;
  formData?: any;
}