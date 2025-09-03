/**
 * Pole Tracker Service - Main Service Facade
 * Provides high-level pole tracking operations using modular components
 */

import { poleValidationService } from './poleValidation';
import { poleStatisticsService, PoleStatistics } from './poleStatistics';
import {
  Pole,
  PoleFilters,
  PolePhotos,
  PoleQualityChecks,
  PoleCrudService,
  PoleQueryService,
  PoleStatusService,
  PolePhotosService,
  PoleQualityService,
  PoleSyncService
} from './tracker';

export type { Pole } from './tracker';

export class PoleTrackerService {
  // Aliases for hook compatibility
  getById = this.getPoleById;
  getByProject = this.getPolesByProject;
  create = this.createPole;
  update = this.updatePole;
  delete = this.deletePole;
  getStatistics = this.getProjectStatistics;
  getPendingSync = this.getPendingSyncPoles;

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

    return PoleCrudService.create(data);
  }

  /**
   * Update an existing pole
   */
  async updatePole(id: string, updates: Partial<Pole>): Promise<void> {
    // If updating pole number, check uniqueness
    if (updates.poleNumber) {
      const isUnique = await poleValidationService.isPoleNumberUnique(
        updates.poleNumber,
        id
      );
      if (!isUnique) {
        throw new Error(`Pole number ${updates.poleNumber} already exists`);
      }
    }

    // If updating drop count, validate
    if (updates.dropCount !== undefined) {
      const existingPole = await PoleCrudService.getById(id);
      const maxDrops = updates.maxDrops || existingPole?.maxDrops || 12;
      
      if (!poleValidationService.validateDropCount(updates.dropCount, maxDrops)) {
        throw new Error(`Drop count ${updates.dropCount} exceeds maximum of ${maxDrops}`);
      }
    }

    // Track status changes if needed
    if (updates.status) {
      const existingPole = await PoleCrudService.getById(id);
      if (existingPole && existingPole.status !== updates.status) {
        await PoleStatusService.updateStatus(
          id,
          updates.status,
          updates.metadata?.createdBy || 'system'
        );
        // Remove status from updates since it's handled by PoleStatusService
        const { status, ...otherUpdates } = updates;
        void status; // Acknowledge unused destructured variable
        if (Object.keys(otherUpdates).length > 0) {
          await PoleCrudService.update(id, otherUpdates);
        }
        return;
      }
    }

    await PoleCrudService.update(id, updates);
  }

  /**
   * Delete a pole
   */
  async deletePole(id: string): Promise<void> {
    await PoleCrudService.delete(id);
  }

  /**
   * Get all poles
   */
  async getAll(): Promise<Pole[]> {
    return PoleCrudService.getAll();
  }

  /**
   * Get a single pole by ID
   */
  async getPoleById(id: string): Promise<Pole | null> {
    return PoleCrudService.getById(id);
  }

  /**
   * Get poles for a project
   */
  async getPolesByProject(
    projectId: string,
    filters?: PoleFilters
  ): Promise<Pole[]> {
    return PoleQueryService.getByProject(projectId, filters);
  }

  /**
   * Update pole photos
   */
  async updatePolePhotos(
    id: string,
    photos: Partial<PolePhotos>
  ): Promise<void> {
    await PolePhotosService.updatePhotos(id, photos);
  }

  /**
   * Update quality checks
   */
  async updateQualityChecks(
    id: string,
    checks: Partial<PoleQualityChecks>
  ): Promise<void> {
    await PoleQualityService.updateQualityChecks(id, checks);
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
    return PoleSyncService.getPendingSync(projectId);
  }

  /**
   * Mark poles as synced
   */
  async markAsSynced(poleIds: string[]): Promise<void> {
    await PoleSyncService.markAsSynced(poleIds);
  }
}