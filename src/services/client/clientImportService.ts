import * as XLSX from 'xlsx';
import { 
  ClientImportRow,
  ClientImportResult,
  ClientImportError,
  ClientFormData,
  ClientStatus,
  ClientCategory,
  ClientPriority,
  PaymentTerms,
  CreditRating,
  ContactMethod,
  ServiceType,
  Client
} from '@/types/client.types';
import { clientCrudService } from './clientCrudService';

/**
 * Import operations for clients
 */
export const clientImportService = {
  /**
   * Import clients from CSV file
   */
  async importFromCSV(file: File): Promise<ClientImportResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim());
          
          const rows: ClientImportRow[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row: any = {};
            
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            
            rows.push(row as ClientImportRow);
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
   * Import clients from Excel file
   */
  async importFromExcel(file: File): Promise<ClientImportResult> {
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
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as ClientImportRow[];
          
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
   * Process imported rows and create clients
   */
  async processImportRows(rows: ClientImportRow[]): Promise<ClientImportResult> {
    const errors: ClientImportError[] = [];
    const clients: Client[] = [];
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
            message: 'Company name is required'
          });
          failed++;
          continue;
        }
        
        if (!row.contactPerson) {
          errors.push({
            row: rowNumber,
            field: 'contactPerson',
            message: 'Contact person is required'
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
        
        // Create client form data
        const formData: ClientFormData = {
          name: row.name,
          contactPerson: row.contactPerson,
          email: row.email,
          phone: row.phone,
          address: row.address || '',
          city: row.city || 'Johannesburg',
          province: row.province || 'Gauteng',
          postalCode: row.postalCode || '',
          country: row.country || 'South Africa',
          registrationNumber: row.registrationNumber,
          vatNumber: row.vatNumber,
          industry: row.industry || 'General',
          website: row.website,
          alternativeEmail: row.alternativeEmail,
          alternativePhone: row.alternativePhone,
          creditLimit: this.parseNumber(row.creditLimit, 100000),
          paymentTerms: this.parseEnumValue(row.paymentTerms, PaymentTerms, PaymentTerms.NET_30),
          creditRating: this.parseEnumValue(row.creditRating, CreditRating, CreditRating.UNRATED),
          status: this.parseEnumValue(row.status, ClientStatus, ClientStatus.PROSPECT),
          category: this.parseEnumValue(row.category, ClientCategory, ClientCategory.SME),
          priority: this.parseEnumValue(row.priority, ClientPriority, ClientPriority.MEDIUM),
          preferredContactMethod: this.parseEnumValue(row.preferredContactMethod, ContactMethod, ContactMethod.EMAIL),
          communicationLanguage: row.communicationLanguage || 'English',
          timezone: row.timezone || 'Africa/Johannesburg',
          notes: row.notes,
          tags: this.parseTags(row.tags),
          serviceTypes: this.parseServiceTypes(row.serviceTypes),
          specialRequirements: ''
        };
        
        // Create client
        const id = await clientCrudService.create(formData);
        
        // Get the created client
        const client = await clientCrudService.getById(id);
        if (client) {
          clients.push(client);
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
      clients
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
   * Parse service types from comma-separated string
   */
  parseServiceTypes(servicesString: string | undefined): ServiceType[] {
    if (!servicesString) return [];
    
    const services: ServiceType[] = [];
    const servicesList = servicesString.split(',').map(s => s.trim());
    
    for (const service of servicesList) {
      const parsedService = this.parseEnumValue(service, ServiceType, null);
      if (parsedService) {
        services.push(parsedService as ServiceType);
      }
    }
    
    return services;
  },

  /**
   * Parse tags from comma-separated string
   */
  parseTags(tagsString: string | undefined): string[] {
    if (!tagsString) return [];
    return tagsString.split(',').map(t => t.trim()).filter(t => t.length > 0);
  },

  /**
   * Parse number with fallback
   */
  parseNumber(value: string | number | undefined, defaultValue: number): number {
    if (value === undefined || value === '') return defaultValue;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? defaultValue : num;
  }
};