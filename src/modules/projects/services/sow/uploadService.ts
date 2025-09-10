/**
 * SOW Upload Service
 * Handles file upload operations for SOW documents
 */

import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  UploadMetadata 
} from 'firebase/storage';
import { storage } from '@/config/firebase';
import { 
  SOWDocument, 
  SOWDocumentType, 
  DocumentStatus 
} from '../../types/project.types';
import { SOWFileValidator } from './fileValidator';
import { SOW_CONFIG, SOWMetadata } from './types';
import { log } from '@/lib/logger';

export class SOWUploadService {
  /**
   * Upload single SOW document
   */
  static async uploadDocument(
    projectId: string,
    file: File,
    type: SOWDocumentType,
    uploadedBy: string,
    metadata?: SOWMetadata
  ): Promise<SOWDocument> {
    // Validate file
    SOWFileValidator.validate(file);

    // Generate file name and storage reference
    const fileName = SOWFileValidator.generateFileName(
      projectId,
      type,
      file.name
    );
    const storageRef = ref(
      storage,
      `${SOW_CONFIG.STORAGE_PATH}/${fileName}`
    );

    // Prepare upload metadata
    const uploadMetadata: UploadMetadata = {
      contentType: file.type,
      customMetadata: {
        projectId,
        documentType: type,
        uploadedBy,
        originalName: file.name,
      }
    };

    // Upload file
    const snapshot = await uploadBytes(storageRef, file, uploadMetadata);

    // Get download URL
    const fileUrl = await getDownloadURL(snapshot.ref);

    // Create document object
    const timestamp = Date.now();
    const sowDocument: SOWDocument = {
      id: `${type}_${timestamp}`,
      name: file.name,
      type,
      fileUrl,
      uploadDate: new Date().toISOString(),
      uploadedBy,
      version: 1,
      status: DocumentStatus.PENDING,
      ...(metadata && { metadata }),
    };

    return sowDocument;
  }

  /**
   * Upload multiple SOW documents
   */
  static async uploadMultiple(
    projectId: string,
    files: Array<{
      file: File;
      type: SOWDocumentType;
      metadata?: SOWMetadata;
    }>,
    uploadedBy: string
  ): Promise<{
    successful: SOWDocument[];
    failed: string[];
  }> {
    const uploadPromises = files.map(({ file, type, metadata }) =>
      this.uploadDocument(projectId, file, type, uploadedBy, metadata)
        .then(doc => ({ status: 'success' as const, value: doc }))
        .catch(error => ({ 
          status: 'error' as const, 
          fileName: file.name,
          error 
        }))
    );

    const results = await Promise.all(uploadPromises);
    
    const successful: SOWDocument[] = [];
    const failed: string[] = [];

    results.forEach(result => {
      if (result.status === 'success') {
        successful.push(result.value);
      } else {
        failed.push(result.fileName);
        log.warn(`Failed to upload ${result.fileName}:`, { data: result.error }, 'uploadService');
      }
    });

    return { successful, failed };
  }
}