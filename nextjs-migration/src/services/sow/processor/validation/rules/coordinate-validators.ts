/**
 * Coordinate Validators
 * Geographic coordinate validation functions
 */

import { ValidationError } from '../validator-types';

export class CoordinateValidators {
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
   * Check for suspiciously similar coordinates
   */
  static validateCoordinateQuality(latitude?: number, longitude?: number): ValidationError[] {
    const errors: ValidationError[] = [];

    if (latitude && longitude) {
      const lat = latitude.toString();
      const lon = longitude.toString();
      
      if (lat === lon) {
        errors.push({
          field: 'coordinates',
          value: { latitude, longitude },
          message: 'Latitude and longitude are identical - possible data entry error',
          severity: 'warning',
          code: 'SUSPICIOUS_COORDINATES'
        });
      }
    }

    return errors;
  }
}