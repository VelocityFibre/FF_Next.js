/**
 * Validation Service
 * Centralized exports for all validation functionality
 */

// Core validation
export { ValidationCore } from './validationCore';

// Individual validators
export { FieldValidator } from './fieldValidator';
export { BasicRules } from './basicRules';
export { FormatRules } from './formatRules';
export { DateRules } from './dateRules';
export { ValidationUtilities } from './utilities';

// Patterns
export { validationPatterns } from './patterns';

// Types
export type {
  ValidationResult,
  ValidationRule,
  ValidationSchema,
  ValidationPatterns,
} from './types';

// Create and export singleton instance
import { ValidationCore } from './validationCore';
export const validationService = new ValidationCore();

// Export class for legacy compatibility
export { ValidationCore as ValidationService };