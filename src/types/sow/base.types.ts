import { Timestamp } from 'firebase/firestore';

// Core SOW Entity
export interface SOWData {
  id?: string;
  projectId: string;
  version: number;
  status: SOWStatus;
  
  // Data Collections
  poles: import('./pole.types').PoleData[];
  drops: import('./drop.types').DropData[];
  fibre: import('./fibre.types').FibreData[];
  
  // Calculations and Aggregations
  calculations: import('./calculation.types').SOWCalculations;
  estimatedDays: number;
  totalCost: number;
  
  // Import Metadata
  importSummary: import('./calculation.types').ImportSummary;
  validationResults: import('./calculation.types').ValidationResults;
  
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

// Re-export from sub-modules for convenience
export type { PoleData } from './pole.types';
export type { DropData } from './drop.types';
export type { FibreData } from './fibre.types';
export type { SOWCalculations, ImportSummary, ValidationResults } from './calculation.types';