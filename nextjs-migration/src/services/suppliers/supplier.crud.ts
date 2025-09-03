/**
 * Supplier CRUD Operations
 * Backward compatibility layer for existing imports
 * @deprecated Use ./crud/index.ts instead
 */

// Re-export the new modular CRUD service
export { SupplierCrudService } from './crud/index';

// Re-export types for backward compatibility
export type { SupplierFilter, SupplierBatchOptions } from './crud/types';