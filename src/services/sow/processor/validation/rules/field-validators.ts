/**
 * Field Validators
 * Specific field validation functions for SOW data
 */

import { ValidationError } from '../validator-types';
import { BasicValidators } from './basic-validators';

export class FieldValidators {
  /**
   * Validate pole number format
   */
  static validatePoleNumber(poleNumber: string): ValidationError | null {
    if (!poleNumber || poleNumber.trim() === '') {
      return {
        field: 'pole_number',
        value: poleNumber,
        message: 'Pole number is required',
        severity: 'error',
        code: 'MISSING_POLE_NUMBER'
      };
    }

    // Check for valid pole number format (alphanumeric, hyphens, underscores)
    const validFormat = /^[a-zA-Z0-9_-]+$/.test(poleNumber);
    if (!validFormat) {
      return {
        field: 'pole_number',
        value: poleNumber,
        message: `Invalid pole number format: ${poleNumber}. Only alphanumeric characters, hyphens, and underscores allowed`,
        severity: 'error',
        code: 'INVALID_POLE_NUMBER_FORMAT'
      };
    }

    return null;
  }

  /**
   * Validate drop ID format
   */
  static validateDropId(dropId: string): ValidationError | null {
    if (!dropId || dropId.trim() === '') {
      return {
        field: 'drop_id',
        value: dropId,
        message: 'Drop ID is required',
        severity: 'error',
        code: 'MISSING_DROP_ID'
      };
    }

    const validFormat = /^[a-zA-Z0-9_-]+$/.test(dropId);
    if (!validFormat) {
      return {
        field: 'drop_id',
        value: dropId,
        message: `Invalid drop ID format: ${dropId}`,
        severity: 'error',
        code: 'INVALID_DROP_ID_FORMAT'
      };
    }

    return null;
  }

  /**
   * Validate fibre length
   */
  static validateFibreLength(length?: number): ValidationError | null {
    if (length === undefined || length === null) {
      return null; // Optional field
    }

    if (length <= 0) {
      return {
        field: 'length',
        value: length,
        message: `Invalid fibre length: ${length}. Must be greater than 0`,
        severity: 'error',
        code: 'INVALID_FIBRE_LENGTH'
      };
    }

    if (length > 10000) { // 10km seems reasonable for a single fibre segment
      return {
        field: 'length',
        value: length,
        message: `Fibre length seems unusually large: ${length}m. Please verify`,
        severity: 'warning',
        code: 'LARGE_FIBRE_LENGTH'
      };
    }

    return null;
  }

  /**
   * Validate fibre type
   */
  static validateFibreType(type?: string): ValidationError | null {
    if (!type) return null; // Optional field

    const validTypes = [
      'single_mode',
      'multi_mode',
      'armored',
      'aerial',
      'underground',
      'direct_buried'
    ];

    if (!validTypes.includes(type.toLowerCase())) {
      return {
        field: 'fibre_type',
        value: type,
        message: `Invalid fibre type: ${type}. Valid types: ${validTypes.join(', ')}`,
        severity: 'error',
        code: 'INVALID_FIBRE_TYPE'
      };
    }

    return null;
  }

  /**
   * Validate service type
   */
  static validateServiceType(serviceType?: string): ValidationError | null {
    if (!serviceType) return null; // Optional field

    const validServices = [
      'residential',
      'business',
      'enterprise',
      'government',
      'backhaul',
      'distribution'
    ];

    if (!validServices.includes(serviceType.toLowerCase())) {
      return {
        field: 'service_type',
        value: serviceType,
        message: `Invalid service type: ${serviceType}. Valid types: ${validServices.join(', ')}`,
        severity: 'warning',
        code: 'INVALID_SERVICE_TYPE'
      };
    }

    return null;
  }

  /**
   * Validate height value
   */
  static validateHeight(height?: number): ValidationError | null {
    if (height === undefined || height === null) {
      return null; // Optional field
    }

    if (height < 0) {
      return {
        field: 'height',
        value: height,
        message: `Invalid height: ${height}. Cannot be negative`,
        severity: 'error',
        code: 'NEGATIVE_HEIGHT'
      };
    }

    if (height > 100) { // 100 meters seems like a reasonable max for poles
      return {
        field: 'height',
        value: height,
        message: `Height seems unusually large: ${height}m. Please verify`,
        severity: 'warning',
        code: 'LARGE_HEIGHT'
      };
    }

    return null;
  }

  /**
   * Validate address components
   */
  static validateAddress(address?: string): ValidationError | null {
    if (!address || address.trim() === '') {
      return null; // Optional field
    }

    if (address.length < 5) {
      return {
        field: 'address',
        value: address,
        message: `Address too short: "${address}". Minimum 5 characters`,
        severity: 'warning',
        code: 'SHORT_ADDRESS'
      };
    }

    if (address.length > 200) {
      return {
        field: 'address',
        value: address,
        message: `Address too long: ${address.length} characters. Maximum 200 characters`,
        severity: 'error',
        code: 'LONG_ADDRESS'
      };
    }

    return null;
  }

  /**
   * Validate installation date
   */
  static validateInstallationDate(dateString?: string): ValidationError | null {
    if (!dateString) return null; // Optional field

    if (!BasicValidators.isValidDateFormat(dateString)) {
      return {
        field: 'installation_date',
        value: dateString,
        message: `Invalid date format: ${dateString}`,
        severity: 'error',
        code: 'INVALID_DATE_FORMAT'
      };
    }

    const date = new Date(dateString);
    const now = new Date();
    const futureLimit = new Date();
    futureLimit.setFullYear(now.getFullYear() + 2); // 2 years in future

    if (date > futureLimit) {
      return {
        field: 'installation_date',
        value: dateString,
        message: `Installation date is too far in the future: ${dateString}`,
        severity: 'warning',
        code: 'FUTURE_DATE'
      };
    }

    const pastLimit = new Date();
    pastLimit.setFullYear(now.getFullYear() - 50); // 50 years in past

    if (date < pastLimit) {
      return {
        field: 'installation_date',
        value: dateString,
        message: `Installation date is too far in the past: ${dateString}`,
        severity: 'warning',
        code: 'VERY_OLD_DATE'
      };
    }

    return null;
  }
}