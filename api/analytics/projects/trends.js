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
      const { projectId, period = 'monthly', months = 12 } = req.query;
      
      const dateFrom = new Date();
      dateFrom.setMonth(dateFrom.getMonth() - parseInt(months));

      let dateFormat;
      switch (period) {
        case 'daily':
          dateFormat = 'YYYY-MM-DD';
          break;
        case 'weekly':
          dateFormat = 'YYYY-"W"IW';
          break;
        case 'monthly':
          dateFormat = 'YYYY-MM';
          break;
        case 'quarterly':
          dateFormat = 'YYYY-"Q"Q';
          break;
        default:
          dateFormat = 'YYYY-MM';
      }

      // Get project creation and completion trends
      const projectTrends = await sql`
        SELECT 
          TO_CHAR(created_at, ${dateFormat}) as period,
          COUNT(*) as new_projects,
          COUNT(CASE WHEN status IN ('COMPLETED', 'completed') THEN 1 END) as completed_projects,
          COUNT(CASE WHEN status IN ('ACTIVE', 'active') THEN 1 END) as active_projects,
          AVG(progress) as avg_progress,
          SUM(budget) as total_budget
        FROM projects
        WHERE created_at >= ${dateFrom.toISOString()}
        ${projectId ? sql`AND id = ${projectId}` : sql``}
        GROUP BY TO_CHAR(created_at, ${dateFormat})
        ORDER BY period
      `;

      // Get progress trends for active projects
      const progressTrends = await sql`
        SELECT 
          p.id,
          p.name,
          p.start_date,
          p.end_date,
          p.progress,
          p.status,
          EXTRACT(DAY FROM (CURRENT_DATE - p.start_date)) as days_elapsed,
          EXTRACT(DAY FROM (p.end_date - p.start_date)) as total_days,
          CASE 
            WHEN p.end_date IS NOT NULL AND p.start_date IS NOT NULL 
            THEN (EXTRACT(DAY FROM (CURRENT_DATE - p.start_date))::float / NULLIF(EXTRACT(DAY FROM (p.end_date - p.start_date)), 0)) * 100
            ELSE 0 
          END as expected_progress
        FROM projects p
        WHERE p.status IN ('ACTIVE', 'active', 'IN_PROGRESS', 'in_progress')
        ${projectId ? sql`AND p.id = ${projectId}` : sql``}
        ORDER BY p.created_at DESC
        LIMIT 20
      `;

      // Get budget utilization trends
      const budgetTrends = await sql`
        SELECT 
          TO_CHAR(created_at, ${dateFormat}) as period,
          AVG(CASE 
            WHEN budget > 0 AND actual_cost IS NOT NULL 
            THEN (actual_cost / budget) * 100
            ELSE NULL 
          END) as avg_utilization,
          SUM(budget) as total_budget,
          SUM(actual_cost) as total_spent
        FROM projects
        WHERE created_at >= ${dateFrom.toISOString()}
        AND budget > 0
        ${projectId ? sql`AND id = ${projectId}` : sql``}
        GROUP BY TO_CHAR(created_at, ${dateFormat})
        ORDER BY period
      `;

      // Get completion rate trends
      const completionTrends = await sql`
        WITH period_data AS (
          SELECT 
            TO_CHAR(created_at, ${dateFormat}) as period,
            COUNT(*) as total_projects
          FROM projects
          WHERE created_at >= ${dateFrom.toISOString()}
          ${projectId ? sql`AND id = ${projectId}` : sql``}
          GROUP BY TO_CHAR(created_at, ${dateFormat})
        ),
        completed_data AS (
          SELECT 
            TO_CHAR(updated_at, ${dateFormat}) as period,
            COUNT(*) as completed_projects
          FROM projects
          WHERE updated_at >= ${dateFrom.toISOString()}
          AND status IN ('COMPLETED', 'completed')
          ${projectId ? sql`AND id = ${projectId}` : sql``}
          GROUP BY TO_CHAR(updated_at, ${dateFormat})
        )
        SELECT 
          p.period,
          p.total_projects,
          COALESCE(c.completed_projects, 0) as completed_projects,
          CASE 
            WHEN p.total_projects > 0 
            THEN (COALESCE(c.completed_projects, 0)::float / p.total_projects) * 100
            ELSE 0 
          END as completion_rate
        FROM period_data p
        LEFT JOIN completed_data c ON p.period = c.period
        ORDER BY p.period
      `;

      return res.status(200).json({
        success: true,
        data: {
          period: {
            type: period,
            months: parseInt(months),
            dateFrom: dateFrom.toISOString(),
            dateTo: new Date().toISOString()
          },
          trends: projectTrends.map(t => ({
            period: t.period,
            date: t.period,
            month: t.period,
            newProjects: parseInt(t.new_projects) || 0,
            completedProjects: parseInt(t.completed_projects) || 0,
            activeProjects: parseInt(t.active_projects) || 0,
            avgCompletion: parseFloat(t.avg_progress) || 0,
            totalBudget: parseFloat(t.total_budget) || 0,
            totalValue: parseFloat(t.total_budget) || 0
          })),
          progressAnalysis: progressTrends.map(p => ({
            id: p.id,
            name: p.name,
            startDate: p.start_date,
            endDate: p.end_date,
            currentProgress: parseFloat(p.progress) || 0,
            expectedProgress: Math.round(parseFloat(p.expected_progress) || 0),
            status: p.status,
            daysElapsed: parseInt(p.days_elapsed) || 0,
            totalDays: parseInt(p.total_days) || 0,
            onTrack: (parseFloat(p.progress) || 0) >= (parseFloat(p.expected_progress) || 0)
          })),
          budgetUtilization: budgetTrends.map(b => ({
            period: b.period,
            avgUtilization: parseFloat(b.avg_utilization) || 0,
            totalBudget: parseFloat(b.total_budget) || 0,
            totalSpent: parseFloat(b.total_spent) || 0,
            efficiency: b.total_budget > 0 
              ? Math.round(((parseFloat(b.total_spent) || 0) / parseFloat(b.total_budget)) * 100 * 10) / 10
              : 0
          })),
          completionRates: completionTrends.map(c => ({
            period: c.period,
            totalProjects: parseInt(c.total_projects) || 0,
            completedProjects: parseInt(c.completed_projects) || 0,
            completionRate: Math.round(parseFloat(c.completion_rate) * 10) / 10
          })),
          timestamp: new Date().toISOString()
        }
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Project trends error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}