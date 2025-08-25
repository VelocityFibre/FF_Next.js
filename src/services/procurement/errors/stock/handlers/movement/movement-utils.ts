/**
 * Movement Utilities
 * Utility functions for movement error handling
 */

import { StockMovementError } from '../../tracking';

/**
 * Utility functions for movement handlers
 */
export class MovementUtils {
  /**
   * Calculate optimal batch size for movement operations
   */
  static calculateOptimalBatchSize(totalQuantity: number, movementType: string): number {
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
  static findIntermediateLocations(fromLocation: string, toLocation: string): string[] {
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
  static determineMovementPriority(error: StockMovementError): 'low' | 'normal' | 'high' | 'critical' {
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
  static generateSpecialInstructions(error: StockMovementError): string[] {
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
}