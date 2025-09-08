/**
 * BOQ CRUD Operations
 * Basic create, read, update, delete operations for BOQs
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
import { db } from '@/src/config/firebase';
import { BOQ, BOQFormData, BOQStatusType } from '@/types/procurement/boq.types';
import { log } from '@/lib/logger';

const COLLECTION_NAME = 'boqs';

/**
 * BOQ CRUD operations
 */
export class BOQCrud {
  /**
   * Get all BOQs with optional filtering
   */
  static async getAll(filter?: { projectId?: string; status?: BOQStatusType }): Promise<BOQ[]> {
    try {
      let q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      
      if (filter?.projectId) {
        q = query(q, where('projectId', '==', filter.projectId));
      }
      if (filter?.status) {
        q = query(q, where('status', '==', filter.status));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          uploadedAt: data.uploadedAt?.toDate?.() || new Date(),
          approvedAt: data.approvedAt?.toDate?.() || undefined,
          rejectedAt: data.rejectedAt?.toDate?.() || undefined
        } as BOQ;
      });
    } catch (error) {
      log.error('Error fetching BOQs:', { data: error }, 'boqCrud');
      throw error;
    }
  }

  /**
   * Get BOQ by ID
   */
  static async getById(id: string): Promise<BOQ> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        throw new Error('BOQ not found');
      }
      
      const data = snapshot.data();
      return {
        id: snapshot.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        uploadedAt: data.uploadedAt?.toDate?.() || new Date(),
        approvedAt: data.approvedAt?.toDate?.() || undefined,
        rejectedAt: data.rejectedAt?.toDate?.() || undefined
      } as BOQ;
    } catch (error) {
      log.error('Error fetching BOQ:', { data: error }, 'boqCrud');
      throw error;
    }
  }

  /**
   * Create new BOQ
   */
  static async create(data: BOQFormData): Promise<string> {
    try {
      const boq = {
        ...data,
        name: data.title || 'Untitled BOQ',
        status: 'draft' as BOQStatusType,
        uploadedBy: 'current-user', // TODO: Get from auth context
        itemCount: 0,
        mappedItems: 0,
        unmappedItems: 0,
        exceptionsCount: 0,
        totalEstimatedValue: 0,
        currency: data.currency || 'ZAR',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        uploadedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), boq);
      return docRef.id;
    } catch (error) {
      log.error('Error creating BOQ:', { data: error }, 'boqCrud');
      throw error;
    }
  }

  /**
   * Update existing BOQ
   */
  static async update(id: string, data: Partial<BOQFormData>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      log.error('Error updating BOQ:', { data: error }, 'boqCrud');
      throw error;
    }
  }

  /**
   * Delete BOQ
   */
  static async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      log.error('Error deleting BOQ:', { data: error }, 'boqCrud');
      throw error;
    }
  }

  /**
   * Update BOQ status
   */
  static async updateStatus(id: string, status: BOQStatusType): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData: any = {
        status,
        updatedAt: Timestamp.now()
      };
      
      if (status === 'approved') {
        updateData.approvedAt = Timestamp.now();
      } else if (status === 'archived') {
        updateData.rejectedAt = Timestamp.now();
      }
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      log.error('Error updating BOQ status:', { data: error }, 'boqCrud');
      throw error;
    }
  }

  /**
   * Get BOQs by project
   */
  static async getByProject(projectId: string): Promise<BOQ[]> {
    return this.getAll({ projectId });
  }

  /**
   * Get BOQs by status
   */
  static async getByStatus(status: BOQStatusType): Promise<BOQ[]> {
    return this.getAll({ status });
  }

  /**
   * Check if BOQ exists
   */
  static async exists(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snapshot = await getDoc(docRef);
      return snapshot.exists();
    } catch (error) {
      log.error('Error checking BOQ existence:', { data: error }, 'boqCrud');
      return false;
    }
  }
}