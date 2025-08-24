// Document management module exports
export { DocumentQuery } from './documentQuery';
export { DocumentValidation } from './documentValidation';
export { DocumentStatus } from './documentStatus';
export { DocumentStageOperations } from './documentStageOperations';
export { DocumentInstructions } from './documentInstructions';

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