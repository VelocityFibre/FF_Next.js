/**
 * Subscriber CRUD Operations
 * Batch subscriptions and advanced RFQ subscription management
 */

import { 
  collection, 
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/src/config/firebase';
import { RFQ, RFQStatus } from '@/types/procurement.types';
import { RFQSubscriptionManager } from './subscription-manager';
import { log } from '@/lib/logger';

const COLLECTION_NAME = 'rfqs';

export class RFQSubscriberCrud {
  /**
   * Batch subscribe to multiple RFQs
   */
  static batchSubscribeToRFQs(
    rfqIds: string[],
    callback: (rfqUpdates: Map<string, RFQ>) => void
  ): () => void {
    const unsubscribeFunctions: (() => void)[] = [];
    const rfqUpdates = new Map<string, RFQ>();

    rfqIds.forEach(rfqId => {
      const unsubscribe = RFQSubscriptionManager.subscribeToRFQ(rfqId, (rfq) => {
        rfqUpdates.set(rfqId, rfq);
        callback(new Map(rfqUpdates)); // Pass a copy
      });
      unsubscribeFunctions.push(unsubscribe);
    });

    // Return a function that unsubscribes from all
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }

  /**
   * Create a custom subscription with advanced filtering
   */
  static createCustomSubscription(
    filters: {
      projectIds?: string[];
      statuses?: RFQStatus[];
      supplierIds?: string[];
      dateRange?: {
        start: Date;
        end: Date;
        field: 'createdAt' | 'responseDeadline' | 'updatedAt';
      };
      tags?: string[];
    },
    callback: (rfqs: RFQ[]) => void
  ): () => void {
    let q = query(collection(db, COLLECTION_NAME));

    // Apply filters
    if (filters.projectIds && filters.projectIds.length > 0) {
      q = query(q, where('projectId', 'in', filters.projectIds));
    }

    if (filters.statuses && filters.statuses.length > 0) {
      q = query(q, where('status', 'in', filters.statuses));
    }

    if (filters.dateRange) {
      q = query(q, 
        where(filters.dateRange.field, '>=', filters.dateRange.start),
        where(filters.dateRange.field, '<=', filters.dateRange.end)
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      q = query(q, where('tags', 'array-contains-any', filters.tags));
    }

    // Add ordering
    q = query(q, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      let rfqs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RFQ));

      // Apply client-side filters that can't be done in Firestore
      if (filters.supplierIds && filters.supplierIds.length > 0) {
        rfqs = rfqs.filter(rfq => 
          rfq.invitedSuppliers?.some((id: string) => filters.supplierIds!.includes(id))
        );
      }

      callback(rfqs);
    }, (error) => {
      log.error('Error in custom subscription:', { data: error }, 'subscriber-crud');
    });
  }

  /**
   * Subscription utility methods
   */
  static createSubscriptionGroup(subscriptions: Array<() => void>): () => void {
    return () => {
      subscriptions.forEach(unsubscribe => unsubscribe());
    };
  }

  /**
   * Smart subscription that batches updates
   */
  static createBatchedSubscription<T>(
    subscriptionFn: (callback: (data: T) => void) => () => void,
    batchCallback: (data: T[]) => void,
    batchSize: number = 10,
    batchDelay: number = 1000
  ): () => void {
    let batch: T[] = [];
    let timeout: NodeJS.Timeout | null = null;

    const processBatch = () => {
      if (batch.length > 0) {
        batchCallback([...batch]);
        batch = [];
      }
      timeout = null;
    };

    const unsubscribe = subscriptionFn((data: T) => {
      batch.push(data);

      if (batch.length >= batchSize) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        processBatch();
      } else if (!timeout) {
        timeout = setTimeout(processBatch, batchDelay);
      }
    });

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      unsubscribe();
      processBatch(); // Process any remaining items
    };
  }
}