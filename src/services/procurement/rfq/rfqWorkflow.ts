/**
 * RFQ Workflow Management
 * Handles RFQ lifecycle operations like sending to suppliers, managing responses
 */

import { 
  doc, 
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { RFQStatus } from '@/types/procurement.types';
import { RFQCrud } from './rfqCrud';

const COLLECTION_NAME = 'rfqs';

/**
 * RFQ workflow operations
 */
export class RFQWorkflow {
  /**
   * Send RFQ to suppliers
   */
  static async sendToSuppliers(id: string): Promise<void> {
    try {
      const rfq = await RFQCrud.getById(id);
      
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
      console.error('Error sending RFQ to suppliers:', error);
      throw error;
    }
  }

  /**
   * Close RFQ without awarding
   */
  static async close(id: string, reason: string): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        status: RFQStatus.CLOSED,
        closedAt: Timestamp.now(),
        closedBy: 'current-user-id', // TODO: Get from auth context
        closureReason: reason
      });
    } catch (error) {
      console.error('Error closing RFQ:', error);
      throw error;
    }
  }

  /**
   * Cancel RFQ
   */
  static async cancel(id: string, reason: string): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        status: RFQStatus.CANCELLED,
        cancelledAt: Timestamp.now(),
        cancelledBy: 'current-user-id', // TODO: Get from auth context
        cancellationReason: reason
      });
      
      // TODO: Notify suppliers about cancellation
    } catch (error) {
      console.error('Error cancelling RFQ:', error);
      throw error;
    }
  }

  /**
   * Extend RFQ deadline
   */
  static async extendDeadline(id: string, newDeadline: Date, reason?: string): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        responseDeadline: Timestamp.fromDate(newDeadline),
        deadlineExtended: true,
        extensionReason: reason,
        extendedAt: Timestamp.now(),
        extendedBy: 'current-user-id' // TODO: Get from auth context
      });
      
      // TODO: Notify suppliers about deadline extension
    } catch (error) {
      console.error('Error extending RFQ deadline:', error);
      throw error;
    }
  }

  /**
   * Add suppliers to existing RFQ
   */
  static async addSuppliers(id: string, supplierIds: string[]): Promise<void> {
    try {
      const rfq = await RFQCrud.getById(id);
      const existingSuppliers = rfq.invitedSuppliers || [];
      const newSuppliers = supplierIds.filter(id => 
        !existingSuppliers.some((s: any) => 
          typeof s === 'string' ? s === id : s.supplierId === id
        )
      );
      
      if (newSuppliers.length === 0) {
        return; // No new suppliers to add
      }
      
      const updatedSuppliers = [
        ...existingSuppliers,
        ...newSuppliers.map(supplierId => ({
          supplierId,
          inviteSent: rfq.status === RFQStatus.ISSUED,
          inviteSentAt: rfq.status === RFQStatus.ISSUED ? Timestamp.now() : null
        }))
      ];
      
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        invitedSuppliers: updatedSuppliers,
        updatedAt: Timestamp.now()
      });
      
      // TODO: If RFQ is already issued, send invites to new suppliers
    } catch (error) {
      console.error('Error adding suppliers to RFQ:', error);
      throw error;
    }
  }

  /**
   * Remove suppliers from RFQ
   */
  static async removeSuppliers(id: string, supplierIds: string[]): Promise<void> {
    try {
      const rfq = await RFQCrud.getById(id);
      const updatedSuppliers = (rfq.invitedSuppliers || []).filter((supplier: any) => {
        const supplierId = typeof supplier === 'string' ? supplier : supplier.supplierId;
        return !supplierIds.includes(supplierId);
      });
      
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        invitedSuppliers: updatedSuppliers,
        updatedAt: Timestamp.now()
      });
      
      // TODO: Notify removed suppliers if RFQ was already sent
    } catch (error) {
      console.error('Error removing suppliers from RFQ:', error);
      throw error;
    }
  }

  /**
   * Mark RFQ as ready to send
   */
  static async markAsReady(id: string): Promise<void> {
    try {
      const rfq = await RFQCrud.getById(id);
      
      // Validate RFQ is complete
      if (!rfq.title || !rfq.description || !rfq.invitedSuppliers?.length) {
        throw new Error('RFQ is not complete. Please add title, description, and suppliers.');
      }
      
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        status: RFQStatus.READY_TO_SEND,
        readyAt: Timestamp.now(),
        readyBy: 'current-user-id', // TODO: Get from auth context
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error marking RFQ as ready:', error);
      throw error;
    }
  }

  /**
   * Reopen closed/cancelled RFQ
   */
  static async reopen(id: string, reason: string): Promise<void> {
    try {
      const rfq = await RFQCrud.getById(id);
      
      if (rfq.status !== RFQStatus.CLOSED && rfq.status !== RFQStatus.CANCELLED) {
        throw new Error('Can only reopen closed or cancelled RFQs');
      }
      
      // Determine appropriate status based on previous state
      let newStatus = RFQStatus.DRAFT;
      if (rfq.sentAt) {
        newStatus = RFQStatus.ISSUED;
      }
      if (rfq.respondedSuppliers && rfq.respondedSuppliers.length > 0) {
        newStatus = RFQStatus.RESPONSES_RECEIVED;
      }
      
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        status: newStatus,
        reopenedAt: Timestamp.now(),
        reopenedBy: 'current-user-id', // TODO: Get from auth context
        reopenReason: reason,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error reopening RFQ:', error);
      throw error;
    }
  }
}
