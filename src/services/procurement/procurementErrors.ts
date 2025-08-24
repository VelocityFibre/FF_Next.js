/**
 * Procurement Module Error Handling Framework - Legacy Compatibility Layer
 * 
 * @deprecated This file has been split into modular components for better maintainability.
 * 
 * New modular structure:
 * - base.errors.ts: Base error classes and utilities
 * - boq.errors.ts: BOQ-specific errors
 * - rfq.errors.ts: RFQ-specific errors  
 * - stock.errors.ts: Stock management errors
 * - permission.errors.ts: Authorization/permission errors
 * - error.constants.ts: Error codes and status mappings
 * - error.handlers.ts: Error handling utilities
 * 
 * For new code, import from the errors module:
 * ```typescript
 * import { ProcurementError, BOQMappingError, handleProcurementError } from '@/services/procurement/errors';
 * // or
 * import ProcurementErrors from '@/services/procurement/errors';
 * ```
 * 
 * This legacy layer maintains backward compatibility while the codebase transitions.
 */

// Import and re-export all error classes and utilities for backward compatibility
import {
  // Base error classes
  ProcurementError,
  QuoteError,
  ProcurementValidationError,
  ProcurementNotFoundError,
  ProcurementConflictError,
  
  // Specialized error classes
  BOQError,
  BOQMappingError,
  BOQImportError,
  BOQVersionError,
  BOQStateError,
  
  RFQError,
  RFQValidationError,
  RFQStateError,
  RFQDeadlineError,
  RFQSupplierError,
  
  StockError,
  InsufficientStockError,
  StockMovementError,
  StockReservationError,
  
  ProcurementPermissionError,
  ProjectAccessDeniedError,
  SupplierAccessError,
  RoleAccessError,
  
  // Constants and mappings
  ProcurementErrorCodes,
  ErrorStatusCodes,
  ErrorSeverityLevels,
  ErrorCategories,
  
  // Utilities
  createProcurementError,
  createValidationError,
  createNotFoundError,
  handleProcurementError,
  handleProcurementErrorWithContext,
  logProcurementError,
  aggregateErrors,
  sanitizeErrorContext,
  createErrorBoundary,
  retryOnError,
  
  // Utility functions
  getErrorCategory,
  isRetryableError,
  isUserFacingError,
  getErrorSeverity,
  
  // Types
  type ErrorResponse,
  type ErrorLogContext
} from './errors';

// Re-export everything
export {
  // Base error classes
  ProcurementError,
  QuoteError,
  ProcurementValidationError,
  ProcurementNotFoundError,
  ProcurementConflictError,
  
  // Specialized error classes
  BOQError,
  BOQMappingError,
  BOQImportError,
  BOQVersionError,
  BOQStateError,
  
  RFQError,
  RFQValidationError,
  RFQStateError,
  RFQDeadlineError,
  RFQSupplierError,
  
  StockError,
  InsufficientStockError,
  StockMovementError,
  StockReservationError,
  
  ProcurementPermissionError,
  ProjectAccessDeniedError,
  SupplierAccessError,
  RoleAccessError,
  
  // Constants and mappings
  ProcurementErrorCodes,
  ErrorStatusCodes,
  ErrorSeverityLevels,
  ErrorCategories,
  
  // Utilities
  createProcurementError,
  createValidationError,
  createNotFoundError,
  handleProcurementError,
  handleProcurementErrorWithContext,
  logProcurementError,
  aggregateErrors,
  sanitizeErrorContext,
  createErrorBoundary,
  retryOnError,
  
  // Utility functions
  getErrorCategory,
  isRetryableError,
  isUserFacingError,
  getErrorSeverity,
  
  // Types
  type ErrorResponse,
  type ErrorLogContext
};

// Legacy default export - maintains exact same interface
export default {
  ProcurementError,
  BOQError,
  BOQMappingError,
  RFQError,
  RFQValidationError,
  QuoteError,
  StockError,
  InsufficientStockError,
  ProcurementPermissionError,
  ProcurementErrorCodes,
  ErrorStatusCodes,
  createProcurementError,
  handleProcurementError,
  createValidationError,
  logProcurementError
} as const;