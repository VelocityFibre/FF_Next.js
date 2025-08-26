/**
 * Core Contractor CRUD Service
 * Main orchestrator for contractor operations
 */

import { Unsubscribe } from 'firebase/firestore';
import { 
  Contractor, 
  ContractorFormData,
  ContractorFilter,
  ContractorAnalytics
} from '@/types/contractor.types';
// Import Neon service as primary database
import { contractorNeonService } from '../contractorNeonService';
// Keep Firebase operations for backward compatibility/migration
import {
  getAllContractorsFromFirebase,
  getContractorByIdFromFirebase,
  createContractorInFirebase,
  updateContractorInFirebase,
  deleteContractorFromFirebase
} from './firebaseOperations';
import {
  subscribeToContractors,
  subscribeToContractor
} from './subscriptionHandlers';
import {
  applyClientSideFilters,
  sortContractors
} from './searchFilters';

/**
 * Main contractor CRUD service orchestrator
 */
export class ContractorCrudCore {
  /**
   * Get all contractors with optional filtering and sorting
   */
  async getAll(filter?: ContractorFilter): Promise<Contractor[]> {
    try {
      // Use Neon as primary database
      const contractors = await contractorNeonService.getAll(filter);
      return contractors;
    } catch (error) {
      console.error('Error getting contractors from Neon:', error);
      throw new Error('Failed to fetch contractors');
    }
  }

  /**
   * Get contractor by ID
   */
  async getById(id: string): Promise<Contractor | null> {
    try {
      // Use Neon as primary database
      return await contractorNeonService.getById(id);
    } catch (error) {
      console.error('Error getting contractor from Neon:', error);
      throw new Error('Failed to fetch contractor');
    }
  }

  /**
   * Create new contractor (Neon primary)
   */
  async create(data: ContractorFormData): Promise<string> {
    try {
      // Use Neon as primary database
      const contractor = await contractorNeonService.create(data);
      
      // Sync to Firebase for backward compatibility (non-blocking)
      try {
        await createContractorInFirebase(data);
      } catch (firebaseError) {
        console.warn('Failed to sync contractor to Firebase:', firebaseError);
        // Don't fail the entire operation for sync issues
      }
      
      return contractor.id;
    } catch (error) {
      console.error('Error creating contractor:', error);
      throw new Error('Failed to create contractor');
    }
  }

  /**
   * Update contractor (Neon primary)
   */
  async update(id: string, data: Partial<ContractorFormData>): Promise<void> {
    try {
      // Update in Neon as primary database
      await contractorNeonService.update(id, data);
      
      // Sync to Firebase for backward compatibility (non-blocking)
      try {
        await updateContractorInFirebase(id, data);
      } catch (firebaseError) {
        console.warn('Failed to sync contractor update to Firebase:', firebaseError);
      }
    } catch (error) {
      console.error('Error updating contractor:', error);
      throw new Error('Failed to update contractor');
    }
  }

  /**
   * Delete contractor (Neon primary)
   */
  async delete(id: string): Promise<void> {
    try {
      // Delete from Neon as primary database
      await contractorNeonService.delete(id);
      
      // Delete from Firebase for backward compatibility (non-blocking)
      try {
        await deleteContractorFromFirebase(id);
      } catch (firebaseError) {
        console.warn('Failed to delete contractor from Firebase:', firebaseError);
      }
    } catch (error) {
      console.error('Error deleting contractor:', error);
      throw new Error('Failed to delete contractor');
    }
  }

  /**
   * Get contractor analytics from Neon
   */
  async getAnalytics(): Promise<ContractorAnalytics> {
    try {
      const { getContractorAnalytics } = await import('../neon/statistics');
      return await getContractorAnalytics();
    } catch (error) {
      console.error('Error getting contractor analytics:', error);
      throw new Error('Failed to fetch contractor analytics');
    }
  }

  /**
   * Subscribe to contractors list changes
   */
  subscribeToContractors(
    callback: (contractors: Contractor[]) => void,
    filter?: ContractorFilter
  ): Unsubscribe {
    return subscribeToContractors(callback, filter);
  }

  /**
   * Subscribe to single contractor changes
   */
  subscribeToContractor(
    contractorId: string,
    callback: (contractor: Contractor | null) => void
  ): Unsubscribe {
    return subscribeToContractor(contractorId, callback);
  }

  /**
   * Batch update contractors
   */
  async batchUpdate(
    updates: Array<{ id: string; data: Partial<ContractorFormData> }>
  ): Promise<void> {
    try {
      const updatePromises = updates.map(({ id, data }) => this.update(id, data));
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error in batch update:', error);
      throw new Error('Failed to update contractors in batch');
    }
  }

  /**
   * Search contractors by term
   */
  async search(searchTerm: string): Promise<Contractor[]> {
    try {
      // Use Neon service search functionality
      return await contractorNeonService.searchByName(searchTerm);
    } catch (error) {
      console.error('Error searching contractors:', error);
      throw new Error('Failed to search contractors');
    }
  }

  /**
   * Find contractor by email or registration number
   * Used for duplicate detection during import
   */
  async findByEmailOrRegistration(email: string, registrationNumber?: string): Promise<Contractor | null> {
    try {
      const contractors = await this.getAll();
      
      // First, try to find by email (exact match, case insensitive)
      const byEmail = contractors.find(c => 
        c.email.toLowerCase() === email.toLowerCase()
      );
      
      if (byEmail) {
        return byEmail;
      }
      
      // If no email match and registration number provided, try registration number
      if (registrationNumber?.trim()) {
        const byRegistration = contractors.find(c => 
          c.registrationNumber && 
          c.registrationNumber.toLowerCase() === registrationNumber.toLowerCase()
        );
        
        if (byRegistration) {
          return byRegistration;
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('Error finding contractor by email or registration:', error);
      throw new Error('Failed to search for existing contractor');
    }
  }
}

// Export singleton instance
export const contractorCrudCore = new ContractorCrudCore();