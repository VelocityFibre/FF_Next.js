/**
 * Core Contractor CRUD Service
 * Main orchestrator for contractor operations
 * Using API routes for browser, Neon for server/build
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
import { contractorApiService } from '../contractorApiService';
import { log } from '@/lib/logger';
// Keep Firebase operations for backward compatibility/migration
import {
  createContractorInFirebase,
  updateContractorInFirebase,
  deleteContractorFromFirebase
} from './firebaseOperations';
import {
  subscribeToContractors,
  subscribeToContractor
} from './subscriptionHandlers';
// Client-side filter utilities removed - using server-side filtering
// sortContractors import removed - using server-side sorting

// Use API service in browser, Neon service for server/build
const isBrowser = typeof window !== 'undefined';
const baseService = isBrowser ? contractorApiService : contractorNeonService;

/**
 * Main contractor CRUD service orchestrator
 */
export class ContractorCrudCore {
  /**
   * Get all contractors with optional filtering and sorting
   */
  async getAll(filter?: ContractorFilter): Promise<Contractor[]> {
    try {
      if (isBrowser) {
        // API service doesn't support complex filtering yet, so get all and filter client-side
        const contractors = await baseService.getAll();
        if (!filter) return contractors;
        
        // Apply client-side filtering
        return contractors.filter(contractor => {
          if (filter.status && !filter.status.includes(contractor.status || 'active')) return false;
          if (filter.specialization && !filter.specialization.includes(contractor.specialization || '')) return false;
          return true;
        });
      }
      return contractorNeonService.getAll(filter);
    } catch (error) {
      log.error('Error getting contractors:', { data: error }, 'contractorCrudCore');
      throw new Error('Failed to fetch contractors');
    }
  }

  /**
   * Get contractor by ID
   */
  async getById(id: string): Promise<Contractor | null> {
    try {
      return await baseService.getById(id);
    } catch (error) {
      log.error('Error getting contractor:', { data: error }, 'contractorCrudCore');
      throw new Error('Failed to fetch contractor');
    }
  }

  /**
   * Create new contractor
   */
  async create(data: ContractorFormData): Promise<string> {
    try {
      if (isBrowser) {
        const contractor = await contractorApiService.create(data as any);
        return contractor.id || '';
      }
      
      const contractor = await contractorNeonService.create(data);
      
      // Sync to Firebase for backward compatibility (non-blocking)
      try {
        await createContractorInFirebase(data);
      } catch (firebaseError) {
        log.warn('Failed to sync contractor to Firebase:', { data: firebaseError }, 'contractorCrudCore');
        // Don't fail the entire operation for sync issues
      }
      
      return contractor.id;
    } catch (error) {
      log.error('Error creating contractor:', { data: error }, 'contractorCrudCore');
      throw new Error('Failed to create contractor');
    }
  }

  /**
   * Update contractor
   */
  async update(id: string, data: Partial<ContractorFormData>): Promise<void> {
    try {
      if (isBrowser) {
        await contractorApiService.update(id, data as any);
        return;
      }
      
      // Update in Neon as primary database
      await contractorNeonService.update(id, data);
      
      // Sync to Firebase for backward compatibility (non-blocking)
      try {
        await updateContractorInFirebase(id, data);
      } catch (firebaseError) {
        log.warn('Failed to sync contractor update to Firebase:', { data: firebaseError }, 'contractorCrudCore');
      }
    } catch (error) {
      log.error('Error updating contractor:', { data: error }, 'contractorCrudCore');
      throw new Error('Failed to update contractor');
    }
  }

  /**
   * Delete contractor
   */
  async delete(id: string): Promise<void> {
    try {
      if (isBrowser) {
        await contractorApiService.delete(id);
        return;
      }
      
      // Delete from Neon as primary database
      await contractorNeonService.delete(id);
      
      // Delete from Firebase for backward compatibility (non-blocking)
      try {
        await deleteContractorFromFirebase(id);
      } catch (firebaseError) {
        log.warn('Failed to delete contractor from Firebase:', { data: firebaseError }, 'contractorCrudCore');
      }
    } catch (error) {
      log.error('Error deleting contractor:', { data: error }, 'contractorCrudCore');
      throw new Error('Failed to delete contractor');
    }
  }

  /**
   * Get contractor analytics
   */
  async getAnalytics(): Promise<ContractorAnalytics> {
    try {
      if (isBrowser) {
        // For browser, calculate analytics from API data
        const contractors = await contractorApiService.getAll();
        const summary = await contractorApiService.getContractorSummary();
        
        return {
          totalContractors: summary.totalContractors,
          activeContractors: summary.activeContractors,
          averageRating: summary.averageRating,
          averageHourlyRate: summary.averageHourlyRate,
          topRatedContractors: await contractorApiService.getTopRatedContractors(5),
          contractorsBySpecialization: {},
          recentlyAdded: contractors.slice(0, 5)
        };
      }
      
      const { getContractorAnalytics } = await import('../neon/statistics');
      return await getContractorAnalytics();
    } catch (error) {
      log.error('Error getting contractor analytics:', { data: error }, 'contractorCrudCore');
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
      log.error('Error in batch update:', { data: error }, 'contractorCrudCore');
      throw new Error('Failed to update contractors in batch');
    }
  }

  /**
   * Search contractors by term
   */
  async search(searchTerm: string): Promise<Contractor[]> {
    try {
      if (isBrowser) {
        // For browser, filter from all contractors
        const contractors = await contractorApiService.getAll();
        const term = searchTerm.toLowerCase();
        return contractors.filter(c => 
          c.company_name?.toLowerCase().includes(term) ||
          c.contact_person?.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term)
        );
      }
      
      // Use Neon service search functionality
      return await contractorNeonService.searchByName(searchTerm);
    } catch (error) {
      log.error('Error searching contractors:', { data: error }, 'contractorCrudCore');
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
      log.error('Error finding contractor by email or registration:', { data: error }, 'contractorCrudCore');
      throw new Error('Failed to search for existing contractor');
    }
  }
}

// Export singleton instance
export const contractorCrudCore = new ContractorCrudCore();