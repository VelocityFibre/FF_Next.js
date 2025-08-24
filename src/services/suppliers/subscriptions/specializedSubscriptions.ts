/**
 * Specialized Supplier Subscriptions
 * Handle specific real-time subscriptions for ratings and compliance
 */

import { query, collection, onSnapshot, orderBy, where, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { SupplierStatus } from '@/types/supplier.types';
import { SubscriptionOptions, SupplierRatingData, SupplierComplianceData } from './types';

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
          console.error('Error subscribing to supplier ratings:', error);
          options?.onError?.(error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up supplier ratings subscription:', error);
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
          console.error('Error subscribing to compliance status:', error);
          options?.onError?.(error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up compliance status subscription:', error);
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      options?.onError?.(errorObj);
      
      return () => {};
    }
  }
}