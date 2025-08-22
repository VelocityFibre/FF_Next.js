/**
 * Client Service - Main export file
 */

import { clientImportService } from './client/clientImportService';
import { clientExportService } from './client/clientExportService';

export const clientService = {
  // Import/Export operations
  import: clientImportService,
  export: clientExportService,
};