/**
 * Filter Types
 * Types for filtering and searching tracker data
 */

import { TrackerType } from './base.types';

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