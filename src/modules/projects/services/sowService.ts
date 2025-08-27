import { log } from '@/lib/logger';

/**
 * SOW Service - Main Service Facade
 * Provides high-level SOW document operations using modular components
 */

import { 
  SOWDocument, 
  SOWDocumentType, 
  DocumentStatus 
} from '../types/project.types';
import {
  SOWFileValidator,
  SOWUploadService,
  SOWDocumentService,
  SOWDataExtractor,
  SOWDataValidator,
  SOWMetadata,
  SOWDataExtractionResult,
  SOWValidationResult,
} from './sow';

class SOWService {
  private dataValidator: SOWDataValidator;

  constructor() {
    this.dataValidator = new SOWDataValidator();
  }

  /**
   * Upload SOW document
   */
  async uploadSOWDocument(
    projectId: string,
    file: File,
    type: SOWDocumentType,
    uploadedBy: string,
    metadata?: SOWMetadata
  ): Promise<SOWDocument> {
    try {
      // Upload document
      const document = await SOWUploadService.uploadDocument(
        projectId,
        file,
        type,
        uploadedBy,
        metadata
      );

      // Add to project
      await SOWDocumentService.addToProject(projectId, document);

      return document;
    } catch (error) {
      log.error('Error uploading SOW document:', { data: error }, 'sowService');
      throw new Error('Failed to upload SOW document');
    }
  }

  /**
   * Upload multiple SOW documents
   */
  async uploadMultipleSOWDocuments(
    projectId: string,
    files: {
      file: File;
      type: SOWDocumentType;
      metadata?: any;
    }[],
    uploadedBy: string
  ): Promise<SOWDocument[]> {
    try {
      const result = await SOWUploadService.uploadMultiple(
        projectId,
        files,
        uploadedBy
      );

      // Add successful uploads to project
      for (const document of result.successful) {
        await SOWDocumentService.addToProject(projectId, document);
      }

      if (result.failed.length > 0) {
        log.warn('Some files failed to upload:', { data: result.failed }, 'sowService');
      }

      return result.successful;
    } catch (error) {
      log.error('Error uploading multiple SOW documents:', { data: error }, 'sowService');
      throw new Error('Failed to upload multiple SOW documents');
    }
  }

  /**
   * Update document status
   */
  async updateDocumentStatus(
    projectId: string,
    documentId: string,
    status: DocumentStatus
  ): Promise<void> {
    try {
      await SOWDocumentService.updateStatus(projectId, documentId, status);
    } catch (error) {
      log.error('Error updating document status:', { data: error }, 'sowService');
      throw new Error('Failed to update document status');
    }
  }

  /**
   * Delete SOW document
   */
  async deleteSOWDocument(
    projectId: string,
    documentId: string
  ): Promise<void> {
    try {
      await SOWDocumentService.deleteDocument(projectId, documentId);
    } catch (error) {
      log.error('Error deleting SOW document:', { data: error }, 'sowService');
      throw new Error('Failed to delete SOW document');
    }
  }

  /**
   * Get SOW documents by type
   */
  async getSOWDocumentsByType(
    projectId: string,
    type: SOWDocumentType
  ): Promise<SOWDocument[]> {
    try {
      return await SOWDocumentService.getByType(projectId, type);
    } catch (error) {
      log.error('Error fetching SOW documents by type:', { data: error }, 'sowService');
      throw new Error('Failed to fetch SOW documents');
    }
  }

  /**
   * Extract SOW data from file
   */
  async extractSOWData(file: File): Promise<SOWDataExtractionResult> {
    try {
      return await SOWDataExtractor.extractFromFile(file);
    } catch (error) {
      log.error('Error extracting SOW data:', { data: error }, 'sowService');
      throw new Error('Failed to extract SOW data');
    }
  }

  /**
   * Validate SOW data
   */
  validateSOWData(data: any): SOWValidationResult {
    return this.dataValidator.validate(data);
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): void {
    SOWFileValidator.validate(file);
  }

  /**
   * Get all SOW documents for a project
   */
  async getAllSOWDocuments(projectId: string): Promise<SOWDocument[]> {
    try {
      return await SOWDocumentService.getAll(projectId);
    } catch (error) {
      log.error('Error fetching all SOW documents:', { data: error }, 'sowService');
      throw new Error('Failed to fetch SOW documents');
    }
  }

  /**
   * Update document metadata
   */
  async updateDocumentMetadata(
    projectId: string,
    documentId: string,
    metadata: any
  ): Promise<void> {
    try {
      await SOWDocumentService.updateMetadata(
        projectId,
        documentId,
        metadata
      );
    } catch (error) {
      log.error('Error updating document metadata:', { data: error }, 'sowService');
      throw new Error('Failed to update document metadata');
    }
  }
}

export const sowService = new SOWService();