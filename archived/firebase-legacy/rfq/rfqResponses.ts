/**
 * RFQ Response Management
 * Handles supplier responses to RFQs
 * ARCHIVED: Replaced by Neon SQL implementation
 */

import { RFQStatus } from '@/types/procurement.types';

const COLLECTION_NAME = 'rfqs';
const RESPONSES_COLLECTION = 'rfq_responses';

/**
 * RFQ response operations
 */
export class RFQResponses {
  /**
   * Submit response to RFQ
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
      const rfq = await RFQCrud.getById(rfqId);
      const updatedResponses = [...(rfq.respondedSuppliers || []), response.supplierId];
      
      await updateDoc(doc(db, COLLECTION_NAME, rfqId), {
        respondedSuppliers: updatedResponses,
        status: RFQStatus.RESPONSES_RECEIVED,
        updatedAt: Timestamp.now()
      });
      
      return docRef.id;
    } catch (error) {
      log.error('Error submitting RFQ response:', { data: error }, 'rfqResponses');
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
      }));
    } catch (error) {
      log.error('Error fetching RFQ responses:', { data: error }, 'rfqResponses');
      throw error;
    }
  }

  /**
   * Select winning response
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
        closedBy: 'current-user-id' // TODO: Get from auth context
      });
      
      // TODO: Notify selected and non-selected suppliers
    } catch (error) {
      log.error('Error selecting RFQ response:', { data: error }, 'rfqResponses');
      throw error;
    }
  }

  /**
   * Reject a response
   */
  static async rejectResponse(responseId: string, reason: string): Promise<void> {
    try {
      await updateDoc(doc(db, RESPONSES_COLLECTION, responseId), {
        status: 'rejected',
        rejectionReason: reason,
        reviewedBy: 'current-user-id', // TODO: Get from auth context
        reviewedAt: Timestamp.now()
      });
      
      // TODO: Notify supplier about rejection
    } catch (error) {
      log.error('Error rejecting RFQ response:', { data: error }, 'rfqResponses');
      throw error;
    }
  }

  /**
   * Compare responses
   */
  static async compareResponses(rfqId: string): Promise<{
    responses: any[];
    lowestPrice: any;
    fastestDelivery: any;
    bestPaymentTerms: any;
    analysis: {
      priceRange: { min: number; max: number; average: number };
      deliveryRange: { min: number; max: number; average: number };
      responseRate: number;
    };
  }> {
    try {
      const responses = await this.getResponses(rfqId);
      
      if (responses.length === 0) {
        throw new Error('No responses to compare');
      }
      
      const validResponses = responses.filter(r => r.totalAmount && r.totalAmount > 0);
      
      if (validResponses.length === 0) {
        throw new Error('No valid responses with pricing to compare');
      }
      
      const lowestPrice = validResponses.reduce((min, r) => 
        r.totalAmount < min.totalAmount ? r : min
      );
      
      const fastestDelivery = validResponses.reduce((min, r) => 
        r.deliveryLeadTime < min.deliveryLeadTime ? r : min
      );
      
      // Simple comparison - could be more sophisticated
      const bestPaymentTerms = validResponses.reduce((best, r) => {
        const currentDays = parseInt(best.paymentTerms?.match(/\d+/)?.[0] || '0');
        const newDays = parseInt(r.paymentTerms?.match(/\d+/)?.[0] || '0');
        return newDays > currentDays ? r : best;
      });
      
      // Calculate analysis metrics
      const prices = validResponses.map(r => r.totalAmount);
      const deliveryTimes = validResponses.map(r => r.deliveryLeadTime || 0);
      
      const rfq = await RFQCrud.getById(rfqId);
      const invitedCount = rfq.invitedSuppliers?.length || 0;
      
      const analysis = {
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices),
          average: prices.reduce((sum, price) => sum + price, 0) / prices.length
        },
        deliveryRange: {
          min: Math.min(...deliveryTimes),
          max: Math.max(...deliveryTimes),
          average: deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length
        },
        responseRate: invitedCount > 0 ? (responses.length / invitedCount) * 100 : 0
      };
      
      return {
        responses,
        lowestPrice,
        fastestDelivery,
        bestPaymentTerms,
        analysis
      };
    } catch (error) {
      log.error('Error comparing RFQ responses:', { data: error }, 'rfqResponses');
      throw error;
    }
  }

  /**
   * Get response by ID
   */
  static async getResponse(responseId: string): Promise<any> {
    try {
      const docRef = doc(db, RESPONSES_COLLECTION, responseId);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        throw new Error('Response not found');
      }
      
      return {
        id: snapshot.id,
        ...snapshot.data()
      };
    } catch (error) {
      log.error('Error fetching RFQ response:', { data: error }, 'rfqResponses');
      throw error;
    }
  }

  /**
   * Update response status
   */
  static async updateResponseStatus(responseId: string, status: string, notes?: string): Promise<void> {
    try {
      await updateDoc(doc(db, RESPONSES_COLLECTION, responseId), {
        status,
        statusNotes: notes,
        statusUpdatedAt: Timestamp.now(),
        statusUpdatedBy: 'current-user-id' // TODO: Get from auth context
      });
    } catch (error) {
      log.error('Error updating response status:', { data: error }, 'rfqResponses');
      throw error;
    }
  }

  /**
   * Get responses by supplier
   */
  static async getResponsesBySupplier(supplierId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, RESPONSES_COLLECTION),
        where('supplierId', '==', supplierId),
        orderBy('submittedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      log.error('Error fetching supplier responses:', { data: error }, 'rfqResponses');
      throw error;
    }
  }

  /**
   * Subscribe to responses for real-time updates
   */
  static subscribeToResponses(rfqId: string, callback: (responses: any[]) => void) {
    const q = query(
      collection(db, RESPONSES_COLLECTION),
      where('rfqId', '==', rfqId),
      orderBy('submittedAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const responses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(responses);
    });
  }
}

import { log } from '@/lib/logger';
