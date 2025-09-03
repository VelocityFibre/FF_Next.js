/**
 * Supplier CRUD Index
 * Unified interface for all supplier CRUD operations
 */

import { SupplierBaseCrud } from './base';
import { SupplierBatchOperations } from './batch';
import { SupplierExtendedOperations } from './extended';

// Re-export types
export * from './types';

/**
 * Unified Supplier CRUD Service
 * Combines all CRUD operations into a single interface
 */
export class SupplierCrudService {
  // Base CRUD operations
  static getAll = SupplierBaseCrud.getAll;
  static getById = SupplierBaseCrud.getById;
  static exists = SupplierBaseCrud.exists;
  static create = SupplierBaseCrud.create;
  static update = SupplierBaseCrud.update;
  static delete = SupplierBaseCrud.delete;

  // Batch operations
  static getByIds = SupplierBatchOperations.getByIds;
  static processBatch = SupplierBatchOperations.processBatch;

  // Extended operations
  static softDelete = SupplierExtendedOperations.softDelete;
  static getActiveCount = SupplierExtendedOperations.getActiveCount;
  static getCountByStatus = SupplierExtendedOperations.getCountByStatus;
  static isCodeUnique = SupplierExtendedOperations.isCodeUnique;
  static isEmailUnique = SupplierExtendedOperations.isEmailUnique;
  static getPreferred = SupplierExtendedOperations.getPreferred;
  static reactivate = SupplierExtendedOperations.reactivate;
}

// Export individual classes for direct access if needed
export { SupplierBaseCrud, SupplierBatchOperations, SupplierExtendedOperations };
