export interface Contractor {
  id: string;
  companyName: string;
  registrationNumber: string;
  vatNumber?: string;
  contactPerson: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address: Address;
  status: ContractorStatus;
  ragScore: RAGScore;
  onboardingStatus: OnboardingStatus;
  documents: ContractorDocument[];
  certifications: Certification[];
  insurances: Insurance[];
  bankDetails?: BankDetails;
  subcontractors: Subcontractor[];
  projects: string[];
  complianceStatus: ComplianceStatus;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
}

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export type ContractorStatus = 
  | 'pending_onboarding'
  | 'onboarding_in_progress'
  | 'pending_approval'
  | 'approved'
  | 'suspended'
  | 'blacklisted';

export interface RAGScore {
  overall: 'red' | 'amber' | 'green';
  financial: 'red' | 'amber' | 'green';
  compliance: 'red' | 'amber' | 'green';
  performance: 'red' | 'amber' | 'green';
  safety: 'red' | 'amber' | 'green';
  lastUpdated: Date;
  details: {
    category: string;
    score: number;
    maxScore: number;
    status: 'red' | 'amber' | 'green';
    issues: string[];
  }[];
}

export interface OnboardingStatus {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  pendingSteps: string[];
  startDate: Date;
  lastActivityDate: Date;
  estimatedCompletionDate?: Date;
}

export interface ContractorDocument {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  uploadedAt: Date;
  expiryDate?: Date;
  status: 'valid' | 'expired' | 'expiring_soon' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: Date;
  rejectionReason?: string;
}

export type DocumentType = 
  | 'company_registration'
  | 'vat_certificate'
  | 'tax_clearance'
  | 'bee_certificate'
  | 'bank_confirmation'
  | 'insurance_policy'
  | 'safety_file'
  | 'quality_certification'
  | 'other';

export interface Certification {
  id: string;
  name: string;
  issuingBody: string;
  certificateNumber: string;
  issueDate: Date;
  expiryDate: Date;
  documentId?: string;
  status: 'valid' | 'expired' | 'expiring_soon';
}

export interface Insurance {
  id: string;
  type: 'public_liability' | 'professional_indemnity' | 'vehicle' | 'equipment' | 'other';
  provider: string;
  policyNumber: string;
  coverAmount: number;
  startDate: Date;
  expiryDate: Date;
  documentId?: string;
  status: 'valid' | 'expired' | 'expiring_soon';
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  accountType: 'current' | 'savings';
  verified: boolean;
  verifiedAt?: Date;
}

export interface Subcontractor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  specialization: string;
  ragScore: 'red' | 'amber' | 'green';
  status: 'active' | 'inactive' | 'suspended';
  documents: ContractorDocument[];
}

export interface ComplianceStatus {
  isCompliant: boolean;
  lastAuditDate?: Date;
  nextAuditDate?: Date;
  outstandingIssues: ComplianceIssue[];
  completedRequirements: string[];
  pendingRequirements: string[];
}

export interface ComplianceIssue {
  id: string;
  category: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  dueDate: Date;
  status: 'open' | 'in_progress' | 'resolved';
  assignedTo?: string;
}

export interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  order: number;
  required: boolean;
  completed: boolean;
  completedAt?: Date;
  fields: OnboardingField[];
  documents: string[];
  validations: ValidationRule[];
}

export interface OnboardingField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'date' | 'select' | 'checkbox' | 'file';
  required: boolean;
  value?: any;
  options?: { label: string; value: string }[];
  validation?: ValidationRule;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface ApprovalWorkflow {
  id: string;
  contractorId: string;
  type: 'onboarding' | 'document' | 'compliance' | 'payment';
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  currentLevel: number;
  totalLevels: number;
  approvals: ApprovalLevel[];
  createdAt: Date;
  completedAt?: Date;
}

export interface ApprovalLevel {
  level: number;
  role: string;
  approver?: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approvedAt?: Date;
  escalatedTo?: string;
  escalatedAt?: Date;
}