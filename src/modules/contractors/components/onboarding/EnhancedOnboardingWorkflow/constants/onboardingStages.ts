import { DocumentType } from '@/types/contractor.types';
import { OnboardingStage } from '../types/onboarding.types';

export const ONBOARDING_STAGES: OnboardingStage[] = [
  {
    id: 'company_registration',
    title: 'Company Registration & Legal',
    description: 'Official company registration and directorship documentation',
    icon: 'Building',
    documents: [
      {
        type: 'cipc_registration' as DocumentType,
        title: 'CIPC Registration Certificate',
        description: 'Official CIPC company registration certificate',
        required: true
      },
      {
        type: 'directors_ids' as DocumentType,
        title: 'Directors\' ID Documents',
        description: 'Identity documents of all company directors',
        required: true
      }
    ]
  },
  {
    id: 'tax_compliance',
    title: 'Tax & Revenue Compliance',
    description: 'SARS compliance and tax clearance documentation',
    icon: 'Receipt',
    documents: [
      {
        type: 'vat_certificate' as DocumentType,
        title: 'VAT Registration Certificate',
        description: 'Valid VAT registration certificate from SARS',
        required: true
      },
      {
        type: 'tax_clearance' as DocumentType,
        title: 'Valid SARS Tax Clearance Certificate',
        description: 'Current and valid tax clearance certificate from SARS',
        required: true
      }
    ]
  },
  {
    id: 'transformation_compliance',
    title: 'B-BBEE & Transformation',
    description: 'Broad-Based Black Economic Empowerment compliance',
    icon: 'Award',
    documents: [
      {
        type: 'bee_certificate' as DocumentType,
        title: 'Valid B-BBEE Certificate or Affidavit',
        description: 'Current B-BBEE certificate or sworn affidavit',
        required: true
      }
    ]
  },
  {
    id: 'banking_financial',
    title: 'Banking & Financial Verification',
    description: 'Banking details and financial standing verification',
    icon: 'CreditCard',
    documents: [
      {
        type: 'bank_account_proof' as DocumentType,
        title: 'Proof of Bank Account',
        description: 'Bank stamped letter or official bank statement',
        required: true
      },
      {
        type: 'bank_confirmation_letter' as DocumentType,
        title: 'Signed and Stamped Bank Confirmation Letter',
        description: 'Official bank confirmation letter with signatures and stamps',
        required: true
      }
    ]
  },
  {
    id: 'labour_compliance',
    title: 'Labour & Workers Compensation',
    description: 'COID registration and workers compensation compliance',
    icon: 'Users',
    documents: [
      {
        type: 'coid_registration' as DocumentType,
        title: 'COID Registration & Letter of Good Standing',
        description: 'Compensation for Occupational Injuries and Diseases registration and good standing letter',
        required: true
      }
    ]
  },
  {
    id: 'insurance_coverage',
    title: 'Insurance Coverage',
    description: 'Public liability and professional indemnity insurance',
    icon: 'Shield',
    documents: [
      {
        type: 'public_liability_insurance' as DocumentType,
        title: 'Public Liability Insurance',
        description: 'Valid public liability insurance with coverage amount specified',
        required: true
      }
    ]
  },
  {
    id: 'safety_health_compliance',
    title: 'Safety, Health, Environment & Quality',
    description: 'SHEQ documentation and safety compliance',
    icon: 'HardHat',
    documents: [
      {
        type: 'sheq_documentation' as DocumentType,
        title: 'SHEQ Documentation',
        description: 'SHE Plans, Safety Files, and environmental quality documentation',
        required: true
      }
    ]
  },
  {
    id: 'technical_competency',
    title: 'Technical Competency & Staffing',
    description: 'Key staff qualifications and technical credentials',
    icon: 'GraduationCap',
    documents: [
      {
        type: 'key_staff_credentials' as DocumentType,
        title: 'Key Staff Credentials',
        description: 'CVs of Site Supervisors, Project Managers and key technical staff',
        required: true
      }
    ]
  },
  {
    id: 'project_experience',
    title: 'Past Project Experience',
    description: 'Previous project references and experience verification',
    icon: 'FolderOpen',
    documents: [
      {
        type: 'past_project_experience' as DocumentType,
        title: 'Past Project Experience References',
        description: 'Upload references and documentation of past project experience',
        required: true
      }
    ]
  },
  {
    id: 'legal_agreements',
    title: 'Legal Agreements & Contracts',
    description: 'Master service agreements and confidentiality agreements',
    icon: 'FileText',
    documents: [
      {
        type: 'signed_msa' as DocumentType,
        title: 'Signed Master Services Agreement (MSA)',
        description: 'Completed and signed Master Services Agreement',
        required: true
      },
      {
        type: 'ncnda' as DocumentType,
        title: 'NCNDA',
        description: 'Non-Circumvention, Non-Disclosure Agreement',
        required: true
      }
    ]
  }
];