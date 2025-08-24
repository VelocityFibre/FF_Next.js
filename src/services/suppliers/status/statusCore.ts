/**
 * Supplier Status - Core Status Operations
 * Handles fundamental status update operations
 */

import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { 
  SupplierStatus, 
  StatusUpdateData 
} from './types';

const COLLECTION_NAME = 'suppliers';

export class StatusCore {
  /**
   * Update supplier status with reason tracking
   */
  static async updateStatus(
    id: string, 
    { status, reason, userId }: StatusUpdateData
  ): Promise<void> {
    try {
      const updateData = this.buildStatusUpdateData(status, reason, userId);
      await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
    } catch (error) {
      console.error(`Error updating supplier status for ${id}:`, error);
      throw new Error(`Failed to update supplier status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build status update data based on status type
   */
  private static buildStatusUpdateData(
    status: SupplierStatus, 
    reason?: string, 
    userId?: string
  ): Record<string, any> {
    const baseData: Record<string, any> = {
      status,
      updatedAt: Timestamp.now(),
      lastModifiedBy: userId || 'current-user-id' // TODO: Get from auth context
    };

    // Add specific status-related fields
    switch (status) {
      case SupplierStatus.BLACKLISTED:
        return this.buildBlacklistData(baseData, reason, userId);
      
      case SupplierStatus.INACTIVE:
        return this.buildInactiveData(baseData, reason);
      
      case SupplierStatus.ACTIVE:
        return this.buildActiveData(baseData, userId);
      
      case SupplierStatus.PENDING:
        return this.buildPendingData(baseData);
      
      default:
        return baseData;
    }
  }

  /**
   * Build blacklist-specific update data
   */
  private static buildBlacklistData(
    baseData: Record<string, any>, 
    reason?: string, 
    userId?: string
  ): Record<string, any> {
    const data = { ...baseData, isActive: false };
    
    if (reason) {
      data.blacklistReason = reason;
      data.blacklistedAt = Timestamp.now();
      data.blacklistedBy = userId || 'current-user-id';
    }
    
    return data;
  }

  /**
   * Build inactive-specific update data
   */
  private static buildInactiveData(
    baseData: Record<string, any>, 
    reason?: string
  ): Record<string, any> {
    const data = { ...baseData, isActive: false };
    
    if (reason) {
      data.inactiveReason = reason;
      data.inactivatedAt = Timestamp.now();
    }
    
    return data;
  }

  /**
   * Build active-specific update data
   */
  private static buildActiveData(
    baseData: Record<string, any>, 
    userId?: string
  ): Record<string, any> {
    return {
      ...baseData,
      isActive: true,
      activatedAt: Timestamp.now(),
      activatedBy: userId || 'current-user-id',
      // Clear blacklist/inactive reasons if reactivating
      blacklistReason: null,
      inactiveReason: null
    };
  }

  /**
   * Build pending-specific update data
   */
  private static buildPendingData(
    baseData: Record<string, any>
  ): Record<string, any> {
    return {
      ...baseData,
      isActive: false,
      pendingSince: Timestamp.now()
    };
  }

  /**
   * Set supplier as preferred or remove preference
   */
  static async setPreferred(
    id: string, 
    isPreferred: boolean,
    userId?: string
  ): Promise<void> {
    try {
      const updateData = this.buildPreferenceUpdateData(isPreferred, userId);
      await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
    } catch (error) {
      console.error(`Error updating supplier preference for ${id}:`, error);
      throw new Error(`Failed to update supplier preference: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build preference update data
   */
  private static buildPreferenceUpdateData(
    isPreferred: boolean, 
    userId?: string
  ): Record<string, any> {
    const updateData: Record<string, any> = {
      isPreferred,
      updatedAt: Timestamp.now(),
      lastModifiedBy: userId || 'current-user-id'
    };

    if (isPreferred) {
      updateData.preferredSince = Timestamp.now();
      updateData.preferredBy = userId || 'current-user-id';
    } else {
      updateData.preferredSince = null;
      updateData.preferredBy = null;
    }

    return updateData;
  }
}