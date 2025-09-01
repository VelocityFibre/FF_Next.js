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
        return await handleGetDocuments(req, res);
      case 'POST':
        return await handleUploadDocument(req, res);
      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleGetDocuments(req, res) {
  try {
    const { contractorId, documentType, status } = req.query;

    if (!contractorId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Contractor ID required' 
      });
    }

    let query = `
      SELECT 
        cd.*,
        c.company_name,
        c.contact_name
      FROM contractor_documents cd
      INNER JOIN contractors c ON cd.contractor_id = c.id
      WHERE cd.contractor_id = $1
    `;

    const params = [contractorId];
    let paramIndex = 2;

    if (documentType) {
      query += ` AND cd.document_type = $${paramIndex}`;
      params.push(documentType);
      paramIndex++;
    }

    if (status) {
      query += ` AND cd.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY cd.created_at DESC`;

    const documents = await sql(query, params);

    // Get document statistics
    const stats = await sql`
      SELECT 
        document_type,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        MAX(created_at) as last_uploaded
      FROM contractor_documents
      WHERE contractor_id = ${contractorId}
      GROUP BY document_type
    `;

    // Get required documents checklist
    const requiredDocs = [
      { type: 'business_registration', name: 'Business Registration', required: true },
      { type: 'insurance_liability', name: 'Liability Insurance', required: true },
      { type: 'insurance_wcb', name: 'WCB Coverage', required: true },
      { type: 'bank_information', name: 'Banking Information', required: true },
      { type: 'tax_clearance', name: 'Tax Clearance Certificate', required: false },
      { type: 'safety_certification', name: 'Safety Certification', required: false },
      { type: 'quality_certification', name: 'Quality Certification', required: false },
      { type: 'reference_letter', name: 'Reference Letters', required: false }
    ];

    // Check which required documents are missing
    const uploadedTypes = new Set(documents.map(doc => doc.document_type));
    const missingRequired = requiredDocs
      .filter(doc => doc.required && !uploadedTypes.has(doc.type))
      .map(doc => doc.type);

    return res.status(200).json({ 
      success: true, 
      data: {
        documents,
        statistics: stats,
        requiredDocuments: requiredDocs,
        missingRequired,
        totalDocuments: documents.length,
        approvedCount: documents.filter(d => d.status === 'approved').length,
        pendingCount: documents.filter(d => d.status === 'pending').length
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleUploadDocument(req, res) {
  try {
    const {
      contractorId,
      documentType,
      documentName,
      fileUrl,
      fileSize,
      mimeType,
      expiryDate,
      uploadedBy,
      metadata
    } = req.body;

    // Validate required fields
    if (!contractorId || !documentType || !documentName || !fileUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'Contractor ID, document type, name, and file URL are required' 
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

    // Check if this document type already exists and should be replaced
    const existing = await sql`
      SELECT id FROM contractor_documents
      WHERE contractor_id = ${contractorId}
      AND document_type = ${documentType}
      AND status != 'archived'
    `;

    // Archive existing documents of the same type
    if (existing.length > 0) {
      await sql`
        UPDATE contractor_documents
        SET status = 'archived', updated_at = NOW()
        WHERE contractor_id = ${contractorId}
        AND document_type = ${documentType}
        AND status != 'archived'
      `;
    }

    // Insert new document
    const document = await sql`
      INSERT INTO contractor_documents (
        contractor_id,
        document_type,
        document_name,
        file_url,
        file_size,
        mime_type,
        status,
        expiry_date,
        uploaded_by,
        metadata,
        created_at,
        updated_at
      )
      VALUES (
        ${contractorId},
        ${documentType},
        ${documentName},
        ${fileUrl},
        ${fileSize || null},
        ${mimeType || null},
        'pending',
        ${expiryDate || null},
        ${uploadedBy || 'system'},
        ${metadata ? JSON.stringify(metadata) : null},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    // Log activity
    const onboarding = await sql`
      SELECT id FROM contractor_onboarding
      WHERE contractor_id = ${contractorId}
      LIMIT 1
    `;

    if (onboarding.length > 0) {
      await sql`
        INSERT INTO contractor_onboarding_activity (
          onboarding_id,
          action,
          details,
          performed_by
        )
        VALUES (
          ${onboarding[0].id},
          'Document uploaded',
          ${JSON.stringify({
            documentType,
            documentName,
            documentId: document[0].id
          })},
          ${uploadedBy || 'system'}
        )
      `;
    }

    // Check if all required documents are now uploaded
    const requiredTypes = [
      'business_registration',
      'insurance_liability', 
      'insurance_wcb',
      'bank_information'
    ];

    const uploadedDocs = await sql`
      SELECT DISTINCT document_type 
      FROM contractor_documents
      WHERE contractor_id = ${contractorId}
      AND status IN ('pending', 'approved')
      AND document_type = ANY(${requiredTypes})
    `;

    const allRequiredUploaded = requiredTypes.every(type => 
      uploadedDocs.some(doc => doc.document_type === type)
    );

    return res.status(201).json({ 
      success: true, 
      data: document[0],
      allRequiredDocumentsUploaded: allRequiredUploaded,
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ 
        success: false, 
        error: 'This document has already been uploaded' 
      });
    }
    
    return res.status(500).json({ success: false, error: error.message });
  }
}