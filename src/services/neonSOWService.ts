import { createNeonClient } from '@/lib/neon-sql';

// Neon database connection
const { sql, query } = createNeonClient(import.meta.env.VITE_NEON_DATABASE_URL || '');

// Helper function to safely create table names
function getTableName(projectId: string, tableType: 'poles' | 'drops' | 'fibre') {
  const safeProjectId = projectId.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return `sow_${tableType}_${safeProjectId}`;
}

export interface NeonPoleData {
  pole_number: string;
  latitude: number | undefined;
  longitude: number | undefined;
  status: string;
  pole_type?: string | undefined;
  pole_spec?: string | undefined;
  height?: string | undefined;
  diameter?: string | undefined;
  owner?: string | undefined;
  pon_no?: number | undefined;
  zone_no?: number | undefined;
  address?: string | undefined;
  municipality?: string | undefined;
  created_date?: string | undefined;
  created_by?: string | undefined;
  comments?: string | undefined;
  raw_data?: any;
}

export interface NeonDropData {
  drop_number: string;
  pole_number: string;
  cable_type?: string | undefined;
  cable_spec?: string | undefined;
  cable_length?: string | undefined;
  cable_capacity?: string | undefined;
  start_point?: string | undefined;
  end_point?: string | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
  address?: string | undefined;
  pon_no?: number | undefined;
  zone_no?: number | undefined;
  municipality?: string | undefined;
  created_date?: string | undefined;
  created_by?: string | undefined;
  raw_data?: any;
}

export interface NeonFibreData {
  segment_id: string;
  cable_size: string;
  layer: string;
  length: number;
  pon_no?: number | undefined;
  zone_no?: number | undefined;
  string_completed?: number | undefined;
  date_completed?: string | undefined;
  contractor?: string | undefined;
  is_complete?: boolean | undefined;
  raw_data?: any;
}

export class NeonSOWService {
  // Initialize database tables if they don't exist
  async initializeTables(projectId: string) {
    try {
      const polesTable = getTableName(projectId, 'poles');
      const dropsTable = getTableName(projectId, 'drops');
      const fibreTable = getTableName(projectId, 'fibre');
      
      // Create poles table
      await query(`
        CREATE TABLE IF NOT EXISTS ${polesTable} (
          id SERIAL PRIMARY KEY,
          project_id VARCHAR(255) NOT NULL,
          pole_number VARCHAR(255) UNIQUE NOT NULL,
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          status VARCHAR(100),
          pole_type VARCHAR(100),
          pole_spec VARCHAR(255),
          height VARCHAR(50),
          diameter VARCHAR(50),
          owner VARCHAR(100),
          pon_no INTEGER,
          zone_no INTEGER,
          address TEXT,
          municipality VARCHAR(255),
          created_date TIMESTAMP,
          created_by VARCHAR(100),
          comments TEXT,
          raw_data JSONB,
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create drops table
      await query(`
        CREATE TABLE IF NOT EXISTS ${dropsTable} (
          id SERIAL PRIMARY KEY,
          project_id VARCHAR(255) NOT NULL,
          drop_number VARCHAR(255) UNIQUE NOT NULL,
          pole_number VARCHAR(255),
          cable_type VARCHAR(100),
          cable_spec VARCHAR(255),
          cable_length VARCHAR(50),
          cable_capacity VARCHAR(50),
          start_point VARCHAR(255),
          end_point VARCHAR(255),
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          address TEXT,
          pon_no INTEGER,
          zone_no INTEGER,
          municipality VARCHAR(255),
          created_date TIMESTAMP,
          created_by VARCHAR(100),
          raw_data JSONB,
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create fibre table
      await query(`
        CREATE TABLE IF NOT EXISTS ${fibreTable} (
          id SERIAL PRIMARY KEY,
          project_id VARCHAR(255) NOT NULL,
          segment_id VARCHAR(255) UNIQUE NOT NULL,
          cable_size VARCHAR(50),
          layer VARCHAR(100),
          length DECIMAL(10, 2),
          pon_no INTEGER,
          zone_no INTEGER,
          string_completed DECIMAL(10, 2),
          date_completed DATE,
          contractor VARCHAR(100),
          is_complete BOOLEAN,
          raw_data JSONB,
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create project summary table if not exists
      await query(`
        CREATE TABLE IF NOT EXISTS sow_project_summary (
          id SERIAL PRIMARY KEY,
          project_id VARCHAR(255) UNIQUE NOT NULL,
          project_name VARCHAR(255),
          total_poles INTEGER DEFAULT 0,
          total_drops INTEGER DEFAULT 0,
          total_fibre_segments INTEGER DEFAULT 0,
          total_fibre_length DECIMAL(12, 2) DEFAULT 0,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      return { success: true };
    } catch (error) {
      console.error('Error initializing Neon tables:', error);
      throw error;
    }
  }

  // Upload poles data to Neon
  async uploadPoles(projectId: string, poles: NeonPoleData[]) {
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
      await this.updateProjectSummary(projectId);

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

  // Upload drops data to Neon
  async uploadDrops(projectId: string, drops: NeonDropData[]) {
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
      await this.updateProjectSummary(projectId);

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

  // Upload fibre data to Neon
  async uploadFibre(projectId: string, fibres: NeonFibreData[]) {
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
      await this.updateProjectSummary(projectId);

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

  // Update project summary
  async updateProjectSummary(projectId: string) {
    try {
      const polesTable = getTableName(projectId, 'poles');
      const dropsTable = getTableName(projectId, 'drops');
      const fibreTable = getTableName(projectId, 'fibre');

      // Get counts
      const polesCount = await query(`SELECT COUNT(*) as count FROM ${polesTable}`);
      const dropsCount = await query(`SELECT COUNT(*) as count FROM ${dropsTable}`);
      const fibreCount = await query(`SELECT COUNT(*) as count, SUM(length) as total_length FROM ${fibreTable}`);

      // Update or insert summary
      await query(`
        INSERT INTO sow_project_summary (
          project_id, total_poles, total_drops, total_fibre_segments, total_fibre_length
        ) VALUES (
          $1, $2, $3, $4, $5
        )
        ON CONFLICT (project_id) DO UPDATE SET
          total_poles = EXCLUDED.total_poles,
          total_drops = EXCLUDED.total_drops,
          total_fibre_segments = EXCLUDED.total_fibre_segments,
          total_fibre_length = EXCLUDED.total_fibre_length,
          last_updated = CURRENT_TIMESTAMP
      `, [
        projectId, 
        polesCount[0].count, 
        dropsCount[0].count, 
        fibreCount[0].count,
        fibreCount[0].total_length || 0
      ]);

      return { success: true };
    } catch (error) {
      console.error('Error updating project summary:', error);
      // Non-critical error, don't throw
      return { success: false, error };
    }
  }

  // Get project SOW data from Neon
  async getProjectSOWData(projectId: string) {
    try {
      const polesTable = getTableName(projectId, 'poles');
      const dropsTable = getTableName(projectId, 'drops');
      const fibreTable = getTableName(projectId, 'fibre');

      const poles = await query(`SELECT * FROM ${polesTable} ORDER BY pole_number`);
      const drops = await query(`SELECT * FROM ${dropsTable} ORDER BY drop_number`);
      const fibre = await query(`SELECT * FROM ${fibreTable} ORDER BY segment_id`);
      const summary = await query(`SELECT * FROM sow_project_summary WHERE project_id = $1`, [projectId]);

      return {
        success: true,
        data: {
          poles,
          drops,
          fibre,
          summary: summary[0] || null
        }
      };
    } catch (error) {
      console.error('Error fetching SOW data from Neon:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: {
          poles: [],
          drops: [],
          fibre: [],
          summary: null
        }
      };
    }
  }

  // Check Neon connection health
  async checkHealth() {
    try {
      const result = await sql`SELECT NOW() as current_time`;
      return { 
        connected: true, 
        timestamp: result[0].current_time 
      };
    } catch (error) {
      console.error('Neon health check failed:', error);
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const neonSOWService = new NeonSOWService();