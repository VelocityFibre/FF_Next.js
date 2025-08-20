// BOQ (Bill of Quantities) Service
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
import { BOQ, BOQFormData, BOQStatus } from '@/types/procurement.types';

const COLLECTION_NAME = 'boqs';

export const boqService = {
  // CRUD Operations
  async getAll(filter?: { projectId?: string; clientId?: string; status?: BOQStatus }) {
    try {
      let q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      
      if (filter?.projectId) {
        q = query(q, where('projectId', '==', filter.projectId));
      }
      if (filter?.clientId) {
        q = query(q, where('clientId', '==', filter.clientId));
      }
      if (filter?.status) {
        q = query(q, where('status', '==', filter.status));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BOQ));
    } catch (error) {
      console.error('Error fetching BOQs:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<BOQ> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        throw new Error('BOQ not found');
      }
      
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as BOQ;
    } catch (error) {
      console.error('Error fetching BOQ:', error);
      throw error;
    }
  },

  async create(data: BOQFormData): Promise<string> {
    try {
      // Generate unique BOQ number
      const boqNumber = `BOQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Calculate totals
      const subtotal = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const taxAmount = subtotal * (data.taxRate / 100);
      const discountAmount = data.discountPercentage ? subtotal * (data.discountPercentage / 100) : 0;
      const totalAmount = subtotal + taxAmount - discountAmount;
      
      const boq: Omit<BOQ, 'id'> = {
        ...data,
        boqNumber,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        currency: 'ZAR',
        status: BOQStatus.DRAFT,
        version: 1,
        isTemplate: false,
        validFrom: Timestamp.fromDate(new Date(data.validFrom)),
        validUntil: Timestamp.fromDate(new Date(data.validUntil)),
        preparedBy: 'current-user-id', // TODO: Get from auth context
        preparedByName: 'Current User', // TODO: Get from auth context
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'current-user-id', // TODO: Get from auth context
        lastModifiedBy: 'current-user-id' // TODO: Get from auth context
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), boq);
      return docRef.id;
    } catch (error) {
      console.error('Error creating BOQ:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<BOQFormData>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      // Recalculate totals if items changed
      let updateData: any = { ...data };
      
      if (data.items) {
        const subtotal = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
        const taxAmount = subtotal * ((data.taxRate || 15) / 100);
        const discountAmount = data.discountPercentage ? subtotal * (data.discountPercentage / 100) : 0;
        const totalAmount = subtotal + taxAmount - discountAmount;
        
        updateData = {
          ...updateData,
          subtotal,
          taxAmount,
          discountAmount,
          totalAmount
        };
      }
      
      if (data.validFrom) {
        updateData.validFrom = Timestamp.fromDate(new Date(data.validFrom));
      }
      if (data.validUntil) {
        updateData.validUntil = Timestamp.fromDate(new Date(data.validUntil));
      }
      
      updateData.updatedAt = Timestamp.now();
      updateData.lastModifiedBy = 'current-user-id'; // TODO: Get from auth context
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating BOQ:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting BOQ:', error);
      throw error;
    }
  },

  // Status Management
  async updateStatus(id: string, status: BOQStatus, approvedBy?: string): Promise<void> {
    try {
      const updateData: any = {
        status,
        updatedAt: Timestamp.now(),
        lastModifiedBy: 'current-user-id' // TODO: Get from auth context
      };
      
      if (status === BOQStatus.APPROVED && approvedBy) {
        updateData.approvedBy = approvedBy;
        updateData.approvedByName = 'Approver Name'; // TODO: Get from user service
        updateData.approvalDate = Timestamp.now();
      }
      
      await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
    } catch (error) {
      console.error('Error updating BOQ status:', error);
      throw error;
    }
  },

  // Template Operations
  async createTemplate(boqId: string, templateName: string): Promise<string> {
    try {
      const boq = await this.getById(boqId);
      
      const template: Omit<BOQ, 'id'> = {
        ...boq,
        boqNumber: `TPL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        title: templateName,
        isTemplate: true,
        templateName,
        projectId: undefined,
        clientId: undefined,
        status: BOQStatus.DRAFT,
        version: 1,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'current-user-id', // TODO: Get from auth context
        lastModifiedBy: 'current-user-id' // TODO: Get from auth context
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), template);
      return docRef.id;
    } catch (error) {
      console.error('Error creating BOQ template:', error);
      throw error;
    }
  },

  async getTemplates(): Promise<BOQ[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isTemplate', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BOQ));
    } catch (error) {
      console.error('Error fetching BOQ templates:', error);
      throw error;
    }
  },

  // Clone BOQ
  async clone(boqId: string, newTitle: string): Promise<string> {
    try {
      const boq = await this.getById(boqId);
      
      const cloned: Omit<BOQ, 'id'> = {
        ...boq,
        boqNumber: `BOQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        title: newTitle,
        status: BOQStatus.DRAFT,
        version: 1,
        isTemplate: false,
        templateName: undefined,
        approvedBy: undefined,
        approvedByName: undefined,
        approvalDate: undefined,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'current-user-id', // TODO: Get from auth context
        lastModifiedBy: 'current-user-id' // TODO: Get from auth context
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), cloned);
      return docRef.id;
    } catch (error) {
      console.error('Error cloning BOQ:', error);
      throw error;
    }
  },

  // Real-time subscription
  subscribeToBOQ(boqId: string, callback: (boq: BOQ) => void) {
    const docRef = doc(db, COLLECTION_NAME, boqId);
    
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({
          id: snapshot.id,
          ...snapshot.data()
        } as BOQ);
      }
    });
  },

  // Export to Excel
  async exportToExcel(boq: BOQ): Promise<Blob> {
    // This would typically use a library like xlsx or exceljs
    // For now, return a CSV blob as placeholder
    const headers = ['Item Code', 'Description', 'Unit', 'Quantity', 'Unit Price', 'Total Price'];
    const rows = boq.items.map(item => [
      item.itemCode,
      item.description,
      item.unit,
      item.quantity.toString(),
      item.unitPrice.toString(),
      item.totalPrice.toString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return new Blob([csvContent], { type: 'text/csv' });
  }
};