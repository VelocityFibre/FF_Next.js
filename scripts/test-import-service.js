import fs from 'fs';
import path from 'path';

// Mock the staff service and types since we're testing outside React environment
const mockStaffService = {
  create: async (data) => {
    console.log('📝 Creating staff member:', data.name);
    return {
      id: `mock-id-${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
};

// Simple CSV parser for testing
function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  
  const headerMapping = {
    'Name': 'name',
    'Email': 'email', 
    'Phone': 'phone',
    'Employee ID': 'employeeId',
    'Position': 'position',
    'Department': 'department',
    'Emergency Contact Name': 'emergencyContactName',
    'Emergency Contact Phone': 'emergencyContactPhone'
  };
  
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    
    headers.forEach((header, index) => {
      const fieldName = headerMapping[header] || header.toLowerCase().replace(/\s+/g, '');
      row[fieldName] = values[index] || '';
    });
    
    rows.push(row);
  }
  
  return rows;
}

async function processImportRows(rows) {
  const errors = [];
  const staffMembers = [];
  let imported = 0;
  let failed = 0;
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2; // +2 because row 1 is headers
    
    try {
      // Validate required fields
      if (!row.name) {
        errors.push({
          row: rowNumber,
          field: 'name',
          message: 'Name is required'
        });
        failed++;
        continue;
      }
      
      if (!row.email) {
        errors.push({
          row: rowNumber,
          field: 'email',
          message: 'Email is required'
        });
        failed++;
        continue;
      }
      
      if (!row.phone) {
        errors.push({
          row: rowNumber,
          field: 'phone',
          message: 'Phone is required'
        });
        failed++;
        continue;
      }
      
      // Create staff form data
      const formData = {
        name: row.name,
        email: row.email,
        phone: row.phone || '',
        alternatePhone: row.alternativePhone || '',
        employeeId: row.employeeId || `EMP${Date.now()}-${i}`,
        position: row.position || 'Staff',
        department: row.department || 'Operations',
        employmentType: 'full_time',
        status: 'active',
        salary: 0,
        joinDate: new Date().toISOString(),
        endDate: undefined,
        address: row.address || '',
        city: row.city || '',
        province: row.province || '',
        postalCode: row.postalCode || '',
        emergencyContact: {
          name: row.emergencyContactName || '',
          relationship: 'Contact',
          phone: row.emergencyContactPhone || ''
        },
        skills: row.skills ? row.skills.split(',').map(s => s.trim()) : [],
        certifications: [],
        notes: ''
      };
      
      // Create staff member (using mock service)
      const staffMember = await mockStaffService.create(formData);
      
      if (staffMember) {
        staffMembers.push(staffMember);
        imported++;
        console.log(`✅ Imported: ${staffMember.name} (${staffMember.email})`);
      }
      
    } catch (error) {
      errors.push({
        row: rowNumber,
        field: 'general',
        message: error.message || 'Failed to import row',
        value: row
      });
      failed++;
      console.log(`❌ Failed to import row ${rowNumber}:`, error.message);
    }
  }
  
  return {
    success: failed === 0,
    imported,
    failed,
    errors,
    staffMembers
  };
}

async function testStaffImport() {
  try {
    console.log('🧪 Testing Staff Import Service...');
    
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'scripts', 'test-staff-import.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    console.log('📄 CSV file loaded successfully');
    
    // Parse CSV
    const rows = parseCSV(csvContent);
    console.log(`📋 Parsed ${rows.length} rows from CSV`);
    
    // Process the import
    const result = await processImportRows(rows);
    
    console.log('\n📊 Import Results:');
    console.log(`✅ Successfully imported: ${result.imported}`);
    console.log(`❌ Failed to import: ${result.failed}`);
    console.log(`🎯 Overall success: ${result.success ? 'YES' : 'NO'}`);
    
    if (result.errors.length > 0) {
      console.log('\n🚨 Errors encountered:');
      result.errors.forEach(error => {
        console.log(`  Row ${error.row}: ${error.message} (${error.field})`);
      });
    }
    
    console.log('\n👥 Imported staff members:');
    result.staffMembers.forEach((member, index) => {
      console.log(`  ${index + 1}. ${member.name} - ${member.position} (${member.department})`);
    });
    
    console.log('\n🎉 Staff import test completed!');
    
  } catch (error) {
    console.error('❌ Error in import testing:', error.message);
  }
}

testStaffImport();