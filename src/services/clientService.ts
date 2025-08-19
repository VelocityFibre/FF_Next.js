/**
 * Client Service - Main export file
 * Aggregates all client-related services
 */

import { clientCrudService } from './client/clientCrudService';
import { clientQueryService } from './client/clientQueryService';
import { clientImportService } from './client/clientImportService';
import { clientExportService } from './client/clientExportService';

export const clientService = {
  // CRUD Operations
  getAll: clientCrudService.getAll,
  getById: clientCrudService.getById,
  create: clientCrudService.create,
  update: clientCrudService.update,
  delete: clientCrudService.delete,
  subscribeToClients: clientCrudService.subscribeToClients,
  subscribeToClient: clientCrudService.subscribeToClient,
  
  // Query Operations
  getActiveClients: clientQueryService.getActiveClients,
  getClientSummary: clientQueryService.getClientSummary,
  updateClientMetrics: clientQueryService.updateClientMetrics,
  addContactHistory: clientQueryService.addContactHistory,
  getContactHistory: clientQueryService.getContactHistory,
  
  // Import/Export Operations
  importFromCSV: clientImportService.importFromCSV,
  importFromExcel: clientImportService.importFromExcel,
  processImportRows: clientImportService.processImportRows,
  exportToExcel: clientExportService.exportToExcel,
  getImportTemplate: clientExportService.getImportTemplate,
};