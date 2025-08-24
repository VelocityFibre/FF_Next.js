import { DocumentType } from '@/types/contractor.types';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  tax_clearance: 'Tax Clearance',
  insurance: 'Insurance',
  company_registration: 'Company Registration',
  vat_certificate: 'VAT Certificate',
  bee_certificate: 'BEE Certificate',
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