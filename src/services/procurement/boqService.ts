/**
 * BOQ Service
 * Unified interface for BOQ operations using modular components
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { BOQ, BOQFormData, BOQStatusType } from '../../types/procurement/boq.types';
import { BOQCrud } from './boq/boqCrud';

const COLLECTION_NAME = 'boqs';

/**
 * Main BOQ Service - provides backward compatibility
 * Uses the new modular components internally where possible
 */
export const boqService = {
  // CRUD Operations - delegated to BOQCrud
  async getAll(filter?: { projectId?: string; status?: BOQStatusType }): Promise<BOQ[]> {
    return BOQCrud.getAll(filter);
  },

  async getById(id: string): Promise<BOQ> {
    return BOQCrud.getById(id);
  },

  async create(data: BOQFormData): Promise<string> {
    return BOQCrud.create(data);
  },

  async update(id: string, data: Partial<BOQFormData>): Promise<void> {
    return BOQCrud.update(id, data);
  },

  async delete(id: string): Promise<void> {
    return BOQCrud.delete(id);
  },

  // Status Management
  async updateStatus(id: string, status: BOQStatusType, approvedBy?: string): Promise<void> {
    // Update the status
    await BOQCrud.updateStatus(id, status);
    
    // If approvedBy is provided, also update that field
    if (approvedBy) {
      await this.update(id, { approvedBy, updatedAt: Timestamp.now() } as any);
    }
  },

  async approve(id: string, approvedBy?: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status: 'approved' as BOQStatusType,
        approvedAt: Timestamp.now(),
        approvedBy: approvedBy || 'current-user-id', // TODO: Get from auth context
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error approving BOQ:', error);
      throw error;
    }
  },

  async reject(id: string, rejectedBy?: string, reason?: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status: 'rejected' as BOQStatusType,
        rejectedAt: Timestamp.now(),
        rejectedBy: rejectedBy || 'current-user-id', // TODO: Get from auth context
        rejectionReason: reason,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error rejecting BOQ:', error);
      throw error;
    }
  },

  // Import/Upload Operations
  async uploadBOQ(projectId: string, fileData: any, fileName: string): Promise<string> {
    try {
      const boq = {
        projectId,
        fileName,
        fileData,
        status: 'draft' as BOQStatusType,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        uploadedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), boq);
      return docRef.id;
    } catch (error) {
      console.error('Error uploading BOQ:', error);
      throw error;
    }
  },

  // Analytics and Reporting
  async getBOQSummary(projectId: string): Promise<any> {
    try {
      const boqs = await this.getAll({ projectId });
      
      const summary = {
        totalBOQs: boqs.length,
        statusBreakdown: {
          draft: boqs.filter(b => b.status === 'draft').length,
          pending_review: boqs.filter(b => b.status === 'pending_review').length,
          approved: boqs.filter(b => b.status === 'approved').length,
          rejected: boqs.filter(b => b.status === 'rejected').length
        },
        totalValue: boqs.reduce((sum, boq) => sum + (boq.totalEstimatedValue || 0), 0),
        averageItemCount: boqs.length > 0 ? 
          boqs.reduce((sum, boq) => sum + (boq.itemCount || 0), 0) / boqs.length : 0
      };
      
      return summary;
    } catch (error) {
      console.error('Error getting BOQ summary:', error);
      throw error;
    }
  },

  // Real-time Subscriptions
  subscribeToProjectBOQs(projectId: string, callback: (boqs: BOQ[]) => void) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const boqs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          uploadedAt: data.uploadedAt?.toDate?.() || new Date(),
          approvedAt: data.approvedAt?.toDate?.() || undefined,
          rejectedAt: data.rejectedAt?.toDate?.() || undefined
        } as BOQ;
      });
      callback(boqs);
    });
  },

  subscribeToBoq(id: string, callback: (boq: BOQ) => void) {
    const docRef = doc(db, COLLECTION_NAME, id);
    
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback({
          id: snapshot.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          uploadedAt: data.uploadedAt?.toDate?.() || new Date(),
          approvedAt: data.approvedAt?.toDate?.() || undefined,
          rejectedAt: data.rejectedAt?.toDate?.() || undefined
        } as BOQ);
      }
    });
  },

  // Utility methods
  async getByProject(projectId: string): Promise<BOQ[]> {
    return BOQCrud.getByProject(projectId);
  },

  async getByStatus(status: BOQStatusType): Promise<BOQ[]> {
    return BOQCrud.getByStatus(status);
  },

  async exists(id: string): Promise<boolean> {
    return BOQCrud.exists(id);
  },

  // Template Operations
  async getTemplates(): Promise<BOQ[]> {
    // Get BOQs marked as templates
    const templatesRef = collection(db, COLLECTION_NAME);
    const templatesQuery = query(templatesRef, where('isTemplate', '==', true));
    const snapshot = await getDocs(templatesQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as BOQ[];
  },

  async createTemplate(id: string, templateName: string): Promise<string> {
    // Get the source BOQ
    const source = await this.getById(id);
    
    // Create template version
    const templateData = {
      ...source,
      title: templateName,
      isTemplate: true,
      templateSourceId: id,
      status: 'draft' as BOQStatusType,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    // Remove ID and create new document
    delete (templateData as any).id;
    const templateRef = await addDoc(collection(db, COLLECTION_NAME), templateData);
    return templateRef.id;
  },

  async clone(id: string, newTitle: string, projectId?: string): Promise<string> {
    // Get the source BOQ
    const source = await this.getById(id);
    
    // Create cloned version
    const clonedData = {
      ...source,
      title: newTitle,
      projectId: projectId || source.projectId,
      status: 'draft' as BOQStatusType,
      isTemplate: false,
      clonedFromId: id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    // Remove ID and create new document
    delete (clonedData as any).id;
    const clonedRef = await addDoc(collection(db, COLLECTION_NAME), clonedData);
    return clonedRef.id;
  },

  // Export Operations
  async exportToCsv(id: string): Promise<string> {
    const boq = await this.getById(id);
    
    // Create CSV content
    let csvContent = 'Item Code,Description,Quantity,Unit,Rate,Amount\n';
    
    if (boq.items && boq.items.length > 0) {
      boq.items.forEach(item => {
        const row = [
          item.itemCode || '',
          item.description || '',
          item.quantity || 0,
          item.unit || '',
          item.rate || 0,
          (item.quantity || 0) * (item.rate || 0)
        ].map(field => `"${field}"`).join(',');
        
        csvContent += row + '\n';
      });
    }
    
    return csvContent;
  }
};

// Re-export the modular components
export { BOQCrud } from './boq/boqCrud';