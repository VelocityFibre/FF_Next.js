/**
 * Contractor Form Validation
 * Validation logic for contractor forms
 */

import { ContractorFormData } from '@/types/contractor.types';

export function validateContractorForm(formData: ContractorFormData): string | null {
  // Required field validations
  if (!formData.companyName.trim()) {
    return 'Company name is required';
  }
  
  if (!formData.registrationNumber.trim()) {
    return 'Registration number is required';
  }
  
  if (!formData.contactPerson.trim()) {
    return 'Contact person is required';
  }
  
  if (!formData.email.trim()) {
    return 'Email address is required';
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    return 'Please enter a valid email address';
  }
  
  // Phone number validation (if provided)
  if (formData.phone) {
    const phoneRegex = /^[\d\s\-+()]+$/;
    if (!phoneRegex.test(formData.phone)) {
      return 'Please enter a valid phone number';
    }
  }
  
  // Registration number format validation
  if (formData.registrationNumber.length < 4) {
    return 'Registration number must be at least 4 characters';
  }
  
  // Bank details validation (if any provided)
  if (formData.bankName || formData.accountNumber || formData.branchCode) {
    if (!formData.bankName) {
      return 'Bank name is required when providing banking details';
    }
    if (!formData.accountNumber) {
      return 'Account number is required when providing banking details';
    }
    if (!formData.branchCode) {
      return 'Branch code is required when providing banking details';
    }
  }
  
  // Numeric field validations
  if (formData.employeeCount !== undefined && formData.employeeCount < 0) {
    return 'Employee count cannot be negative';
  }
  
  if (formData.yearsInBusiness !== undefined && formData.yearsInBusiness < 0) {
    return 'Years in business cannot be negative';
  }
  
  if (formData.annualTurnover !== undefined && formData.annualTurnover < 0) {
    return 'Annual turnover cannot be negative';
  }
  
  return null;
}