/**
 * Supplier Status Service - Main Service Class
 * Unified interface for all supplier status operations
 */

import { 
  SupplierStatus,
  Supplier,
  StatusUpdateData,
  BatchOperationResult,
  PreferenceUpdateResult,
  StatusSummary,
  StatusHistoryEntry,
  StatusTransitionValidation,
  SupplierEligibility,
  PreferenceUpdate
} from './types';
import { StatusCore } from './statusCore';
import { BatchOperations } from './batchOperations';
import { StatusQueries } from './statusQueries';
import { StatusValidation } from './statusValidation';

/**
 * Main supplier status management service
 * Provides unified interface to all status-related operations
 */
export class SupplierStatusService {
  // Status Management
  static async updateStatus(
    id: string, 
    status: SupplierStatus, 
    reason?: string,
    userId?: string
  ): Promise<void> {
    return StatusCore.updateStatus(id, { status, reason, userId });
  }

  static async setPreferred(
    id: string, 
    isPreferred: boolean,
    userId?: string
  ): Promise<void> {
    return StatusCore.setPreferred(id, isPreferred, userId);
  }

  // Batch Operations
  static async activateMultiple(
    supplierIds: string[],
    userId?: string
  ): Promise<BatchOperationResult> {
    return BatchOperations.activateMultiple(supplierIds, userId);
  }

  static async deactivateMultiple(
    supplierIds: string[],
    reason?: string,
    userId?: string
  ): Promise<BatchOperationResult> {
    return BatchOperations.deactivateMultiple(supplierIds, reason, userId);
  }

  static async updatePreferences(
    updates: PreferenceUpdate[],
    userId?: string
  ): Promise<PreferenceUpdateResult> {
    return BatchOperations.updatePreferences(updates, userId);
  }

  // Query Operations
  static async getByStatus(status: SupplierStatus): Promise<Supplier[]> {
    return StatusQueries.getByStatus(status);
  }

  static async getStatusSummary(): Promise<StatusSummary> {
    return StatusQueries.getStatusSummary();
  }

  static async getPendingApproval(): Promise<Supplier[]> {
    return StatusQueries.getPendingApproval();
  }

  static async getPreferredSuppliers(): Promise<Supplier[]> {
    return StatusQueries.getPreferredSuppliers();
  }

  static async getStatusHistory(supplierId: string): Promise<StatusHistoryEntry[]> {
    return StatusQueries.getStatusHistory(supplierId);
  }

  // Validation
  static isValidStatusTransition(
    currentStatus: SupplierStatus, 
    newStatus: SupplierStatus
  ): StatusTransitionValidation {
    return StatusValidation.isValidStatusTransition(currentStatus, newStatus);
  }

  static checkEligibility(supplier: Supplier): SupplierEligibility {
    return StatusValidation.checkEligibility(supplier);
  }
}