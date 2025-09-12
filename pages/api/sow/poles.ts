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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { projectId, poles } = req.body;

    if (!projectId || !poles || !Array.isArray(poles)) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: projectId or poles array' 
      });
    }

    if (poles.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'No poles data provided' 
      });
    }

    const sql = getSql();
    
    // Ensure SOW tables exist
    await sql`
      CREATE TABLE IF NOT EXISTS sow_poles (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        project_id uuid NOT NULL,
        pole_number varchar(255) NOT NULL,
        latitude numeric,
        longitude numeric,
        status varchar(50),
        pole_type varchar(100),
        pole_spec varchar(255),
        height varchar(50),
        diameter varchar(50),
        owner varchar(255),
        pon_no integer,
        zone_no integer,
        address text,
        municipality varchar(255),
        created_date timestamp,
        created_by varchar(255),
        comments text,
        raw_data jsonb,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, pole_number)
      )
    `;

    // Clear existing poles for this project
    await sql`DELETE FROM sow_poles WHERE project_id = ${projectId}`;

    // Prepare poles data for insertion
    const polesData = poles.map(pole => ({
      project_id: projectId,
      pole_number: pole.pole_number,
      latitude: pole.latitude || null,
      longitude: pole.longitude || null,
      status: pole.status || 'planned',
      pole_type: pole.pole_type || null,
      pole_spec: pole.pole_spec || null,
      height: pole.height || null,
      diameter: pole.diameter || null,
      owner: pole.owner || null,
      pon_no: pole.pon_no || null,
      zone_no: pole.zone_no || null,
      address: pole.address || null,
      municipality: pole.municipality || null,
      created_date: pole.created_date || null,
      created_by: pole.created_by || null,
      comments: pole.comments || null,
      raw_data: pole.raw_data || null,
      created_at: new Date(),
      updated_at: new Date()
    }));

    // Insert in batches of 100
    const batchSize = 100;
    let totalInserted = 0;
    
    for (let i = 0; i < polesData.length; i += batchSize) {
      const batch = polesData.slice(i, i + batchSize);
      
      // Insert each pole individually (Neon doesn't support bulk insert with sql())
      for (const pole of batch) {
        await sql`
          INSERT INTO sow_poles (
            project_id, pole_number, latitude, longitude, status,
            pole_type, pole_spec, height, diameter, owner,
            pon_no, zone_no, address, municipality,
            created_date, created_by, comments, raw_data,
            created_at, updated_at
          ) VALUES (
            ${pole.project_id},
            ${pole.pole_number},
            ${pole.latitude},
            ${pole.longitude},
            ${pole.status},
            ${pole.pole_type},
            ${pole.pole_spec},
            ${pole.height},
            ${pole.diameter},
            ${pole.owner},
            ${pole.pon_no},
            ${pole.zone_no},
            ${pole.address},
            ${pole.municipality},
            ${pole.created_date},
            ${pole.created_by},
            ${pole.comments},
            ${pole.raw_data},
            ${pole.created_at},
            ${pole.updated_at}
          )
          ON CONFLICT (project_id, pole_number) 
          DO UPDATE SET 
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
            created_date = EXCLUDED.created_date,
            created_by = EXCLUDED.created_by,
            comments = EXCLUDED.comments,
            raw_data = EXCLUDED.raw_data,
            updated_at = EXCLUDED.updated_at
        `;
      }
      
      totalInserted += batch.length;
    }

    console.log(`Successfully inserted ${totalInserted} poles for project ${projectId}`);

    return res.status(200).json({
      success: true,
      message: `Successfully uploaded ${totalInserted} poles`,
      inserted: totalInserted,
      updated: 0,
      upserted: totalInserted,
      projectId
    });

  } catch (error) {
    console.error('Poles upload error:', error);
    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload poles data' 
    });
  }
}