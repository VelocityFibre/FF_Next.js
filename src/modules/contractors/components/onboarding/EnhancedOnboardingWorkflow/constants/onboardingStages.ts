import { DocumentType } from '@/types/contractor.types';
import { OnboardingStage } from '../types/onboarding.types';

export const ONBOARDING_STAGES: OnboardingStage[] = [
  {
    id: 'company_info',
    title: 'Company Information',
    description: 'Basic company registration and legal documents',
    icon: 'Building',
    documents: [
      {
        type: 'company_registration' as DocumentType,
        title: 'Company Registration Certificate',
        description: 'Official company registration document from CIPC',
        required: true
      },
      {
        type: 'vat_certificate' as DocumentType,
        title: 'VAT Registration Certificate',
        description: 'VAT registration certificate from SARS',
        required: false
      },
      {
        type: 'bee_certificate' as DocumentType,
        title: 'BEE Certificate',
        description: 'Valid B-BBEE certificate',
        required: true
      }
    ]
  },
  {
    id: 'financial_info',
    title: 'Financial Documentation',
    description: 'Financial and banking verification documents',
    icon: 'CreditCard',
    documents: [
      {
        type: 'tax_clearance' as DocumentType,
        title: 'Tax Clearance Certificate',
        description: 'Valid tax clearance from SARS',
        required: true
      },
      {
        type: 'bank_statement' as DocumentType,
        title: 'Bank Confirmation Letter',
        description: 'Bank account confirmation on bank letterhead',
        required: true
      },
      {
        type: 'financial_statement' as DocumentType,
        title: 'Financial Statements',
        description: 'Latest audited financial statements',
        required: false
      }
    ]
  },
  {
    id: 'insurance_compliance',
    title: 'Insurance & Compliance',
    description: 'Insurance policies and compliance certificates',
    icon: 'Shield',
    documents: [
      {
        type: 'insurance' as DocumentType,
        title: 'Public Liability Insurance',
        description: 'Valid public liability insurance certificate',
        required: true
      },
      {
        type: 'safety_certificate' as DocumentType,
        title: 'Safety Certificate',
        description: 'Occupational Health and Safety certificate',
        required: true
      }
    ]
  },
  {
    id: 'technical_qualification',
    title: 'Technical Qualifications',
    description: 'Technical certifications and qualifications',
    icon: 'Award',
    documents: [
      {
        type: 'technical_certification' as DocumentType,
        title: 'Technical Certifications',
        description: 'Relevant technical certifications for services offered',
        required: false
      },
      {
        type: 'reference_letter' as DocumentType,
        title: 'Reference Letters',
        description: 'Reference letters from previous clients',
        required: false
      }
    ]
  }
];