// Document management module exports
import { DocumentQuery } from './documentQuery';
import { DocumentValidation } from './documentValidation';
import { DocumentStatus } from './documentStatus';
import { DocumentStageOperations } from './documentStageOperations';
import { DocumentInstructions } from './documentInstructions';

export { DocumentQuery, DocumentValidation, DocumentStatus, DocumentStageOperations, DocumentInstructions };

// Re-export original DocumentManager class for backward compatibility
export class DocumentManager {
  static getContractorDocuments = DocumentQuery.getContractorDocuments;
  static updateStagesBasedOnDocuments = DocumentStageOperations.updateStagesBasedOnDocuments;
  static isDocumentRelatedChecklistItem = DocumentValidation.isDocumentRelatedChecklistItem;
  static validateRequiredDocuments = DocumentValidation.validateRequiredDocuments;
  static getDocumentStatusSummary = DocumentStatus.getDocumentStatusSummary;
  static getDocumentsByStage = DocumentQuery.getDocumentsByStage;
  static stageHasAllDocuments = DocumentValidation.stageHasAllDocuments;
  static getVerificationReminders = DocumentQuery.getVerificationReminders;
  static generateDocumentChecklist = DocumentStatus.generateDocumentChecklist;
  static getDocumentUploadInstructions = DocumentInstructions.getDocumentUploadInstructions;
}
