/**
 * Supplier Search Query Builder
 * Firebase query construction for supplier searches
 */

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Supplier, SupplierStatus } from '@/types/supplier.types';

const COLLECTION_NAME = 'suppliers';

export class SupplierQueryBuilder {
  /**
   * Get base supplier dataset with basic filters
   */
  static async getBaseSupplierSet(filters: any): Promise<Supplier[]> {
    try {
      const queryFilters: any[] = [];
      
      // Apply status filter
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          queryFilters.push(where('status', 'in', filters.status));
        } else {
          queryFilters.push(where('status', '==', filters.status));
        }
      } else {
        // Default to active suppliers only
        queryFilters.push(where('status', '==', SupplierStatus.ACTIVE));
      }
      
      const q = query(collection(db, COLLECTION_NAME), ...queryFilters);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Supplier));
    } catch (error) {
      console.error('Error getting base supplier set:', error);
      throw new Error(`Failed to get suppliers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get suppliers by category
   */
  static async queryByCategory(category: string, options?: {
    includeInactive?: boolean;
    sortByRating?: boolean;
    limit?: number;
  }): Promise<Supplier[]> {
    try {
      const filters: any[] = [
        where('categories', 'array-contains', category)
      ];

      if (!options?.includeInactive) {
        filters.push(where('status', '==', SupplierStatus.ACTIVE));
      }

      let q = query(collection(db, COLLECTION_NAME), ...filters);

      if (options?.sortByRating) {
        q = query(q, orderBy('rating.overall', 'desc'));
      } else {
        q = query(q, orderBy('companyName'));
      }

      if (options?.limit) {
        q = query(q, limit(options.limit));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Supplier));
    } catch (error) {
      console.error(`Error querying suppliers by category ${category}:`, error);
      throw new Error(`Failed to query suppliers by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get preferred suppliers
   */
  static async queryPreferredSuppliers(options?: {
    category?: string;
    sortByPerformance?: boolean;
    limit?: number;
  }): Promise<Supplier[]> {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        where('isPreferred', '==', true),
        where('status', '==', SupplierStatus.ACTIVE)
      );

      if (options?.category) {
        q = query(q, where('categories', 'array-contains', options.category));
      }

      if (options?.sortByPerformance) {
        q = query(q, orderBy('performance.overallScore', 'desc'));
      } else {
        q = query(q, orderBy('rating.overall', 'desc'));
      }

      if (options?.limit) {
        q = query(q, limit(options.limit));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Supplier));
    } catch (error) {
      console.error('Error querying preferred suppliers:', error);
      throw new Error(`Failed to query preferred suppliers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get suppliers by name search
   */
  static async queryByName(searchTerm: string, maxResults: number = 50): Promise<Supplier[]> {
    try {
      if (!searchTerm.trim()) {
        return [];
      }

      // Get all active suppliers first (since Firestore doesn't support full-text search)
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', SupplierStatus.ACTIVE),
        orderBy('companyName'),
        limit(maxResults * 2) // Get more to account for filtering
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Supplier));
    } catch (error) {
      console.error('Error querying suppliers by name:', error);
      throw new Error(`Failed to query suppliers by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get top rated suppliers
   */
  static async getTopRatedSuppliers(limit: number): Promise<Supplier[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', SupplierStatus.ACTIVE),
        orderBy('rating.overall', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Supplier));
    } catch (error) {
      console.error('Error getting top rated suppliers:', error);
      throw new Error(`Failed to get top rated suppliers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}