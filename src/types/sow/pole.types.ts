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
  available_capacity: number; // Calculated: max_drops - current_drops
  
  // Cost and Billing
  installation_cost?: number;
  material_cost?: number;
  labour_hours?: number;
  
  // Quality and Compliance
  inspection_passed?: boolean;
  inspection_date?: Date;
  inspector?: string;
  compliance_notes?: string;
  
  // Operational Data
  maintenance_schedule?: MaintenanceSchedule[];
  last_maintenance?: Date;
  next_maintenance_due?: Date;
  
  // Import Metadata
  source?: 'manual' | 'excel_import' | 'gis_import';
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

export interface MaintenanceSchedule {
  id: string;
  type: 'inspection' | 'repair' | 'upgrade' | 'cleaning';
  scheduled_date: Date;
  completed_date?: Date;
  assigned_technician?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  cost?: number;
}

export enum ValidationStatus {
  PENDING = 'pending',
  VALID = 'valid',
  INVALID = 'invalid',
  WARNING = 'warning',
  NEEDS_REVIEW = 'needs_review',
}