/**
 * Procurement Error Handling Framework
 * Comprehensive error types, handlers, and utilities for procurement operations
 */

// Base error classes
export {
  ProcurementError,
  QuoteError,
  ProcurementValidationError,
  ProcurementNotFoundError,
  ProcurementConflictError
} from './base.errors';

// BOQ-specific errors
export {
  BOQError,
  BOQMappingError,
  BOQImportError,
  BOQVersionError,
  BOQStateError
} from './boq.errors';

// RFQ-specific errors
export {
  RFQError,
  RFQValidationError,
  RFQStateError,
  RFQDeadlineError,
  RFQSupplierError
} from './rfq.errors';

// Stock management errors
export {
  StockError,
  InsufficientStockError,
  StockMovementError,
  StockReservationError
} from './stock.errors';

// Permission and authorization errors
export {
  ProcurementPermissionError,
  ProjectAccessDeniedError,
  SupplierAccessError,
  RoleAccessError
} from './permission.errors';

// Error constants and mappings
export {
  ProcurementErrorCodes,
  ErrorStatusCodes,
  ErrorSeverityLevels,
  ErrorCategories,
  RetryableErrorCodes,
  UserFacingErrorCodes,
  getErrorCategory,
  isRetryableError,
  isUserFacingError,
  getErrorSeverity
} from './error.constants';

// Error handling utilities
export {
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
  type ErrorResponse,
  type ErrorLogContext
} from './error.handlers';

