/**
 * Format Validation Rules
 * Rules for email, phone, URL, password validation
 */

import type { ValidationRule } from './types';
import { validationPatterns } from './patterns';

export class FormatRules {
  /**
   * Email validation
   */
  email(message?: string): ValidationRule<string> {
    return {
      name: 'email',
      validator: (value) => {
        if (typeof value !== 'string') return false;
        return validationPatterns.email.test(value);
      },
      message: message || 'Please enter a valid email address',
    };
  }

  /**
   * Phone number validation
   */
  phone(message?: string): ValidationRule<string> {
    return {
      name: 'phone',
      validator: (value) => {
        if (typeof value !== 'string') return false;
        return validationPatterns.phone.test(value);
      },
      message: message || 'Please enter a valid phone number',
    };
  }

  /**
   * URL validation
   */
  url(message?: string): ValidationRule<string> {
    return {
      name: 'url',
      validator: (value) => {
        if (typeof value !== 'string') return false;
        return validationPatterns.url.test(value);
      },
      message: message || 'Please enter a valid URL',
    };
  }

  /**
   * Password strength validation
   */
  password(message?: string): ValidationRule<string> {
    return {
      name: 'password',
      validator: (value) => {
        if (typeof value !== 'string') return false;
        return validationPatterns.strongPassword.test(value);
      },
      message: message || 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
    };
  }
}