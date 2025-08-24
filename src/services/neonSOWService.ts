/**
 * Neon SOW Service - Legacy Compatibility Layer
 * 
 * @deprecated This file has been split into modular components for better maintainability.
 * 
 * New modular structure:
 * - types.ts: Type definitions and interfaces
 * - schema.ts: Database schema management and table creation
 * - dataOperations.ts: CRUD operations for poles, drops, and fibre data
 * - summaryService.ts: Project summary calculations and updates
 * - queryService.ts: Data retrieval and querying operations
 * - healthService.ts: Database health checks and connection monitoring
 * - neonSOWService.ts: Main service orchestrator
 * 
 * For new code, import from the modular structure:
 * ```typescript
 * import { NeonSOWService, SOWSchemaService, SOWDataOperationsService } from '@/services/sow';
 * // or
 * import SOWServices from '@/services/sow';
 * ```
 * 
 * This legacy layer maintains backward compatibility while the codebase transitions.
 */

import { NeonSOWService as ModularSOWService } from './sow/neonSOWService';
import { NeonPoleData, NeonDropData, NeonFibreData } from './sow/types';

// Re-export types for backward compatibility
export type { NeonPoleData, NeonDropData, NeonFibreData };

/**
 * @deprecated Use the new modular NeonSOWService from '@/services/sow' instead
 * 
 * Legacy SOW service class that delegates to the new modular architecture
 */
export class NeonSOWService {
  private service = new ModularSOWService();

  /**
   * @deprecated Use SOWSchemaService.initializeTables() instead
   */
  async initializeTables(projectId: string) {
    return this.service.initializeTables(projectId);
  }

  /**
   * @deprecated Use SOWDataOperationsService.uploadPoles() instead
   */
  async uploadPoles(projectId: string, poles: NeonPoleData[]) {
    return this.service.uploadPoles(projectId, poles);
  }

  /**
   * @deprecated Use SOWDataOperationsService.uploadDrops() instead
   */
  async uploadDrops(projectId: string, drops: NeonDropData[]) {
    return this.service.uploadDrops(projectId, drops);
  }

  /**
   * @deprecated Use SOWDataOperationsService.uploadFibre() instead
   */
  async uploadFibre(projectId: string, fibres: NeonFibreData[]) {
    return this.service.uploadFibre(projectId, fibres);
  }

  /**
   * @deprecated Use SOWSummaryService.updateProjectSummary() instead
   */
  async updateProjectSummary(projectId: string) {
    // This method was part of the legacy class, delegate to summary service
    const { SOWSummaryService } = await import('./sow/summaryService');
    return SOWSummaryService.updateProjectSummary(projectId);
  }

  /**
   * @deprecated Use SOWQueryService.getProjectSOWData() instead
   */
  async getProjectSOWData(projectId: string) {
    return this.service.getProjectSOWData(projectId);
  }

  /**
   * @deprecated Use SOWHealthService.checkHealth() instead
   */
  async checkHealth() {
    return this.service.checkHealth();
  }
}

// Default export for backward compatibility
export const neonSOWService = new NeonSOWService();