/**
 * Document Upload Types
 * Type definitions for document upload operations
 */

import { DocumentType, ContractorDocument } from '@/types/contractor.types';

export interface DocumentUploadCardProps {
  contractorId: string;
  documentType: DocumentType;
  documentTitle: string;
  description: string | undefined;
  required: boolean | undefined;
  currentDocument: ContractorDocument | undefined;
  onUploadComplete: ((document: ContractorDocument) => void) | undefined;
  onDocumentRemove: ((documentId: string) => void) | undefined;
}

export interface DocumentUploadState {
  isUploading: boolean;
  uploadProgress: number;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  // Company Registration & Legal
  cipc_registration: 'CIPC Registration Certificate',
  directors_ids: 'Directors ID Documents',
  
  // Tax & Revenue Compliance
  vat_certificate: 'VAT Registration Certificate',
  tax_clearance: 'Tax Clearance Certificate',
  
  // B-BBEE & Transformation
  bee_certificate: 'BEE Certificate',
  
  // Banking & Financial Verification
  bank_account_proof: 'Bank Account Proof',
  bank_confirmation_letter: 'Bank Confirmation Letter',
  
  // Labour & Workers Compensation
  coid_registration: 'COID Registration',
  
  // Insurance Coverage
  public_liability_insurance: 'Public Liability Insurance',
  
  // Safety, Health, Environment & Quality
  sheq_documentation: 'SHEQ Documentation',
  
  // Technical Competency & Staffing
  key_staff_credentials: 'Key Staff Credentials',
  
  // Past Project Experience
  past_project_experience: 'Past Project Experience',
  
  // Legal Agreements & Contracts
  signed_msa: 'Signed Master Service Agreement',
  ncnda: 'Non-Disclosure Agreement',
  
  // Legacy document types (for backward compatibility)
  insurance: 'Insurance Certificate',
  company_registration: 'Company Registration',
  safety_certificate: 'Safety Certificate',
  technical_certification: 'Technical Certification',
  bank_statement: 'Bank Statement',
  financial_statement: 'Financial Statement',
  reference_letter: 'Reference Letter',
  id_document: 'ID Document',
  other: 'Other Document'
};