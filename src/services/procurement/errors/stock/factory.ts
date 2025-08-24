/**
 * Stock Error Factory
 * Factory for creating appropriate error instances
 */

import { InsufficientStockError, StockReservationError } from './inventory';
import { StockMovementError, StockTransferError, StockAdjustmentError } from './tracking';

/**
 * Stock error factory for creating appropriate error instances
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

  /**
   * Create error from generic parameters
   */
  static createFromType(
    errorType: string,
    parameters: Record<string, any>
  ): InsufficientStockError | StockMovementError | StockReservationError | StockTransferError | StockAdjustmentError {
    switch (errorType) {
      case 'InsufficientStockError':
        return this.createInsufficientStockError(
          parameters.itemCode,
          parameters.requestedQuantity,
          parameters.availableQuantity,
          parameters.options,
          parameters.context
        );

      case 'StockMovementError':
        return this.createMovementError(
          parameters.message,
          parameters.movementType,
          parameters.itemCode,
          parameters.quantity,
          parameters.options,
          parameters.context
        );

      case 'StockReservationError':
        return this.createReservationError(
          parameters.itemCode,
          parameters.requestedQuantity,
          parameters.availableQuantity,
          parameters.existingReservations,
          parameters.context
        );

      case 'StockTransferError':
        return this.createTransferError(
          parameters.itemCode,
          parameters.fromLocation,
          parameters.toLocation,
          parameters.quantity,
          parameters.reason,
          parameters.options,
          parameters.context
        );

      case 'StockAdjustmentError':
        return this.createAdjustmentError(
          parameters.itemCode,
          parameters.location,
          parameters.adjustmentType,
          parameters.adjustmentQuantity,
          parameters.currentQuantity,
          parameters.message,
          parameters.options,
          parameters.context
        );

      default:
        throw new Error(`Unknown error type: ${errorType}`);
    }
  }

  /**
   * Validate error creation parameters
   */
  static validateParameters(errorType: string, parameters: Record<string, any>): boolean {
    const requiredFields = {
      InsufficientStockError: ['itemCode', 'requestedQuantity', 'availableQuantity'],
      StockMovementError: ['message', 'movementType', 'itemCode', 'quantity'],
      StockReservationError: ['itemCode', 'requestedQuantity', 'availableQuantity', 'existingReservations'],
      StockTransferError: ['itemCode', 'fromLocation', 'toLocation', 'quantity', 'reason'],
      StockAdjustmentError: ['itemCode', 'location', 'adjustmentType', 'adjustmentQuantity', 'currentQuantity', 'message']
    };

    const required = requiredFields[errorType as keyof typeof requiredFields];
    if (!required) {
      return false;
    }

    return required.every(field => parameters.hasOwnProperty(field) && parameters[field] !== undefined);
  }

  /**
   * Create error with validation
   */
  static createValidated(
    errorType: string,
    parameters: Record<string, any>
  ): InsufficientStockError | StockMovementError | StockReservationError | StockTransferError | StockAdjustmentError {
    if (!this.validateParameters(errorType, parameters)) {
      throw new Error(`Invalid parameters for error type: ${errorType}`);
    }

    return this.createFromType(errorType, parameters);
  }
}