/**
 * SOW Document Service
 * Handles document management operations in Firestore
 */

import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../../../../config/firebase';
import { 
  SOWDocument, 
  SOWDocumentType, 
  DocumentStatus 
} from '../../types/project.types';
import { projectService } from '../projectService/index';

export class SOWDocumentService {
  /**
   * Add document to project
   */
  static async addToProject(
    projectId: string, 
    document: SOWDocument
  ): Promise<void> {
    const project = await projectService.getProjectById(projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }

    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, {
      sowDocuments: arrayUnion(document),
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Update document status
   */
  static async updateStatus(
    projectId: string,
    documentId: string,
    status: DocumentStatus
  ): Promise<void> {
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
  }

  /**
   * Delete SOW document
   */
  static async deleteDocument(
    projectId: string,
    documentId: string
  ): Promise<void> {
    const project = await projectService.getProjectById(projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }

    const documentToDelete = project.sowDocuments.find(
      d => d.id === documentId
    );
    
    if (!documentToDelete) {
      throw new Error('Document not found');
    }

    // Try to delete from storage (don't fail if storage deletion fails)
    try {
      const storageRef = ref(storage, documentToDelete.fileUrl);
      await deleteObject(storageRef);
    } catch (storageError) {
      console.warn('Error deleting file from storage:', storageError);
    }

    // Remove from project
    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, {
      sowDocuments: arrayRemove(documentToDelete),
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Get documents by type
   */
  static async getByType(
    projectId: string,
    type: SOWDocumentType
  ): Promise<SOWDocument[]> {
    const project = await projectService.getProjectById(projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }

    return project.sowDocuments.filter(doc => doc.type === type);
  }

  /**
   * Get all documents for a project
   */
  static async getAll(projectId: string): Promise<SOWDocument[]> {
    const project = await projectService.getProjectById(projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }

    return project.sowDocuments || [];
  }

  /**
   * Update document metadata
   */
  static async updateMetadata(
    projectId: string,
    documentId: string,
    metadata: Record<string, unknown>
  ): Promise<void> {
    const project = await projectService.getProjectById(projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }

    const updatedDocuments = project.sowDocuments.map(doc => {
      if (doc.id === documentId) {
        return { ...doc, metadata: { ...doc.metadata, ...metadata } };
      }
      return doc;
    });

    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, {
      sowDocuments: updatedDocuments,
      updatedAt: serverTimestamp(),
    });
  }
}