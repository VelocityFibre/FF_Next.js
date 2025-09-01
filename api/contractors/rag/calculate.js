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

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { contractorId, scoreTypes = ['all'], triggeredBy } = req.body;

    if (!contractorId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Contractor ID required' 
      });
    }

    // Get contractor data
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

    const scores = {};
    const factors = [];

    // Calculate Financial Score
    if (scoreTypes.includes('all') || scoreTypes.includes('financial')) {
      const financialData = await sql`
        SELECT 
          c.insurance_coverage,
          c.bonding_capacity,
          c.years_in_business,
          COUNT(DISTINCT p.id) as total_projects,
          COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'completed') as completed_projects,
          COUNT(DISTINCT p.id) FILTER (WHERE p.payment_status = 'overdue') as overdue_projects
        FROM contractors c
        LEFT JOIN project_assignments pa ON c.id = pa.contractor_id
        LEFT JOIN projects p ON pa.project_id = p.id
        WHERE c.id = ${contractorId}
        GROUP BY c.id
      `;

      const financial = financialData[0];
      let financialScore = 'green';
      
      // Financial scoring logic
      if (!financial.insurance_coverage || financial.insurance_coverage < 1000000) {
        financialScore = 'red';
        factors.push({ type: 'financial', name: 'insurance_coverage', value: 'insufficient', impact: 'negative' });
      }
      
      if (!financial.bonding_capacity || financial.bonding_capacity < 500000) {
        if (financialScore === 'green') financialScore = 'amber';
        factors.push({ type: 'financial', name: 'bonding_capacity', value: 'low', impact: 'negative' });
      }
      
      if (financial.overdue_projects > 0) {
        financialScore = 'red';
        factors.push({ type: 'financial', name: 'overdue_projects', value: financial.overdue_projects, impact: 'negative' });
      }
      
      if (financial.years_in_business < 2) {
        if (financialScore === 'green') financialScore = 'amber';
        factors.push({ type: 'financial', name: 'years_in_business', value: financial.years_in_business, impact: 'negative' });
      }

      scores.financial = financialScore;
    }

    // Calculate Compliance Score
    if (scoreTypes.includes('all') || scoreTypes.includes('compliance')) {
      const complianceData = await sql`
        SELECT 
          c.compliance_status,
          COUNT(DISTINCT cd.id) as total_documents,
          COUNT(DISTINCT cd.id) FILTER (WHERE cd.status = 'approved') as approved_documents,
          COUNT(DISTINCT cd.id) FILTER (WHERE cd.status = 'rejected') as rejected_documents,
          COUNT(DISTINCT cd.id) FILTER (WHERE cd.expiry_date < NOW()) as expired_documents,
          COUNT(DISTINCT cd.id) FILTER (WHERE cd.document_type IN ('business_registration', 'insurance_liability', 'insurance_wcb', 'bank_information') AND cd.status = 'approved') as required_approved
        FROM contractors c
        LEFT JOIN contractor_documents cd ON c.id = cd.contractor_id
        WHERE c.id = ${contractorId}
        GROUP BY c.id
      `;

      const compliance = complianceData[0];
      let complianceScore = 'green';
      
      // Compliance scoring logic
      if (compliance.expired_documents > 0) {
        complianceScore = 'red';
        factors.push({ type: 'compliance', name: 'expired_documents', value: compliance.expired_documents, impact: 'negative' });
      }
      
      if (compliance.rejected_documents > 0) {
        if (complianceScore === 'green') complianceScore = 'amber';
        factors.push({ type: 'compliance', name: 'rejected_documents', value: compliance.rejected_documents, impact: 'negative' });
      }
      
      if (compliance.required_approved < 4) {
        complianceScore = 'red';
        factors.push({ type: 'compliance', name: 'missing_required_documents', value: 4 - compliance.required_approved, impact: 'negative' });
      }
      
      if (compliance.compliance_status === 'non_compliant') {
        complianceScore = 'red';
        factors.push({ type: 'compliance', name: 'compliance_status', value: 'non_compliant', impact: 'negative' });
      }

      scores.compliance = complianceScore;
    }

    // Calculate Performance Score
    if (scoreTypes.includes('all') || scoreTypes.includes('performance')) {
      const performanceData = await sql`
        SELECT 
          COUNT(DISTINCT p.id) as total_projects,
          COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'completed') as completed_projects,
          COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'cancelled') as cancelled_projects,
          AVG(CASE WHEN p.status = 'completed' THEN p.completion_percentage END) as avg_completion_rate,
          AVG(CASE WHEN p.status = 'completed' THEN 
            EXTRACT(EPOCH FROM (p.actual_end_date - p.start_date)) / EXTRACT(EPOCH FROM (p.end_date - p.start_date))
          END) as avg_schedule_performance
        FROM contractors c
        LEFT JOIN project_assignments pa ON c.id = pa.contractor_id
        LEFT JOIN projects p ON pa.project_id = p.id
        WHERE c.id = ${contractorId}
        GROUP BY c.id
      `;

      const performance = performanceData[0];
      let performanceScore = 'green';
      
      // Performance scoring logic
      if (performance.total_projects > 0) {
        const completionRate = (performance.completed_projects / performance.total_projects) * 100;
        
        if (completionRate < 70) {
          performanceScore = 'red';
          factors.push({ type: 'performance', name: 'completion_rate', value: completionRate, impact: 'negative' });
        } else if (completionRate < 85) {
          performanceScore = 'amber';
          factors.push({ type: 'performance', name: 'completion_rate', value: completionRate, impact: 'moderate' });
        }
        
        if (performance.cancelled_projects > performance.total_projects * 0.1) {
          if (performanceScore === 'green') performanceScore = 'amber';
          factors.push({ type: 'performance', name: 'cancellation_rate', value: 'high', impact: 'negative' });
        }
        
        if (performance.avg_schedule_performance && performance.avg_schedule_performance > 1.2) {
          if (performanceScore === 'green') performanceScore = 'amber';
          factors.push({ type: 'performance', name: 'schedule_performance', value: 'delayed', impact: 'negative' });
        }
      } else {
        performanceScore = 'amber';
        factors.push({ type: 'performance', name: 'project_history', value: 'none', impact: 'neutral' });
      }

      scores.performance = performanceScore;
    }

    // Calculate Safety Score
    if (scoreTypes.includes('all') || scoreTypes.includes('safety')) {
      const safetyData = await sql`
        SELECT 
          c.id,
          COUNT(DISTINCT cd.id) FILTER (WHERE cd.document_type = 'safety_certification' AND cd.status = 'approved') as safety_certs,
          COUNT(DISTINCT si.id) as safety_incidents,
          COUNT(DISTINCT si.id) FILTER (WHERE si.severity = 'high') as high_severity_incidents
        FROM contractors c
        LEFT JOIN contractor_documents cd ON c.id = cd.contractor_id
        LEFT JOIN safety_incidents si ON c.id = si.contractor_id AND si.created_at > NOW() - INTERVAL '1 year'
        WHERE c.id = ${contractorId}
        GROUP BY c.id
      `;

      const safety = safetyData[0];
      let safetyScore = 'green';
      
      // Safety scoring logic
      if (safety.high_severity_incidents > 0) {
        safetyScore = 'red';
        factors.push({ type: 'safety', name: 'high_severity_incidents', value: safety.high_severity_incidents, impact: 'negative' });
      } else if (safety.safety_incidents > 2) {
        safetyScore = 'amber';
        factors.push({ type: 'safety', name: 'safety_incidents', value: safety.safety_incidents, impact: 'negative' });
      }
      
      if (safety.safety_certs === 0) {
        if (safetyScore === 'green') safetyScore = 'amber';
        factors.push({ type: 'safety', name: 'safety_certification', value: 'missing', impact: 'negative' });
      }

      scores.safety = safetyScore;
    }

    // Calculate overall score (worst score wins)
    let overallScore = 'green';
    const individualScores = Object.values(scores);
    if (individualScores.includes('red')) {
      overallScore = 'red';
    } else if (individualScores.includes('amber')) {
      overallScore = 'amber';
    }
    scores.overall = overallScore;

    // Update all calculated scores
    const updates = [];
    const params = [];
    let paramIndex = 1;

    Object.entries(scores).forEach(([type, score]) => {
      updates.push(`rag_${type} = $${paramIndex}`);
      params.push(score);
      paramIndex++;
    });

    updates.push(`rag_last_updated = NOW()`);
    updates.push(`rag_updated_by = $${paramIndex}`);
    params.push(triggeredBy || 'system');
    paramIndex++;

    params.push(contractorId);

    const updateQuery = `
      UPDATE contractors 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const updated = await sql(updateQuery, params);

    // Save factors
    for (const factor of factors) {
      await sql`
        INSERT INTO contractor_rag_factors (
          contractor_id,
          factor_type,
          factor_name,
          factor_value,
          impact_on_score,
          last_evaluated
        )
        VALUES (
          ${contractorId},
          ${factor.type},
          ${factor.name},
          ${JSON.stringify(factor.value)},
          ${factor.impact},
          NOW()
        )
        ON CONFLICT (contractor_id, factor_type, factor_name)
        DO UPDATE SET
          factor_value = ${JSON.stringify(factor.value)},
          impact_on_score = ${factor.impact},
          last_evaluated = NOW()
      `;
    }

    // Record calculation in history
    await sql`
      INSERT INTO contractor_rag_history (
        contractor_id,
        score_type,
        old_score,
        new_score,
        reason,
        updated_by,
        created_at
      )
      VALUES (
        ${contractorId},
        'calculation',
        ${JSON.stringify({ note: 'Bulk calculation performed' })},
        ${JSON.stringify(scores)},
        'Automated RAG score calculation',
        ${triggeredBy || 'system'},
        NOW()
      )
    `;

    return res.status(200).json({ 
      success: true, 
      data: {
        contractorId: updated[0].id,
        companyName: updated[0].company_name,
        scores,
        factors,
        calculatedAt: new Date()
      },
      message: 'RAG scores calculated successfully'
    });
  } catch (error) {
    console.error('Error calculating RAG scores:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}