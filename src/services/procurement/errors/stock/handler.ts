/**
 * Stock Error Handler - Legacy Compatibility Layer
 * Redirects to clean implementation to avoid circular imports
 */

// Import clean implementations
export { 
  StockErrorHandler, 
  ErrorRecoveryService,
  HandlerUtils,
  type RecoveryOption,
  type RetryStrategy,
  type HandlerResult,
  type ErrorSeverity,
  type UserErrorDisplay,
  type SystemErrorLog
} from './handler-clean';

// Legacy re-exports for backward compatibility
export { StockErrorHandler as CoreErrorHandler } from './handler-clean';
export { ErrorRecoveryService as RecoveryHandler } from './handler-clean';
export { HandlerUtils as NotificationHandler } from './handlers/handler-utils';