/**
 * Formatting Types
 * Type definitions for formatting services
 */

export interface CurrencyOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export interface DateFormatOptions {
  locale?: string;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  timeZone?: string;
}

export interface NumberFormatOptions {
  locale?: string;
  style?: 'decimal' | 'percent' | 'unit';
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  unit?: string;
}

export interface StatusBadge {
  text: string;
  color: string;
  bgColor: string;
}

export interface AddressComponents {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export type StatusType = 'success' | 'warning' | 'error' | 'info';
export type PhoneFormat = 'international' | 'national';