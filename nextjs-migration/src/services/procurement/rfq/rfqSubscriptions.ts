/**
 * RFQ Real-time Subscriptions
 * Handles real-time updates for RFQs and responses
 */

import { 
  doc,
  collection,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { RFQ } from '@/types/procurement.types';

const COLLECTION_NAME = 'rfqs';
const RESPONSES_COLLECTION = 'rfq_responses';

/**
 * RFQ subscription operations for real-time updates
 */
export class RFQSubscriptions {
  /**
   * Subscribe to single RFQ updates
   */
  static subscribeToRFQ(rfqId: string, callback: (rfq: RFQ) => void) {
    const docRef = doc(db, COLLECTION_NAME, rfqId);
    
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({
          id: snapshot.id,
          ...snapshot.data()
        } as RFQ);
      }
    });
  }

  /**
   * Subscribe to RFQ responses updates
   */
  static subscribeToResponses(rfqId: string, callback: (responses: any[]) => void) {
    const q = query(
      collection(db, RESPONSES_COLLECTION),
      where('rfqId', '==', rfqId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const responses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(responses);
    });
  }

  /**
   * Subscribe to all RFQs for a project
   */
  static subscribeToProjectRFQs(projectId: string, callback: (rfqs: RFQ[]) => void) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('projectId', '==', projectId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const rfqs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RFQ));
      callback(rfqs);
    });
  }

  /**
   * Subscribe to RFQs by status
   */
  static subscribeToRFQsByStatus(status: string, callback: (rfqs: RFQ[]) => void) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', status)
    );
    
    return onSnapshot(q, (snapshot) => {
      const rfqs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RFQ));
      callback(rfqs);
    });
  }

  /**
   * Subscribe to supplier's RFQ invitations
   */
  static subscribeToSupplierRFQs(supplierId: string, callback: (rfqs: RFQ[]) => void) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('invitedSuppliers', 'array-contains', supplierId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const rfqs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RFQ));
      callback(rfqs);
    });
  }

  /**
   * Subscribe to supplier's responses
   */
  static subscribeToSupplierResponses(supplierId: string, callback: (responses: any[]) => void) {
    const q = query(
      collection(db, RESPONSES_COLLECTION),
      where('supplierId', '==', supplierId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const responses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(responses);
    });
  }

  /**
   * Subscribe to RFQ activity feed
   */
  static subscribeToRFQActivity(rfqId: string, callback: (activities: any[]) => void) {
    // This would subscribe to an activities/audit log collection
    // For now, we'll combine RFQ changes and response submissions
    
    const rfqUnsubscribe = this.subscribeToRFQ(rfqId, (rfq) => {
      // Extract activity from RFQ changes
      const rfqActivity = {
        type: 'rfq_update',
        timestamp: rfq.updatedAt,
        data: rfq
      };
      callback([rfqActivity]);
    });
    
    const responsesUnsubscribe = this.subscribeToResponses(rfqId, (responses) => {
      // Extract activity from responses
      const responseActivities = responses.map(response => ({
        type: 'response_submitted',
        timestamp: response.submittedAt,
        data: response
      }));
      callback(responseActivities);
    });
    
    // Return combined unsubscribe function
    return () => {
      rfqUnsubscribe();
      responsesUnsubscribe();
    };
  }

  /**
   * Subscribe to RFQ deadline reminders
   */
  static subscribeToDeadlineReminders(callback: (reminders: any[]) => void) {
    // Subscribe to RFQs that are approaching deadline
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', 'in', ['issued', 'responses_received'])
    );
    
    return onSnapshot(q, (snapshot) => {
      const now = new Date();
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      const reminders = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((rfq: any) => {
          const deadline = rfq.responseDeadline?.toDate();
          return deadline && deadline <= oneDayFromNow && deadline > now;
        })
        .map((rfq: any) => ({
          type: 'deadline_reminder',
          rfqId: rfq.id,
          title: rfq.title,
          deadline: rfq.responseDeadline,
          hoursRemaining: Math.floor(
            (rfq.responseDeadline.toDate().getTime() - now.getTime()) / (1000 * 60 * 60)
          )
        }));
      
      callback(reminders);
    });
  }
}
