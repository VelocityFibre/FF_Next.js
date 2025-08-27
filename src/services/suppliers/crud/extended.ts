/**
 * Supplier Extended Operations
 * Advanced operations like soft delete, statistics, validation
 */

import { 
  collection, 
  getDocs, 
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { SupplierStatus } from '@/types/supplier/base.types';
import { SupplierBaseCrud } from './base';
import { SupplierSoftDeleteData } from './types';
import { log } from '@/lib/logger';

const COLLECTION_NAME = 'suppliers';

/**
 * Extended supplier operations
 */
export class SupplierExtendedOperations {
  /**
   * Soft delete supplier (set status to inactive)
   */
  static async softDelete(id: string, reason?: string): Promise<void> {
    try {
      const updateData: SupplierSoftDeleteData = {
        status: SupplierStatus.INACTIVE,
        isActive: false,
        updatedAt: Timestamp.now(),
        lastModifiedBy: 'current-user-id' // TODO: Get from auth context
      };

      if (reason) {
        updateData.inactiveReason = reason;
        updateData.inactivatedAt = Timestamp.now();
      }

      await SupplierBaseCrud.update(id, updateData as any);
    } catch (error) {
      log.error(`Error soft deleting supplier ${id}:`, { data: error }, 'extended');
      throw error;
    }
  }

  /**
   * Get active suppliers count
   */
  static async getActiveCount(): Promise<number> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', SupplierStatus.ACTIVE)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      log.error('Error getting active supplier count:', { data: error }, 'extended');
      return 0;
    }
  }

  /**
   * Get suppliers count by status
   */
  static async getCountByStatus(status: SupplierStatus): Promise<number> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', status)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      log.error(`Error getting supplier count for status ${status}:`, { data: error }, 'extended');
      return 0;
    }
  }

  /**
   * Check if supplier code is unique
   */
  static async isCodeUnique(code: string, excludeId?: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('code', '==', code)
      );
      
      const snapshot = await getDocs(q);
      
      // If excluding an ID (for updates), make sure it's not the same supplier
      if (excludeId) {
        return snapshot.docs.every(doc => doc.id !== excludeId);
      }
      
      return snapshot.empty;
    } catch (error) {
      log.error('Error checking code uniqueness:', { data: error }, 'extended');
      return false;
    }
  }

  /**
   * Check if supplier email is unique
   */
  static async isEmailUnique(email: string, excludeId?: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('email', '==', email)
      );
      
      const snapshot = await getDocs(q);
      
      // If excluding an ID (for updates), make sure it's not the same supplier
      if (excludeId) {
        return snapshot.docs.every(doc => doc.id !== excludeId);
      }
      
      return snapshot.empty;
    } catch (error) {
      log.error('Error checking email uniqueness:', { data: error }, 'extended');
      return false;
    }
  }

  /**
   * Get preferred suppliers
   */
  static async getPreferred(): Promise<number> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isPreferred', '==', true)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      log.error('Error getting preferred supplier count:', { data: error }, 'extended');
      return 0;
    }
  }

  /**
   * Reactivate supplier (undo soft delete)
   */
  static async reactivate(id: string): Promise<void> {
    try {
      const updateData = {
        status: SupplierStatus.ACTIVE,
        isActive: true,
        updatedAt: Timestamp.now(),
        lastModifiedBy: 'current-user-id', // TODO: Get from auth context
        inactiveReason: null,
        inactivatedAt: null
      };

      await SupplierBaseCrud.update(id, updateData);
    } catch (error) {
      log.error(`Error reactivating supplier ${id}:`, { data: error }, 'extended');
      throw error;
    }
  }
}
