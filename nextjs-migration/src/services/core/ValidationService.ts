/**
 * ValidationService - Legacy Compatibility Layer
 * @deprecated Use imports from @/services/core/validation instead
 * 
 * This file provides backward compatibility for existing imports.
 * New code should import directly from the modular structure:
 * - import { validationService } from '@/services/core/validation'
 * 
 * Original file: 330 lines → Split into focused modules
 */

// Re-export everything from the new modular structure
export {
  ValidationService,
  validationService,
  validationPatterns,
  type ValidationResult,
  type ValidationRule,
  type ValidationSchema,
  type ValidationPatterns,
} from './validation';

// Export as default for backward compatibility
export { ValidationService as default } from './validation';