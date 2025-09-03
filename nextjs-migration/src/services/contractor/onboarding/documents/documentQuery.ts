/**
 * Document Query Operations
 * Updated to use API endpoints instead of direct database queries
 */

import { contractorsApi } from '@/services/api/contractorsApi';
import { ContractorDocument } from '@/types/contractor.types';
import { getDocumentRequirements } from '../stageDefinitions';
import { log } from '@/lib/logger';

/**
 * Document query operations via API
 */
export class DocumentQuery {
  /**
   * Get contractor documents via API
   */
  static async getContractorDocuments(contractorId: string): Promise<ContractorDocument[]> {
    try {
      const response = await contractorsApi.getOnboardingDocuments(contractorId);
      return response.data?.documents || [];
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

    const pendingDocuments = documents.filter(d => d.verificationStatus === 'pending' || d.status === 'pending');
    
    const overdueDocuments = pendingDocuments.filter(d => {
      const uploadedAt = d.uploadedAt || d.createdAt;
      if (!uploadedAt) return false;
      const daysSinceUpload = Math.floor((now.getTime() - new Date(uploadedAt).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceUpload > overdueDays;
    });

    const expiringDocuments = documents.filter(d => {
      if (!d.expiryDate) return false;
      const verified = d.verificationStatus === 'verified' || d.status === 'approved';
      if (!verified) return false;
      const daysToExpiry = Math.floor((new Date(d.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysToExpiry > 0 && daysToExpiry <= expiringDays;
    });

    return {
      pendingDocuments,
      overdueDocuments,
      expiringDocuments
    };
  }

  /**
   * Upload document via API
   */
  static async uploadDocument(contractorId: string, documentData: {
    documentType: string;
    documentName: string;
    fileUrl: string;
    fileSize?: number;
    mimeType?: string;
    expiryDate?: Date | string;
  }): Promise<ContractorDocument | null> {
    try {
      const response = await contractorsApi.uploadDocument(contractorId, {
        ...documentData,
        expiryDate: documentData.expiryDate ? new Date(documentData.expiryDate).toISOString() : undefined
      });
      return response.data;
    } catch (error) {
      log.error('Failed to upload document:', { data: error }, 'documentQuery');
      return null;
    }
  }

  /**
   * Get document statistics from API response
   */
  static async getDocumentStatistics(contractorId: string): Promise<{
    totalDocuments: number;
    approvedCount: number;
    pendingCount: number;
    missingRequired: string[];
  }> {
    try {
      const response = await contractorsApi.getOnboardingDocuments(contractorId);
      const data = response.data;
      
      return {
        totalDocuments: data?.totalDocuments || 0,
        approvedCount: data?.approvedCount || 0,
        pendingCount: data?.pendingCount || 0,
        missingRequired: data?.missingRequired || []
      };
    } catch (error) {
      log.error('Failed to get document statistics:', { data: error }, 'documentQuery');
      return {
        totalDocuments: 0,
        approvedCount: 0,
        pendingCount: 0,
        missingRequired: []
      };
    }
  }
}