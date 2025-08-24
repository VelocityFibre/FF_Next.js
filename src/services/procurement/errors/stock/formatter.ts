/**
 * Stock Error Formatter - Legacy Compatibility Layer
 * @deprecated This file has been split into modular components for better maintainability.
 * 
 * NEW STRUCTURE:
 * - formatter/error-formatter.ts - Core error formatting and message generation
 * - formatter/display-formatter.ts - UI/display formatting and visualization helpers
 * - formatter/log-formatter.ts - Logging and debugging formatters
 * - formatter/formatter-types.ts - TypeScript interfaces and formatter types
 * 
 * Please use the new modular imports:
 * import { CoreErrorFormatter, DisplayFormatter, LogFormatter } from './formatter';
 * 
 * This file will be removed in a future version. Use the modular structure instead.
 */

// Import from new modular structure for backward compatibility
import { StockErrorFormatter as NewStockErrorFormatter } from './formatter';

// Re-export everything from the new modular structure
export * from './formatter';

/**
 * Legacy StockErrorFormatter class for backward compatibility
 * @deprecated Use CoreErrorFormatter, DisplayFormatter, and LogFormatter from './formatter' instead
 */
export class StockErrorFormatter extends NewStockErrorFormatter {
  // All functionality is now provided by the new modular structure
  // This class exists only for backward compatibility
}