/**
 * FormatterService - Data formatting and display utilities
 * Provides consistent formatting across the application
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

class FormatterService {
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

  // Date and time formatting
  date(
    date: Date | string,
    options: DateFormatOptions = {}
  ): string {
    const {
      locale = this.defaultLocale,
      dateStyle = 'medium',
      timeStyle,
      timeZone,
    } = options;

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    try {
      const formatOptions: Intl.DateTimeFormatOptions = {
        dateStyle,
      };

      if (timeStyle) {
        formatOptions.timeStyle = timeStyle;
      }

      if (timeZone) {
        formatOptions.timeZone = timeZone;
      }

      return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
    } catch (error) {
      console.warn('Date formatting failed:', error);
      return dateObj.toLocaleDateString();
    }
  }

  // Time only formatting
  time(date: Date | string, includeSeconds: boolean = false): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Time';
    }

    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };

    if (includeSeconds) {
      options.second = '2-digit';
    }

    return dateObj.toLocaleTimeString(this.defaultLocale, options);
  }

  // Relative time formatting (e.g., "2 hours ago")
  relativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }

    return 'Just now';
  }

  // Duration formatting (e.g., "2h 30m")
  duration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const parts: string[] = [];
    
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0 && hours === 0) parts.push(`${remainingSeconds}s`);

    return parts.join(' ');
  }

  // File size formatting
  fileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);

    return `${size.toFixed(i > 0 ? 1 : 0)} ${sizes[i]}`;
  }

  // Phone number formatting
  phone(phoneNumber: string, format: 'international' | 'national' = 'national'): string {
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

  // Address formatting
  address(address: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }): string {
    const parts = [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].filter(Boolean);

    return parts.join(', ');
  }

  // Name formatting
  fullName(firstName?: string, lastName?: string, middleName?: string): string {
    const parts = [firstName, middleName, lastName].filter(Boolean);
    return parts.join(' ');
  }

  // Initials
  initials(firstName?: string, lastName?: string): string {
    const first = firstName?.charAt(0).toUpperCase() || '';
    const last = lastName?.charAt(0).toUpperCase() || '';
    return first + last;
  }

  // Text truncation
  truncate(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  // Capitalize words
  capitalize(text: string): string {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Camel case to title case
  camelToTitle(text: string): string {
    return text
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  // Status badge formatting
  status(status: string, type: 'success' | 'warning' | 'error' | 'info' = 'info'): {
    text: string;
    color: string;
    bgColor: string;
  } {
    const colors = {
      success: { color: 'border-green-300', bgColor: 'bg-green-100', textColor: 'text-green-800' },
      warning: { color: 'border-yellow-300', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
      error: { color: 'border-red-300', bgColor: 'bg-red-100', textColor: 'text-red-800' },
      info: { color: 'border-blue-300', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
    };

    return {
      text: this.capitalize(status),
      color: colors[type].color,
      bgColor: colors[type].bgColor,
    };
  }

  // JSON formatting for display
  json(obj: unknown, indent: number = 2): string {
    try {
      return JSON.stringify(obj, null, indent);
    } catch (error) {
      return 'Invalid JSON';
    }
  }

  // URL formatting
  url(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }

  // Clean and format text input
  cleanText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s\-_.@]/g, ''); // Remove special characters except common ones
  }
}

// Export singleton instance
export const formatterService = new FormatterService();
export default FormatterService;