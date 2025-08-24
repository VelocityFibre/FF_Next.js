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
      version: data.version || '1.0',
      items: data.items || [],
      totalValue: data.totalValue || 0,
      currency: data.currency || 'USD'
    };
  }

  /**
   * Transform BOQ for Firestore storage
   */
  static transformForFirestore(boq: Partial<BOQ>): any {
    const firestoreDoc = { ...boq };
    
    // Convert dates to Firestore Timestamps
    if (firestoreDoc.createdAt) {
      firestoreDoc.createdAt = Timestamp.fromDate(firestoreDoc.createdAt);
    }
    if (firestoreDoc.updatedAt) {
      firestoreDoc.updatedAt = Timestamp.fromDate(firestoreDoc.updatedAt);
    }
    if (firestoreDoc.uploadedAt) {
      firestoreDoc.uploadedAt = Timestamp.fromDate(firestoreDoc.uploadedAt);
    }
    if (firestoreDoc.approvedAt) {
      firestoreDoc.approvedAt = Timestamp.fromDate(firestoreDoc.approvedAt);
    }
    if (firestoreDoc.rejectedAt) {
      firestoreDoc.rejectedAt = Timestamp.fromDate(firestoreDoc.rejectedAt);
    }

    // Remove undefined fields
    Object.keys(firestoreDoc).forEach(key => {
      if (firestoreDoc[key] === undefined) {
        delete firestoreDoc[key];
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