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
    const { transformPoles } = require('./transformer');
    return transformPoles(rawData);
  }

  // Process Lawley-style drops data
  processDrops(rawData: any[]) {
    const { transformDrops } = require('./transformer');
    return transformDrops(rawData);
  }

  // Process Lawley-style fibre data
  processFibre(rawData: any[]) {
    const { transformFibre } = require('./transformer');
    return transformFibre(rawData);
  }

  // Validate poles data
  validatePoles(poles: any[]) {
    const { validatePoles } = require('./validator');
    return validatePoles(poles);
  }

  // Validate drops data
  validateDrops(drops: any[]) {
    const { validateDrops } = require('./validator');
    return validateDrops(drops);
  }

  // Validate fibre data
  validateFibre(fibres: any[]) {
    const { validateFibre } = require('./validator');
    return validateFibre(fibres);
  }
}

// Export service instance for backward compatibility
export const sowDataProcessor = new SOWDataProcessor();