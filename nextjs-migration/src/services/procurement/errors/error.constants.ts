/**
 * Error Constants and Status Code Mappings
 * Centralized error codes and HTTP status mappings for procurement operations
 */

/**
 * Standard error codes used throughout the procurement system
 * These codes provide consistent error identification across all modules
 */
export const ProcurementErrorCodes = {
  // General errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INVALID_STATE: 'INVALID_STATE',
  VERSION_CONFLICT: 'VERSION_CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_REFERENCE: 'INVALID_REFERENCE',
  
  // Authentication/Authorization errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  PROJECT_ACCESS_DENIED: 'PROJECT_ACCESS_DENIED',
  ROLE_ACCESS_DENIED: 'ROLE_ACCESS_DENIED',
  
  // BOQ (Bill of Quantities) errors
  BOQ_NOT_FOUND: 'BOQ_NOT_FOUND',
  BOQ_MAPPING_ERROR: 'BOQ_MAPPING_ERROR',
  BOQ_IMPORT_FAILED: 'BOQ_IMPORT_FAILED',
  BOQ_INVALID_VERSION: 'BOQ_INVALID_VERSION',
  BOQ_ALREADY_APPROVED: 'BOQ_ALREADY_APPROVED',
  BOQ_INVALID_STATE: 'BOQ_INVALID_STATE',
  BOQ_CATALOG_MISMATCH: 'BOQ_CATALOG_MISMATCH',
  
  // RFQ (Request for Quotation) errors
  RFQ_NOT_FOUND: 'RFQ_NOT_FOUND',
  RFQ_VALIDATION_ERROR: 'RFQ_VALIDATION_ERROR',
  RFQ_ALREADY_ISSUED: 'RFQ_ALREADY_ISSUED',
  RFQ_DEADLINE_PASSED: 'RFQ_DEADLINE_PASSED',
  RFQ_NO_SUPPLIERS: 'RFQ_NO_SUPPLIERS',
  RFQ_INVALID_STATE: 'RFQ_INVALID_STATE',
  RFQ_SUPPLIER_ERROR: 'RFQ_SUPPLIER_ERROR',
  
  // Quote errors
  QUOTE_NOT_FOUND: 'QUOTE_NOT_FOUND',
  QUOTE_EXPIRED: 'QUOTE_EXPIRED',
  QUOTE_ALREADY_SUBMITTED: 'QUOTE_ALREADY_SUBMITTED',
  QUOTE_EVALUATION_ERROR: 'QUOTE_EVALUATION_ERROR',
  QUOTE_INVALID_FORMAT: 'QUOTE_INVALID_FORMAT',
  QUOTE_INCOMPLETE: 'QUOTE_INCOMPLETE',
  
  // Stock management errors
  STOCK_NOT_FOUND: 'STOCK_NOT_FOUND',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  STOCK_MOVEMENT_FAILED: 'STOCK_MOVEMENT_FAILED',
  INVALID_STOCK_OPERATION: 'INVALID_STOCK_OPERATION',
  STOCK_RESERVATION_FAILED: 'STOCK_RESERVATION_FAILED',
  STOCK_LOCATION_ERROR: 'STOCK_LOCATION_ERROR',
  
  // Supplier errors
  SUPPLIER_NOT_FOUND: 'SUPPLIER_NOT_FOUND',
  SUPPLIER_ACCESS_DENIED: 'SUPPLIER_ACCESS_DENIED',
  SUPPLIER_INVITATION_EXPIRED: 'SUPPLIER_INVITATION_EXPIRED',
  SUPPLIER_NOT_QUALIFIED: 'SUPPLIER_NOT_QUALIFIED',
  SUPPLIER_BLACKLISTED: 'SUPPLIER_BLACKLISTED',
  
  // Purchase Order errors
  PO_NOT_FOUND: 'PO_NOT_FOUND',
  PO_ALREADY_APPROVED: 'PO_ALREADY_APPROVED',
  PO_EXCEEDS_BUDGET: 'PO_EXCEEDS_BUDGET',
  PO_INVALID_STATE: 'PO_INVALID_STATE',
  
  // Approval workflow errors
  APPROVAL_REQUIRED: 'APPROVAL_REQUIRED',
  APPROVAL_REJECTED: 'APPROVAL_REJECTED',
  APPROVAL_WORKFLOW_ERROR: 'APPROVAL_WORKFLOW_ERROR',
  INSUFFICIENT_APPROVAL_LEVEL: 'INSUFFICIENT_APPROVAL_LEVEL',
  
  // Integration errors
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  API_RATE_LIMIT: 'API_RATE_LIMIT',
  SYNC_ERROR: 'SYNC_ERROR',
  EXPORT_ERROR: 'EXPORT_ERROR',
  IMPORT_ERROR: 'IMPORT_ERROR'
} as const;

/**
 * HTTP status code mappings for error types
 * Maps procurement error codes to appropriate HTTP status codes
 */
export const ErrorStatusCodes: Record<string, number> = {
  // General errors (4xx series)
  VALIDATION_ERROR: 422, // Unprocessable Entity
  NOT_FOUND: 404, // Not Found
  DUPLICATE_ENTRY: 409, // Conflict
  INVALID_STATE: 409, // Conflict
  VERSION_CONFLICT: 409, // Conflict
  INTERNAL_ERROR: 500, // Internal Server Error
  INVALID_REFERENCE: 400, // Bad Request
  
  // Authentication/Authorization errors (4xx series)
  UNAUTHORIZED: 401, // Unauthorized
  INSUFFICIENT_PERMISSIONS: 403, // Forbidden
  PROJECT_ACCESS_DENIED: 403, // Forbidden
  ROLE_ACCESS_DENIED: 403, // Forbidden
  
  // BOQ errors
  BOQ_NOT_FOUND: 404, // Not Found
  BOQ_MAPPING_ERROR: 422, // Unprocessable Entity
  BOQ_IMPORT_FAILED: 400, // Bad Request
  BOQ_INVALID_VERSION: 409, // Conflict
  BOQ_ALREADY_APPROVED: 409, // Conflict
  BOQ_INVALID_STATE: 409, // Conflict
  BOQ_CATALOG_MISMATCH: 422, // Unprocessable Entity
  
  // RFQ errors
  RFQ_NOT_FOUND: 404, // Not Found
  RFQ_VALIDATION_ERROR: 422, // Unprocessable Entity
  RFQ_ALREADY_ISSUED: 409, // Conflict
  RFQ_DEADLINE_PASSED: 410, // Gone
  RFQ_NO_SUPPLIERS: 400, // Bad Request
  RFQ_INVALID_STATE: 409, // Conflict
  RFQ_SUPPLIER_ERROR: 400, // Bad Request
  
  // Quote errors
  QUOTE_NOT_FOUND: 404, // Not Found
  QUOTE_EXPIRED: 410, // Gone
  QUOTE_ALREADY_SUBMITTED: 409, // Conflict
  QUOTE_EVALUATION_ERROR: 422, // Unprocessable Entity
  QUOTE_INVALID_FORMAT: 400, // Bad Request
  QUOTE_INCOMPLETE: 400, // Bad Request
  
  // Stock errors
  STOCK_NOT_FOUND: 404, // Not Found
  INSUFFICIENT_STOCK: 409, // Conflict
  STOCK_MOVEMENT_FAILED: 400, // Bad Request
  INVALID_STOCK_OPERATION: 409, // Conflict
  STOCK_RESERVATION_FAILED: 409, // Conflict
  STOCK_LOCATION_ERROR: 400, // Bad Request
  
  // Supplier errors
  SUPPLIER_NOT_FOUND: 404, // Not Found
  SUPPLIER_ACCESS_DENIED: 403, // Forbidden
  SUPPLIER_INVITATION_EXPIRED: 410, // Gone
  SUPPLIER_NOT_QUALIFIED: 403, // Forbidden
  SUPPLIER_BLACKLISTED: 403, // Forbidden
  
  // Purchase Order errors
  PO_NOT_FOUND: 404, // Not Found
  PO_ALREADY_APPROVED: 409, // Conflict
  PO_EXCEEDS_BUDGET: 400, // Bad Request
  PO_INVALID_STATE: 409, // Conflict
  
  // Approval workflow errors
  APPROVAL_REQUIRED: 403, // Forbidden
  APPROVAL_REJECTED: 403, // Forbidden
  APPROVAL_WORKFLOW_ERROR: 422, // Unprocessable Entity
  INSUFFICIENT_APPROVAL_LEVEL: 403, // Forbidden
  
  // Integration errors (5xx series for external service issues)
  EXTERNAL_SERVICE_ERROR: 502, // Bad Gateway
  API_RATE_LIMIT: 429, // Too Many Requests
  SYNC_ERROR: 500, // Internal Server Error
  EXPORT_ERROR: 500, // Internal Server Error
  IMPORT_ERROR: 400 // Bad Request
};

/**
 * Error severity levels for monitoring and alerting
 */
export const ErrorSeverityLevels: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
  // Low severity - User input errors, validation issues
  VALIDATION_ERROR: 'low',
  NOT_FOUND: 'low',
  QUOTE_EXPIRED: 'low',
  RFQ_DEADLINE_PASSED: 'low',
  
  // Medium severity - Business logic conflicts, state issues
  DUPLICATE_ENTRY: 'medium',
  INVALID_STATE: 'medium',
  VERSION_CONFLICT: 'medium',
  BOQ_ALREADY_APPROVED: 'medium',
  INSUFFICIENT_STOCK: 'medium',
  PO_EXCEEDS_BUDGET: 'medium',
  
  // High severity - Permission issues, security concerns
  UNAUTHORIZED: 'high',
  INSUFFICIENT_PERMISSIONS: 'high',
  PROJECT_ACCESS_DENIED: 'high',
  SUPPLIER_BLACKLISTED: 'high',
  APPROVAL_REJECTED: 'high',
  
  // Critical severity - System failures, integration issues
  INTERNAL_ERROR: 'critical',
  EXTERNAL_SERVICE_ERROR: 'critical',
  SYNC_ERROR: 'critical',
  STOCK_MOVEMENT_FAILED: 'critical'
};

/**
 * Error categories for grouping and analytics
 */
export const ErrorCategories: Record<string, string> = {
  // User Input & Validation
  VALIDATION_ERROR: 'validation',
  BOQ_IMPORT_FAILED: 'validation',
  RFQ_VALIDATION_ERROR: 'validation',
  QUOTE_INVALID_FORMAT: 'validation',
  
  // Resource Management
  NOT_FOUND: 'resource',
  BOQ_NOT_FOUND: 'resource',
  RFQ_NOT_FOUND: 'resource',
  STOCK_NOT_FOUND: 'resource',
  SUPPLIER_NOT_FOUND: 'resource',
  
  // Business Logic
  INVALID_STATE: 'business_logic',
  BOQ_INVALID_STATE: 'business_logic',
  RFQ_INVALID_STATE: 'business_logic',
  INSUFFICIENT_STOCK: 'business_logic',
  PO_EXCEEDS_BUDGET: 'business_logic',
  
  // Security & Authorization
  UNAUTHORIZED: 'security',
  INSUFFICIENT_PERMISSIONS: 'security',
  PROJECT_ACCESS_DENIED: 'security',
  SUPPLIER_ACCESS_DENIED: 'security',
  ROLE_ACCESS_DENIED: 'security',
  
  // Integration & External
  EXTERNAL_SERVICE_ERROR: 'integration',
  API_RATE_LIMIT: 'integration',
  SYNC_ERROR: 'integration',
  EXPORT_ERROR: 'integration',
  IMPORT_ERROR: 'integration',
  
  // System & Infrastructure
  INTERNAL_ERROR: 'system',
  STOCK_MOVEMENT_FAILED: 'system',
  APPROVAL_WORKFLOW_ERROR: 'system'
};

/**
 * Retryable error codes - errors that can be safely retried
 */
export const RetryableErrorCodes = new Set([
  'EXTERNAL_SERVICE_ERROR',
  'API_RATE_LIMIT',
  'SYNC_ERROR',
  'INTERNAL_ERROR' // Only for certain types of internal errors
]);

/**
 * User-facing error codes - errors that should be displayed to end users
 */
export const UserFacingErrorCodes = new Set([
  'VALIDATION_ERROR',
  'NOT_FOUND',
  'INSUFFICIENT_STOCK',
  'QUOTE_EXPIRED',
  'RFQ_DEADLINE_PASSED',
  'DUPLICATE_ENTRY',
  'PO_EXCEEDS_BUDGET',
  'APPROVAL_REQUIRED'
]);

/**
 * Get error category for a given error code
 */
export function getErrorCategory(code: string): string {
  return ErrorCategories[code] || 'unknown';
}

/**
 * Check if an error code is retryable
 */
export function isRetryableError(code: string): boolean {
  return RetryableErrorCodes.has(code);
}

/**
 * Check if an error should be displayed to users
 */
export function isUserFacingError(code: string): boolean {
  return UserFacingErrorCodes.has(code);
}

/**
 * Get severity level for an error code
 */
export function getErrorSeverity(code: string): 'low' | 'medium' | 'high' | 'critical' {
  return ErrorSeverityLevels[code] || 'medium';
}