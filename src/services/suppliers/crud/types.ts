/**
 * Supplier CRUD Types
 * Shared types for supplier CRUD operations
 */

export interface SupplierFilter {
  status?: string;
  category?: string;
  isPreferred?: boolean;
  limit?: number;
}

export interface SupplierUpdateData {
  updatedAt: any;
  lastModifiedBy: string;
  [key: string]: any;
}

export interface SupplierSoftDeleteData {
  status: string;
  isActive: boolean;
  updatedAt: any;
  lastModifiedBy: string;
  inactiveReason?: string;
  inactivatedAt?: any;
}

export interface SupplierBatchOptions {
  batchSize?: number;
  maxConcurrent?: number;
}
