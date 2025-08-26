/**
 * Contractor Import Validator
 * Comprehensive validation for contractor import data
 */

import type { ContractorImportRow, BusinessType, SAProvince } from '@/types/contractor/import.types';
import { 
  BUSINESS_TYPES, 
  SA_PROVINCES, 
  REQUIRED_FIELDS, 
  VALIDATION_PATTERNS, 
  FIELD_LIMITS 
} from '@/constants/contractor/validation';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ContractorImportValidator {
  private availableServices: string[] = []; // Will be loaded from service templates

  constructor(availableServices: string[] = []) {
    this.availableServices = availableServices;
  }

  /**
   * Set available services from service templates
   */
  setAvailableServices(services: string[]): void {
    this.availableServices = services;
  }

  /**
   * Load available services from the service templates API
   */
  async loadAvailableServices(): Promise<void> {
    try {
      // Try to load from API first
      try {
        // Dynamic import to avoid circular dependencies
        const { ServiceTemplateApiService } = await import('@/services/contractor/rateCardApiService');
        
        // Get all active service templates
        const response = await ServiceTemplateApiService.getServiceTemplates({
          isActive: true,
          limit: 1000 // Get all services
        });
        
        // Extract service names from templates
        const services = response.data
          .filter(template => template.parentId !== null) // Only services, not deliverables
          .map(template => template.name);
        
        if (services.length > 0) {
          this.availableServices = services;
          return;
        }
      } catch (apiError) {
        console.warn('Service templates API not available for validation, using fallback services:', apiError);
      }
      
      // Fallback to comprehensive service list
      this.availableServices = [
        // Service Delivery
        'Fibre Installation',
        'Network Maintenance', 
        'Customer Premise Equipment',
        'Site Survey',
        'Project Management',
        
        // Civil Works
        'Trenching',
        'Ducting Installation',
        'Road Crossing',
        'Reinstatement',
        'Civil Construction',
        
        // Optical Services
        'Fibre Splicing',
        'Network Testing',
        'Equipment Installation',
        'Optical Equipment Maintenance',
        'Network Commissioning',
        
        // Legacy services for compatibility
        'Service Delivery',
        'Civil',
        'Optical'
      ];
        
    } catch (error) {
      console.error('Failed to load any services for validation:', error);
      // Final fallback to basic services
      this.availableServices = ['Service Delivery', 'Civil', 'Optical'];
    }
  }

  /**
   * Validate a single contractor row
   */
  validateRow(row: Partial<ContractorImportRow>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    this.validateRequiredFields(row, errors);

    // Validate field formats and constraints
    this.validateEmail(row.email, errors);
    this.validatePhone(row.phone, errors, warnings);
    this.validateBusinessType(row.businessType, errors);
    this.validateServices(row.services, errors, warnings);
    this.validateProvince(row.province, errors);
    this.validateRegionOfOperations(row.regionOfOperations, errors);
    this.validateRegistrationNumber(row.registrationNumber, errors, warnings);
    this.validatePostalCode(row.postalCode, errors, warnings);
    this.validateWebsite(row.website, errors, warnings);

    // Validate field lengths
    this.validateFieldLengths(row, errors);

    // Business logic validations
    this.validateBusinessLogic(row, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate required fields are present and not empty
   */
  private validateRequiredFields(row: Partial<ContractorImportRow>, errors: string[]): void {
    for (const field of REQUIRED_FIELDS) {
      const value = row[field as keyof ContractorImportRow];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push(`${this.getFieldDisplayName(field)} is required`);
      }
    }
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string | undefined, errors: string[]): void {
    if (email && !VALIDATION_PATTERNS.email.test(email)) {
      errors.push('Email format is invalid');
    }
  }

  /**
   * Validate phone number format (South African format)
   */
  private validatePhone(phone: string | undefined, errors: string[], warnings: string[]): void {
    if (phone) {
      if (!VALIDATION_PATTERNS.phone.test(phone)) {
        warnings.push('Phone number format may be invalid (expected South African format: +27xxxxxxxxx or 0xxxxxxxxx)');
      }
    }
  }

  /**
   * Validate business type against allowed values
   */
  private validateBusinessType(businessType: BusinessType | undefined, errors: string[]): void {
    if (businessType && !BUSINESS_TYPES.includes(businessType)) {
      errors.push(`Business Type must be one of: ${BUSINESS_TYPES.join(', ')}`);
    }
  }

  /**
   * Validate services against available service templates
   */
  private validateServices(services: string[] | undefined, errors: string[], warnings: string[]): void {
    if (services && services.length > 0) {
      const invalidServices = services.filter(service => 
        this.availableServices.length > 0 && !this.availableServices.includes(service.trim())
      );
      
      if (invalidServices.length > 0) {
        if (this.availableServices.length === 0) {
          warnings.push('Service validation skipped - service templates not loaded');
        } else {
          errors.push(`Invalid services: ${invalidServices.join(', ')}. Available services: ${this.availableServices.join(', ')}`);
        }
      }
    }
  }

  /**
   * Validate province against South African provinces
   */
  private validateProvince(province: SAProvince | undefined, errors: string[]): void {
    if (province && !SA_PROVINCES.includes(province)) {
      errors.push(`Province must be one of: ${SA_PROVINCES.join(', ')}`);
    }
  }

  /**
   * Validate region of operations (multiple provinces)
   */
  private validateRegionOfOperations(regions: SAProvince[] | undefined, errors: string[]): void {
    if (regions && regions.length > 0) {
      const invalidRegions = regions.filter(region => !SA_PROVINCES.includes(region));
      if (invalidRegions.length > 0) {
        errors.push(`Invalid regions of operation: ${invalidRegions.join(', ')}. Must be South African provinces.`);
      }
    }
  }

  /**
   * Validate South African company registration number format
   */
  private validateRegistrationNumber(regNumber: string | undefined, errors: string[], warnings: string[]): void {
    if (regNumber && !VALIDATION_PATTERNS.registrationNumber.test(regNumber)) {
      warnings.push('Registration number format may be invalid (expected format: YYYY/XXXXXX/XX for companies or alphanumeric for other entities)');
    }
  }

  /**
   * Validate South African postal code
   */
  private validatePostalCode(postalCode: string | undefined, errors: string[], warnings: string[]): void {
    if (postalCode && !VALIDATION_PATTERNS.postalCode.test(postalCode)) {
      warnings.push('Postal code format may be invalid (expected 4-digit South African postal code)');
    }
  }

  /**
   * Validate website URL format
   */
  private validateWebsite(website: string | undefined, errors: string[], warnings: string[]): void {
    if (website && !VALIDATION_PATTERNS.website.test(website)) {
      warnings.push('Website URL format may be invalid (expected format: http://... or https://...)');
    }
  }

  /**
   * Validate field lengths against database constraints
   */
  private validateFieldLengths(row: Partial<ContractorImportRow>, errors: string[]): void {
    for (const [field, maxLength] of Object.entries(FIELD_LIMITS)) {
      const value = row[field as keyof ContractorImportRow];
      if (typeof value === 'string' && value.length > maxLength) {
        errors.push(`${this.getFieldDisplayName(field)} is too long (maximum ${maxLength} characters)`);
      }
    }
  }

  /**
   * Validate business logic rules
   */
  private validateBusinessLogic(row: Partial<ContractorImportRow>, errors: string[], warnings: string[]): void {
    // If region of operations is specified, province should also be specified
    if (row.regionOfOperations && row.regionOfOperations.length > 0 && !row.province) {
      warnings.push('Province should be specified when Region of Operations is provided');
    }

    // If province is specified, it should be included in region of operations
    if (row.province && row.regionOfOperations && row.regionOfOperations.length > 0) {
      if (!row.regionOfOperations.includes(row.province)) {
        warnings.push('Province should be included in Region of Operations');
      }
    }

    // Business type specific validations
    if (row.businessType === 'CC' && row.registrationNumber) {
      if (!row.registrationNumber.includes('/23')) {
        warnings.push('CC registration numbers typically end with /23');
      }
    }

    if (row.businessType === 'Pty Ltd' && row.registrationNumber) {
      if (!row.registrationNumber.includes('/07')) {
        warnings.push('Pty Ltd registration numbers typically end with /07');
      }
    }

    // Default country to South Africa if not specified
    if (!row.country && row.province) {
      warnings.push('Country defaulted to South Africa based on province');
    }
  }

  /**
   * Parse CSV services field (comma-separated) into array
   */
  static parseServicesField(servicesString: string | undefined): string[] {
    if (!servicesString || servicesString.trim() === '') {
      return [];
    }
    
    return servicesString
      .split(',')
      .map(service => service.trim())
      .filter(service => service.length > 0);
  }

  /**
   * Parse CSV region of operations field (comma-separated) into provinces array
   */
  static parseRegionsField(regionsString: string | undefined): SAProvince[] {
    if (!regionsString || regionsString.trim() === '') {
      return [];
    }
    
    const regions = regionsString
      .split(',')
      .map(region => region.trim())
      .filter(region => region.length > 0) as SAProvince[];
    
    return regions.filter(region => SA_PROVINCES.includes(region));
  }

  /**
   * Get display name for field
   */
  private getFieldDisplayName(field: string): string {
    const displayNames: Record<string, string> = {
      companyName: 'Company Name',
      tradingName: 'Trading Name',
      contactPerson: 'Contact Person',
      email: 'Email',
      registrationNumber: 'Registration Number',
      phone: 'Phone',
      businessType: 'Business Type',
      services: 'Services',
      website: 'Website',
      address1: 'Address 1',
      address2: 'Address 2',
      suburb: 'Suburb',
      city: 'City',
      province: 'Province',
      postalCode: 'Postal Code',
      country: 'Country',
      regionOfOperations: 'Region of Operations'
    };
    
    return displayNames[field] || field;
  }

  /**
   * Validate business type value and convert to correct case
   */
  static normalizeBusinessType(businessType: string | undefined): BusinessType | undefined {
    if (!businessType) return undefined;
    
    const normalized = businessType.trim();
    
    // Case-insensitive matching
    for (const validType of BUSINESS_TYPES) {
      if (normalized.toLowerCase() === validType.toLowerCase()) {
        return validType;
      }
    }
    
    return undefined;
  }

  /**
   * Validate and normalize province value
   */
  static normalizeProvince(province: string | undefined): SAProvince | undefined {
    if (!province) return undefined;
    
    const normalized = province.trim();
    
    // Case-insensitive matching
    for (const validProvince of SA_PROVINCES) {
      if (normalized.toLowerCase() === validProvince.toLowerCase()) {
        return validProvince;
      }
    }
    
    return undefined;
  }
}