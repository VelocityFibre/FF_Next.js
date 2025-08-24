/**
 * Product CRUD Operations
 * Core create, read, update, delete operations for products
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
import { Product, ProductFormData, ProductFilter } from './types';

const PRODUCTS_COLLECTION = 'products';

/**
 * Product CRUD operations service
 */
export class ProductCrudService {
  /**
   * Get all products with optional filtering
   */
  static async getAllProducts(filter?: ProductFilter): Promise<Product[]> {
    try {
      let q = query(collection(db, PRODUCTS_COLLECTION), orderBy('name', 'asc'));
      
      if (filter?.supplierId) {
        q = query(q, where('supplierId', '==', filter.supplierId));
      }
      if (filter?.category) {
        q = query(q, where('category', '==', filter.category));
      }
      if (filter?.availability) {
        q = query(q, where('availability', '==', filter.availability));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: string): Promise<Product> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        throw new Error('Product not found');
      }
      
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  /**
   * Create new product
   */
  static async createProduct(data: ProductFormData): Promise<string> {
    try {
      const product: Omit<Product, 'id'> = {
        ...data,
        pricing: {
          unitPrice: data.unitPrice || 0,
          currency: data.currency || 'ZAR',
          vatInclusive: true
        },
        isActive: true,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), product);
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update existing product
   */
  static async updateProduct(id: string, data: Partial<ProductFormData>): Promise<void> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete product
   */
  static async deleteProduct(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}