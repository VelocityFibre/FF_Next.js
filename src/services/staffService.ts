/**
 * Staff Service - Main export file
 * Aggregates all staff-related services
 */

import { staffCrudService } from './staff/staffCrudService';
import { staffQueryService } from './staff/staffQueryService';
import { staffImportService } from './staff/staffImportService';
import { staffExportService } from './staff/staffExportService';
import { staffAssignmentService } from './staff/staffAssignmentService';

export const staffService = {
  // CRUD Operations
  getAll: staffCrudService.getAll,
  getById: staffCrudService.getById,
  create: staffCrudService.create,
  update: staffCrudService.update,
  delete: staffCrudService.delete,
  subscribeToStaff: staffCrudService.subscribeToStaff,
  subscribeToStaffMember: staffCrudService.subscribeToStaffMember,
  
  // Query Operations
  getActiveStaff: staffQueryService.getActiveStaff,
  getProjectManagers: staffQueryService.getProjectManagers,
  getStaffSummary: staffQueryService.getStaffSummary,
  getProjectAssignments: staffQueryService.getProjectAssignments,
  getStaffAssignments: staffQueryService.getStaffAssignments,
  
  // Import/Export Operations
  importFromCSV: staffImportService.importFromCSV,
  importFromExcel: staffImportService.importFromExcel,
  processImportRows: staffImportService.processImportRows,
  exportToExcel: staffExportService.exportToExcel,
  getImportTemplate: staffExportService.getImportTemplate,
  
  // Assignment Operations
  assignToProject: staffAssignmentService.assignToProject,
  updateAssignment: staffAssignmentService.updateAssignment,
  updateStaffProjectCount: staffAssignmentService.updateStaffProjectCount,
  getAvailableStaff: staffAssignmentService.getAvailableStaff,
};