/**
 * Staff Import Advanced Types
 * Type definitions for advanced import functionality
 */

import { StaffImportResult } from '@/types/staff.types';

export interface ImportProgress {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  status: 'idle' | 'parsing' | 'importing' | 'completed' | 'error';
}

export interface StaffImportAdvancedState {
  selectedFile: File | null;
  importing: boolean;
  progress: ImportProgress;
  importResult: StaffImportResult | null;
  overwriteExisting: boolean;
}