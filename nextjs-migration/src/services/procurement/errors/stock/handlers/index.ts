/**
 * Stock Error Handlers - Modular Export Barrel
 * Central export point for all specialized handler components
 */

// Re-export foundation types
export type { 
  RecoveryOption, 
  RetryStrategy, 
  HandlerResult, 
  ErrorSeverity,
  UserErrorDisplay,
  SystemErrorLog
} from '../types';

// Handler utilities
export * from './handler-utils';
export { HandlerUtils } from './handler-utils';

// Specialized handlers
export * from './inventory-handlers';
export { InventoryHandlers } from './inventory-handlers';

export * from './tracking-handlers';
export { TrackingHandlers } from './tracking-handlers';

export * from './movement-handlers';
export { MovementHandlers } from './movement-handlers';

// New modular movement handlers
export * from './movement';
export { MovementCore, TransferHandler, MovementUtils, MovementExecutor } from './movement';

// Legacy compatibility exports
export { InventoryHandlers as StockInventoryHandler } from './inventory-handlers';
export { TrackingHandlers as StockTrackingHandler } from './tracking-handlers';
export { MovementHandlers as StockMovementHandler } from './movement-handlers';