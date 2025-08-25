/**
 * BOQ Base CRUD Operations
 * Core create, read, update, delete operations
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
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { BOQ, BOQFormData } from '../../../../types/procurement/boq.types';
import { BOQDataTransformers } from './dataTransformers';

const COLLECTION_NAME = 'boqs';

/**
 * BOQ Base CRUD Operations
 */
export class BOQBaseOperations {
  /**
   * Get all BOQs
   */
  static async getAll(): Promise<BOQ[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => 
        BOQDataTransformers.transformFirestoreDoc(doc)
      );
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
      
      return BOQDataTransformers.transformFirestoreDoc(snapshot);
    } catch (error) {
      console.error('Error fetching BOQ:', error);
      throw error;
    }
  }

  /**
   * Create a new BOQ
   */
  static async create(data: BOQFormData): Promise<string> {
    try {
      const boq = BOQDataTransformers.createBOQFromFormData(data);
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...boq,
        createdAt: Timestamp.fromDate(boq.createdAt || new Date()),
        updatedAt: Timestamp.fromDate(boq.updatedAt || new Date()),
        uploadedAt: Timestamp.fromDate(boq.uploadedAt || new Date())
      });
      
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