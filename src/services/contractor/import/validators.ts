/**
 * Contractor Import Validators
 * Validation functions for contractor import data
 */

import { ContractorImportRow, ContractorImportError } from '@/types/contractor/import.types';
import { log } from '@/lib/logger';

/**
 * Validate contractor import data
 * 🟢 WORKING: Comprehensive validation with detailed error messages
 */
export function validateContractorData(
  row: ContractorImportRow, 
  rowNumber: number
): ContractorImportError[] {
  const errors: ContractorImportError[] = [];
  
  // Required field validation
  if (!row.companyName?.trim()) {
    errors.push({
      row: rowNumber,
      field: 'companyName',
      message: 'Company Name is required'
    });
  } else if (row.companyName.trim().length < 2) {
    errors.push({
      row: rowNumber,
      field: 'companyName',
      message: 'Company Name must be at least 2 characters long'
    });
  } else if (row.companyName.trim().length > 100) {
    errors.push({
      row: rowNumber,
      field: 'companyName',
      message: 'Company Name must be less than 100 characters'
    });
  }
  
  if (!row.contactPerson?.trim()) {
    errors.push({
      row: rowNumber,
      field: 'contactPerson',
      message: 'Contact Person is required'
    });
  } else if (row.contactPerson.trim().length < 2) {
    errors.push({
      row: rowNumber,
      field: 'contactPerson',
      message: 'Contact Person name must be at least 2 characters long'
    });
  }
  
  // Email validation
  if (!row.email?.trim()) {
    errors.push({
      row: rowNumber,
      field: 'email',
      message: 'Email is required'
    });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.email.trim())) {
      errors.push({
        row: rowNumber,
        field: 'email',
        message: 'Invalid email format'
      });
    } else if (row.email.trim().length > 255) {
      errors.push({
        row: rowNumber,
        field: 'email',
        message: 'Email address is too long (maximum 255 characters)'
      });
    }
  }
  
  // Registration number validation
  if (!row.registrationNumber?.trim()) {
    errors.push({
      row: rowNumber,
      field: 'registrationNumber',
      message: 'Registration Number is required'
    });
  } else if (row.registrationNumber.trim().length < 5) {
    errors.push({
      row: rowNumber,
      field: 'registrationNumber',
      message: 'Registration Number must be at least 5 characters long'
    });
  }
  
  // Phone validation (optional but must be valid if provided)
  if (row.phone?.trim()) {
    if (!isValidPhoneNumber(row.phone.trim())) {
      errors.push({
        row: rowNumber,
        field: 'phone',
        message: 'Invalid phone number format'
      });
    }
  }
  
  // Alternate phone validation
  if (row.alternatePhone?.trim()) {
    if (!isValidPhoneNumber(row.alternatePhone.trim())) {
      errors.push({
        row: rowNumber,
        field: 'alternatePhone',
        message: 'Invalid alternate phone number format'
      });
    }
  }
  
  // Business type validation
  if (row.businessType?.trim()) {
    const validBusinessTypes = ['pty_ltd', 'cc', 'sole_proprietor', 'partnership'];
    const normalizedType = row.businessType.toLowerCase().replace(/\s+/g, '_');
    
    if (!validBusinessTypes.includes(normalizedType) && 
        !normalizedType.includes('pty') && 
        !normalizedType.includes('ltd') &&
        !normalizedType.includes('cc') &&
        !normalizedType.includes('sole') &&
        !normalizedType.includes('partnership')) {
      errors.push({
        row: rowNumber,
        field: 'businessType',
        message: 'Invalid business type. Expected: Pty Ltd, CC, Sole Proprietor, or Partnership'
      });
    }
  }
  
  // Website validation
  if (row.website?.trim()) {
    if (!isValidURL(row.website.trim())) {
      errors.push({
        row: rowNumber,
        field: 'website',
        message: 'Invalid website URL format'
      });
    }
  }
  
  // Email domain validation (basic check for professional domains)
  if (row.email?.trim()) {
    const email = row.email.trim().toLowerCase();
    const suspiciousDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = email.split('@')[1];
    
    if (suspiciousDomains.includes(domain)) {
      // This is a warning, not an error - we'll allow it but flag it
      log.warn(`Row ${rowNumber}: Personal email domain detected for business: ${domain}`, undefined, 'validators');
    }
  }
  
  // Postal code validation (if provided)
  if (row.postalCode?.trim()) {
    if (!isValidPostalCode(row.postalCode.trim())) {
      errors.push({
        row: rowNumber,
        field: 'postalCode',
        message: 'Invalid postal code format'
      });
    }
  }
  
  // Numeric field validation
  if (row.annualTurnover !== undefined && row.annualTurnover !== '') {
    const turnover = parseFloat(String(row.annualTurnover).replace(/[,\s]/g, ''));
    if (isNaN(turnover) || turnover < 0) {
      errors.push({
        row: rowNumber,
        field: 'annualTurnover',
        message: 'Annual turnover must be a valid positive number'
      });
    }
  }
  
  if (row.yearsInBusiness !== undefined && row.yearsInBusiness !== '') {
    const years = parseFloat(String(row.yearsInBusiness));
    if (isNaN(years) || years < 0 || years > 100) {
      errors.push({
        row: rowNumber,
        field: 'yearsInBusiness',
        message: 'Years in business must be a number between 0 and 100'
      });
    }
  }
  
  if (row.employeeCount !== undefined && row.employeeCount !== '') {
    const count = parseFloat(String(row.employeeCount));
    if (isNaN(count) || count < 0 || !Number.isInteger(count)) {
      errors.push({
        row: rowNumber,
        field: 'employeeCount',
        message: 'Employee count must be a positive whole number'
      });
    }
  }
  
  return errors;
}

/**
 * Normalize contractor data
 * 🟢 WORKING: Cleans and standardizes contractor data
 */
export function normalizeContractorData(row: ContractorImportRow): ContractorImportRow {
  return {
    companyName: normalizeString(row.companyName),
    contactPerson: normalizeString(row.contactPerson),
    email: normalizeString(row.email)?.toLowerCase(),
    phone: normalizePhoneNumber(row.phone),
    registrationNumber: normalizeString(row.registrationNumber)?.toUpperCase(),
    
    businessType: normalizeString(row.businessType),
    industryCategory: normalizeString(row.industryCategory),
    specializations: normalizeString(row.specializations),
    
    alternatePhone: normalizePhoneNumber(row.alternatePhone),
    website: normalizeURL(row.website),
    
    physicalAddress: normalizeString(row.physicalAddress),
    postalAddress: normalizeString(row.postalAddress),
    city: normalizeString(row.city),
    province: normalizeString(row.province),
    postalCode: normalizeString(row.postalCode)?.toUpperCase(),
    country: normalizeString(row.country) || 'South Africa',
    
    licenseNumber: normalizeString(row.licenseNumber),
    insuranceDetails: normalizeString(row.insuranceDetails),
    annualTurnover: normalizeNumericString(row.annualTurnover),
    creditRating: normalizeString(row.creditRating),
    paymentTerms: normalizeString(row.paymentTerms),
    
    bankName: normalizeString(row.bankName),
    accountNumber: normalizeString(row.accountNumber),
    branchCode: normalizeString(row.branchCode),
    
    yearsInBusiness: normalizeNumericString(row.yearsInBusiness),
    employeeCount: normalizeNumericString(row.employeeCount),
    certifications: normalizeString(row.certifications),
    notes: normalizeString(row.notes),
    tags: normalizeString(row.tags)
  };
}

/**
 * Utility validation functions
 */

function isValidPhoneNumber(phone: string): boolean {
  // South African phone number patterns
  const saPatterns = [
    /^(\+27|0)[1-9][0-9]{8}$/, // Standard SA format
    /^(\+27|0)[6-8][0-9]{8}$/, // Mobile numbers
    /^(\+27|0)[1][1-9][0-9]{7}$/, // Landline numbers
  ];
  
  // International pattern (basic)
  const intlPattern = /^(\+[1-9]\d{1,14})$/;
  
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  return saPatterns.some(pattern => pattern.test(cleaned)) || intlPattern.test(cleaned);
}

function isValidURL(url: string): boolean {
  try {
    // Add protocol if missing
    const urlToTest = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`;
    
    const parsed = new URL(urlToTest);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function isValidPostalCode(postalCode: string): boolean {
  // South African postal code format (4 digits)
  const saPattern = /^[0-9]{4}$/;
  
  // International postal codes (more flexible)
  const intlPattern = /^[A-Z0-9\-\s]{3,10}$/i;
  
  return saPattern.test(postalCode) || intlPattern.test(postalCode);
}

/**
 * Data normalization utility functions
 */

function normalizeString(value?: string | number): string {
  if (value === undefined || value === null || value === '') return '';
  return String(value).trim();
}

function normalizePhoneNumber(phone?: string): string {
  if (!phone) return '';
  
  // Remove common formatting characters but keep the core number
  return phone.trim().replace(/[^\d\+\-\(\)\s]/g, '');
}

function normalizeURL(url?: string): string {
  if (!url) return '';
  
  let normalized = url.trim().toLowerCase();
  
  // Add protocol if missing
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`;
  }
  
  // Remove trailing slash
  if (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  
  return normalized;
}

function normalizeNumericString(value?: string | number): string | number {
  if (value === undefined || value === null || value === '') return '';
  
  if (typeof value === 'number') return value;
  
  // Keep the string format but clean it
  return String(value).trim().replace(/[^\d.,\-]/g, '');
}