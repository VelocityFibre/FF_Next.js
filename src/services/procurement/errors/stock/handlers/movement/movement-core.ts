/**
 * Movement Handler Core
 * Core functionality for handling stock movement errors
 */

import { StockMovementError } from '../../tracking';
import { HandlerUtils } from '../handler-utils';
import { RetryStrategy } from '../index';
import { MovementUtils } from './movement-utils';

/**
 * Core handlers for stock movement errors
 */
export class MovementCore {
  /**
   * Handle stock movement errors with comprehensive retry strategies
   */
  static handleMovementError(error: StockMovementError): {
    error: StockMovementError;
    retryStrategies: RetryStrategy[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    autoRecoverable: boolean;
  } {
    const retryStrategies: RetryStrategy[] = [];

    // Enhanced validation retry
    retryStrategies.push({
      type: 'validated_retry',
      description: 'Retry movement with comprehensive validation checks',
      action: 'retry_with_enhanced_validation',
      maxAttempts: 3,
      backoffMs: HandlerUtils.calculateRetryDelay(1),
      estimatedTime: '2-5 minutes',
      data: {
        itemCode: error.itemCode,
        movementType: error.movementType,
        quantity: error.quantity,
        fromLocation: error.fromLocation,
        toLocation: error.toLocation,
        validationLevel: 'comprehensive',
        includeStockChecks: true,
        verifyLocationAccess: true,
        checkBusinessRules: true
      }
    });

    // Split large movements into batches
    if (error.quantity > 10) {
      const optimalBatchSize = MovementUtils.calculateOptimalBatchSize(error.quantity, error.movementType);
      const numberOfBatches = Math.ceil(error.quantity / optimalBatchSize);

      retryStrategies.push({
        type: 'batch_processing',
        description: `Split movement into ${numberOfBatches} batches of ${optimalBatchSize} units`,
        action: 'split_movement_batches',
        maxAttempts: 1,
        estimatedTime: `${numberOfBatches * 2}-${numberOfBatches * 5} minutes`,
        data: {
          itemCode: error.itemCode,
          movementType: error.movementType,
          totalQuantity: error.quantity,
          batchSize: optimalBatchSize,
          numberOfBatches,
          fromLocation: error.fromLocation,
          toLocation: error.toLocation,
          processingDelay: 30000, // 30 seconds between batches
          rollbackOnFailure: true
        }
      });
    }

    // Alternative timing/scheduling
    retryStrategies.push({
      type: 'optimized_timing',
      description: 'Retry during optimal system conditions',
      action: 'schedule_optimal_timing',
      maxAttempts: 2,
      estimatedTime: 'Variable (based on system load)',
      data: {
        movementDetails: {
          itemCode: error.itemCode,
          movementType: error.movementType,
          quantity: error.quantity,
          fromLocation: error.fromLocation,
          toLocation: error.toLocation
        },
        schedulingPreferences: {
          avoidPeakHours: true,
          preferLowSystemLoad: true,
          maxDelayMinutes: 120
        }
      }
    });

    // System resource optimization
    if (error.message.includes('timeout') || error.message.includes('resource')) {
      retryStrategies.push({
        type: 'resource_optimization',
        description: 'Retry with optimized resource allocation',
        action: 'retry_with_resource_optimization',
        maxAttempts: 2,
        backoffMs: 10000,
        estimatedTime: '3-7 minutes',
        data: {
          itemCode: error.itemCode,
          movementType: error.movementType,
          quantity: error.quantity,
          resourceOptimizations: {
            increasedTimeout: true,
            priorityProcessing: true,
            dedicatedResources: true,
            reducedConcurrency: true
          }
        }
      });
    }

    // Manual intervention fallback
    retryStrategies.push({
      type: 'manual_processing',
      description: 'Request manual processing for complex movement',
      action: 'request_manual_processing',
      maxAttempts: 1,
      estimatedTime: '15-45 minutes',
      data: {
        itemCode: error.itemCode,
        movementType: error.movementType,
        quantity: error.quantity,
        fromLocation: error.fromLocation,
        toLocation: error.toLocation,
        originalError: error.message,
        priority: MovementUtils.determineMovementPriority(error),
        specialInstructions: MovementUtils.generateSpecialInstructions(error)
      }
    });

    const severity = HandlerUtils.determineSeverity(error);
    const autoRecoverable = HandlerUtils.isAutoRecoverable(error);

    return {
      error,
      retryStrategies,
      severity,
      autoRecoverable
    };
  }
}