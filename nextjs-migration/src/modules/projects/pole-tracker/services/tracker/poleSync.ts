/**
 * Pole Sync Service
 * Handles synchronization operations for poles
 */

import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Pole, POLE_COLLECTION } from './types';

export class PoleSyncService {
  /**
   * Get poles with pending sync
   */
  static async getPendingSync(projectId: string): Promise<Pole[]> {
    const q = query(
      collection(db, POLE_COLLECTION),
      where('projectId', '==', projectId),
      where('metadata.syncStatus', '==', 'pending')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Pole));
  }

  /**
   * Mark poles as synced
   */
  static async markAsSynced(poleIds: string[]): Promise<void> {
    const updates = poleIds.map(id =>
      updateDoc(doc(db, POLE_COLLECTION, id), {
        'metadata.syncStatus': 'synced',
        'metadata.lastSyncAttempt': serverTimestamp()
      })
    );

    await Promise.all(updates);
  }

  /**
   * Mark pole sync as failed
   */
  static async markSyncFailed(
    poleId: string,
    error?: string
  ): Promise<void> {
    await updateDoc(doc(db, POLE_COLLECTION, poleId), {
      'metadata.syncStatus': 'error',
      'metadata.lastSyncAttempt': serverTimestamp(),
      'metadata.syncError': error || 'Unknown error'
    });
  }

  /**
   * Retry sync for failed poles
   */
  static async retrySyncFailed(projectId: string): Promise<Pole[]> {
    const q = query(
      collection(db, POLE_COLLECTION),
      where('projectId', '==', projectId),
      where('metadata.syncStatus', '==', 'error')
    );

    const snapshot = await getDocs(q);
    const poles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Pole));

    // Mark all as pending for retry
    const updates = poles.map(pole =>
      updateDoc(doc(db, POLE_COLLECTION, pole.id!), {
        'metadata.syncStatus': 'pending',
        'metadata.syncError': null
      })
    );

    await Promise.all(updates);
    return poles;
  }

  /**
   * Get sync status summary
   */
  static async getSyncStatus(projectId: string): Promise<{
    synced: number;
    pending: number;
    error: number;
    total: number;
  }> {
    const q = query(
      collection(db, POLE_COLLECTION),
      where('projectId', '==', projectId)
    );

    const snapshot = await getDocs(q);
    const poles = snapshot.docs.map(doc => doc.data());

    const synced = poles.filter(p => p.metadata?.syncStatus === 'synced').length;
    const pending = poles.filter(p => p.metadata?.syncStatus === 'pending').length;
    const error = poles.filter(p => p.metadata?.syncStatus === 'error').length;

    return {
      synced,
      pending,
      error,
      total: poles.length
    };
  }

  /**
   * Force sync all poles
   */
  static async forceSyncAll(projectId: string): Promise<void> {
    const q = query(
      collection(db, POLE_COLLECTION),
      where('projectId', '==', projectId)
    );

    const snapshot = await getDocs(q);
    const updates = snapshot.docs.map(doc =>
      updateDoc(doc.ref, {
        'metadata.syncStatus': 'pending',
        'metadata.syncError': null
      })
    );

    await Promise.all(updates);
  }
}