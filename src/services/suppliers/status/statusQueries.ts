/**
 * Supplier Status - Query Operations
 * Handles status-based queries and data retrieval
 */

import { query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { 
  SupplierStatus, 
  Supplier, 
  StatusSummary, 
  StatusHistoryEntry 
} from './types';

const COLLECTION_NAME = 'suppliers';

export class StatusQueries {
  /**
   * Get suppliers by status
   */
  static async getByStatus(status: SupplierStatus): Promise<Supplier[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', status)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Supplier));
    } catch (error) {
      console.error(`Error fetching suppliers by status ${status}:`, error);
      throw new Error(`Failed to fetch suppliers by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get suppliers pending approval
   */
  static async getPendingApproval(): Promise<Supplier[]> {
    return this.getByStatus(SupplierStatus.PENDING);
  }

  /**
   * Get active suppliers
   */
  static async getActiveSuppliers(): Promise<Supplier[]> {
    return this.getByStatus(SupplierStatus.ACTIVE);
  }

  /**
   * Get inactive suppliers
   */
  static async getInactiveSuppliers(): Promise<Supplier[]> {
    return this.getByStatus(SupplierStatus.INACTIVE);
  }

  /**
   * Get blacklisted suppliers
   */
  static async getBlacklistedSuppliers(): Promise<Supplier[]> {
    return this.getByStatus(SupplierStatus.BLACKLISTED);
  }

  /**
   * Get preferred suppliers
   */
  static async getPreferredSuppliers(): Promise<Supplier[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isPreferred', '==', true),
        where('status', '==', SupplierStatus.ACTIVE)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Supplier));
    } catch (error) {
      console.error('Error fetching preferred suppliers:', error);
      throw new Error(`Failed to fetch preferred suppliers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get status summary statistics
   */
  static async getStatusSummary(): Promise<StatusSummary> {
    try {
      const summary: StatusSummary = {
        [SupplierStatus.PENDING]: 0,
        [SupplierStatus.ACTIVE]: 0,
        [SupplierStatus.INACTIVE]: 0,
        [SupplierStatus.SUSPENDED]: 0,
        [SupplierStatus.BLACKLISTED]: 0,
        [SupplierStatus.ARCHIVED]: 0
      };

      // Get counts for each status
      for (const status of Object.values(SupplierStatus)) {
        const count = await this.getStatusCount(status);
        summary[status] = count;
      }

      return summary;
    } catch (error) {
      console.error('Error getting status summary:', error);
      throw new Error(`Failed to get status summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get count of suppliers by status
   */
  private static async getStatusCount(status: SupplierStatus): Promise<number> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', status)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  /**
   * Get status transition history for a supplier
   */
  static async getStatusHistory(supplierId: string): Promise<StatusHistoryEntry[]> {
    try {
      // In a real implementation, this would query a status history table
      // For now, return mock data based on current supplier state
      
      // This would typically be stored in a separate 'supplier_status_history' collection
      // Each status change would create a new record with timestamp, old/new status, reason, etc.
      
      return [];
    } catch (error) {
      console.error(`Error fetching status history for ${supplierId}:`, error);
      return [];
    }
  }

  /**
   * Get suppliers with specific conditions
   */
  static async getSuppliersWithConditions(conditions: {
    status?: SupplierStatus;
    isPreferred?: boolean;
    isActive?: boolean;
  }): Promise<Supplier[]> {
    try {
      const collectionRef = collection(db, COLLECTION_NAME);
      const constraints = [];

      if (conditions.status) {
        constraints.push(where('status', '==', conditions.status));
      }

      if (conditions.isPreferred !== undefined) {
        constraints.push(where('isPreferred', '==', conditions.isPreferred));
      }

      if (conditions.isActive !== undefined) {
        constraints.push(where('isActive', '==', conditions.isActive));
      }

      const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Supplier));
    } catch (error) {
      console.error('Error fetching suppliers with conditions:', error);
      throw new Error(`Failed to fetch suppliers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}