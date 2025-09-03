/**
 * Import Validation - Backward Compatibility Layer
 * @deprecated Use ./validation/index.ts instead for improved modular validation
 * 
 * This file provides backward compatibility for existing imports.
 * New code should use the modular validation system in ./validation/
 */

// Re-export all validation functions and types from the new modular structure
export {
  validateBOQItem,
  validateBOQItems,
  validateDataConsistency,
  parseNumber,
  validateString,
  parseDate,
  parseBoolean,
  BOQItemValidationSchema,
  ExtendedBOQItemSchema,
  validatePriceConsistency,
  validateDataQuality,
  validateProcurementRules,
  validateCrossItemDependencies,
  sanitizeText,
  isValidEmail,
  isValidPhone,
  normalizeString
} from './validation/index';

// Re-export types
export type {
  BOQItemValidation,
  ExtendedBOQItem,
  ImportFileMetadata,
  ValidationSettings
} from './validation/index';