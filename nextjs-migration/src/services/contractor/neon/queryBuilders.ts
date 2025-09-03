/**
 * Query Builders for Contractor API
 * Updated to use API endpoints instead of direct database queries
 */

import { contractorsApi } from '@/services/api/contractorsApi';
import type { ContractorFilter } from '@/types/contractor.types';
import { log } from '@/lib/logger';

/**
 * Query contractors with filters via API
 */
export async function queryContractorsWithFilters(filter?: ContractorFilter): Promise<any[]> {
  try {
    const response = await contractorsApi.getContractors(filter);
    return response.data || [];
  } catch (error) {
    log.error('Error querying contractors with filters:', { data: error }, 'queryBuilders');
    throw error;
  }
}

/**
 * Query contractor by ID via API
 */
export async function queryContractorById(id: string): Promise<any[]> {
  try {
    const response = await contractorsApi.getContractor(id);
    return response.data ? [response.data] : [];
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    log.error('Error querying contractor by ID:', { data: error }, 'queryBuilders');
    throw error;
  }
}

/**
 * Query active contractors via API
 */
export async function queryActiveContractors(): Promise<any[]> {
  try {
    const response = await contractorsApi.getContractors({
      status: 'active',
      isActive: true
    });
    return response.data || [];
  } catch (error) {
    log.error('Error querying active contractors:', { data: error }, 'queryBuilders');
    throw error;
  }
}

/**
 * Query contractors by team via API
 */
export async function queryContractorsByTeam(teamId: string): Promise<any[]> {
  try {
    const response = await contractorsApi.getContractors({ teamId });
    return response.data || [];
  } catch (error) {
    log.error('Error querying contractors by team:', { data: error }, 'queryBuilders');
    throw error;
  }
}

/**
 * Search contractors via API
 */
export async function searchContractors(searchTerm: string): Promise<any[]> {
  try {
    const response = await contractorsApi.searchContractors({
      searchTerm,
      page: 1,
      limit: 100
    });
    return response.data || [];
  } catch (error) {
    log.error('Error searching contractors:', { data: error }, 'queryBuilders');
    throw error;
  }
}

/**
 * Query contractors by RAG status via API
 */
export async function queryContractorsByRAG(ragStatus: string): Promise<any[]> {
  try {
    const response = await contractorsApi.getContractors({ ragOverall: ragStatus });
    return response.data || [];
  } catch (error) {
    log.error('Error querying contractors by RAG:', { data: error }, 'queryBuilders');
    throw error;
  }
}

/**
 * Query contractors by compliance status via API
 */
export async function queryContractorsByCompliance(complianceStatus: string): Promise<any[]> {
  try {
    const response = await contractorsApi.getContractors({ complianceStatus });
    return response.data || [];
  } catch (error) {
    log.error('Error querying contractors by compliance:', { data: error }, 'queryBuilders');
    throw error;
  }
}