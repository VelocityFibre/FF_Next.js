import * as XLSX from 'xlsx';
import { Timestamp } from 'firebase/firestore';
import { 
  StaffMember,
  StaffFormData,
  StaffImportRow,
  StaffImportResult,
  StaffImportError,
  Department,
  StaffLevel,
  StaffStatus,
  ContractType,
  Skill
} from '@/types/staff.types';
import { staffCrudService } from './staffCrudService';

/**
 * Import/Export operations for staff
 */
export const staffImportService = {
  /**
   * Import staff from CSV file
   */
  async importFromCSV(file: File): Promise<StaffImportResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim());
          
          const rows: StaffImportRow[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row: any = {};
            
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            
            rows.push(row as StaffImportRow);
          }
          
          const result = await this.processImportRows(rows);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read CSV file'));
      reader.readAsText(file);
    });
  },

  /**
   * Import staff from Excel file
   */
  async importFromExcel(file: File): Promise<StaffImportResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Get first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as StaffImportRow[];
          
          const result = await this.processImportRows(jsonData);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read Excel file'));
      reader.readAsBinaryString(file);
    });
  },

  /**
   * Process imported rows and create staff members
   */
  async processImportRows(rows: StaffImportRow[]): Promise<StaffImportResult> {
    const errors: StaffImportError[] = [];
    const staffMembers: StaffMember[] = [];
    let imported = 0;
    let failed = 0;
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 because row 1 is headers, and arrays are 0-indexed
      
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
        const formData: StaffFormData = {
          name: row.name,
          email: row.email,
          phone: row.phone,
          alternativePhone: row.alternativePhone,
          employeeId: row.employeeId || `EMP${Date.now()}-${i}`,
          position: row.position || 'Staff',
          department: this.parseEnumValue(row.department, Department, Department.OPERATIONS),
          level: this.parseEnumValue(row.level, StaffLevel, StaffLevel.JUNIOR),
          status: this.parseEnumValue(row.status, StaffStatus, StaffStatus.ACTIVE),
          skills: this.parseSkills(row.skills),
          experienceYears: 0,
          address: row.address || '',
          city: row.city || '',
          province: row.province || '',
          postalCode: row.postalCode || '',
          emergencyContactName: row.emergencyContactName,
          emergencyContactPhone: row.emergencyContactPhone,
          startDate: this.parseDate(row.startDate) || new Date(),
          endDate: row.endDate ? this.parseDate(row.endDate) : undefined,
          contractType: this.parseEnumValue(row.contractType, ContractType, ContractType.PERMANENT),
          workingHours: row.workingHours || '08:00 - 17:00',
          availableWeekends: false,
          availableNights: false,
          timeZone: 'Africa/Johannesburg',
          maxProjectCount: 5
        };
        
        // Create staff member
        const id = await staffCrudService.create(formData);
        
        // Get the created staff member
        const staffMember = await staffCrudService.getById(id);
        if (staffMember) {
          staffMembers.push(staffMember);
          imported++;
        }
        
      } catch (error: any) {
        errors.push({
          row: rowNumber,
          field: 'general',
          message: error.message || 'Failed to import row',
          value: row
        });
        failed++;
      }
    }
    
    return {
      success: failed === 0,
      imported,
      failed,
      errors,
      staffMembers
    };
  },

  /**
   * Helper to parse enum values
   */
  parseEnumValue<T>(value: string | undefined, enumType: any, defaultValue: T): T {
    if (!value) return defaultValue;
    
    const upperValue = value.toUpperCase().replace(/\s+/g, '_');
    const enumValues = Object.values(enumType) as string[];
    
    for (const enumValue of enumValues) {
      if (enumValue.toUpperCase().replace(/\s+/g, '_') === upperValue) {
        return enumValue as T;
      }
    }
    
    return defaultValue;
  },

  /**
   * Parse skills from comma-separated string
   */
  parseSkills(skillsString: string | undefined): Skill[] {
    if (!skillsString) return [];
    
    const skills: Skill[] = [];
    const skillsList = skillsString.split(',').map(s => s.trim());
    
    for (const skill of skillsList) {
      const parsedSkill = this.parseEnumValue(skill, Skill, null);
      if (parsedSkill) {
        skills.push(parsedSkill as Skill);
      }
    }
    
    return skills;
  },

  /**
   * Parse date from various formats
   */
  parseDate(dateValue: any): Date | undefined {
    if (!dateValue) return undefined;
    
    // If already a Date object
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    // If it's a number (Excel serial date)
    if (typeof dateValue === 'number') {
      // Excel dates start from 1900-01-01
      const excelEpoch = new Date(1900, 0, 1);
      const msPerDay = 24 * 60 * 60 * 1000;
      return new Date(excelEpoch.getTime() + (dateValue - 2) * msPerDay);
    }
    
    // If it's a string
    if (typeof dateValue === 'string') {
      // Try parsing DD/MM/YYYY format
      const ddmmyyyy = dateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (ddmmyyyy) {
        const [, day, month, year] = ddmmyyyy;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      
      // Try standard date parsing
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    
    return undefined;
  }
};