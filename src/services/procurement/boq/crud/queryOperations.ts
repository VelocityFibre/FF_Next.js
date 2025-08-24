/**
 * BOQ Query Operations
 * Advanced querying and filtering operations for BOQs
 */

import { 
  collection, 
  getDocs, 
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { BOQ, BOQStatusType } from '../../../../types/procurement/boq.types';
import { BOQDataTransformers } from './dataTransformers';

const COLLECTION_NAME = 'boqs';

export interface BOQQueryFilter {
  projectId?: string;
  status?: BOQStatusType;
  uploadedBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * BOQ Query Operations
 */
export class BOQQueryOperations {
  /**
   * Get BOQs with filtering
   */
  static async getFiltered(filter: BOQQueryFilter): Promise<BOQ[]> {
    try {
      let q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      
      if (filter.projectId) {
        q = query(q, where('projectId', '==', filter.projectId));
      }
      if (filter.status) {
        q = query(q, where('status', '==', filter.status));
      }
      if (filter.uploadedBy) {
        q = query(q, where('uploadedBy', '==', filter.uploadedBy));
      }
      
      const snapshot = await getDocs(q);
      let results = snapshot.docs.map(doc => 
        BOQDataTransformers.transformFirestoreDoc(doc)
      );

      // Client-side filtering for date range (Firestore compound queries limitations)
      if (filter.dateRange) {
        results = results.filter(boq => {
          const createdAt = boq.createdAt;
          return createdAt >= filter.dateRange!.start && createdAt <= filter.dateRange!.end;
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error fetching filtered BOQs:', error);
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
      return snapshot.docs.map(doc => 
        BOQDataTransformers.transformFirestoreDoc(doc)
      );
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
      return snapshot.docs.map(doc => 
        BOQDataTransformers.transformFirestoreDoc(doc)
      );
    } catch (error) {
      console.error('Error fetching BOQs by status:', error);
      throw error;
    }
  }

  /**
   * Get BOQs by uploaded user
   */
  static async getByUploader(uploadedBy: string): Promise<BOQ[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('uploadedBy', '==', uploadedBy),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => 
        BOQDataTransformers.transformFirestoreDoc(doc)
      );
    } catch (error) {
      console.error('Error fetching BOQs by uploader:', error);
      throw error;
    }
  }

  /**
   * Search BOQs by title, description, or version
   */
  static async search(searchTerm: string): Promise<BOQ[]> {
    try {
      // Firebase doesn't support full-text search natively
      const snapshot = await getDocs(
        query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'))
      );
      
      const allBOQs = snapshot.docs.map(doc => 
        BOQDataTransformers.transformFirestoreDoc(doc)
      );
      
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

  /**
   * Get recent BOQs (last N days)
   */
  static async getRecent(days: number = 30): Promise<BOQ[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const allBOQs = snapshot.docs.map(doc => 
        BOQDataTransformers.transformFirestoreDoc(doc)
      );

      return allBOQs.filter(boq => boq.createdAt >= cutoffDate);
    } catch (error) {
      console.error('Error fetching recent BOQs:', error);
      throw error;
    }
  }

  /**
   * Get BOQ statistics by project
   */
  static async getProjectStatistics(projectId: string): Promise<{
    total: number;
    byStatus: Record<BOQStatusType, number>;
    avgItemCount: number;
    totalValue?: number;
  }> {
    try {
      const boqs = await this.getByProject(projectId);
      
      const stats = {
        total: boqs.length,
        byStatus: {} as Record<BOQStatusType, number>,
        avgItemCount: 0,
        totalValue: 0
      };

      // Initialize status counts
      const statuses: BOQStatusType[] = ['draft', 'approved', 'pending', 'rejected', 'archived'];
      statuses.forEach(status => {
        stats.byStatus[status] = 0;
      });

      let totalItems = 0;
      
      boqs.forEach(boq => {
        stats.byStatus[boq.status] = (stats.byStatus[boq.status] || 0) + 1;
        totalItems += boq.itemCount || 0;
      });

      stats.avgItemCount = boqs.length > 0 ? Math.round(totalItems / boqs.length) : 0;

      return stats;
    } catch (error) {
      console.error('Error getting project statistics:', error);
      throw error;
    }
  }

  /**
   * Get BOQs with pagination
   */
  static async getPaginated(
    page: number = 1,
    limit: number = 20,
    filter?: BOQQueryFilter
  ): Promise<{
    boqs: BOQ[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    try {
      // Get all filtered BOQs (Firestore doesn't have offset-based pagination)
      const allBOQs = filter ? await this.getFiltered(filter) : await this.getAll();
      
      const total = allBOQs.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const boqs = allBOQs.slice(startIndex, endIndex);
      
      return {
        boqs,
        total,
        page,
        limit,
        hasNext: endIndex < total,
        hasPrev: page > 1
      };
    } catch (error) {
      console.error('Error getting paginated BOQs:', error);
      throw error;
    }
  }

  /**
   * Get all BOQs (helper for pagination)
   */
  private static async getAll(): Promise<BOQ[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => 
        BOQDataTransformers.transformFirestoreDoc(doc)
      );
    } catch (error) {
      console.error('Error fetching all BOQs:', error);
      throw error;
    }
  }
}