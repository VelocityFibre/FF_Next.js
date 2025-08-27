/**
 * Contractor Neon Service Module
 * Central exports for contractor service using Neon PostgreSQL
 */

import { 
  Contractor, 
  ContractorFormData,
  ContractorFilter,
  ContractorAnalytics
} from '@/types/contractor.types';
import { queryContractorsWithFilters, queryContractorById, queryActiveContractors } from './queryBuilders';
import { mapToContractor, mapToContractors, mapToDropdownOption } from './dataMappers';
import { createContractor, updateContractor, deleteContractor } from './crudOperations';
import { getContractorSummary as getContractorSummaryStats } from './statistics';
import { log } from '@/lib/logger';

/**
 * Contractor service using Neon PostgreSQL database
 */
export const contractorNeonService = {
  /**
   * Get all contractors with optional filtering
   */
  async getAll(filter?: ContractorFilter): Promise<Contractor[]> {
    try {
      const result = await queryContractorsWithFilters(filter);
      return mapToContractors(result);
    } catch (error) {
      log.error('Error fetching contractors:', { data: error }, 'index');
      throw error;
    }
  },

  /**
   * Get contractor by ID
   */
  async getById(id: string): Promise<Contractor | null> {
    try {
      const result = await queryContractorById(id);
      
      if (result.length === 0) return null;
      
      return mapToContractor(result[0]);
    } catch (error) {
      log.error('Error fetching contractor:', { data: error }, 'index');
      throw error;
    }
  },

  /**
   * Create new contractor
   */
  create: createContractor,

  /**
   * Update contractor
   */
  update: updateContractor,

  /**
   * Delete contractor
   */
  delete: deleteContractor,

  /**
   * Get active contractors for dropdowns
   */
  async getActiveContractors(): Promise<Array<{id: string, label: string}>> {
    try {
      const result = await queryActiveContractors();
      return result.map((contractor: any) => mapToDropdownOption(contractor));
    } catch (error) {
      log.error('Error fetching active contractors:', { data: error }, 'index');
      throw error;
    }
  },

  /**
   * Get contractor summary statistics
   */
  getContractorSummary: getContractorSummaryStats,

  /**
   * Search contractors by company name
   */
  async searchByName(query: string): Promise<Contractor[]> {
    try {
      const filter: ContractorFilter = { search: query };
      const result = await queryContractorsWithFilters(filter);
      return mapToContractors(result);
    } catch (error) {
      log.error('Error searching contractors:', { data: error }, 'index');
      throw error;
    }
  }
};

// Export all sub-modules for direct access if needed
export * from './queryBuilders';
export * from './dataMappers';
export * from './crudOperations';
export * from './statistics';