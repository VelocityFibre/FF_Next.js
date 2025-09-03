/**
 * RFQ Operations Service
 * Core CRUD operations for RFQ management
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
import { RFQ, RFQFormData, RFQStatus } from '@/types/procurement.types';
import { log } from '@/lib/logger';

const COLLECTION_NAME = 'rfqs';

/**
 * RFQ CRUD Operations
 */
export class RFQOperations {
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
      log.error('Error fetching RFQs:', { data: error }, 'operations');
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
      log.error('Error fetching RFQ:', { data: error }, 'operations');
      throw error;
    }
  }

  /**
   * Create a new RFQ
   */
  static async create(data: RFQFormData): Promise<string> {
    try {
      // Generate unique RFQ number
      const rfqNumber = RFQOperations.generateRFQNumber();
      
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
      log.error('Error creating RFQ:', { data: error }, 'operations');
      throw error;
    }
  }

  /**
   * Update an existing RFQ
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
      log.error('Error updating RFQ:', { data: error }, 'operations');
      throw error;
    }
  }

  /**
   * Delete an RFQ
   */
  static async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      log.error('Error deleting RFQ:', { data: error }, 'operations');
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
      log.error('Error updating RFQ status:', { data: error }, 'operations');
      throw error;
    }
  }

  /**
   * Get RFQs by project ID
   */
  static async getByProjectId(projectId: string): Promise<RFQ[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RFQ));
    } catch (error) {
      log.error('Error fetching RFQs by project:', { data: error }, 'operations');
      throw error;
    }
  }

  /**
   * Get RFQs by status
   */
  static async getByStatus(status: RFQStatus): Promise<RFQ[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RFQ));
    } catch (error) {
      log.error('Error fetching RFQs by status:', { data: error }, 'operations');
      throw error;
    }
  }

  /**
   * Generate unique RFQ number
   */
  private static generateRFQNumber(): string {
    return `RFQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  /**
   * Batch update RFQs
   */
  static async batchUpdate(
    updates: Array<{ id: string; data: Partial<RFQ> }>
  ): Promise<void> {
    try {
      const promises = updates.map(({ id, data }) => 
        updateDoc(doc(db, COLLECTION_NAME, id), {
          ...data,
          updatedAt: Timestamp.now()
        })
      );
      
      await Promise.all(promises);
    } catch (error) {
      log.error('Error batch updating RFQs:', { data: error }, 'operations');
      throw error;
    }
  }

  /**
   * Search RFQs by title or description
   */
  static async search(searchTerm: string): Promise<RFQ[]> {
    try {
      // Firebase doesn't support full-text search natively
      // This is a simple implementation - in production, consider using Algolia or similar
      const snapshot = await getDocs(
        query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'))
      );
      
      const allRFQs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RFQ));
      
      const searchTermLower = searchTerm.toLowerCase();
      return allRFQs.filter(rfq => 
        rfq.title?.toLowerCase().includes(searchTermLower) ||
        rfq.description?.toLowerCase().includes(searchTermLower) ||
        rfq.rfqNumber?.toLowerCase().includes(searchTermLower)
      );
    } catch (error) {
      log.error('Error searching RFQs:', { data: error }, 'operations');
      throw error;
    }
  }
}