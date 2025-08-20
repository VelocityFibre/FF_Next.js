import { Timestamp } from 'firebase/firestore';

// Import row types matching Excel/CSV structure
export interface PoleImportRow {
  poleNumber: string;
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  phase?: string;
  dropCount?: number;
  notes?: string;
}

export interface DropImportRow {
  dropNumber: string;
  poleNumber: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  homeOwner?: string;
  contactNumber?: string;
  phase?: string;
  installationType?: 'standard' | 'complex' | 'commercial';
  cableLength?: number;
  notes?: string;
}

export interface FiberImportRow {
  sectionId: string;
  startPoint: string;
  endPoint: string;
  startCoordinates?: {
    lat: number;
    lng: number;
  };
  endCoordinates?: {
    lat: number;
    lng: number;
  };
  length?: number;
  cableType?: string;
  phase?: string;
  installationMethod?: 'aerial' | 'underground' | 'duct';
  notes?: string;
}

export interface SOWImportData {
  projectId: string;
  projectCode: string;
  projectName: string;
  poles: PoleImportRow[];
  drops: DropImportRow[];
  fiberSections: FiberImportRow[];
}

export interface SOWImportSummary {
  totalPoles: number;
  totalDrops: number;
  totalFiberSections: number;
  importDate: Timestamp;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errors: string[];
}

export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ImportProgress {
  currentStep: 'upload' | 'validate' | 'preview' | 'import' | 'complete';
  totalItems: number;
  processedItems: number;
  errors: string[];
}