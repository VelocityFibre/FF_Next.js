import { log } from '@/lib/logger';

/**
 * Helper functions for data extraction and parsing
 */

/**
 * Extract value from multiple possible column names
 */
export function extractValue(row: Record<string, unknown>, possibleKeys: string[]): string | undefined {
  for (const key of possibleKeys) {
    // Try exact match
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return String(row[key]).trim();
    }
    
    // Try case-insensitive match
    const foundKey = Object.keys(row).find(k => 
      k.toLowerCase() === key.toLowerCase()
    );
    
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && row[foundKey] !== '') {
      return String(row[foundKey]).trim();
    }
  }
  return undefined;
}

/**
 * Extract number value
 */
export function extractNumber(row: Record<string, unknown>, possibleKeys: string[]): number | undefined {
  const value = extractValue(row, possibleKeys);
  if (value) {
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  }
  return undefined;
}

/**
 * Extract date value
 */
export function extractDate(row: Record<string, unknown>, possibleKeys: string[]): string | undefined {
  const value = extractValue(row, possibleKeys);
  if (value) {
    try {
      // Handle various date formats
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch (e) {
      log.warn('Failed to parse date:', { data: value }, 'helpers');
    }
  }
  return undefined;
}

/**
 * Parse boolean value
 */
export function parseBoolean(row: Record<string, unknown>, possibleKeys: string[]): boolean | undefined {
  const value = extractValue(row, possibleKeys);
  if (value) {
    const lowerValue = value.toLowerCase();
    if (['yes', 'true', '1', 'complete', 'completed'].includes(lowerValue)) {
      return true;
    } else if (['no', 'false', '0', 'incomplete', 'pending'].includes(lowerValue)) {
      return false;
    }
  }
  return undefined;
}