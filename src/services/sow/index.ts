/**
 * SOW Services - Modular Export
 * Centralized export for all SOW service modules
 */

// Types and interfaces
export type {
  NeonPoleData,
  NeonDropData,
  NeonFibreData,
  SOWProjectSummary,
  SOWData,
  SOWOperationResult,
  SOWTableType
} from './types';

// Schema management
export { SOWSchemaService, getTableName } from './schema';

// Data operations
export { SOWDataOperationsService } from './dataOperations';

// Summary service
export { SOWSummaryService } from './summaryService';

// Query service
export { SOWQueryService } from './queryService';

// Health service
export { SOWHealthService } from './healthService';

// Main service orchestrator
export { NeonSOWService } from './neonSOWService';

// API-based service
export { ApiSOWService } from './apiSOWService';
export { apiSOWService } from './apiSOWService';