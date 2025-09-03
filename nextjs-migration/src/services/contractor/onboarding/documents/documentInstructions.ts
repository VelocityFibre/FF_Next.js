/**
 * Document Upload Instructions
 * Provides instructions and requirements for document uploads
 */

import { DocumentType } from '@/types/contractor.types';

/**
 * Document upload instructions
 */
export class DocumentInstructions {
  /**
   * Get document upload instructions
   */
  static getDocumentUploadInstructions(documentType: DocumentType): {
    title: string;
    description: string;
    requirements: string[];
    acceptedFormats: string[];
    maxFileSize: string;
    examples?: string[];
  } {
    const instructions: Record<string, any> = {
      company_registration: {
        title: 'Company Registration Certificate',
        description: 'Official certificate from the company registrar',
        requirements: [
          'Must be current and not expired',
          'Must clearly show company name and registration number',
          'Must be officially stamped or certified'
        ],
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxFileSize: '10MB'
      },
      tax_clearance: {
        title: 'Tax Clearance Certificate',
        description: 'Valid tax clearance from revenue authority',
        requirements: [
          'Must be current (not older than 3 months)',
          'Must show company tax number',
          'Must indicate good standing with tax authority'
        ],
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxFileSize: '10MB'
      },
      insurance: {
        title: 'Insurance Certificates',
        description: 'Public liability and workers compensation insurance',
        requirements: [
          'Minimum R2 million public liability coverage',
          'Valid workers compensation certificate',
          'Must not be expired',
          'Must name your company as insured'
        ],
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxFileSize: '10MB'
      }
      // Add more document types as needed
    };

    return instructions[documentType] || {
      title: 'Document Upload',
      description: 'Please upload the required document',
      requirements: ['Must be clear and legible', 'Must be current and valid'],
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxFileSize: '10MB'
    };
  }
}