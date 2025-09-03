/**
 * Date Validation Rules
 * Rules for date and date range validation
 */

import type { ValidationRule } from './types';

export class DateRules {
  /**
   * Date validation
   */
  date(message?: string): ValidationRule<string | Date> {
    return {
      name: 'date',
      validator: (value) => {
        if (value instanceof Date) return !isNaN(value.getTime());
        if (typeof value === 'string') {
          const date = new Date(value);
          return !isNaN(date.getTime());
        }
        return false;
      },
      message: message || 'Please enter a valid date',
    };
  }

  /**
   * Date range validation
   */
  dateRange(min?: Date, max?: Date, message?: string): ValidationRule<string | Date> {
    return {
      name: 'dateRange',
      validator: (value) => {
        let date: Date;
        if (value instanceof Date) {
          date = value;
        } else if (typeof value === 'string') {
          date = new Date(value);
        } else {
          return false;
        }

        if (isNaN(date.getTime())) return false;
        if (min && date < min) return false;
        if (max && date > max) return false;
        return true;
      },
      message: message || 'Date is outside the allowed range',
    };
  }

  /**
   * Conditional validation - only validate if condition is met
   */
  when<T>(
    _condition: (data: T) => boolean,
    rules: ValidationRule<T>[]
  ): ValidationRule<T> {
    return {
      name: 'conditional',
      validator: (value: T) => {
        // Note: Conditional validation requires context data
        // This is a simplified implementation
        for (const rule of rules) {
          const result = rule.validator(value);
          if (result === false || typeof result === 'string') {
            return result;
          }
        }
        return true;
      },
    };
  }
}