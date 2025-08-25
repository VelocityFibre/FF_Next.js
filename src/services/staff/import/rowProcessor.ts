/**
 * Row Processor
 * Processes imported rows and creates/updates staff records
 */

import { 
  StaffImportRow, 
  StaffImportResult, 
  StaffImportError,
  StaffFormData, ContractType, StaffStatus
} from '@/types/staff.types';
import { extractUniqueManagers, sortByManagerHierarchy, findManagerByName } from './managerResolver';
import { parseDate, parseSkills } from './parsers';

/**
 * Process imported rows and create/update staff
 */
export async function processImportRows(
  rows: StaffImportRow[], 
  _overwriteExisting: boolean = true
): Promise<StaffImportResult> {
  const { staffService } = await import('../../staffService');
  const errors: StaffImportError[] = [];
  const importedStaff = [];
  let successful = 0;
  let failed = 0;
  // const skipped = 0; // Not used in current implementation
  
  // Extract all manager names first
  const managerNames = extractUniqueManagers(rows);
  console.log('📊 Unique managers found:', Array.from(managerNames));
  
  // Sort rows to process managers first
  const sortedRows = sortByManagerHierarchy(rows, managerNames);

  for (let i = 0; i < sortedRows.length; i++) {
    const row = sortedRows[i];
    const originalIndex = rows.indexOf(row);
    const rowNumber = originalIndex + 2; // +2 because row 1 is headers, and arrays are 0-indexed
    
    try {
      // Debug: Show what we're validating
      if (rowNumber <= 5) { // Only log first few rows

      }
      
      // Validate required fields
      if (!row.name || row.name.trim() === '') {

        errors.push({
          row: rowNumber,
          field: 'name',
          message: 'Name is required'
        });
        failed++;
        continue;
      }
      
      if (!row.email || row.email.trim() === '') {
        errors.push({
          row: rowNumber,
          field: 'email',
          message: 'Email is required'
        });
        failed++;
        continue;
      }
      
      if (!row.phone || row.phone.trim() === '') {
        errors.push({
          row: rowNumber,
          field: 'phone',
          message: 'Phone is required'
        });
        failed++;
        continue;
      }
      
      // Validate employeeId - this is critical for database constraint
      if (!row.employeeId || row.employeeId.trim() === '') {
        console.log(`Row ${rowNumber} missing employeeId. Available fields:`, Object.keys(row));

        errors.push({
          row: rowNumber,
          field: 'employeeId',
          message: 'Employee ID is required'
        });
        failed++;
        continue;
      }
      
      // Handle manager name to UUID conversion by looking up existing staff
      let reportsTo: string | undefined = undefined;
      if (row.managerName && row.managerName.trim() && row.managerName.trim() !== '') {
        const managerName = row.managerName.trim();

        try {
          // Look up manager by name in existing staff
          const managerUuid = await findManagerByName(managerName);
          if (managerUuid) {
            reportsTo = managerUuid;

          } else {


          }
        } catch (error) {

        }
      } else {

      }
      
      // Ensure employeeId is never null or empty
      const employeeId = row.employeeId && row.employeeId.trim() !== '' 
        ? row.employeeId.trim() 
        : `AUTO_${Date.now()}_${i}`;

      // COMPREHENSIVE DEBUG LOGGING - IMPORT SERVICE TRACING


      console.log('Manager lookup result:', {
        managerName: row.managerName,
        resolvedUuid: reportsTo,
        reportsToType: typeof reportsTo,
        reportsToValue: JSON.stringify(reportsTo)
      });
      
      // Parse start date if provided
      let startDate = new Date();
      if (row.startDate) {
        const parsedDate = parseDate(row.startDate);
        if (parsedDate) {
          startDate = parsedDate;
        }
      }
      
      // Create staff form data that matches StaffFormData interface
      const formData: StaffFormData = {
        name: row.name.trim(),
        email: row.email.trim(),
        phone: row.phone.trim() || '',
        ...(row.alternativePhone && { alternativePhone: row.alternativePhone }),
        employeeId: employeeId,
        position: row.position || 'Staff',
        department: row.department || 'Operations',
        contractType: ContractType.PERMANENT, // Default contract type
        status: StaffStatus.ACTIVE, // Default status
        ...(reportsTo && { reportsTo }), // Only include if manager found
        startDate: startDate, // Use parsed date
        // endDate not included as it.s undefined
        address: row.address || '',
        city: row.city || '',
        province: row.province || '',
        postalCode: row.postalCode || '',
        ...(row.emergencyContactName && { emergencyContactName: row.emergencyContactName }),
        ...(row.emergencyContactPhone && { emergencyContactPhone: row.emergencyContactPhone }),
        experienceYears: 0,
        workingHours: "9:00-17:00",
        availableWeekends: false,
        availableNights: false,
        timeZone: "Africa/Johannesburg",
        maxProjectCount: 5,
        skills: parseSkills(row.skills),
        // notes not included as it's empty
      };
      
      // Import the staff member using createOrUpdate to handle both new and existing
      console.log(`📝 Creating or updating staff member: ${formData.name} (Employee ID: ${formData.employeeId})`);
      const staffMember = await staffService.createOrUpdate(formData);
      
      if (staffMember) {
        importedStaff.push(staffMember);
        successful++;

      } else {
        failed++;
        errors.push({
          row: rowNumber,
          field: '',
          message: 'Failed to create/update staff member'
        });
      }
    } catch (error) {
      console.error(`❌ Error processing row ${rowNumber}:`, error);
      failed++;
      errors.push({
        row: rowNumber,
        field: '',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
  
  return {
    success: failed === 0,
    total: rows.length,
    imported: successful,
    failed,
    errors,
    staffMembers: importedStaff
  };
}