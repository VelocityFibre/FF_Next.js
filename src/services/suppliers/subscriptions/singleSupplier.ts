/**
 * Single Supplier Subscription Service
 * Handle real-time subscriptions for individual suppliers
 */

import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Supplier } from '@/types/supplier/base.types';
import { SupplierCallback, SubscriptionOptions } from './types';
import { log } from '@/lib/logger';

const COLLECTION_NAME = 'suppliers';

export class SingleSupplierSubscription {
  /**
   * Subscribe to a single supplier's changes
   */
  static subscribeToSupplier(
    supplierId: string,
    callback: SupplierCallback,
    options?: SubscriptionOptions
  ): () => void {
    try {
      const docRef = doc(db, COLLECTION_NAME, supplierId);
      
      const unsubscribe = onSnapshot(
        docRef,
        {
          includeMetadataChanges: options?.includeMetadata || false
        },
        (snapshot) => {
          if (snapshot.exists()) {
            const supplier: Supplier = {
              id: snapshot.id,
              ...snapshot.data()
            } as Supplier;
            
            callback(supplier);
          } else {
            // Supplier was deleted
            options?.onError?.(new Error(`Supplier ${supplierId} no longer exists`));
          }
        },
        (error) => {
          log.error(`Error subscribing to supplier ${supplierId}:`, { data: error }, 'singleSupplier');
          options?.onError?.(error);
        }
      );

      return unsubscribe;
    } catch (error) {
      log.error(`Error setting up supplier subscription for ${supplierId}:`, { data: error }, 'singleSupplier');
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      options?.onError?.(errorObj);
      
      // Return no-op unsubscribe function
      return () => {};
    }
  }
}