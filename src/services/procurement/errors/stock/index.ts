/**
 * Stock Errors Module - Main Entry Point
 * Comprehensive error handling for stock management operations
 */

// Re-export inventory errors
export {
  StockError,
  InsufficientStockError,
  StockReservationError
} from './inventory';

// Re-export tracking errors
export {
  StockMovementError,
  StockTransferError,
  StockAdjustmentError,
  StockTrackingError
} from './tracking';

// Re-export modular components
export { StockErrorFactory } from './factory';
export { StockErrorHandler, type RecoveryOption, type RetryStrategy } from './handler';
export { StockErrorFormatter, type UserErrorDisplay, type SystemErrorLog } from './formatter';
export { StockErrorAnalytics, type ErrorPattern, type ErrorTrend, type ErrorInsight } from './analytics';

// Re-export handlers for backward compatibility
export {
  StockErrorFactory as LegacyStockErrorFactory,
  StockErrorHandler as LegacyStockErrorHandler,
  StockErrorAnalytics as LegacyStockErrorAnalytics
} from './handlers';

// Convenience re-exports for backward compatibility
export type StockErrorType = 
  | 'insufficient_stock'
  | 'stock_movement_failed'
  | 'stock_reservation_failed'
  | 'stock_transfer_failed'
  | 'stock_adjustment_failed'
  | 'stock_tracking_failed';

/**
 * Check if an error is a stock-related error
 */
export function isStockError(error: any): error is StockError {
  return error instanceof Error && 
         (error.name === 'StockError' || 
          error.name === 'InsufficientStockError' ||
          error.name === 'StockMovementError' ||
          error.name === 'StockReservationError' ||
          error.name === 'StockTransferError' ||
          error.name === 'StockAdjustmentError' ||
          error.name === 'StockTrackingError');
}

/**
 * Get stock error type from error instance
 */
export function getStockErrorType(error: StockError): StockErrorType {
  switch (error.name) {
    case 'InsufficientStockError':
      return 'insufficient_stock';
    case 'StockMovementError':
      return 'stock_movement_failed';
    case 'StockReservationError':
      return 'stock_reservation_failed';
    case 'StockTransferError':
      return 'stock_transfer_failed';
    case 'StockAdjustmentError':
      return 'stock_adjustment_failed';
    case 'StockTrackingError':
      return 'stock_tracking_failed';
    default:
      return 'stock_movement_failed';
  }
}