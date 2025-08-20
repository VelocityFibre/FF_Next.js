// RFQ (Request for Quote) Service
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { 
  RFQ, 
  RFQFormData, 
  RFQStatus, 
  RFQResponse,
  RFQSupplierInvite 
} from '@/types/procurement.types';

const COLLECTION_NAME = 'rfqs';
const RESPONSES_COLLECTION = 'rfq_responses';

export const rfqService = {
  // CRUD Operations
  async getAll(filter?: { projectId?: string; status?: RFQStatus; supplierId?: string }) {
    try {
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
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RFQ));
    } catch (error) {
      console.error('Error fetching RFQs:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<RFQ> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        throw new Error('RFQ not found');
      }
      
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as RFQ;
    } catch (error) {
      console.error('Error fetching RFQ:', error);
      throw error;
    }
  },

  async create(data: RFQFormData): Promise<string> {
    try {
      // Generate unique RFQ number
      const rfqNumber = `RFQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Create supplier invites
      const invitedSuppliers: RFQSupplierInvite[] = data.supplierIds.map(supplierId => ({
        supplierId,
        supplierName: 'Supplier Name', // TODO: Get from supplier service
        invitedAt: Timestamp.now(),
        invitedBy: 'current-user-id', // TODO: Get from auth context
        status: 'pending'
      }));
      
      const rfq: Omit<RFQ, 'id'> = {
        ...data,
        rfqNumber,
        invitedSuppliers,
        issueDate: Timestamp.now(),
        deadline: Timestamp.fromDate(new Date(data.deadline)),
        deliveryDate: data.deliveryDate ? Timestamp.fromDate(new Date(data.deliveryDate)) : undefined,
        status: RFQStatus.DRAFT,
        responses: [],
        attachments: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'current-user-id', // TODO: Get from auth context
        lastModifiedBy: 'current-user-id' // TODO: Get from auth context
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), rfq);
      return docRef.id;
    } catch (error) {
      console.error('Error creating RFQ:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<RFQFormData>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      let updateData: any = { ...data };
      
      if (data.deadline) {
        updateData.deadline = Timestamp.fromDate(new Date(data.deadline));
      }
      if (data.deliveryDate) {
        updateData.deliveryDate = Timestamp.fromDate(new Date(data.deliveryDate));
      }
      
      updateData.updatedAt = Timestamp.now();
      updateData.lastModifiedBy = 'current-user-id'; // TODO: Get from auth context
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating RFQ:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting RFQ:', error);
      throw error;
    }
  },

  // Status Management
  async updateStatus(id: string, status: RFQStatus): Promise<void> {
    try {
      const updateData = {
        status,
        updatedAt: Timestamp.now(),
        lastModifiedBy: 'current-user-id' // TODO: Get from auth context
      };
      
      await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
    } catch (error) {
      console.error('Error updating RFQ status:', error);
      throw error;
    }
  },

  // Send RFQ to suppliers
  async sendToSuppliers(id: string): Promise<void> {
    try {
      const rfq = await this.getById(id);
      
      // Update supplier invite statuses
      const updatedInvites = rfq.invitedSuppliers.map(invite => ({
        ...invite,
        status: 'pending' as const
      }));
      
      // TODO: Send email notifications to suppliers
      // This would typically integrate with an email service
      
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        status: RFQStatus.SENT,
        invitedSuppliers: updatedInvites,
        issueDate: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastModifiedBy: 'current-user-id' // TODO: Get from auth context
      });
    } catch (error) {
      console.error('Error sending RFQ to suppliers:', error);
      throw error;
    }
  },

  // RFQ Response Management
  async submitResponse(rfqId: string, response: Omit<RFQResponse, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, RESPONSES_COLLECTION), {
        ...response,
        rfqId,
        status: 'submitted',
        submittedAt: Timestamp.now()
      });
      
      // Update RFQ with response reference
      const rfq = await this.getById(rfqId);
      const updatedResponses = [...rfq.responses, { id: docRef.id, ...response }];
      
      // Update supplier invite status
      const updatedInvites = rfq.invitedSuppliers.map(invite => {
        if (invite.supplierId === response.supplierId) {
          return {
            ...invite,
            status: 'responded' as const,
            respondedAt: Timestamp.now()
          };
        }
        return invite;
      });
      
      await updateDoc(doc(db, COLLECTION_NAME, rfqId), {
        responses: updatedResponses,
        invitedSuppliers: updatedInvites,
        status: RFQStatus.RESPONSES_RECEIVED,
        updatedAt: Timestamp.now()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error submitting RFQ response:', error);
      throw error;
    }
  },

  async getResponses(rfqId: string): Promise<RFQResponse[]> {
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
      } as RFQResponse));
    } catch (error) {
      console.error('Error fetching RFQ responses:', error);
      throw error;
    }
  },

  // Select winning response
  async selectResponse(rfqId: string, responseId: string, reason?: string): Promise<void> {
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
        updatedAt: Timestamp.now(),
        lastModifiedBy: 'current-user-id' // TODO: Get from auth context
      });
      
      // TODO: Notify selected and non-selected suppliers
    } catch (error) {
      console.error('Error selecting RFQ response:', error);
      throw error;
    }
  },

  // Compare responses
  async compareResponses(rfqId: string): Promise<{
    responses: RFQResponse[];
    lowestPrice: RFQResponse;
    fastestDelivery: RFQResponse;
    bestPaymentTerms: RFQResponse;
  }> {
    try {
      const responses = await this.getResponses(rfqId);
      
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
      console.error('Error comparing RFQ responses:', error);
      throw error;
    }
  },

  // Real-time subscription
  subscribeToRFQ(rfqId: string, callback: (rfq: RFQ) => void) {
    const docRef = doc(db, COLLECTION_NAME, rfqId);
    
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({
          id: snapshot.id,
          ...snapshot.data()
        } as RFQ);
      }
    });
  },

  subscribeToResponses(rfqId: string, callback: (responses: RFQResponse[]) => void) {
    const q = query(
      collection(db, RESPONSES_COLLECTION),
      where('rfqId', '==', rfqId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const responses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RFQResponse));
      callback(responses);
    });
  }
};