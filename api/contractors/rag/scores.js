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

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetRAGScores(req, res);
      case 'POST':
        return await handleUpdateRAGScore(req, res);
      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleGetRAGScores(req, res) {
  try {
    const { contractorId, includeHistory } = req.query;

    if (!contractorId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Contractor ID required' 
      });
    }

    // Get current RAG scores
    const contractor = await sql`
      SELECT 
        id,
        company_name,
        rag_overall,
        rag_financial,
        rag_compliance,
        rag_performance,
        rag_safety,
        rag_last_updated,
        rag_updated_by
      FROM contractors
      WHERE id = ${contractorId}
    `;

    if (contractor.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Contractor not found' 
      });
    }

    const result = {
      current: {
        contractorId: contractor[0].id,
        companyName: contractor[0].company_name,
        scores: {
          overall: contractor[0].rag_overall || 'amber',
          financial: contractor[0].rag_financial || 'amber',
          compliance: contractor[0].rag_compliance || 'amber',
          performance: contractor[0].rag_performance || 'amber',
          safety: contractor[0].rag_safety || 'amber'
        },
        lastUpdated: contractor[0].rag_last_updated,
        updatedBy: contractor[0].rag_updated_by
      }
    };

    // Get score history if requested
    if (includeHistory === 'true') {
      const history = await sql`
        SELECT 
          score_type,
          old_score,
          new_score,
          reason,
          updated_by,
          created_at
        FROM contractor_rag_history
        WHERE contractor_id = ${contractorId}
        ORDER BY created_at DESC
        LIMIT 50
      `;

      result.history = history;
    }

    // Get score breakdown/factors
    const factors = await sql`
      SELECT 
        factor_type,
        factor_name,
        factor_value,
        impact_on_score,
        last_evaluated
      FROM contractor_rag_factors
      WHERE contractor_id = ${contractorId}
      ORDER BY factor_type, factor_name
    `;

    result.factors = factors;

    // Get related metrics that influence scores
    const metrics = await sql`
      SELECT 
        COUNT(DISTINCT pa.project_id) as total_projects,
        COUNT(DISTINCT pa.project_id) FILTER (WHERE p.status = 'completed') as completed_projects,
        COUNT(DISTINCT pa.project_id) FILTER (WHERE p.status = 'active') as active_projects,
        AVG(CASE WHEN p.status = 'completed' THEN p.completion_percentage END) as avg_completion_rate,
        COUNT(DISTINCT cd.id) FILTER (WHERE cd.status = 'approved') as approved_documents,
        COUNT(DISTINCT cd.id) FILTER (WHERE cd.status = 'rejected') as rejected_documents,
        COUNT(DISTINCT cd.id) FILTER (WHERE cd.expiry_date < NOW()) as expired_documents
      FROM contractors c
      LEFT JOIN project_assignments pa ON c.id = pa.contractor_id
      LEFT JOIN projects p ON pa.project_id = p.id
      LEFT JOIN contractor_documents cd ON c.id = cd.contractor_id
      WHERE c.id = ${contractorId}
      GROUP BY c.id
    `;

    result.metrics = metrics[0] || {
      total_projects: 0,
      completed_projects: 0,
      active_projects: 0,
      avg_completion_rate: 0,
      approved_documents: 0,
      rejected_documents: 0,
      expired_documents: 0
    };

    return res.status(200).json({ 
      success: true, 
      data: result
    });
  } catch (error) {
    console.error('Error fetching RAG scores:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleUpdateRAGScore(req, res) {
  try {
    const {
      contractorId,
      scoreType,
      newScore,
      reason,
      updatedBy,
      factors
    } = req.body;

    // Validate required fields
    if (!contractorId || !scoreType || !newScore) {
      return res.status(400).json({ 
        success: false, 
        error: 'Contractor ID, score type, and new score are required' 
      });
    }

    // Validate score type
    const validScoreTypes = ['overall', 'financial', 'compliance', 'performance', 'safety'];
    if (!validScoreTypes.includes(scoreType)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid score type' 
      });
    }

    // Validate score value
    const validScores = ['green', 'amber', 'red'];
    if (!validScores.includes(newScore)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Score must be green, amber, or red' 
      });
    }

    // Get current score
    const current = await sql`
      SELECT 
        id,
        company_name,
        rag_overall,
        rag_financial,
        rag_compliance,
        rag_performance,
        rag_safety
      FROM contractors
      WHERE id = ${contractorId}
    `;

    if (current.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Contractor not found' 
      });
    }

    const oldScore = current[0][`rag_${scoreType}`];

    // Update the score
    const columnName = `rag_${scoreType}`;
    const updateQuery = `
      UPDATE contractors 
      SET 
        ${columnName} = $1,
        rag_last_updated = NOW(),
        rag_updated_by = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;

    const updated = await sql(updateQuery, [newScore, updatedBy || 'system', contractorId]);

    // Record history
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
        ${scoreType},
        ${oldScore},
        ${newScore},
        ${reason || null},
        ${updatedBy || 'system'},
        NOW()
      )
    `;

    // Update factors if provided
    if (factors && Array.isArray(factors)) {
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
            ${scoreType},
            ${factor.name},
            ${factor.value},
            ${factor.impact || null},
            NOW()
          )
          ON CONFLICT (contractor_id, factor_type, factor_name)
          DO UPDATE SET
            factor_value = ${factor.value},
            impact_on_score = ${factor.impact || null},
            last_evaluated = NOW()
        `;
      }
    }

    // If updating individual scores, recalculate overall score
    if (scoreType !== 'overall') {
      const scores = {
        financial: updated[0].rag_financial,
        compliance: updated[0].rag_compliance,
        performance: updated[0].rag_performance,
        safety: updated[0].rag_safety
      };

      // Calculate overall score (worst score wins)
      let overallScore = 'green';
      if (Object.values(scores).includes('red')) {
        overallScore = 'red';
      } else if (Object.values(scores).includes('amber')) {
        overallScore = 'amber';
      }

      // Update overall score if changed
      if (overallScore !== updated[0].rag_overall) {
        await sql`
          UPDATE contractors 
          SET 
            rag_overall = ${overallScore},
            updated_at = NOW()
          WHERE id = ${contractorId}
        `;

        // Record overall score change
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
            'overall',
            ${updated[0].rag_overall},
            ${overallScore},
            'Automatically recalculated based on individual scores',
            'system',
            NOW()
          )
        `;
      }
    }

    return res.status(200).json({ 
      success: true, 
      data: {
        contractorId: updated[0].id,
        companyName: updated[0].company_name,
        scoreType,
        oldScore,
        newScore,
        scores: {
          overall: scoreType === 'overall' ? newScore : updated[0].rag_overall,
          financial: scoreType === 'financial' ? newScore : updated[0].rag_financial,
          compliance: scoreType === 'compliance' ? newScore : updated[0].rag_compliance,
          performance: scoreType === 'performance' ? newScore : updated[0].rag_performance,
          safety: scoreType === 'safety' ? newScore : updated[0].rag_safety
        },
        updatedAt: new Date()
      },
      message: `RAG ${scoreType} score updated successfully`
    });
  } catch (error) {
    console.error('Error updating RAG score:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}