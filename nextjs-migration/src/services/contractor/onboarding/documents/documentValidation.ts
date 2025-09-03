/**
 * Document Validation Operations
 * Handles document validation and requirement checking
 */

import { DocumentType } from '@/types/contractor.types';
import { getRequiredDocumentTypes, getDocumentRequirements } from '../stageDefinitions';
import { DocumentQuery } from './documentQuery';

/**
 * Document validation operations
 */
export class DocumentValidation {
  /**
   * Check if checklist item is document-related
   */
  static isDocumentRelatedChecklistItem(itemId: string): boolean {
    const documentRelatedItems = [
      'company_reg',
      'tax_cert',
      'financial_docs',
      'bank_details',
      'public_liability',
      'workers_comp',
      'safety_cert',
      'tech_certs'
    ];
    
    return documentRelatedItems.includes(itemId) || 
           itemId.includes('uploaded') || 
           itemId.includes('cert') ||
           itemId.includes('doc');
  }

  /**
   * Validate required documents for submission
   */
  static async validateRequiredDocuments(contractorId: string): Promise<{
    isValid: boolean;
    missingDocuments: DocumentType[];
    unverifiedDocuments: DocumentType[];
  }> {
    const documents = await DocumentQuery.getContractorDocuments(contractorId);
    const requiredDocs = getRequiredDocumentTypes('');
    
    const missingDocuments: DocumentType[] = [];
    const unverifiedDocuments: DocumentType[] = [];

    for (const docType of requiredDocs) {
      const doc = documents.find(d => d.documentType === docType);
      
      if (!doc) {
        missingDocuments.push(docType as DocumentType);
      } else if (doc.verificationStatus !== 'verified') {
        unverifiedDocuments.push(docType as DocumentType);
      }
    }

    const isValid = missingDocuments.length === 0 && unverifiedDocuments.length === 0;

    return {
      isValid,
      missingDocuments,
      unverifiedDocuments
    };
  }

  /**
   * Check if stage has all required documents
   */
  static async stageHasAllDocuments(
    contractorId: string, 
    stageId: string
  ): Promise<{
    hasAll: boolean;
    required: DocumentType[];
    missing: DocumentType[];
    unverified: DocumentType[];
  }> {
    const documents = await DocumentQuery.getContractorDocuments(contractorId);
    const documentRequirements = getDocumentRequirements('');
    
    const stageRequirements = documentRequirements.filter(req => 
      req.stageId === stageId && req.required
    );
    
    const required = stageRequirements.map(req => req.documentType);
    const missing: DocumentType[] = [];
    const unverified: DocumentType[] = [];

    for (const docType of required) {
      const doc = documents.find(d => d.documentType === docType);
      
      if (!doc) {
        missing.push(docType);
      } else if (doc.verificationStatus !== 'verified') {
        unverified.push(docType);
      }
    }

    const hasAll = missing.length === 0 && unverified.length === 0;

    return {
      hasAll,
      required,
      missing,
      unverified
    };
  }
}