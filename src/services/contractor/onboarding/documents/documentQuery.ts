/**
 * Document Query Operations
 * Handles document retrieval and querying
 */

import { db } from '@/lib/neon/connection';
import { contractorDocuments } from '@/lib/neon/schema';
import { eq } from 'drizzle-orm';
import { ContractorDocument } from '@/types/contractor.types';
import { getDocumentRequirements } from '../stageDefinitions';
import { log } from '@/lib/logger';

/**
 * Document query operations
 */
export class DocumentQuery {
  /**
   * Get contractor documents from database
   */
  static async getContractorDocuments(contractorId: string): Promise<ContractorDocument[]> {
    try {
      const docs = await db
        .select()
        .from(contractorDocuments)
        .where(eq(contractorDocuments.contractorId, contractorId));
      return docs as ContractorDocument[];
    } catch (error) {
      log.error('Failed to get contractor documents:', { data: error }, 'documentQuery');
      return [];
    }
  }

  /**
   * Get documents grouped by stage
   */
  static async getDocumentsByStage(contractorId: string): Promise<Record<string, ContractorDocument[]>> {
    const documents = await this.getContractorDocuments(contractorId);
    const documentRequirements = getDocumentRequirements('');
    
    const documentsByStage: Record<string, ContractorDocument[]> = {};

    documentRequirements.forEach(requirement => {
      if (!documentsByStage[requirement.stageId]) {
        documentsByStage[requirement.stageId] = [];
      }

      const doc = documents.find(d => d.documentType === requirement.documentType);
      if (doc) {
        documentsByStage[requirement.stageId].push(doc);
      }
    });

    return documentsByStage;
  }

  /**
   * Get document verification reminders
   */
  static async getVerificationReminders(contractorId: string): Promise<{
    pendingDocuments: ContractorDocument[];
    overdueDocuments: ContractorDocument[];
    expiringDocuments: ContractorDocument[];
  }> {
    const documents = await this.getContractorDocuments(contractorId);
    const now = new Date();
    const overdueDays = 3; // Days after which pending docs are overdue
    const expiringDays = 30; // Days before expiry to show reminder

    const pendingDocuments = documents.filter(d => d.verificationStatus === 'pending');
    
    const overdueDocuments = pendingDocuments.filter(d => {
      if (!d.uploadedAt) return false;
      const daysSinceUpload = Math.floor((now.getTime() - d.uploadedAt.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceUpload > overdueDays;
    });

    const expiringDocuments = documents.filter(d => {
      if (!d.expiryDate || d.verificationStatus !== 'verified') return false;
      const daysToExpiry = Math.floor((d.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysToExpiry > 0 && daysToExpiry <= expiringDays;
    });

    return {
      pendingDocuments,
      overdueDocuments,
      expiringDocuments
    };
  }
}