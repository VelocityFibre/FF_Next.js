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
      const subtotal = data.items.reduce((sum, item) => sum + (item.amount || 0), 0);
      const taxAmount = subtotal * ((data.taxRate || 0) / 100);
      const discountAmount = data.discountRate ? subtotal * (data.discountRate / 100) : 0;
      const totalAmount = subtotal + taxAmount - discountAmount;
      
      const boq = {
        ...data,
        number: boqNumber,
        subtotal,
        vat: taxAmount,
        vatRate: data.taxRate || 15,
        total: totalAmount,
        totalItems: data.items.length,
        currency: 'ZAR',
        status: BOQStatus.DRAFT,
        version: 1,
        isTemplate: false,
        validFrom: Timestamp.fromDate(new Date()),
        validTo: data.validUntil ? (data.validUntil instanceof Date ? Timestamp.fromDate(data.validUntil) : data.validUntil as Timestamp) : Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        createdAt: Timestamp.now(),
        createdBy: 'current-user-id', // TODO: Get from auth context
        createdByName: 'Current User', // TODO: Get from auth context
        isLatestVersion: true,
        sections: data.sections || [],
        tags: []
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), boq as Omit<BOQ, 'id'>);
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
        const subtotal = data.items.reduce((sum, item) => sum + (item.amount || 0), 0);
        const taxAmount = subtotal * ((data.taxRate || 15) / 100);
        const discountAmount = data.discountRate ? subtotal * (data.discountRate / 100) : 0;
        const totalAmount = subtotal + taxAmount - discountAmount;
        
        updateData = {
          ...updateData,
          subtotal,
          vat: taxAmount,
          vatRate: data.taxRate || 15,
          total: totalAmount,
          totalItems: data.items.length
        };
      }
      
      if (data.validUntil) {
        updateData.validTo = data.validUntil instanceof Date 
          ? Timestamp.fromDate(data.validUntil)
          : data.validUntil;
      }
      
      // No updatedAt or lastModifiedBy fields in BOQ type
      
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
        number: `TPL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        title: templateName,
        isTemplate: true,
        projectId: '',
        status: BOQStatus.DRAFT,
        version: 1,
        createdAt: Timestamp.now(),
        createdBy: 'current-user-id', // TODO: Get from auth context
        createdByName: 'Current User' // TODO: Get from auth context
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
      
      const cloned = {
        ...boq,
        number: `BOQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        title: newTitle,
        status: BOQStatus.DRAFT,
        version: 1,
        isTemplate: false,
        approvedBy: undefined,
        approvedByName: undefined,
        approvedAt: undefined,
        createdAt: Timestamp.now(),
        createdBy: 'current-user-id', // TODO: Get from auth context
        createdByName: 'Current User' // TODO: Get from auth context
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), cloned as unknown as Omit<BOQ, 'id'>);
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
      (item.unitRate || 0).toString(),
      (item.amount || 0).toString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return new Blob([csvContent], { type: 'text/csv' });
  }
};