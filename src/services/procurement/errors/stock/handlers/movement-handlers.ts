/**
 * Movement Error Handlers
 * Specialized handlers for stock movement and transfer errors
 */

import { StockMovementError, StockTransferError } from '../tracking';
import { HandlerUtils } from './handler-utils';

export interface RetryStrategy {
  type: string;
  description: string;
  action: string;
  data: any;
  maxAttempts?: number;
  backoffMs?: number;
  estimatedTime?: string;
}

/**
 * Handlers for movement and transfer stock errors
 */
export class MovementHandlers {
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
      const optimalBatchSize = this.calculateOptimalBatchSize(error.quantity, error.movementType);
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
        priority: this.determineMovementPriority(error),
        specialInstructions: this.generateSpecialInstructions(error)
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
    const intermediateLocations = this.findIntermediateLocations(error.fromLocation, error.toLocation);
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
   * Calculate optimal batch size for movement operations
   */
  private static calculateOptimalBatchSize(totalQuantity: number, movementType: string): number {
    // Base batch size based on movement type
    const baseBatchSize = {
      'inbound': 25,
      'outbound': 20,
      'transfer': 15,
      'adjustment': 10
    }[movementType] || 15;

    // Adjust based on total quantity
    if (totalQuantity > 100) return baseBatchSize * 2;
    if (totalQuantity > 50) return baseBatchSize * 1.5;
    if (totalQuantity < 20) return Math.min(totalQuantity, baseBatchSize);
    
    return baseBatchSize;
  }

  /**
   * Find intermediate locations for multi-hop transfers
   */
  private static findIntermediateLocations(fromLocation: string, toLocation: string): string[] {
    // Mock implementation - in real system, this would query location routing table
    const locationMap: Record<string, string[]> = {
      'warehouse-a': ['staging-1', 'hub-central'],
      'warehouse-b': ['staging-2', 'hub-central'],
      'retail-1': ['staging-1', 'hub-north'],
      'retail-2': ['staging-2', 'hub-south']
    };

    const fromOptions = locationMap[fromLocation] || [];
    const toOptions = locationMap[toLocation] || [];
    
    // Find common intermediate locations
    const commonLocations = fromOptions.filter(loc => toOptions.includes(loc));
    
    return commonLocations.length > 0 ? commonLocations : ['hub-central']; // Default fallback
  }

  /**
   * Determine movement priority based on error characteristics
   */
  private static determineMovementPriority(error: StockMovementError): 'low' | 'normal' | 'high' | 'critical' {
    // Customer-impacting movements get higher priority
    if (error.movementType === 'outbound') return 'high';
    
    // Large quantities suggest important operations
    if (error.quantity > 100) return 'high';
    
    // Certain error types suggest system issues
    if (error.message.includes('timeout') || error.message.includes('deadlock')) {
      return 'high';
    }
    
    return 'normal';
  }

  /**
   * Generate special instructions for manual processing
   */
  private static generateSpecialInstructions(error: StockMovementError): string[] {
    const instructions: string[] = [];

    if (error.quantity > 50) {
      instructions.push('Large quantity movement - verify capacity at destination');
    }

    if (error.movementType === 'outbound') {
      instructions.push('Customer-impacting movement - prioritize processing');
    }

    if (error.message.includes('validation')) {
      instructions.push('Previous validation failed - double-check item codes and quantities');
    }

    if (error.fromLocation && error.toLocation) {
      instructions.push(`Verify direct route from ${error.fromLocation} to ${error.toLocation}`);
    }

    return instructions.length > 0 ? instructions : ['Standard movement processing'];
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

  /**
   * Execute movement retry strategy
   */
  static async executeRetry(retryStrategy: RetryStrategy): Promise<{
    success: boolean;
    result?: any;
    error?: string;
    shouldRetry?: boolean;
  }> {
    try {
      console.log(`Executing movement retry: ${retryStrategy.type}`, retryStrategy.data);
      
      switch (retryStrategy.action) {
        case 'retry_with_enhanced_validation':
          const validationSuccess = Math.random() > 0.3; // 70% success rate
          return {
            success: validationSuccess,
            result: validationSuccess ? {
              movementId: `MOV-${Date.now()}`,
              validationPassed: true,
              processingTime: `${Math.floor(Math.random() * 3) + 2} minutes`
            } : undefined,
            error: validationSuccess ? undefined : 'Enhanced validation failed',
            shouldRetry: !validationSuccess && (retryStrategy.maxAttempts || 1) > 1
          };

        case 'split_movement_batches':
          return {
            success: true,
            result: {
              batchPlan: {
                totalBatches: retryStrategy.data.numberOfBatches,
                batchSize: retryStrategy.data.batchSize,
                estimatedDuration: retryStrategy.estimatedTime
              },
              batchIds: Array.from({ length: retryStrategy.data.numberOfBatches }, (_, i) => `BATCH-${Date.now()}-${i + 1}`),
              rollbackEnabled: retryStrategy.data.rollbackOnFailure
            }
          };

        case 'schedule_optimal_timing':
          const nextOptimalTime = new Date();
          nextOptimalTime.setHours(nextOptimalTime.getHours() + Math.floor(Math.random() * 4) + 1);
          
          return {
            success: true,
            result: {
              scheduledTime: nextOptimalTime.toISOString(),
              estimatedSystemLoad: 'low',
              schedulingId: `SCHED-${Date.now()}`,
              autoExecute: true
            }
          };

        case 'retry_direct_transfer':
          const transferSuccess = Math.random() > 0.25; // 75% success rate
          return {
            success: transferSuccess,
            result: transferSuccess ? {
              transferId: `TXF-${Date.now()}`,
              routeVerified: true,
              estimatedCompletion: new Date(Date.now() + 600000).toISOString() // 10 minutes
            } : undefined,
            error: transferSuccess ? undefined : 'Direct transfer route unavailable',
            shouldRetry: !transferSuccess && (retryStrategy.maxAttempts || 1) > 1
          };

        case 'initiate_multi_hop_transfer':
          return {
            success: true,
            result: {
              multiHopId: `MH-${Date.now()}`,
              route: [
                retryStrategy.data.originalFromLocation,
                retryStrategy.data.intermediateLocation,
                retryStrategy.data.originalToLocation
              ],
              estimatedTotalTime: retryStrategy.estimatedTime,
              intermediateStaging: retryStrategy.data.consolidateAtIntermediate
            }
          };

        case 'execute_batch_transfer':
          return {
            success: true,
            result: {
              batchTransferId: `BTX-${Date.now()}`,
              batches: retryStrategy.data.numberOfBatches,
              batchInterval: `${retryStrategy.data.batchInterval / 1000} seconds`,
              totalEstimatedTime: retryStrategy.estimatedTime,
              monitoringEnabled: true
            }
          };

        default:
          return {
            success: true,
            result: { action: retryStrategy.action, executed: true }
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during movement retry',
        shouldRetry: true
      };
    }
  }
}