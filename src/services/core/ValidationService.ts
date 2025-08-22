/**
 * ValidationService - Centralized validation logic
 * Provides reusable validation functions for forms and data
 */

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
};

export type ValidationRule<T> = {
  name: string;
  validator: (value: T) => boolean | string;
  message?: string;
  required?: boolean;
};

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

class ValidationService {
  // Common validation patterns
  private patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s-()]{10,}$/,
    url: /^https?:\/\/.+/,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    numeric: /^\d+$/,
    decimal: /^\d+(\.\d+)?$/,
  };

  /**
   * Validate a single value against rules
   */
  validateField<T>(value: T, rules: ValidationRule<T>[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of rules) {
      const result = rule.validator(value);
      
      if (result === false) {
        errors.push(rule.message || `${rule.name} validation failed`);
      } else if (typeof result === 'string') {
        errors.push(result);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate an object against a schema
   */
  validateSchema<T extends Record<string, unknown>>(
    data: T,
    schema: ValidationSchema<T>
  ): Record<keyof T, ValidationResult> & { isValid: boolean } {
    const results = {} as Record<keyof T, ValidationResult>;
    let overallValid = true;

    for (const field in schema) {
      const rules = schema[field];
      if (rules) {
        const fieldResult = this.validateField(data[field], rules);
        results[field] = fieldResult;
        if (!fieldResult.isValid) {
          overallValid = false;
        }
      }
    }

    return {
      ...results,
      isValid: overallValid,
    };
  }

  // Common validation rules

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
   * Email validation
   */
  email(message?: string): ValidationRule<string> {
    return {
      name: 'email',
      validator: (value) => {
        if (typeof value !== 'string') return false;
        return this.patterns.email.test(value);
      },
      message: message || 'Please enter a valid email address',
    };
  }

  /**
   * Phone number validation
   */
  phone(message?: string): ValidationRule<string> {
    return {
      name: 'phone',
      validator: (value) => {
        if (typeof value !== 'string') return false;
        return this.patterns.phone.test(value);
      },
      message: message || 'Please enter a valid phone number',
    };
  }

  /**
   * URL validation
   */
  url(message?: string): ValidationRule<string> {
    return {
      name: 'url',
      validator: (value) => {
        if (typeof value !== 'string') return false;
        return this.patterns.url.test(value);
      },
      message: message || 'Please enter a valid URL',
    };
  }

  /**
   * Password strength validation
   */
  password(message?: string): ValidationRule<string> {
    return {
      name: 'password',
      validator: (value) => {
        if (typeof value !== 'string') return false;
        return this.patterns.strongPassword.test(value);
      },
      message: message || 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
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
        if (typeof value === 'string') return this.patterns.numeric.test(value);
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

  // Utility methods

  /**
   * Sanitize string input
   */
  sanitize(value: string): string {
    return value
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .substring(0, 1000); // Limit length
  }

  /**
   * Check if value is empty
   */
  isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    return false;
  }

  /**
   * Format validation errors for display
   */
  formatErrors(errors: string[]): string {
    if (errors.length === 0) return '';
    if (errors.length === 1) return errors[0];
    return `• ${errors.join('\n• ')}`;
  }
}

// Export singleton instance
export const validationService = new ValidationService();
export default ValidationService;