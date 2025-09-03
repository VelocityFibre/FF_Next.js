/**
 * Validation Utilities
 * Handles validation of rating and performance values
 */

export class ValidationUtils {
  /**
   * Validate rating value (0-5 scale)
   */
  static validateRatingValue(value: any): number {
    if (typeof value !== 'number' || isNaN(value)) return 0;
    return Math.max(0, Math.min(5, value));
  }

  /**
   * Validate percentage value (0-100 scale)
   */
  static validatePercentageValue(value: any): number {
    if (typeof value !== 'number' || isNaN(value)) return 0;
    return Math.max(0, Math.min(100, value));
  }

  /**
   * Validate numeric value within range
   */
  static validateNumericValue(value: any, min: number = 0, max: number = Number.MAX_VALUE): number {
    if (typeof value !== 'number' || isNaN(value)) return min;
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Check if value is a valid non-negative number
   */
  static isValidPositiveNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && value >= 0;
  }

  /**
   * Check if value is within percentage range (0-100)
   */
  static isValidPercentage(value: any): boolean {
    return this.isValidPositiveNumber(value) && value <= 100;
  }

  /**
   * Check if value is within rating range (0-5)
   */
  static isValidRating(value: any): boolean {
    return this.isValidPositiveNumber(value) && value <= 5;
  }

  /**
   * Sanitize and validate array of numbers
   */
  static validateNumberArray(values: any[], validator: (value: any) => number = this.validateNumericValue): number[] {
    if (!Array.isArray(values)) return [];
    return values.map(validator).filter(val => val >= 0);
  }

  /**
   * Check if date is valid and not in future
   */
  static isValidPastDate(date: any): boolean {
    if (!date) return false;
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime()) && dateObj <= new Date();
  }
}