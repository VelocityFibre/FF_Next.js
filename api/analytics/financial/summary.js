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
      const { period = 'monthly', projectId, clientId } = req.query;
      
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

      // Get financial overview from projects and SOW
      const financialOverview = await sql`
        SELECT 
          COUNT(DISTINCT p.id) as total_projects,
          SUM(p.budget) as total_budget,
          SUM(p.actual_cost) as total_expenses,
          SUM(s.total_value) as total_revenue,
          SUM(s.paid_amount) as collected_revenue,
          SUM(s.total_value - COALESCE(s.paid_amount, 0)) as pending_revenue,
          COUNT(CASE WHEN s.status = 'approved' AND s.expiry_date < CURRENT_DATE THEN 1 END) as overdue_invoices,
          COUNT(DISTINCT s.id) as total_invoices
        FROM projects p
        LEFT JOIN sow s ON p.id = s.project_id
        WHERE p.status NOT IN ('archived', 'cancelled', 'deleted')
        ${sql.unsafe(dateFilter.replace('created_at', 'p.created_at'))}
        ${projectId ? sql`AND p.id = ${projectId}` : sql``}
        ${clientId ? sql`AND p.client_id = ${clientId}` : sql``}
      `;

      // Get cash flow summary
      const cashFlowSummary = await sql`
        WITH monthly_flow AS (
          SELECT 
            TO_CHAR(COALESCE(s.created_at, p.created_at), 'YYYY-MM') as month,
            SUM(s.paid_amount) as income,
            SUM(p.actual_cost) as expenses
          FROM projects p
          LEFT JOIN sow s ON p.id = s.project_id
          WHERE p.status NOT IN ('archived', 'cancelled', 'deleted')
          ${sql.unsafe(dateFilter.replace('created_at', 'COALESCE(s.created_at, p.created_at)'))}
          ${projectId ? sql`AND p.id = ${projectId}` : sql``}
          ${clientId ? sql`AND p.client_id = ${clientId}` : sql``}
          GROUP BY TO_CHAR(COALESCE(s.created_at, p.created_at), 'YYYY-MM')
        )
        SELECT 
          SUM(income) as total_income,
          SUM(expenses) as total_expenses,
          SUM(income - COALESCE(expenses, 0)) as net_cash_flow
        FROM monthly_flow
      `;

      // Get revenue by client
      const revenueByClient = await sql`
        SELECT 
          c.id as client_id,
          c.name as client_name,
          COUNT(DISTINCT p.id) as project_count,
          SUM(s.total_value) as total_revenue,
          SUM(s.paid_amount) as paid_revenue,
          SUM(s.total_value - COALESCE(s.paid_amount, 0)) as pending_revenue
        FROM clients c
        JOIN projects p ON c.id = p.client_id
        LEFT JOIN sow s ON p.id = s.project_id
        WHERE p.status NOT IN ('archived', 'cancelled', 'deleted')
        ${sql.unsafe(dateFilter.replace('created_at', 'p.created_at'))}
        ${clientId ? sql`AND c.id = ${clientId}` : sql``}
        GROUP BY c.id, c.name
        ORDER BY total_revenue DESC
        LIMIT 10
      `;

      // Get expense breakdown
      const expenseBreakdown = await sql`
        SELECT 
          CASE 
            WHEN p.category IS NOT NULL THEN p.category
            ELSE 'General'
          END as expense_category,
          COUNT(*) as project_count,
          SUM(p.actual_cost) as total_cost,
          AVG(p.actual_cost) as avg_cost
        FROM projects p
        WHERE p.actual_cost > 0
        ${sql.unsafe(dateFilter.replace('created_at', 'p.created_at'))}
        ${projectId ? sql`AND p.id = ${projectId}` : sql``}
        ${clientId ? sql`AND p.client_id = ${clientId}` : sql``}
        GROUP BY expense_category
        ORDER BY total_cost DESC
      `.catch(() => [
        { expense_category: 'Operations', project_count: 0, total_cost: 0, avg_cost: 0 },
        { expense_category: 'Materials', project_count: 0, total_cost: 0, avg_cost: 0 },
        { expense_category: 'Labor', project_count: 0, total_cost: 0, avg_cost: 0 }
      ]);

      // Get payment status distribution
      const paymentStatus = await sql`
        SELECT 
          s.status as payment_status,
          COUNT(*) as count,
          SUM(s.total_value) as total_value,
          SUM(s.paid_amount) as paid_amount
        FROM sow s
        JOIN projects p ON s.project_id = p.id
        WHERE p.status NOT IN ('archived', 'cancelled', 'deleted')
        ${sql.unsafe(dateFilter.replace('created_at', 's.created_at'))}
        ${projectId ? sql`AND p.id = ${projectId}` : sql``}
        ${clientId ? sql`AND p.client_id = ${clientId}` : sql``}
        GROUP BY s.status
      `.catch(() => []);

      const overview = financialOverview[0];
      const cashFlow = cashFlowSummary[0];

      // Calculate key metrics
      const profitMargin = overview.total_revenue > 0 
        ? ((parseFloat(overview.total_revenue) - parseFloat(overview.total_expenses)) / parseFloat(overview.total_revenue)) * 100
        : 0;
      
      const collectionRate = overview.total_revenue > 0 
        ? (parseFloat(overview.collected_revenue) / parseFloat(overview.total_revenue)) * 100
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          period,
          overview: {
            totalProjects: parseInt(overview.total_projects) || 0,
            totalInvoices: parseInt(overview.total_invoices) || 0,
            totalRevenue: parseFloat(overview.total_revenue) || 0,
            totalExpenses: parseFloat(overview.total_expenses) || 0,
            netProfit: (parseFloat(overview.total_revenue) || 0) - (parseFloat(overview.total_expenses) || 0),
            profitMargin: Math.round(profitMargin * 10) / 10,
            totalBudget: parseFloat(overview.total_budget) || 0,
            budgetUtilization: overview.total_budget > 0 
              ? Math.round(((parseFloat(overview.total_expenses) || 0) / parseFloat(overview.total_budget)) * 100 * 10) / 10
              : 0
          },
          cashFlow: {
            totalIncome: parseFloat(cashFlow.total_income) || 0,
            totalExpenses: parseFloat(cashFlow.total_expenses) || 0,
            netCashFlow: parseFloat(cashFlow.net_cash_flow) || 0,
            collectedRevenue: parseFloat(overview.collected_revenue) || 0,
            pendingRevenue: parseFloat(overview.pending_revenue) || 0,
            overdueInvoices: parseInt(overview.overdue_invoices) || 0,
            collectionRate: Math.round(collectionRate * 10) / 10
          },
          revenueByClient: revenueByClient.map(r => ({
            clientId: r.client_id,
            clientName: r.client_name,
            projectCount: parseInt(r.project_count) || 0,
            totalRevenue: parseFloat(r.total_revenue) || 0,
            paidRevenue: parseFloat(r.paid_revenue) || 0,
            pendingRevenue: parseFloat(r.pending_revenue) || 0,
            percentage: overview.total_revenue > 0 
              ? Math.round(((parseFloat(r.total_revenue) || 0) / parseFloat(overview.total_revenue)) * 100 * 10) / 10
              : 0
          })),
          expenseBreakdown: expenseBreakdown.map(e => ({
            category: e.expense_category,
            projectCount: parseInt(e.project_count) || 0,
            totalCost: parseFloat(e.total_cost) || 0,
            avgCost: parseFloat(e.avg_cost) || 0,
            percentage: overview.total_expenses > 0 
              ? Math.round(((parseFloat(e.total_cost) || 0) / parseFloat(overview.total_expenses)) * 100 * 10) / 10
              : 0
          })),
          paymentStatus: paymentStatus.map(p => ({
            status: p.payment_status,
            count: parseInt(p.count) || 0,
            totalValue: parseFloat(p.total_value) || 0,
            paidAmount: parseFloat(p.paid_amount) || 0
          })),
          timestamp: new Date().toISOString()
        }
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Financial summary error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}