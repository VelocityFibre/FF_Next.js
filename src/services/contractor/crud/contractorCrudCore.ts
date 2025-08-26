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
      return await getContractorByIdFromFirebase(id);
    } catch (error) {
      console.error('Error getting contractor:', error);
      throw new Error('Failed to fetch contractor');
    }
  }

  /**
   * Create new contractor (Firebase + Neon sync)
   */
  async create(data: ContractorFormData): Promise<string> {
    try {
      // Create in Firebase first
      const contractorId = await createContractorInFirebase(data);
      
      // Sync to Neon for analytics (non-blocking)
      try {
        await createContractorInNeon(contractorId, data);
      } catch (neonError) {
        console.warn('Failed to sync contractor to Neon:', neonError);
        // Don't fail the entire operation for analytics sync issues
      }
      
      return contractorId;
    } catch (error) {
      console.error('Error creating contractor:', error);
      throw new Error('Failed to create contractor');
    }
  }

  /**
   * Update contractor (Firebase + Neon sync)
   */
  async update(id: string, data: Partial<ContractorFormData>): Promise<void> {
    try {
      // Update in Firebase first
      await updateContractorInFirebase(id, data);
      
      // Sync to Neon for analytics (non-blocking)
      try {
        await updateContractorInNeon(id, data);
      } catch (neonError) {
        console.warn('Failed to sync contractor update to Neon:', neonError);
      }
    } catch (error) {
      console.error('Error updating contractor:', error);
      throw new Error('Failed to update contractor');
    }
  }

  /**
   * Delete contractor (Firebase + Neon cleanup)
   */
  async delete(id: string): Promise<void> {
    try {
      // Delete from Firebase first (includes project assignment check)
      await deleteContractorFromFirebase(id);
      
      // Delete from Neon
      try {
        await deleteContractorFromNeon(id);
      } catch (neonError) {
        console.warn('Failed to delete contractor from Neon:', neonError);
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
      const filter: ContractorFilter = { searchTerm };
      return await this.getAll(filter);
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