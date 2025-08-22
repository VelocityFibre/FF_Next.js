/**
 * Safe date conversion utilities
 */

/**
 * Safely convert any date value to ISO string
 */
export function safeToISOString(date: any): string {
  try {
    // Handle null/undefined
    if (!date) {
      return new Date().toISOString();
    }

    // Handle Firebase Timestamp
    if (typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
      return date.toDate().toISOString();
    }

    // Handle ISO string
    if (typeof date === 'string') {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
      return new Date().toISOString();
    }

    // Handle Date object
    if (date instanceof Date) {
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
      return new Date().toISOString();
    }

    // Handle number (timestamp)
    if (typeof date === 'number') {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
      return new Date().toISOString();
    }

    // Default to current date
    return new Date().toISOString();
  } catch (error) {
    console.warn('Error converting date:', error, date);
    return new Date().toISOString();
  }
}

/**
 * Safely convert any date value to Date object
 */
export function safeToDate(date: any): Date {
  try {
    // Handle null/undefined
    if (!date) {
      return new Date();
    }

    // Handle Firebase Timestamp
    if (typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
      return date.toDate();
    }

    // Handle ISO string
    if (typeof date === 'string') {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
      return new Date();
    }

    // Handle Date object
    if (date instanceof Date) {
      if (!isNaN(date.getTime())) {
        return date;
      }
      return new Date();
    }

    // Handle number (timestamp)
    if (typeof date === 'number') {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
      return new Date();
    }

    // Default to current date
    return new Date();
  } catch (error) {
    console.warn('Error converting date:', error, date);
    return new Date();
  }
}

/**
 * Format date safely with fallback
 */
export function safeFormatDate(date: any, fallback: string = 'N/A'): string {
  try {
    const dateObj = safeToDate(date);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    return fallback;
  } catch (error) {
    console.warn('Error formatting date:', error, date);
    return fallback;
  }
}