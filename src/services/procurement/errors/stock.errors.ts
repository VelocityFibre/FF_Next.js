/**
 * Stock Management Errors - Backward Compatibility Layer
 * @deprecated Use ./stock/index.ts instead for improved modular error handling
 * 
 * This file provides backward compatibility for existing imports.
 * New code should use the modular error system in ./stock/
 */

// Re-export all stock error classes from the new modular structure
export {
  StockError,
  InsufficientStockError,
  StockReservationError,
  StockMovementError,
  StockTransferError,
  StockAdjustmentError,
  StockTrackingError,
  StockErrorFactory,
  StockErrorHandler,
  StockErrorAnalytics,
  isStockError,
  getStockErrorType
} from './stock/index';

// Re-export types
export type {
  StockErrorType
} from './stock/index';