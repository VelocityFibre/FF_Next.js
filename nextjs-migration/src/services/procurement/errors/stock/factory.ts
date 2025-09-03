/**
 * Stock Error Factory
 * Factory for creating appropriate error instances
 */

import { InsufficientStockError, StockReservationError } from './inventory';
import { StockMovementError, StockTransferError, StockAdjustmentError, StockTrackingError } from './tracking';
import type { 
  MovementType,
  AdjustmentType,
  InsufficientStockOptions,
  MovementOptions,
  TransferOptions,
  AdjustmentOptions,
  TrackingOptions,
  ExistingReservation
} from './types';

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
    options?: InsufficientStockOptions,
    context?: Record<string, any>
  ): InsufficientStockError {
    return new InsufficientStockError(itemCode, requestedQuantity, availableQuantity, options, context);
  }

  /**
   * Create a stock movement error
   */
  static createMovementError(
    message: string,
    movementType: MovementType,
    itemCode: string,
    quantity: number,
    options?: MovementOptions,
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
    existingReservations: ExistingReservation[],
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
    options?: TransferOptions,
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
    adjustmentType: AdjustmentType,
    adjustmentQuantity: number,
    currentQuantity: number,
    message: string,
    options?: AdjustmentOptions,
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
   * Create a stock tracking error
   */
  static createTrackingError(
    message: string,
    itemCode: string,
    operationType: string,
    details: Record<string, any> = {},
    options?: TrackingOptions,
    context?: Record<string, any>
  ): StockTrackingError {
    return new StockTrackingError(message, itemCode, operationType, details, options, context);
  }

  /**
   * Create error from generic parameters
   */
  static createFromType(
    errorType: string,
    parameters: Record<string, any>
  ): InsufficientStockError | StockMovementError | StockReservationError | StockTransferError | StockAdjustmentError | StockTrackingError {
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

      case 'StockTrackingError':
        return this.createTrackingError(
          parameters.message,
          parameters.itemCode,
          parameters.operationType,
          parameters.details || {},
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
      StockAdjustmentError: ['itemCode', 'location', 'adjustmentType', 'adjustmentQuantity', 'currentQuantity', 'message'],
      StockTrackingError: ['message', 'itemCode', 'operationType']
    };

    const required = requiredFields[errorType as keyof typeof requiredFields];
    if (!required) {
      return false;
    }

    return required.every(field => Object.prototype.hasOwnProperty.call(parameters, field) && parameters[field] !== undefined);
  }

  /**
   * Create error with validation
   */
  static createValidated(
    errorType: string,
    parameters: Record<string, any>
  ): InsufficientStockError | StockMovementError | StockReservationError | StockTransferError | StockAdjustmentError | StockTrackingError {
    if (!this.validateParameters(errorType, parameters)) {
      throw new Error(`Invalid parameters for error type: ${errorType}`);
    }

    return this.createFromType(errorType, parameters);
  }
}