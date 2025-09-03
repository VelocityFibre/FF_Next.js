/**
 * Phone Formatter
 * Handles phone number formatting for different regions
 */

import type { PhoneFormat } from './types';

export class PhoneFormatter {
  // Phone number formatting
  phone(phoneNumber: string, format: PhoneFormat = 'national'): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    if (cleaned.length === 8) {
      // Singapore local number
      return cleaned.replace(/(\d{4})(\d{4})/, '$1 $2');
    }

    if (cleaned.length === 10) {
      // Standard 10-digit number
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, format === 'international' ? '+1 ($1) $2-$3' : '($1) $2-$3');
    }

    if (cleaned.length === 11 && cleaned.startsWith('65')) {
      // Singapore number with country code
      const local = cleaned.substring(2);
      return format === 'international' 
        ? `+65 ${local.replace(/(\d{4})(\d{4})/, '$1 $2')}`
        : local.replace(/(\d{4})(\d{4})/, '$1 $2');
    }

    // Return as-is if we can't format it
    return phoneNumber;
  }
}