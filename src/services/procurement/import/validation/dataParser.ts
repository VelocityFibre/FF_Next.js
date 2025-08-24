/**
 * Data Parser - Backward Compatibility Layer
 * @deprecated Use ./parser/index.ts for improved modular data parsing
 * 
 * This file provides backward compatibility for existing imports.
 * New code should use the modular parser system in ./parser/
 */

// Re-export everything from the new modular structure
export * from './parser';

// Import specific functions for backward compatibility
export { 
  parseNumber,
  parseDate,
  parseBoolean,
  readString,
  readValue
} from './parser/data-reader';

export {
  isNumberFormat,
  isDateFormat,
  isBooleanFormat,
  isEmailFormat,
  isPhoneFormat,
  detectDataType
} from './parser/format-detector';

export {
  validateAgainstSchema,
  validateField,
  generateSchemaFromData
} from './parser/schema-validator';

// Legacy functions for backward compatibility
export function validateString(
  value: any,
  row: number,
  field: string,
  errors: any[],
  warnings: any[],
  maxLength?: number,
  required: boolean = false
): string | undefined {
  // Import the readString function and adapt it
  const { readString } = require('./parser/data-reader');
  const context = { row, field };
  return readString(value, context, errors, warnings);
}

export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  return text
    .replace(/[<>]/g, '')
    .replace(/[\r\n\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isValidEmail(email: string): boolean {
  const { isEmailFormat } = require('./parser/format-detector');
  return isEmailFormat(email);
}

export function isValidPhone(phone: string): boolean {
  const { isPhoneFormat } = require('./parser/format-detector');
  return isPhoneFormat(phone);
}

export function normalizeString(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}