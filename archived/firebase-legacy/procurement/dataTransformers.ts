/**
 * BOQ Data Transformers
 * Utility functions for transforming BOQ data between Firestore and application formats
 */

import { Timestamp } from 'firebase/firestore';
import { BOQ, BOQFormData } from '../../../../types/procurement/boq.types';

export class BOQDataTransformers {
  /**
   * Transform Firestore document to BOQ object
   */
  static transformFirestoreDoc(doc: any): BOQ {
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
  }

  /**
   * Create BOQ object from form data
   */
  static createBOQFromFormData(data: BOQFormData): Partial<BOQ> {
    const now = new Date();
    return {
      ...data,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      uploadedAt: now,
      name: data.title || 'Untitled BOQ',
      version: data.version || '1.0',
      uploadedBy: 'current-user', // TODO: Get from auth context
      itemCount: 0,
      mappedItems: 0,
      unmappedItems: 0,
      exceptionsCount: 0,
      totalEstimatedValue: 0,
      currency: data.currency || 'ZAR'
    };
  }

  /**
   * Transform BOQ for Firestore storage
   */
  static transformForFirestore(boq: Partial<BOQ>): any {
    const firestoreDoc = { ...boq };
    
    // Convert dates to Firestore Timestamps
    if (firestoreDoc.createdAt instanceof Date) {
      (firestoreDoc as any).createdAt = Timestamp.fromDate(firestoreDoc.createdAt);
    }
    if (firestoreDoc.updatedAt instanceof Date) {
      (firestoreDoc as any).updatedAt = Timestamp.fromDate(firestoreDoc.updatedAt);
    }
    if (firestoreDoc.uploadedAt instanceof Date) {
      (firestoreDoc as any).uploadedAt = Timestamp.fromDate(firestoreDoc.uploadedAt);
    }
    if (firestoreDoc.approvedAt instanceof Date) {
      (firestoreDoc as any).approvedAt = Timestamp.fromDate(firestoreDoc.approvedAt);
    }
    if (firestoreDoc.rejectedAt instanceof Date) {
      (firestoreDoc as any).rejectedAt = Timestamp.fromDate(firestoreDoc.rejectedAt);
    }

    // Remove undefined fields
    Object.keys(firestoreDoc).forEach(key => {
      if ((firestoreDoc as any)[key] === undefined) {
        delete (firestoreDoc as any)[key];
      }
    });

    return firestoreDoc;
  }

  /**
   * Transform BOQ items for display
   */
  static transformItemsForDisplay(items: any[]): any[] {
    return items.map(item => ({
      ...item,
      totalCost: (item.quantity || 0) * (item.unitPrice || 0),
      formattedUnitPrice: this.formatCurrency(item.unitPrice || 0, item.currency),
      formattedTotalCost: this.formatCurrency(
        (item.quantity || 0) * (item.unitPrice || 0), 
        item.currency
      )
    }));
  }

  /**
   * Format currency value for display
   */
  private static formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  }

  /**
   * Calculate BOQ totals
   */
  static calculateTotals(items: any[]): { totalValue: number; itemCount: number } {
    const totalValue = items.reduce((sum, item) => {
      return sum + ((item.quantity || 0) * (item.unitPrice || 0));
    }, 0);

    return {
      totalValue,
      itemCount: items.length
    };
  }
}