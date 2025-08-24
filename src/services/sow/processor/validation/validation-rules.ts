/**
 * SOW Validation Rules
 * Core validation rules and helper functions for SOW data
 */

import { ValidationError } from './validator-types';

export class SOWValidationRules {
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
   * Validate coordinates
   */
  static validateCoordinates(latitude?: number, longitude?: number): ValidationError[] {
    const errors: ValidationError[] = [];

    if (latitude !== undefined) {
      if (latitude < -90 || latitude > 90) {
        errors.push({
          field: 'latitude',
          value: latitude,
          message: `Invalid latitude: ${latitude}. Must be between -90 and 90`,
          severity: 'error',
          code: 'INVALID_LATITUDE'
        });
      }
    }

    if (longitude !== undefined) {
      if (longitude < -180 || longitude > 180) {
        errors.push({
          field: 'longitude',
          value: longitude,
          message: `Invalid longitude: ${longitude}. Must be between -180 and 180`,
          severity: 'error',
          code: 'INVALID_LONGITUDE'
        });
      }
    }

    return errors;
  }

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

    if (!this.isValidDateFormat(dateString)) {
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

  /**
   * Check for common data quality issues
   */
  static checkDataQuality(record: any): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for suspiciously similar coordinates (potential copy-paste errors)
    if (record.latitude && record.longitude) {
      const lat = record.latitude.toString();
      const lon = record.longitude.toString();
      
      if (lat === lon) {
        errors.push({
          field: 'coordinates',
          value: { latitude: record.latitude, longitude: record.longitude },
          message: 'Latitude and longitude are identical - possible data entry error',
          severity: 'warning',
          code: 'SUSPICIOUS_COORDINATES'
        });
      }
    }

    // Check for placeholder values
    const placeholderValues = ['test', 'placeholder', 'tbd', 'n/a', 'unknown', ''];
    Object.entries(record).forEach(([field, value]) => {
      if (typeof value === 'string' && placeholderValues.includes(value.toLowerCase())) {
        errors.push({
          field,
          value,
          message: `Field contains placeholder value: "${value}"`,
          severity: 'info',
          code: 'PLACEHOLDER_VALUE'
        });
      }
    });

    return errors;
  }
}