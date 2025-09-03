/**
 * Error Utilities
 * Functions for error categorization, severity determination, and classification
 */

// import { ValidationError } from '../validator-types';

export class ErrorUtils {
  /**
   * Categorize error by type
   */
  static categorizeError(error: string): string {
    if (error.includes('latitude') || error.includes('longitude') || error.includes('coordinate')) {
      return 'Geographic';
    } else if (error.includes('date') || error.includes('Date')) {
      return 'Temporal';
    } else if (error.includes('required') || error.includes('Missing')) {
      return 'Required Fields';
    } else if (error.includes('format') || error.includes('Invalid')) {
      return 'Format/Type';
    } else if (error.includes('duplicate') || error.includes('Duplicate')) {
      return 'Duplicates';
    } else if (error.includes('reference') || error.includes('orphaned')) {
      return 'References';
    } else {
      return 'Other';
    }
  }

  /**
   * Get severity level for error
   */
  static getErrorSeverity(errorCode: string): 'error' | 'warning' | 'info' {
    const criticalErrors = [
      'MISSING_POLE_NUMBER',
      'MISSING_DROP_ID',
      'INVALID_LATITUDE',
      'INVALID_LONGITUDE',
      'NEGATIVE_HEIGHT',
      'INVALID_DATE_FORMAT'
    ];

    const warnings = [
      'LARGE_FIBRE_LENGTH',
      'LARGE_HEIGHT',
      'FUTURE_DATE',
      'VERY_OLD_DATE',
      'SHORT_ADDRESS',
      'INVALID_SERVICE_TYPE'
    ];

    if (criticalErrors.includes(errorCode)) {
      return 'error';
    } else if (warnings.includes(errorCode)) {
      return 'warning';
    } else {
      return 'info';
    }
  }
}