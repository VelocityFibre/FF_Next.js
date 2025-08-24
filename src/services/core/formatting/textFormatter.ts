/**
 * Text Formatter
 * Handles text, name, and string formatting
 */

import type { AddressComponents, StatusBadge, StatusType } from './types';

export class TextFormatter {
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

  // Clean and format text input
  cleanText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s\-_.@]/g, ''); // Remove special characters except common ones
  }

  // Address formatting
  address(address: AddressComponents): string {
    const parts = [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].filter(Boolean);

    return parts.join(', ');
  }

  // Status badge formatting
  status(status: string, type: StatusType = 'info'): StatusBadge {
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
}