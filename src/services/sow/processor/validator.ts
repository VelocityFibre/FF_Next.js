/**
 * SOW Data Validator - Backward Compatibility Layer
 * @deprecated Use ./validation/ modules for improved modular validation system
 * 
 * This file provides backward compatibility for existing imports.
 * New code should use the modular validation system in ./validation/
 */

// Re-export everything from the new modular structure
export * from './validation';

// Import classes for backward compatibility
import { SOWValidator } from './validation/sow-validator';
import { SOWErrorHandler } from './validation/error-handler';
import { ValidationResult } from './validation/validator-types';
import { NeonPoleData, NeonDropData, NeonFibreData } from '../neonSOWService';

/**
 * Validate poles data
 * @deprecated Use SOWValidator.validatePoles instead
 */
export function validatePoles(poles: NeonPoleData[]): ValidationResult<NeonPoleData> {
  return SOWValidator.validatePoles(poles);
}

/**
 * Validate drops data
 * @deprecated Use SOWValidator.validateDrops instead
 */
export function validateDrops(drops: NeonDropData[]): ValidationResult<NeonDropData> {
  return SOWValidator.validateDrops(drops);
}

/**
 * Validate fibre data
 * @deprecated Use SOWValidator.validateFibre instead
 */
export function validateFibre(fibres: NeonFibreData[]): ValidationResult<NeonFibreData> {
  return SOWValidator.validateFibre(fibres);
}

/**
 * Validate data based on type
 * @deprecated Use SOWValidator.validateData instead
 */
export function validateData(data: any[], type: 'poles' | 'drops' | 'fibre'): ValidationResult<any> {
  return SOWValidator.validateData(data, type);
}

/**
 * Get validation summary
 * @deprecated Use SOWErrorHandler.getValidationSummary instead
 */
export function getValidationSummary(result: ValidationResult<any>): {
  totalCount: number;
  validCount: number;
  invalidCount: number;
  validationRate: number;
  errorSummary: { [key: string]: number };
} {
  const summary = SOWErrorHandler.getValidationSummary(result);
  return {
    totalCount: summary.totalRecords,
    validCount: summary.validRecords,
    invalidCount: summary.invalidRecords,
    validationRate: summary.validationRate,
    errorSummary: summary.errorsByCategory
  };
}

/**
 * Batch validate multiple datasets
 * @deprecated Use SOWErrorHandler.batchValidate instead
 */
export function batchValidate(datasets: { data: any[]; type: 'poles' | 'drops' | 'fibre' }[]): {
  results: ValidationResult<any>[];
  overallSummary: any;
} {
  const batchResult = SOWErrorHandler.batchValidate(datasets);
  return {
    results: batchResult.results,
    overallSummary: {
      totalDatasets: batchResult.summary.totalDatasets,
      totalRecords: batchResult.summary.totalRecords,
      totalValidRecords: batchResult.summary.totalValid,
      totalInvalidRecords: batchResult.summary.totalInvalid,
      overallValidationRate: batchResult.summary.overallValidationRate
    }
  };
}

// Legacy helper functions - maintained for backward compatibility
// @deprecated Use SOWValidationRules class instead

function isValidPoleType(type: string): boolean {
  const validTypes = ['concrete', 'steel', 'wood', 'composite', 'hybrid', 'other'];
  return validTypes.includes(type.toLowerCase());
}

function isValidPoleStatus(status: string): boolean {
  const validStatuses = ['planned', 'installed', 'complete', 'pending', 'in-progress', 'cancelled'];
  return validStatuses.includes(status.toLowerCase());
}

function isValidDateFormat(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString !== 'Invalid Date';
}

function categorizeError(error: string): string {
  const lowerError = error.toLowerCase();
  
  if (lowerError.includes('missing') || lowerError.includes('required')) {
    return 'Missing Data';
  } else if (lowerError.includes('duplicate')) {
    return 'Duplicate Records';
  } else if (lowerError.includes('invalid') && (lowerError.includes('latitude') || lowerError.includes('longitude'))) {
    return 'Invalid Coordinates';
  } else if (lowerError.includes('invalid') && lowerError.includes('date')) {
    return 'Invalid Dates';
  } else if (lowerError.includes('invalid') && (lowerError.includes('length') || lowerError.includes('number'))) {
    return 'Invalid Numbers';
  } else if (lowerError.includes('exceeds')) {
    return 'Data Inconsistency';
  } else {
    return 'Other Errors';
  }
}

/**
 * Cross-validate data relationships
 * @deprecated Use SOWValidator.crossValidateData instead
 */
export function crossValidateData(poles: NeonPoleData[], drops: NeonDropData[]): {
  orphanedDrops: string[];
  missingPoles: string[];
  warnings: string[];
} {
  const result = SOWValidator.crossValidateData(poles, drops);
  return {
    orphanedDrops: result.orphanedDrops.map(drop => drop.drop_number),
    missingPoles: result.missingPoles,
    warnings: result.orphanedDrops.length > 0 ? 
      [`${result.orphanedDrops.length} drops reference non-existent poles`] : []
  };
}