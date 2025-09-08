/**
 * RFQ Lifecycle Management Service
 * Handles RFQ workflow, responses, and status transitions
 */

import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/src/config/firebase';
import { RFQStatus } from '@/types/procurement.types';
import { RFQOperations } from './operations';
import { log } from '@/lib/logger';

/**
 * Utility to convert Timestamp or Date to Date object
 */
function toDate(timestampOrDate: Date | Timestamp | any): Date {
  if (!timestampOrDate) {
    return new Date();
  }
  
  // If it's already a Date, return it
  if (timestampOrDate instanceof Date) {
    return timestampOrDate;
  }
  
  // If it's a Firestore Timestamp, convert it
  if (timestampOrDate && typeof timestampOrDate.toDate === 'function') {
    return timestampOrDate.toDate();
  }
  
  // If it's a timestamp number, convert it
  if (typeof timestampOrDate === 'number') {
    return new Date(timestampOrDate);
  }
  
  // Fallback: try to parse as date
  return new Date(timestampOrDate);
}

const RESPONSES_COLLECTION = 'rfq_responses';
const COLLECTION_NAME = 'rfqs';

/**
 * RFQ Lifecycle Management
 */
export class RFQLifecycle {
  /**
   * Send RFQ to suppliers (transition from DRAFT to ISSUED)
   */
  static async sendToSuppliers(id: string): Promise<void> {
    try {
      const rfq = await RFQOperations.getById(id);
      
      // Update supplier invite statuses
      const updatedInvites = (rfq.invitedSuppliers || []).map((supplierId: string) => ({
        supplierId,
        inviteSent: true,
        inviteSentAt: Timestamp.now()
      }));
      
      // TODO: Send email notifications to suppliers
      // This would typically integrate with an email service
      
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        status: RFQStatus.ISSUED,
        invitedSuppliers: updatedInvites,
        sentAt: Timestamp.now(),
        sentBy: 'current-user-id' // TODO: Get from auth context
      });
    } catch (error) {
      log.error('Error sending RFQ to suppliers:', { data: error }, 'lifecycle');
      throw error;
    }
  }

  /**
   * Submit a supplier response to an RFQ
   */
  static async submitResponse(rfqId: string, response: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, RESPONSES_COLLECTION), {
        ...response,
        rfqId,
        status: 'submitted',
        submittedAt: Timestamp.now()
      });
      
      // Update RFQ with response reference
      const rfq = await RFQOperations.getById(rfqId);
      const updatedResponses = [...(rfq.respondedSuppliers || []), response.supplierId];
      
      await updateDoc(doc(db, COLLECTION_NAME, rfqId), {
        respondedSuppliers: updatedResponses,
        status: RFQStatus.RESPONSES_RECEIVED,
        updatedAt: Timestamp.now()
      });
      
      return docRef.id;
    } catch (error) {
      log.error('Error submitting RFQ response:', { data: error }, 'lifecycle');
      throw error;
    }
  }

  /**
   * Get all responses for an RFQ
   */
  static async getResponses(rfqId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, RESPONSES_COLLECTION),
        where('rfqId', '==', rfqId),
        orderBy('submittedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as any));
    } catch (error) {
      log.error('Error fetching RFQ responses:', { data: error }, 'lifecycle');
      throw error;
    }
  }

  /**
   * Select winning response and award RFQ
   */
  static async selectResponse(rfqId: string, responseId: string, reason?: string): Promise<void> {
    try {
      // Update response as selected
      await updateDoc(doc(db, RESPONSES_COLLECTION, responseId), {
        isSelected: true,
        status: 'accepted',
        reviewedBy: 'current-user-id', // TODO: Get from auth context
        reviewedAt: Timestamp.now()
      });
      
      // Update RFQ with selection
      await updateDoc(doc(db, COLLECTION_NAME, rfqId), {
        selectedResponseId: responseId,
        selectionReason: reason,
        status: RFQStatus.AWARDED,
        closedAt: Timestamp.now(),
        closedBy: 'current-user-id', // TODO: Get from auth context
        updatedAt: Timestamp.now()
      });
      
      // TODO: Notify selected and non-selected suppliers
    } catch (error) {
      log.error('Error selecting RFQ response:', { data: error }, 'lifecycle');
      throw error;
    }
  }

  /**
   * Compare responses for an RFQ
   */
  static async compareResponses(rfqId: string): Promise<{
    responses: any[];
    lowestPrice: any;
    fastestDelivery: any;
    bestPaymentTerms: any;
  }> {
    try {
      const responses = await RFQLifecycle.getResponses(rfqId);
      
      if (responses.length === 0) {
        throw new Error('No responses to compare');
      }
      
      const lowestPrice = responses.reduce((min, r) => 
        r.totalAmount < min.totalAmount ? r : min
      );
      
      const fastestDelivery = responses.reduce((min, r) => 
        r.deliveryLeadTime < min.deliveryLeadTime ? r : min
      );
      
      // Simple comparison - could be more sophisticated
      const bestPaymentTerms = responses.reduce((best, r) => {
        const currentDays = parseInt(best.paymentTerms.match(/\d+/)?.[0] || '0');
        const newDays = parseInt(r.paymentTerms.match(/\d+/)?.[0] || '0');
        return newDays > currentDays ? r : best;
      });
      
      return {
        responses,
        lowestPrice,
        fastestDelivery,
        bestPaymentTerms
      };
    } catch (error) {
      log.error('Error comparing RFQ responses:', { data: error }, 'lifecycle');
      throw error;
    }
  }

  /**
   * Close RFQ without awarding (transition to CLOSED)
   */
  static async closeRFQ(rfqId: string, reason: string): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, rfqId), {
        status: RFQStatus.CLOSED,
        closedAt: Timestamp.now(),
        closedBy: 'current-user-id', // TODO: Get from auth context
        closureReason: reason,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      log.error('Error closing RFQ:', { data: error }, 'lifecycle');
      throw error;
    }
  }

  /**
   * Cancel RFQ (transition to CANCELLED)
   */
  static async cancelRFQ(rfqId: string, reason: string): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, rfqId), {
        status: RFQStatus.CANCELLED,
        cancelledAt: Timestamp.now(),
        cancelledBy: 'current-user-id', // TODO: Get from auth context
        cancellationReason: reason,
        updatedAt: Timestamp.now()
      });
      
      // TODO: Notify suppliers of cancellation
    } catch (error) {
      log.error('Error cancelling RFQ:', { data: error }, 'lifecycle');
      throw error;
    }
  }

  /**
   * Extend RFQ deadline
   */
  static async extendDeadline(rfqId: string, newDeadline: Date, reason?: string): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, rfqId), {
        responseDeadline: Timestamp.fromDate(newDeadline),
        deadlineExtensions: {
          extendedAt: Timestamp.now(),
          extendedBy: 'current-user-id', // TODO: Get from auth context
          reason: reason || 'Deadline extended',
          previousDeadline: await RFQLifecycle.getCurrentDeadline(rfqId)
        },
        updatedAt: Timestamp.now()
      });
      
      // TODO: Notify suppliers of deadline extension
    } catch (error) {
      log.error('Error extending RFQ deadline:', { data: error }, 'lifecycle');
      throw error;
    }
  }

  /**
   * Get current deadline for an RFQ
   */
  private static async getCurrentDeadline(rfqId: string): Promise<Date> {
    const rfq = await RFQOperations.getById(rfqId);
    return toDate(rfq.responseDeadline);
  }

  /**
   * Check if RFQ is past deadline
   */
  static async isRFQPastDeadline(rfqId: string): Promise<boolean> {
    try {
      const rfq = await RFQOperations.getById(rfqId);
      const deadline = toDate(rfq.responseDeadline);
      return new Date() > deadline;
    } catch (error) {
      log.error('Error checking RFQ deadline:', { data: error }, 'lifecycle');
      return false;
    }
  }

  /**
   * Get RFQ status transition history
   */
  static async getStatusHistory(_rfqId: string): Promise<Array<{
    status: RFQStatus;
    timestamp: Date;
    userId: string;
    reason?: string;
  }>> {
    // This would typically require a separate status history collection
    // For now, return empty array - implement based on your requirements
    return [];
  }

  /**
   * Validate RFQ can transition to new status
   */
  static validateStatusTransition(currentStatus: RFQStatus, newStatus: RFQStatus): boolean {
    const validTransitions: Record<RFQStatus, RFQStatus[]> = {
      [RFQStatus.DRAFT]: [RFQStatus.READY_TO_SEND, RFQStatus.CANCELLED],
      [RFQStatus.READY_TO_SEND]: [RFQStatus.ISSUED, RFQStatus.CANCELLED],
      [RFQStatus.ISSUED]: [RFQStatus.RESPONSES_RECEIVED, RFQStatus.CLOSED, RFQStatus.CANCELLED],
      [RFQStatus.RESPONSES_RECEIVED]: [RFQStatus.EVALUATED, RFQStatus.AWARDED, RFQStatus.CLOSED, RFQStatus.CANCELLED],
      [RFQStatus.EVALUATED]: [RFQStatus.AWARDED, RFQStatus.CLOSED, RFQStatus.CANCELLED],
      [RFQStatus.AWARDED]: [RFQStatus.CLOSED],
      [RFQStatus.CLOSED]: [],
      [RFQStatus.CANCELLED]: []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}