/**
 * Document Stage Operations
 * Handles document stage updates and integration
 */

import { ContractorDocument, DocumentType } from '@/types/contractor.types';
import { OnboardingStage } from '../types';
import { DocumentValidation } from './documentValidation';

/**
 * Document stage operations
 */
export class DocumentStageOperations {
  /**
   * Update stages based on uploaded documents
   */
  static async updateStagesBasedOnDocuments(
    stages: OnboardingStage[],
    documents: ContractorDocument[]
  ): Promise<OnboardingStage[]> {
    return stages.map(stage => {
      // Check if required documents are uploaded for this stage
      const stageDocuments = documents.filter(doc => 
        stage.documents.includes(doc.documentType as DocumentType)
      );

      // Update checklist items based on uploaded documents
      stage.checklist.forEach(item => {
        // Update items related to document uploads
        if (DocumentValidation.isDocumentRelatedChecklistItem(item.id)) {
          const hasRequiredDoc = stageDocuments.some(doc => 
            doc.verificationStatus === 'verified' || doc.verificationStatus === 'pending'
          );
          item.completed = hasRequiredDoc;
        }
      });

      // Mark stage as completed if all required checklist items are done
      stage.completed = stage.checklist
        .filter(item => item.required)
        .every(item => item.completed);

      return stage;
    });
  }
}