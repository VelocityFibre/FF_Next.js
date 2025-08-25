/**
 * Subscription Manager
 * Manage multiple supplier subscriptions with automatic cleanup
 */

// Removed unused import: SupplierStatus
import { 
  ISubscriptionManager, 
  SupplierCallback, 
  SuppliersCallback, 
  SubscriptionOptions,
  SupplierSubscriptionFilter
} from './types';
import { SingleSupplierSubscription } from './singleSupplier';
import { SuppliersListSubscription } from './suppliersList';

export class SubscriptionManager implements ISubscriptionManager {
  private subscriptions = new Map<string, () => void>();

  /**
   * Add a named subscription
   */
  add(name: string, unsubscribe: () => void): void {
    // Clean up existing subscription with the same name
    this.remove(name);
    this.subscriptions.set(name, unsubscribe);
  }

  /**
   * Remove a specific subscription
   */
  remove(name: string): void {
    const unsubscribe = this.subscriptions.get(name);
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(name);
    }
  }

  /**
   * Remove all subscriptions
   */
  removeAll(): void {
    this.subscriptions.forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    });
    this.subscriptions.clear();
  }

  /**
   * Get active subscription names
   */
  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Check if a subscription is active
   */
  hasSubscription(name: string): boolean {
    return this.subscriptions.has(name);
  }

  /**
   * Get subscription count
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Subscribe to supplier with automatic management
   */
  subscribeToSupplier(
    name: string,
    supplierId: string,
    callback: SupplierCallback,
    options?: SubscriptionOptions
  ): void {
    const unsubscribe = SingleSupplierSubscription.subscribeToSupplier(
      supplierId,
      callback,
      options
    );
    this.add(name, unsubscribe);
  }

  /**
   * Subscribe to suppliers list with automatic management
   */
  subscribeToSuppliers(
    name: string,
    callback: SuppliersCallback,
    filter?: SupplierSubscriptionFilter,
    options?: SubscriptionOptions
  ): void {
    const unsubscribe = SuppliersListSubscription.subscribeToSuppliers(
      callback,
      filter,
      options
    );
    this.add(name, unsubscribe);
  }

  /**
   * Subscribe to preferred suppliers with automatic management
   */
  subscribeToPreferred(
    name: string,
    callback: SuppliersCallback,
    options?: SubscriptionOptions
  ): void {
    const unsubscribe = SuppliersListSubscription.subscribeToPreferredSuppliers(
      callback,
      options
    );
    this.add(name, unsubscribe);
  }

  /**
   * Subscribe to category suppliers with automatic management
   */
  subscribeToCategory(
    name: string,
    category: string,
    callback: SuppliersCallback,
    options?: SubscriptionOptions
  ): void {
    const unsubscribe = SuppliersListSubscription.subscribeToCategorySuppliers(
      category,
      callback,
      options
    );
    this.add(name, unsubscribe);
  }

  /**
   * Cleanup when component unmounts or service is destroyed
   */
  destroy(): void {
    this.removeAll();
  }
}