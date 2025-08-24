/**
 * Excel Parser - Legacy Compatibility Layer
 * @deprecated Use './parser' module instead for better modularity
 */

import { ExcelParser as ModularParser } from './parser';

/**
 * @deprecated Use ExcelParser from './parser' instead
 * Legacy wrapper for backward compatibility
 */
export class ExcelParser extends ModularParser {
  // All methods are inherited from the modular parser
}