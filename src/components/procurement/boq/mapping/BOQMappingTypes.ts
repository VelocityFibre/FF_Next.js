/**
 * BOQ Mapping Review Types
 */

import { BOQException, BOQItem, MappingSuggestion } from '@/types/procurement/boq.types';

export interface BOQMappingReviewProps {
  boqId: string;
  onMappingComplete?: (updatedItems: number) => void;
  onClose?: () => void;
  className?: string;
}

export interface ExceptionWithItem extends BOQException {
  boqItem: BOQItem;
  suggestions: MappingSuggestion[];
  exceptionDetails?: string;
}

export interface FilterState {
  severity: string;
  status: string;
  exceptionType: string;
  search: string;
}

export type SortField = 'lineNumber' | 'severity' | 'confidence' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export const INITIAL_FILTERS: FilterState = {
  severity: '',
  status: '',
  exceptionType: '',
  search: ''
};

export const SEVERITY_COLORS = {
  high: 'text-red-600 bg-red-100',
  medium: 'text-yellow-600 bg-yellow-100',
  low: 'text-blue-600 bg-blue-100',
  critical: 'text-red-700 bg-red-200'
};

export const EXCEPTION_TYPE_LABELS: Record<string, string> = {
  no_catalog_match: 'No Catalog Match',
  low_confidence: 'Low Confidence',
  missing_description: 'Missing Description',
  missing_unit: 'Missing Unit',
  invalid_quantity: 'Invalid Quantity',
  price_variance: 'Price Variance'
};