/**
 * Client Service - Main export file
 * Using API routes for browser, Neon for server/build
 */

import { clientNeonService } from './client/clientNeonService';
import { clientApiService } from './client/clientApiService';
import { clientImportService } from './client/clientImportService';
import { clientExportService } from './client/clientExportService';

// Use API service in browser, Neon service for server/build
const isBrowser = typeof window !== 'undefined';
const baseService = isBrowser ? clientApiService : clientNeonService;

export const clientService = {
  // CRUD operations
  getAll: baseService.getAll,
  getById: baseService.getById,
  create: baseService.create,
  update: baseService.update,
  delete: baseService.delete,
  getActiveClients: baseService.getActiveClients,
  getClientSummary: baseService.getClientSummary,
  
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