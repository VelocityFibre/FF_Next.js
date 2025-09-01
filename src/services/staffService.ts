/**
 * Staff Service - Main export file
 * Using API routes for browser, Neon for server/build
 */

import { staffNeonService } from './staff/staffNeonService';
import { staffApiService } from './staff/staffApiService';
import { staffImportService } from './staff/staffImportService';
import { staffExportService } from './staff/staffExportService';

// Use API service in browser, Neon service for server/build
const isBrowser = typeof window !== 'undefined';
const baseService = isBrowser ? staffApiService : staffNeonService;

export const staffService = {
  // Main CRUD operations
  getAll: baseService.getAll,
  getById: baseService.getById,
  create: baseService.create,
  createOrUpdate: isBrowser ? baseService.create : staffNeonService.createOrUpdate,
  update: baseService.update,
  delete: baseService.delete,
  
  // Query operations
  getActiveStaff: baseService.getActiveStaff,
  getProjectManagers: isBrowser ? 
    () => baseService.getAll().then(staff => staff.filter(s => s.status === 'active')) :
    staffNeonService.getProjectManagers,
  getStaffSummary: baseService.getStaffSummary,
  
  // Extended operations
  getProjectAssignments: async () => {
    // Mock implementation - should be implemented in staffNeonService
    return Promise.resolve([]);
  },
  
  assignToProject: async () => {
    // Mock implementation - should be implemented in staffNeonService
    return Promise.resolve({ success: true });
  },
  
  updateStaffProjectCount: async () => {
    // Mock implementation - should be implemented in staffNeonService
    return Promise.resolve({ success: true });
  },
  
  // Import operations
  importFromCSV: staffImportService.importFromCSV,
  importFromExcel: staffImportService.importFromExcel,
  getImportTemplate: staffImportService.getImportTemplate || (() => 'Name,Email,Phone,Employee ID,Position,Department'),
  
  // Export operations
  exportToExcel: staffExportService.exportToExcel,
  
  // Legacy structure for backward compatibility
  import: staffImportService,
  export: staffExportService,
};