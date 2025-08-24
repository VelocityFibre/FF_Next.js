import { ValidationStatus, FibreStatus } from './enums.types';

// Fibre Infrastructure Data
export interface FibreData {
  id?: string;
  projectId: string;
  
  // Core Identifiers
  cable_id: string;
  section_name?: string;
  
  // Route Information
  start_point: RoutePoint;
  end_point: RoutePoint;
  waypoints?: RoutePoint[];
  
  // Cable Specifications
  cable_type: FibreCableType;
  fibre_count: number;
  core_count?: number;
  cable_length: number;
  
  // Installation Details
  installation_method: InstallationMethod;
  burial_depth?: number;
  conduit_type?: ConduitType;
  
  // Status and Progress
  status: FibreStatus;
  installation_date?: Date;
  completion_date?: Date;
  testing_date?: Date;
  
  // Technical Specifications
  attenuation?: number;
  optical_return_loss?: number;
  splice_count?: number;
  connector_count?: number;
  
  // Cost and Resources
  material_cost?: number;
  installation_cost?: number;
  labour_hours?: number;
  equipment_used?: string[];
  
  // Quality and Testing
  test_results?: FibreTestResult[];
  quality_score?: number;
  certification_status?: CertificationStatus;
  
  // Maintenance
  maintenance_schedule?: MaintenanceRecord[];
  last_inspection?: Date;
  next_inspection_due?: Date;
  
  // Import Metadata
  source?: 'manual' | 'excel_import' | 'cad_import';
  imported_at?: Date;
  validation_status?: ValidationStatus;
  validation_notes?: string[];
  
  // Additional Properties
  notes?: string;
  photos?: string[];
  documents?: string[];
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  address?: string;
  landmark?: string;
  pole_id?: string;
  junction_box_id?: string;
}

export enum FibreCableType {
  SINGLE_MODE = 'single_mode',
  MULTI_MODE = 'multi_mode',
  ARMORED_SINGLE_MODE = 'armored_single_mode',
  ARMORED_MULTI_MODE = 'armored_multi_mode',
  AERIAL_CABLE = 'aerial_cable',
  UNDERGROUND_CABLE = 'underground_cable',
  INDOOR_CABLE = 'indoor_cable',
  OUTDOOR_CABLE = 'outdoor_cable',
}

export enum InstallationMethod {
  AERIAL = 'aerial',
  UNDERGROUND_DIRECT_BURY = 'underground_direct_bury',
  UNDERGROUND_CONDUIT = 'underground_conduit',
  MICRO_TRENCHING = 'micro_trenching',
  HORIZONTAL_DRILLING = 'horizontal_drilling',
  EXISTING_INFRASTRUCTURE = 'existing_infrastructure',
}

export enum ConduitType {
  PVC = 'pvc',
  HDPE = 'hdpe',
  STEEL = 'steel',
  CONCRETE = 'concrete',
  FLEXIBLE = 'flexible',
}

// FibreStatus is imported from enums.types - removed duplicate definition

export interface FibreTestResult {
  test_type: 'insertion_loss' | 'return_loss' | 'length' | 'continuity' | 'otdr';
  test_date: Date;
  technician: string;
  equipment_used: string;
  wavelength?: number;
  measured_value: number;
  expected_value?: number;
  tolerance?: number;
  passed: boolean;
  notes?: string;
}

export enum CertificationStatus {
  NOT_TESTED = 'not_tested',
  TESTING_IN_PROGRESS = 'testing_in_progress',
  PASSED = 'passed',
  FAILED = 'failed',
  RETEST_REQUIRED = 'retest_required',
  CERTIFIED = 'certified',
}

export interface MaintenanceRecord {
  id: string;
  maintenance_type: 'inspection' | 'repair' | 'upgrade' | 'cleaning';
  scheduled_date: Date;
  completed_date?: Date;
  technician?: string;
  findings?: string;
  actions_taken?: string;
  cost?: number;
  next_action_required?: string;
}

// Missing analytics and other interfaces
export interface FibreAnalytics {
  totalLength: number;
  completedSections: number;
  plannedSections: number;
  averageInstallationTime: number;
  totalCost: number;
  cableTypeBreakdown: Record<FibreCableType, number>;
  installationMethodBreakdown: Record<InstallationMethod, number>;
  qualityScore: number;
}

export interface FibreSegment {
  id: string;
  fibreId: string;
  segmentNumber: number;
  startPoint: RoutePoint;
  endPoint: RoutePoint;
  length: number;
  spliceCount: number;
  status: FibreStatus;
  testResults?: FibreTestResult[];
}

// Re-export CableType as alias for FibreCableType for backward compatibility
export { FibreCableType as CableType };

// Re-export with TestResultStatus name
export enum TestResultStatus {
  NOT_TESTED = 'not_tested',
  TESTING_IN_PROGRESS = 'testing_in_progress',
  PASSED = 'passed',
  FAILED = 'failed',
  RETEST_REQUIRED = 'retest_required',
  CERTIFIED = 'certified',
}