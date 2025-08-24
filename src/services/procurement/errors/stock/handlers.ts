/**
 * Stock Error Handlers - Legacy Compatibility Layer
 * @deprecated This file has been split into modular components for better maintainability.
 * 
 * NEW STRUCTURE:
 * - handlers/inventory-handlers.ts - Specialized handlers for inventory errors
 * - handlers/tracking-handlers.ts - Specialized handlers for tracking and adjustment errors
 * - handlers/movement-handlers.ts - Specialized handlers for movement and transfer errors
 * - handlers/handler-utils.ts - Common utility functions for all handlers
 * 
 * Please use the new modular imports:
 * import { InventoryHandlers, TrackingHandlers, MovementHandlers } from './handlers';
 * 
 * This file will be removed in a future version. Use the modular structure instead.
 */

// Import from new modular structure for backward compatibility
import { 
  InventoryHandlers, 
  TrackingHandlers, 
  MovementHandlers, 
  HandlerUtils,
  RecoveryOption,
  RetryStrategy
} from './handlers';
import { StockError, InsufficientStockError, StockReservationError } from './inventory';
import { StockMovementError, StockTransferError, StockAdjustmentError, StockTrackingError } from './tracking';

// Re-export everything from the new modular structure
export * from './handlers';

// Legacy re-exports for backward compatibility
export { StockErrorFactory } from './factory';
export { StockErrorHandler, type RecoveryOption as LegacyRecoveryOption, type RetryStrategy as LegacyRetryStrategy } from './handler';
export { StockErrorFormatter } from './formatter';
export { StockErrorAnalytics } from './analytics';

/**
 * Legacy StockErrorFactory class for backward compatibility
 * @deprecated Use the factory module directly
 */
export class StockErrorFactory {
  /**
   * Create an insufficient stock error
   */
  static createInsufficientStockError(
    itemCode: string,
    requestedQuantity: number,
    availableQuantity: number,
    options?: {
      reservedQuantity?: number;
      alternativeLocations?: Array<{
        location: string;
        locationId: string;
        availableQuantity: number;
        estimatedTransferTime?: string;
        transferCost?: number;
      }>;
      alternativeItems?: Array<{
        itemCode: string;
        itemName: string;
        availableQuantity: number;
        compatibility: number;
        priceDifference?: number;
      }>;
    },
    context?: Record<string, any>
  ): InsufficientStockError {
    return new InsufficientStockError(itemCode, requestedQuantity, availableQuantity, options, context);
  }

  /**
   * Create a stock movement error
   */
  static createMovementError(
    message: string,
    movementType: 'inbound' | 'outbound' | 'transfer' | 'adjustment',
    itemCode: string,
    quantity: number,
    options?: {
      fromLocation?: string;
      toLocation?: string;
      movementId?: string;
    },
    context?: Record<string, any>
  ): StockMovementError {
    return new StockMovementError(message, movementType, itemCode, quantity, options, context);
  }

  /**
   * Create a stock reservation error
   */
  static createReservationError(
    itemCode: string,
    requestedQuantity: number,
    availableQuantity: number,
    existingReservations: Array<{
      reservationId: string;
      quantity: number;
      expiresAt?: Date;
      purpose: string;
    }>,
    context?: Record<string, any>
  ): StockReservationError {
    return new StockReservationError(itemCode, requestedQuantity, availableQuantity, existingReservations, context);
  }

  /**
   * Create a stock transfer error
   */
  static createTransferError(
    itemCode: string,
    fromLocation: string,
    toLocation: string,
    quantity: number,
    reason: string,
    options?: {
      transferId?: string;
    },
    context?: Record<string, any>
  ): StockTransferError {
    return new StockTransferError(itemCode, fromLocation, toLocation, quantity, reason, options, context);
  }

  /**
   * Create a stock adjustment error
   */
  static createAdjustmentError(
    itemCode: string,
    location: string,
    adjustmentType: 'increase' | 'decrease' | 'recount',
    adjustmentQuantity: number,
    currentQuantity: number,
    message: string,
    options?: {
      adjustmentReason?: string;
    },
    context?: Record<string, any>
  ): StockAdjustmentError {
    return new StockAdjustmentError(
      itemCode,
      location,
      adjustmentType,
      adjustmentQuantity,
      currentQuantity,
      message,
      options,
      context
    );
  }
}

/**
 * Legacy StockErrorHandler class for backward compatibility
 * @deprecated Use InventoryHandlers, TrackingHandlers, MovementHandlers from './handlers' instead
 */
export class StockErrorHandler {
  /**
   * Handle insufficient stock error with recovery options
   * @deprecated Use InventoryHandlers.handleInsufficientStock() instead
   */
  static handleInsufficientStock(error: InsufficientStockError): {
    error: InsufficientStockError;
    recoveryOptions: Array<{
      type: string;
      description: string;
      action: string;
      data: any;
    }>;
  } {
    // Delegate to new modular handler
    const result = InventoryHandlers.handleInsufficientStock(error);
    return {
      error: result.error,
      recoveryOptions: result.recoveryOptions
    };
  }

  /**
   * @deprecated Legacy implementation - kept for reference
   */
  static _legacyHandleInsufficientStock(error: InsufficientStockError): {
    error: InsufficientStockError;
    recoveryOptions: Array<{
      type: string;
      description: string;
      action: string;
      data: any;
    }>;
  } {
    const recoveryOptions = [];

    // Partial fulfillment option
    if (error.availableQuantity > 0) {
      recoveryOptions.push({
        type: 'partial_fulfillment',
        description: `Fulfill ${error.availableQuantity} units now, backorder remaining ${error.getShortfall()}`,
        action: 'process_partial_fulfillment',
        data: {
          itemCode: error.itemCode,
          availableQuantity: error.availableQuantity,
          backorderQuantity: error.getShortfall()
        }
      });
    }

    // Alternative location transfers
    if (error.alternativeLocations?.length) {
      error.alternativeLocations.forEach(location => {
        recoveryOptions.push({
          type: 'location_transfer',
          description: `Transfer ${location.availableQuantity} units from ${location.location}`,
          action: 'initiate_stock_transfer',
          data: {
            itemCode: error.itemCode,
            fromLocation: location.locationId,
            quantity: location.availableQuantity,
            estimatedTime: location.estimatedTransferTime,
            cost: location.transferCost
          }
        });
      });
    }

    // Alternative item suggestions
    if (error.alternativeItems?.length) {
      error.alternativeItems
        .filter(item => item.compatibility >= 80)
        .forEach(item => {
          recoveryOptions.push({
            type: 'alternative_item',
            description: `Use ${item.itemName} (${item.compatibility}% compatible) - ${item.availableQuantity} available`,
            action: 'suggest_alternative_item',
            data: {
              originalItemCode: error.itemCode,
              alternativeItemCode: item.itemCode,
              compatibility: item.compatibility,
              availableQuantity: item.availableQuantity,
              priceDifference: item.priceDifference
            }
          });
        });
    }

    return { error, recoveryOptions };
  }

  /**
   * Handle stock movement error with retry strategies
   * @deprecated Use MovementHandlers.handleMovementError() instead
   */
  static handleMovementError(error: StockMovementError): {
    error: StockMovementError;
    retryStrategies: Array<{
      type: string;
      description: string;
      action: string;
      data: any;
    }>;
  } {
    // Delegate to new modular handler
    const result = MovementHandlers.handleMovementError(error);
    return {
      error: result.error,
      retryStrategies: result.retryStrategies
    };
  }

  /**
   * @deprecated Legacy implementation - kept for reference
   */
  static _legacyHandleMovementError(error: StockMovementError): {
    error: StockMovementError;
    retryStrategies: Array<{
      type: string;
      description: string;
      action: string;
      data: any;
    }>;
  } {
    const retryStrategies = [];

    // Retry with validation
    retryStrategies.push({
      type: 'validated_retry',
      description: 'Retry movement with enhanced validation',
      action: 'retry_with_validation',
      data: {
        itemCode: error.itemCode,
        movementType: error.movementType,
        quantity: error.quantity,
        fromLocation: error.fromLocation,
        toLocation: error.toLocation
      }
    });

    // Split movement
    if (error.quantity > 1) {
      retryStrategies.push({
        type: 'split_movement',
        description: 'Split into smaller movements to reduce complexity',
        action: 'split_stock_movement',
        data: {
          itemCode: error.itemCode,
          movementType: error.movementType,
          originalQuantity: error.quantity,
          suggestedBatchSize: Math.ceil(error.quantity / 2)
        }
      });
    }

    return { error, retryStrategies };
  }

  /**
   * Format stock error for user display
   * @deprecated Use the formatter module directly
   */
  static formatErrorForUser(error: StockError): {
    title: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    actions?: Array<{
      label: string;
      action: string;
      primary?: boolean;
    }>;
  } {
    // Use legacy implementation for now - would delegate to formatter module in complete refactor
    return StockErrorHandler._legacyFormatErrorForUser(error);
  }

  /**
   * @deprecated Legacy implementation - kept for reference
   */
  static _legacyFormatErrorForUser(error: StockError): {
    title: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    actions?: Array<{
      label: string;
      action: string;
      primary?: boolean;
    }>;
  } {
    if (error instanceof InsufficientStockError) {
      return {
        title: 'Insufficient Stock',
        message: `Not enough ${error.itemCode} in stock. Needed: ${error.requestedQuantity}, Available: ${error.availableQuantity}`,
        severity: 'error',
        actions: [
          {
            label: 'View Alternatives',
            action: 'show_alternatives',
            primary: true
          },
          {
            label: 'Partial Fulfillment',
            action: 'process_partial'
          }
        ]
      };
    }

    if (error instanceof StockMovementError) {
      return {
        title: 'Stock Movement Failed',
        message: `Failed to ${error.getMovementDescription().toLowerCase()}`,
        severity: 'error',
        actions: [
          {
            label: 'Retry',
            action: 'retry_movement',
            primary: true
          },
          {
            label: 'View Details',
            action: 'show_movement_details'
          }
        ]
      };
    }

    if (error instanceof StockReservationError) {
      return {
        title: 'Reservation Failed',
        message: `Cannot reserve ${error.requestedQuantity} units of ${error.itemCode}. Available: ${error.availableQuantity}`,
        severity: 'error',
        actions: [
          {
            label: 'Check Expired',
            action: 'release_expired_reservations',
            primary: true
          },
          {
            label: 'Reduce Quantity',
            action: 'adjust_reservation_quantity'
          }
        ]
      };
    }

    // Default error formatting
    return {
      title: 'Stock Error',
      message: error.message,
      severity: 'error',
      actions: [
        {
          label: 'Retry',
          action: 'retry_operation',
          primary: true
        }
      ]
    };
  }
}

/**
 * Legacy StockErrorAnalytics class for backward compatibility
 * @deprecated Use the analytics module directly
 */
export class StockErrorAnalytics {
  /**
   * Analyze error patterns for insights
   * @deprecated Use the analytics module directly
   */
  static analyzeErrorPattern(errors: StockError[]): {
    mostCommonItems: Array<{ itemCode: string; count: number }>;
    errorTypes: Array<{ type: string; count: number }>;
    timeDistribution: Array<{ hour: number; count: number }>;
    locations: Array<{ location: string; count: number }>;
  } {
    // Use legacy implementation for now - would delegate to analytics module in complete refactor
    return StockErrorAnalytics._legacyAnalyzeErrorPattern(errors);
  }

  /**
   * @deprecated Legacy implementation - kept for reference
   */
  static _legacyAnalyzeErrorPattern(errors: StockError[]): {
    mostCommonItems: Array<{ itemCode: string; count: number }>;
    errorTypes: Array<{ type: string; count: number }>;
    timeDistribution: Array<{ hour: number; count: number }>;
    locations: Array<{ location: string; count: number }>;
  } {
    const itemCodeCounts = new Map<string, number>();
    const errorTypeCounts = new Map<string, number>();
    const locationCounts = new Map<string, number>();

    errors.forEach(error => {
      // Count by item code
      if ('itemCode' in error) {
        const current = itemCodeCounts.get(error.itemCode) || 0;
        itemCodeCounts.set(error.itemCode, current + 1);
      }

      // Count by error type
      const errorType = error.constructor.name;
      const currentType = errorTypeCounts.get(errorType) || 0;
      errorTypeCounts.set(errorType, currentType + 1);

      // Count by location
      if ('fromLocation' in error && error.fromLocation) {
        const current = locationCounts.get(error.fromLocation) || 0;
        locationCounts.set(error.fromLocation, current + 1);
      }
    });

    return {
      mostCommonItems: Array.from(itemCodeCounts.entries())
        .map(([itemCode, count]) => ({ itemCode, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      errorTypes: Array.from(errorTypeCounts.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
      timeDistribution: [], // Would need timestamp data
      locations: Array.from(locationCounts.entries())
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
    };
  }
}

// Export all error types for convenience
export {
  StockError,
  InsufficientStockError,
  StockReservationError,
  StockMovementError,
  StockTransferError,
  StockAdjustmentError,
  StockTrackingError
};