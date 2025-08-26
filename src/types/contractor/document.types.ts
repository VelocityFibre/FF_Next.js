/**
 * Contractor Document Types - Document management definitions
 */

export interface ContractorDocument {
  id: string;
  contractorId: string;
  
  // Document Details
  documentType: DocumentType;
  documentName: string;
  documentNumber?: string;
  
  // File Information
  fileName: string;
  fileUrl: string;
  fileSize?: number; // bytes
  mimeType?: string;
  
  // Validity
  issueDate?: Date;
  expiryDate?: Date;
  isExpired: boolean;
  daysUntilExpiry?: number;
  
  // Status
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: Date;
  
  // Notes
  notes?: string;
  rejectionReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
  uploadedAt?: Date; // When the document was uploaded
}

export type DocumentType = 
  // Company Registration & Legal
  | 'cipc_registration'
  | 'directors_ids'
  
  // Tax & Revenue Compliance
  | 'vat_certificate'
  | 'tax_clearance'
  
  // B-BBEE & Transformation
  | 'bee_certificate'
  
  // Banking & Financial Verification
  | 'bank_account_proof'
  | 'bank_confirmation_letter'
  
  // Labour & Workers Compensation
  | 'coid_registration'
  
  // Insurance Coverage
  | 'public_liability_insurance'
  
  // Safety, Health, Environment & Quality
  | 'sheq_documentation'
  
  // Technical Competency & Staffing
  | 'key_staff_credentials'
  
  // Past Project Experience
  | 'past_project_experience'
  
  // Legal Agreements & Contracts
  | 'signed_msa'
  | 'ncnda'
  
  // Legacy document types (for backward compatibility)
  | 'insurance'
  | 'company_registration'
  | 'safety_certificate'
  | 'technical_certification'
  | 'bank_statement'
  | 'financial_statement'
  | 'reference_letter'
  | 'id_document'
  | 'other';