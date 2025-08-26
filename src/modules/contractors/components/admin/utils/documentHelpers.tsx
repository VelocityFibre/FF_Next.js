import { DocumentType } from '@/types/contractor.types';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  // Company Registration & Legal
  cipc_registration: 'CIPC Registration',
  directors_ids: 'Directors IDs',
  
  // Tax & Revenue Compliance
  vat_certificate: 'VAT Certificate',
  tax_clearance: 'Tax Clearance',
  
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
  signed_msa: 'Signed MSA',
  ncnda: 'NCNDA',
  
  // Legacy document types (for backward compatibility)
  insurance: 'Insurance',
  company_registration: 'Company Registration',
  safety_certificate: 'Safety Certificate',
  technical_certification: 'Technical Certification',
  bank_statement: 'Bank Statement',
  financial_statement: 'Financial Statement',
  reference_letter: 'Reference Letter',
  id_document: 'ID Document',
  other: 'Other'
};

export function getStatusBadge(status: string) {
  switch (status) {
    case 'verified':
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Approved
        </span>
      );
    case 'pending':
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    case 'rejected':
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          Rejected
        </span>
      );
    default:
      return null;
  }
}

export function downloadDocument(fileUrl: string, fileName: string) {
  const link = window.document.createElement('a');
  link.href = fileUrl;
  link.download = fileName;
  link.click();
}

export function viewDocument(fileUrl: string) {
  window.open(fileUrl, '_blank');
}