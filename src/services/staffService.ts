/**
 * Staff Service - Main export file
 * Using Neon PostgreSQL database
 */

import { staffNeonService } from './staff/staffNeonService';
import { staffImportService } from './staff/staffImportService';
import { staffExportService } from './staff/staffExportService';

export const staffService = {
  // Main CRUD operations (Neon)
  getAll: staffNeonService.getAll,
  getById: staffNeonService.getById,
  create: staffNeonService.create,
  createOrUpdate: staffNeonService.createOrUpdate,
  update: staffNeonService.update,
  delete: staffNeonService.delete,
  
  // Query operations (Neon)
  getActiveStaff: staffNeonService.getActiveStaff,
  getProjectManagers: staffNeonService.getProjectManagers,
  getStaffSummary: staffNeonService.getStaffSummary,
  
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