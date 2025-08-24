/**
 * Stock Error Handler - Legacy Compatibility Layer
 * @deprecated This file has been split into modular components for better maintainability.
 * 
 * NEW STRUCTURE:
 * - handler/error-handler.ts - Core error handling and recovery option generation
 * - handler/recovery-handler.ts - Recovery execution and retry strategy logic
 * - handler/notification-handler.ts - Error notification and escalation systems
 * - handler/handler-types.ts - TypeScript interfaces and handler types
 * 
 * Please use the new modular imports:
 * import { CoreErrorHandler, RecoveryHandler, NotificationHandler } from './handler';
 * 
 * This file will be removed in a future version. Use the modular structure instead.
 */

// Import from new modular structure for backward compatibility
import { 
  CoreErrorHandler, 
  RecoveryHandler, 
  NotificationHandler,
  RecoveryOption,
  RetryStrategy
} from './handler';
import { InsufficientStockError, StockReservationError } from './inventory';
import { StockMovementError, StockTransferError, StockAdjustmentError } from './tracking';

// Re-export types from new modular structure
export { RecoveryOption, RetryStrategy } from './handler';

/**
 * Legacy StockErrorHandler class for backward compatibility
 * @deprecated Use CoreErrorHandler, RecoveryHandler, and NotificationHandler from './handler' instead
 */
export class StockErrorHandler {
  /**
   * Handle insufficient stock error with recovery options
   * @deprecated Use CoreErrorHandler.handleInsufficientStock() instead
   */
  static handleInsufficientStock(error: InsufficientStockError): {
    error: InsufficientStockError;
    recoveryOptions: RecoveryOption[];
  } {
    // Delegate to new modular handler
    const result = CoreErrorHandler.handleInsufficientStock(error);
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
    recoveryOptions: RecoveryOption[];
  } {
    const recoveryOptions: RecoveryOption[] = [];

    // Partial fulfillment option
    if (error.availableQuantity > 0) {
      recoveryOptions.push({
        type: 'partial_fulfillment',
        description: `Fulfill ${error.availableQuantity} units now, backorder remaining ${error.getShortfall()}`,
        action: 'process_partial_fulfillment',
        priority: 1,
        data: {
          itemCode: error.itemCode,
          availableQuantity: error.availableQuantity,
          backorderQuantity: error.getShortfall()
        }
      });
    }

    // Alternative location transfers
    if (error.alternativeLocations?.length) {
      error.alternativeLocations.forEach((location, index) => {
        recoveryOptions.push({
          type: 'location_transfer',
          description: `Transfer ${location.availableQuantity} units from ${location.location}`,
          action: 'initiate_stock_transfer',
          priority: 2 + index,
          estimatedTime: location.estimatedTransferTime,
          cost: location.transferCost,
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
        .forEach((item, index) => {
          recoveryOptions.push({
            type: 'alternative_item',
            description: `Use ${item.itemName} (${item.compatibility}% compatible) - ${item.availableQuantity} available`,
            action: 'suggest_alternative_item',
            priority: 10 + index,
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

    // Emergency procurement
    recoveryOptions.push({
      type: 'emergency_procurement',
      description: `Initiate emergency procurement for ${error.itemCode}`,
      action: 'create_emergency_purchase_order',
      priority: 20,
      estimatedTime: '1-3 business days',
      data: {
        itemCode: error.itemCode,
        requiredQuantity: error.getShortfall(),
        urgency: 'high'
      }
    });

    // Sort by priority
    recoveryOptions.sort((a, b) => (a.priority || 999) - (b.priority || 999));

    return { error, recoveryOptions };
  }

  /**
   * Handle stock movement error with retry strategies
   * @deprecated Use CoreErrorHandler.handleStockMovement() instead
   */
  static handleMovementError(error: StockMovementError): {
    error: StockMovementError;
    retryStrategies: RetryStrategy[];
  } {
    // Delegate to new modular handler
    const result = CoreErrorHandler.handleStockMovement(error);
    return {
      error: result.error,
      retryStrategies: result.retryStrategy ? [result.retryStrategy] : []
    };
  }

  /**
   * @deprecated Legacy implementation - kept for reference
   */
  static _legacyHandleMovementError(error: StockMovementError): {
    error: StockMovementError;
    retryStrategies: RetryStrategy[];
  } {
    const retryStrategies: RetryStrategy[] = [];

    // Retry with validation
    retryStrategies.push({
      type: 'validated_retry',
      description: 'Retry movement with enhanced validation',
      action: 'retry_with_validation',
      maxAttempts: 3,
      backoffMs: 1000,
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
      const batchSize = Math.ceil(error.quantity / 2);
      retryStrategies.push({
        type: 'split_movement',
        description: 'Split into smaller movements to reduce complexity',
        action: 'split_stock_movement',
        maxAttempts: 1,
        data: {
          itemCode: error.itemCode,
          movementType: error.movementType,
          originalQuantity: error.quantity,
          suggestedBatchSize: batchSize,
          numberOfBatches: Math.ceil(error.quantity / batchSize)
        }
      });
    }

    // Alternative path
    if (error.movementType === 'transfer' && error.fromLocation && error.toLocation) {
      retryStrategies.push({
        type: 'alternative_path',
        description: 'Try alternative routing through intermediate locations',
        action: 'find_alternative_transfer_path',
        maxAttempts: 2,
        data: {
          itemCode: error.itemCode,
          originalFromLocation: error.fromLocation,
          originalToLocation: error.toLocation,
          quantity: error.quantity
        }
      });
    }

    // Delayed retry
    retryStrategies.push({
      type: 'delayed_retry',
      description: 'Retry after a delay to allow system recovery',
      action: 'schedule_delayed_retry',
      maxAttempts: 2,
      backoffMs: 30000, // 30 seconds
      data: {
        originalError: error,
        retryAfter: new Date(Date.now() + 30000)
      }
    });

    return { error, retryStrategies };
  }

  /**
   * Handle stock reservation error
   * @deprecated Use CoreErrorHandler.handleStockReservation() instead
   */
  static handleReservationError(error: StockReservationError): {
    error: StockReservationError;
    recoveryOptions: RecoveryOption[];
  } {
    // Delegate to new modular handler
    const result = CoreErrorHandler.handleStockReservation(error);
    return {
      error: result.error,
      recoveryOptions: result.recoveryOptions
    };
  }

  /**
   * @deprecated Legacy implementation - kept for reference
   */
  static _legacyHandleReservationError(error: StockReservationError): {
    error: StockReservationError;
    recoveryOptions: RecoveryOption[];
  } {
    const recoveryOptions: RecoveryOption[] = [];

    // Release expired reservations
    const expiredReservations = error.existingReservations.filter(
      res => res.expiresAt && res.expiresAt < new Date()
    );

    if (expiredReservations.length > 0) {
      const expiredQuantity = expiredReservations.reduce((sum, res) => sum + res.quantity, 0);
      recoveryOptions.push({
        type: 'release_expired',
        description: `Release ${expiredQuantity} units from expired reservations`,
        action: 'release_expired_reservations',
        priority: 1,
        data: {
          itemCode: error.itemCode,
          expiredReservations: expiredReservations.map(res => res.reservationId),
          reclaimableQuantity: expiredQuantity
        }
      });
    }

    // Reduce reservation quantity
    if (error.availableQuantity > 0) {
      recoveryOptions.push({
        type: 'partial_reservation',
        description: `Reserve available ${error.availableQuantity} units, queue remaining ${error.getShortfall()}`,
        action: 'create_partial_reservation',
        priority: 2,
        data: {
          itemCode: error.itemCode,
          reservableQuantity: error.availableQuantity,
          queuedQuantity: error.getShortfall()
        }
      });
    }

    // Queue reservation
    recoveryOptions.push({
      type: 'queue_reservation',
      description: 'Add to reservation queue for future fulfillment',
      action: 'add_to_reservation_queue',
      priority: 3,
      data: {
        itemCode: error.itemCode,
        requestedQuantity: error.requestedQuantity,
        queuePosition: error.existingReservations.length + 1
      }
    });

    return { error, recoveryOptions };
  }

  /**
   * Handle stock transfer error
   * @deprecated Use appropriate handler from the modular structure
   */
  static handleTransferError(error: StockTransferError): {
    error: StockTransferError;
    retryStrategies: RetryStrategy[];
  } {
    // For backward compatibility, use legacy implementation
    return StockErrorHandler._legacyHandleTransferError(error);
  }

  /**
   * @deprecated Legacy implementation - kept for reference
   */
  static _legacyHandleTransferError(error: StockTransferError): {
    error: StockTransferError;
    retryStrategies: RetryStrategy[];
  } {
    const retryStrategies: RetryStrategy[] = [];

    // Retry with different batch size
    if (error.quantity > 1) {
      retryStrategies.push({
        type: 'batch_transfer',
        description: 'Transfer in smaller batches',
        action: 'transfer_in_batches',
        maxAttempts: 1,
        data: {
          itemCode: error.itemCode,
          fromLocation: error.fromLocation,
          toLocation: error.toLocation,
          totalQuantity: error.quantity,
          batchSize: Math.min(error.quantity / 2, 10)
        }
      });
    }

    // Try intermediate location
    retryStrategies.push({
      type: 'staged_transfer',
      description: 'Transfer via intermediate staging location',
      action: 'use_staging_location',
      maxAttempts: 2,
      data: {
        itemCode: error.itemCode,
        fromLocation: error.fromLocation,
        toLocation: error.toLocation,
        quantity: error.quantity,
        findStagingLocation: true
      }
    });

    // Schedule transfer
    retryStrategies.push({
      type: 'scheduled_transfer',
      description: 'Schedule transfer for off-peak hours',
      action: 'schedule_transfer',
      maxAttempts: 1,
      data: {
        itemCode: error.itemCode,
        fromLocation: error.fromLocation,
        toLocation: error.toLocation,
        quantity: error.quantity,
        preferredTime: 'off_peak'
      }
    });

    return { error, retryStrategies };
  }

  /**
   * Handle stock adjustment error
   * @deprecated Use appropriate handler from the modular structure
   */
  static handleAdjustmentError(error: StockAdjustmentError): {
    error: StockAdjustmentError;
    retryStrategies: RetryStrategy[];
  } {
    // For backward compatibility, use legacy implementation
    return StockErrorHandler._legacyHandleAdjustmentError(error);
  }

  /**
   * @deprecated Legacy implementation - kept for reference
   */
  static _legacyHandleAdjustmentError(error: StockAdjustmentError): {
    error: StockAdjustmentError;
    retryStrategies: RetryStrategy[];
  } {
    const retryStrategies: RetryStrategy[] = [];

    // Recount before adjustment
    if (error.adjustmentType !== 'recount') {
      retryStrategies.push({
        type: 'recount_first',
        description: 'Perform physical recount before adjustment',
        action: 'initiate_physical_recount',
        maxAttempts: 1,
        data: {
          itemCode: error.itemCode,
          location: error.location,
          currentSystemQuantity: error.currentQuantity
        }
      });
    }

    // Supervisor approval
    retryStrategies.push({
      type: 'supervisor_approval',
      description: 'Request supervisor approval for adjustment',
      action: 'request_supervisor_approval',
      maxAttempts: 1,
      data: {
        itemCode: error.itemCode,
        location: error.location,
        adjustmentType: error.adjustmentType,
        adjustmentQuantity: error.adjustmentQuantity,
        reason: error.adjustmentReason
      }
    });

    // Gradual adjustment
    if (Math.abs(error.adjustmentQuantity) > 10) {
      retryStrategies.push({
        type: 'gradual_adjustment',
        description: 'Split large adjustment into smaller increments',
        action: 'split_adjustment',
        maxAttempts: 1,
        data: {
          itemCode: error.itemCode,
          location: error.location,
          totalAdjustment: error.adjustmentQuantity,
          incrementSize: Math.sign(error.adjustmentQuantity) * 5
        }
      });
    }

    return { error, retryStrategies };
  }

  /**
   * Execute recovery option
   * @deprecated Use RecoveryHandler.executeRecovery() instead
   */
  static async executeRecovery(recoveryOption: RecoveryOption): Promise<{
    success: boolean;
    result?: any;
    error?: string;
  }> {
    // Delegate to new modular handler
    return RecoveryHandler.executeRecovery(recoveryOption);
  }

  /**
   * @deprecated Legacy implementation - kept for reference
   */
  static async _legacyExecuteRecovery(recoveryOption: RecoveryOption): Promise<{
    success: boolean;
    result?: any;
    error?: string;
  }> {
    try {
      // This would integrate with actual business logic
      console.log(`Executing recovery: ${recoveryOption.type}`, recoveryOption.data);
      
      // Simulate execution based on action type
      switch (recoveryOption.action) {
        case 'process_partial_fulfillment':
          return {
            success: true,
            result: {
              fulfilledQuantity: recoveryOption.data.availableQuantity,
              backorderedQuantity: recoveryOption.data.backorderQuantity
            }
          };
        
        case 'initiate_stock_transfer':
          return {
            success: true,
            result: {
              transferId: `TXN-${Date.now()}`,
              estimatedArrival: recoveryOption.estimatedTime
            }
          };
        
        default:
          return {
            success: true,
            result: { action: recoveryOption.action, executed: true }
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Execute retry strategy
   * @deprecated Use RecoveryHandler.executeRetry() instead
   */
  static async executeRetry(retryStrategy: RetryStrategy): Promise<{
    success: boolean;
    result?: any;
    error?: string;
    shouldRetry?: boolean;
  }> {
    // Delegate to new modular handler
    return RecoveryHandler.executeRetry(retryStrategy);
  }

  /**
   * @deprecated Legacy implementation - kept for reference
   */
  static async _legacyExecuteRetry(retryStrategy: RetryStrategy): Promise<{
    success: boolean;
    result?: any;
    error?: string;
    shouldRetry?: boolean;
  }> {
    try {
      console.log(`Executing retry: ${retryStrategy.type}`, retryStrategy.data);
      
      // Simulate retry execution
      const success = Math.random() > 0.3; // 70% success rate for simulation
      
      if (success) {
        return {
          success: true,
          result: { retryType: retryStrategy.type, completed: true }
        };
      } else {
        return {
          success: false,
          error: 'Retry failed',
          shouldRetry: (retryStrategy.maxAttempts || 1) > 1
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        shouldRetry: true
      };
    }
  }
}