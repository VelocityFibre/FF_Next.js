/**
 * Test script for CSV import functionality
 */

import { staffImportService } from '@/services/staff/staffImportService';

async function testCSVImport() {
  console.log('🧪 Testing CSV Import...');
  
  try {
    // Create a test CSV content based on your file structure
    const csvContent = `employee id,name,email,phone,position,department ,reports to ,address,city,province,postalCode,start date
VF001,Kylin Musgrave,kylin@velocityfibre.co.za ,+27 00 000 0000,Admin,Service Delivery,Hein van Vuuren,123 Main Street,Johannesburg,Gauteng,2000,2025/04/01
VF002,Janice George,janice@velocityfibre.co.za,+27 00 000 0000,Admin,Service Delivery,Hein van Vuuren,123 Main Street,Johannesburg,Gauteng,2000,2025/04/01`;

    // Create a mock File object
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'test-staff.csv', { type: 'text/csv' });
    
    console.log('📄 Created test file:', file.name, file.size, 'bytes');
    
    // Test the import
    const result = await staffImportService.importFromCSV(file, true);
    
    console.log('✅ Import completed:');
    console.log('  - Success:', result.success);
    console.log('  - Imported:', result.imported);
    console.log('  - Failed:', result.failed);
    console.log('  - Errors:', result.errors.length);
    
    if (result.errors.length > 0) {
      console.log('❌ Import errors:');
      result.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. Row ${error.row}: ${error.message} (${error.field})`);
      });
    }
    
    if (result.staffMembers.length > 0) {
      console.log('👥 Created staff members:');
      result.staffMembers.forEach((staff, index) => {
        console.log(`  ${index + 1}. ${staff.name} (${staff.employeeId})`);
      });
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Export for potential use
export { testCSVImport };