/**
 * SOW Types - Barrel export for all SOW type definitions
 */

// Base types
export * from './base.types';

// Enum types (priority export - others import from here)
export * from './enums.types';

// Pole types
export * from './pole.types';

// Drop types (excluding conflicting enums)
export type { 
  DropData, 
  DropAnalytics, 
  DropFilterOptions, 
  DropSortOptions,
  DropValidation,
  DropTestResult 
} from './drop.types';

// Drop enums (value exports)
export {
  ServiceType,
  Priority
} from './drop.types';

// Fibre types (excluding conflicting enums)  
export type {
  FibreData,
  FibreAnalytics,
  FibreSegment,
  FibreTestResult
} from './fibre.types';

// Fibre enums (value exports)
export {
  CableType,
  InstallationMethod,
  TestResultStatus,
  ConduitType
} from './fibre.types';

// Validation types (excluding ValidationStatus)
export type {
  ValidationResult,
  ImportValidation,
  ColumnMapping,
  DataQualityReport,
  ValidationRule
} from './validation.types';

// Validation enums (value exports)
export {
  ValidationCriticality
} from './validation.types';

// Analytics types
export * from './analytics.types';