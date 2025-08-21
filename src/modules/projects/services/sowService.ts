import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  serverTimestamp 
} from 'firebase/firestore';
import { storage, db } from '@/config/firebase';
import { 
  SOWDocument, 
  SOWDocumentType, 
  DocumentStatus 
} from '../types/project.types';
import { projectService } from './projectService';

class SOWService {
  private readonly STORAGE_PATH = 'projects/sow-documents';

  // Upload SOW document
  async uploadSOWDocument(
    projectId: string,
    file: File,
    type: SOWDocumentType,
    uploadedBy: string,
    metadata?: {
      poleCount?: number;
      dropCount?: number;
      cableLength?: number;
      estimatedCost?: number;
    }
  ): Promise<SOWDocument> {
    try {
      // Validate file
      this.validateFile(file);

      // Create storage reference
      const timestamp = Date.now();
      const fileName = `${projectId}/${type}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, `${this.STORAGE_PATH}/${fileName}`);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          projectId,
          documentType: type,
          uploadedBy,
          originalName: file.name,
        }
      });

      // Get download URL
      const fileUrl = await getDownloadURL(snapshot.ref);

      // Create document object
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

      // Update project with new document
      await this.addDocumentToProject(projectId, sowDocument);

      return sowDocument;
    } catch (error) {
      console.error('Error uploading SOW document:', error);
      throw new Error('Failed to upload SOW document');
    }
  }

  // Validate file before upload
  private validateFile(file: File): void {
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const ALLOWED_TYPES = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ];

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 50MB limit');
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('File type not supported. Please upload PDF, Excel, Word, or image files.');
    }
  }

  // Add document to project
  private async addDocumentToProject(
    projectId: string, 
    document: SOWDocument
  ): Promise<void> {
    try {
      const project = await projectService.getProjectById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      const docRef = doc(db, 'projects', projectId);
      await updateDoc(docRef, {
        sowDocuments: arrayUnion(document),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding document to project:', error);
      throw new Error('Failed to add document to project');
    }
  }

  // Update document status
  async updateDocumentStatus(
    projectId: string,
    documentId: string,
    status: DocumentStatus
  ): Promise<void> {
    try {
      const project = await projectService.getProjectById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      const updatedDocuments = project.sowDocuments.map(doc => {
        if (doc.id === documentId) {
          return { ...doc, status };
        }
        return doc;
      });

      const docRef = doc(db, 'projects', projectId);
      await updateDoc(docRef, {
        sowDocuments: updatedDocuments,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating document status:', error);
      throw new Error('Failed to update document status');
    }
  }

  // Delete SOW document
  async deleteSOWDocument(
    projectId: string,
    documentId: string
  ): Promise<void> {
    try {
      const project = await projectService.getProjectById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      const documentToDelete = project.sowDocuments.find(d => d.id === documentId);
      
      if (!documentToDelete) {
        throw new Error('Document not found');
      }

      // Delete from storage
      try {
        const storageRef = ref(storage, documentToDelete.fileUrl);
        await deleteObject(storageRef);
      } catch (storageError) {
        console.warn('Error deleting file from storage:', storageError);
        // Continue even if storage deletion fails
      }

      // Remove from project
      const docRef = doc(db, 'projects', projectId);
      await updateDoc(docRef, {
        sowDocuments: arrayRemove(documentToDelete),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error deleting SOW document:', error);
      throw new Error('Failed to delete SOW document');
    }
  }

  // Upload multiple SOW documents (for batch upload)
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
      const uploadPromises = files.map(({ file, type, metadata }) =>
        this.uploadSOWDocument(projectId, file, type, uploadedBy, metadata)
      );

      const results = await Promise.allSettled(uploadPromises);
      
      const successful: SOWDocument[] = [];
      const failed: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value);
        } else {
          failed.push(files[index].file.name);
        }
      });

      if (failed.length > 0) {
        console.warn('Some files failed to upload:', failed);
      }

      return successful;
    } catch (error) {
      console.error('Error uploading multiple SOW documents:', error);
      throw new Error('Failed to upload multiple SOW documents');
    }
  }

  // Get SOW documents by type
  async getSOWDocumentsByType(
    projectId: string,
    type: SOWDocumentType
  ): Promise<SOWDocument[]> {
    try {
      const project = await projectService.getProjectById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      return project.sowDocuments.filter(doc => doc.type === type);
    } catch (error) {
      console.error('Error fetching SOW documents by type:', error);
      throw new Error('Failed to fetch SOW documents');
    }
  }

  // Extract SOW data from Excel/CSV
  async extractSOWData(_file: File): Promise<{
    poleCount?: number;
    dropCount?: number;
    cableLength?: number;
    estimatedCost?: number;
    rawData?: any[];
  }> {
    try {
      // This would typically use a library like XLSX to parse the file
      // For now, returning mock data structure
      return {
        poleCount: 0,
        dropCount: 0,
        cableLength: 0,
        estimatedCost: 0,
        rawData: [],
      };
    } catch (error) {
      console.error('Error extracting SOW data:', error);
      throw new Error('Failed to extract SOW data');
    }
  }

  // Validate SOW data against requirements
  validateSOWData(data: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Example validation rules
    if (!data.poleCount || data.poleCount < 1) {
      errors.push('Pole count must be at least 1');
    }

    if (data.poleCount > 1000) {
      warnings.push('Pole count exceeds typical project size');
    }

    if (!data.dropCount || data.dropCount < 1) {
      errors.push('Drop count must be at least 1');
    }

    if (data.dropCount > data.poleCount * 12) {
      errors.push('Drop count exceeds maximum (12 per pole)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export const sowService = new SOWService();