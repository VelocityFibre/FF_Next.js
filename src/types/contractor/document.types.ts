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
  | 'tax_clearance'
  | 'insurance'
  | 'company_registration'
  | 'vat_certificate'
  | 'bee_certificate'
  | 'safety_certificate'
  | 'technical_certification'
  | 'bank_statement'
  | 'financial_statement'
  | 'reference_letter'
  | 'id_document'
  | 'other';