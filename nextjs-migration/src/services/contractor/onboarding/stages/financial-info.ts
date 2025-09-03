/**
 * Financial Information Stage - Onboarding stage definition
 */

import { DocumentType } from '@/types/contractor.types';
import { OnboardingStage } from '../types';

export const financialInfoStage: OnboardingStage = {
  id: 'financial_info',
  name: 'Financial Information',
  description: 'Banking details and financial documentation',
  required: true,
  completed: false,
  documents: ['bank_statements' as DocumentType, 'financial_statements' as DocumentType],
  checklist: [
    {
      id: 'bank_details',
      description: 'Banking details provided',
      completed: false,
      required: true,
      category: 'financial'
    },
    {
      id: 'bank_statements',
      description: '3 months bank statements uploaded',
      completed: false,
      required: true,
      category: 'financial'
    },
    {
      id: 'financial_statements',
      description: 'Latest financial statements uploaded',
      completed: false,
      required: true,
      category: 'financial'
    },
    {
      id: 'credit_check',
      description: 'Credit check completed',
      completed: false,
      required: false,
      category: 'financial'
    }
  ]
};

/**
 * Validate financial information stage completion
 */
export function validateFinancialInfoStage(data: any): boolean {
  return !!(
    data.bankingDetails?.accountNumber &&
    data.bankingDetails?.bankName &&
    data.bankStatements?.length >= 3 &&
    data.financialStatements
  );
}

/**
 * Get financial information requirements
 */
export function getFinancialInfoRequirements(): string[] {
  return [
    'Complete banking details',
    '3 months of bank statements',
    'Latest financial statements',
    'Tax compliance certificate',
    'Credit verification (optional)'
  ];
}

/**
 * Calculate financial health score
 */
export function calculateFinancialHealthScore(data: any): number {
  let score = 0;
  const maxScore = 100;
  
  // Banking details (30 points)
  if (data.bankingDetails?.accountNumber && data.bankingDetails?.bankName) {
    score += 30;
  }
  
  // Bank statements (30 points)
  if (data.bankStatements?.length >= 3) {
    score += 30;
  }
  
  // Financial statements (25 points)
  if (data.financialStatements) {
    score += 25;
  }
  
  // Credit check bonus (15 points)
  if (data.creditCheck?.status === 'approved') {
    score += 15;
  }
  
  return Math.min(score, maxScore);
}