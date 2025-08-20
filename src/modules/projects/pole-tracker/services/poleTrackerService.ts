import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { poleValidationService } from './poleValidation';
import { poleStatisticsService, PoleStatistics } from './poleStatistics';

export interface Pole {
  id?: string;
  poleNumber: string;
  projectId: string;
  projectCode: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  phase: string;
  status: 'pending' | 'in_progress' | 'completed' | 'issue';
  dropCount: number;
  maxDrops: number;
  installationDate?: Date | null;
  photos: {
    beforeInstallation: string | null;
    duringInstallation: string | null;
    afterInstallation: string | null;
    poleLabel: string | null;
    cableRouting: string | null;
    qualityCheck: string | null;
  };
  qualityChecks: {
    poleCondition: boolean | null;
    cableRouting: boolean | null;
    connectorQuality: boolean | null;
    labelingCorrect: boolean | null;
    groundingProper: boolean | null;
    heightCompliant: boolean | null;
    tensionCorrect: boolean | null;
    documentationComplete: boolean | null;
  };
  statusHistory?: Array<{
    status: string;
    timestamp: Date;
    changedBy: string;
    notes?: string;
  }>;
  metadata: {
    createdAt?: any;
    updatedAt?: any;
    createdBy?: string;
    syncStatus?: 'synced' | 'pending' | 'error';
    lastSyncAttempt?: Date;
  };
}

export class PoleTrackerService {
  private readonly collection = 'poles';

  /**
   * Create a new pole
   */
  async createPole(data: Omit<Pole, 'id'>): Promise<string> {
    // Validate pole number uniqueness
    const isUnique = await poleValidationService.isPoleNumberUnique(data.poleNumber);
    if (!isUnique) {
      throw new Error(`Pole number ${data.poleNumber} already exists`);
    }

    // Validate drop count
    if (!poleValidationService.validateDropCount(data.dropCount, data.maxDrops)) {
      throw new Error(`Drop count ${data.dropCount} exceeds maximum of ${data.maxDrops}`);
    }

    const poleData = {
      ...data,
      metadata: {
        ...data.metadata,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        syncStatus: 'synced'
      }
    };

    const docRef = await addDoc(collection(db, this.collection), poleData);
    return docRef.id;
  }

  /**
   * Update an existing pole
   */
  async updatePole(id: string, updates: Partial<Pole>): Promise<void> {
    const poleRef = doc(db, this.collection, id);
    
    // If updating pole number, check uniqueness
    if (updates.poleNumber) {
      const isUnique = await poleValidationService.isPoleNumberUnique(updates.poleNumber, id);
      if (!isUnique) {
        throw new Error(`Pole number ${updates.poleNumber} already exists`);
      }
    }

    // If updating drop count, validate
    if (updates.dropCount !== undefined) {
      const existingDoc = await getDoc(poleRef);
      const maxDrops = updates.maxDrops || existingDoc.data()?.maxDrops || 12;
      
      if (!poleValidationService.validateDropCount(updates.dropCount, maxDrops)) {
        throw new Error(`Drop count ${updates.dropCount} exceeds maximum of ${maxDrops}`);
      }
    }

    // Track status changes
    if (updates.status) {
      const existingDoc = await getDoc(poleRef);
      const currentStatus = existingDoc.data()?.status;
      
      if (currentStatus !== updates.status) {
        const statusHistory = existingDoc.data()?.statusHistory || [];
        statusHistory.push({
          status: updates.status,
          timestamp: new Date(),
          changedBy: updates.metadata?.createdBy || 'system',
          previousStatus: currentStatus
        });
        updates.statusHistory = statusHistory;
      }
    }

    const updateData = {
      ...updates,
      metadata: {
        ...updates.metadata,
        updatedAt: serverTimestamp()
      }
    };

    await updateDoc(poleRef, updateData);
  }

  /**
   * Delete a pole
   */
  async deletePole(id: string): Promise<void> {
    await deleteDoc(doc(db, this.collection, id));
  }

  /**
   * Get a single pole by ID
   */
  async getPoleById(id: string): Promise<Pole | null> {
    const docSnap = await getDoc(doc(db, this.collection, id));
    
    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Pole;
  }

  /**
   * Get poles for a project
   */
  async getPolesByProject(
    projectId: string,
    filters?: {
      status?: string;
      phase?: string;
      search?: string;
    }
  ): Promise<Pole[]> {
    let q = query(
      collection(db, this.collection),
      where('projectId', '==', projectId),
      orderBy('poleNumber')
    );

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }

    if (filters?.phase) {
      q = query(q, where('phase', '==', filters.phase));
    }

    const snapshot = await getDocs(q);
    let poles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Pole));

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      poles = poles.filter(pole =>
        pole.poleNumber.toLowerCase().includes(searchLower) ||
        pole.location.toLowerCase().includes(searchLower)
      );
    }

    return poles;
  }

  /**
   * Update pole photos
   */
  async updatePolePhotos(id: string, photos: Partial<Pole['photos']>): Promise<void> {
    const poleRef = doc(db, this.collection, id);
    const existingDoc = await getDoc(poleRef);
    const existingPhotos = existingDoc.data()?.photos || {};

    await updateDoc(poleRef, {
      photos: {
        ...existingPhotos,
        ...photos
      },
      'metadata.updatedAt': serverTimestamp()
    });
  }

  /**
   * Update quality checks
   */
  async updateQualityChecks(
    id: string,
    checks: Partial<Pole['qualityChecks']>
  ): Promise<void> {
    const poleRef = doc(db, this.collection, id);
    const existingDoc = await getDoc(poleRef);
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
   * Get statistics for a project
   */
  async getProjectStatistics(projectId: string): Promise<PoleStatistics> {
    return poleStatisticsService.getProjectStatistics(projectId);
  }

  /**
   * Get poles with pending sync
   */
  async getPendingSyncPoles(projectId: string): Promise<Pole[]> {
    const q = query(
      collection(db, this.collection),
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
  async markAsSynced(poleIds: string[]): Promise<void> {
    const updates = poleIds.map(id =>
      updateDoc(doc(db, this.collection, id), {
        'metadata.syncStatus': 'synced',
        'metadata.lastSyncAttempt': serverTimestamp()
      })
    );

    await Promise.all(updates);
  }
}

export const poleTrackerService = new PoleTrackerService();