/**
 * Procurement Module Error Handling Framework
 * Comprehensive error types and handlers for procurement operations
 */

// ==============================================
// BASE PROCUREMENT ERROR CLASS
// ==============================================

export class ProcurementError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 400,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ProcurementError';
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date();
    this.context = context;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ProcurementError.prototype);
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      context: this.context
    };
  }
}

// ==============================================
// SPECIALIZED ERROR CLASSES
// ==============================================

/**
 * BOQ-specific errors
 */
export class BOQError extends ProcurementError {
  constructor(message: string, code: string, statusCode: number = 400, context?: Record<string, any>) {
    super(message, code, statusCode, context);
    this.name = 'BOQError';
    Object.setPrototypeOf(this, BOQError.prototype);
  }
}

/**
 * BOQ Mapping errors with detailed exception information
 */
export class BOQMappingError extends BOQError {
  public readonly unmappedItems: Array<{
    lineNumber: number;
    description: string;
    reason: string;
  }>;
  public readonly suggestions: Array<{
    lineNumber: number;
    catalogItems: Array<{
      id: string;
      name: string;
      confidence: number;
    }>;
  }>;

  constructor(
    message: string,
    unmappedItems: Array<{ lineNumber: number; description: string; reason: string }>,
    suggestions: Array<{ lineNumber: number; catalogItems: Array<{ id: string; name: string; confidence: number }> }>,
    context?: Record<string, any>
  ) {
    super(message, 'BOQ_MAPPING_ERROR', 422, context);
    this.name = 'BOQMappingError';
    this.unmappedItems = unmappedItems;
    this.suggestions = suggestions;
    Object.setPrototypeOf(this, BOQMappingError.prototype);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      unmappedItems: this.unmappedItems,
      suggestions: this.suggestions,
      unmappedCount: this.unmappedItems.length
    };
  }
}

/**
 * RFQ-specific errors
 */
export class RFQError extends ProcurementError {
  constructor(message: string, code: string, statusCode: number = 400, context?: Record<string, any>) {
    super(message, code, statusCode, context);
    this.name = 'RFQError';
    Object.setPrototypeOf(this, RFQError.prototype);
  }
}

/**
 * RFQ Validation errors with detailed validation issues
 */
export class RFQValidationError extends RFQError {
  public readonly validationErrors: Array<{
    path: (string | number)[];
    message: string;
    code: string;
  }>;

  constructor(
    message: string,
    validationErrors: Array<{ path: (string | number)[]; message: string; code: string }>,
    context?: Record<string, any>
  ) {
    super(message, 'RFQ_VALIDATION_ERROR', 422, context);
    this.name = 'RFQValidationError';
    this.validationErrors = validationErrors;
    Object.setPrototypeOf(this, RFQValidationError.prototype);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      validationErrors: this.validationErrors,
      errorCount: this.validationErrors.length
    };
  }
}

/**
 * Quote-specific errors
 */
export class QuoteError extends ProcurementError {
  constructor(message: string, code: string, statusCode: number = 400, context?: Record<string, any>) {
    super(message, code, statusCode, context);
    this.name = 'QuoteError';
    Object.setPrototypeOf(this, QuoteError.prototype);
  }
}

/**
 * Stock management errors
 */
export class StockError extends ProcurementError {
  constructor(message: string, code: string, statusCode: number = 400, context?: Record<string, any>) {
    super(message, code, statusCode, context);
    this.name = 'StockError';
    Object.setPrototypeOf(this, StockError.prototype);
  }
}

/**
 * Insufficient stock error with availability details
 */
export class InsufficientStockError extends StockError {
  public readonly itemCode: string;
  public readonly requestedQuantity: number;
  public readonly availableQuantity: number;
  public readonly alternativeLocations?: Array<{
    location: string;
    availableQuantity: number;
  }>;

  constructor(
    itemCode: string,
    requestedQuantity: number,
    availableQuantity: number,
    alternativeLocations?: Array<{ location: string; availableQuantity: number }>,
    context?: Record<string, any>
  ) {
    const message = `Insufficient stock for ${itemCode}. Requested: ${requestedQuantity}, Available: ${availableQuantity}`;
    super(message, 'INSUFFICIENT_STOCK', 409, context);
    this.name = 'InsufficientStockError';
    this.itemCode = itemCode;
    this.requestedQuantity = requestedQuantity;
    this.availableQuantity = availableQuantity;
    this.alternativeLocations = alternativeLocations;
    Object.setPrototypeOf(this, InsufficientStockError.prototype);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      itemCode: this.itemCode,
      requestedQuantity: this.requestedQuantity,
      availableQuantity: this.availableQuantity,
      alternativeLocations: this.alternativeLocations,
      shortfall: this.requestedQuantity - this.availableQuantity
    };
  }
}

/**
 * Permission/Authorization errors
 */
export class ProcurementPermissionError extends ProcurementError {
  public readonly requiredPermission: string;
  public readonly userPermissions: string[];

  constructor(
    requiredPermission: string,
    userPermissions: string[],
    context?: Record<string, any>
  ) {
    const message = `Access denied. Required permission: ${requiredPermission}`;
    super(message, 'INSUFFICIENT_PERMISSIONS', 403, context);
    this.name = 'ProcurementPermissionError';
    this.requiredPermission = requiredPermission;
    this.userPermissions = userPermissions;
    Object.setPrototypeOf(this, ProcurementPermissionError.prototype);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      requiredPermission: this.requiredPermission,
      userPermissions: this.userPermissions
    };
  }
}

// ==============================================
// ERROR HANDLER UTILITIES
// ==============================================

/**
 * Standard error codes used throughout the procurement system
 */
export const ProcurementErrorCodes = {
  // General errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INVALID_STATE: 'INVALID_STATE',
  
  // Authentication/Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  PROJECT_ACCESS_DENIED: 'PROJECT_ACCESS_DENIED',
  
  // BOQ errors
  BOQ_NOT_FOUND: 'BOQ_NOT_FOUND',
  BOQ_MAPPING_ERROR: 'BOQ_MAPPING_ERROR',
  BOQ_IMPORT_FAILED: 'BOQ_IMPORT_FAILED',
  BOQ_INVALID_VERSION: 'BOQ_INVALID_VERSION',
  BOQ_ALREADY_APPROVED: 'BOQ_ALREADY_APPROVED',
  
  // RFQ errors
  RFQ_NOT_FOUND: 'RFQ_NOT_FOUND',
  RFQ_VALIDATION_ERROR: 'RFQ_VALIDATION_ERROR',
  RFQ_ALREADY_ISSUED: 'RFQ_ALREADY_ISSUED',
  RFQ_DEADLINE_PASSED: 'RFQ_DEADLINE_PASSED',
  RFQ_NO_SUPPLIERS: 'RFQ_NO_SUPPLIERS',
  
  // Quote errors
  QUOTE_NOT_FOUND: 'QUOTE_NOT_FOUND',
  QUOTE_EXPIRED: 'QUOTE_EXPIRED',
  QUOTE_ALREADY_SUBMITTED: 'QUOTE_ALREADY_SUBMITTED',
  QUOTE_EVALUATION_ERROR: 'QUOTE_EVALUATION_ERROR',
  
  // Stock errors
  STOCK_NOT_FOUND: 'STOCK_NOT_FOUND',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  STOCK_MOVEMENT_FAILED: 'STOCK_MOVEMENT_FAILED',
  INVALID_STOCK_OPERATION: 'INVALID_STOCK_OPERATION',
  
  // Supplier errors
  SUPPLIER_NOT_FOUND: 'SUPPLIER_NOT_FOUND',
  SUPPLIER_ACCESS_DENIED: 'SUPPLIER_ACCESS_DENIED',
  SUPPLIER_INVITATION_EXPIRED: 'SUPPLIER_INVITATION_EXPIRED'
} as const;

/**
 * HTTP status code mappings for error types
 */
export const ErrorStatusCodes: Record<string, number> = {
  VALIDATION_ERROR: 422,
  NOT_FOUND: 404,
  DUPLICATE_ENTRY: 409,
  INVALID_STATE: 409,
  
  UNAUTHORIZED: 401,
  INSUFFICIENT_PERMISSIONS: 403,
  PROJECT_ACCESS_DENIED: 403,
  
  BOQ_NOT_FOUND: 404,
  BOQ_MAPPING_ERROR: 422,
  BOQ_IMPORT_FAILED: 400,
  BOQ_INVALID_VERSION: 409,
  BOQ_ALREADY_APPROVED: 409,
  
  RFQ_NOT_FOUND: 404,
  RFQ_VALIDATION_ERROR: 422,
  RFQ_ALREADY_ISSUED: 409,
  RFQ_DEADLINE_PASSED: 410,
  RFQ_NO_SUPPLIERS: 400,
  
  QUOTE_NOT_FOUND: 404,
  QUOTE_EXPIRED: 410,
  QUOTE_ALREADY_SUBMITTED: 409,
  QUOTE_EVALUATION_ERROR: 422,
  
  STOCK_NOT_FOUND: 404,
  INSUFFICIENT_STOCK: 409,
  STOCK_MOVEMENT_FAILED: 400,
  INVALID_STOCK_OPERATION: 409,
  
  SUPPLIER_NOT_FOUND: 404,
  SUPPLIER_ACCESS_DENIED: 403,
  SUPPLIER_INVITATION_EXPIRED: 410
};

/**
 * Create a standard procurement error
 */
export function createProcurementError(
  code: keyof typeof ProcurementErrorCodes,
  message?: string,
  context?: Record<string, any>
): ProcurementError {
  const statusCode = ErrorStatusCodes[code] || 400;
  const errorMessage = message || `Procurement error: ${code}`;
  
  return new ProcurementError(errorMessage, code, statusCode, context);
}

/**
 * Error handler middleware for API responses
 */
export function handleProcurementError(error: unknown): {
  success: false;
  error: any;
  statusCode: number;
} {
  // Handle ProcurementError and its subclasses
  if (error instanceof ProcurementError) {
    return {
      success: false,
      error: error.toJSON(),
      statusCode: error.statusCode
    };
  }

  // Handle database constraint errors
  if (error instanceof Error && error.message.includes('unique constraint')) {
    const duplicateError = new ProcurementError(
      'Duplicate entry detected',
      'DUPLICATE_ENTRY',
      409,
      { originalError: error.message }
    );
    return {
      success: false,
      error: duplicateError.toJSON(),
      statusCode: 409
    };
  }

  // Handle foreign key constraint errors
  if (error instanceof Error && error.message.includes('foreign key constraint')) {
    const constraintError = new ProcurementError(
      'Referenced record not found',
      'INVALID_REFERENCE',
      400,
      { originalError: error.message }
    );
    return {
      success: false,
      error: constraintError.toJSON(),
      statusCode: 400
    };
  }

  // Handle generic errors
  const genericError = new ProcurementError(
    error instanceof Error ? error.message : 'An unexpected error occurred',
    'INTERNAL_ERROR',
    500,
    { originalError: error instanceof Error ? error.stack : String(error) }
  );

  return {
    success: false,
    error: genericError.toJSON(),
    statusCode: 500
  };
}

/**
 * Validation error helper
 */
export function createValidationError(
  field: string,
  message: string,
  value?: any
): RFQValidationError {
  return new RFQValidationError(
    `Validation failed for field: ${field}`,
    [{
      path: [field],
      message,
      code: 'invalid_type'
    }],
    { field, value }
  );
}

// ==============================================
// ERROR LOGGING UTILITIES
// ==============================================

/**
 * Log error with context for debugging
 */
export function logProcurementError(
  error: ProcurementError,
  context: {
    userId?: string;
    projectId?: string;
    operation?: string;
    additionalInfo?: Record<string, any>;
  }
): void {
  console.error('[ProcurementError]', {
    error: error.toJSON(),
    context,
    stack: error.stack
  });

  // In a production environment, you might want to send this to
  // a logging service like Sentry, LogRocket, or custom logging
}

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
};