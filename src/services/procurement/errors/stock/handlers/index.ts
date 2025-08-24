/**
 * Stock Error Handlers - Modular Export Barrel
 * Central export point for all specialized handler components
 */

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

// Common interfaces used across handlers
export interface RecoveryOption {
  type: string;
  description: string;
  action: string;
  data: any;
  priority?: number;
  estimatedTime?: string;
  cost?: number;
}

export interface RetryStrategy {
  type: string;
  description: string;
  action: string;
  data: any;
  maxAttempts?: number;
  backoffMs?: number;
  estimatedTime?: string;
}

// Unified handler result types
export interface HandlerResult<T = any> {
  error: T;
  recoveryOptions?: RecoveryOption[];
  retryStrategies?: RetryStrategy[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoRecoverable: boolean;
  requiresManualIntervention?: boolean;
}

// Legacy compatibility exports
export { InventoryHandlers as StockInventoryHandler } from './inventory-handlers';
export { TrackingHandlers as StockTrackingHandler } from './tracking-handlers';
export { MovementHandlers as StockMovementHandler } from './movement-handlers';