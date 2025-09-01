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
    if (req.method === 'POST') {
      const { reportType, parameters = {} } = req.body;
      
      if (!reportType) {
        return res.status(400).json({ 
          success: false, 
          error: 'Report type is required' 
        });
      }

      const { startDate, endDate, projectId, clientId, department, format = 'json' } = parameters;
      
      let reportData = {};
      
      switch (reportType) {
        case 'executive-summary':
          reportData = await generateExecutiveSummary(startDate, endDate);
          break;
          
        case 'project-performance':
          reportData = await generateProjectPerformanceReport(projectId, startDate, endDate);
          break;
          
        case 'financial-analysis':
          reportData = await generateFinancialAnalysisReport(clientId, startDate, endDate);
          break;
          
        case 'staff-performance':
          reportData = await generateStaffPerformanceReport(department, startDate, endDate);
          break;
          
        case 'kpi-dashboard':
          reportData = await generateKPIDashboardReport(startDate, endDate);
          break;
          
        case 'resource-utilization':
          reportData = await generateResourceUtilizationReport(department, startDate, endDate);
          break;
          
        case 'client-summary':
          reportData = await generateClientSummaryReport(clientId, startDate, endDate);
          break;
          
        default:
          return res.status(400).json({ 
            success: false, 
            error: 'Invalid report type' 
          });
      }

      // Add metadata to report
      const report = {
        metadata: {
          reportType,
          generatedAt: new Date().toISOString(),
          parameters,
          format
        },
        data: reportData
      };

      // Store report record
      await sql`
        INSERT INTO generated_reports (
          report_type, 
          parameters, 
          generated_by, 
          generated_at
        )
        VALUES (
          ${reportType},
          ${JSON.stringify(parameters)},
          'system',
          CURRENT_TIMESTAMP
        )
      `.catch(() => {}); // Ignore if table doesn't exist

      return res.status(200).json({
        success: true,
        report,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Report generation error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Report generation functions
async function generateExecutiveSummary(startDate, endDate) {
  const dateFilter = buildDateFilter(startDate, endDate);
  
  // Get high-level metrics
  const [projects, financial, staff, kpis] = await Promise.all([
    sql`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status IN ('ACTIVE', 'active') THEN 1 END) as active_projects,
        COUNT(CASE WHEN status IN ('COMPLETED', 'completed') THEN 1 END) as completed_projects,
        AVG(progress) as avg_progress
      FROM projects
      WHERE status NOT IN ('archived', 'cancelled', 'deleted')
      ${sql.unsafe(dateFilter)}
    `,
    sql`
      SELECT 
        SUM(p.budget) as total_budget,
        SUM(p.actual_cost) as total_expenses,
        SUM(s.total_value) as total_revenue,
        SUM(s.paid_amount) as collected_revenue
      FROM projects p
      LEFT JOIN sow s ON p.id = s.project_id
      WHERE p.status NOT IN ('archived', 'cancelled', 'deleted')
      ${sql.unsafe(dateFilter.replace('WHERE', 'AND'))}
    `,
    sql`
      SELECT 
        COUNT(DISTINCT s.id) as total_staff,
        AVG(sp.productivity) as avg_productivity,
        AVG(sp.quality_score) as avg_quality
      FROM staff s
      LEFT JOIN staff_performance sp ON s.id = sp.staff_id
      WHERE s.status = 'active'
    `,
    sql`
      SELECT 
        metric_type,
        AVG(metric_value) as avg_value
      FROM kpi_metrics
      WHERE recorded_date >= COALESCE(${startDate}, CURRENT_DATE - INTERVAL '30 days')
      GROUP BY metric_type
    `.catch(() => [])
  ]);

  return {
    overview: {
      projects: projects[0],
      financial: financial[0],
      staff: staff[0]
    },
    kpis: kpis,
    highlights: generateHighlights(projects[0], financial[0], staff[0])
  };
}

async function generateProjectPerformanceReport(projectId, startDate, endDate) {
  const conditions = [`p.status NOT IN ('archived', 'cancelled', 'deleted')`];
  if (projectId) conditions.push(`p.id = '${projectId}'`);
  if (startDate) conditions.push(`p.created_at >= '${startDate}'`);
  if (endDate) conditions.push(`p.created_at <= '${endDate}'`);
  
  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const [performance, timeline, budget, tasks] = await Promise.all([
    sql`
      SELECT 
        p.*,
        c.name as client_name,
        CASE 
          WHEN p.end_date < CURRENT_DATE AND p.status NOT IN ('COMPLETED', 'completed') THEN 'overdue'
          WHEN p.progress >= 90 THEN 'near-completion'
          WHEN p.progress >= 50 THEN 'on-track'
          ELSE 'behind-schedule'
        END as performance_status
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      ${sql.unsafe(whereClause)}
    `,
    sql`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as projects_started,
        COUNT(CASE WHEN status IN ('COMPLETED', 'completed') THEN 1 END) as projects_completed
      FROM projects
      ${sql.unsafe(whereClause)}
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month
    `,
    sql`
      SELECT 
        SUM(budget) as total_budget,
        SUM(actual_cost) as total_spent,
        AVG(CASE WHEN budget > 0 THEN (actual_cost / budget * 100) ELSE 0 END) as avg_utilization
      FROM projects p
      ${sql.unsafe(whereClause)}
    `,
    []
  ]);

  return {
    projects: performance,
    timeline: timeline,
    budget: budget[0],
    recommendations: generateProjectRecommendations(performance)
  };
}

async function generateFinancialAnalysisReport(clientId, startDate, endDate) {
  const conditions = [];
  if (clientId) conditions.push(`c.id = '${clientId}'`);
  if (startDate) conditions.push(`p.created_at >= '${startDate}'`);
  if (endDate) conditions.push(`p.created_at <= '${endDate}'`);
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [revenue, expenses, cashFlow, profitability] = await Promise.all([
    sql`
      SELECT 
        c.name as client_name,
        COUNT(p.id) as project_count,
        SUM(s.total_value) as total_revenue,
        SUM(s.paid_amount) as paid_revenue,
        SUM(s.total_value - COALESCE(s.paid_amount, 0)) as pending_revenue
      FROM clients c
      JOIN projects p ON c.id = p.client_id
      LEFT JOIN sow s ON p.id = s.project_id
      ${sql.unsafe(whereClause)}
      GROUP BY c.id, c.name
      ORDER BY total_revenue DESC
    `,
    sql`
      SELECT 
        TO_CHAR(p.created_at, 'YYYY-MM') as month,
        SUM(p.actual_cost) as total_expenses,
        COUNT(*) as project_count
      FROM projects p
      ${sql.unsafe(whereClause.replace('c.', 'p.'))}
      GROUP BY TO_CHAR(p.created_at, 'YYYY-MM')
      ORDER BY month
    `,
    sql`
      SELECT 
        TO_CHAR(COALESCE(s.created_at, p.created_at), 'YYYY-MM') as month,
        SUM(s.paid_amount) as income,
        SUM(p.actual_cost) as expenses,
        SUM(s.paid_amount) - SUM(p.actual_cost) as net_flow
      FROM projects p
      LEFT JOIN sow s ON p.id = s.project_id
      ${sql.unsafe(whereClause.replace('c.', 'p.'))}
      GROUP BY TO_CHAR(COALESCE(s.created_at, p.created_at), 'YYYY-MM')
      ORDER BY month
    `,
    sql`
      SELECT 
        SUM(s.total_value) as total_revenue,
        SUM(p.actual_cost) as total_expenses,
        SUM(s.total_value) - SUM(p.actual_cost) as net_profit,
        CASE 
          WHEN SUM(s.total_value) > 0 
          THEN ((SUM(s.total_value) - SUM(p.actual_cost)) / SUM(s.total_value)) * 100
          ELSE 0 
        END as profit_margin
      FROM projects p
      LEFT JOIN sow s ON p.id = s.project_id
      ${sql.unsafe(whereClause.replace('c.', 'p.'))}
    `
  ]);

  return {
    revenue: revenue,
    expenses: expenses,
    cashFlow: cashFlow,
    profitability: profitability[0],
    analysis: generateFinancialAnalysis(revenue, expenses, cashFlow)
  };
}

async function generateStaffPerformanceReport(department, startDate, endDate) {
  const conditions = [`s.status = 'active'`];
  if (department) conditions.push(`s.department = '${department}'`);
  
  const performanceConditions = [];
  if (startDate) performanceConditions.push(`sp.period_start >= '${startDate}'`);
  if (endDate) performanceConditions.push(`sp.period_start <= '${endDate}'`);

  const [staffMetrics, performanceTrends, topPerformers] = await Promise.all([
    sql`
      SELECT 
        s.department,
        COUNT(DISTINCT s.id) as staff_count,
        AVG(sp.productivity) as avg_productivity,
        AVG(sp.quality_score) as avg_quality,
        AVG(sp.safety_score) as avg_safety,
        SUM(sp.hours_worked) as total_hours,
        SUM(sp.tasks_completed) as total_tasks
      FROM staff s
      LEFT JOIN staff_performance sp ON s.id = sp.staff_id
      WHERE ${sql.unsafe(conditions.join(' AND '))}
      ${performanceConditions.length > 0 ? sql.unsafe('AND ' + performanceConditions.join(' AND ')) : sql``}
      GROUP BY s.department
    `,
    sql`
      SELECT 
        TO_CHAR(sp.period_start, 'YYYY-MM') as month,
        AVG(sp.productivity) as avg_productivity,
        AVG(sp.quality_score) as avg_quality,
        COUNT(DISTINCT sp.staff_id) as active_staff
      FROM staff_performance sp
      JOIN staff s ON sp.staff_id = s.id
      WHERE ${sql.unsafe(conditions.join(' AND '))}
      ${performanceConditions.length > 0 ? sql.unsafe('AND ' + performanceConditions.join(' AND ')) : sql``}
      GROUP BY TO_CHAR(sp.period_start, 'YYYY-MM')
      ORDER BY month
    `,
    sql`
      SELECT 
        s.name,
        s.role,
        s.department,
        AVG(sp.productivity) as avg_productivity,
        AVG(sp.quality_score) as avg_quality
      FROM staff s
      JOIN staff_performance sp ON s.id = sp.staff_id
      WHERE ${sql.unsafe(conditions.join(' AND '))}
      ${performanceConditions.length > 0 ? sql.unsafe('AND ' + performanceConditions.join(' AND ')) : sql``}
      GROUP BY s.id, s.name, s.role, s.department
      ORDER BY avg_productivity DESC
      LIMIT 10
    `
  ]);

  return {
    departmentMetrics: staffMetrics,
    trends: performanceTrends,
    topPerformers: topPerformers,
    insights: generateStaffInsights(staffMetrics, performanceTrends)
  };
}

async function generateKPIDashboardReport(startDate, endDate) {
  const dateFilter = startDate || endDate 
    ? `WHERE recorded_date BETWEEN COALESCE(${startDate}, '2020-01-01') AND COALESCE(${endDate}, CURRENT_DATE)`
    : '';

  const [currentKPIs, historicalKPIs, targets] = await Promise.all([
    sql`
      SELECT 
        metric_type,
        metric_name,
        AVG(metric_value) as current_value,
        MIN(metric_value) as min_value,
        MAX(metric_value) as max_value,
        unit
      FROM kpi_metrics
      ${sql.unsafe(dateFilter)}
      GROUP BY metric_type, metric_name, unit
    `.catch(() => []),
    sql`
      SELECT 
        TO_CHAR(recorded_date, 'YYYY-MM') as month,
        metric_type,
        AVG(metric_value) as avg_value
      FROM kpi_metrics
      ${sql.unsafe(dateFilter)}
      GROUP BY TO_CHAR(recorded_date, 'YYYY-MM'), metric_type
      ORDER BY month, metric_type
    `.catch(() => []),
    sql`
      SELECT * FROM kpi_targets WHERE active = true
    `.catch(() => [])
  ]);

  return {
    current: currentKPIs,
    historical: historicalKPIs,
    targets: targets,
    scorecard: generateKPIScorecard(currentKPIs, targets)
  };
}

async function generateResourceUtilizationReport(department, startDate, endDate) {
  const conditions = [`s.status = 'active'`];
  if (department) conditions.push(`s.department = '${department}'`);
  
  const [utilization, capacity, allocation] = await Promise.all([
    sql`
      SELECT 
        s.department,
        s.role,
        COUNT(DISTINCT s.id) as staff_count,
        AVG(sp.hours_worked) as avg_hours_worked,
        AVG(CASE WHEN sp.hours_worked > 0 THEN (sp.hours_worked / 160) * 100 ELSE 0 END) as avg_utilization
      FROM staff s
      LEFT JOIN staff_performance sp ON s.id = sp.staff_id
      WHERE ${sql.unsafe(conditions.join(' AND '))}
      ${startDate ? sql`AND sp.period_start >= ${startDate}` : sql``}
      ${endDate ? sql`AND sp.period_start <= ${endDate}` : sql``}
      GROUP BY s.department, s.role
    `,
    sql`
      SELECT 
        COUNT(DISTINCT s.id) as total_staff,
        COUNT(DISTINCT s.id) * 160 as total_capacity_hours,
        SUM(sp.hours_worked) as total_hours_worked
      FROM staff s
      LEFT JOIN staff_performance sp ON s.id = sp.staff_id
      WHERE ${sql.unsafe(conditions.join(' AND '))}
    `,
    sql`
      SELECT 
        p.name as project_name,
        COUNT(ps.staff_id) as staff_assigned,
        SUM(sp.hours_worked) as project_hours
      FROM projects p
      JOIN project_staff ps ON p.id = ps.project_id
      JOIN staff s ON ps.staff_id = s.id
      LEFT JOIN staff_performance sp ON s.id = sp.staff_id
      WHERE p.status IN ('ACTIVE', 'active')
      ${department ? sql`AND s.department = ${department}` : sql``}
      GROUP BY p.id, p.name
      ORDER BY project_hours DESC
      LIMIT 10
    `.catch(() => [])
  ]);

  return {
    utilization: utilization,
    capacity: capacity[0],
    projectAllocation: allocation,
    recommendations: generateUtilizationRecommendations(utilization, capacity[0])
  };
}

async function generateClientSummaryReport(clientId, startDate, endDate) {
  const conditions = [`c.status != 'deleted'`];
  if (clientId) conditions.push(`c.id = '${clientId}'`);
  
  const [clientData, projectHistory, financials] = await Promise.all([
    sql`
      SELECT 
        c.*,
        COUNT(p.id) as total_projects,
        COUNT(CASE WHEN p.status IN ('ACTIVE', 'active') THEN 1 END) as active_projects,
        COUNT(CASE WHEN p.status IN ('COMPLETED', 'completed') THEN 1 END) as completed_projects,
        SUM(p.budget) as total_budget,
        SUM(s.total_value) as total_revenue
      FROM clients c
      LEFT JOIN projects p ON c.id = p.client_id
      LEFT JOIN sow s ON p.id = s.project_id
      WHERE ${sql.unsafe(conditions.join(' AND '))}
      GROUP BY c.id
    `,
    sql`
      SELECT 
        p.name,
        p.status,
        p.start_date,
        p.end_date,
        p.budget,
        p.progress
      FROM projects p
      WHERE ${clientId ? sql`p.client_id = ${clientId}` : sql`1=1`}
      ${startDate ? sql`AND p.created_at >= ${startDate}` : sql``}
      ${endDate ? sql`AND p.created_at <= ${endDate}` : sql``}
      ORDER BY p.created_at DESC
    `,
    sql`
      SELECT 
        TO_CHAR(s.created_at, 'YYYY-MM') as month,
        SUM(s.total_value) as revenue,
        SUM(s.paid_amount) as collected,
        COUNT(*) as invoice_count
      FROM sow s
      JOIN projects p ON s.project_id = p.id
      WHERE ${clientId ? sql`p.client_id = ${clientId}` : sql`1=1`}
      GROUP BY TO_CHAR(s.created_at, 'YYYY-MM')
      ORDER BY month
    `
  ]);

  return {
    clients: clientData,
    projectHistory: projectHistory,
    financialHistory: financials,
    summary: generateClientSummary(clientData, projectHistory)
  };
}

// Helper functions
function buildDateFilter(startDate, endDate) {
  if (!startDate && !endDate) return '';
  if (startDate && endDate) return `WHERE created_at BETWEEN '${startDate}' AND '${endDate}'`;
  if (startDate) return `WHERE created_at >= '${startDate}'`;
  return `WHERE created_at <= '${endDate}'`;
}

function generateHighlights(projects, financial, staff) {
  const highlights = [];
  
  if (projects.completed_projects > 10) {
    highlights.push(`Successfully completed ${projects.completed_projects} projects`);
  }
  
  const profitMargin = financial.total_revenue > 0 
    ? ((financial.total_revenue - financial.total_expenses) / financial.total_revenue) * 100
    : 0;
  
  if (profitMargin > 20) {
    highlights.push(`Achieved ${Math.round(profitMargin)}% profit margin`);
  }
  
  if (staff.avg_productivity > 85) {
    highlights.push(`Staff productivity at ${Math.round(staff.avg_productivity)}%`);
  }
  
  return highlights;
}

function generateProjectRecommendations(projects) {
  const recommendations = [];
  
  const overdueProjects = projects.filter(p => p.performance_status === 'overdue');
  if (overdueProjects.length > 0) {
    recommendations.push({
      priority: 'high',
      area: 'timeline',
      recommendation: `${overdueProjects.length} projects are overdue. Consider resource reallocation.`
    });
  }
  
  const lowProgressProjects = projects.filter(p => p.progress < 30 && p.status === 'ACTIVE');
  if (lowProgressProjects.length > 0) {
    recommendations.push({
      priority: 'medium',
      area: 'progress',
      recommendation: `${lowProgressProjects.length} active projects have less than 30% progress.`
    });
  }
  
  return recommendations;
}

function generateFinancialAnalysis(revenue, expenses, cashFlow) {
  const totalRevenue = revenue.reduce((sum, r) => sum + (parseFloat(r.total_revenue) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.total_expenses) || 0), 0);
  
  return {
    summary: {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      profitMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0
    },
    trends: {
      revenueGrowth: calculateGrowthRate(revenue, 'total_revenue'),
      expenseGrowth: calculateGrowthRate(expenses, 'total_expenses')
    }
  };
}

function generateStaffInsights(metrics, trends) {
  const insights = [];
  
  const avgProductivity = metrics.reduce((sum, m) => sum + (parseFloat(m.avg_productivity) || 0), 0) / metrics.length;
  if (avgProductivity < 70) {
    insights.push({
      type: 'warning',
      message: 'Average productivity below target. Consider training programs.'
    });
  }
  
  return insights;
}

function generateKPIScorecard(kpis, targets) {
  const scorecard = {};
  
  kpis.forEach(kpi => {
    const target = targets.find(t => t.kpi_id === kpi.metric_type);
    if (target) {
      scorecard[kpi.metric_type] = {
        current: kpi.current_value,
        target: target.target_value,
        status: kpi.current_value >= target.target_value ? 'achieved' : 'below-target',
        variance: ((kpi.current_value - target.target_value) / target.target_value) * 100
      };
    }
  });
  
  return scorecard;
}

function generateUtilizationRecommendations(utilization, capacity) {
  const recommendations = [];
  
  const underUtilized = utilization.filter(u => u.avg_utilization < 70);
  if (underUtilized.length > 0) {
    recommendations.push({
      type: 'optimization',
      message: `${underUtilized.length} departments/roles are under-utilized. Consider workload redistribution.`
    });
  }
  
  return recommendations;
}

function generateClientSummary(clients, projects) {
  return clients.map(client => ({
    clientId: client.id,
    clientName: client.name,
    totalProjects: client.total_projects,
    successRate: client.total_projects > 0 
      ? (client.completed_projects / client.total_projects) * 100 
      : 0,
    totalValue: client.total_revenue || 0
  }));
}

function calculateGrowthRate(data, valueField) {
  if (data.length < 2) return 0;
  
  const firstValue = parseFloat(data[0][valueField]) || 0;
  const lastValue = parseFloat(data[data.length - 1][valueField]) || 0;
  
  return firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
}