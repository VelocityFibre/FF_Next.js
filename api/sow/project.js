import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { projectId } = req.query;
  
  if (!projectId) {
    return res.status(400).json({ success: false, error: 'Project ID required' });
  }

  try {
    // Get all SOW data in parallel
    const [poles, drops, fibre, summary, polesWithDropCount, sowStats] = await Promise.all([
      // Get poles
      sql`
        SELECT * FROM sow_poles 
        WHERE project_id = ${projectId}::uuid 
        ORDER BY pole_number
      `,
      
      // Get drops
      sql`
        SELECT * FROM sow_drops 
        WHERE project_id = ${projectId}::uuid 
        ORDER BY drop_number
      `,
      
      // Get fibre
      sql`
        SELECT * FROM sow_fibre 
        WHERE project_id = ${projectId}::uuid 
        ORDER BY segment_id
      `,
      
      // Get project summary
      sql`
        SELECT * FROM sow_project_summary 
        WHERE project_id = ${projectId}::uuid
      `,
      
      // Get poles with drop count
      sql`
        SELECT 
          p.*,
          COUNT(d.id) as connected_drops,
          ARRAY_AGG(d.drop_number) FILTER (WHERE d.drop_number IS NOT NULL) as drop_numbers
        FROM sow_poles p
        LEFT JOIN sow_drops d ON p.pole_number = d.pole_number AND p.project_id = d.project_id
        WHERE p.project_id = ${projectId}::uuid
        GROUP BY p.id
        ORDER BY p.pole_number
      `,
      
      // Get detailed SOW statistics
      sql`
        SELECT 
          'poles' as type,
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
        FROM sow_poles WHERE project_id = ${projectId}::uuid
        UNION ALL
        SELECT 
          'drops' as type,
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'planned' THEN 1 END) as planned,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
        FROM sow_drops WHERE project_id = ${projectId}::uuid
        UNION ALL
        SELECT 
          'fibre' as type,
          COUNT(*) as total,
          COALESCE(SUM(distance), 0) as total_distance,
          COUNT(CASE WHEN is_complete = true THEN 1 END) as completed,
          COALESCE(SUM(CASE WHEN is_complete = true THEN distance END), 0) as completed_distance
        FROM sow_fibre WHERE project_id = ${projectId}::uuid
      `
    ]);

    // Transform stats into a more usable format
    const statsMap = {};
    sowStats.forEach(stat => {
      statsMap[stat.type] = stat;
    });

    // Calculate additional analytics
    const analytics = {
      poles: {
        total: poles.length,
        byStatus: {
          pending: poles.filter(p => p.status === 'pending').length,
          approved: poles.filter(p => p.status === 'approved').length,
          rejected: poles.filter(p => p.status === 'rejected').length
        },
        byOwner: poles.reduce((acc, pole) => {
          if (pole.owner) {
            acc[pole.owner] = (acc[pole.owner] || 0) + 1;
          }
          return acc;
        }, {}),
        byMunicipality: poles.reduce((acc, pole) => {
          if (pole.municipality) {
            acc[pole.municipality] = (acc[pole.municipality] || 0) + 1;
          }
          return acc;
        }, {})
      },
      drops: {
        total: drops.length,
        byStatus: {
          planned: drops.filter(d => d.status === 'planned').length,
          active: drops.filter(d => d.status === 'active').length,
          completed: drops.filter(d => d.status === 'completed').length
        },
        byCableType: drops.reduce((acc, drop) => {
          if (drop.cable_type) {
            acc[drop.cable_type] = (acc[drop.cable_type] || 0) + 1;
          }
          return acc;
        }, {}),
        withoutPole: drops.filter(d => !d.pole_number).length
      },
      fibre: {
        total: fibre.length,
        totalDistance: fibre.reduce((sum, f) => sum + (parseFloat(f.distance) || 0), 0),
        completed: fibre.filter(f => f.is_complete).length,
        completedDistance: fibre.filter(f => f.is_complete).reduce((sum, f) => sum + (parseFloat(f.distance) || 0), 0),
        byContractor: fibre.reduce((acc, segment) => {
          if (segment.contractor) {
            acc[segment.contractor] = (acc[segment.contractor] || 0) + 1;
          }
          return acc;
        }, {}),
        byLayer: fibre.reduce((acc, segment) => {
          if (segment.layer) {
            acc[segment.layer] = (acc[segment.layer] || 0) + 1;
          }
          return acc;
        }, {})
      }
    };

    res.status(200).json({ 
      success: true, 
      data: {
        poles: poles,
        drops: drops,
        fibre: fibre,
        summary: summary[0] || {
          project_id: projectId,
          total_poles: poles.length,
          total_drops: drops.length,
          total_fibre_segments: fibre.length,
          total_fibre_length: analytics.fibre.totalDistance
        },
        polesWithDropCount: polesWithDropCount,
        stats: statsMap,
        analytics: analytics
      }
    });
  } catch (error) {
    console.error('Error fetching SOW data:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Failed to retrieve SOW data for project'
    });
  }
}