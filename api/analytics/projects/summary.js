import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { projectId } = req.query;

      let whereClause = `WHERE status NOT IN ('archived', 'cancelled', 'deleted')`;
      if (projectId) {
        whereClause += ` AND id = ${sql`${projectId}`}`;
      }

      // Get project overview
      const overview = await sql`
        SELECT 
          COUNT(*) as total_projects,
          COUNT(CASE WHEN status IN ('ACTIVE', 'active') THEN 1 END) as active_projects,
          COUNT(CASE WHEN status IN ('COMPLETED', 'completed') THEN 1 END) as completed_projects,
          COUNT(CASE WHEN status IN ('ACTIVE', 'active') AND end_date < CURRENT_DATE THEN 1 END) as delayed_projects,
          SUM(budget) as total_budget,
          SUM(actual_cost) as spent_budget,
          AVG(progress) as avg_completion
        FROM projects
        ${sql.unsafe(whereClause)}
      `;

      // Get project distribution by status
      const statusDistribution = await sql`
        SELECT 
          status,
          COUNT(*) as count,
          SUM(budget) as total_budget
        FROM projects
        ${sql.unsafe(whereClause)}
        GROUP BY status
      `;

      // Get project distribution by client
      const clientDistribution = await sql`
        SELECT 
          c.name as client_name,
          COUNT(p.id) as project_count,
          SUM(p.budget) as total_budget,
          AVG(p.progress) as avg_progress
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        ${sql.unsafe(whereClause.replace('WHERE', 'WHERE p.'))}
        GROUP BY c.id, c.name
        ORDER BY project_count DESC
        LIMIT 10
      `;

      // Get project timeline distribution
      const timelineDistribution = await sql`
        SELECT 
          CASE 
            WHEN end_date < CURRENT_DATE AND status NOT IN ('COMPLETED', 'completed') THEN 'overdue'
            WHEN end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
            WHEN end_date > CURRENT_DATE + INTERVAL '30 days' THEN 'future'
            ELSE 'on_track'
          END as timeline_status,
          COUNT(*) as count
        FROM projects
        ${sql.unsafe(whereClause)}
        AND status IN ('ACTIVE', 'active', 'IN_PROGRESS', 'in_progress')
        GROUP BY timeline_status
      `;

      const proj = overview[0];

      return res.status(200).json({
        success: true,
        data: {
          overview: {
            totalProjects: parseInt(proj.total_projects) || 0,
            activeProjects: parseInt(proj.active_projects) || 0,
            completedProjects: parseInt(proj.completed_projects) || 0,
            delayedProjects: parseInt(proj.delayed_projects) || 0,
            totalBudget: parseFloat(proj.total_budget) || 0,
            spentBudget: parseFloat(proj.spent_budget) || 0,
            avgCompletion: parseFloat(proj.avg_completion) || 0,
            totalValue: parseFloat(proj.total_budget) || 0,
            averageCompletionRate: parseFloat(proj.avg_completion) || 0
          },
          statusDistribution: statusDistribution.map(s => ({
            status: s.status,
            count: parseInt(s.count) || 0,
            totalBudget: parseFloat(s.total_budget) || 0
          })),
          clientDistribution: clientDistribution.map(c => ({
            clientName: c.client_name || 'No Client',
            projectCount: parseInt(c.project_count) || 0,
            totalBudget: parseFloat(c.total_budget) || 0,
            avgProgress: parseFloat(c.avg_progress) || 0
          })),
          timelineDistribution: timelineDistribution.reduce((acc, t) => {
            acc[t.timeline_status] = parseInt(t.count) || 0;
            return acc;
          }, { overdue: 0, due_soon: 0, on_track: 0, future: 0 }),
          timestamp: new Date().toISOString()
        }
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Project summary error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}