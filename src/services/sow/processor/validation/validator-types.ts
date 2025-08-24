/**
 * SOW Validation Types
 * Type definitions for SOW data validation
 */

export interface ValidationResult<T> {
  valid: T[];
  invalid: any[];
  errors: string[];
}

export interface ValidationError {
  field: string;
  value: any;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: string;
}

export interface ValidationSummary {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  validationRate: number;
  errorsByCategory: Record<string, number>;
  mostCommonErrors: string[];
  criticalErrors: number;
  warnings: number;
}

export interface BatchValidationResult {
  results: ValidationResult<any>[];
  summary: {
    totalDatasets: number;
    totalRecords: number;
    totalValid: number;
    totalInvalid: number;
    overallValidationRate: number;
    datasetSummaries: {
      type: string;
      validationRate: number;
      errorCount: number;
    }[];
  };
}

export interface CrossValidationResult {
  orphanedDrops: any[];
  missingPoles: string[];
  inconsistentReferences: Array<{
    dropId: string;
    poleNumber: string;
    issue: string;
  }>;
  summary: {
    totalDrops: number;
    validReferences: number;
    invalidReferences: number;
  };
}

export interface ValidationRule<T> {
  field: keyof T;
  validator: (value: any, record: T) => ValidationError | null;
  required?: boolean;
  description: string;
}

export interface ValidationSchema<T> {
  name: string;
  rules: ValidationRule<T>[];
  crossValidationRules?: Array<{
    name: string;
    validator: (records: T[], relatedData?: any) => ValidationError[];
  }>;
}

export interface ValidationContext {
  strictMode?: boolean;
  allowPartialData?: boolean;
  skipCrossValidation?: boolean;
  customRules?: ValidationRule<any>[];
  errorThreshold?: number;
}

export type ValidationOptions = {
  validateCoordinates?: boolean;
  validateDates?: boolean;
  validateReferences?: boolean;
  allowEmptyValues?: boolean;
  customValidators?: Record<string, (value: any) => boolean>;
};