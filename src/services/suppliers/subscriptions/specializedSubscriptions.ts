/**
 * Specialized Supplier Subscriptions
 * Handle specific real-time subscriptions for ratings and compliance
 */

import { query, collection, onSnapshot, orderBy, where, limit } from 'firebase/firestore';
import { db } from '@/src/config/firebase';
import { SupplierStatus } from '@/types/supplier/base.types';
import { SubscriptionOptions, SupplierRatingData, SupplierComplianceData } from './types';
import { log } from '@/lib/logger';

const COLLECTION_NAME = 'suppliers';

export class SpecializedSubscriptions {
  /**
   * Subscribe to supplier rating changes
   */
  static subscribeToSupplierRatings(
    callback: (suppliers: SupplierRatingData[]) => void,
    options?: SubscriptionOptions
  ): () => void {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', SupplierStatus.ACTIVE),
        orderBy('rating.overall', 'desc'),
        limit(50) // Limit to top 50 rated suppliers
      );
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const supplierRatings = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              rating: data.rating,
              companyName: data.companyName || data.name || 'Unknown'
            };
          });
          
          callback(supplierRatings);
        },
        (error) => {
          log.error('Error subscribing to supplier ratings:', { data: error }, 'specializedSubscriptions');
          options?.onError?.(error);
        }
      );

      return unsubscribe;
    } catch (error) {
      log.error('Error setting up supplier ratings subscription:', { data: error }, 'specializedSubscriptions');
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      options?.onError?.(errorObj);
      
      return () => {};
    }
  }

  /**
   * Subscribe to compliance status changes
   */
  static subscribeToComplianceStatus(
    callback: (suppliers: SupplierComplianceData[]) => void,
    options?: SubscriptionOptions
  ): () => void {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', 'in', [SupplierStatus.ACTIVE, SupplierStatus.PENDING]),
        orderBy('companyName')
      );
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const complianceData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              companyName: data.companyName || data.name || 'Unknown',
              complianceStatus: data.complianceStatus || {},
              status: data.status as SupplierStatus
            };
          });
          
          callback(complianceData);
        },
        (error) => {
          log.error('Error subscribing to compliance status:', { data: error }, 'specializedSubscriptions');
          options?.onError?.(error);
        }
      );

      return unsubscribe;
    } catch (error) {
      log.error('Error setting up compliance status subscription:', { data: error }, 'specializedSubscriptions');
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      options?.onError?.(errorObj);
      
      return () => {};
    }
  }
}