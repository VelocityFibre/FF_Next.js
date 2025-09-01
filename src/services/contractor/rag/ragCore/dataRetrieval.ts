/**
 * Data Retrieval Module
 * Updated to use API endpoints instead of direct database queries
 */

import { contractorsApi } from '@/services/api/contractorsApi';
import { log } from '@/lib/logger';
import {
  ContractorAssignment,
  ContractorTeam
} from '../types';

export class DataRetrieval {
  /**
   * Get contractor data for RAG calculation via API
   */
  static async getContractorData(contractorId: string): Promise<{
    contractor: any;
    assignments: ContractorAssignment[];
    teams: ContractorTeam[];
  }> {
    try {
      // Get contractor details with analytics
      const contractorResponse = await contractorsApi.getContractor(contractorId);
      const contractor = contractorResponse.data;

      if (!contractor) {
        throw new Error('Contractor not found');
      }

      // Get analytics which includes project data
      const analyticsResponse = await contractorsApi.getContractorAnalytics(contractorId);
      const analytics = analyticsResponse.data?.analytics;

      // Map project data to assignments format
      const assignments: ContractorAssignment[] = [];
      // Note: The API doesn't return individual assignments, so we'll use aggregated data
      if (analytics?.projects) {
        const mockAssignment: ContractorAssignment = {
          id: 'aggregate',
          contractorId: contractorId,
          status: 'active',
          qualityScore: 80, // Default scores since API doesn't provide individual scores
          timelinessScore: 75,
          performanceRating: 4,
          contractValue: analytics.projects.total_project_value || 0
        };
        assignments.push(mockAssignment);
      }

      // Get teams from contractor data
      const teams: ContractorTeam[] = (contractor.teams || []).map((team: any) => ({
        id: team.id,
        contractorId: contractorId,
        teamType: team.type || team.name || '',
        skillLevel: 'intermediate' as 'junior' | 'intermediate' | 'senior' | 'expert'
      }));

      return { contractor, assignments, teams };
    } catch (error) {
      log.error('Failed to get contractor data:', { data: error }, 'dataRetrieval');
      throw error;
    }
  }

  /**
   * Get contractor assignments for RAG calculation via API
   */
  static async getContractorAssignments(contractorId: string): Promise<ContractorAssignment[]> {
    try {
      // The API doesn't have a direct assignments endpoint, so we get this from analytics
      const analyticsResponse = await contractorsApi.getContractorAnalytics(contractorId);
      const analytics = analyticsResponse.data?.analytics;

      // Create synthetic assignments based on analytics data
      const assignments: ContractorAssignment[] = [];
      
      if (analytics?.projects && analytics.projects.total_projects > 0) {
        // Create one assignment representing aggregate data
        assignments.push({
          id: 'aggregate',
          contractorId: contractorId,
          status: 'active',
          qualityScore: 80,
          timelinessScore: analytics.projects.avg_days_overdue > 0 ? 60 : 90,
          performanceRating: analytics.projects.avg_completion || 75,
          contractValue: analytics.projects.total_project_value || 0
        });
      }

      return assignments;
    } catch (error) {
      log.error('Failed to get contractor assignments:', { data: error }, 'dataRetrieval');
      return [];
    }
  }

  /**
   * Get contractor teams for RAG calculation via API
   */
  static async getContractorTeams(contractorId: string): Promise<ContractorTeam[]> {
    try {
      const response = await contractorsApi.getContractorTeams(contractorId);
      const teams = response.data?.assigned || [];

      // Map to our internal interface
      return teams.map((team: any) => ({
        id: team.id,
        contractorId: contractorId,
        teamType: team.type || team.name || '',
        skillLevel: 'intermediate' as 'junior' | 'intermediate' | 'senior' | 'expert'
      }));
    } catch (error) {
      log.error('Failed to get contractor teams:', { data: error }, 'dataRetrieval');
      return [];
    }
  }

  /**
   * Get list of contractors for ranking via API
   */
  static async getContractorsList(limit: number = 50): Promise<Array<{ id: string; companyName: string }>> {
    try {
      const response = await contractorsApi.getContractors({ isActive: true });
      const contractors = response.data || [];
      
      return contractors
        .slice(0, limit)
        .map((c: any) => ({
          id: c.id,
          companyName: c.companyName
        }));
    } catch (error) {
      log.error('Failed to get contractors list:', { data: error }, 'dataRetrieval');
      return [];
    }
  }

  /**
   * Get multiple contractor data in batches via API
   */
  static async getBatchContractorData(
    contractorIds: string[],
    batchSize: number = 5
  ): Promise<Array<{
    contractorId: string;
    data: {
      contractor: any;
      assignments: ContractorAssignment[];
      teams: ContractorTeam[];
    } | null;
  }>> {
    const results: Array<{
      contractorId: string;
      data: {
        contractor: any;
        assignments: ContractorAssignment[];
        teams: ContractorTeam[];
      } | null;
    }> = [];

    // Process contractors in batches to avoid overwhelming the API
    for (let i = 0; i < contractorIds.length; i += batchSize) {
      const batch = contractorIds.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (contractorId) => {
        try {
          const data = await this.getContractorData(contractorId);
          return { contractorId, data };
        } catch (error) {
          log.error(`Failed to get data for contractor ${contractorId}:`, { data: error }, 'dataRetrieval');
          return { contractorId, data: null };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Check if contractor exists via API
   */
  static async contractorExists(contractorId: string): Promise<boolean> {
    try {
      const response = await contractorsApi.getContractor(contractorId);
      return !!response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      log.error('Failed to check contractor existence:', { data: error }, 'dataRetrieval');
      return false;
    }
  }
}