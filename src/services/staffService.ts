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
  update: staffNeonService.update,
  delete: staffNeonService.delete,
  
  // Query operations (Neon)
  getActiveStaff: staffNeonService.getActiveStaff,
  getProjectManagers: staffNeonService.getProjectManagers,
  getStaffSummary: staffNeonService.getStaffSummary,
  
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