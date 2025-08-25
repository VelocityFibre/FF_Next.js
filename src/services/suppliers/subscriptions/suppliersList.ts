/**
 * Suppliers List Subscription Service
 * Handle real-time subscriptions for supplier collections with filtering
 */

import { query, collection, onSnapshot, orderBy, where, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Supplier, SupplierStatus } from '@/types/supplier/base.types';
import { SuppliersCallback, SupplierSubscriptionFilter, SubscriptionOptions } from './types';

const COLLECTION_NAME = 'suppliers';

export class SuppliersListSubscription {
  /**
   * Subscribe to all suppliers with optional filtering
   */
  static subscribeToSuppliers(
    callback: SuppliersCallback,
    filter?: SupplierSubscriptionFilter,
    options?: SubscriptionOptions
  ): () => void {
    try {
      let q = query(collection(db, COLLECTION_NAME));

      // Apply filters
      if (filter?.status) {
        q = query(q, where('status', '==', filter.status));
      }
      if (filter?.isPreferred !== undefined) {
        q = query(q, where('isPreferred', '==', filter.isPreferred));
      }
      if (filter?.category) {
        q = query(q, where('categories', 'array-contains', filter.category));
      }

      // Add ordering and limit
      q = query(q, orderBy('companyName', 'asc'));
      if (filter?.limit) {
        q = query(q, limit(filter.limit));
      }
      
      const unsubscribe = onSnapshot(
        q,
        {
          includeMetadataChanges: options?.includeMetadata || false
        },
        (snapshot) => {
          const suppliers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Supplier));
          
          callback(suppliers);
        },
        (error) => {
          console.error('Error subscribing to suppliers:', error);
          options?.onError?.(error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up suppliers subscription:', error);
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      options?.onError?.(errorObj);
      
      // Return no-op unsubscribe function
      return () => {};
    }
  }

  /**
   * Subscribe to preferred suppliers only
   */
  static subscribeToPreferredSuppliers(
    callback: SuppliersCallback,
    options?: SubscriptionOptions
  ): () => void {
    return this.subscribeToSuppliers(
      callback,
      { 
        status: SupplierStatus.ACTIVE, 
        isPreferred: true 
      },
      options
    );
  }

  /**
   * Subscribe to suppliers by category
   */
  static subscribeToCategorySuppliers(
    category: string,
    callback: SuppliersCallback,
    options?: SubscriptionOptions
  ): () => void {
    return this.subscribeToSuppliers(
      callback,
      { 
        status: SupplierStatus.ACTIVE,
        category 
      },
      options
    );
  }

  /**
   * Subscribe to suppliers pending approval
   */
  static subscribeToPendingSuppliers(
    callback: SuppliersCallback,
    options?: SubscriptionOptions
  ): () => void {
    return this.subscribeToSuppliers(
      callback,
      { status: SupplierStatus.PENDING },
      options
    );
  }
}