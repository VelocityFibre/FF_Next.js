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
  tax_clearance: 'Tax Clearance Certificate',
  insurance: 'Insurance Certificate',
  company_registration: 'Company Registration',
  vat_certificate: 'VAT Certificate',
  bee_certificate: 'BEE Certificate',
  safety_certificate: 'Safety Certificate',
  technical_certification: 'Technical Certification',
  bank_statement: 'Bank Statement',
  financial_statement: 'Financial Statement',
  reference_letter: 'Reference Letter',
  id_document: 'ID Document',
  other: 'Other Document'
};