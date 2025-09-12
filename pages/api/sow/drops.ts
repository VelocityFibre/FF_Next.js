import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '../../../lib/auth-mock';
import { neon } from '@neondatabase/serverless';

const getSql = () => neon(process.env.DATABASE_URL!);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const sql = getSql();

  // Handle GET request - fetch drops
  if (req.method === 'GET') {
    try {
      const { projectId } = req.query;
      
      let query;
      if (projectId) {
        query = await sql`
          SELECT * FROM sow_drops 
          WHERE project_id = ${projectId}
          ORDER BY created_at DESC
        `;
      } else {
        query = await sql`
          SELECT * FROM sow_drops 
          ORDER BY created_at DESC
          LIMIT 1000
        `;
      }
      
      return res.status(200).json({
        success: true,
        data: query,
        count: query.length
      });
    } catch (error) {
      console.error('Error fetching drops:', error);
      return res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch drops' 
      });
    }
  }

  // Handle POST request - upload drops
  if (req.method === 'POST') {
    try {
      const { projectId, drops } = req.body;

    if (!projectId || !drops || !Array.isArray(drops)) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: projectId or drops array' 
      });
    }

    const sql = getSql();
    
    // Ensure SOW tables exist
    await sql`
      CREATE TABLE IF NOT EXISTS sow_drops (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        project_id uuid NOT NULL,
        drop_number varchar(255) NOT NULL,
        pole_number varchar(255),
        cable_type varchar(100),
        cable_spec varchar(255),
        cable_length varchar(50),
        cable_capacity varchar(50),
        start_point varchar(255),
        end_point varchar(255),
        latitude numeric,
        longitude numeric,
        address text,
        pon_no integer,
        zone_no integer,
        municipality varchar(255),
        created_date timestamp,
        created_by varchar(255),
        raw_data jsonb,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, drop_number)
      )
    `;

    // Clear existing drops for this project
    await sql`DELETE FROM sow_drops WHERE project_id = ${projectId}`;

    // Insert drops
    const dropsData = drops.map(drop => ({
      project_id: projectId,
      drop_number: drop.drop_number,
      pole_number: drop.pole_number || null,
      cable_type: drop.cable_type || null,
      cable_spec: drop.cable_spec || null,
      cable_length: drop.cable_length || null,
      cable_capacity: drop.cable_capacity || null,
      start_point: drop.start_point || null,
      end_point: drop.end_point || null,
      latitude: drop.latitude || null,
      longitude: drop.longitude || null,
      address: drop.address || null,
      pon_no: drop.pon_no || null,
      zone_no: drop.zone_no || null,
      municipality: drop.municipality || null,
      created_date: drop.created_date || null,
      created_by: drop.created_by || null,
      raw_data: drop.raw_data || null
    }));

    // Insert in batches
    const batchSize = 100;
    let totalInserted = 0;
    
    for (let i = 0; i < dropsData.length; i += batchSize) {
      const batch = dropsData.slice(i, i + batchSize);
      await sql`INSERT INTO sow_drops ${sql(batch)}`;
      totalInserted += batch.length;
    }

    return res.status(200).json({
      success: true,
      message: `Successfully uploaded ${totalInserted} drops`,
      inserted: totalInserted,
      upserted: totalInserted
    });

  } catch (error) {
    console.error('Drops upload error:', error);
    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload drops data' 
    });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}