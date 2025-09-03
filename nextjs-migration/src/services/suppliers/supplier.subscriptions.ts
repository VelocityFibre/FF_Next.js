/**
 * Supplier Subscriptions Service - Legacy Compatibility Layer
 * @deprecated Use './subscriptions' modular components instead
 * This file maintains backward compatibility for existing imports
 * New code should import from './subscriptions' directly
 */

// Re-export everything from the modular structure
export * from './subscriptions';

// Import services for legacy class compatibility
import { 
  SingleSupplierSubscription,
  SuppliersListSubscription,
  SpecializedSubscriptions,
  SubscriptionManager,
  SupplierCallback,
  SuppliersCallback,
  SubscriptionOptions,
  SupplierSubscriptionFilter,
  SupplierRatingData,
  SupplierComplianceData
} from './subscriptions';
// Removed unused import: SupplierStatus

/**
 * Supplier subscription service for real-time updates
 * @deprecated Use individual services from './subscriptions' instead
 */
export class SupplierSubscriptionService {
  /**
   * Subscribe to a single supplier's changes
   * @deprecated Use SingleSupplierSubscription.subscribeToSupplier() instead
   */
  static subscribeToSupplier(
    supplierId: string,
    callback: SupplierCallback,
    options?: SubscriptionOptions
  ): () => void {
    return SingleSupplierSubscription.subscribeToSupplier(supplierId, callback, options);
  }

  /**
   * Subscribe to all suppliers with optional filtering
   * @deprecated Use SuppliersListSubscription.subscribeToSuppliers() instead
   */
  static subscribeToSuppliers(
    callback: SuppliersCallback,
    filter?: SupplierSubscriptionFilter,
    options?: SubscriptionOptions
  ): () => void {
    return SuppliersListSubscription.subscribeToSuppliers(callback, filter, options);
  }

  /**
   * Subscribe to preferred suppliers only
   * @deprecated Use SuppliersListSubscription.subscribeToPreferredSuppliers() instead
   */
  static subscribeToPreferredSuppliers(
    callback: SuppliersCallback,
    options?: SubscriptionOptions
  ): () => void {
    return SuppliersListSubscription.subscribeToPreferredSuppliers(callback, options);
  }

  /**
   * Subscribe to suppliers by category
   * @deprecated Use SuppliersListSubscription.subscribeToCategorySuppliers() instead
   */
  static subscribeToCategorySuppliers(
    category: string,
    callback: SuppliersCallback,
    options?: SubscriptionOptions
  ): () => void {
    return SuppliersListSubscription.subscribeToCategorySuppliers(category, callback, options);
  }

  /**
   * Subscribe to suppliers pending approval
   * @deprecated Use SuppliersListSubscription.subscribeToPendingSuppliers() instead
   */
  static subscribeToPendingSuppliers(
    callback: SuppliersCallback,
    options?: SubscriptionOptions
  ): () => void {
    return SuppliersListSubscription.subscribeToPendingSuppliers(callback, options);
  }

  /**
   * Subscribe to supplier rating changes
   * @deprecated Use SpecializedSubscriptions.subscribeToSupplierRatings() instead
   */
  static subscribeToSupplierRatings(
    callback: (suppliers: SupplierRatingData[]) => void,
    options?: SubscriptionOptions
  ): () => void {
    return SpecializedSubscriptions.subscribeToSupplierRatings(callback, options);
  }

  /**
   * Subscribe to compliance status changes
   * @deprecated Use SpecializedSubscriptions.subscribeToComplianceStatus() instead
   */
  static subscribeToComplianceStatus(
    callback: (suppliers: SupplierComplianceData[]) => void,
    options?: SubscriptionOptions
  ): () => void {
    return SpecializedSubscriptions.subscribeToComplianceStatus(callback, options);
  }

  /**
   * Create a multi-subscription manager
   * @deprecated Use SubscriptionManager directly instead
   */
  static createSubscriptionManager(): SubscriptionManager {
    return new SubscriptionManager();
  }
}

// Default export for backward compatibility
export { SubscriptionManager as default } from './subscriptions';