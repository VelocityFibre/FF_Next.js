/**
 * Type definitions for BOQ List components
 */

import { BOQ, BOQStatusType, MappingStatusType } from '@/types/procurement/boq.types';

export interface BOQListProps {
  onSelectBOQ?: (boq: BOQ) => void;
  onCreateBOQ?: () => void;
  onUploadBOQ?: () => void;
  selectedBOQId?: string;
  className?: string;
}

export interface FilterState {
  search: string;
  status: BOQStatusType | '';
  mappingStatus: MappingStatusType | '';
  uploadedBy: string;
  dateRange: 'all' | '7days' | '30days' | '90days';
}

export type SortField = 'createdAt' | 'version' | 'itemCount' | 'mappingProgress' | 'status';
export type SortDirection = 'asc' | 'desc';

export const INITIAL_FILTERS: FilterState = {
  search: '',
  status: '',
  mappingStatus: '',
  uploadedBy: '',
  dateRange: 'all'
};

export const BOQ_STATUS_LABELS = {
  draft: 'Draft',
  uploaded: 'Uploaded',
  mapping: 'Mapping',
  mapped: 'Mapped',
  approved: 'Approved',
  archived: 'Archived'
};

export const BOQ_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  uploaded: 'bg-blue-100 text-blue-800',
  mapping: 'bg-yellow-100 text-yellow-800',
  mapped: 'bg-green-100 text-green-800',
  approved: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-800',
  mapping_review: 'bg-orange-100 text-orange-800'
};

export const MAPPING_STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  mapped: 'Mapped',
  exception: 'Exception'
};

export const MAPPING_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  mapped: 'bg-green-100 text-green-800',
  exception: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800'
};