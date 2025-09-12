import type { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';
import { getAuth } from '../../../lib/auth-mock';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { projectId } = req.query;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        // Fetch fibre data from the database
        const fibreData = await sql`
          SELECT * FROM sow_fibre 
          WHERE project_id = ${projectId}
          ORDER BY from_pole, to_pole
        `;
        
        return res.status(200).json({
          success: true,
          data: fibreData
        });
      }

      case 'POST': {
        // Handle fibre data upload
        const { data } = req.body;
        
        if (!data || !Array.isArray(data)) {
          return res.status(400).json({ error: 'Invalid fibre data' });
        }

        // Clear existing data
        await sql`DELETE FROM sow_fibre WHERE project_id = ${projectId}`;

        // Insert new data
        for (const fibre of data) {
          await sql`
            INSERT INTO sow_fibre (
              project_id, from_pole, to_pole, cable_type,
              cable_size, length_m, route_type,
              installation_method, status, raw_data
            ) VALUES (
              ${projectId},
              ${fibre.from_pole},
              ${fibre.to_pole},
              ${fibre.cable_type || null},
              ${fibre.cable_size || null},
              ${fibre.length_m || null},
              ${fibre.route_type || null},
              ${fibre.installation_method || null},
              ${fibre.status || 'planned'},
              ${JSON.stringify(fibre)}
            )
          `;
        }

        return res.status(200).json({
          success: true,
          message: `Uploaded ${data.length} fibre segments`
        });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Fibre API error:', error);
    return res.status(500).json({
      error: 'Failed to process fibre data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}