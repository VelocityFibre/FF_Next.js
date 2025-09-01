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
      const { startDate, endDate } = req.query;

      // Get project statistics
      const projectStats = await sql`
        SELECT 
          COUNT(*) as total_projects,
          COUNT(CASE WHEN status IN ('ACTIVE', 'active', 'IN_PROGRESS', 'in_progress') THEN 1 END) as active_projects,
          COUNT(CASE WHEN status IN ('COMPLETED', 'completed', 'FINISHED', 'finished') THEN 1 END) as completed_projects,
          AVG(progress) as avg_progress,
          SUM(budget) as total_budget,
          SUM(actual_cost) as total_actual_cost
        FROM projects
        WHERE status NOT IN ('archived', 'cancelled', 'deleted')
        ${startDate ? sql`AND created_at >= ${startDate}` : sql``}
        ${endDate ? sql`AND created_at <= ${endDate}` : sql``}
      `;

      // Get staff statistics
      const staffStats = await sql`
        SELECT 
          COUNT(*) as total_staff,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_staff
        FROM staff
        WHERE status != 'deleted'
      `;

      // Get infrastructure statistics
      const infrastructureStats = await sql`
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'pole' THEN quantity ELSE 0 END), 0) as poles,
          COALESCE(SUM(CASE WHEN type = 'drop' THEN quantity ELSE 0 END), 0) as drops,
          COALESCE(SUM(CASE WHEN type = 'fiber' THEN length ELSE 0 END), 0) as fiber
        FROM infrastructure_installations 
        WHERE status = 'completed'
      `.catch(() => [{ poles: 0, drops: 0, fiber: 0 }]);

      // Get procurement statistics
      const [boqStats, rfqStats, supplierStats, contractorStats] = await Promise.all([
        sql`SELECT COUNT(*) as count FROM boqs WHERE status = 'active'`.catch(() => [{ count: 0 }]),
        sql`SELECT COUNT(*) as count FROM rfqs WHERE status = 'active'`.catch(() => [{ count: 0 }]),
        sql`SELECT COUNT(*) as count FROM suppliers WHERE status = 'active'`.catch(() => [{ count: 0 }]),
        sql`
          SELECT 
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
          FROM contractors
        `.catch(() => [{ active: 0, pending: 0 }])
      ]);

      // Get client statistics
      const clientStats = await sql`
        SELECT 
          COUNT(*) as total_clients,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_clients,
          SUM(total_project_value) as total_revenue
        FROM clients
        WHERE status != 'deleted'
      `.catch(() => [{ total_clients: 0, active_clients: 0, total_revenue: 0 }]);

      // Calculate performance metrics
      const project = projectStats[0];
      const staff = staffStats[0];
      const infrastructure = infrastructureStats[0];
      const client = clientStats[0];
      
      const completionRate = project.total_projects > 0 
        ? (parseInt(project.completed_projects) / parseInt(project.total_projects)) * 100 
        : 0;
      
      const budgetUtilization = parseFloat(project.total_budget) > 0 
        ? (parseFloat(project.total_actual_cost || 0) / parseFloat(project.total_budget)) * 100 
        : 0;

      // Calculate on-time delivery (simplified)
      const onTimeResult = await sql`
        SELECT 
          COUNT(*) as total_completed,
          COUNT(CASE WHEN actual_end_date <= end_date THEN 1 END) as on_time_completed
        FROM projects
        WHERE status IN ('COMPLETED', 'completed')
        AND end_date IS NOT NULL
      `.catch(() => [{ total_completed: 0, on_time_completed: 0 }]);
      
      const onTimeDelivery = onTimeResult[0].total_completed > 0
        ? (parseInt(onTimeResult[0].on_time_completed) / parseInt(onTimeResult[0].total_completed)) * 100
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          totalProjects: parseInt(project.total_projects) || 0,
          activeProjects: parseInt(project.active_projects) || 0,
          completedProjects: parseInt(project.completed_projects) || 0,
          completedTasks: parseInt(project.completed_projects) * 5, // Estimate
          teamMembers: parseInt(staff.total_staff) || 0,
          openIssues: 0, // Not implemented yet
          polesInstalled: parseInt(infrastructure.poles) || 0,
          dropsCompleted: parseInt(infrastructure.drops) || 0,
          fiberInstalled: parseInt(infrastructure.fiber) || 0,
          totalRevenue: parseFloat(client.total_revenue) || 0,
          contractorsActive: parseInt(contractorStats[0].active) || 0,
          contractorsPending: parseInt(contractorStats[0].pending) || 0,
          boqsActive: parseInt(boqStats[0].count) || 0,
          rfqsActive: parseInt(rfqStats[0].count) || 0,
          supplierActive: parseInt(supplierStats[0].count) || 0,
          reportsGenerated: 0, // Not implemented yet
          performanceScore: Math.min(completionRate, 100),
          qualityScore: 0, // Not implemented yet
          onTimeDelivery: Math.round(onTimeDelivery * 10) / 10,
          budgetUtilization: Math.round(budgetUtilization * 10) / 10,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Analytics stats error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}