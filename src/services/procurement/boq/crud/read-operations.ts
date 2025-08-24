/**
 * BOQ Read Operations
 * Handles all read/query operations for BOQs
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { BOQ, BOQStatusType } from '../../../../types/procurement/boq.types';

const COLLECTION_NAME = 'boqs';

/**
 * BOQ Read Operations
 */
export class BOQReadOperations {
  /**
   * Transform Firestore document to BOQ object
   */
  private static transformDoc(doc: any): BOQ {
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
  }

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
      return snapshot.docs.map(doc => this.transformDoc(doc));
    } catch (error) {
      console.error('Error fetching BOQs:', error);
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
      
      return this.transformDoc(snapshot);
    } catch (error) {
      console.error('Error fetching BOQ:', error);
      throw error;
    }
  }

  /**
   * Get BOQs by project ID
   */
  static async getByProject(projectId: string): Promise<BOQ[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.transformDoc(doc));
    } catch (error) {
      console.error('Error fetching BOQs by project:', error);
      throw error;
    }
  }

  /**
   * Get BOQs by status
   */
  static async getByStatus(status: BOQStatusType): Promise<BOQ[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.transformDoc(doc));
    } catch (error) {
      console.error('Error fetching BOQs by status:', error);
      throw error;
    }
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
      console.error('Error checking BOQ existence:', error);
      return false;
    }
  }

  /**
   * Search BOQs by title or description
   */
  static async search(searchTerm: string): Promise<BOQ[]> {
    try {
      // Firebase doesn't support full-text search natively
      const snapshot = await getDocs(
        query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'))
      );
      
      const allBOQs = snapshot.docs.map(doc => this.transformDoc(doc));
      
      const searchTermLower = searchTerm.toLowerCase();
      return allBOQs.filter(boq => 
        boq.title?.toLowerCase().includes(searchTermLower) ||
        boq.description?.toLowerCase().includes(searchTermLower) ||
        boq.version?.toLowerCase().includes(searchTermLower)
      );
    } catch (error) {
      console.error('Error searching BOQs:', error);
      throw error;
    }
  }
}