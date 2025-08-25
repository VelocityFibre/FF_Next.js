/**
 * Core Error Formatter
 * Core error formatting and message generation for stock errors
 */

import { StockError, InsufficientStockError, StockReservationError } from '../inventory';
import { StockMovementError, StockTransferError, StockAdjustmentError } from '../tracking';
import { UserErrorDisplay, ApiErrorResponse } from './formatter-types';

/**
 * Core error formatter for stock errors
 */
export class CoreErrorFormatter {
  /**
   * Format stock error for user display
   */
  static formatErrorForUser(error: StockError): UserErrorDisplay {
    if (error instanceof InsufficientStockError) {
      return this.formatInsufficientStockError(error);
    }

    if (error instanceof StockMovementError) {
      return this.formatMovementError(error);
    }

    if (error instanceof StockReservationError) {
      return this.formatReservationError(error);
    }

    if (error instanceof StockTransferError) {
      return this.formatTransferError(error);
    }

    if (error instanceof StockAdjustmentError) {
      return this.formatAdjustmentError(error);
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
      ],
      details: undefined
    };
  }

  /**
   * Format insufficient stock error
   */
  private static formatInsufficientStockError(error: InsufficientStockError): UserErrorDisplay {
    const shortfall = error.getShortfall();
    const hasAlternatives = (error.alternativeLocations?.length || 0) > 0 || (error.alternativeItems?.length || 0) > 0;

    return {
      title: 'Insufficient Stock',
      message: `Not enough ${error.itemCode} in stock. Needed: ${error.requestedQuantity}, Available: ${error.availableQuantity}${shortfall > 0 ? ` (Short by: ${shortfall})` : ''}`,
      severity: error.availableQuantity > 0 ? 'warning' : 'error',
      actions: [
        ...(hasAlternatives ? [{
          label: 'View Alternatives',
          action: 'show_alternatives',
          primary: true
        }] : []),
        ...(error.availableQuantity > 0 ? [{
          label: 'Partial Fulfillment',
          action: 'process_partial',
          primary: !hasAlternatives
        }] : []),
        {
          label: 'Emergency Order',
          action: 'create_emergency_order',
          variant: 'outline' as const
        }
      ],
      details: {
        itemCode: error.itemCode,
        location: undefined,
        quantity: error.requestedQuantity,
        timestamp: new Date()
      }
    };
  }

  /**
   * Format stock movement error
   */
  private static formatMovementError(error: StockMovementError): UserErrorDisplay {
    const movementDescription = error.getMovementDescription();

    return {
      title: 'Stock Movement Failed',
      message: `Failed to ${movementDescription.toLowerCase()}: ${error.message}`,
      severity: 'error',
      actions: [
        {
          label: 'Retry Movement',
          action: 'retry_movement',
          primary: true
        },
        {
          label: 'Split Movement',
          action: 'split_movement',
          variant: 'outline' as const
        },
        {
          label: 'View Details',
          action: 'show_movement_details'
        }
      ],
      details: {
        itemCode: error.itemCode,
        location: undefined,
        quantity: error.quantity,
        timestamp: new Date()
      }
    };
  }

  /**
   * Format stock reservation error
   */
  private static formatReservationError(error: StockReservationError): UserErrorDisplay {
    const shortfall = error.getShortfall();
    const hasExpiredReservations = error.existingReservations.some(
      res => res.expiresAt && res.expiresAt < new Date()
    );

    return {
      title: 'Stock Reservation Failed',
      message: `Cannot reserve ${error.requestedQuantity} units of ${error.itemCode}. Available: ${error.availableQuantity}, Short by: ${shortfall}`,
      severity: 'error',
      actions: [
        ...(hasExpiredReservations ? [{
          label: 'Release Expired',
          action: 'release_expired_reservations',
          primary: true
        }] : []),
        ...(error.availableQuantity > 0 ? [{
          label: 'Partial Reservation',
          action: 'create_partial_reservation',
          primary: !hasExpiredReservations
        }] : []),
        {
          label: 'Join Queue',
          action: 'add_to_queue',
          variant: 'outline' as const
        }
      ],
      details: {
        itemCode: error.itemCode,
        location: undefined,
        quantity: error.requestedQuantity,
        timestamp: new Date()
      }
    };
  }

  /**
   * Format stock transfer error
   */
  private static formatTransferError(error: StockTransferError): UserErrorDisplay {
    return {
      title: 'Stock Transfer Failed',
      message: `Failed to transfer ${error.quantity} units of ${error.itemCode} from ${error.fromLocation} to ${error.toLocation}: ${error.reason}`,
      severity: 'error',
      actions: [
        {
          label: 'Retry Transfer',
          action: 'retry_transfer',
          primary: true
        },
        {
          label: 'Use Staging',
          action: 'transfer_via_staging',
          variant: 'outline' as const
        },
        {
          label: 'Schedule Later',
          action: 'schedule_transfer'
        }
      ],
      details: {
        itemCode: error.itemCode,
        location: `${error.fromLocation} → ${error.toLocation}`,
        quantity: error.quantity,
        timestamp: new Date()
      }
    };
  }

  /**
   * Format stock adjustment error
   */
  private static formatAdjustmentError(error: StockAdjustmentError): UserErrorDisplay {
    const adjustmentVerb = error.adjustmentType === 'increase' ? 'increase' : 
                          error.adjustmentType === 'decrease' ? 'decrease' : 'recount';

    return {
      title: 'Stock Adjustment Failed',
      message: `Failed to ${adjustmentVerb} stock for ${error.itemCode} at ${error.location}: ${error.message}`,
      severity: 'error',
      actions: [
        {
          label: 'Request Approval',
          action: 'request_supervisor_approval',
          primary: true
        },
        {
          label: 'Physical Count',
          action: 'initiate_physical_count',
          variant: 'outline' as const
        },
        {
          label: 'View History',
          action: 'show_adjustment_history'
        }
      ],
      details: {
        itemCode: error.itemCode,
        location: error.location,
        quantity: error.adjustmentQuantity,
        timestamp: new Date()
      }
    };
  }

  /**
   * Format error for API response
   */
  static formatErrorForApi(error: StockError): ApiErrorResponse {
    let code = 'STOCK_ERROR';

    if (error instanceof InsufficientStockError) {
      code = 'INSUFFICIENT_STOCK';
    } else if (error instanceof StockMovementError) {
      code = 'STOCK_MOVEMENT_FAILED';
    } else if (error instanceof StockReservationError) {
      code = 'STOCK_RESERVATION_FAILED';
    } else if (error instanceof StockTransferError) {
      code = 'STOCK_TRANSFER_FAILED';
    } else if (error instanceof StockAdjustmentError) {
      code = 'STOCK_ADJUSTMENT_FAILED';
    }

    return {
      error: true,
      errorType: error.constructor.name,
      message: error.message,
      code,
      details: error.getErrorDetails(),
      timestamp: new Date().toISOString()
    };
  }
}