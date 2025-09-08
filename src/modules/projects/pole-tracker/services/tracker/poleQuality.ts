/**
 * Pole Quality Checks Service
 * Manages quality control checks for poles
 */

import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/config/firebase';
import { PoleQualityChecks, POLE_COLLECTION } from './types';

export class PoleQualityService {
  /**
   * Update quality checks
   */
  static async updateQualityChecks(
    id: string,
    checks: Partial<PoleQualityChecks>
  ): Promise<void> {
    const poleRef = doc(db, POLE_COLLECTION, id);
    const existingDoc = await getDoc(poleRef);
    
    if (!existingDoc.exists()) {
      throw new Error('Pole not found');
    }

    const existingChecks = existingDoc.data()?.qualityChecks || {};

    await updateDoc(poleRef, {
      qualityChecks: {
        ...existingChecks,
        ...checks
      },
      'metadata.updatedAt': serverTimestamp()
    });
  }

  /**
   * Mark a single check as complete
   */
  static async markCheckComplete(
    id: string,
    checkType: keyof PoleQualityChecks,
    passed: boolean
  ): Promise<void> {
    await this.updateQualityChecks(id, { [checkType]: passed });
  }

  /**
   * Get quality checks for a pole
   */
  static async getQualityChecks(id: string): Promise<PoleQualityChecks> {
    const docSnap = await getDoc(doc(db, POLE_COLLECTION, id));
    
    if (!docSnap.exists()) {
      throw new Error('Pole not found');
    }

    return docSnap.data().qualityChecks || this.getEmptyChecks();
  }

  /**
   * Check if all quality checks passed
   */
  static async allChecksPassed(id: string): Promise<boolean> {
    const checks = await this.getQualityChecks(id);
    return Object.values(checks).every(check => check === true);
  }

  /**
   * Get quality check progress
   */
  static async getQualityProgress(id: string): Promise<{
    passed: number;
    failed: number;
    pending: number;
    total: number;
    percentage: number;
  }> {
    const checks = await this.getQualityChecks(id);
    const checkValues = Object.values(checks);
    
    const passed = checkValues.filter(check => check === true).length;
    const failed = checkValues.filter(check => check === false).length;
    const pending = checkValues.filter(check => check === null).length;
    const total = checkValues.length;
    const completed = passed + failed;

    return {
      passed,
      failed,
      pending,
      total,
      percentage: Math.round((completed / total) * 100)
    };
  }

  /**
   * Reset all quality checks
   */
  static async resetQualityChecks(id: string): Promise<void> {
    await updateDoc(doc(db, POLE_COLLECTION, id), {
      qualityChecks: this.getEmptyChecks(),
      'metadata.updatedAt': serverTimestamp()
    });
  }

  /**
   * Get failed quality checks
   */
  static async getFailedChecks(id: string): Promise<string[]> {
    const checks = await this.getQualityChecks(id);
    const failed: string[] = [];

    Object.entries(checks).forEach(([key, value]) => {
      if (value === false) {
        failed.push(key);
      }
    });

    return failed;
  }

  /**
   * Get empty quality checks object
   */
  private static getEmptyChecks(): PoleQualityChecks {
    return {
      poleCondition: null,
      cableRouting: null,
      connectorQuality: null,
      labelingCorrect: null,
      groundingProper: null,
      heightCompliant: null,
      tensionCorrect: null,
      documentationComplete: null
    };
  }
}