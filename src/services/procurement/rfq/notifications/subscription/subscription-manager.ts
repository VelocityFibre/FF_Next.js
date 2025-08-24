/**
 * Subscription Manager
 * Core subscription management functionality
 */

import { 
  collection, 
  doc,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { RFQ, RFQStatus } from '@/types/procurement.types';
import type { SubscriptionFilter } from './subscription-types';

const COLLECTION_NAME = 'rfqs';
const RESPONSES_COLLECTION = 'rfq_responses';

/**
 * RFQ Real-time Subscription Manager
 */
export class RFQSubscriptionManager {
  /**
   * Subscribe to real-time RFQ updates for a specific RFQ
   */
  static subscribeToRFQ(rfqId: string, callback: (rfq: RFQ) => void): () => void {
    const docRef = doc(db, COLLECTION_NAME, rfqId);
    
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({
          id: snapshot.id,
          ...snapshot.data()
        } as RFQ);
      }
    }, (error) => {
      console.error('Error subscribing to RFQ:', error);
    });
  }

  /**
   * Subscribe to real-time RFQ responses
   */
  static subscribeToResponses(
    rfqId: string, 
    callback: (responses: any[]) => void
  ): () => void {
    const q = query(
      collection(db, RESPONSES_COLLECTION),
      where('rfqId', '==', rfqId),
      orderBy('submittedAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const responses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as any));
      callback(responses);
    }, (error) => {
      console.error('Error subscribing to RFQ responses:', error);
    });
  }

  /**
   * Subscribe to RFQs by project with real-time updates
   */
  static subscribeToProjectRFQs(
    projectId: string, 
    callback: (rfqs: RFQ[]) => void
  ): () => void {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const rfqs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RFQ));
      callback(rfqs);
    }, (error) => {
      console.error('Error subscribing to project RFQs:', error);
    });
  }

  /**
   * Subscribe to RFQs by status with real-time updates
   */
  static subscribeToRFQsByStatus(
    status: RFQStatus,
    callback: (rfqs: RFQ[]) => void
  ): () => void {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const rfqs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RFQ));
      callback(rfqs);
    }, (error) => {
      console.error('Error subscribing to RFQs by status:', error);
    });
  }

  /**
   * Subscribe to all RFQs with optional filters
   */
  static subscribeToAllRFQs(
    callback: (rfqs: RFQ[]) => void,
    filter?: SubscriptionFilter
  ): () => void {
    let q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    
    if (filter?.projectId) {
      q = query(q, where('projectId', '==', filter.projectId));
    }
    if (filter?.status) {
      q = query(q, where('status', '==', filter.status));
    }
    if (filter?.supplierId) {
      q = query(q, where('supplierIds', 'array-contains', filter.supplierId));
    }
    
    return onSnapshot(q, (snapshot) => {
      const rfqs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RFQ));
      callback(rfqs);
    }, (error) => {
      console.error('Error subscribing to all RFQs:', error);
    });
  }

  /**
   * Subscribe to supplier-specific RFQs
   */
  static subscribeToSupplierRFQs(
    supplierId: string,
    callback: (rfqs: RFQ[]) => void,
    statusFilter?: RFQStatus
  ): () => void {
    let q = query(
      collection(db, COLLECTION_NAME),
      where('supplierIds', 'array-contains', supplierId),
      orderBy('createdAt', 'desc')
    );

    if (statusFilter) {
      q = query(q, where('status', '==', statusFilter));
    }
    
    return onSnapshot(q, (snapshot) => {
      const rfqs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RFQ));
      callback(rfqs);
    }, (error) => {
      console.error('Error subscribing to supplier RFQs:', error);
    });
  }
}