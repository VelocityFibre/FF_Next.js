/**
 * SOW Data Operations Service
 * Routes all database operations through API endpoints
 */

import { sowApi } from '@/services/api/sowApi';
import { NeonPoleData, NeonDropData, NeonFibreData, SOWOperationResult } from './types';
import { log } from '@/lib/logger';

/**
 * SOW data operations service
 */
export class SOWDataOperationsService {
  /**
   * Upload poles data via API
   */
  static async uploadPoles(projectId: string, poles: NeonPoleData[]): Promise<SOWOperationResult> {
    try {
      const result = await sowApi.uploadPoles(projectId, poles);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to upload poles');
      }

      return { 
        success: true, 
        count: result.inserted || poles.length,
        message: result.message || `Successfully uploaded ${poles.length} poles` 
      };
    } catch (error) {
      log.error('Error uploading poles:', { data: error }, 'dataOperations');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload poles',
        count: 0
      };
    }
  }

  /**
   * Upload drops data via API
   */
  static async uploadDrops(projectId: string, drops: NeonDropData[]): Promise<SOWOperationResult> {
    try {
      const result = await sowApi.uploadDrops(projectId, drops);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to upload drops');
      }

      return { 
        success: true, 
        count: result.inserted || drops.length,
        message: result.message || `Successfully uploaded ${drops.length} drops` 
      };
    } catch (error) {
      log.error('Error uploading drops:', { data: error }, 'dataOperations');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload drops',
        count: 0
      };
    }
  }

  /**
   * Upload fibre data via API
   */
  static async uploadFibre(projectId: string, fibres: NeonFibreData[]): Promise<SOWOperationResult> {
    try {
      const result = await sowApi.uploadFibre(projectId, fibres);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to upload fibre');
      }

      return { 
        success: true, 
        count: result.inserted || fibres.length,
        message: result.message || `Successfully uploaded ${fibres.length} fibre segments` 
      };
    } catch (error) {
      log.error('Error uploading fibre:', { data: error }, 'dataOperations');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload fibre',
        count: 0
      };
    }
  }
}