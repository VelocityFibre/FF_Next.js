/**
 * BOQ Utilities - Legacy Compatibility Layer
 * 
 * @deprecated This file has been split into modular components for better maintainability.
 * 
 * New modular structure:
 * - status.ts: Status display utilities
 * - formatters.ts: Data formatting functions
 * - calculations.ts: BOQ calculations and statistics
 * - versioning.ts: Version management utilities
 * - validation.ts: Data validation functions
 * - processing.ts: Search, sort, and filter operations
 * - export.ts: Export utilities
 * 
 * For new code, import from the modular structure:
 * ```typescript
 * import { getBOQStatusInfo, formatCurrency, calculateBOQTotals } from '@/lib/utils/boq';
 * // or
 * import BOQUtils from '@/lib/utils/boq';
 * ```
 * 
 * This legacy layer maintains backward compatibility while the codebase transitions.
 */

import { BOQ, BOQItem, BOQStatus, BOQItemMappingStatusType, ProcurementStatusType } from '@/types/procurement/boq.types';
import {
  getBOQStatusInfo as getStatusInfo,
  getMappingStatusInfo as getMappingInfo,
  getProcurementStatusInfo as getProcurementInfo,
  formatCurrency as formatCurrencyUtil,
  formatFileSize as formatFileSizeUtil,
  formatRelativeTime as formatRelativeTimeUtil,
  calculateMappingProgress as calculateProgress,
  calculateBOQTotals as calculateTotals,
  generateBOQVersion as generateVersion,
  validateBOQItem as validateItem,
  validateBOQData as validateData,
  extractBOQItemKeywords as extractKeywords,
  filterBOQItems as filterItems,
  sortBOQItems as sortItems,
  exportBOQToCSV as exportCSV
} from './boq';

/**
 * @deprecated Use getBOQStatusInfo from '@/lib/utils/boq' instead
 */
export function getBOQStatusInfo(status: BOQStatus) {
  return getStatusInfo(status);
}

/**
 * @deprecated Use getMappingStatusInfo from '@/lib/utils/boq' instead
 */
export function getMappingStatusInfo(status: BOQItemMappingStatusType) {
  return getMappingInfo(status);
}

/**
 * @deprecated Use getProcurementStatusInfo from '@/lib/utils/boq' instead
 */
export function getProcurementStatusInfo(status: ProcurementStatusType) {
  return getProcurementInfo(status);
}

/**
 * @deprecated Use formatCurrency from '@/lib/utils/boq' instead
 */
export function formatCurrency(amount: number, currency = 'ZAR'): string {
  return formatCurrencyUtil(amount, currency);
}

/**
 * @deprecated Use formatFileSize from '@/lib/utils/boq' instead
 */
export function formatFileSize(bytes: number): string {
  return formatFileSizeUtil(bytes);
}

/**
 * @deprecated Use formatRelativeTime from '@/lib/utils/boq' instead
 */
export function formatRelativeTime(date: Date): string {
  return formatRelativeTimeUtil(date);
}

/**
 * @deprecated Use calculateMappingProgress from '@/lib/utils/boq' instead
 */
export function calculateMappingProgress(boq: BOQ): number {
  return calculateProgress(boq);
}

/**
 * @deprecated Use calculateBOQTotals from '@/lib/utils/boq' instead
 */
export function calculateBOQTotals(items: BOQItem[]) {
  return calculateTotals(items);
}

/**
 * @deprecated Use generateBOQVersion from '@/lib/utils/boq' instead
 */
export function generateBOQVersion(existingVersions: string[]): string {
  return generateVersion(existingVersions);
}

/**
 * @deprecated Use validateBOQItem from '@/lib/utils/boq' instead
 */
export function validateBOQItem(item: Partial<BOQItem>): { isValid: boolean; errors: string[] } {
  return validateItem(item);
}

/**
 * @deprecated Use validateBOQData from '@/lib/utils/boq' instead
 */
export function validateBOQData(boq: Partial<BOQ>): { isValid: boolean; errors: string[] } {
  return validateData(boq);
}

/**
 * @deprecated Use extractBOQItemKeywords from '@/lib/utils/boq' instead
 */
export function extractBOQItemKeywords(item: BOQItem): string[] {
  return extractKeywords(item);
}

/**
 * @deprecated Use filterBOQItems from '@/lib/utils/boq' instead
 */
export function filterBOQItems(items: BOQItem[], searchTerm: string): BOQItem[] {
  return filterItems(items, searchTerm);
}

/**
 * @deprecated Use sortBOQItems from '@/lib/utils/boq' instead
 */
export function sortBOQItems(items: BOQItem[], sortBy: keyof BOQItem, direction: 'asc' | 'desc' = 'asc'): BOQItem[] {
  return sortItems(items, sortBy, direction);
}

/**
 * @deprecated Use exportBOQToCSV from '@/lib/utils/boq' instead
 */
export function exportBOQToCSV(boq: BOQ, items: BOQItem[]): string {
  return exportCSV(boq, items);
}