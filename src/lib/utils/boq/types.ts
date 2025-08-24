/**
 * BOQ Helper Types and Interfaces
 * Type definitions for BOQ utility functions
 */

import { BOQItem, BOQStatus, BOQItemMappingStatusType, ProcurementStatusType } from '@/types/procurement/boq.types';

export interface StatusDisplayInfo {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor?: string;
  icon?: string;
}

export interface BOQTotals {
  totalQuantity: number;
  totalValue: number;
  itemCount: number;
  mappedCount: number;
  exceptionCount: number;
  pendingProcurement: number;
  mappingProgress: number;
  averageItemValue: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface VersionInfo {
  major: number;
  minor: number;
}

export type SortDirection = 'asc' | 'desc';