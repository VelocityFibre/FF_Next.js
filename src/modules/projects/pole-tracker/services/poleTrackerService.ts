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
  limit,
  Timestamp,
  QueryConstraint,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { 
  PoleTracker, 
  PoleSearchFilters, 
  PoleListItem,
  StatusHistoryEntry,
  PolePhoto,
  QualityCheck
} from '../types/pole-tracker.types';

const COLLECTION_NAME = 'pole-trackers';

export const poleTrackerService = {
  /**
   * Generate VF Pole ID
   */
  generateVfPoleId(projectCode: string, sequenceNumber: number): string {
    const paddedNumber = sequenceNumber.toString().padStart(4, '0');
    return `${projectCode}.P.A${paddedNumber}`;
  },

  /**
   * Get all poles with optional filters
   */
  async getAll(filters?: PoleSearchFilters): Promise<PoleTracker[]> {
    try {
      const constraints: QueryConstraint[] = [];

      if (filters?.projectId) {
        constraints.push(where('projectId', '==', filters.projectId));
      }
      if (filters?.contractorId) {
        constraints.push(where('contractorId', '==', filters.contractorId));
      }
      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters?.installationPhase) {
        constraints.push(where('installationPhase', '==', filters.installationPhase));
      }
      if (filters?.syncStatus) {
        constraints.push(where('syncStatus', '==', filters.syncStatus));
      }

      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PoleTracker));
    } catch (error) {
      console.error('Error fetching poles:', error);
      throw error;
    }
  },

  /**
   * Get pole by ID
   */
  async getById(id: string): Promise<PoleTracker | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.id,
        ...snapshot.data()
      } as PoleTracker;
    } catch (error) {
      console.error('Error fetching pole:', error);
      throw error;
    }
  },

  /**
   * Check if pole number is unique
   */
  async isPoleNumberUnique(poleNumber: string, excludeId?: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('poleNumber', '==', poleNumber)
      );
      const snapshot = await getDocs(q);

      if (excludeId) {
        return snapshot.docs.every(doc => doc.id === excludeId);
      }

      return snapshot.empty;
    } catch (error) {
      console.error('Error checking pole number uniqueness:', error);
      throw error;
    }
  },

  /**
   * Create new pole
   */
  async create(data: Omit<PoleTracker, 'id'>): Promise<string> {
    try {
      // Validate pole number uniqueness
      const isUnique = await this.isPoleNumberUnique(data.poleNumber);
      if (!isUnique) {
        throw new Error(`Pole number ${data.poleNumber} already exists`);
      }

      // Validate drop count
      if (data.dropCount && data.dropCount > data.maxCapacity) {
        throw new Error(`Drop count cannot exceed maximum capacity of ${data.maxCapacity}`);
      }

      // Add status to history if present
      const statusHistory: StatusHistoryEntry[] = [];
      if (data.status) {
        statusHistory.push({
          status: data.status,
          changedAt: Timestamp.now(),
          changedBy: data.createdBy,
          changedByName: data.createdByName,
          source: data.importSource || 'Manual Entry',
          importBatchId: data.importBatchId,
        });
      }

      const poleData = {
        ...data,
        statusHistory,
        dropCount: data.connectedDrops?.length || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        syncStatus: 'synced',
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), poleData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating pole:', error);
      throw error;
    }
  },

  /**
   * Update pole
   */
  async update(id: string, data: Partial<PoleTracker>): Promise<void> {
    try {
      // If updating pole number, check uniqueness
      if (data.poleNumber) {
        const isUnique = await this.isPoleNumberUnique(data.poleNumber, id);
        if (!isUnique) {
          throw new Error(`Pole number ${data.poleNumber} already exists`);
        }
      }

      // Validate drop count
      if (data.dropCount !== undefined && data.maxCapacity) {
        if (data.dropCount > data.maxCapacity) {
          throw new Error(`Drop count cannot exceed maximum capacity of ${data.maxCapacity}`);
        }
      }

      // Update status history if status changed
      if (data.status) {
        const existing = await this.getById(id);
        if (existing && existing.status !== data.status) {
          const statusHistory = existing.statusHistory || [];
          statusHistory.push({
            status: data.status,
            changedAt: Timestamp.now(),
            changedBy: data.updatedBy || 'system',
            changedByName: data.updatedByName,
            previousStatus: existing.status,
            source: 'Manual Update',
          });
          data.statusHistory = statusHistory;
        }
      }

      // Update drop count if drops array changed
      if (data.connectedDrops) {
        data.dropCount = data.connectedDrops.length;
      }

      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating pole:', error);
      throw error;
    }
  },

  /**
   * Delete pole
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting pole:', error);
      throw error;
    }
  },

  /**
   * Get poles by project
   */
  async getByProject(projectId: string): Promise<PoleTracker[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('projectId', '==', projectId),
        orderBy('vfPoleId', 'asc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PoleTracker));
    } catch (error) {
      console.error('Error fetching project poles:', error);
      throw error;
    }
  },

  /**
   * Add photo to pole
   */
  async addPhoto(poleId: string, photo: PolePhoto): Promise<void> {
    try {
      const pole = await this.getById(poleId);
      if (!pole) {
        throw new Error('Pole not found');
      }

      const photos = pole.installationPhotos || [];
      photos.push(photo);

      await this.update(poleId, {
        installationPhotos: photos,
      });
    } catch (error) {
      console.error('Error adding photo:', error);
      throw error;
    }
  },

  /**
   * Add quality check
   */
  async addQualityCheck(poleId: string, check: QualityCheck): Promise<void> {
    try {
      const pole = await this.getById(poleId);
      if (!pole) {
        throw new Error('Pole not found');
      }

      const checks = pole.qualityChecks || [];
      checks.push(check);

      await this.update(poleId, {
        qualityChecks: checks,
      });
    } catch (error) {
      console.error('Error adding quality check:', error);
      throw error;
    }
  },

  /**
   * Get poles needing sync
   */
  async getPendingSync(): Promise<PoleTracker[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('syncStatus', '==', 'pending'),
        orderBy('createdAt', 'asc'),
        limit(50)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PoleTracker));
    } catch (error) {
      console.error('Error fetching pending sync poles:', error);
      throw error;
    }
  },

  /**
   * Bulk import poles
   */
  async bulkImport(poles: Omit<PoleTracker, 'id'>[], batchId: string): Promise<{ success: number; errors: string[] }> {
    const results = {
      success: 0,
      errors: [] as string[],
    };

    for (const pole of poles) {
      try {
        // Check pole number uniqueness
        const isUnique = await this.isPoleNumberUnique(pole.poleNumber);
        if (!isUnique) {
          results.errors.push(`Pole ${pole.poleNumber}: Already exists`);
          continue;
        }

        // Add import tracking
        const poleData = {
          ...pole,
          importBatchId: batchId,
          importSource: 'Bulk Import',
        };

        await this.create(poleData);
        results.success++;
      } catch (error) {
        results.errors.push(`Pole ${pole.poleNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return results;
  },

  /**
   * Get statistics
   */
  async getStatistics(projectId?: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPhase: Record<string, number>;
    byContractor: Record<string, number>;
    averageDropUtilization: number;
  }> {
    try {
      const constraints: QueryConstraint[] = [];
      if (projectId) {
        constraints.push(where('projectId', '==', projectId));
      }

      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const snapshot = await getDocs(q);

      const stats = {
        total: snapshot.size,
        byStatus: {} as Record<string, number>,
        byPhase: {} as Record<string, number>,
        byContractor: {} as Record<string, number>,
        totalDrops: 0,
        totalCapacity: 0,
      };

      snapshot.docs.forEach(doc => {
        const data = doc.data() as PoleTracker;
        
        // Count by status
        if (data.status) {
          stats.byStatus[data.status] = (stats.byStatus[data.status] || 0) + 1;
        }

        // Count by phase
        if (data.installationPhase) {
          stats.byPhase[data.installationPhase] = (stats.byPhase[data.installationPhase] || 0) + 1;
        }

        // Count by contractor
        if (data.contractorName) {
          stats.byContractor[data.contractorName] = (stats.byContractor[data.contractorName] || 0) + 1;
        }

        // Calculate drop utilization
        stats.totalDrops += data.dropCount || 0;
        stats.totalCapacity += data.maxCapacity || 12;
      });

      return {
        total: stats.total,
        byStatus: stats.byStatus,
        byPhase: stats.byPhase,
        byContractor: stats.byContractor,
        averageDropUtilization: stats.totalCapacity > 0 
          ? (stats.totalDrops / stats.totalCapacity) * 100 
          : 0,
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  },
};