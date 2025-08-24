/**
 * Validation Types and Interfaces
 * Common types used across validation modules
 */

export interface ImportError {
  type: 'validation' | 'parsing' | 'business';
  row: number;
  column: string;
  message: string;
  severity?: 'error' | 'warning';
}

export interface ImportWarning {
  type: 'validation' | 'parsing' | 'business';
  row: number;
  column: string;
  message: string;
  severity?: 'warning' | 'info';
}

export interface ValidationOptions {
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean;
}

export interface ParseOptions {
  allowEmpty?: boolean;
  defaultValue?: any;
  transformValue?: (value: any) => any;
}

export interface ValidationResult<T = any> {
  value?: T;
  isValid: boolean;
  errors: ImportError[];
  warnings: ImportWarning[];
}

export type ValidationType = 
  | 'string'
  | 'number' 
  | 'date'
  | 'boolean'
  | 'email'
  | 'phone'
  | 'text';

export type ValidationRule = {
  type: ValidationType;
  options?: ValidationOptions;
  parseOptions?: ParseOptions;
};