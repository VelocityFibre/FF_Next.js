/**
 * Basic Validation Rules
 * Common validation rules (required, length, numeric, etc.)
 */

import type { ValidationRule } from './types';
import { validationPatterns } from './patterns';

export class BasicRules {
  /**
   * Required field validation
   */
  required<T>(message?: string): ValidationRule<T> {
    return {
      name: 'required',
      validator: (value) => {
        if (value === null || value === undefined || value === '') {
          return false;
        }
        if (Array.isArray(value) && value.length === 0) {
          return false;
        }
        return true;
      },
      message: message || 'This field is required',
      required: true,
    };
  }

  /**
   * String length validation
   */
  length(min?: number, max?: number, message?: string): ValidationRule<string> {
    return {
      name: 'length',
      validator: (value) => {
        if (typeof value !== 'string') return false;
        const len = value.length;
        if (min !== undefined && len < min) return false;
        if (max !== undefined && len > max) return false;
        return true;
      },
      message: message || `Length must be ${min ? `at least ${min}` : ''}${min && max ? ' and ' : ''}${max ? `at most ${max}` : ''} characters`,
    };
  }

  /**
   * Numeric validation
   */
  numeric(message?: string): ValidationRule<string | number> {
    return {
      name: 'numeric',
      validator: (value) => {
        if (typeof value === 'number') return !isNaN(value);
        if (typeof value === 'string') return validationPatterns.numeric.test(value);
        return false;
      },
      message: message || 'Please enter a valid number',
    };
  }

  /**
   * Range validation for numbers
   */
  range(min?: number, max?: number, message?: string): ValidationRule<number> {
    return {
      name: 'range',
      validator: (value) => {
        if (typeof value !== 'number' || isNaN(value)) return false;
        if (min !== undefined && value < min) return false;
        if (max !== undefined && value > max) return false;
        return true;
      },
      message: message || `Value must be ${min ? `at least ${min}` : ''}${min && max ? ' and ' : ''}${max ? `at most ${max}` : ''}`,
    };
  }

  /**
   * Custom validation rule
   */
  custom<T>(
    validator: (value: T) => boolean | string,
    name: string,
    message?: string
  ): ValidationRule<T> {
    return {
      name,
      validator,
      message: message || `${name} validation failed`,
    };
  }
}