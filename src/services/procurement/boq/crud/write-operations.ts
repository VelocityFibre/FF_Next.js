/**
 * BOQ Write Operations
 * Handles create, update, delete operations for BOQs
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { BOQFormData, BOQStatusType, BOQ } from '../../../../types/procurement/boq.types';

const COLLECTION_NAME = 'boqs';

/**
 * BOQ Write Operations
 */
export class BOQWriteOperations {
  /**
   * Create a new BOQ
   */
  static async create(data: BOQFormData): Promise<string> {
    try {
      const currentDate = new Date();
      
      const boq = {
        projectId: data.projectId,
        version: data.version,
        title: data.title,
        description: data.description,
        status: 'draft' as BOQStatusType,
        uploadedBy: 'current-user-id', // TODO: Get from auth context
        uploadedAt: currentDate,
        itemCount: 0,
        mappedItems: 0,
        unmappedItems: 0,
        exceptionsCount: 0,
        currency: data.currency || 'ZAR',
        createdAt: currentDate,
        updatedAt: currentDate
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...boq,
        createdAt: Timestamp.fromDate(boq.createdAt),
        updatedAt: Timestamp.fromDate(boq.updatedAt),
        uploadedAt: Timestamp.fromDate(boq.uploadedAt)
      } as any);
      return docRef.id;
    } catch (error) {
      console.error('Error creating BOQ:', error);
      throw error;
    }
  }

  /**
   * Update an existing BOQ
   */
  static async update(id: string, data: Partial<BOQFormData>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      const updateData: Partial<Record<string, any>> = {
        ...data,
        updatedAt: Timestamp.fromDate(new Date())
      };
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating BOQ:', error);
      throw error;
    }
  }

  /**
   * Delete a BOQ
   */
  static async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting BOQ:', error);
      throw error;
    }
  }

  /**
   * Update BOQ status
   */
  static async updateStatus(id: string, status: BOQStatusType, approvedBy?: string): Promise<void> {
    try {
      const updateData: Partial<Record<string, any>> = {
        status,
        updatedAt: Timestamp.fromDate(new Date())
      };
      
      if (status === 'approved' && approvedBy) {
        updateData.approvedBy = approvedBy;
        updateData.approvedAt = Timestamp.fromDate(new Date());
      }
      
      if (status === 'archived') {
        // Handle archival logic if needed
      }
      
      await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
    } catch (error) {
      console.error('Error updating BOQ status:', error);
      throw error;
    }
  }

  /**
   * Batch update BOQs
   */
  static async batchUpdate(
    updates: Array<{ id: string; data: Partial<BOQ> }>
  ): Promise<void> {
    try {
      const promises = updates.map(({ id, data }) => 
        updateDoc(doc(db, COLLECTION_NAME, id), {
          ...data,
          updatedAt: Timestamp.fromDate(new Date())
        })
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error batch updating BOQs:', error);
      throw error;
    }
  }
}