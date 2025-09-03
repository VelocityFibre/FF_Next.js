/**
 * Compliance Stage - Onboarding stage definition
 */

import { DocumentType } from '@/types/contractor.types';
import { OnboardingStage } from '../types';

export const complianceStage: OnboardingStage = {
  id: 'compliance',
  name: 'Compliance & Certifications',
  description: 'Required compliance documents and certifications',
  required: true,
  completed: false,
  documents: [
    'bbbee_certificate' as DocumentType, 
    'insurance_certificate' as DocumentType,
    'safety_certificate' as DocumentType
  ],
  checklist: [
    {
      id: 'bbbee_cert',
      description: 'BBBEE certificate uploaded and verified',
      completed: false,
      required: true,
      category: 'compliance'
    },
    {
      id: 'insurance_cert',
      description: 'Insurance certificate uploaded and verified',
      completed: false,
      required: true,
      category: 'compliance'
    },
    {
      id: 'safety_cert',
      description: 'Safety certificates uploaded',
      completed: false,
      required: true,
      category: 'compliance'
    },
    {
      id: 'professional_indemnity',
      description: 'Professional indemnity insurance',
      completed: false,
      required: true,
      category: 'compliance'
    },
    {
      id: 'tax_compliance',
      description: 'Tax compliance status verified',
      completed: false,
      required: true,
      category: 'compliance'
    }
  ]
};

/**
 * Validate compliance stage completion
 */
export function validateComplianceStage(data: any): boolean {
  return !!(
    data.bbbeeLevel &&
    data.insuranceCoverage &&
    data.safetyCompliance &&
    data.taxCompliance
  );
}

/**
 * Get compliance requirements
 */
export function getComplianceRequirements(): string[] {
  return [
    'BBBEE Certificate (valid and verified)',
    'Public Liability Insurance (minimum R5M)',
    'Professional Indemnity Insurance (minimum R2M)', 
    'Safety certificates and training records',
    'Tax compliance certificate',
    'Workers compensation insurance',
    'Construction Industry Development Board (CIDB) registration'
  ];
}

/**
 * Calculate compliance score
 */
export function calculateComplianceScore(data: any): number {
  let score = 0;
  const maxScore = 100;
  
  // BBBEE (20 points)
  if (data.bbbeeLevel && data.bbbeeLevel <= 4) {
    score += 20;
  } else if (data.bbbeeLevel && data.bbbeeLevel <= 8) {
    score += 15;
  }
  
  // Insurance (30 points)
  if (data.publicLiabilityInsurance >= 5000000) {
    score += 15;
  }
  if (data.professionalIndemnityInsurance >= 2000000) {
    score += 15;
  }
  
  // Safety (25 points)
  if (data.safetyCompliance?.status === 'compliant') {
    score += 25;
  }
  
  // Tax (15 points)
  if (data.taxCompliance?.status === 'compliant') {
    score += 15;
  }
  
  // CIDB Registration (10 points)
  if (data.cidbRegistration?.status === 'active') {
    score += 10;
  }
  
  return Math.min(score, maxScore);
}

/**
 * Check expiring certificates
 */
export function checkExpiringCertificates(data: any, daysThreshold: number = 30): string[] {
  const expiring: string[] = [];
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
  
  if (data.bbbeeExpiryDate && new Date(data.bbbeeExpiryDate) <= thresholdDate) {
    expiring.push('BBBEE Certificate');
  }
  
  if (data.insuranceExpiryDate && new Date(data.insuranceExpiryDate) <= thresholdDate) {
    expiring.push('Insurance Certificate');
  }
  
  if (data.safetyExpiryDate && new Date(data.safetyExpiryDate) <= thresholdDate) {
    expiring.push('Safety Certificate');
  }
  
  return expiring;
}