/**
 * Core Error Handler
 * Handles stock error processing and recovery option generation
 */

import { InsufficientStockError, StockReservationError } from '../inventory';
import { StockMovementError, StockTransferError, StockAdjustmentError } from '../tracking';
import { RecoveryOption, HandlerResult } from './handler-types';

/**
 * Core stock error handler
 */
export class CoreErrorHandler {
  /**
   * Handle insufficient stock error with recovery options
   */
  static handleInsufficientStock(error: InsufficientStockError): HandlerResult<InsufficientStockError> {
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
          shortfall: error.getShortfall(),
          requestedQuantity: error.requestedQuantity
        },
        estimatedTime: '2-4 hours',
        cost: 0
      });
    }

    // Alternative item suggestion
    recoveryOptions.push({
      type: 'alternative_item',
      description: 'Find alternative or compatible items',
      action: 'suggest_alternatives',
      priority: 2,
      data: {
        itemCode: error.itemCode,
        category: error.category,
        specifications: error.specifications
      },
      estimatedTime: '1-2 hours'
    });

    // Emergency procurement
    recoveryOptions.push({
      type: 'emergency_procurement',
      description: 'Initiate emergency procurement process',
      action: 'create_urgent_purchase_order',
      priority: 3,
      data: {
        itemCode: error.itemCode,
        quantity: error.getShortfall(),
        urgency: 'high'
      },
      estimatedTime: '1-3 days',
      cost: error.getShortfall() * (error.unitPrice || 0) * 1.2 // 20% premium
    });

    return {
      error,
      recoveryOptions,
      severity: error.getShortfall() > error.requestedQuantity * 0.5 ? 'high' : 'medium',
      autoRecoverable: error.availableQuantity > 0,
      requiresManualIntervention: error.availableQuantity === 0
    };
  }

  /**
   * Handle stock reservation error
   */
  static handleStockReservation(error: StockReservationError): HandlerResult<StockReservationError> {
    const recoveryOptions: RecoveryOption[] = [];

    // Release conflicting reservations if expired
    recoveryOptions.push({
      type: 'release_expired_reservations',
      description: 'Release expired or inactive reservations',
      action: 'cleanup_expired_reservations',
      priority: 1,
      data: {
        itemCode: error.itemCode,
        location: error.location
      },
      estimatedTime: '5-10 minutes'
    });

    // Queue reservation
    recoveryOptions.push({
      type: 'queue_reservation',
      description: 'Add to reservation queue with priority',
      action: 'queue_reservation_request',
      priority: 2,
      data: {
        itemCode: error.itemCode,
        quantity: error.quantity,
        priority: error.priority || 'normal'
      },
      estimatedTime: 'Variable'
    });

    return {
      error,
      recoveryOptions,
      severity: 'medium',
      autoRecoverable: true,
      requiresManualIntervention: false
    };
  }

  /**
   * Handle stock movement errors
   */
  static handleStockMovement(error: StockMovementError): HandlerResult<StockMovementError> {
    const recoveryOptions: RecoveryOption[] = [];

    // Retry with validation
    recoveryOptions.push({
      type: 'retry_with_validation',
      description: 'Retry movement with enhanced validation',
      action: 'retry_movement_validated',
      priority: 1,
      data: {
        itemCode: error.itemCode,
        quantity: error.quantity,
        fromLocation: error.fromLocation,
        toLocation: error.toLocation
      },
      estimatedTime: '2-5 minutes'
    });

    // Split movement
    if (error.quantity > 1) {
      recoveryOptions.push({
        type: 'split_movement',
        description: 'Split into smaller batch movements',
        action: 'split_movement_batches',
        priority: 2,
        data: {
          itemCode: error.itemCode,
          totalQuantity: error.quantity,
          batchSize: Math.ceil(error.quantity / 3),
          fromLocation: error.fromLocation,
          toLocation: error.toLocation
        },
        estimatedTime: '10-15 minutes'
      });
    }

    return {
      error,
      recoveryOptions,
      severity: 'medium',
      autoRecoverable: true,
      requiresManualIntervention: false
    };
  }
}