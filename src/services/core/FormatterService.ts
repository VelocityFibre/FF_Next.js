/**
 * FormatterService - Legacy Compatibility Layer
 * @deprecated Use imports from @/services/core/formatting instead
 * 
 * This file provides backward compatibility for existing imports.
 * New code should import directly from the modular structure:
 * - import { formatterService } from '@/services/core/formatting'
 * 
 * Original file: 344 lines → Split into focused modules
 */

// Re-export everything from the new modular structure
export {
  FormatterService,
  formatterService,
  type CurrencyOptions,
  type DateFormatOptions,
  type NumberFormatOptions,
  type StatusBadge,
  type AddressComponents,
  type StatusType,
  type PhoneFormat,
} from './formatting';

// Export as default for backward compatibility
export { FormatterService as default } from './formatting';