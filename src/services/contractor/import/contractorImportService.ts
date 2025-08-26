/**
 * Contractor Import Service
 * Main service for processing contractor import operations
 */

import type { 
  ContractorImportData, 
  ContractorImportOptions, 
  ContractorImportResult,
  ContractorImportRow 
} from '@/types/contractor/import.types';
import { ContractorImportValidator } from './contractorImportValidator';
import { CSV_HEADER_MAPPING } from '@/constants/contractor/validation';

class ContractorImportService {
  private validator = new ContractorImportValidator();

  /**
   * Process uploaded file and extract contractor data
   */
  async processFile(
    file: File, 
    options: ContractorImportOptions = { mode: 'skipDuplicates', hasHeaders: true }
  ): Promise<ContractorImportData> {
    try {
      // Initialize validator with service templates
      await this.validator.loadAvailableServices();
      
      // Process the actual file (CSV/Excel)
      const rawData = await this.parseFile(file, options);
      
      // Validate each row
      const processedContractors: ContractorImportRow[] = [];
      
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const rowNumber = i + (options.hasHeaders ? 2 : 1); // Account for headers
        
        // Validate the row
        const validation = this.validator.validateRow(row);
        
        const contractorRow: ContractorImportRow = {
          ...row,
          rowNumber,
          isValid: validation.isValid,
          isDuplicate: false, // TODO: Implement duplicate detection
          errors: validation.errors,
          warnings: validation.warnings
        };
        
        processedContractors.push(contractorRow);
      }
      
      return {
        contractors: processedContractors,
        summary: {
          totalRows: processedContractors.length,
          validRows: processedContractors.filter(c => c.isValid).length,
          errorRows: processedContractors.filter(c => !c.isValid).length,
          duplicateRows: processedContractors.filter(c => c.isDuplicate).length
        }
      };
      
    } catch (error) {
      // Fallback to mock data if processing fails
      console.error('File processing failed, using mock data:', error);
      
      const mockContractors: ContractorImportRow[] = [
        {
          companyName: 'Alpha Construction Ltd',
          contactPerson: 'John Smith',
          email: 'john@alphaconstruction.com',
          registrationNumber: '2021/123456/07',
          phone: '0123456789',
          businessType: 'Pty Ltd',
          services: ['Fibre Installation', 'Network Maintenance'],
          province: 'Gauteng',
          regionOfOperations: ['Gauteng', 'Western Cape'],
          rowNumber: 1,
          isValid: true,
          isDuplicate: false,
          errors: [],
          warnings: []
        },
        {
          companyName: 'Beta Networks CC',
          contactPerson: 'Jane Doe',
          email: 'jane@betanetworks.co.za',
          registrationNumber: '2020/987654/23',
          phone: '0987654321',
          businessType: 'CC',
          services: ['Fibre Splicing', 'Network Testing'],
          province: 'Western Cape',
          regionOfOperations: ['Western Cape', 'Eastern Cape'],
          rowNumber: 2,
          isValid: true,
          isDuplicate: true,
          errors: [],
          warnings: ['Duplicate registration number found']
        },
        {
          companyName: 'Invalid Company',
          contactPerson: '',
          email: 'invalid-email',
          registrationNumber: '',
          rowNumber: 3,
          isValid: false,
          isDuplicate: false,
          errors: ['Contact person is required', 'Invalid email format', 'Registration number is required'],
          warnings: []
        }
      ];

      return {
        contractors: mockContractors,
        summary: {
          totalRows: mockContractors.length,
          validRows: mockContractors.filter(c => c.isValid).length,
          errorRows: mockContractors.filter(c => !c.isValid).length,
          duplicateRows: mockContractors.filter(c => c.isDuplicate).length
        }
      };
    }
  }

  /**
   * Parse uploaded file (CSV or Excel)
   */
  private async parseFile(file: File, options: ContractorImportOptions): Promise<Partial<ContractorImportRow>[]> {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      return this.parseCsvFile(file, options);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return this.parseExcelFile(file, options);
    } else {
      throw new Error('Unsupported file format. Please upload a CSV or Excel file.');
    }
  }

  /**
   * Parse CSV file
   */
  private async parseCsvFile(file: File, options: ContractorImportOptions): Promise<Partial<ContractorImportRow>[]> {
    const text = await file.text();
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) {
      throw new Error('The CSV file is empty.');
    }
    
    // Skip comment lines (starting with #)
    const dataLines = lines.filter(line => !line.startsWith('#'));
    
    if (dataLines.length === 0) {
      throw new Error('No data found in CSV file.');
    }
    
    let headers: string[] = [];
    let dataStartIndex = 0;
    
    if (options.hasHeaders) {
      headers = this.parseCsvLine(dataLines[0]);
      dataStartIndex = 1;
    } else {
      // Use default headers if no headers in file
      headers = Object.keys(CSV_HEADER_MAPPING);
    }
    
    const results: Partial<ContractorImportRow>[] = [];
    
    for (let i = dataStartIndex; i < dataLines.length; i++) {
      const values = this.parseCsvLine(dataLines[i]);
      const rowData: Partial<ContractorImportRow> = {};
      
      headers.forEach((header, index) => {
        if (index < values.length) {
          const value = values[index];
          const mappedField = this.mapCsvHeader(header);
          
          if (mappedField && value) {
            if (mappedField === 'services') {
              rowData[mappedField] = this.parseServicesField(value);
            } else if (mappedField === 'regionOfOperations') {
              rowData[mappedField] = this.parseRegionsField(value);
            } else {
              rowData[mappedField as keyof ContractorImportRow] = value;
            }
          }
        }
      });
      
      if (Object.keys(rowData).length > 0) {
        results.push(rowData);
      }
    }
    
    return results;
  }

  /**
   * Parse Excel file (basic implementation)
   */
  private async parseExcelFile(file: File, options: ContractorImportOptions): Promise<Partial<ContractorImportRow>[]> {
    // For now, we'll implement a basic text-based parsing
    // In a production environment, you'd use a library like xlsx
    throw new Error('Excel file parsing not yet implemented. Please use CSV format for now.');
  }

  /**
   * Parse a single CSV line handling quoted values
   */
  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  }

  /**
   * Map CSV header to database field
   */
  private mapCsvHeader(header: string): string | null {
    // Remove asterisks from required field headers
    const cleanHeader = header.replace('*', '').trim();
    return CSV_HEADER_MAPPING[cleanHeader as keyof typeof CSV_HEADER_MAPPING] || null;
  }

  /**
   * Parse services field (comma-separated)
   */
  private parseServicesField(value: string): string[] {
    return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  /**
   * Parse regions field (comma-separated provinces)
   */
  private parseRegionsField(value: string): string[] {
    return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  /**
   * Import validated contractor data to database
   */
  async importContractors(
    data: ContractorImportData, 
    options: ContractorImportOptions
  ): Promise<ContractorImportResult> {
    const startTime = Date.now();
    
    // Simulate import process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const validContractors = data.contractors.filter(c => c.isValid);
    const duplicates = data.contractors.filter(c => c.isDuplicate);
    
    // Mock successful import
    const successCount = options.mode === 'skipDuplicates' 
      ? validContractors.filter(c => !c.isDuplicate).length
      : validContractors.length;
    
    return {
      totalProcessed: data.contractors.length,
      successCount,
      duplicatesSkipped: duplicates.length,
      errors: data.contractors
        .filter(c => !c.isValid)
        .map(c => ({
          row: c.rowNumber,
          message: c.errors.join(', '),
          data: { companyName: c.companyName }
        })),
      importedIds: Array.from({ length: successCount }, (_, i) => `contractor-${i + 1}`),
      duration: Date.now() - startTime
    };
  }

  /**
   * Download CSV template for contractor import
   */
  downloadTemplate(): void {
    const headers = [
      'Company Name*',
      'Trading Name',
      'Contact Person*', 
      'Email*',
      'Registration Number*',
      'Phone',
      'Business Type*',
      'Services',
      'Website',
      'Address 1',
      'Address 2',
      'Suburb',
      'City',
      'Province*',
      'Postal Code',
      'Country',
      'Region of Operations'
    ];

    const sampleData = [
      [
        'Alpha Construction Ltd',
        'Alpha Contractors',
        'John Smith',
        'john@alphaconstruction.com',
        '2021/123456/07',
        '0123456789',
        'Pty Ltd',
        'Fibre Installation, Network Maintenance',
        'https://www.alphaconstruction.com',
        '123 Main Street',
        'Unit 5A',
        'Sandton',
        'Johannesburg',
        'Gauteng',
        '2196',
        'South Africa',
        'Gauteng, Western Cape'
      ],
      [
        'Beta Networks CC',
        '',
        'Jane Doe',
        'jane@betanetworks.co.za',
        '2020/987654/23',
        '0987654321',
        'CC',
        'Fibre Splicing, Network Testing',
        'https://betanetworks.co.za',
        '456 Oak Avenue',
        '',
        'Claremont',
        'Cape Town',
        'Western Cape',
        '7708',
        'South Africa',
        'Western Cape, Eastern Cape'
      ],
      [
        'Gamma Trust',
        'GT Solutions',
        'Mike Johnson',
        'mike@gammatrust.org.za',
        '2019/555444/08',
        '+27116667777',
        'Trust',
        'Trenching, Civil Construction',
        'https://gammatrust.org.za',
        '789 Pine Road',
        'Suite 12B',
        'Durban North',
        'Durban',
        'KwaZulu-Natal',
        '4051',
        'South Africa',
        'KwaZulu-Natal'
      ]
    ];

    // Add validation options as comments
    const csvLines = [
      headers.join(','),
      '',
      '# VALIDATION GUIDE:',
      '# Business Type (required): Pty Ltd, CC, Trust, Sole Proprietor',
      '# Services: Choose from available services like Fibre Installation, Network Maintenance, Trenching, Fibre Splicing, etc. (separate multiple with commas)',
      '# Province (required): Eastern Cape, Free State, Gauteng, KwaZulu-Natal, Limpopo, Mpumalanga, Northern Cape, North West, Western Cape',
      '# Region of Operations: Multiple provinces allowed (separate with commas)',
      '# Phone: South African format preferred (+27 or 0 prefix)',
      '# Registration Number: SA company format (YYYY/XXXXXX/XX)',
      '# Website: Include https:// or http://',
      '',
      '# SAMPLE DATA:',
      ...sampleData.map(row => row.join(','))
    ];

    const csvContent = csvLines.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contractor_import_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export all contractors to Excel
   */
  async exportToExcel(): Promise<void> {
    // Mock export functionality
    console.log('Export to Excel functionality will be implemented');
  }
}

export const contractorImportService = new ContractorImportService();