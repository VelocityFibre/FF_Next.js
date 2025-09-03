import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

type SummarData = {
  success: boolean;
  data: any;
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SummarData>
) {
  // Check authentication
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });
  }

  try {
    const { projectId } = req.query;

    switch (req.method) {
      case 'GET':
        if (!projectId) {
          return res.status(400).json({ success: false, data: null, error: 'Project ID required' });
        }

        // Get summary data for a project
        const [polesCount, dropsCount, fibreCount, project] = await Promise.all([
          sql`SELECT COUNT(*) as count FROM sow_poles WHERE project_id = ${projectId}`,
          sql`SELECT COUNT(*) as count FROM sow_drops WHERE project_id = ${projectId}`,
          sql`SELECT COUNT(*) as count, SUM(length) as total_length FROM sow_fibre WHERE project_id = ${projectId}`,
          sql`SELECT project_name FROM projects WHERE id = ${projectId}`
        ]);

        const summary = {
          projectId,
          projectName: project[0]?.project_name || 'Unknown Project',
          poles: {
            total: parseInt(polesCount[0]?.count || '0')
          },
          drops: {
            total: parseInt(dropsCount[0]?.count || '0')
          },
          fibre: {
            totalCables: parseInt(fibreCount[0]?.count || '0'),
            totalLength: parseFloat(fibreCount[0]?.total_length || '0')
          },
          generatedAt: new Date().toISOString()
        };

        return res.status(200).json({ success: true, data: summary });

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ 
          success: false, 
          data: null, 
          message: `Method ${req.method} not allowed` 
        });
    }
  } catch (error: any) {
    console.error('Summary API Error:', error);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}