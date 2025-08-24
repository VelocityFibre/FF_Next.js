/**
 * Validation Utility Functions - Backward Compatibility Layer
 * @deprecated Use ./modules/index.ts for improved modular validation system
 * 
 * This file provides backward compatibility for existing imports.
 * New code should use the modular validation system in ./modules/
 */

// Re-export everything from the new modular structure
export * from './modules';

// Import specific functions for backward compatibility
export { 
  parseNumber,
  validateString, 
  parseDate,
  parseBoolean,
  sanitizeText,
  normalizeString,
  parseEmail,
  parsePhone
} from './modules/validation-helpers';

export {
  isValidEmail,
  isValidPhone,
  isValidDate
} from './modules/validation-rules';