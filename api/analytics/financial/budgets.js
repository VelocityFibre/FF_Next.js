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
      const { projectId, clientId, department, startDate, endDate } = req.query;
      
      // Build filter conditions
      let conditions = [`p.status NOT IN ('archived', 'cancelled', 'deleted')`];
      if (projectId) conditions.push(`p.id = '${projectId}'`);
      if (clientId) conditions.push(`p.client_id = '${clientId}'`);
      if (startDate) conditions.push(`p.created_at >= '${startDate}'`);
      if (endDate) conditions.push(`p.created_at <= '${endDate}'`);
      
      const whereClause = conditions.length > 0 
        ? `WHERE ${conditions.join(' AND ')}` 
        : '';

      // Get budget vs actual analysis
      const budgetAnalysis = await sql`
        SELECT 
          p.id as project_id,
          p.name as project_name,
          p.status,
          p.budget,
          p.actual_cost,
          p.progress,
          c.name as client_name,
          CASE 
            WHEN p.budget > 0 THEN ((p.actual_cost / p.budget) * 100)
            ELSE 0 
          END as budget_utilization,
          (p.budget - COALESCE(p.actual_cost, 0)) as budget_remaining,
          CASE 
            WHEN p.budget > 0 AND p.actual_cost > p.budget THEN (p.actual_cost - p.budget)
            ELSE 0 
          END as budget_overrun,
          CASE 
            WHEN p.actual_cost > p.budget * 1.1 THEN 'critical'
            WHEN p.actual_cost > p.budget THEN 'warning'
            WHEN p.actual_cost > p.budget * 0.8 THEN 'attention'
            ELSE 'healthy'
          END as budget_health
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        ${sql.unsafe(whereClause)}
        ORDER BY budget_utilization DESC
      `;

      // Get budget allocation by category
      const budgetByCategory = await sql`
        SELECT 
          COALESCE(p.category, 'General') as category,
          COUNT(*) as project_count,
          SUM(p.budget) as allocated_budget,
          SUM(p.actual_cost) as actual_spending,
          AVG(CASE 
            WHEN p.budget > 0 THEN ((p.actual_cost / p.budget) * 100)
            ELSE 0 
          END) as avg_utilization
        FROM projects p
        ${sql.unsafe(whereClause)}
        GROUP BY COALESCE(p.category, 'General')
        ORDER BY allocated_budget DESC
      `.catch(() => []);

      // Get budget trends over time
      const budgetTrends = await sql`
        SELECT 
          TO_CHAR(p.created_at, 'YYYY-MM') as month,
          SUM(p.budget) as total_budget,
          SUM(p.actual_cost) as total_spending,
          AVG(CASE 
            WHEN p.budget > 0 THEN ((p.actual_cost / p.budget) * 100)
            ELSE 0 
          END) as avg_utilization,
          COUNT(*) as project_count,
          COUNT(CASE WHEN p.actual_cost > p.budget THEN 1 END) as over_budget_count
        FROM projects p
        ${sql.unsafe(whereClause.replace('WHERE', whereClause ? 'WHERE' : 'WHERE 1=1 AND'))}
        ${sql.unsafe(whereClause ? ' AND' : ' WHERE')} p.created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY TO_CHAR(p.created_at, 'YYYY-MM')
        ORDER BY month
      `;

      // Get department budget allocation if applicable
      const departmentBudgets = department ? await sql`
        SELECT 
          s.department,
          COUNT(DISTINCT ps.project_id) as project_count,
          SUM(p.budget) as allocated_budget,
          SUM(p.actual_cost) as actual_spending,
          SUM(sp.hours_worked * COALESCE(s.hourly_rate, 50)) as labor_cost
        FROM staff s
        JOIN project_staff ps ON s.id = ps.staff_id
        JOIN projects p ON ps.project_id = p.id
        LEFT JOIN staff_performance sp ON s.id = sp.staff_id
        ${sql.unsafe(whereClause.replace('p.', 'p.').replace('WHERE', 'WHERE s.department = \'' + department + '\' AND'))}
        GROUP BY s.department
      `.catch(() => []) : [];

      // Calculate summary statistics
      const totals = budgetAnalysis.reduce((acc, project) => ({
        totalBudget: acc.totalBudget + (parseFloat(project.budget) || 0),
        totalSpending: acc.totalSpending + (parseFloat(project.actual_cost) || 0),
        totalOverrun: acc.totalOverrun + (parseFloat(project.budget_overrun) || 0),
        projectsOverBudget: acc.projectsOverBudget + (project.budget_health === 'critical' || project.budget_health === 'warning' ? 1 : 0),
        projectsOnTrack: acc.projectsOnTrack + (project.budget_health === 'healthy' ? 1 : 0)
      }), {
        totalBudget: 0,
        totalSpending: 0,
        totalOverrun: 0,
        projectsOverBudget: 0,
        projectsOnTrack: 0
      });

      const avgUtilization = totals.totalBudget > 0 
        ? (totals.totalSpending / totals.totalBudget) * 100 
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          summary: {
            totalProjects: budgetAnalysis.length,
            totalBudget: Math.round(totals.totalBudget * 100) / 100,
            totalSpending: Math.round(totals.totalSpending * 100) / 100,
            totalRemaining: Math.round((totals.totalBudget - totals.totalSpending) * 100) / 100,
            totalOverrun: Math.round(totals.totalOverrun * 100) / 100,
            avgUtilization: Math.round(avgUtilization * 10) / 10,
            projectsOverBudget: totals.projectsOverBudget,
            projectsOnTrack: totals.projectsOnTrack,
            budgetHealth: totals.projectsOverBudget === 0 ? 'excellent' :
                         totals.projectsOverBudget <= budgetAnalysis.length * 0.1 ? 'good' :
                         totals.projectsOverBudget <= budgetAnalysis.length * 0.25 ? 'fair' : 'poor'
          },
          projects: budgetAnalysis.map(p => ({
            projectId: p.project_id,
            projectName: p.project_name,
            clientName: p.client_name || 'No Client',
            status: p.status,
            budget: parseFloat(p.budget) || 0,
            actualCost: parseFloat(p.actual_cost) || 0,
            budgetRemaining: parseFloat(p.budget_remaining) || 0,
            budgetOverrun: parseFloat(p.budget_overrun) || 0,
            budgetUtilization: Math.round(parseFloat(p.budget_utilization) * 10) / 10,
            budgetHealth: p.budget_health,
            progress: parseFloat(p.progress) || 0
          })),
          byCategory: budgetByCategory.map(c => ({
            category: c.category,
            projectCount: parseInt(c.project_count) || 0,
            allocatedBudget: parseFloat(c.allocated_budget) || 0,
            actualSpending: parseFloat(c.actual_spending) || 0,
            avgUtilization: Math.round(parseFloat(c.avg_utilization) * 10) / 10,
            variance: (parseFloat(c.allocated_budget) || 0) - (parseFloat(c.actual_spending) || 0)
          })),
          trends: budgetTrends.map(t => ({
            month: t.month,
            totalBudget: parseFloat(t.total_budget) || 0,
            totalSpending: parseFloat(t.total_spending) || 0,
            avgUtilization: Math.round(parseFloat(t.avg_utilization) * 10) / 10,
            projectCount: parseInt(t.project_count) || 0,
            overBudgetCount: parseInt(t.over_budget_count) || 0
          })),
          departmentBudgets: departmentBudgets.map(d => ({
            department: d.department,
            projectCount: parseInt(d.project_count) || 0,
            allocatedBudget: parseFloat(d.allocated_budget) || 0,
            actualSpending: parseFloat(d.actual_spending) || 0,
            laborCost: parseFloat(d.labor_cost) || 0
          })),
          timestamp: new Date().toISOString()
        }
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Budget analysis error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}