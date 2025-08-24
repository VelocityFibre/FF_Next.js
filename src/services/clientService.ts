/**
 * Client Service - Main export file
 * Using Neon PostgreSQL as the primary data source
 */

import { clientNeonService } from './client/clientNeonService';
import { clientImportService } from './client/clientImportService';
import { clientExportService } from './client/clientExportService';

export const clientService = {
  // CRUD operations (from Neon)
  getAll: clientNeonService.getAll,
  getById: clientNeonService.getById,
  create: clientNeonService.create,
  update: clientNeonService.update,
  delete: clientNeonService.delete,
  getActiveClients: clientNeonService.getActiveClients,
  getClientSummary: clientNeonService.getClientSummary,
  
  // Extended operations
  getContactHistory: async () => {
    // Mock implementation - should be implemented in clientNeonService
    return Promise.resolve([]);
  },
  
  updateClientMetrics: async () => {
    // Mock implementation - should be implemented in clientNeonService
    return Promise.resolve({ success: true });
  },
  
  addContactHistory: async () => {
    // Mock implementation - should be implemented in clientNeonService
    return Promise.resolve({ success: true });
  },
  
  // Import/Export operations
  import: clientImportService,
  export: clientExportService,
};