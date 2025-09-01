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
      const { category, projectId, dateFrom, dateTo } = req.query;
      
      // Get KPI metrics from the database
      let conditions = [];
      if (category) conditions.push(sql`metric_type = ${category}`);
      if (projectId) conditions.push(sql`project_id = ${projectId}`);
      if (dateFrom) conditions.push(sql`recorded_date >= ${dateFrom}`);
      if (dateTo) conditions.push(sql`recorded_date <= ${dateTo}`);

      const whereClause = conditions.length > 0 
        ? sql`WHERE ${sql.join(conditions, sql` AND `)}` 
        : sql``;

      // Get stored KPIs from database
      const storedKPIs = await sql`
        SELECT 
          metric_type,
          metric_name,
          AVG(metric_value) as current_value,
          unit,
          COUNT(*) as record_count
        FROM kpi_metrics
        ${whereClause}
        GROUP BY metric_type, metric_name, unit
        ORDER BY metric_type, metric_name
      `.catch(() => []);

      // Calculate real-time KPIs from project data
      const projectKPIs = await sql`
        SELECT 
          COUNT(*) as total_projects,
          COUNT(CASE WHEN status IN ('COMPLETED', 'completed') THEN 1 END) as completed_projects,
          COUNT(CASE WHEN status IN ('ACTIVE', 'active') AND end_date < CURRENT_DATE THEN 1 END) as overdue_projects,
          AVG(progress) as avg_progress,
          AVG(CASE 
            WHEN budget > 0 AND actual_cost IS NOT NULL 
            THEN (actual_cost / budget) * 100 
            ELSE NULL 
          END) as avg_budget_utilization
        FROM projects
        WHERE status NOT IN ('archived', 'cancelled', 'deleted')
        ${projectId ? sql`AND id = ${projectId}` : sql``}
      `;

      const proj = projectKPIs[0];
      const completionRate = proj.total_projects > 0 
        ? (parseInt(proj.completed_projects) / parseInt(proj.total_projects)) * 100 
        : 0;

      // Build comprehensive KPI list
      const kpis = [
        {
          id: 'completion-rate',
          category: 'performance',
          name: 'Project Completion Rate',
          value: Math.round(completionRate * 10) / 10,
          target: 90,
          unit: '%',
          trend: completionRate >= 85 ? 'up' : completionRate >= 75 ? 'stable' : 'down',
          description: 'Percentage of projects completed successfully'
        },
        {
          id: 'budget-utilization',
          category: 'financial',
          name: 'Budget Utilization',
          value: Math.round((parseFloat(proj.avg_budget_utilization) || 0) * 10) / 10,
          target: 95,
          unit: '%',
          trend: proj.avg_budget_utilization >= 90 && proj.avg_budget_utilization <= 100 ? 'up' : 'down',
          description: 'Average percentage of budget utilized'
        },
        {
          id: 'project-progress',
          category: 'performance',
          name: 'Average Project Progress',
          value: Math.round((parseFloat(proj.avg_progress) || 0) * 10) / 10,
          target: 75,
          unit: '%',
          trend: proj.avg_progress >= 70 ? 'up' : 'stable',
          description: 'Average progress across all active projects'
        },
        {
          id: 'overdue-projects',
          category: 'risk',
          name: 'Overdue Projects',
          value: parseInt(proj.overdue_projects) || 0,
          target: 0,
          unit: 'count',
          trend: proj.overdue_projects === 0 ? 'up' : proj.overdue_projects <= 2 ? 'stable' : 'down',
          description: 'Number of projects past their deadline'
        }
      ];

      // Add stored KPIs from database
      storedKPIs.forEach(kpi => {
        kpis.push({
          id: `${kpi.metric_type}-${kpi.metric_name}`.toLowerCase().replace(/\s+/g, '-'),
          category: kpi.metric_type,
          name: kpi.metric_name,
          value: parseFloat(kpi.current_value) || 0,
          target: null, // Would need a targets table
          unit: kpi.unit || '',
          trend: 'stable', // Would need historical data
          description: `${kpi.metric_name} metric`
        });
      });

      // Get staff KPIs
      const staffKPIs = await sql`
        SELECT 
          COUNT(DISTINCT staff_id) as active_staff,
          AVG(productivity) as avg_productivity,
          AVG(quality_score) as avg_quality,
          AVG(safety_score) as avg_safety
        FROM staff_performance
        WHERE period_start >= CURRENT_DATE - INTERVAL '30 days'
      `.catch(() => [{
        active_staff: 0,
        avg_productivity: 0,
        avg_quality: 0,
        avg_safety: 0
      }]);

      const staff = staffKPIs[0];
      
      kpis.push(
        {
          id: 'staff-productivity',
          category: 'productivity',
          name: 'Staff Productivity',
          value: Math.round((parseFloat(staff.avg_productivity) || 0) * 10) / 10,
          target: 85,
          unit: '%',
          trend: staff.avg_productivity >= 80 ? 'up' : 'stable',
          description: 'Average staff productivity score'
        },
        {
          id: 'quality-score',
          category: 'quality',
          name: 'Quality Score',
          value: Math.round((parseFloat(staff.avg_quality) || 0) * 10) / 10,
          target: 90,
          unit: '%',
          trend: staff.avg_quality >= 85 ? 'up' : 'stable',
          description: 'Average quality score across all work'
        },
        {
          id: 'safety-score',
          category: 'safety',
          name: 'Safety Score',
          value: Math.round((parseFloat(staff.avg_safety) || 0) * 10) / 10,
          target: 100,
          unit: '%',
          trend: staff.avg_safety >= 95 ? 'up' : 'down',
          description: 'Safety compliance score'
        }
      );

      // Filter by category if requested
      const filteredKPIs = category 
        ? kpis.filter(kpi => kpi.category === category)
        : kpis;

      return res.status(200).json({
        success: true,
        data: filteredKPIs,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('KPI index error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}