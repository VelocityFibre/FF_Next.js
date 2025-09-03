/**
 * Contractor Import Validators Tests
 * Tests for validation and normalization functions
 */

import { 
  validateContractorData, 
  normalizeContractorData 
} from './validators';
import { ContractorImportRow } from '@/types/contractor/import.types';

describe('Contractor Import Validators', () => {
  describe('validateContractorData', () => {
    test('should pass validation for valid contractor data', () => {
      // 🟢 WORKING: Test valid data passes validation
      const validRow: ContractorImportRow = {
        companyName: 'ABC Construction Pty Ltd',
        contactPerson: 'John Smith',
        email: 'john.smith@abcconstruction.co.za',
        phone: '011-123-4567',
        registrationNumber: '2021/123456/07'
      };

      const errors = validateContractorData(validRow, 1);
      expect(errors).toHaveLength(0);
    });

    test('should validate required fields', () => {
      // 🟢 WORKING: Test required field validation
      const incompleteRow: ContractorImportRow = {
        companyName: '',
        contactPerson: '',
        email: '',
        registrationNumber: ''
      };

      const errors = validateContractorData(incompleteRow, 1);
      
      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            row: 1,
            field: 'companyName',
            message: 'Company Name is required'
          }),
          expect.objectContaining({
            row: 1,
            field: 'contactPerson',
            message: 'Contact Person is required'
          }),
          expect.objectContaining({
            row: 1,
            field: 'email',
            message: 'Email is required'
          }),
          expect.objectContaining({
            row: 1,
            field: 'registrationNumber',
            message: 'Registration Number is required'
          })
        ])
      );
    });

    test('should validate email format', () => {
      // 🟢 WORKING: Test email validation
      const testCases = [
        { email: 'invalid-email', shouldFail: true },
        { email: 'test@', shouldFail: true },
        { email: '@domain.com', shouldFail: true },
        { email: 'test@domain', shouldFail: true },
        { email: 'test@domain.com', shouldFail: false },
        { email: 'john.smith+test@company.co.za', shouldFail: false },
        { email: 'user123@subdomain.domain.com', shouldFail: false }
      ];

      testCases.forEach(testCase => {
        const row: ContractorImportRow = {
          companyName: 'Test Company',
          contactPerson: 'Test Person',
          email: testCase.email,
          registrationNumber: 'REG001'
        };

        const errors = validateContractorData(row, 1);
        const hasEmailError = errors.some(e => e.field === 'email' && e.message === 'Invalid email format');
        
        expect(hasEmailError).toBe(testCase.shouldFail);
      });
    });

    test('should validate phone number formats', () => {
      // 🟢 WORKING: Test phone number validation
      const validPhones = [
        '011-123-4567',
        '+27-11-123-4567',
        '082-555-1234',
        '+27-82-555-1234',
        '0861234567',
        '+1-555-123-4567'
      ];

      const invalidPhones = [
        '123',
        'abc-def-ghij',
        '++27-11-123-4567',
        '011-123'
      ];

      validPhones.forEach(phone => {
        const row: ContractorImportRow = {
          companyName: 'Test Company',
          contactPerson: 'Test Person',
          email: 'test@example.com',
          registrationNumber: 'REG001',
          phone
        };

        const errors = validateContractorData(row, 1);
        const hasPhoneError = errors.some(e => e.field === 'phone');
        expect(hasPhoneError).toBe(false);
      });

      invalidPhones.forEach(phone => {
        const row: ContractorImportRow = {
          companyName: 'Test Company',
          contactPerson: 'Test Person',
          email: 'test@example.com',
          registrationNumber: 'REG001',
          phone
        };

        const errors = validateContractorData(row, 1);
        const hasPhoneError = errors.some(e => e.field === 'phone');
        expect(hasPhoneError).toBe(true);
      });
    });

    test('should validate business types', () => {
      // 🟢 WORKING: Test business type validation
      const validBusinessTypes = [
        'pty_ltd',
        'cc',
        'sole_proprietor',
        'partnership',
        'Pty Ltd',
        'Close Corporation',
        'sole proprietor',
        'Partnership'
      ];

      const invalidBusinessTypes = [
        'invalid_type',
        'corporation',
        'llc'
      ];

      validBusinessTypes.forEach(businessType => {
        const row: ContractorImportRow = {
          companyName: 'Test Company',
          contactPerson: 'Test Person',
          email: 'test@example.com',
          registrationNumber: 'REG001',
          businessType
        };

        const errors = validateContractorData(row, 1);
        const hasBusinessTypeError = errors.some(e => e.field === 'businessType');
        expect(hasBusinessTypeError).toBe(false);
      });

      invalidBusinessTypes.forEach(businessType => {
        const row: ContractorImportRow = {
          companyName: 'Test Company',
          contactPerson: 'Test Person',
          email: 'test@example.com',
          registrationNumber: 'REG001',
          businessType
        };

        const errors = validateContractorData(row, 1);
        const hasBusinessTypeError = errors.some(e => e.field === 'businessType');
        expect(hasBusinessTypeError).toBe(true);
      });
    });

    test('should validate website URLs', () => {
      // 🟢 WORKING: Test website URL validation
      const validUrls = [
        'https://www.example.com',
        'http://example.com',
        'www.example.com',
        'example.com',
        'subdomain.example.co.za'
      ];

      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'javascript:alert(1)'
      ];

      validUrls.forEach(website => {
        const row: ContractorImportRow = {
          companyName: 'Test Company',
          contactPerson: 'Test Person',
          email: 'test@example.com',
          registrationNumber: 'REG001',
          website
        };

        const errors = validateContractorData(row, 1);
        const hasWebsiteError = errors.some(e => e.field === 'website');
        expect(hasWebsiteError).toBe(false);
      });

      invalidUrls.forEach(website => {
        const row: ContractorImportRow = {
          companyName: 'Test Company',
          contactPerson: 'Test Person',
          email: 'test@example.com',
          registrationNumber: 'REG001',
          website
        };

        const errors = validateContractorData(row, 1);
        const hasWebsiteError = errors.some(e => e.field === 'website');
        expect(hasWebsiteError).toBe(true);
      });
    });

    test('should validate numeric fields', () => {
      // 🟢 WORKING: Test numeric field validation
      const testRow: ContractorImportRow = {
        companyName: 'Test Company',
        contactPerson: 'Test Person',
        email: 'test@example.com',
        registrationNumber: 'REG001',
        annualTurnover: 'invalid',
        yearsInBusiness: '150',
        employeeCount: '-5'
      };

      const errors = validateContractorData(testRow, 1);
      
      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'annualTurnover',
            message: 'Annual turnover must be a valid positive number'
          }),
          expect.objectContaining({
            field: 'yearsInBusiness',
            message: 'Years in business must be a number between 0 and 100'
          }),
          expect.objectContaining({
            field: 'employeeCount',
            message: 'Employee count must be a positive whole number'
          })
        ])
      );
    });

    test('should validate field lengths', () => {
      // 🟢 WORKING: Test field length validation
      const longString = 'a'.repeat(300);
      const shortString = 'a';

      const row: ContractorImportRow = {
        companyName: longString,
        contactPerson: shortString,
        email: longString + '@example.com',
        registrationNumber: 'abc'
      };

      const errors = validateContractorData(row, 1);
      
      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'companyName',
            message: 'Company Name must be less than 100 characters'
          }),
          expect.objectContaining({
            field: 'contactPerson',
            message: 'Contact Person name must be at least 2 characters long'
          }),
          expect.objectContaining({
            field: 'email',
            message: 'Email address is too long (maximum 255 characters)'
          }),
          expect.objectContaining({
            field: 'registrationNumber',
            message: 'Registration Number must be at least 5 characters long'
          })
        ])
      );
    });
  });

  describe('normalizeContractorData', () => {
    test('should normalize string fields correctly', () => {
      // 🟢 WORKING: Test string normalization
      const row: ContractorImportRow = {
        companyName: '  ABC Construction Pty Ltd  ',
        contactPerson: '\tJohn Smith\n',
        email: '  JOHN.SMITH@ABC.COM  ',
        registrationNumber: '  reg001  ',
      };

      const normalized = normalizeContractorData(row);

      expect(normalized.companyName).toBe('ABC Construction Pty Ltd');
      expect(normalized.contactPerson).toBe('John Smith');
      expect(normalized.email).toBe('john.smith@abc.com');
      expect(normalized.registrationNumber).toBe('REG001');
    });

    test('should normalize phone numbers', () => {
      // 🟢 WORKING: Test phone normalization
      const row: ContractorImportRow = {
        companyName: 'Test Company',
        contactPerson: 'Test Person',
        email: 'test@example.com',
        registrationNumber: 'REG001',
        phone: ' +27 (011) 123-4567 ',
        alternatePhone: '\t082.555.1234\n'
      };

      const normalized = normalizeContractorData(row);

      expect(normalized.phone).toBe('+27 (011) 123-4567');
      expect(normalized.alternatePhone).toBe('082.555.1234');
    });

    test('should normalize URLs', () => {
      // 🟢 WORKING: Test URL normalization
      const testCases = [
        { input: '  example.com  ', expected: 'https://example.com' },
        { input: 'HTTP://EXAMPLE.COM/', expected: 'http://example.com' },
        { input: 'https://example.com/', expected: 'https://example.com' },
        { input: '  HTTPS://WWW.EXAMPLE.COM/PATH  ', expected: 'https://www.example.com/path' }
      ];

      testCases.forEach(testCase => {
        const row: ContractorImportRow = {
          companyName: 'Test Company',
          contactPerson: 'Test Person',
          email: 'test@example.com',
          registrationNumber: 'REG001',
          website: testCase.input
        };

        const normalized = normalizeContractorData(row);
        expect(normalized.website).toBe(testCase.expected);
      });
    });

    test('should normalize postal codes', () => {
      // 🟢 WORKING: Test postal code normalization
      const row: ContractorImportRow = {
        companyName: 'Test Company',
        contactPerson: 'Test Person',
        email: 'test@example.com',
        registrationNumber: 'REG001',
        postalCode: '  2196  '
      };

      const normalized = normalizeContractorData(row);
      expect(normalized.postalCode).toBe('2196');
    });

    test('should set default country', () => {
      // 🟢 WORKING: Test default country setting
      const row: ContractorImportRow = {
        companyName: 'Test Company',
        contactPerson: 'Test Person',
        email: 'test@example.com',
        registrationNumber: 'REG001'
      };

      const normalized = normalizeContractorData(row);
      expect(normalized.country).toBe('South Africa');
    });

    test('should normalize numeric strings', () => {
      // 🟢 WORKING: Test numeric string normalization
      const row: ContractorImportRow = {
        companyName: 'Test Company',
        contactPerson: 'Test Person',
        email: 'test@example.com',
        registrationNumber: 'REG001',
        annualTurnover: '  R 1,500,000.00  ',
        yearsInBusiness: ' 15 years ',
        employeeCount: ' 25 people '
      };

      const normalized = normalizeContractorData(row);
      expect(normalized.annualTurnover).toBe('1500000.00');
      expect(normalized.yearsInBusiness).toBe('15');
      expect(normalized.employeeCount).toBe('25');
    });

    test('should handle undefined and null values', () => {
      // 🟢 WORKING: Test handling of undefined/null values
      const row: ContractorImportRow = {
        companyName: 'Test Company',
        contactPerson: 'Test Person',
        email: 'test@example.com',
        registrationNumber: 'REG001',
        phone: undefined,
        website: '',
        city: null as any
      };

      const normalized = normalizeContractorData(row);
      expect(normalized.phone).toBe('');
      expect(normalized.website).toBe('');
      expect(normalized.city).toBe('');
    });

    test('should handle numeric inputs correctly', () => {
      // 🟢 WORKING: Test numeric input handling
      const row: ContractorImportRow = {
        companyName: 'Test Company',
        contactPerson: 'Test Person',
        email: 'test@example.com',
        registrationNumber: 'REG001',
        annualTurnover: 1500000,
        yearsInBusiness: 15,
        employeeCount: 25
      };

      const normalized = normalizeContractorData(row);
      expect(normalized.annualTurnover).toBe(1500000);
      expect(normalized.yearsInBusiness).toBe(15);
      expect(normalized.employeeCount).toBe(25);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long field values gracefully', () => {
      // 🟢 WORKING: Test extreme field lengths
      const veryLongString = 'a'.repeat(10000);
      const row: ContractorImportRow = {
        companyName: veryLongString,
        contactPerson: veryLongString,
        email: veryLongString + '@example.com',
        registrationNumber: veryLongString
      };

      const errors = validateContractorData(row, 1);
      expect(errors.length).toBeGreaterThan(0);
      
      // Normalization should still work
      const normalized = normalizeContractorData(row);
      expect(normalized.companyName).toBe(veryLongString);
    });

    test('should handle special characters in all fields', () => {
      // 🟢 WORKING: Test special character handling
      const row: ContractorImportRow = {
        companyName: 'Müller & Söhne GmbH (Pty) Ltd.',
        contactPerson: 'José María García-López',
        email: 'jose.maria@müller-söhne.co.za',
        registrationNumber: 'REG/2021/123456/07',
        phone: '+27-(011)-123-4567',
        website: 'https://müller-söhne.co.za',
        physicalAddress: '123 Main St., Johannesburg, 2196',
        specializations: 'Fiber Installation, Electrical Work & Maintenance'
      };

      const errors = validateContractorData(row, 1);
      expect(errors.filter(e => !e.message.includes('Personal email')).length).toBe(0);
      
      const normalized = normalizeContractorData(row);
      expect(normalized.companyName).toBe('Müller & Söhne GmbH (Pty) Ltd.');
      expect(normalized.email).toBe('jose.maria@müller-söhne.co.za');
    });

    test('should validate international phone numbers', () => {
      // 🟢 WORKING: Test international phone validation
      const internationalPhones = [
        '+1-555-123-4567',  // US
        '+44-20-7123-4567', // UK
        '+33-1-23-45-67-89', // France
        '+49-30-12345678',  // Germany
        '+86-10-12345678'   // China
      ];

      internationalPhones.forEach(phone => {
        const row: ContractorImportRow = {
          companyName: 'International Company',
          contactPerson: 'Test Person',
          email: 'test@international.com',
          registrationNumber: 'INTL001',
          phone
        };

        const errors = validateContractorData(row, 1);
        const hasPhoneError = errors.some(e => e.field === 'phone');
        expect(hasPhoneError).toBe(false);
      });
    });
  });
});