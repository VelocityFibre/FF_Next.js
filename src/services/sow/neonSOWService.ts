/**
 * Neon SOW Service - Main Orchestrator
 * Combines all SOW services into a unified interface
 */

import { SOWSchemaService } from './schema';
import { SOWDataOperationsService } from './dataOperations';
import { SOWQueryService } from './queryService';
import { SOWHealthService } from './healthService';
import { NeonPoleData, NeonDropData, NeonFibreData, SOWOperationResult } from './types';

/**
 * Main Neon SOW Service class
 * Provides a unified interface for all SOW operations
 */
export class NeonSOWService {
  /**
   * Initialize database tables for a project
   */
  async initializeTables(projectId: string): Promise<{ success: boolean }> {
    return SOWSchemaService.initializeTables(projectId);
  }

  /**
   * Upload poles data to Neon database
   */
  async uploadPoles(projectId: string, poles: NeonPoleData[]): Promise<SOWOperationResult> {
    return SOWDataOperationsService.uploadPoles(projectId, poles);
  }

  /**
   * Upload drops data to Neon database
   */
  async uploadDrops(projectId: string, drops: NeonDropData[]): Promise<SOWOperationResult> {
    return SOWDataOperationsService.uploadDrops(projectId, drops);
  }

  /**
   * Upload fibre data to Neon database
   */
  async uploadFibre(projectId: string, fibres: NeonFibreData[]): Promise<SOWOperationResult> {
    return SOWDataOperationsService.uploadFibre(projectId, fibres);
  }

  /**
   * Get all project SOW data from Neon database
   */
  async getProjectSOWData(projectId: string): Promise<SOWOperationResult> {
    return SOWQueryService.getProjectSOWData(projectId);
  }

  /**
   * Get poles data for a project
   */
  async getProjectPoles(projectId: string) {
    return SOWQueryService.getProjectPoles(projectId);
  }

  /**
   * Get drops data for a project
   */
  async getProjectDrops(projectId: string) {
    return SOWQueryService.getProjectDrops(projectId);
  }

  /**
   * Get fibre data for a project
   */
  async getProjectFibre(projectId: string) {
    return SOWQueryService.getProjectFibre(projectId);
  }

  /**
   * Search poles by criteria
   */
  async searchPoles(projectId: string, searchTerm: string) {
    return SOWQueryService.searchPoles(projectId, searchTerm);
  }

  /**
   * Search drops by criteria
   */
  async searchDrops(projectId: string, searchTerm: string) {
    return SOWQueryService.searchDrops(projectId, searchTerm);
  }

  /**
   * Check Neon database connection health
   */
  async checkHealth() {
    return SOWHealthService.checkHealth();
  }

  /**
   * Check if project tables exist
   */
  async checkProjectTables(projectId: string) {
    return SOWHealthService.checkProjectTables(projectId);
  }

  /**
   * Get database statistics for a project
   */
  async getProjectStats(projectId: string) {
    return SOWHealthService.getProjectStats(projectId);
  }
}