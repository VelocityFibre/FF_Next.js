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
        return await handleGetContractors(req, res);
      case 'POST':
        return await handleCreateContractor(req, res);
      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleGetContractors(req, res) {
  try {
    const { status, complianceStatus, ragOverall, teamId, search, isActive } = req.query;
    
    let query = `
      SELECT * FROM contractors 
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    // Apply filters
    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (complianceStatus) {
      query += ` AND compliance_status = $${paramIndex}`;
      params.push(complianceStatus);
      paramIndex++;
    }

    if (ragOverall) {
      query += ` AND rag_overall = $${paramIndex}`;
      params.push(ragOverall);
      paramIndex++;
    }

    if (teamId) {
      query += ` AND EXISTS (
        SELECT 1 FROM contractor_teams 
        WHERE contractor_teams.contractor_id = contractors.id 
        AND contractor_teams.team_id = $${paramIndex}
      )`;
      params.push(teamId);
      paramIndex++;
    }

    if (search) {
      query += ` AND (
        LOWER(company_name) LIKE LOWER($${paramIndex}) 
        OR LOWER(contact_name) LIKE LOWER($${paramIndex})
        OR LOWER(email) LIKE LOWER($${paramIndex})
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (isActive !== undefined) {
      query += ` AND is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;

    const result = params.length > 0 
      ? await sql(query, params)
      : await sql(query);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total FROM contractors WHERE 1=1
    `;
    
    // Apply the same filters for count
    const countParams = [];
    let countParamIndex = 1;

    if (status) {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }

    if (complianceStatus) {
      countQuery += ` AND compliance_status = $${countParamIndex}`;
      countParams.push(complianceStatus);
      countParamIndex++;
    }

    if (ragOverall) {
      countQuery += ` AND rag_overall = $${countParamIndex}`;
      countParams.push(ragOverall);
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (
        LOWER(company_name) LIKE LOWER($${countParamIndex}) 
        OR LOWER(contact_name) LIKE LOWER($${countParamIndex})
        OR LOWER(email) LIKE LOWER($${countParamIndex})
      )`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (isActive !== undefined) {
      countQuery += ` AND is_active = $${countParamIndex}`;
      countParams.push(isActive === 'true');
      countParamIndex++;
    }

    const countResult = countParams.length > 0
      ? await sql(countQuery, countParams)
      : await sql(countQuery);

    return res.status(200).json({ 
      success: true, 
      data: result,
      total: parseInt(countResult[0]?.total || 0)
    });
  } catch (error) {
    console.error('Error fetching contractors:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleCreateContractor(req, res) {
  try {
    const {
      companyName,
      contactName,
      email,
      phone,
      address,
      city,
      province,
      postalCode,
      country,
      website,
      businessNumber,
      gstNumber,
      pstNumber,
      wcbNumber,
      businessType,
      yearsInBusiness,
      numberOfEmployees,
      serviceAreas,
      capabilities,
      certifications,
      insuranceCoverage,
      bondingCapacity,
      status,
      notes
    } = req.body;

    // Validate required fields
    if (!companyName || !contactName || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Company name, contact name, and email are required' 
      });
    }

    const result = await sql`
      INSERT INTO contractors (
        company_name, contact_name, email, phone, address,
        city, province, postal_code, country, website,
        business_number, gst_number, pst_number, wcb_number,
        business_type, years_in_business, number_of_employees,
        service_areas, capabilities, certifications,
        insurance_coverage, bonding_capacity, status, notes,
        created_at, updated_at, is_active
      )
      VALUES (
        ${companyName}, ${contactName}, ${email}, ${phone || null}, ${address || null},
        ${city || null}, ${province || null}, ${postalCode || null}, ${country || 'Canada'}, ${website || null},
        ${businessNumber || null}, ${gstNumber || null}, ${pstNumber || null}, ${wcbNumber || null},
        ${businessType || null}, ${yearsInBusiness || null}, ${numberOfEmployees || null},
        ${serviceAreas || []}, ${capabilities || []}, ${certifications || []},
        ${insuranceCoverage || null}, ${bondingCapacity || null}, ${status || 'new'}, ${notes || null},
        NOW(), NOW(), true
      )
      RETURNING *
    `;

    return res.status(201).json({ 
      success: true, 
      data: result[0] 
    });
  } catch (error) {
    console.error('Error creating contractor:', error);
    
    // Check for unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({ 
        success: false, 
        error: 'A contractor with this email already exists' 
      });
    }
    
    return res.status(500).json({ success: false, error: error.message });
  }
}