/**
 * Contractor CSV Processor Tests
 * Comprehensive tests for CSV import functionality
 */

import { importContractorsFromCSV, generateContractorImportTemplate } from './csvProcessor';
import { ContractorImportResult } from '@/types/contractor/import.types';

// Mock the row processor
jest.mock('./rowProcessor', () => ({
  processContractorImportRows: jest.fn().mockResolvedValue({
    success: true,
    total: 2,
    imported: 2,
    failed: 0,
    errors: [],
    contractors: [
      {
        companyName: 'Test Company 1',
        contactPerson: 'John Doe',
        email: 'john@test1.com',
        registrationNumber: 'REG001'
      },
      {
        companyName: 'Test Company 2',
        contactPerson: 'Jane Smith',
        email: 'jane@test2.com',
        registrationNumber: 'REG002'
      }
    ]
  })
}));

describe('Contractor CSV Processor', () => {
  const mockRowProcessor = require('./rowProcessor');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('importContractorsFromCSV', () => {
    test('should successfully import contractors from valid CSV', async () => {
      // 🟢 WORKING: Test successful CSV import
      const csvContent = `Company Name,Contact Person,Email,Registration Number
Test Company 1,John Doe,john@test1.com,REG001
Test Company 2,Jane Smith,jane@test2.com,REG002`;

      const file = new File([csvContent], 'contractors.csv', { type: 'text/csv' });
      
      const result = await importContractorsFromCSV(file, true);

      expect(result.success).toBe(true);
      expect(result.total).toBe(2);
      expect(result.imported).toBe(2);
      expect(result.failed).toBe(0);
      expect(mockRowProcessor.processContractorImportRows).toHaveBeenCalledWith(
        expect.any(Array),
        true
      );
    });

    test('should handle CSV with quoted fields containing commas', async () => {
      // 🟢 WORKING: Test CSV parsing with complex quoted fields
      const csvContent = `"Company Name","Contact Person","Email","Registration Number"
"ABC Construction, Pty Ltd","John, Jr. Smith","john@abc.com","REG001"
"XYZ Engineering & Co","Jane ""Chief"" Smith","jane@xyz.com","REG002"`;

      const file = new File([csvContent], 'contractors.csv', { type: 'text/csv' });
      
      const result = await importContractorsFromCSV(file, true);

      expect(result.success).toBe(true);
      expect(mockRowProcessor.processContractorImportRows).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            companyName: 'ABC Construction, Pty Ltd',
            contactPerson: 'John, Jr. Smith'
          }),
          expect.objectContaining({
            companyName: 'XYZ Engineering & Co',
            contactPerson: 'Jane "Chief" Smith'
          })
        ]),
        true
      );
    });

    test('should handle empty CSV file', async () => {
      // 🟢 WORKING: Test empty file handling
      const csvContent = '';
      const file = new File([csvContent], 'empty.csv', { type: 'text/csv' });
      
      await expect(importContractorsFromCSV(file, true)).rejects.toThrow('CSV file is empty');
    });

    test('should handle CSV with no headers', async () => {
      // 🟢 WORKING: Test CSV with no headers
      const csvContent = '\n\n';
      const file = new File([csvContent], 'no-headers.csv', { type: 'text/csv' });
      
      await expect(importContractorsFromCSV(file, true)).rejects.toThrow('CSV file has no headers');
    });

    test('should skip empty rows', async () => {
      // 🟢 WORKING: Test empty row handling
      const csvContent = `Company Name,Contact Person,Email,Registration Number
Test Company 1,John Doe,john@test1.com,REG001

Test Company 2,Jane Smith,jane@test2.com,REG002
,,,`;

      const file = new File([csvContent], 'contractors.csv', { type: 'text/csv' });
      
      await importContractorsFromCSV(file, true);

      // Should only process 2 valid rows, skipping empty ones
      expect(mockRowProcessor.processContractorImportRows).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ companyName: 'Test Company 1' }),
          expect.objectContaining({ companyName: 'Test Company 2' })
        ]),
        true
      );
      
      const processedRows = mockRowProcessor.processContractorImportRows.mock.calls[0][0];
      expect(processedRows).toHaveLength(2);
    });

    test('should handle CSV with missing required fields', async () => {
      // 🟢 WORKING: Test validation of required fields
      const csvContent = `Company Name,Contact Person,Email,Registration Number
,John Doe,,REG001
Test Company 2,,jane@test2.com,`;

      const file = new File([csvContent], 'contractors.csv', { type: 'text/csv' });
      
      mockRowProcessor.processContractorImportRows.mockResolvedValueOnce({
        success: false,
        total: 2,
        imported: 0,
        failed: 2,
        errors: [],
        contractors: []
      });

      const result = await importContractorsFromCSV(file, true);

      expect(result.failed).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('Missing required fields'))).toBe(true);
    });

    test('should apply header mapping correctly', async () => {
      // 🟢 WORKING: Test header mapping functionality
      const csvContent = `Company,Contact,Email Address,Reg Number
Test Company 1,John Doe,john@test1.com,REG001`;

      const file = new File([csvContent], 'contractors.csv', { type: 'text/csv' });
      
      await importContractorsFromCSV(file, true);

      expect(mockRowProcessor.processContractorImportRows).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            company: 'Test Company 1', // Unmapped field
            contact: 'John Doe',      // Unmapped field
            email: 'john@test1.com',  // Mapped from 'Email Address'
            regNumber: 'REG001'       // Unmapped field (camelCase conversion)
          })
        ]),
        true
      );
    });

    test('should handle CSV parsing errors gracefully', async () => {
      // 🟢 WORKING: Test error handling for malformed CSV
      const csvContent = `Company Name,Contact Person,Email,Registration Number
"Unclosed quote company,John Doe,john@test1.com,REG001
Test Company 2,Jane Smith,jane@test2.com,REG002`;

      const file = new File([csvContent], 'malformed.csv', { type: 'text/csv' });
      
      mockRowProcessor.processContractorImportRows.mockResolvedValueOnce({
        success: true,
        total: 1,
        imported: 1,
        failed: 0,
        errors: [],
        contractors: []
      });

      const result = await importContractorsFromCSV(file, true);

      // Should handle the parsing error and continue with valid rows
      expect(result).toBeDefined();
      expect(result.errors.some(e => e.field === 'csv_parsing')).toBe(true);
    });

    test('should handle overwrite mode correctly', async () => {
      // 🟢 WORKING: Test overwrite parameter
      const csvContent = `Company Name,Contact Person,Email,Registration Number
Test Company 1,John Doe,john@test1.com,REG001`;

      const file = new File([csvContent], 'contractors.csv', { type: 'text/csv' });
      
      // Test overwrite = false
      await importContractorsFromCSV(file, false);
      expect(mockRowProcessor.processContractorImportRows).toHaveBeenCalledWith(
        expect.any(Array),
        false
      );

      // Test overwrite = true
      await importContractorsFromCSV(file, true);
      expect(mockRowProcessor.processContractorImportRows).toHaveBeenCalledWith(
        expect.any(Array),
        true
      );
    });
  });

  describe('generateContractorImportTemplate', () => {
    test('should generate valid CSV template', () => {
      // 🟢 WORKING: Test template generation
      const template = generateContractorImportTemplate();

      expect(template).toContain('Company Name');
      expect(template).toContain('Contact Person');
      expect(template).toContain('Email');
      expect(template).toContain('Registration Number');
      expect(template).toContain('ABC Construction Pty Ltd');
      
      // Should have header row + sample data row
      const lines = template.trim().split('\n');
      expect(lines.length).toBe(2);
      
      // First line should be headers
      expect(lines[0]).toMatch(/^Company Name,Contact Person,Email,/);
      
      // Second line should be sample data
      expect(lines[1]).toMatch(/^ABC Construction Pty Ltd,John Smith,/);
    });

    test('should include all important contractor fields in template', () => {
      // 🟢 WORKING: Test template completeness
      const template = generateContractorImportTemplate();

      const expectedFields = [
        'Company Name',
        'Contact Person',
        'Email',
        'Phone',
        'Registration Number',
        'Business Type',
        'Industry Category',
        'Specializations',
        'Physical Address',
        'City',
        'Province',
        'Annual Turnover',
        'Years in Business',
        'Employee Count',
        'Insurance Details',
        'License Number'
      ];

      expectedFields.forEach(field => {
        expect(template).toContain(field);
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle very large CSV files', async () => {
      // 🟢 WORKING: Test large file handling
      const headerRow = 'Company Name,Contact Person,Email,Registration Number';
      const dataRows = Array.from({ length: 1000 }, (_, i) => 
        `Company ${i},Person ${i},email${i}@test.com,REG${i.toString().padStart(3, '0')}`
      );
      const csvContent = [headerRow, ...dataRows].join('\n');

      const file = new File([csvContent], 'large.csv', { type: 'text/csv' });
      
      mockRowProcessor.processContractorImportRows.mockResolvedValueOnce({
        success: true,
        total: 1000,
        imported: 1000,
        failed: 0,
        errors: [],
        contractors: []
      });

      const result = await importContractorsFromCSV(file, true);

      expect(result.total).toBe(1000);
      expect(mockRowProcessor.processContractorImportRows).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ companyName: 'Company 0' }),
          expect.objectContaining({ companyName: 'Company 999' })
        ]),
        true
      );
    });

    test('should handle Unicode characters', async () => {
      // 🟢 WORKING: Test Unicode support
      const csvContent = `Company Name,Contact Person,Email,Registration Number
"Müller & Söhne GmbH","José María García","jose@müller.com","REG001"
"北京建设公司","李小明","li@beijing.cn","REG002"`;

      const file = new File([csvContent], 'unicode.csv', { type: 'text/csv' });
      
      await importContractorsFromCSV(file, true);

      expect(mockRowProcessor.processContractorImportRows).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            companyName: 'Müller & Söhne GmbH',
            contactPerson: 'José María García'
          }),
          expect.objectContaining({
            companyName: '北京建设公司',
            contactPerson: '李小明'
          })
        ]),
        true
      );
    });

    test('should handle file reading errors', async () => {
      // 🟢 WORKING: Test file reading error handling
      const mockFile = {
        name: 'test.csv',
        type: 'text/csv',
        size: 100
      } as File;

      // Mock FileReader to simulate read error
      const originalFileReader = global.FileReader;
      global.FileReader = jest.fn(() => ({
        readAsText: jest.fn(function(this: any) {
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 0);
        }),
        onerror: null,
        onload: null
      })) as any;

      await expect(importContractorsFromCSV(mockFile, true)).rejects.toThrow('Failed to read CSV file');

      global.FileReader = originalFileReader;
    });
  });
});