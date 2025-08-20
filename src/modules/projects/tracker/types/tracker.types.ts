import { Timestamp } from 'firebase/firestore';

// Unified tracker types for poles, drops, and fiber sections
export type TrackerType = 'pole' | 'drop' | 'fiber';

export interface BaseTracker {
  id?: string;
  projectId: string;
  projectCode: string;
  projectName?: string;
  type: TrackerType;
  
  // Import tracking
  importBatchId?: string;
  importSource?: 'Excel' | 'CSV' | 'Manual' | 'OneMap';
  importedAt?: Timestamp | Date;
  originalData?: Record<string, any>;
  
  // Status tracking
  status: string;
  statusHistory?: StatusHistoryEntry[];
  
  // Location
  location?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  
  // Assignment
  contractorId?: string;
  contractorName?: string;
  teamId?: string;
  teamName?: string;
  
  // Progress tracking
  plannedDate?: Date;
  startedDate?: Date;
  completedDate?: Date;
  progress: number; // 0-100
  
  // Quality & Validation
  qualityStatus?: 'pending' | 'pass' | 'fail' | 'na';
  qualityChecks?: QualityCheck[];
  photos?: TrackerPhoto[];
  
  // Audit
  createdAt: Timestamp | Date;
  createdBy: string;
  createdByName?: string;
  updatedAt: Timestamp | Date;
  updatedBy: string;
  updatedByName?: string;
}

export interface PoleTracker extends BaseTracker {
  type: 'pole';
  poleNumber: string; // Globally unique
  vfPoleId: string; // Auto-generated: "LAW.P.A001"
  
  // Pole specific
  poleType?: 'wooden' | 'concrete' | 'steel' | 'fiberglass';
  poleHeight?: number; // meters
  installationDepth?: number; // meters
  
  // Drop connections
  connectedDrops?: string[]; // Drop IDs
  dropCount: number;
  maxCapacity: number; // Usually 12
  
  // Network details
  pon?: string;
  zone?: string;
  distributionType?: 'distribution' | 'feeder';
}

export interface DropTracker extends BaseTracker {
  type: 'drop';
  dropNumber: string; // Globally unique
  vfDropId: string; // Auto-generated: "LAW.D.H001"
  
  // Connection details
  connectedPoleId?: string; // Which pole this drop connects to
  connectedPoleNumber?: string;
  homeNumber?: string;
  
  // Customer details
  customerName?: string;
  customerContact?: string;
  address: string;
  
  // Installation details
  cableLength?: number; // meters
  cableType?: string;
  ontSerialNumber?: string;
  
  // Service details
  serviceType?: 'residential' | 'business' | 'enterprise';
  packageType?: string;
  activationDate?: Date;
}

export interface FiberTracker extends BaseTracker {
  type: 'fiber';
  sectionId: string; // Unique section identifier
  vfFiberId: string; // Auto-generated: "LAW.F.S001"
  
  // Route details
  fromLocation: string; // Start point (could be pole, junction, etc.)
  toLocation: string; // End point
  fromPoleId?: string;
  toPoleId?: string;
  
  // Cable details
  cableType: string; // e.g., "24-core", "48-core"
  cableLength: number; // meters
  coreCount: number;
  usedCores?: number;
  
  // Installation details
  installationMethod?: 'aerial' | 'underground' | 'duct';
  depth?: number; // For underground
  height?: number; // For aerial
  
  // Testing
  otdrTestResult?: 'pass' | 'fail' | 'pending';
  signalLoss?: number; // dB
  testDate?: Date;
}

export interface StatusHistoryEntry {
  status: string;
  changedAt: Timestamp | Date;
  changedBy: string;
  changedByName?: string;
  notes?: string;
  previousStatus?: string;
}

export interface QualityCheck {
  id: string;
  checkType: string;
  status: 'pass' | 'fail' | 'pending' | 'na';
  notes?: string;
  checkedBy: string;
  checkedByName?: string;
  checkedAt: Date;
  photos?: string[];
}

export interface TrackerPhoto {
  id: string;
  url: string;
  type: string;
  description?: string;
  timestamp: Date;
  gpsLocation?: {
    latitude: number;
    longitude: number;
  };
}

// Import data structures
export interface ImportBatch {
  id?: string;
  projectId: string;
  projectName: string;
  importType: 'initial' | 'update' | 'additional';
  fileName: string;
  fileSize: number;
  
  // Statistics
  totalRecords: number;
  polesCount: number;
  dropsCount: number;
  fiberCount: number;
  successCount: number;
  errorCount: number;
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errors?: ImportError[];
  
  // Audit
  importedAt: Timestamp | Date;
  importedBy: string;
  importedByName?: string;
  processingTime?: number; // milliseconds
}

export interface ImportError {
  row: number;
  type: TrackerType;
  identifier: string;
  error: string;
  data?: Record<string, any>;
}

// Import templates
export interface PoleImportRow {
  poleNumber: string;
  location: string;
  latitude?: number;
  longitude?: number;
  poleType?: string;
  height?: number;
  zone?: string;
  pon?: string;
  contractorName?: string;
  teamName?: string;
  plannedDate?: string;
  status?: string;
}

export interface DropImportRow {
  dropNumber: string;
  poleNumber: string; // To link to pole
  homeNumber: string;
  customerName?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  cableLength?: number;
  serviceType?: string;
  status?: string;
}

export interface FiberImportRow {
  sectionId: string;
  fromLocation: string;
  toLocation: string;
  fromPole?: string;
  toPole?: string;
  cableType: string;
  cableLength: number;
  coreCount: number;
  installationMethod?: string;
  status?: string;
}

// Grid display types
export interface TrackerGridItem {
  id: string;
  type: TrackerType;
  identifier: string; // poleNumber, dropNumber, or sectionId
  vfId: string; // VF generated ID
  projectName: string;
  location: string;
  status: string;
  progress: number;
  contractorName?: string;
  teamName?: string;
  plannedDate?: Date;
  completedDate?: Date;
  qualityStatus?: string;
  hasPhotos: boolean;
  
  // Type-specific fields
  dropCount?: number; // For poles
  maxCapacity?: number; // For poles
  customerName?: string; // For drops
  cableLength?: number; // For drops and fiber
  coreCount?: number; // For fiber
}

// Filter types
export interface TrackerFilters {
  projectId?: string;
  type?: TrackerType | 'all';
  status?: string;
  contractorId?: string;
  teamId?: string;
  qualityStatus?: 'pass' | 'fail' | 'pending' | 'na';
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string; // Search in identifiers, locations, etc.
  hasPhotos?: boolean;
  progressRange?: {
    min: number; // 0-100
    max: number; // 0-100
  };
}

// Statistics
export interface TrackerStatistics {
  totals: {
    poles: number;
    drops: number;
    fiber: number;
  };
  completed: {
    poles: number;
    drops: number;
    fiber: number;
  };
  inProgress: {
    poles: number;
    drops: number;
    fiber: number;
  };
  qualityPass: number;
  qualityFail: number;
  averageProgress: number;
  averageCompletionTime: number; // days
}