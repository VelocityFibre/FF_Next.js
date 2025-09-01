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
        return await handleGetOnboardingStatus(req, res);
      case 'POST':
        return await handleStartOnboarding(req, res);
      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleGetOnboardingStatus(req, res) {
  try {
    const { contractorId, status } = req.query;

    if (!contractorId && !status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Either contractorId or status filter required' 
      });
    }

    let query = `
      SELECT 
        co.*,
        c.company_name,
        c.contact_name,
        c.email
      FROM contractor_onboarding co
      INNER JOIN contractors c ON co.contractor_id = c.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (contractorId) {
      query += ` AND co.contractor_id = $${paramIndex}`;
      params.push(contractorId);
      paramIndex++;
    }

    if (status) {
      query += ` AND co.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY co.updated_at DESC`;

    const result = params.length > 0
      ? await sql(query, params)
      : await sql(query);

    // If single contractor, get detailed progress
    if (contractorId && result.length > 0) {
      const onboarding = result[0];

      // Get checklist items
      const checklist = await sql`
        SELECT * FROM contractor_onboarding_checklist
        WHERE onboarding_id = ${onboarding.id}
        ORDER BY step_order
      `;

      // Get documents count by type
      const documents = await sql`
        SELECT 
          document_type,
          COUNT(*) as count,
          COUNT(*) FILTER (WHERE status = 'approved') as approved_count
        FROM contractor_documents
        WHERE contractor_id = ${contractorId}
        GROUP BY document_type
      `;

      return res.status(200).json({ 
        success: true, 
        data: {
          ...onboarding,
          checklist,
          documents,
          progress: calculateProgress(onboarding, checklist)
        }
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleStartOnboarding(req, res) {
  try {
    const { contractorId, startedBy } = req.body;

    if (!contractorId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Contractor ID required' 
      });
    }

    // Check if contractor exists
    const contractor = await sql`
      SELECT id, company_name FROM contractors 
      WHERE id = ${contractorId}
    `;

    if (contractor.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Contractor not found' 
      });
    }

    // Check if onboarding already exists
    const existing = await sql`
      SELECT id FROM contractor_onboarding 
      WHERE contractor_id = ${contractorId}
    `;

    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false, 
        error: 'Onboarding already exists for this contractor',
        onboardingId: existing[0].id
      });
    }

    // Create onboarding record
    const onboarding = await sql`
      INSERT INTO contractor_onboarding (
        contractor_id,
        status,
        current_stage,
        started_at,
        started_by,
        metadata
      )
      VALUES (
        ${contractorId},
        'in_progress',
        'company_info',
        NOW(),
        ${startedBy || 'system'},
        ${JSON.stringify({
          companyName: contractor[0].company_name,
          startedAt: new Date().toISOString()
        })}
      )
      RETURNING *
    `;

    // Create default checklist items
    const checklistItems = [
      { step: 'company_info', name: 'Company Information', order: 1 },
      { step: 'contact_details', name: 'Contact Details', order: 2 },
      { step: 'business_documents', name: 'Business Documents', order: 3 },
      { step: 'insurance_documents', name: 'Insurance Documents', order: 4 },
      { step: 'certifications', name: 'Certifications', order: 5 },
      { step: 'financial_info', name: 'Financial Information', order: 6 },
      { step: 'technical_capability', name: 'Technical Capability', order: 7 },
      { step: 'compliance_review', name: 'Compliance Review', order: 8 },
      { step: 'final_approval', name: 'Final Approval', order: 9 }
    ];

    for (const item of checklistItems) {
      await sql`
        INSERT INTO contractor_onboarding_checklist (
          onboarding_id,
          step_key,
          step_name,
          step_order,
          is_completed,
          is_required
        )
        VALUES (
          ${onboarding[0].id},
          ${item.step},
          ${item.name},
          ${item.order},
          false,
          true
        )
      `;
    }

    // Update contractor status
    await sql`
      UPDATE contractors 
      SET status = 'onboarding', updated_at = NOW()
      WHERE id = ${contractorId}
    `;

    return res.status(201).json({ 
      success: true, 
      data: onboarding[0],
      message: 'Onboarding process started successfully'
    });
  } catch (error) {
    console.error('Error starting onboarding:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

function calculateProgress(onboarding, checklist) {
  if (!checklist || checklist.length === 0) return 0;
  
  const completed = checklist.filter(item => item.is_completed).length;
  const total = checklist.filter(item => item.is_required).length;
  
  return Math.round((completed / total) * 100);
}