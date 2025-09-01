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

  try {
    const { contractorId, dateFrom, dateTo, groupBy = 'month' } = req.query;

    // If specific contractor analytics requested
    if (contractorId) {
      return await handleContractorAnalytics(req, res, contractorId, dateFrom, dateTo);
    }

    // Otherwise return overall analytics
    return await handleOverallAnalytics(req, res, dateFrom, dateTo, groupBy);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleContractorAnalytics(req, res, contractorId, dateFrom, dateTo) {
  try {
    // Get contractor details
    const contractor = await sql`
      SELECT * FROM contractors 
      WHERE id = ${contractorId}
    `;

    if (contractor.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Contractor not found' 
      });
    }

    // Build date filter
    let dateFilter = '';
    const params = [contractorId];
    let paramIndex = 2;

    if (dateFrom) {
      dateFilter += ` AND p.created_at >= $${paramIndex}`;
      params.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      dateFilter += ` AND p.created_at <= $${paramIndex}`;
      params.push(dateTo);
      paramIndex++;
    }

    // Get project performance metrics
    const projectQuery = `
      SELECT 
        COUNT(DISTINCT p.id) as total_projects,
        COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'completed') as completed_projects,
        COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') as active_projects,
        COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'cancelled') as cancelled_projects,
        AVG(CASE WHEN p.status = 'completed' THEN p.completion_percentage END) as avg_completion_rate,
        AVG(CASE WHEN p.status = 'completed' THEN 
          EXTRACT(EPOCH FROM (p.actual_end_date - p.start_date)) / NULLIF(EXTRACT(EPOCH FROM (p.end_date - p.start_date)), 0)
        END) as avg_schedule_performance,
        SUM(p.budget) as total_budget,
        SUM(p.actual_cost) as total_actual_cost,
        AVG(CASE WHEN p.budget > 0 THEN (p.actual_cost / p.budget) END) as avg_cost_performance
      FROM project_assignments pa
      INNER JOIN projects p ON pa.project_id = p.id
      WHERE pa.contractor_id = $1
      ${dateFilter}
    `;

    const projectMetrics = await sql(projectQuery, params);

    // Get monthly trend data
    const trendQuery = `
      SELECT 
        DATE_TRUNC('month', p.created_at) as month,
        COUNT(DISTINCT p.id) as projects_started,
        COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'completed') as projects_completed,
        SUM(p.budget) as monthly_budget,
        AVG(p.completion_percentage) as avg_completion
      FROM project_assignments pa
      INNER JOIN projects p ON pa.project_id = p.id
      WHERE pa.contractor_id = $1
      ${dateFilter}
      GROUP BY DATE_TRUNC('month', p.created_at)
      ORDER BY month DESC
      LIMIT 12
    `;

    const monthlyTrends = await sql(trendQuery, params);

    // Get document compliance metrics
    const documentMetrics = await sql`
      SELECT 
        COUNT(*) as total_documents,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_documents,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_documents,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_documents,
        COUNT(*) FILTER (WHERE expiry_date < NOW()) as expired_documents,
        COUNT(DISTINCT document_type) as document_types
      FROM contractor_documents
      WHERE contractor_id = ${contractorId}
    `;

    // Get team participation
    const teamMetrics = await sql`
      SELECT 
        COUNT(DISTINCT ct.team_id) as total_teams,
        COUNT(DISTINCT tm.user_id) as total_team_members,
        ARRAY_AGG(DISTINCT t.name) as team_names
      FROM contractor_teams ct
      INNER JOIN teams t ON ct.team_id = t.id
      LEFT JOIN team_members tm ON t.id = tm.team_id AND tm.is_active = true
      WHERE ct.contractor_id = ${contractorId}
      AND ct.is_active = true
    `;

    // Get RAG score history
    const ragHistory = await sql`
      SELECT 
        score_type,
        new_score,
        created_at
      FROM contractor_rag_history
      WHERE contractor_id = ${contractorId}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    // Get financial performance
    const financialMetrics = await sql`
      SELECT 
        SUM(amount) as total_invoiced,
        SUM(amount) FILTER (WHERE status = 'paid') as total_paid,
        SUM(amount) FILTER (WHERE status = 'overdue') as total_overdue,
        COUNT(*) as total_invoices,
        AVG(EXTRACT(EPOCH FROM (paid_date - invoice_date)) / 86400) as avg_payment_days
      FROM contractor_invoices
      WHERE contractor_id = ${contractorId}
    `;

    return res.status(200).json({ 
      success: true, 
      data: {
        contractor: {
          id: contractor[0].id,
          companyName: contractor[0].company_name,
          status: contractor[0].status,
          ragOverall: contractor[0].rag_overall
        },
        projectMetrics: projectMetrics[0],
        monthlyTrends: monthlyTrends,
        documentMetrics: documentMetrics[0],
        teamMetrics: teamMetrics[0],
        ragHistory: ragHistory,
        financialMetrics: financialMetrics[0] || {
          total_invoiced: 0,
          total_paid: 0,
          total_overdue: 0,
          total_invoices: 0,
          avg_payment_days: null
        },
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching contractor analytics:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleOverallAnalytics(req, res, dateFrom, dateTo, groupBy) {
  try {
    // Build date filter
    let dateFilter = '';
    const params = [];
    let paramIndex = 1;

    if (dateFrom) {
      dateFilter += ` WHERE created_at >= $${paramIndex}`;
      params.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      dateFilter += dateFilter ? ` AND created_at <= $${paramIndex}` : ` WHERE created_at <= $${paramIndex}`;
      params.push(dateTo);
      paramIndex++;
    }

    // Get overall contractor statistics
    const overallStats = await sql`
      SELECT 
        COUNT(*) as total_contractors,
        COUNT(*) FILTER (WHERE status = 'active') as active_contractors,
        COUNT(*) FILTER (WHERE status = 'onboarding') as onboarding_contractors,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive_contractors,
        COUNT(*) FILTER (WHERE rag_overall = 'green') as green_contractors,
        COUNT(*) FILTER (WHERE rag_overall = 'amber') as amber_contractors,
        COUNT(*) FILTER (WHERE rag_overall = 'red') as red_contractors,
        COUNT(*) FILTER (WHERE compliance_status = 'compliant') as compliant_contractors,
        COUNT(*) FILTER (WHERE compliance_status = 'non_compliant') as non_compliant_contractors
      FROM contractors
      WHERE is_active = true
    `;

    // Get contractor growth trend
    const growthQuery = `
      SELECT 
        DATE_TRUNC('${groupBy}', created_at) as period,
        COUNT(*) as new_contractors,
        COUNT(*) FILTER (WHERE status = 'active') as activated_contractors
      FROM contractors
      ${dateFilter}
      GROUP BY DATE_TRUNC('${groupBy}', created_at)
      ORDER BY period DESC
      LIMIT 24
    `;

    const growthTrend = params.length > 0 
      ? await sql(growthQuery, params)
      : await sql(growthQuery);

    // Get top performing contractors
    const topPerformers = await sql`
      SELECT 
        c.id,
        c.company_name,
        c.rag_overall,
        COUNT(DISTINCT pa.project_id) as total_projects,
        COUNT(DISTINCT pa.project_id) FILTER (WHERE p.status = 'completed') as completed_projects,
        AVG(CASE WHEN p.status = 'completed' THEN p.completion_percentage END) as avg_completion_rate,
        SUM(p.budget) as total_budget
      FROM contractors c
      LEFT JOIN project_assignments pa ON c.id = pa.contractor_id
      LEFT JOIN projects p ON pa.project_id = p.id
      WHERE c.is_active = true
      GROUP BY c.id, c.company_name, c.rag_overall
      HAVING COUNT(DISTINCT pa.project_id) > 0
      ORDER BY completed_projects DESC, avg_completion_rate DESC
      LIMIT 10
    `;

    // Get contractors by category/type
    const byCategory = await sql`
      SELECT 
        business_type,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE status = 'active') as active_count,
        AVG(years_in_business) as avg_years_in_business,
        AVG(number_of_employees) as avg_employees
      FROM contractors
      WHERE is_active = true
      AND business_type IS NOT NULL
      GROUP BY business_type
      ORDER BY count DESC
    `;

    // Get capability distribution
    const capabilities = await sql`
      SELECT 
        capability,
        COUNT(*) as contractor_count
      FROM (
        SELECT unnest(capabilities) as capability
        FROM contractors
        WHERE is_active = true
        AND capabilities IS NOT NULL
      ) as cap
      GROUP BY capability
      ORDER BY contractor_count DESC
      LIMIT 20
    `;

    // Get geographical distribution
    const geographical = await sql`
      SELECT 
        province,
        city,
        COUNT(*) as contractor_count,
        COUNT(*) FILTER (WHERE status = 'active') as active_count
      FROM contractors
      WHERE is_active = true
      AND province IS NOT NULL
      GROUP BY province, city
      ORDER BY contractor_count DESC
      LIMIT 20
    `;

    // Get compliance summary
    const complianceSummary = await sql`
      SELECT 
        COUNT(DISTINCT c.id) as contractors_with_docs,
        COUNT(DISTINCT cd.id) as total_documents,
        COUNT(DISTINCT cd.id) FILTER (WHERE cd.status = 'approved') as approved_documents,
        COUNT(DISTINCT cd.id) FILTER (WHERE cd.expiry_date < NOW()) as expired_documents,
        COUNT(DISTINCT c.id) FILTER (WHERE EXISTS (
          SELECT 1 FROM contractor_documents cd2 
          WHERE cd2.contractor_id = c.id 
          AND cd2.expiry_date < NOW()
        )) as contractors_with_expired_docs
      FROM contractors c
      LEFT JOIN contractor_documents cd ON c.id = cd.contractor_id
      WHERE c.is_active = true
    `;

    return res.status(200).json({ 
      success: true, 
      data: {
        overview: overallStats[0],
        growthTrend: growthTrend,
        topPerformers: topPerformers,
        byCategory: byCategory,
        capabilities: capabilities,
        geographical: geographical,
        compliance: complianceSummary[0],
        filters: {
          dateFrom,
          dateTo,
          groupBy
        },
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching overall analytics:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}