/**
 * Supplier Base CRUD Operations
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
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { 
  Supplier, 
  SupplierFormData, 
  SupplierStatus
} from '@/types/supplier.types';
import { SupplierFilter } from './types';

const COLLECTION_NAME = 'suppliers';

/**
 * Base supplier CRUD operations
 */
export class SupplierBaseCrud {
  /**
   * Get all suppliers with optional filtering
   */
  static async getAll(filter?: SupplierFilter): Promise<Supplier[]> {
    try {
      let q = query(collection(db, COLLECTION_NAME), orderBy('companyName', 'asc'));
      
      // Apply filters
      if (filter?.status) {
        q = query(q, where('status', '==', filter.status));
      }
      if (filter?.isPreferred !== undefined) {
        q = query(q, where('isPreferred', '==', filter.isPreferred));
      }
      if (filter?.category) {
        q = query(q, where('categories', 'array-contains', filter.category));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Supplier));
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw new Error(`Failed to fetch suppliers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get supplier by ID
   */
  static async getById(id: string): Promise<Supplier> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        throw new Error(`Supplier with ID '${id}' not found`);
      }
      
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Supplier;
    } catch (error) {
      console.error(`Error fetching supplier ${id}:`, error);
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      throw new Error(`Failed to fetch supplier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if supplier exists
   */
  static async exists(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snapshot = await getDoc(docRef);
      return snapshot.exists();
    } catch (error) {
      console.error(`Error checking supplier existence ${id}:`, error);
      return false;
    }
  }

  /**
   * Create new supplier
   */
  static async create(data: SupplierFormData): Promise<string> {
    try {
      // Validate required fields
      if (!data.name) {
        throw new Error('Supplier name is required');
      }
      if (!data.email) {
        throw new Error('Supplier email is required');
      }

      // Initialize supplier with defaults
      const supplier = this.initializeSupplierData(data);
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), supplier);
      return docRef.id;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw new Error(`Failed to create supplier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update existing supplier
   */
  static async update(id: string, data: Partial<SupplierFormData>): Promise<void> {
    try {
      // Check if supplier exists
      const exists = await this.exists(id);
      if (!exists) {
        throw new Error(`Supplier with ID '${id}' not found`);
      }

      const docRef = doc(db, COLLECTION_NAME, id);
      
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
        lastModifiedBy: 'current-user-id' // TODO: Get from auth context
      };
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error(`Error updating supplier ${id}:`, error);
      throw new Error(`Failed to update supplier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete supplier
   */
  static async delete(id: string): Promise<void> {
    try {
      // Check if supplier exists
      const exists = await this.exists(id);
      if (!exists) {
        throw new Error(`Supplier with ID '${id}' not found`);
      }

      // TODO: Check for dependencies (active orders, RFQs, etc.)
      // For now, we'll just delete directly
      
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error(`Error deleting supplier ${id}:`, error);
      throw new Error(`Failed to delete supplier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initialize supplier data with defaults
   */
  private static initializeSupplierData(data: SupplierFormData): Omit<Supplier, 'id'> {
    const now = new Date();

    // Initialize rating
    const initialRating = {
      overall: 0,
      totalReviews: 0,
      lastReviewDate: null
    };

    return {
      ...data,
      code: data.code || `SUP-${Date.now()}`,
      companyName: data.name,
      businessType: data.businessType || 'Other',
      isActive: true,
      
      // Contact information
      primaryContact: {
        name: data.name,
        email: data.email,
        phone: data.phone || ''
      },
      contact: {
        name: data.name,
        email: data.email,
        phone: data.phone || ''
      },
      
      // Address information
      addresses: {
        physical: {
          street1: data.address || '',
          city: '',
          state: '',
          postalCode: '',
          country: 'South Africa'
        }
      },
      
      // Default values
      rating: initialRating,
      status: data.status || SupplierStatus.PENDING,
      isPreferred: false,
      categories: data.categories || [],
      
      // Compliance
      complianceStatus: {
        taxCompliant: false,
        beeCompliant: false,
        insuranceValid: false,
        documentsComplete: false
      },
      
      // Metadata
      documents: [],
      createdAt: now,
      updatedAt: now,
      createdBy: 'current-user-id', // TODO: Get from auth context
      lastModifiedBy: 'current-user-id'
    };
  }
}
