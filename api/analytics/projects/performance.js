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
      const { projectId, metrics = 'all' } = req.query;
      const metricsArray = metrics === 'all' 
        ? ['onTime', 'budget', 'quality', 'efficiency', 'risk'] 
        : metrics.split(',');

      const response = {
        success: true,
        data: {
          metrics: {},
          timestamp: new Date().toISOString()
        }
      };

      // On-time performance
      if (metricsArray.includes('onTime')) {
        const onTimeResult = await sql`
          SELECT 
            COUNT(*) as total_completed,
            COUNT(CASE WHEN updated_at <= end_date THEN 1 END) as on_time_completed
          FROM projects
          WHERE status IN ('COMPLETED', 'completed') 
          AND end_date IS NOT NULL
          ${projectId ? sql`AND id = ${projectId}` : sql``}
        `;
        
        const onTimeRate = onTimeResult[0].total_completed > 0 
          ? (parseInt(onTimeResult[0].on_time_completed) / parseInt(onTimeResult[0].total_completed)) * 100
          : 0;

        response.data.metrics.onTime = {
          rate: Math.round(onTimeRate * 10) / 10,
          completed: parseInt(onTimeResult[0].total_completed) || 0,
          onTime: parseInt(onTimeResult[0].on_time_completed) || 0
        };
      }

      // Budget performance
      if (metricsArray.includes('budget')) {
        const budgetResult = await sql`
          SELECT 
            COUNT(*) as total_projects,
            AVG(CASE 
              WHEN budget > 0 AND actual_cost IS NOT NULL 
              THEN (actual_cost / budget) * 100
              ELSE NULL 
            END) as avg_budget_utilization,
            COUNT(CASE WHEN actual_cost > budget THEN 1 END) as over_budget
          FROM projects
          WHERE status NOT IN ('archived', 'cancelled', 'deleted') 
          AND budget > 0
          ${projectId ? sql`AND id = ${projectId}` : sql``}
        `;

        response.data.metrics.budget = {
          utilizationRate: Math.round((parseFloat(budgetResult[0].avg_budget_utilization) || 0) * 10) / 10,
          overBudgetCount: parseInt(budgetResult[0].over_budget) || 0,
          totalProjects: parseInt(budgetResult[0].total_projects) || 0
        };
      }

      // Quality metrics
      if (metricsArray.includes('quality')) {
        // Simulated quality score based on project completion and delays
        const qualityResult = await sql`
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status IN ('COMPLETED', 'completed') AND updated_at <= end_date THEN 1 END) as high_quality,
            AVG(progress) as avg_progress
          FROM projects
          WHERE status NOT IN ('archived', 'cancelled', 'deleted')
          ${projectId ? sql`AND id = ${projectId}` : sql``}
        `;

        const qualityScore = qualityResult[0].total > 0
          ? ((parseInt(qualityResult[0].high_quality) / parseInt(qualityResult[0].total)) * 100)
          : 0;

        response.data.metrics.quality = {
          score: Math.round(qualityScore * 10) / 10,
          avgProgress: parseFloat(qualityResult[0].avg_progress) || 0,
          highQualityProjects: parseInt(qualityResult[0].high_quality) || 0
        };
      }

      // Efficiency metrics
      if (metricsArray.includes('efficiency')) {
        const efficiencyResult = await sql`
          SELECT 
            AVG(CASE 
              WHEN start_date IS NOT NULL AND end_date IS NOT NULL 
              THEN EXTRACT(DAY FROM (end_date - start_date))
              ELSE NULL 
            END) as avg_duration,
            AVG(progress) as avg_progress,
            COUNT(CASE WHEN progress >= 90 THEN 1 END) as near_complete
          FROM projects
          WHERE status IN ('ACTIVE', 'active', 'IN_PROGRESS', 'in_progress')
          ${projectId ? sql`AND id = ${projectId}` : sql``}
        `;

        response.data.metrics.efficiency = {
          avgDuration: Math.round(parseFloat(efficiencyResult[0].avg_duration) || 0),
          avgProgress: Math.round(parseFloat(efficiencyResult[0].avg_progress) || 0),
          nearCompleteCount: parseInt(efficiencyResult[0].near_complete) || 0,
          productivityScore: Math.min(100, Math.round((parseFloat(efficiencyResult[0].avg_progress) || 0) * 1.2))
        };
      }

      // Risk assessment
      if (metricsArray.includes('risk')) {
        const riskResult = await sql`
          SELECT 
            COUNT(CASE 
              WHEN (
                (end_date < CURRENT_DATE + INTERVAL '7 days' AND status NOT IN ('COMPLETED', 'completed')) OR
                (progress < 50 AND EXTRACT(DAY FROM (end_date - CURRENT_DATE)) < 14) OR
                (budget IS NOT NULL AND actual_cost > budget * 1.1)
              ) THEN 1 
            END) as high_risk,
            COUNT(CASE 
              WHEN (
                (end_date < CURRENT_DATE + INTERVAL '14 days' AND status NOT IN ('COMPLETED', 'completed')) OR
                (progress < 70 AND EXTRACT(DAY FROM (end_date - CURRENT_DATE)) < 30) OR
                (budget IS NOT NULL AND actual_cost > budget * 1.05)
              ) AND NOT (
                (end_date < CURRENT_DATE + INTERVAL '7 days' AND status NOT IN ('COMPLETED', 'completed')) OR
                (progress < 50 AND EXTRACT(DAY FROM (end_date - CURRENT_DATE)) < 14) OR
                (budget IS NOT NULL AND actual_cost > budget * 1.1)
              ) THEN 1 
            END) as medium_risk,
            COUNT(*) as total_active
          FROM projects
          WHERE status IN ('ACTIVE', 'active', 'IN_PROGRESS', 'in_progress')
          ${projectId ? sql`AND id = ${projectId}` : sql``}
        `;

        const stats = riskResult[0];
        const highRisk = parseInt(stats.high_risk) || 0;
        const mediumRisk = parseInt(stats.medium_risk) || 0;
        const totalActive = parseInt(stats.total_active) || 0;
        const lowRisk = totalActive - highRisk - mediumRisk;

        response.data.metrics.risk = {
          highRisk,
          mediumRisk,
          lowRisk,
          totalActive,
          riskScore: totalActive > 0 ? Math.round(((lowRisk / totalActive) * 100) * 10) / 10 : 100
        };
      }

      // Get overdue projects if requested
      if (metricsArray.includes('overdue')) {
        const overdueProjects = await sql`
          SELECT 
            p.id,
            p.name,
            p.end_date,
            CURRENT_DATE - p.end_date as days_overdue,
            c.name as client_name
          FROM projects p
          LEFT JOIN clients c ON p.client_id = c.id
          WHERE p.end_date < CURRENT_DATE 
          AND p.status NOT IN ('COMPLETED', 'completed', 'CANCELLED', 'cancelled')
          ${projectId ? sql`AND p.id = ${projectId}` : sql``}
          ORDER BY days_overdue DESC
          LIMIT 10
        `;

        response.data.metrics.overdue = overdueProjects.map(p => ({
          id: p.id,
          name: p.name,
          endDate: p.end_date,
          daysOverdue: parseInt(p.days_overdue) || 0,
          clientName: p.client_name || 'No client assigned'
        }));
      }

      return res.status(200).json(response);
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Project performance error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}