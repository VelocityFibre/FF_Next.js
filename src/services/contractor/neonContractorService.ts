/**
 * Neon Contractor Service - Direct database operations for contractors
 * Uses Neon PostgreSQL for all contractor-related operations
 */

import { neon } from '@neondatabase/serverless';
import { log } from '@/lib/logger';
import type { 
  Contractor, 
  ContractorFormData,
  ContractorTeam,
  TeamFormData,
  ContractorDocument,
  RAGScore
} from '@/types/contractor.types';

// Database connection
const sql = neon(process.env.DATABASE_URL || '');

export const neonContractorService = {
  // ==================== CONTRACTOR CRUD ====================
  
  /**
   * Get all contractors with optional filters
   */
  async getContractors(filters?: {
    status?: string;
    complianceStatus?: string;
    ragOverall?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<Contractor[]> {
    try {
      let query = `
        SELECT * FROM contractors 
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (filters?.status) {
        query += ` AND status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      if (filters?.complianceStatus) {
        query += ` AND compliance_status = $${paramIndex}`;
        params.push(filters.complianceStatus);
        paramIndex++;
      }

      if (filters?.ragOverall) {
        query += ` AND rag_overall = $${paramIndex}`;
        params.push(filters.ragOverall);
        paramIndex++;
      }

      if (filters?.isActive !== undefined) {
        query += ` AND is_active = $${paramIndex}`;
        params.push(filters.isActive);
        paramIndex++;
      }

      if (filters?.search) {
        query += ` AND (
          LOWER(company_name) LIKE LOWER($${paramIndex}) OR
          LOWER(contact_person) LIKE LOWER($${paramIndex}) OR
          LOWER(email) LIKE LOWER($${paramIndex})
        )`;
        params.push(`%${filters.search}%`);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC`;

      const result = await sql(query, params);
      return this.mapContractors(result);
    } catch (error) {
      log.error('Error fetching contractors:', { data: error }, 'neonContractorService');
      throw error;
    }
  },

  /**
   * Get contractor by ID
   */
  async getContractorById(id: string): Promise<Contractor | null> {
    try {
      const result = await sql`
        SELECT * FROM contractors 
        WHERE id = ${id}
      `;
      
      if (result.length === 0) return null;
      return this.mapContractor(result[0]);
    } catch (error) {
      log.error('Error fetching contractor by ID:', { data: error }, 'neonContractorService');
      throw error;
    }
  },

  /**
   * Create new contractor
   */
  async createContractor(data: ContractorFormData): Promise<Contractor> {
    try {
      const result = await sql`
        INSERT INTO contractors (
          company_name, registration_number, business_type, industry_category,
          years_in_business, employee_count, contact_person, email, phone,
          alternate_phone, physical_address, postal_address, city, province,
          postal_code, annual_turnover, credit_rating, payment_terms,
          bank_name, account_number, branch_code, specializations,
          certifications, notes, tags, created_by
        ) VALUES (
          ${data.companyName}, ${data.registrationNumber}, ${data.businessType},
          ${data.industryCategory}, ${data.yearsInBusiness}, ${data.employeeCount},
          ${data.contactPerson}, ${data.email}, ${data.phone}, ${data.alternatePhone},
          ${data.physicalAddress}, ${data.postalAddress}, ${data.city}, ${data.province},
          ${data.postalCode}, ${data.annualTurnover}, ${data.creditRating},
          ${data.paymentTerms}, ${data.bankName}, ${data.accountNumber},
          ${data.branchCode}, ${JSON.stringify(data.specializations || [])},
          ${JSON.stringify(data.certifications || [])}, ${data.notes},
          ${JSON.stringify(data.tags || [])}, ${data.createdBy}
        )
        RETURNING *
      `;
      
      return this.mapContractor(result[0]);
    } catch (error) {
      log.error('Error creating contractor:', { data: error }, 'neonContractorService');
      throw error;
    }
  },

  /**
   * Update contractor
   */
  async updateContractor(id: string, data: Partial<ContractorFormData>): Promise<Contractor> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      // Build dynamic update query
      if (data.companyName !== undefined) {
        updateFields.push(`company_name = $${paramIndex}`);
        params.push(data.companyName);
        paramIndex++;
      }

      if (data.contactPerson !== undefined) {
        updateFields.push(`contact_person = $${paramIndex}`);
        params.push(data.contactPerson);
        paramIndex++;
      }

      if (data.email !== undefined) {
        updateFields.push(`email = $${paramIndex}`);
        params.push(data.email);
        paramIndex++;
      }

      if (data.phone !== undefined) {
        updateFields.push(`phone = $${paramIndex}`);
        params.push(data.phone);
        paramIndex++;
      }

      if (data.status !== undefined) {
        updateFields.push(`status = $${paramIndex}`);
        params.push(data.status);
        paramIndex++;
      }

      // Add more fields as needed...

      updateFields.push(`updated_at = NOW()`);

      const query = `
        UPDATE contractors 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;
      params.push(id);

      const result = await sql(query, params);
      return this.mapContractor(result[0]);
    } catch (error) {
      log.error('Error updating contractor:', { data: error }, 'neonContractorService');
      throw error;
    }
  },

  /**
   * Delete contractor (soft delete)
   */
  async deleteContractor(id: string): Promise<void> {
    try {
      await sql`
        UPDATE contractors 
        SET is_active = false, updated_at = NOW()
        WHERE id = ${id}
      `;
    } catch (error) {
      log.error('Error deleting contractor:', { data: error }, 'neonContractorService');
      throw error;
    }
  },

  // ==================== TEAM MANAGEMENT ====================
  
  /**
   * Get teams for a contractor
   */
  async getContractorTeams(contractorId: string): Promise<ContractorTeam[]> {
    try {
      const result = await sql`
        SELECT * FROM contractor_teams
        WHERE contractor_id = ${contractorId}
        ORDER BY created_at DESC
      `;
      
      return this.mapTeams(result);
    } catch (error) {
      log.error('Error fetching contractor teams:', { data: error }, 'neonContractorService');
      throw error;
    }
  },

  /**
   * Create contractor team
   */
  async createTeam(contractorId: string, data: TeamFormData): Promise<ContractorTeam> {
    try {
      const result = await sql`
        INSERT INTO contractor_teams (
          contractor_id, team_name, team_type, team_size,
          lead_name, lead_phone, lead_email, lead_certification,
          members, specializations, equipment_available, service_areas,
          availability, max_capacity, notes, created_by
        ) VALUES (
          ${contractorId}, ${data.teamName}, ${data.teamType}, ${data.teamSize},
          ${data.leadName}, ${data.leadPhone}, ${data.leadEmail}, ${data.leadCertification},
          ${JSON.stringify(data.members || [])}, ${JSON.stringify(data.specializations || [])},
          ${JSON.stringify(data.equipmentAvailable || [])}, ${JSON.stringify(data.serviceAreas || [])},
          ${data.availability || 'available'}, ${data.maxCapacity || 5},
          ${data.notes}, ${data.createdBy}
        )
        RETURNING *
      `;
      
      return this.mapTeam(result[0]);
    } catch (error) {
      log.error('Error creating team:', { data: error }, 'neonContractorService');
      throw error;
    }
  },

  /**
   * Update contractor team
   */
  async updateTeam(teamId: string, data: Partial<TeamFormData>): Promise<ContractorTeam> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (data.teamName !== undefined) {
        updateFields.push(`team_name = $${paramIndex}`);
        params.push(data.teamName);
        paramIndex++;
      }

      if (data.teamSize !== undefined) {
        updateFields.push(`team_size = $${paramIndex}`);
        params.push(data.teamSize);
        paramIndex++;
      }

      if (data.availability !== undefined) {
        updateFields.push(`availability = $${paramIndex}`);
        params.push(data.availability);
        paramIndex++;
      }

      updateFields.push(`updated_at = NOW()`);

      const query = `
        UPDATE contractor_teams 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;
      params.push(teamId);

      const result = await sql(query, params);
      return this.mapTeam(result[0]);
    } catch (error) {
      log.error('Error updating team:', { data: error }, 'neonContractorService');
      throw error;
    }
  },

  /**
   * Delete contractor team
   */
  async deleteTeam(teamId: string): Promise<void> {
    try {
      await sql`
        DELETE FROM contractor_teams
        WHERE id = ${teamId}
      `;
    } catch (error) {
      log.error('Error deleting team:', { data: error }, 'neonContractorService');
      throw error;
    }
  },

  // ==================== DOCUMENT MANAGEMENT ====================
  
  /**
   * Get documents for a contractor
   */
  async getContractorDocuments(contractorId: string): Promise<ContractorDocument[]> {
    try {
      const result = await sql`
        SELECT * FROM contractor_documents
        WHERE contractor_id = ${contractorId}
        ORDER BY created_at DESC
      `;
      
      return this.mapDocuments(result);
    } catch (error) {
      log.error('Error fetching contractor documents:', { data: error }, 'neonContractorService');
      throw error;
    }
  },

  /**
   * Add document to contractor
   */
  async addDocument(contractorId: string, document: {
    documentType: string;
    documentName: string;
    fileName: string;
    filePath: string;
    fileUrl?: string;
    expiryDate?: Date;
    notes?: string;
  }): Promise<ContractorDocument> {
    try {
      const result = await sql`
        INSERT INTO contractor_documents (
          contractor_id, document_type, document_name,
          file_name, file_path, file_url, expiry_date, notes
        ) VALUES (
          ${contractorId}, ${document.documentType}, ${document.documentName},
          ${document.fileName}, ${document.filePath}, ${document.fileUrl},
          ${document.expiryDate}, ${document.notes}
        )
        RETURNING *
      `;
      
      return this.mapDocument(result[0]);
    } catch (error) {
      log.error('Error adding document:', { data: error }, 'neonContractorService');
      throw error;
    }
  },

  /**
   * Update document status
   */
  async updateDocumentStatus(documentId: string, status: string, notes?: string): Promise<void> {
    try {
      await sql`
        UPDATE contractor_documents
        SET status = ${status}, 
            verification_notes = ${notes},
            updated_at = NOW()
        WHERE id = ${documentId}
      `;
    } catch (error) {
      log.error('Error updating document status:', { data: error }, 'neonContractorService');
      throw error;
    }
  },

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      await sql`
        DELETE FROM contractor_documents
        WHERE id = ${documentId}
      `;
    } catch (error) {
      log.error('Error deleting document:', { data: error }, 'neonContractorService');
      throw error;
    }
  },

  // ==================== RAG SCORING ====================
  
  /**
   * Update RAG scores
   */
  async updateRAGScores(contractorId: string, scores: {
    overall?: RAGScore;
    financial?: RAGScore;
    compliance?: RAGScore;
    performance?: RAGScore;
    safety?: RAGScore;
  }): Promise<void> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (scores.overall) {
        updateFields.push(`rag_overall = $${paramIndex}`);
        params.push(scores.overall);
        paramIndex++;
      }

      if (scores.financial) {
        updateFields.push(`rag_financial = $${paramIndex}`);
        params.push(scores.financial);
        paramIndex++;
      }

      if (scores.compliance) {
        updateFields.push(`rag_compliance = $${paramIndex}`);
        params.push(scores.compliance);
        paramIndex++;
      }

      if (scores.performance) {
        updateFields.push(`rag_performance = $${paramIndex}`);
        params.push(scores.performance);
        paramIndex++;
      }

      if (scores.safety) {
        updateFields.push(`rag_safety = $${paramIndex}`);
        params.push(scores.safety);
        paramIndex++;
      }

      updateFields.push(`updated_at = NOW()`);

      const query = `
        UPDATE contractors 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
      `;
      params.push(contractorId);

      await sql(query, params);

      // Record RAG history
      for (const [scoreType, newScore] of Object.entries(scores)) {
        if (newScore) {
          await this.recordRAGHistory(contractorId, scoreType, newScore);
        }
      }
    } catch (error) {
      log.error('Error updating RAG scores:', { data: error }, 'neonContractorService');
      throw error;
    }
  },

  /**
   * Record RAG score history
   */
  async recordRAGHistory(contractorId: string, scoreType: string, newScore: RAGScore): Promise<void> {
    try {
      await sql`
        INSERT INTO contractor_rag_history (
          contractor_id, score_type, new_score
        ) VALUES (
          ${contractorId}, ${scoreType}, ${newScore}
        )
      `;
    } catch (error) {
      log.error('Error recording RAG history:', { data: error }, 'neonContractorService');
      throw error;
    }
  },

  // ==================== DATA MAPPING ====================
  
  /**
   * Map database row to Contractor type
   */
  mapContractor(row: any): Contractor {
    return {
      id: row.id.toString(),
      companyName: row.company_name,
      registrationNumber: row.registration_number,
      businessType: row.business_type,
      industryCategory: row.industry_category,
      yearsInBusiness: row.years_in_business,
      employeeCount: row.employee_count,
      contactPerson: row.contact_person,
      email: row.email,
      phone: row.phone,
      alternatePhone: row.alternate_phone,
      physicalAddress: row.physical_address,
      postalAddress: row.postal_address,
      city: row.city,
      province: row.province,
      postalCode: row.postal_code,
      annualTurnover: row.annual_turnover,
      creditRating: row.credit_rating,
      paymentTerms: row.payment_terms,
      bankName: row.bank_name,
      accountNumber: row.account_number,
      branchCode: row.branch_code,
      status: row.status,
      isActive: row.is_active,
      complianceStatus: row.compliance_status,
      ragOverall: row.rag_overall,
      ragFinancial: row.rag_financial,
      ragCompliance: row.rag_compliance,
      ragPerformance: row.rag_performance,
      ragSafety: row.rag_safety,
      performanceScore: row.performance_score,
      safetyScore: row.safety_score,
      qualityScore: row.quality_score,
      timelinessScore: row.timeliness_score,
      specializations: row.specializations || [],
      totalProjects: row.total_projects,
      completedProjects: row.completed_projects,
      activeProjects: row.active_projects,
      cancelledProjects: row.cancelled_projects,
      successRate: row.success_rate,
      onTimeCompletion: row.on_time_completion,
      averageProjectValue: row.average_project_value,
      certifications: row.certifications || [],
      onboardingProgress: row.onboarding_progress,
      onboardingCompletedAt: row.onboarding_completed_at,
      documentsExpiring: row.documents_expiring,
      notes: row.notes,
      tags: row.tags || [],
      lastActivity: row.last_activity,
      nextReviewDate: row.next_review_date,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  },

  mapContractors(rows: any[]): Contractor[] {
    return rows.map(row => this.mapContractor(row));
  },

  mapTeam(row: any): ContractorTeam {
    return {
      id: row.id.toString(),
      contractorId: row.contractor_id.toString(),
      teamName: row.team_name,
      teamType: row.team_type,
      teamSize: row.team_size,
      leadName: row.lead_name,
      leadPhone: row.lead_phone,
      leadEmail: row.lead_email,
      leadCertification: row.lead_certification,
      members: row.members || [],
      specializations: row.specializations || [],
      equipmentAvailable: row.equipment_available || [],
      serviceAreas: row.service_areas || [],
      availability: row.availability,
      currentWorkload: row.current_workload,
      maxCapacity: row.max_capacity,
      teamRating: row.team_rating,
      projectsCompleted: row.projects_completed,
      averageCompletionTime: row.average_completion_time,
      isActive: row.is_active,
      lastAssignmentDate: row.last_assignment_date,
      notes: row.notes,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  },

  mapTeams(rows: any[]): ContractorTeam[] {
    return rows.map(row => this.mapTeam(row));
  },

  mapDocument(row: any): ContractorDocument {
    return {
      id: row.id.toString(),
      contractorId: row.contractor_id.toString(),
      documentType: row.document_type,
      documentName: row.document_name,
      documentNumber: row.document_number,
      fileName: row.file_name,
      filePath: row.file_path,
      fileUrl: row.file_url,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      issueDate: row.issue_date,
      expiryDate: row.expiry_date,
      isExpired: row.is_expired,
      daysUntilExpiry: row.days_until_expiry,
      isVerified: row.is_verified,
      verifiedBy: row.verified_by,
      verifiedAt: row.verified_at,
      verificationNotes: row.verification_notes,
      status: row.status,
      rejectionReason: row.rejection_reason,
      notes: row.notes,
      tags: row.tags || [],
      uploadedBy: row.uploaded_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  },

  mapDocuments(rows: any[]): ContractorDocument[] {
    return rows.map(row => this.mapDocument(row));
  }
};