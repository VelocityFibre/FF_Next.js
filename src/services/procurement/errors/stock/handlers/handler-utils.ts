/**
 * Handler Utilities
 * Common utility functions for stock error handlers
 */

import { StockError } from '../inventory';

/**
 * Utility functions for error handlers
 */
export class HandlerUtils {
  /**
   * Determine error severity based on impact
   */
  static determineSeverity(error: StockError, context?: {
    businessImpact?: 'low' | 'medium' | 'high' | 'critical';
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    customerImpact?: boolean;
  }): 'low' | 'medium' | 'high' | 'critical' {
    // Business context takes priority
    if (context?.businessImpact === 'critical' || context?.customerImpact) {
      return 'critical';
    }

    if (context?.businessImpact === 'high') {
      return 'high';
    }

    // Default severity mapping by error type
    const errorType = error.constructor.name;
    
    switch (errorType) {
      case 'InsufficientStockError':
        return 'high'; // Stock shortages are typically high priority
      case 'StockReservationError':
        return 'medium'; // Can usually be resolved with alternative options
      case 'StockMovementError':
        return 'medium'; // Often resolvable with retry
      case 'StockTransferError':
        return 'medium'; // Can be rescheduled or rerouted
      case 'StockAdjustmentError':
        return 'low'; // Usually data/process issues
      default:
        return 'medium'; // Safe default
    }
  }

  /**
   * Check if error is auto-recoverable
   */
  static isAutoRecoverable(error: StockError, context?: {
    retryCount?: number;
    timeElapsed?: number; // minutes
    systemLoad?: 'low' | 'medium' | 'high';
  }): boolean {
    const errorType = error.constructor.name;
    const retryCount = context?.retryCount || 0;
    const timeElapsed = context?.timeElapsed || 0;

    // Don't auto-recover if already tried too many times
    if (retryCount >= 3) {
      return false;
    }

    // Don't auto-recover if it's been too long (indicates systemic issue)
    if (timeElapsed > 60) { // 1 hour
      return false;
    }

    // Don't auto-recover under high system load
    if (context?.systemLoad === 'high') {
      return false;
    }

    // Auto-recovery rules by error type
    switch (errorType) {
      case 'StockMovementError':
        return true; // Movement errors are often transient
      case 'StockTransferError':
        return retryCount < 2; // Limited retries for transfers
      case 'StockReservationError':
        return true; // Reservation conflicts can often be resolved
      case 'InsufficientStockError':
        return false; // Stock shortages need human intervention
      case 'StockAdjustmentError':
        return false; // Adjustment errors need verification
      default:
        return false; // Safe default - no auto-recovery
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  static calculateRetryDelay(attemptNumber: number, baseDelay = 1000): number {
    const maxDelay = 30000; // 30 seconds max
    const jitter = Math.random() * 0.1; // 10% jitter to prevent thundering herd
    
    const exponentialDelay = Math.min(
      baseDelay * Math.pow(2, attemptNumber - 1),
      maxDelay
    );

    return Math.floor(exponentialDelay * (1 + jitter));
  }

  /**
   * Generate correlation ID for error tracking
   */
  static generateCorrelationId(): string {
    return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Extract contextual information from error
   */
  static extractErrorContext(error: StockError): Record<string, any> {
    const context: Record<string, any> = {
      errorType: error.constructor.name,
      timestamp: new Date().toISOString(),
      message: error.message,
    };

    // Extract error-specific context
    if ('itemCode' in error) {
      context.itemCode = error.itemCode;
    }

    if ('quantity' in error) {
      context.quantity = error.quantity;
    }

    if ('location' in error) {
      context.location = error.location;
    }

    if ('fromLocation' in error) {
      context.fromLocation = error.fromLocation;
    }

    if ('toLocation' in error) {
      context.toLocation = error.toLocation;
    }

    return context;
  }

  /**
   * Format error for logging
   */
  static formatForLogging(error: StockError, additionalContext?: Record<string, any>): string {
    const context = {
      ...HandlerUtils.extractErrorContext(error),
      ...additionalContext
    };

    return `[${context.errorType}] ${context.message} | Context: ${JSON.stringify(context)}`;
  }

  /**
   * Check if errors are related (same item, location, etc.)
   */
  static areErrorsRelated(error1: StockError, error2: StockError): boolean {
    // Same error type
    if (error1.constructor.name !== error2.constructor.name) {
      return false;
    }

    // Same item code (if applicable)
    if ('itemCode' in error1 && 'itemCode' in error2) {
      if (error1.itemCode === error2.itemCode) {
        return true;
      }
    }

    // Same location (if applicable)
    if ('location' in error1 && 'location' in error2) {
      if (error1.location === error2.location) {
        return true;
      }
    }

    // Same movement path (if applicable)
    if ('fromLocation' in error1 && 'fromLocation' in error2 &&
        'toLocation' in error1 && 'toLocation' in error2) {
      if (error1.fromLocation === error2.fromLocation &&
          error1.toLocation === error2.toLocation) {
        return true;
      }
    }

    return false;
  }

  /**
   * Group related errors together
   */
  static groupRelatedErrors(errors: StockError[]): StockError[][] {
    const groups: StockError[][] = [];
    const processed = new Set<number>();

    for (let i = 0; i < errors.length; i++) {
      if (processed.has(i)) continue;

      const currentGroup = [errors[i]];
      processed.add(i);

      // Find related errors
      for (let j = i + 1; j < errors.length; j++) {
        if (processed.has(j)) continue;

        if (HandlerUtils.areErrorsRelated(errors[i], errors[j])) {
          currentGroup.push(errors[j]);
          processed.add(j);
        }
      }

      groups.push(currentGroup);
    }

    return groups;
  }
}