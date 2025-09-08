/**
 * Supplier Document Management
 * Handle document upload, verification, and lifecycle
 */

import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/src/config/firebase';
import { SupplierDocument, DocumentVerificationResult } from './types';
import { log } from '@/lib/logger';

const COLLECTION_NAME = 'suppliers';

export class DocumentManager {
  /**
   * Add document to supplier
   */
  static async addDocument(
    supplierId: string,
    document: Omit<SupplierDocument, 'id'>
  ): Promise<void> {
    try {
      const newDocument: SupplierDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...document,
        uploadedDate: new Date(),
        verified: false
      };

      const supplierRef = doc(db, COLLECTION_NAME, supplierId);
      await updateDoc(supplierRef, {
        documents: arrayUnion(newDocument),
        updatedAt: new Date()
      });

    } catch (error) {
      log.error('Error adding document:', { data: error }, 'documentManager');
      throw new Error(`Failed to add document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove document from supplier
   */
  static async removeDocument(supplierId: string, documentId: string): Promise<void> {
    try {
      // First, get the current documents to find the one to remove
      const supplierCrudService = await import('../supplier.crud');
      const supplier = await supplierCrudService.SupplierCrudService.getById(supplierId);
      
      if (!supplier || !supplier.documents) {
        throw new Error('Supplier or documents not found');
      }

      const documentToRemove = supplier.documents.find(doc => doc.id === documentId);
      if (!documentToRemove) {
        throw new Error('Document not found');
      }

      const supplierRef = doc(db, COLLECTION_NAME, supplierId);
      await updateDoc(supplierRef, {
        documents: arrayRemove(documentToRemove),
        updatedAt: new Date()
      });

    } catch (error) {
      log.error('Error removing document:', { data: error }, 'documentManager');
      throw new Error(`Failed to remove document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify document
   */
  static async verifyDocument(
    supplierId: string,
    documentId: string,
    verifiedBy: string,
    issues?: string[]
  ): Promise<DocumentVerificationResult> {
    try {
      // Get current supplier data
      const supplierCrudService = await import('../supplier.crud');
      const supplier = await supplierCrudService.SupplierCrudService.getById(supplierId);
      
      if (!supplier || !supplier.documents) {
        throw new Error('Supplier or documents not found');
      }

      // Find and update the document
      const documents = supplier.documents.map(doc => {
        if (doc.id === documentId) {
          return {
            ...doc,
            verified: issues ? false : true,
            verifiedAt: new Date(),
            verifiedBy: verifiedBy
          };
        }
        return doc;
      });

      const supplierRef = doc(db, COLLECTION_NAME, supplierId);
      await updateDoc(supplierRef, {
        documents: documents,
        updatedAt: new Date()
      });

      const result: DocumentVerificationResult = {
        success: !issues || issues.length === 0,
        documentId,
        verifiedBy,
        verifiedAt: new Date(),
        ...(issues && issues.length > 0 && { issues })
      };

      return result;
    } catch (error) {
      log.error('Error verifying document:', { data: error }, 'documentManager');
      throw new Error(`Failed to verify document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get documents by type
   */
  static getDocumentsByType(
    documents: SupplierDocument[],
    type: SupplierDocument['type']
  ): SupplierDocument[] {
    return documents.filter(doc => doc.type === type);
  }

  /**
   * Get expiring documents
   */
  static getExpiringDocuments(
    documents: SupplierDocument[],
    daysAhead: number = 30
  ): Array<SupplierDocument & { daysUntilExpiry: number }> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return documents
      .filter(doc => doc.expiryDate)
      .map(doc => {
        const expiryDate = typeof doc.expiryDate === 'string' ? new Date(doc.expiryDate) : doc.expiryDate!;
        return {
          ...doc,
          daysUntilExpiry: Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        };
      })
      .filter(doc => {
        const expiryDate = typeof doc.expiryDate === 'string' ? new Date(doc.expiryDate) : doc.expiryDate!;
        return expiryDate <= futureDate;
      })
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }

  /**
   * Get verified documents
   */
  static getVerifiedDocuments(documents: SupplierDocument[]): SupplierDocument[] {
    return documents.filter(doc => doc.verified);
  }

  /**
   * Get pending verification documents
   */
  static getPendingDocuments(documents: SupplierDocument[]): SupplierDocument[] {
    return documents.filter(doc => !doc.verified);
  }

  /**
   * Calculate document completeness percentage
   */
  static calculateDocumentCompleteness(
    documents: SupplierDocument[],
    requiredTypes: string[]
  ): number {
    if (requiredTypes.length === 0) return 100;

    const providedTypes = new Set(documents.map(doc => doc.type.toString()));
    const completedRequired = requiredTypes.filter(type => providedTypes.has(type));
    
    return Math.round((completedRequired.length / requiredTypes.length) * 100);
  }
}