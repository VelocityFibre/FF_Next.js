/**
 * Basic Validators
 * Simple validation functions for common data types
 */

import { ValidationError } from '../validator-types';

export class BasicValidators {
  /**
   * Validate pole type
   */
  static isValidPoleType(type: string): boolean {
    const validTypes = ['wood', 'concrete', 'steel', 'composite'];
    return validTypes.includes(type.toLowerCase());
  }

  /**
   * Validate pole status
   */
  static isValidPoleStatus(status: string): boolean {
    const validStatuses = ['planned', 'installed', 'existing', 'removed'];
    return validStatuses.includes(status.toLowerCase());
  }

  /**
   * Validate date format
   */
  static isValidDateFormat(dateString: string): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * Validate status values
   */
  static validateStatus(status: string, validStatuses: string[]): ValidationError | null {
    if (!status) {
      return {
        field: 'status',
        value: status,
        message: 'Status is required',
        severity: 'error',
        code: 'MISSING_STATUS'
      };
    }

    if (!validStatuses.includes(status.toLowerCase())) {
      return {
        field: 'status',
        value: status,
        message: `Invalid status: ${status}. Valid values: ${validStatuses.join(', ')}`,
        severity: 'error',
        code: 'INVALID_STATUS'
      };
    }

    return null;
  }
}