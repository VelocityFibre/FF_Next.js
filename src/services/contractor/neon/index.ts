/**
 * Contractor Neon Service Module
 * Updated to use API endpoints instead of direct database access
 */

import { 
  Contractor, 
  ContractorFormData,
  ContractorFilter,
  ContractorAnalytics
} from '@/types/contractor.types';
import { contractorsApi } from '@/services/api/contractorsApi';
import { log } from '@/lib/logger';

/**
 * Contractor service using API endpoints
 */
export const contractorNeonService = {
  /**
   * Get all contractors with optional filtering
   */
  async getAll(filter?: ContractorFilter): Promise<Contractor[]> {
    try {
      const response = await contractorsApi.getContractors(filter);
      return response.data || [];
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
      const response = await contractorsApi.getContractor(id);
      return response.data || null;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      log.error('Error fetching contractor:', { data: error }, 'index');
      throw error;
    }
  },

  /**
   * Create new contractor
   */
  async create(data: ContractorFormData): Promise<Contractor> {
    try {
      const response = await contractorsApi.createContractor(data);
      return response.data;
    } catch (error) {
      log.error('Error creating contractor:', { data: error }, 'index');
      throw error;
    }
  },

  /**
   * Update contractor
   */
  async update(id: string, data: Partial<ContractorFormData>): Promise<Contractor> {
    try {
      const response = await contractorsApi.updateContractor(id, data);
      return response.data;
    } catch (error) {
      log.error('Error updating contractor:', { data: error }, 'index');
      throw error;
    }
  },

  /**
   * Delete contractor
   */
  async delete(id: string): Promise<void> {
    try {
      await contractorsApi.deleteContractor(id);
    } catch (error) {
      log.error('Error deleting contractor:', { data: error }, 'index');
      throw error;
    }
  },

  /**
   * Get active contractors for dropdowns
   */
  async getActiveContractors(): Promise<Array<{id: string, label: string}>> {
    try {
      const response = await contractorsApi.getContractors({ 
        status: 'active',
        isActive: true 
      });
      return (response.data || []).map((contractor: Contractor) => ({
        id: contractor.id,
        label: contractor.companyName
      }));
    } catch (error) {
      log.error('Error fetching active contractors:', { data: error }, 'index');
      throw error;
    }
  },

  /**
   * Get contractor summary statistics
   */
  async getContractorSummary(): Promise<ContractorAnalytics> {
    try {
      const response = await contractorsApi.getOverallAnalytics();
      return response.data;
    } catch (error) {
      log.error('Error fetching contractor summary:', { data: error }, 'index');
      throw error;
    }
  },

  /**
   * Search contractors by company name
   */
  async searchByName(query: string): Promise<Contractor[]> {
    try {
      const response = await contractorsApi.searchContractors({
        searchTerm: query,
        page: 1,
        limit: 50
      });
      return response.data || [];
    } catch (error) {
      log.error('Error searching contractors:', { data: error }, 'index');
      throw error;
    }
  }
};

// Re-export the same functions for compatibility
export const createContractor = contractorNeonService.create;
export const updateContractor = contractorNeonService.update;
export const deleteContractor = contractorNeonService.delete;

// Export helper function for mapping to dropdown options
export function mapToDropdownOption(contractor: Contractor): { id: string; label: string } {
  return {
    id: contractor.id,
    label: contractor.companyName
  };
}

// Export helper function for mapping contractors
export function mapToContractor(data: any): Contractor {
  return data as Contractor;
}

export function mapToContractors(data: any[]): Contractor[] {
  return data as Contractor[];
}