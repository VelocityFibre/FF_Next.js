/**
 * Pole Tracker Service - Neon PostgreSQL
 * Handles all pole tracking operations using Neon database
 * For massive scale: 5,000 poles × 10 projects = 50,000+ poles
 */

import { neonService } from '@/services/neonService';
import { storage } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export interface NeonPole {
  id?: number;
  pole_number: string;
  project_id: string;
  project_code?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  phase?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'issue';
  drop_count?: number;
  max_drops?: number;
  installation_date?: Date | null;
  
  // Photo URLs stored in Firebase Storage
  photo_before?: string | null;
  photo_during?: string | null;
  photo_after?: string | null;
  photo_label?: string | null;
  photo_cable?: string | null;
  photo_quality?: string | null;
  
  // Quality checks
  quality_pole_condition?: boolean | null;
  quality_cable_routing?: boolean | null;
  quality_connector?: boolean | null;
  quality_labeling?: boolean | null;
  quality_grounding?: boolean | null;
  quality_height?: boolean | null;
  quality_tension?: boolean | null;
  quality_documentation?: boolean | null;
  
  // Metadata
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  sync_status?: 'synced' | 'pending' | 'error';
  last_sync?: Date;
}

export class PoleTrackerNeonService {
  /**
   * Get all poles for a project
   */
  async getPolesByProject(projectId: string): Promise<NeonPole[]> {
    const query = `
      SELECT 
        p.*,
        COUNT(d.id) as drop_count
      FROM sow_poles p
      LEFT JOIN sow_drops d ON p.pole_number = d.pole_number AND p.project_id = d.project_id
      WHERE p.project_id = $1
      GROUP BY p.id
      ORDER BY p.pole_number
    `;
    
    const result = await neonService.query<NeonPole>(query, [projectId]);
    
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error || 'Failed to fetch poles');
  }

  /**
   * Get a single pole by ID
   */
  async getPoleById(id: number): Promise<NeonPole | null> {
    const query = `
      SELECT 
        p.*,
        COUNT(d.id) as drop_count
      FROM sow_poles p
      LEFT JOIN sow_drops d ON p.pole_number = d.pole_number AND p.project_id = d.project_id
      WHERE p.id = $1
      GROUP BY p.id
    `;
    
    const result = await neonService.query<NeonPole>(query, [id]);
    
    if (result.success && result.data.length > 0) {
      return result.data[0];
    }
    return null;
  }

  /**
   * Search poles with filters
   */
  async searchPoles(filters: {
    projectId?: string;
    status?: string;
    phase?: string;
    search?: string;
  }): Promise<NeonPole[]> {
    let query = `
      SELECT 
        p.*,
        COUNT(d.id) as drop_count
      FROM sow_poles p
      LEFT JOIN sow_drops d ON p.pole_number = d.pole_number AND p.project_id = d.project_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (filters.projectId) {
      query += ` AND p.project_id = $${paramIndex++}`;
      params.push(filters.projectId);
    }
    
    if (filters.status) {
      query += ` AND p.status = $${paramIndex++}`;
      params.push(filters.status);
    }
    
    if (filters.phase) {
      query += ` AND p.phase = $${paramIndex++}`;
      params.push(filters.phase);
    }
    
    if (filters.search) {
      query += ` AND (p.pole_number ILIKE $${paramIndex} OR p.location ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }
    
    query += ` GROUP BY p.id ORDER BY p.pole_number`;
    
    const result = await neonService.query<NeonPole>(query, params);
    
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error || 'Failed to search poles');
  }

  /**
   * Update pole status
   */
  async updatePoleStatus(id: number, status: string): Promise<void> {
    const query = `
      UPDATE sow_poles 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
    `;
    
    const result = await neonService.execute(query, [status, id]);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update pole status');
    }
  }

  /**
   * Update pole quality checks
   */
  async updateQualityChecks(id: number, checks: Partial<NeonPole>): Promise<void> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    // Build dynamic update query
    if (checks.quality_pole_condition !== undefined) {
      updates.push(`quality_pole_condition = $${paramIndex++}`);
      params.push(checks.quality_pole_condition);
    }
    if (checks.quality_cable_routing !== undefined) {
      updates.push(`quality_cable_routing = $${paramIndex++}`);
      params.push(checks.quality_cable_routing);
    }
    if (checks.quality_connector !== undefined) {
      updates.push(`quality_connector = $${paramIndex++}`);
      params.push(checks.quality_connector);
    }
    if (checks.quality_labeling !== undefined) {
      updates.push(`quality_labeling = $${paramIndex++}`);
      params.push(checks.quality_labeling);
    }
    if (checks.quality_grounding !== undefined) {
      updates.push(`quality_grounding = $${paramIndex++}`);
      params.push(checks.quality_grounding);
    }
    if (checks.quality_height !== undefined) {
      updates.push(`quality_height = $${paramIndex++}`);
      params.push(checks.quality_height);
    }
    if (checks.quality_tension !== undefined) {
      updates.push(`quality_tension = $${paramIndex++}`);
      params.push(checks.quality_tension);
    }
    if (checks.quality_documentation !== undefined) {
      updates.push(`quality_documentation = $${paramIndex++}`);
      params.push(checks.quality_documentation);
    }
    
    if (updates.length === 0) return;
    
    updates.push(`updated_at = NOW()`);
    params.push(id);
    
    const query = `
      UPDATE sow_poles 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
    `;
    
    const result = await neonService.execute(query, params);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update quality checks');
    }
  }

  /**
   * Upload photo to Firebase Storage and update pole record
   */
  async uploadPolePhoto(
    poleId: number, 
    photoType: 'before' | 'during' | 'after' | 'label' | 'cable' | 'quality',
    file: File
  ): Promise<string> {
    // Upload to Firebase Storage
    const fileName = `poles/${poleId}/${photoType}_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update pole record with photo URL
    const columnName = `photo_${photoType}`;
    const query = `
      UPDATE sow_poles 
      SET ${columnName} = $1, updated_at = NOW()
      WHERE id = $2
    `;
    
    const result = await neonService.execute(query, [downloadURL, poleId]);
    
    if (!result.success) {
      // Clean up uploaded file if database update fails
      await deleteObject(storageRef);
      throw new Error(result.error || 'Failed to update photo URL');
    }
    
    return downloadURL;
  }

  /**
   * Get statistics for a project
   */
  async getProjectStatistics(projectId: string) {
    const query = `
      SELECT 
        COUNT(*) as total_poles,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_poles,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_poles,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_poles,
        COUNT(CASE WHEN status = 'issue' THEN 1 END) as issue_poles,
        AVG(CASE 
          WHEN quality_pole_condition IS NOT NULL THEN 
            (quality_pole_condition::int + 
             COALESCE(quality_cable_routing::int, 0) +
             COALESCE(quality_connector::int, 0) +
             COALESCE(quality_labeling::int, 0) +
             COALESCE(quality_grounding::int, 0) +
             COALESCE(quality_height::int, 0) +
             COALESCE(quality_tension::int, 0) +
             COALESCE(quality_documentation::int, 0)) * 100.0 / 8
          ELSE NULL 
        END) as average_quality_score
      FROM sow_poles
      WHERE project_id = $1
    `;
    
    const result = await neonService.query(query, [projectId]);
    
    if (result.success && result.data.length > 0) {
      return result.data[0];
    }
    
    return {
      total_poles: 0,
      completed_poles: 0,
      in_progress_poles: 0,
      pending_poles: 0,
      issue_poles: 0,
      average_quality_score: 0
    };
  }

  /**
   * Bulk import poles from CSV data
   */
  async bulkImportPoles(projectId: string, poles: any[]): Promise<number> {
    // Prepare bulk insert query
    const values = poles.map((_pole, index) => {
      const offset = index * 4;
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
    }).join(', ');
    
    const query = `
      INSERT INTO sow_poles (pole_number, project_id, location, status)
      VALUES ${values}
      ON CONFLICT (pole_number, project_id) DO UPDATE
      SET location = EXCLUDED.location,
          updated_at = NOW()
    `;
    
    // Flatten parameters
    const params = poles.flatMap(pole => [
      pole.pole_number,
      projectId,
      pole.location || '',
      'pending'
    ]);
    
    const result = await neonService.execute(query, params);
    
    if (result.success) {
      return poles.length;
    }
    
    throw new Error(result.error || 'Failed to import poles');
  }
}

// Export singleton instance
export const poleTrackerNeonService = new PoleTrackerNeonService();

// For backwards compatibility with existing hooks
export const poleTrackerService = {
  getAll: () => poleTrackerNeonService.searchPoles({}),
  getById: (id: string) => poleTrackerNeonService.getPoleById(parseInt(id)),
  getByProject: (projectId: string) => poleTrackerNeonService.getPolesByProject(projectId),
  create: async (_data: any) => {
    // This would need to be implemented based on your needs
    throw new Error('Create operation should use bulk import for Neon');
  },
  update: async (id: string, data: any) => {
    if (data.status) {
      await poleTrackerNeonService.updatePoleStatus(parseInt(id), data.status);
    }
    // Handle other updates as needed
  },
  delete: async (id: string) => {
    // Soft delete by updating status
    await poleTrackerNeonService.updatePoleStatus(parseInt(id), 'deleted');
  },
  getStatistics: (projectId: string) => poleTrackerNeonService.getProjectStatistics(projectId),
  getPendingSync: async (projectId: string) => {
    // Return poles that need syncing
    const result = await neonService.query(
      'SELECT * FROM sow_poles WHERE project_id = $1 AND sync_status = $2',
      [projectId, 'pending']
    );
    return result.success ? result.data : [];
  }
};