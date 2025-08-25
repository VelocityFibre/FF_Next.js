/**
 * Transfer Handler
 * Specialized handling for stock transfer errors
 */

import { StockTransferError } from '../../tracking';
import { RetryStrategy } from '../index';
import { MovementUtils } from './movement-utils';

/**
 * Handlers for stock transfer errors
 */
export class TransferHandler {
  /**
   * Handle stock transfer errors with routing and scheduling strategies
   */
  static handleTransferError(error: StockTransferError): {
    error: StockTransferError;
    retryStrategies: RetryStrategy[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    autoRecoverable: boolean;
  } {
    const retryStrategies: RetryStrategy[] = [];

    // Direct transfer retry with validation
    retryStrategies.push({
      type: 'validated_direct_transfer',
      description: 'Retry direct transfer with enhanced validation',
      action: 'retry_direct_transfer',
      maxAttempts: 2,
      backoffMs: 5000,
      estimatedTime: '3-8 minutes',
      data: {
        itemCode: error.itemCode,
        fromLocation: error.fromLocation,
        toLocation: error.toLocation,
        quantity: error.quantity,
        validationChecks: {
          sourceAvailability: true,
          destinationCapacity: true,
          transferAuthorization: true,
          routeAccessibility: true
        }
      }
    });

    // Multi-hop transfer (via intermediate locations)
    const intermediateLocations = MovementUtils.findIntermediateLocations(error.fromLocation, error.toLocation);
    if (intermediateLocations.length > 0) {
      retryStrategies.push({
        type: 'multi_hop_transfer',
        description: `Route transfer via ${intermediateLocations[0]} for improved reliability`,
        action: 'initiate_multi_hop_transfer',
        maxAttempts: 1,
        estimatedTime: '30-90 minutes',
        data: {
          itemCode: error.itemCode,
          originalFromLocation: error.fromLocation,
          originalToLocation: error.toLocation,
          quantity: error.quantity,
          intermediateLocation: intermediateLocations[0],
          routingStrategy: 'reliable_path',
          consolidateAtIntermediate: error.quantity > 50
        }
      });
    }

    // Batch transfer for large quantities
    if (error.quantity > 20) {
      const batchSize = Math.min(error.quantity / 3, 25);
      const numberOfBatches = Math.ceil(error.quantity / batchSize);

      retryStrategies.push({
        type: 'batch_transfer',
        description: `Transfer in ${numberOfBatches} batches of ${Math.floor(batchSize)} units`,
        action: 'execute_batch_transfer',
        maxAttempts: 1,
        estimatedTime: `${numberOfBatches * 15}-${numberOfBatches * 30} minutes`,
        data: {
          itemCode: error.itemCode,
          fromLocation: error.fromLocation,
          toLocation: error.toLocation,
          totalQuantity: error.quantity,
          batchSize: Math.floor(batchSize),
          numberOfBatches,
          batchInterval: 300000, // 5 minutes between batches
          verifyEachBatch: true,
          rollbackOnBatchFailure: true
        }
      });
    }

    // Scheduled transfer during optimal conditions
    retryStrategies.push({
      type: 'scheduled_transfer',
      description: 'Schedule transfer during off-peak hours for better success rate',
      action: 'schedule_optimal_transfer',
      maxAttempts: 1,
      estimatedTime: 'Scheduled (within next 24 hours)',
      data: {
        itemCode: error.itemCode,
        fromLocation: error.fromLocation,
        toLocation: error.toLocation,
        quantity: error.quantity,
        schedulingPreferences: {
          preferredTimeSlots: ['02:00-06:00', '14:00-16:00'], // Low activity periods
          avoidMaintenanceWindows: true,
          considerLocationWorkHours: true,
          maxScheduleDelay: 24 * 60 * 60 * 1000 // 24 hours
        },
        priority: 'normal'
      }
    });

    // Emergency override transfer (for critical needs)
    retryStrategies.push({
      type: 'emergency_override',
      description: 'Execute transfer with emergency override (requires authorization)',
      action: 'request_emergency_override',
      maxAttempts: 1,
      estimatedTime: '10-60 minutes (requires approval)',
      data: {
        itemCode: error.itemCode,
        fromLocation: error.fromLocation,
        toLocation: error.toLocation,
        quantity: error.quantity,
        overrideReason: 'Critical business requirement',
        requiresApproval: true,
        approvalLevel: 'manager',
        businessJustification: this.generateBusinessJustification(error)
      }
    });

    const severity = this.determineTransferSeverity(error);
    const autoRecoverable = !error.reason.includes('authorization') && !error.reason.includes('capacity');

    return {
      error,
      retryStrategies,
      severity,
      autoRecoverable
    };
  }

  /**
   * Determine transfer error severity
   */
  private static determineTransferSeverity(error: StockTransferError): 'low' | 'medium' | 'high' | 'critical' {
    // Authorization issues are typically high severity
    if (error.reason.includes('authorization') || error.reason.includes('permission')) {
      return 'high';
    }

    // Capacity issues can be critical for large transfers
    if (error.reason.includes('capacity') && error.quantity > 100) {
      return 'critical';
    }

    // Large quantity transfers are generally higher priority
    if (error.quantity > 200) {
      return 'high';
    }

    return 'medium'; // Default for transfer errors
  }

  /**
   * Generate business justification for emergency override
   */
  private static generateBusinessJustification(error: StockTransferError): string {
    const reasons = [];

    if (error.quantity > 100) {
      reasons.push('Large quantity transfer required for operational continuity');
    }

    if (error.reason.includes('urgent')) {
      reasons.push('Urgent business requirement with time-sensitive deadline');
    }

    reasons.push(`Failed standard transfer processing: ${error.reason}`);
    reasons.push('Emergency override requested to prevent business disruption');

    return reasons.join('. ');
  }
}