/**
 * Company Information Stage - Onboarding stage definition
 */

import { DocumentType } from '@/types/contractor.types';
import { OnboardingStage } from '../types';

export const companyInfoStage: OnboardingStage = {
  id: 'company_info',
  name: 'Company Information',
  description: 'Complete company registration and contact details',
  required: true,
  completed: false,
  documents: ['company_registration' as DocumentType, 'tax_clearance' as DocumentType],
  checklist: [
    {
      id: 'company_reg',
      description: 'Company registration certificate uploaded',
      completed: false,
      required: true,
      category: 'legal'
    },
    {
      id: 'tax_cert',
      description: 'Tax clearance certificate uploaded',
      completed: false,
      required: true,
      category: 'legal'
    },
    {
      id: 'contact_verified',
      description: 'Contact information verified',
      completed: false,
      required: true,
      category: 'legal'
    }
  ]
};

/**
 * Validate company information stage completion
 */
export function validateCompanyInfoStage(data: any): boolean {
  return !!(
    data.companyRegistration &&
    data.taxClearance &&
    data.contactInfo?.verified
  );
}

/**
 * Get company information requirements
 */
export function getCompanyInfoRequirements(): string[] {
  return [
    'Company registration certificate',
    'Tax clearance certificate', 
    'Verified contact information',
    'Company address confirmation',
    'Legal entity validation'
  ];
}