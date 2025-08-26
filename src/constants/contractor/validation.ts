/**
 * Contractor Import Validation Constants
 * Business rules and validation constants for contractor data
 */

import type { BusinessType, SAProvince } from '@/types/contractor/import.types';

// Business Type Options (South African legal entities)
export const BUSINESS_TYPES: readonly BusinessType[] = [
  'Pty Ltd',
  'CC', 
  'Trust',
  'Sole Proprietor'
] as const;

// South African Provinces
export const SA_PROVINCES: readonly SAProvince[] = [
  'Eastern Cape',
  'Free State', 
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape'
] as const;

// Service Templates - These will be dynamically loaded from the database
// but we provide defaults for validation
export const DEFAULT_SERVICE_CATEGORIES = [
  'Service Delivery',
  'Civil',
  'Optical'
] as const;

// CSV Header Mapping (CSV header -> database field)
export const CSV_HEADER_MAPPING = {
  'Company Name*': 'companyName',
  'Trading Name': 'tradingName',
  'Contact Person*': 'contactPerson', 
  'Email*': 'email',
  'Registration Number*': 'registrationNumber',
  'Phone': 'phone',
  'Business Type': 'businessType',
  'Services': 'services',
  'Website': 'website',
  'Address 1': 'address1',
  'Address 2': 'address2',
  'Suburb': 'suburb',
  'City': 'city',
  'Province': 'province',
  'Postal Code': 'postalCode',
  'Country': 'country',
  'Region of Operations': 'regionOfOperations'
} as const;

// Required fields for validation
export const REQUIRED_FIELDS = [
  'companyName',
  'contactPerson',
  'email', 
  'registrationNumber'
] as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+27|0)[0-9]{9}$/, // South African phone numbers
  postalCode: /^[0-9]{4}$/, // South African postal codes
  website: /^https?:\/\/.+\..+/,
  registrationNumber: /^[0-9]{10}\/[0-9]{2}$|^[A-Z0-9]+$/ // SA company registration formats
} as const;

// Field length limits
export const FIELD_LIMITS = {
  companyName: 255,
  tradingName: 255,
  contactPerson: 255,
  email: 255,
  registrationNumber: 50,
  phone: 20,
  website: 255,
  address1: 255,
  address2: 255,
  suburb: 100,
  city: 100,
  postalCode: 10,
  country: 100
} as const;