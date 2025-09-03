/**
 * Field Validator
 * Core validation logic for individual fields and schemas
 */

import type { ValidationResult, ValidationRule, ValidationSchema } from './types';

export class FieldValidator {
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
}