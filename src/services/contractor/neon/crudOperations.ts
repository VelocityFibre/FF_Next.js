/**
 * CRUD Operations for Contractor API
 * Updated to use API endpoints instead of direct database access
 */

import type { ContractorFormData, Contractor } from '@/types/contractor.types';
import { contractorsApi } from '@/services/api/contractorsApi';
import { log } from '@/lib/logger';

/**
 * Create new contractor via API
 */
export async function createContractor(data: ContractorFormData): Promise<Contractor> {
  try {
    const response = await contractorsApi.createContractor(data);
    return response.data;
  } catch (error) {
    log.error('Error creating contractor via API:', { data: error }, 'crudOperations');
    throw new Error('Failed to create contractor');
  }
}

/**
 * Update existing contractor via API
 */
export async function updateContractor(id: string, data: Partial<ContractorFormData>): Promise<Contractor> {
  try {
    const response = await contractorsApi.updateContractor(id, data);
    return response.data;
  } catch (error) {
    log.error('Error updating contractor via API:', { data: error }, 'crudOperations');
    throw new Error('Failed to update contractor');
  }
}

/**
 * Delete contractor via API (soft delete)
 */
export async function deleteContractor(id: string): Promise<void> {
  try {
    await contractorsApi.deleteContractor(id, false);
  } catch (error) {
    log.error('Error deleting contractor via API:', { data: error }, 'crudOperations');
    throw new Error('Failed to delete contractor');
  }
}

/**
 * Hard delete contractor via API
 */
export async function hardDeleteContractor(id: string): Promise<void> {
  try {
    await contractorsApi.deleteContractor(id, true);
  } catch (error) {
    log.error('Error hard deleting contractor via API:', { data: error }, 'crudOperations');
    throw new Error('Failed to permanently delete contractor');
  }
}

/**
 * Update contractor status via API
 */
export async function updateContractorStatus(id: string, status: string): Promise<void> {
  try {
    await contractorsApi.updateContractor(id, { status });
  } catch (error) {
    log.error('Error updating contractor status:', { data: error }, 'crudOperations');
    throw new Error('Failed to update contractor status');
  }
}

/**
 * Update contractor compliance status via API
 */
export async function updateContractorCompliance(id: string, complianceStatus: string): Promise<void> {
  try {
    await contractorsApi.updateContractor(id, { complianceStatus });
  } catch (error) {
    log.error('Error updating contractor compliance:', { data: error }, 'crudOperations');
    throw new Error('Failed to update contractor compliance');
  }
}

/**
 * Update contractor RAG scores via API
 */
export async function updateContractorRAG(id: string, ragScores: {
  ragOverall?: string;
  ragFinancial?: string;
  ragCompliance?: string;
  ragPerformance?: string;
  ragSafety?: string;
}): Promise<void> {
  try {
    // Use the RAG API for proper score updates with history tracking
    for (const [key, value] of Object.entries(ragScores)) {
      if (value) {
        const scoreType = key.replace('rag', '').toLowerCase();
        await contractorsApi.updateRAGScore(id, {
          scoreType,
          newScore: value,
          reason: 'Manual update'
        });
      }
    }
  } catch (error) {
    log.error('Error updating contractor RAG scores:', { data: error }, 'crudOperations');
    throw new Error('Failed to update contractor RAG scores');
  }
}

/**
 * Update contractor project statistics via API
 */
export async function updateContractorProjectStats(id: string, stats: {
  totalProjects?: number;
  completedProjects?: number;
  activeProjects?: number;
  cancelledProjects?: number;
}): Promise<void> {
  try {
    await contractorsApi.updateContractor(id, stats);
  } catch (error) {
    log.error('Error updating contractor project stats:', { data: error }, 'crudOperations');
    throw new Error('Failed to update contractor project statistics');
  }
}