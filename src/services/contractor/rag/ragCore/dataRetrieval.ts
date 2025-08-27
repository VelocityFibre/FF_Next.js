/**
 * Data Retrieval Module
 * Handles database queries for RAG calculations
 */

import { db } from '@/lib/neon/connection';
import { contractors, projectAssignments, contractorTeams } from '@/lib/neon/schema';
import { eq } from 'drizzle-orm';
import { log } from '@/lib/logger';
import {
  ContractorAssignment,
  ContractorTeam
} from '../types';

export class DataRetrieval {
  /**
   * Get contractor data for RAG calculation
   */
  static async getContractorData(contractorId: string): Promise<{
    contractor: any;
    assignments: ContractorAssignment[];
    teams: ContractorTeam[];
  }> {
    const [contractor] = await db
      .select()
      .from(contractors)
      .where(eq(contractors.id, contractorId))
      .limit(1);

    if (!contractor) {
      throw new Error('Contractor not found');
    }

    const [assignments, teams] = await Promise.all([
      this.getContractorAssignments(contractorId),
      this.getContractorTeams(contractorId)
    ]);

    return { contractor, assignments, teams };
  }

  /**
   * Get contractor assignments for RAG calculation
   */
  static async getContractorAssignments(contractorId: string): Promise<ContractorAssignment[]> {
    try {
      const assignments = await db
        .select()
        .from(projectAssignments)
        .where(eq(projectAssignments.contractorId, contractorId));

      // Map to our internal interface
      return assignments.map(assignment => ({
        id: assignment.id,
        contractorId: assignment.contractorId,
        status: assignment.status,
        qualityScore: Number(assignment.qualityScore || 0),
        timelinessScore: Number(assignment.timelinessScore || 0),
        performanceRating: Number(assignment.performanceRating || 0),
        contractValue: Number(assignment.contractValue || 0)
      }));
    } catch (error) {
      log.error('Failed to get contractor assignments:', { data: error }, 'dataRetrieval');
      return [];
    }
  }

  /**
   * Get contractor teams for RAG calculation
   */
  static async getContractorTeams(contractorId: string): Promise<ContractorTeam[]> {
    try {
      const teams = await db
        .select()
        .from(contractorTeams)
        .where(eq(contractorTeams.contractorId, contractorId));

      // Map to our internal interface
      return teams.map(team => ({
        id: team.id,
        contractorId: team.contractorId,
        teamType: team.teamType || '',
        skillLevel: 'intermediate' as 'junior' | 'intermediate' | 'senior' | 'expert'
      }));
    } catch (error) {
      log.error('Failed to get contractor teams:', { data: error }, 'dataRetrieval');
      return [];
    }
  }

  /**
   * Get list of contractors for ranking
   */
  static async getContractorsList(limit: number = 50): Promise<Array<{ id: string; companyName: string }>> {
    return await db
      .select({
        id: contractors.id,
        companyName: contractors.companyName
      })
      .from(contractors)
      .limit(limit);
  }

  /**
   * Get multiple contractor data in batches
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

    // Process contractors in batches
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
   * Check if contractor exists
   */
  static async contractorExists(contractorId: string): Promise<boolean> {
    const [contractor] = await db
      .select({ id: contractors.id })
      .from(contractors)
      .where(eq(contractors.id, contractorId))
      .limit(1);

    return !!contractor;
  }
}