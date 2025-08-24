/**
 * Formatting Service
 * Centralized exports for all formatting functionality
 */

// Core formatter
export { FormatterCore } from './formatterCore';

// Individual formatters
export { NumberFormatter } from './numberFormatter';
export { DateFormatter } from './dateFormatter';
export { TextFormatter } from './textFormatter';
export { PhoneFormatter } from './phoneFormatter';

// Types
export type {
  CurrencyOptions,
  DateFormatOptions,
  NumberFormatOptions,
  StatusBadge,
  AddressComponents,
  StatusType,
  PhoneFormat,
} from './types';

// Create and export singleton instance
import { FormatterCore } from './formatterCore';
export const formatterService = new FormatterCore();

// Export class for legacy compatibility
export { FormatterCore as FormatterService };