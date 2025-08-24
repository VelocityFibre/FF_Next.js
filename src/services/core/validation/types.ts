/**
 * Validation Types
 * Type definitions for validation services
 */

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
};

export type ValidationRule<T> = {
  name: string;
  validator: (value: T) => boolean | string;
  message?: string;
  required?: boolean;
};

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

export type ValidationPatterns = {
  email: RegExp;
  phone: RegExp;
  url: RegExp;
  uuid: RegExp;
  strongPassword: RegExp;
  alphanumeric: RegExp;
  numeric: RegExp;
  decimal: RegExp;
};