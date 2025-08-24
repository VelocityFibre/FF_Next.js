/**
 * RFQ CRUD Operations
 * Basic create, read, update, delete operations for RFQs
 */

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
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { 
  RFQ, 
  RFQFormData, 
  RFQStatus
} from '@/types/procurement.types';

const COLLECTION_NAME = 'rfqs';

/**
 * RFQ CRUD operations
 */
export class RFQCrud {
  /**
   * Get all RFQs with optional filtering
   */
  static async getAll(filter?: { 
    projectId?: string; 
    status?: RFQStatus; 
    supplierId?: string 
  }): Promise<RFQ[]> {
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
  }

  /**
   * Get RFQ by ID
   */
  static async getById(id: string): Promise<RFQ> {
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
  }

  /**
   * Create new RFQ
   */
  static async create(data: RFQFormData): Promise<string> {
    try {
      // Generate unique RFQ number
      const rfqNumber = `RFQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const rfq = {
        projectId: data.projectId,
        rfqNumber,
        title: data.title,
        description: data.description,
        status: RFQStatus.DRAFT,
        issueDate: Timestamp.now(),
        responseDeadline: data.responseDeadline ? 
          Timestamp.fromDate(new Date(data.responseDeadline)) : 
          Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        invitedSuppliers: data.supplierIds || [],
        itemCount: 0, // Will be populated when items are added
        paymentTerms: data.paymentTerms,
        deliveryTerms: data.deliveryTerms,
        validityPeriod: 30,
        currency: data.currency || 'ZAR',
        technicalRequirements: data.technicalRequirements,
        createdBy: 'current-user-id', // TODO: Get from auth context
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), rfq);
      return docRef.id;
    } catch (error) {
      console.error('Error creating RFQ:', error);
      throw error;
    }
  }

  /**
   * Update existing RFQ
   */
  static async update(id: string, data: Partial<RFQFormData>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      const updateData: any = { ...data };
      
      if (data.responseDeadline) {
        updateData.responseDeadline = data.responseDeadline instanceof Date 
          ? Timestamp.fromDate(data.responseDeadline) 
          : Timestamp.fromDate(new Date(data.responseDeadline));
      }
      
      updateData.updatedAt = Timestamp.now();
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating RFQ:', error);
      throw error;
    }
  }

  /**
   * Delete RFQ
   */
  static async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting RFQ:', error);
      throw error;
    }
  }

  /**
   * Update RFQ status
   */
  static async updateStatus(id: string, status: RFQStatus): Promise<void> {
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
  }

  /**
   * Get RFQs by project
   */
  static async getByProject(projectId: string): Promise<RFQ[]> {
    return this.getAll({ projectId });
  }

  /**
   * Get RFQs by status
   */
  static async getByStatus(status: RFQStatus): Promise<RFQ[]> {
    return this.getAll({ status });
  }

  /**
   * Get active RFQs (non-closed statuses)
   */
  static async getActive(): Promise<RFQ[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', 'in', [RFQStatus.DRAFT, RFQStatus.ISSUED, RFQStatus.RESPONSES_RECEIVED]),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RFQ));
    } catch (error) {
      console.error('Error fetching active RFQs:', error);
      throw error;
    }
  }

  /**
   * Check if RFQ exists
   */
  static async exists(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snapshot = await getDoc(docRef);
      return snapshot.exists();
    } catch (error) {
      console.error('Error checking RFQ existence:', error);
      return false;
    }
  }
}
