/**
 * Supplier Status - Module Exports
 * Modular supplier status management system
 */

// Core components
export { StatusCore } from './statusCore';
export { BatchOperations } from './batchOperations';
export { StatusQueries } from './statusQueries';
export { StatusValidation } from './statusValidation';

// Types
export type {
  StatusUpdateData,
  BatchOperationResult,
  PreferenceUpdateResult,
  StatusHistoryEntry,
  StatusTransitionValidation,
  SupplierEligibility,
  PreferenceUpdate,
  StatusSummary,
  SupplierStatus,
  Supplier
} from './types';

// Main service class for backward compatibility
export { SupplierStatusService } from './supplierStatusService';