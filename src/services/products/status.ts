/**
 * Product Status Management
 * Handle product availability, activation, and discontinuation
 */

import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ProductAvailability } from './types';

const PRODUCTS_COLLECTION = 'products';

/**
 * Product status management service
 */
export class ProductStatusService {
  /**
   * Update product availability status
   */
  static async updateAvailability(id: string, availability: ProductAvailability): Promise<void> {
    try {
      await updateDoc(doc(db, PRODUCTS_COLLECTION, id), {
        availability,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating product availability:', error);
      throw error;
    }
  }

  /**
   * Discontinue a product
   */
  static async discontinueProduct(id: string, replacementId?: string): Promise<void> {
    try {
      const updateData: any = {
        isDiscontinued: true,
        isActive: false,
        availability: ProductAvailability.DISCONTINUED,
        updatedAt: Timestamp.now()
      };
      
      if (replacementId) {
        updateData.replacementProductId = replacementId;
      }
      
      await updateDoc(doc(db, PRODUCTS_COLLECTION, id), updateData);
    } catch (error) {
      console.error('Error discontinuing product:', error);
      throw error;
    }
  }

  /**
   * Activate product
   */
  static async activateProduct(id: string): Promise<void> {
    try {
      await updateDoc(doc(db, PRODUCTS_COLLECTION, id), {
        isActive: true,
        isDiscontinued: false,
        availability: ProductAvailability.IN_STOCK,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error activating product:', error);
      throw error;
    }
  }

  /**
   * Deactivate product
   */
  static async deactivateProduct(id: string): Promise<void> {
    try {
      await updateDoc(doc(db, PRODUCTS_COLLECTION, id), {
        isActive: false,
        availability: ProductAvailability.OUT_OF_STOCK,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error deactivating product:', error);
      throw error;
    }
  }
}