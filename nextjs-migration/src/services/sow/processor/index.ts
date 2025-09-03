/**
 * SOW Processor - Modular Export
 * Entry point for all SOW data processing operations
 */

// Export parser functions
export {
  processFile,
  extractValue,
  extractNumber,
  extractDate,
  parseBoolean
} from './parser';

// Import transformer functions for internal use
import { transformPoles, transformDrops, transformFibre } from './transformer';
import { validatePoles, validateDrops, validateFibre } from './validator';

// Export transformer functions
export {
  transformPoles,
  transformDrops,
  transformFibre,
  transformData,
  getTransformStats,
  enrichTransformedData
} from './transformer';

// Export validator functions
export {
  validatePoles,
  validateDrops,
  validateFibre,
  validateData,
  getValidationSummary,
  batchValidate,
  crossValidateData
} from './validator';

export type { ValidationResult } from './validator';

// Main processor class for backward compatibility
export class SOWDataProcessor {
  // Process uploaded file (Excel or CSV)
  async processFile(file: File, type: 'poles' | 'drops' | 'fibre'): Promise<any[]> {
    const { processFile } = await import('./parser');
    return processFile(file, type);
  }

  // Process Lawley-style poles data
  processPoles(rawData: any[]) {
    return transformPoles(rawData);
  }

  // Process Lawley-style drops data
  processDrops(rawData: any[]) {
    return transformDrops(rawData);
  }

  // Process Lawley-style fibre data
  processFibre(rawData: any[]) {
    return transformFibre(rawData);
  }

  // Validate poles data
  validatePoles(poles: any[]) {
    return validatePoles(poles);
  }

  // Validate drops data
  validateDrops(drops: any[]) {
    return validateDrops(drops);
  }

  // Validate fibre data
  validateFibre(fibres: any[]) {
    return validateFibre(fibres);
  }
}

// Export service instance for backward compatibility
export const sowDataProcessor = new SOWDataProcessor();