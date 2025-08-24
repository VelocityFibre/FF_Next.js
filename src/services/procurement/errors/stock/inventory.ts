/**
 * Stock Inventory Management Errors
 * Errors related to stock levels, availability, and inventory operations
 */

import { ProcurementError } from '../base.errors';

/**
 * Stock management base error class
 */
export class StockError extends ProcurementError {
  constructor(message: string, code: string, statusCode: number = 400, context?: Record<string, any>) {
    super(message, code, statusCode, context);
    this.name = 'StockError';
    Object.setPrototypeOf(this, StockError.prototype);
  }
}

/**
 * Insufficient stock error with comprehensive availability details
 */
export class InsufficientStockError extends StockError {
  public readonly itemCode: string;
  public readonly requestedQuantity: number;
  public readonly availableQuantity: number;
  public readonly reservedQuantity?: number;
  public readonly alternativeLocations?: Array<{
    location: string;
    locationId: string;
    availableQuantity: number;
    estimatedTransferTime?: string;
    transferCost?: number;
  }>;
  public readonly alternativeItems?: Array<{
    itemCode: string;
    itemName: string;
    availableQuantity: number;
    compatibility: number; // 0-100%
    priceDifference?: number;
  }>;

  constructor(
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
  ) {
    const message = `Insufficient stock for ${itemCode}. Requested: ${requestedQuantity}, Available: ${availableQuantity}`;
    super(message, 'INSUFFICIENT_STOCK', 409, context);
    this.name = 'InsufficientStockError';
    this.itemCode = itemCode;
    this.requestedQuantity = requestedQuantity;
    this.availableQuantity = availableQuantity;
    this.reservedQuantity = options?.reservedQuantity;
    this.alternativeLocations = options?.alternativeLocations;
    this.alternativeItems = options?.alternativeItems;
    Object.setPrototypeOf(this, InsufficientStockError.prototype);
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      itemCode: this.itemCode,
      requestedQuantity: this.requestedQuantity,
      availableQuantity: this.availableQuantity,
      reservedQuantity: this.reservedQuantity,
      shortfall: this.getShortfall(),
      fulfillmentOptions: this.getFulfillmentOptions(),
      alternativeLocations: this.alternativeLocations,
      alternativeItems: this.alternativeItems
    };
  }

  /**
   * Get the quantity shortfall
   */
  getShortfall(): number {
    return Math.max(0, this.requestedQuantity - this.availableQuantity);
  }

  /**
   * Get total available quantity from alternative locations
   */
  getTotalAlternativeQuantity(): number {
    if (!this.alternativeLocations) return 0;
    return this.alternativeLocations.reduce((total, location) => 
      total + location.availableQuantity, 0
    );
  }

  /**
   * Check if requirement can be fulfilled from alternative locations
   */
  canFulfillFromAlternatives(): boolean {
    return this.availableQuantity + this.getTotalAlternativeQuantity() >= this.requestedQuantity;
  }

  /**
   * Get fulfillment options with costs and timing
   */
  getFulfillmentOptions(): Array<{
    type: 'partial' | 'alternative_locations' | 'alternative_items' | 'backorder';
    description: string;
    quantity: number;
    additionalCost?: number;
    estimatedTime?: string;
  }> {
    const options = [];

    // Partial fulfillment
    if (this.availableQuantity > 0) {
      options.push({
        type: 'partial' as const,
        description: `Fulfill ${this.availableQuantity} units immediately, backorder ${this.getShortfall()} units`,
        quantity: this.availableQuantity
      });
    }

    // Alternative locations
    if (this.alternativeLocations?.length) {
      const totalAlt = this.getTotalAlternativeQuantity();
      options.push({
        type: 'alternative_locations' as const,
        description: `Transfer from ${this.alternativeLocations.length} alternative locations`,
        quantity: Math.min(totalAlt, this.getShortfall()),
        additionalCost: this.alternativeLocations.reduce((sum, loc) => 
          sum + (loc.transferCost || 0), 0),
        estimatedTime: this.getMaxTransferTime()
      });
    }

    // Alternative items
    if (this.alternativeItems?.length) {
      const bestAlternatives = this.alternativeItems
        .filter(item => item.compatibility >= 80)
        .sort((a, b) => b.compatibility - a.compatibility)
        .slice(0, 3);

      if (bestAlternatives.length > 0) {
        options.push({
          type: 'alternative_items' as const,
          description: `Use ${bestAlternatives.length} compatible alternative items`,
          quantity: bestAlternatives.reduce((sum, item) => 
            sum + Math.min(item.availableQuantity, this.getShortfall()), 0
          )
        });
      }
    }

    return options;
  }

  /**
   * Get maximum transfer time from alternative locations
   */
  private getMaxTransferTime(): string {
    if (!this.alternativeLocations?.length) return '';
    
    const times = this.alternativeLocations
      .map(loc => loc.estimatedTransferTime)
      .filter(time => time)
      .sort();
    
    return times[times.length - 1] || '';
  }
}

/**
 * Stock reservation error for allocation issues
 */
export class StockReservationError extends StockError {
  public readonly itemCode: string;
  public readonly requestedQuantity: number;
  public readonly availableQuantity: number;
  public readonly existingReservations: Array<{
    reservationId: string;
    quantity: number;
    expiresAt?: Date;
    purpose: string;
  }>;

  constructor(
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
  ) {
    const message = `Cannot reserve ${requestedQuantity} units of ${itemCode}. Available: ${availableQuantity}`;
    super(message, 'STOCK_RESERVATION_FAILED', 409, context);
    this.name = 'StockReservationError';
    this.itemCode = itemCode;
    this.requestedQuantity = requestedQuantity;
    this.availableQuantity = availableQuantity;
    this.existingReservations = existingReservations;
    Object.setPrototypeOf(this, StockReservationError.prototype);
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      itemCode: this.itemCode,
      requestedQuantity: this.requestedQuantity,
      availableQuantity: this.availableQuantity,
      existingReservations: this.existingReservations,
      totalReserved: this.getTotalReservedQuantity(),
      expiredReservations: this.getExpiredReservations()
    };
  }

  /**
   * Get total reserved quantity
   */
  getTotalReservedQuantity(): number {
    return this.existingReservations.reduce((total, reservation) => 
      total + reservation.quantity, 0);
  }

  /**
   * Get expired reservations that could be released
   */
  getExpiredReservations() {
    const now = new Date();
    return this.existingReservations.filter(reservation => 
      reservation.expiresAt && reservation.expiresAt < now
    );
  }

  /**
   * Get quantity that could be freed by releasing expired reservations
   */
  getExpiredQuantity(): number {
    return this.getExpiredReservations().reduce((total, reservation) => 
      total + reservation.quantity, 0);
  }
}