import { ValidationStatus, DropStatus } from './enums.types';

// Drop Data Structure
export interface DropData {
  id?: string;
  projectId: string;
  
  // Core Identifiers
  drop_number: string;        // Unique drop identifier
  pole_id: string;           // Reference to parent pole
  
  // Customer Information
  customer_name?: string;
  customer_contact?: string;
  service_address: string;
  
  // Location Data
  latitude?: number;
  longitude?: number;
  
  // Service Details
  service_type: ServiceType;
  bandwidth_package?: string;
  installation_priority: Priority;
  
  // Status and Progress
  status: DropStatus;
  installation_date?: Date;
  completion_date?: Date;
  activation_date?: Date;
  
  // Network Configuration
  pon_port?: string;
  ont_serial?: string;
  fibre_length?: number;
  cable_type?: CableType;
  
  // Cost and Billing
  installation_cost?: number;
  material_cost?: number;
  labour_hours?: number;
  monthly_revenue?: number;
  
  // Quality and Compliance
  signal_strength?: number;
  speed_test_results?: SpeedTestResult[];
  quality_score?: number;
  
  // Import Metadata
  source?: 'manual' | 'excel_import' | 'crm_import';
  imported_at?: Date;
  validation_status?: ValidationStatus;
  validation_notes?: string[];
  
  // Additional Properties
  notes?: string;
  photos?: string[];
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

// DropStatus is imported from enums.types - removed duplicate definition

export enum ServiceType {
  FTTH_RESIDENTIAL = 'ftth_residential',
  FTTH_BUSINESS = 'ftth_business',
  FTTB_BUILDING = 'fttb_building',
  ENTERPRISE = 'enterprise',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum CableType {
  SINGLE_MODE = 'single_mode',
  MULTI_MODE = 'multi_mode',
  ARMORED = 'armored',
  AERIAL = 'aerial',
  UNDERGROUND = 'underground',
}

export interface SpeedTestResult {
  test_date: Date;
  download_speed: number;
  upload_speed: number;
  latency: number;
  test_server: string;
  passed: boolean;
}

// Analytics and filtering interfaces
export interface DropAnalytics {
  totalDrops: number;
  completedDrops: number;
  pendingDrops: number;
  averageInstallTime: number;
  totalRevenue: number;
  serviceTypeBreakdown: Record<ServiceType, number>;
  priorityBreakdown: Record<Priority, number>;
}

export interface DropFilterOptions {
  status?: DropStatus[];
  serviceType?: ServiceType[];
  priority?: Priority[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  location?: {
    bounds?: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
    radius?: {
      center: { lat: number; lng: number };
      meters: number;
    };
  };
}

export interface DropSortOptions {
  field: keyof DropData;
  direction: 'asc' | 'desc';
}

export interface DropValidation {
  required: (keyof DropData)[];
  rules: {
    [K in keyof DropData]?: (value: DropData[K]) => string | null;
  };
}

export interface DropTestResult {
  testType: 'signal' | 'speed' | 'connectivity' | 'quality';
  result: 'pass' | 'fail' | 'warning';
  value?: number;
  expectedValue?: number;
  testDate: Date;
  technician: string;
  notes?: string;
}

