import { 
  collection, 
  doc, 
  writeBatch, 
  query, 
  where, 
  getDocs,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  PoleImportRow, 
  DropImportRow, 
  FiberImportRow,
  SOWImportSummary 
} from '../types/sowImport.types';

export class SOWTrackerService {
  private readonly BATCH_SIZE = 500;

  /**
   * Import poles from SOW data
   */
  async importPoles(
    projectId: string,
    projectCode: string,
    poles: PoleImportRow[]
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };
    const batch = writeBatch(db);
    let batchCount = 0;

    try {
      // Check for existing poles
      const existingPolesQuery = query(
        collection(db, 'poles'),
        where('projectId', '==', projectId)
      );
      const existingPoles = await getDocs(existingPolesQuery);
      const existingPoleNumbers = new Set(
        existingPoles.docs.map(doc => doc.data().poleNumber)
      );

      for (const pole of poles) {
        try {
          // Validate pole number uniqueness
          if (existingPoleNumbers.has(pole.poleNumber)) {
            results.errors.push(`Pole ${pole.poleNumber} already exists`);
            results.failed++;
            continue;
          }

          const poleRef = doc(collection(db, 'poles'));
          const poleData = {
            projectId,
            projectCode,
            poleNumber: pole.poleNumber,
            location: pole.location || '',
            coordinates: pole.coordinates ? {
              lat: pole.coordinates.lat,
              lng: pole.coordinates.lng
            } : null,
            phase: pole.phase || 'Phase 1',
            status: 'pending',
            dropCount: pole.dropCount || 0,
            maxDrops: 12,
            installationDate: null,
            photos: {
              beforeInstallation: null,
              duringInstallation: null,
              afterInstallation: null,
              poleLabel: null,
              cableRouting: null,
              qualityCheck: null
            },
            qualityChecks: {
              poleCondition: null,
              cableRouting: null,
              connectorQuality: null,
              labelingCorrect: null,
              groundingProper: null,
              heightCompliant: null,
              tensionCorrect: null,
              documentationComplete: null
            },
            metadata: {
              importedAt: serverTimestamp(),
              importedFrom: 'SOW',
              lastUpdated: serverTimestamp(),
              createdBy: 'system',
              syncStatus: 'synced'
            }
          };

          batch.set(poleRef, poleData);
          batchCount++;
          results.success++;

          // Commit batch if size reached
          if (batchCount >= this.BATCH_SIZE) {
            await batch.commit();
            batchCount = 0;
          }
        } catch (error) {
          results.errors.push(`Failed to import pole ${pole.poleNumber}: ${error}`);
          results.failed++;
        }
      }

      // Commit remaining batch
      if (batchCount > 0) {
        await batch.commit();
      }

      return results;
    } catch (error) {
      console.error('Error importing poles:', error);
      throw error;
    }
  }

  /**
   * Import home drops from SOW data
   */
  async importDrops(
    projectId: string,
    projectCode: string,
    drops: DropImportRow[]
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };
    const batch = writeBatch(db);
    let batchCount = 0;

    try {
      // Check for existing drops
      const existingDropsQuery = query(
        collection(db, 'drops'),
        where('projectId', '==', projectId)
      );
      const existingDrops = await getDocs(existingDropsQuery);
      const existingDropNumbers = new Set(
        existingDrops.docs.map(doc => doc.data().dropNumber)
      );

      for (const drop of drops) {
        try {
          // Validate drop number uniqueness
          if (existingDropNumbers.has(drop.dropNumber)) {
            results.errors.push(`Drop ${drop.dropNumber} already exists`);
            results.failed++;
            continue;
          }

          const dropRef = doc(collection(db, 'drops'));
          const dropData = {
            projectId,
            projectCode,
            dropNumber: drop.dropNumber,
            poleNumber: drop.poleNumber,
            address: drop.address || '',
            coordinates: drop.coordinates ? {
              lat: drop.coordinates.lat,
              lng: drop.coordinates.lng
            } : null,
            homeOwner: drop.homeOwner || '',
            contactNumber: drop.contactNumber || '',
            phase: drop.phase || 'Phase 1',
            status: 'pending',
            installationType: drop.installationType || 'standard',
            cableLength: drop.cableLength || 0,
            installationDate: null,
            photos: {
              houseEntrance: null,
              cableRoute: null,
              termination: null,
              speedTest: null,
              completion: null,
              customerSignoff: null
            },
            qualityChecks: {
              cableIntegrity: null,
              connectorQuality: null,
              signalStrength: null,
              speedTestPassed: null,
              customerSatisfied: null,
              documentationComplete: null
            },
            notes: drop.notes || '',
            metadata: {
              importedAt: serverTimestamp(),
              importedFrom: 'SOW',
              lastUpdated: serverTimestamp(),
              createdBy: 'system',
              syncStatus: 'synced'
            }
          };

          batch.set(dropRef, dropData);
          batchCount++;
          results.success++;

          // Commit batch if size reached
          if (batchCount >= this.BATCH_SIZE) {
            await batch.commit();
            batchCount = 0;
          }
        } catch (error) {
          results.errors.push(`Failed to import drop ${drop.dropNumber}: ${error}`);
          results.failed++;
        }
      }

      // Commit remaining batch
      if (batchCount > 0) {
        await batch.commit();
      }

      return results;
    } catch (error) {
      console.error('Error importing drops:', error);
      throw error;
    }
  }

  /**
   * Import fiber sections from SOW data
   */
  async importFiber(
    projectId: string,
    projectCode: string,
    fiberSections: FiberImportRow[]
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };
    const batch = writeBatch(db);
    let batchCount = 0;

    try {
      // Check for existing fiber sections
      const existingFiberQuery = query(
        collection(db, 'fiberSections'),
        where('projectId', '==', projectId)
      );
      const existingFiber = await getDocs(existingFiberQuery);
      const existingSectionIds = new Set(
        existingFiber.docs.map(doc => doc.data().sectionId)
      );

      for (const fiber of fiberSections) {
        try {
          // Validate section ID uniqueness
          if (existingSectionIds.has(fiber.sectionId)) {
            results.errors.push(`Fiber section ${fiber.sectionId} already exists`);
            results.failed++;
            continue;
          }

          const fiberRef = doc(collection(db, 'fiberSections'));
          const fiberData = {
            projectId,
            projectCode,
            sectionId: fiber.sectionId,
            startPoint: fiber.startPoint || '',
            endPoint: fiber.endPoint || '',
            startCoordinates: fiber.startCoordinates ? {
              lat: fiber.startCoordinates.lat,
              lng: fiber.startCoordinates.lng
            } : null,
            endCoordinates: fiber.endCoordinates ? {
              lat: fiber.endCoordinates.lat,
              lng: fiber.endCoordinates.lng
            } : null,
            length: fiber.length || 0,
            cableType: fiber.cableType || '12-core',
            phase: fiber.phase || 'Phase 1',
            status: 'pending',
            installationMethod: fiber.installationMethod || 'aerial',
            stringingDate: null,
            splicingDate: null,
            testingDate: null,
            photos: {
              startPoint: null,
              endPoint: null,
              midSpan: null,
              splicing: null,
              testing: null,
              completion: null
            },
            testResults: {
              otdrTest: null,
              continuityTest: null,
              lossTest: null,
              reflectionTest: null
            },
            qualityChecks: {
              cableIntegrity: null,
              splicingQuality: null,
              tensionCorrect: null,
              sagCompliant: null,
              routingProper: null,
              documentationComplete: null
            },
            notes: fiber.notes || '',
            metadata: {
              importedAt: serverTimestamp(),
              importedFrom: 'SOW',
              lastUpdated: serverTimestamp(),
              createdBy: 'system',
              syncStatus: 'synced'
            }
          };

          batch.set(fiberRef, fiberData);
          batchCount++;
          results.success++;

          // Commit batch if size reached
          if (batchCount >= this.BATCH_SIZE) {
            await batch.commit();
            batchCount = 0;
          }
        } catch (error) {
          results.errors.push(`Failed to import fiber section ${fiber.sectionId}: ${error}`);
          results.failed++;
        }
      }

      // Commit remaining batch
      if (batchCount > 0) {
        await batch.commit();
      }

      return results;
    } catch (error) {
      console.error('Error importing fiber sections:', error);
      throw error;
    }
  }

  /**
   * Get import summary for a project
   */
  async getImportSummary(projectId: string): Promise<SOWImportSummary> {
    try {
      // Get poles count
      const polesQuery = query(
        collection(db, 'poles'),
        where('projectId', '==', projectId)
      );
      const polesSnapshot = await getDocs(polesQuery);

      // Get drops count
      const dropsQuery = query(
        collection(db, 'drops'),
        where('projectId', '==', projectId)
      );
      const dropsSnapshot = await getDocs(dropsQuery);

      // Get fiber sections count
      const fiberQuery = query(
        collection(db, 'fiberSections'),
        where('projectId', '==', projectId)
      );
      const fiberSnapshot = await getDocs(fiberQuery);

      return {
        totalPoles: polesSnapshot.size,
        totalDrops: dropsSnapshot.size,
        totalFiberSections: fiberSnapshot.size,
        importDate: Timestamp.now(),
        status: 'completed',
        errors: []
      };
    } catch (error) {
      console.error('Error getting import summary:', error);
      throw error;
    }
  }

  /**
   * Validate import data before processing
   */
  async validateImportData(
    projectId: string,
    poles: PoleImportRow[],
    drops: DropImportRow[],
    fiberSections: FiberImportRow[]
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate poles
    const poleNumbers = new Set<string>();
    for (const pole of poles) {
      if (!pole.poleNumber) {
        errors.push('Pole missing pole number');
        continue;
      }
      if (poleNumbers.has(pole.poleNumber)) {
        errors.push(`Duplicate pole number: ${pole.poleNumber}`);
      }
      poleNumbers.add(pole.poleNumber);

      if (pole.dropCount && pole.dropCount > 12) {
        errors.push(`Pole ${pole.poleNumber} exceeds maximum drop count of 12`);
      }
    }

    // Validate drops
    const dropNumbers = new Set<string>();
    for (const drop of drops) {
      if (!drop.dropNumber) {
        errors.push('Drop missing drop number');
        continue;
      }
      if (dropNumbers.has(drop.dropNumber)) {
        errors.push(`Duplicate drop number: ${drop.dropNumber}`);
      }
      dropNumbers.add(drop.dropNumber);

      if (drop.poleNumber && !poleNumbers.has(drop.poleNumber)) {
        errors.push(`Drop ${drop.dropNumber} references non-existent pole: ${drop.poleNumber}`);
      }
    }

    // Validate fiber sections
    const sectionIds = new Set<string>();
    for (const fiber of fiberSections) {
      if (!fiber.sectionId) {
        errors.push('Fiber section missing section ID');
        continue;
      }
      if (sectionIds.has(fiber.sectionId)) {
        errors.push(`Duplicate fiber section ID: ${fiber.sectionId}`);
      }
      sectionIds.add(fiber.sectionId);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const sowTrackerService = new SOWTrackerService();