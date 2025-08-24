/**
 * SOW Validation System - Unified Interface
 * Provides access to all validation capabilities
 */

// Export all types
export * from './validator-types';

// Export validation rules
export * from './validation-rules';

// Export main validator
export * from './sow-validator';

// Export error handler
export * from './error-handler';

// Re-export main validation functions for backward compatibility
export {
  validatePoles,
  validateDrops,
  validateFibre,
  validateData,
  getValidationSummary,
  batchValidate,
  crossValidateData
} from '../validator';