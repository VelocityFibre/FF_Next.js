/**
 * Staff Import Types
 * Type definitions for staff import/export operations
 */

// Header mapping for CSV columns
export interface HeaderMapping {
  [key: string]: string;
}

// Default header mappings
export const DEFAULT_HEADER_MAPPING: HeaderMapping = {
  'name': 'name',
  'Name': 'name',
  'email': 'email',
  'Email': 'email', 
  'phone': 'phone',
  'Phone': 'phone',
  'employee id': 'employeeId',
  'Employee ID': 'employeeId',
  'position': 'position',
  'Position': 'position',
  'department': 'department',
  'Department': 'department',
  'department ': 'department', // Handle trailing space
  'Primary Group': 'department', // Map Primary Group to department
  'reports to': 'managerName',
  'reports to ': 'managerName', // Handle trailing space
  'Reports To': 'managerName',
  'Level': 'level',
  'Status': 'status',
  'Skills': 'skills',
  'address': 'address',
  'Address': 'address',
  'city': 'city',
  'City': 'city',
  'province': 'province',
  'Province': 'province',
  'postalCode': 'postalCode',
  'Postal Code': 'postalCode',
  'Emergency Contact Name': 'emergencyContactName',
  'Emergency Contact Phone': 'emergencyContactPhone',
  'start date': 'startDate',
  'Start Date': 'startDate',
  'Contract Type': 'contractType',
  'Working Hours': 'workingHours',
  'Alternative Phone': 'alternativePhone'
};

// Import template columns
export const IMPORT_TEMPLATE_COLUMNS = [
  'employee id',
  'name',
  'email',
  'phone',
  'position',
  'department',
  'reports to',
  'address',
  'city',
  'province',
  'postalCode',
  'start date'
];

// Export columns configuration
export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}