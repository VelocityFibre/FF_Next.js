/**
 * Number Formatter
 * Handles currency, number, and percentage formatting
 */

import type { CurrencyOptions, NumberFormatOptions } from './types';

export class NumberFormatter {
  private defaultLocale = 'en-US';
  private defaultCurrency = 'SGD'; // Singapore Dollar for FibreFlow

  // Currency formatting
  currency(
    amount: number,
    options: CurrencyOptions = {}
  ): string {
    const {
      currency = this.defaultCurrency,
      locale = this.defaultLocale,
      minimumFractionDigits = 2,
      maximumFractionDigits = 2,
    } = options;

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(amount);
    } catch (error) {
      console.warn('Currency formatting failed:', error);
      return `${currency} ${amount.toFixed(minimumFractionDigits)}`;
    }
  }

  // Number formatting
  number(
    value: number,
    options: NumberFormatOptions = {}
  ): string {
    const {
      locale = this.defaultLocale,
      style = 'decimal',
      minimumFractionDigits = 0,
      maximumFractionDigits = 2,
      unit,
    } = options;

    try {
      const formatOptions: Intl.NumberFormatOptions = {
        style,
        minimumFractionDigits,
        maximumFractionDigits,
      };

      if (unit && style === 'unit') {
        formatOptions.unit = unit;
      }

      return new Intl.NumberFormat(locale, formatOptions).format(value);
    } catch (error) {
      console.warn('Number formatting failed:', error);
      return value.toString();
    }
  }

  // Percentage formatting
  percentage(value: number, decimals: number = 1): string {
    return this.number(value, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  // File size formatting
  fileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);

    return `${size.toFixed(i > 0 ? 1 : 0)} ${sizes[i]}`;
  }
}