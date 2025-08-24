/**
 * SOW Data Operations Service
 * Handles CRUD operations for poles, drops, and fibre data
 */

import { createNeonClient } from '@/lib/neon-sql';
import { getTableName } from './schema';
import { NeonPoleData, NeonDropData, NeonFibreData, SOWOperationResult } from './types';
import { SOWSummaryService } from './summaryService';

const { sql, query } = createNeonClient(import.meta.env.VITE_NEON_DATABASE_URL || '');

/**
 * SOW data operations service
 */
export class SOWDataOperationsService {
  /**
   * Upload poles data to Neon database
   */
  static async uploadPoles(projectId: string, poles: NeonPoleData[]): Promise<SOWOperationResult> {
    const tableName = getTableName(projectId, 'poles');
    
    try {
      // Batch insert poles
      for (const pole of poles) {
        await query(`
          INSERT INTO ${tableName} (
            project_id, pole_number, latitude, longitude, status,
            pole_type, pole_spec, height, diameter, owner,
            pon_no, zone_no, address, municipality,
            created_date, created_by, comments, raw_data
          ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, $12, $13, $14,
            $15, $16, $17, $18
          )
          ON CONFLICT (pole_number) DO UPDATE SET
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            status = EXCLUDED.status,
            pole_type = EXCLUDED.pole_type,
            pole_spec = EXCLUDED.pole_spec,
            height = EXCLUDED.height,
            diameter = EXCLUDED.diameter,
            owner = EXCLUDED.owner,
            pon_no = EXCLUDED.pon_no,
            zone_no = EXCLUDED.zone_no,
            address = EXCLUDED.address,
            municipality = EXCLUDED.municipality,
            comments = EXCLUDED.comments,
            raw_data = EXCLUDED.raw_data,
            uploaded_at = CURRENT_TIMESTAMP
        `, [
          projectId, pole.pole_number, pole.latitude, pole.longitude, pole.status,
          pole.pole_type, pole.pole_spec, pole.height, pole.diameter, pole.owner,
          pole.pon_no, pole.zone_no, pole.address, pole.municipality,
          pole.created_date, pole.created_by, pole.comments, JSON.stringify(pole.raw_data)
        ]);
      }

      // Update project summary
      await SOWSummaryService.updateProjectSummary(projectId);

      return { 
        success: true, 
        count: poles.length,
        message: `Successfully uploaded ${poles.length} poles to Neon` 
      };
    } catch (error) {
      console.error('Error uploading poles to Neon:', error);
      throw error;
    }
  }

  /**
   * Upload drops data to Neon database
   */
  static async uploadDrops(projectId: string, drops: NeonDropData[]): Promise<SOWOperationResult> {
    const tableName = getTableName(projectId, 'drops');
    
    try {
      // Batch insert drops
      for (const drop of drops) {
        await query(`
          INSERT INTO ${tableName} (
            project_id, drop_number, pole_number, cable_type, cable_spec,
            cable_length, cable_capacity, start_point, end_point,
            latitude, longitude, address, pon_no, zone_no, municipality,
            created_date, created_by, raw_data
          ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9,
            $10, $11, $12, $13, $14, $15,
            $16, $17, $18
          )
          ON CONFLICT (drop_number) DO UPDATE SET
            pole_number = EXCLUDED.pole_number,
            cable_type = EXCLUDED.cable_type,
            cable_spec = EXCLUDED.cable_spec,
            cable_length = EXCLUDED.cable_length,
            cable_capacity = EXCLUDED.cable_capacity,
            start_point = EXCLUDED.start_point,
            end_point = EXCLUDED.end_point,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            address = EXCLUDED.address,
            pon_no = EXCLUDED.pon_no,
            zone_no = EXCLUDED.zone_no,
            municipality = EXCLUDED.municipality,
            raw_data = EXCLUDED.raw_data,
            uploaded_at = CURRENT_TIMESTAMP
        `, [
          projectId, drop.drop_number, drop.pole_number, drop.cable_type, drop.cable_spec,
          drop.cable_length, drop.cable_capacity, drop.start_point, drop.end_point,
          drop.latitude, drop.longitude, drop.address, drop.pon_no, drop.zone_no, drop.municipality,
          drop.created_date, drop.created_by, JSON.stringify(drop.raw_data)
        ]);
      }

      // Update project summary
      await SOWSummaryService.updateProjectSummary(projectId);

      return { 
        success: true, 
        count: drops.length,
        message: `Successfully uploaded ${drops.length} drops to Neon` 
      };
    } catch (error) {
      console.error('Error uploading drops to Neon:', error);
      throw error;
    }
  }

  /**
   * Upload fibre data to Neon database
   */
  static async uploadFibre(projectId: string, fibres: NeonFibreData[]): Promise<SOWOperationResult> {
    const tableName = getTableName(projectId, 'fibre');
    
    try {
      // Batch insert fibre segments
      for (const fibre of fibres) {
        await query(`
          INSERT INTO ${tableName} (
            project_id, segment_id, cable_size, layer, length,
            pon_no, zone_no, string_completed, date_completed,
            contractor, is_complete, raw_data
          ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9,
            $10, $11, $12
          )
          ON CONFLICT (segment_id) DO UPDATE SET
            cable_size = EXCLUDED.cable_size,
            layer = EXCLUDED.layer,
            length = EXCLUDED.length,
            pon_no = EXCLUDED.pon_no,
            zone_no = EXCLUDED.zone_no,
            string_completed = EXCLUDED.string_completed,
            date_completed = EXCLUDED.date_completed,
            contractor = EXCLUDED.contractor,
            is_complete = EXCLUDED.is_complete,
            raw_data = EXCLUDED.raw_data,
            uploaded_at = CURRENT_TIMESTAMP
        `, [
          projectId, fibre.segment_id, fibre.cable_size, fibre.layer, fibre.length,
          fibre.pon_no, fibre.zone_no, fibre.string_completed, fibre.date_completed,
          fibre.contractor, fibre.is_complete, JSON.stringify(fibre.raw_data)
        ]);
      }

      // Update project summary
      await SOWSummaryService.updateProjectSummary(projectId);

      return { 
        success: true, 
        count: fibres.length,
        message: `Successfully uploaded ${fibres.length} fibre segments to Neon` 
      };
    } catch (error) {
      console.error('Error uploading fibre to Neon:', error);
      throw error;
    }
  }
}