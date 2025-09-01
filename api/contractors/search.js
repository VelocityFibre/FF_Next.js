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
    const {
      searchTerm,
      filters = {},
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 20
    } = req.body;

    let query = `
      SELECT * FROM contractors 
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    // Add search term
    if (searchTerm) {
      query += ` AND (
        LOWER(company_name) LIKE LOWER($${paramIndex}) 
        OR LOWER(contact_name) LIKE LOWER($${paramIndex})
        OR LOWER(email) LIKE LOWER($${paramIndex})
        OR LOWER(phone) LIKE LOWER($${paramIndex})
        OR LOWER(business_number) LIKE LOWER($${paramIndex})
        OR LOWER(notes) LIKE LOWER($${paramIndex})
      )`;
      params.push(`%${searchTerm}%`);
      paramIndex++;
    }

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      query += ` AND status = ANY($${paramIndex})`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.complianceStatus && filters.complianceStatus.length > 0) {
      query += ` AND compliance_status = ANY($${paramIndex})`;
      params.push(filters.complianceStatus);
      paramIndex++;
    }

    if (filters.ragOverall && filters.ragOverall.length > 0) {
      query += ` AND rag_overall = ANY($${paramIndex})`;
      params.push(filters.ragOverall);
      paramIndex++;
    }

    if (filters.businessType && filters.businessType.length > 0) {
      query += ` AND business_type = ANY($${paramIndex})`;
      params.push(filters.businessType);
      paramIndex++;
    }

    if (filters.capabilities && filters.capabilities.length > 0) {
      query += ` AND capabilities && $${paramIndex}`;
      params.push(filters.capabilities);
      paramIndex++;
    }

    if (filters.serviceAreas && filters.serviceAreas.length > 0) {
      query += ` AND service_areas && $${paramIndex}`;
      params.push(filters.serviceAreas);
      paramIndex++;
    }

    if (filters.certifications && filters.certifications.length > 0) {
      query += ` AND certifications && $${paramIndex}`;
      params.push(filters.certifications);
      paramIndex++;
    }

    if (filters.minEmployees !== undefined) {
      query += ` AND number_of_employees >= $${paramIndex}`;
      params.push(filters.minEmployees);
      paramIndex++;
    }

    if (filters.maxEmployees !== undefined) {
      query += ` AND number_of_employees <= $${paramIndex}`;
      params.push(filters.maxEmployees);
      paramIndex++;
    }

    if (filters.minYearsInBusiness !== undefined) {
      query += ` AND years_in_business >= $${paramIndex}`;
      params.push(filters.minYearsInBusiness);
      paramIndex++;
    }

    if (filters.minInsuranceCoverage !== undefined) {
      query += ` AND insurance_coverage >= $${paramIndex}`;
      params.push(filters.minInsuranceCoverage);
      paramIndex++;
    }

    if (filters.minBondingCapacity !== undefined) {
      query += ` AND bonding_capacity >= $${paramIndex}`;
      params.push(filters.minBondingCapacity);
      paramIndex++;
    }

    if (filters.province && filters.province.length > 0) {
      query += ` AND province = ANY($${paramIndex})`;
      params.push(filters.province);
      paramIndex++;
    }

    if (filters.city && filters.city.length > 0) {
      query += ` AND city = ANY($${paramIndex})`;
      params.push(filters.city);
      paramIndex++;
    }

    if (filters.isActive !== undefined) {
      query += ` AND is_active = $${paramIndex}`;
      params.push(filters.isActive);
      paramIndex++;
    }

    if (filters.hasProjects !== undefined) {
      if (filters.hasProjects) {
        query += ` AND EXISTS (
          SELECT 1 FROM project_assignments 
          WHERE project_assignments.contractor_id = contractors.id
        )`;
      } else {
        query += ` AND NOT EXISTS (
          SELECT 1 FROM project_assignments 
          WHERE project_assignments.contractor_id = contractors.id
        )`;
      }
    }

    if (filters.teamIds && filters.teamIds.length > 0) {
      query += ` AND EXISTS (
        SELECT 1 FROM contractor_teams 
        WHERE contractor_teams.contractor_id = contractors.id 
        AND contractor_teams.team_id = ANY($${paramIndex})
      )`;
      params.push(filters.teamIds);
      paramIndex++;
    }

    // Get total count
    let countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = params.length > 0
      ? await sql(countQuery, params)
      : await sql(countQuery);
    const total = parseInt(countResult[0]?.total || 0);

    // Add sorting
    const allowedSortColumns = [
      'created_at', 'updated_at', 'company_name', 'contact_name', 
      'status', 'compliance_status', 'rag_overall', 'years_in_business',
      'number_of_employees', 'insurance_coverage', 'bonding_capacity'
    ];
    
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortColumn} ${order}`;

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute main query
    const result = await sql(query, params);

    // Get additional statistics
    const stats = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'active') as active_count,
        COUNT(*) FILTER (WHERE status = 'onboarding') as onboarding_count,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive_count,
        COUNT(*) FILTER (WHERE rag_overall = 'green') as green_count,
        COUNT(*) FILTER (WHERE rag_overall = 'amber') as amber_count,
        COUNT(*) FILTER (WHERE rag_overall = 'red') as red_count,
        COUNT(*) FILTER (WHERE compliance_status = 'compliant') as compliant_count,
        COUNT(*) FILTER (WHERE compliance_status = 'non_compliant') as non_compliant_count
      FROM contractors
      WHERE is_active = true
    `;

    return res.status(200).json({ 
      success: true, 
      data: result,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      stats: stats[0]
    });
  } catch (error) {
    console.error('Error searching contractors:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}