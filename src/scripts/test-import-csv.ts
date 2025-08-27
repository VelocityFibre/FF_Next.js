/**
 * Test script for CSV import functionality
 */

import { staffImportService } from '@/services/staff/staffImportService';
import { log } from '@/lib/logger';

async function testCSVImport() {

  try {
    // Create a test CSV content based on your file structure
    const csvContent = `employee id,name,email,phone,position,department ,reports to ,address,city,province,postalCode,start date
VF001,Kylin Musgrave,kylin@velocityfibre.co.za ,+27 00 000 0000,Admin,Service Delivery,Hein van Vuuren,123 Main Street,Johannesburg,Gauteng,2000,2025/04/01
VF002,Janice George,janice@velocityfibre.co.za,+27 00 000 0000,Admin,Service Delivery,Hein van Vuuren,123 Main Street,Johannesburg,Gauteng,2000,2025/04/01`;

    // Create a mock File object
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'test-staff.csv', { type: 'text/csv' });

    // Test the import
    const result = await staffImportService.importFromCSV(file, true);





    if (result.errors.length > 0) {

      result.errors.forEach((error, index) => {
        log.info(`  ${index + 1}. Row ${error.row}: ${error.message} (${error.field}, undefined, 'test-import-csv');`);
      });
    }
    
    if (result.staffMembers.length > 0) {

      result.staffMembers.forEach((staff, index) => {
        log.info(`  ${index + 1}. ${staff.name} (${staff.employeeId}, undefined, 'test-import-csv');`);
      });
    }
    
  } catch (error) {
    log.error('💥 Test failed:', { data: error }, 'test-import-csv');
  }
}

// Export for potential use
export { testCSVImport };