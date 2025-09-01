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
      const { period = 'monthly' } = req.query;
      
      // Determine date range based on period
      let dateFilter = '';
      const now = new Date();
      
      switch (period) {
        case 'daily':
          dateFilter = `AND created_at >= CURRENT_DATE`;
          break;
        case 'weekly':
          dateFilter = `AND created_at >= CURRENT_DATE - INTERVAL '7 days'`;
          break;
        case 'monthly':
          dateFilter = `AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`;
          break;
        case 'quarterly':
          dateFilter = `AND created_at >= DATE_TRUNC('quarter', CURRENT_DATE)`;
          break;
        case 'yearly':
          dateFilter = `AND created_at >= DATE_TRUNC('year', CURRENT_DATE)`;
          break;
      }

      // Get project summary for the period
      const projectSummary = await sql`
        SELECT 
          COUNT(*) as total_projects,
          COUNT(CASE WHEN status IN ('ACTIVE', 'active') THEN 1 END) as active_projects,
          COUNT(CASE WHEN status IN ('COMPLETED', 'completed') THEN 1 END) as completed_projects,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_projects_week,
          AVG(progress) as avg_progress,
          SUM(budget) as total_budget,
          SUM(actual_cost) as total_spent
        FROM projects
        WHERE status NOT IN ('archived', 'cancelled', 'deleted')
        ${sql.unsafe(dateFilter)}
      `;

      // Get staff performance summary
      const staffSummary = await sql`
        SELECT 
          COUNT(DISTINCT staff_id) as active_staff,
          AVG(productivity) as avg_productivity,
          AVG(quality_score) as avg_quality,
          SUM(hours_worked) as total_hours,
          SUM(tasks_completed) as total_tasks
        FROM staff_performance
        WHERE period_type = ${period}
        AND period_start >= CURRENT_DATE - INTERVAL '30 days'
      `.catch(() => [{
        active_staff: 0,
        avg_productivity: 0,
        avg_quality: 0,
        total_hours: 0,
        total_tasks: 0
      }]);

      // Get financial summary
      const financialSummary = await sql`
        SELECT 
          COALESCE(SUM(total_value), 0) as total_revenue,
          COALESCE(SUM(paid_amount), 0) as collected_revenue,
          COALESCE(SUM(total_value - COALESCE(paid_amount, 0)), 0) as pending_revenue,
          COUNT(CASE WHEN status = 'approved' AND expiry_date < CURRENT_DATE THEN 1 END) as overdue_invoices
        FROM sow
        WHERE status IN ('approved', 'paid')
        ${sql.unsafe(dateFilter.replace('created_at', 'created_at'))}
      `.catch(() => [{
        total_revenue: 0,
        collected_revenue: 0,
        pending_revenue: 0,
        overdue_invoices: 0
      }]);

      // Get activity summary
      const recentActivity = await sql`
        SELECT 
          'project' as type,
          name as title,
          status,
          created_at,
          updated_at
        FROM projects
        WHERE updated_at >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY updated_at DESC
        LIMIT 10
      `;

      const proj = projectSummary[0];
      const staff = staffSummary[0];
      const financial = financialSummary[0];

      return res.status(200).json({
        success: true,
        data: {
          period,
          projects: {
            total: parseInt(proj.total_projects) || 0,
            active: parseInt(proj.active_projects) || 0,
            completed: parseInt(proj.completed_projects) || 0,
            newThisWeek: parseInt(proj.new_projects_week) || 0,
            avgProgress: parseFloat(proj.avg_progress) || 0,
            totalBudget: parseFloat(proj.total_budget) || 0,
            totalSpent: parseFloat(proj.total_spent) || 0
          },
          staff: {
            activeCount: parseInt(staff.active_staff) || 0,
            avgProductivity: parseFloat(staff.avg_productivity) || 0,
            avgQuality: parseFloat(staff.avg_quality) || 0,
            totalHours: parseFloat(staff.total_hours) || 0,
            totalTasks: parseInt(staff.total_tasks) || 0
          },
          financial: {
            totalRevenue: parseFloat(financial.total_revenue) || 0,
            collectedRevenue: parseFloat(financial.collected_revenue) || 0,
            pendingRevenue: parseFloat(financial.pending_revenue) || 0,
            overdueInvoices: parseInt(financial.overdue_invoices) || 0
          },
          recentActivity: recentActivity.map(activity => ({
            type: activity.type,
            title: activity.title,
            status: activity.status,
            createdAt: activity.created_at,
            updatedAt: activity.updated_at
          })),
          timestamp: new Date().toISOString()
        }
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}