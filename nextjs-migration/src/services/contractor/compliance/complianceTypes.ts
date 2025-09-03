/**
 * Compliance Types - Type definitions for contractor compliance system
 * Keeping under 250 lines following FibreFlow patterns
 */

export interface ComplianceStatus {
  overall: 'compliant' | 'non_compliant' | 'pending' | 'under_review';
  issues: ComplianceIssue[];
  expiringItems: ExpiringItem[];
  lastReviewDate: Date;
  nextReviewDate: Date;
}

export interface ComplianceIssue {
  id: string;
  type: 'insurance' | 'certification' | 'bbbee' | 'safety' | 'financial' | 'legal';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  requirementType: string;
  dueDate?: Date;
  actionRequired: string;
  assignedTo?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'overdue';
  createdAt: Date;
}

export interface ExpiringItem {
  id: string;
  type: 'insurance_policy' | 'safety_certificate' | 'bbbee_certificate' | 'technical_certification';
  name: string;
  expiryDate: Date;
  daysUntilExpiry: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  renewalRequired: boolean;
  documentUrl?: string;
}

export interface InsurancePolicy {
  id: string;
  contractorId: string;
  policyType: 'public_liability' | 'professional_indemnity' | 'workers_compensation' | 'all_risks' | 'motor';
  policyNumber: string;
  insurer: string;
  coverageAmount: number;
  currency: 'ZAR';
  effectiveDate: Date;
  expiryDate: Date;
  isActive: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  documentUrl?: string;
  claims?: InsuranceClaim[];
}

export interface InsuranceClaim {
  id: string;
  policyId: string;
  claimNumber: string;
  incidentDate: Date;
  claimAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'settled';
  description: string;
}

export interface BBBEECertificate {
  id: string;
  contractorId: string;
  certificateNumber: string;
  level: number;
  points: number;
  issueDate: Date;
  expiryDate: Date;
  issuingBody: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  documentUrl?: string;
}

export interface SafetyCertification {
  id: string;
  contractorId: string;
  certificationType: 'construction_safety' | 'electrical_safety' | 'fall_protection' | 'confined_space';
  certificateNumber: string;
  issuingBody: string;
  issueDate: Date;
  expiryDate: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  documentUrl?: string;
}

export interface SafetyMetrics {
  contractorId: string;
  incidentRate: number;
  daysWithoutIncident: number;
  safetyRating: 'excellent' | 'good' | 'fair' | 'poor';
  lastIncidentDate?: Date;
  totalIncidents: number;
  safetyTrainingHours: number;
  lastUpdate: Date;
}

export interface ProjectComplianceRequirement {
  id: string;
  projectId: string;
  requirementType: 'insurance' | 'safety' | 'bbbee' | 'financial' | 'technical';
  requirement: string;
  isMandatory: boolean;
  minimumStandard: Record<string, any>;
  verificationMethod: 'document_review' | 'audit' | 'inspection' | 'certification';
  renewalFrequency: 'monthly' | 'quarterly' | 'annually' | 'project_basis';
  effectiveDate: Date;
  expiryDate?: Date;
}

export interface ContractorComplianceRecord {
  id: string;
  contractorId: string;
  projectId?: string;
  requirementId: string;
  complianceStatus: 'compliant' | 'non_compliant' | 'pending' | 'under_review';
  verificationDate?: Date;
  verifiedBy?: string;
  nextReviewDate: Date;
  evidence?: ComplianceEvidence[];
  nonComplianceReasons?: string[];
  correctiveActions?: CorrectiveAction[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComplianceEvidence {
  id: string;
  documentType: string;
  documentUrl: string;
  uploadedDate: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface CorrectiveAction {
  id: string;
  action: string;
  assignedTo: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedDate?: Date;
}

export interface ComplianceAudit {
  id: string;
  contractorId: string;
  projectId?: string;
  auditType: 'scheduled' | 'random' | 'incident_based';
  auditDate: Date;
  auditor: string;
  findings: AuditFinding[];
  overallRating: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'unsatisfactory';
  followUpRequired: boolean;
  followUpDate?: Date;
}

export interface AuditFinding {
  id: string;
  category: 'critical' | 'major' | 'minor' | 'observation';
  description: string;
  requirement: string;
  evidence?: string;
  recommendation: string;
  correctiveActionRequired: boolean;
}

export interface ComplianceDashboardData {
  contractorId: string;
  projectId?: string;
  complianceStatus: ComplianceStatus;
  upcomingRenewals: ExpiringItem[];
  criticalIssues: ComplianceIssue[];
  recentAudits: ComplianceAudit[];
  performanceMetrics: {
    complianceScore: number;
    trendsLast12Months: number[];
    averageResolutionTime: number;
    recurringIssues: number;
  };
}

export interface ComplianceNotification {
  id: string;
  contractorId: string;
  type: 'expiry_warning' | 'non_compliance' | 'renewal_required' | 'audit_scheduled';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionRequired: boolean;
  dueDate?: Date;
  isRead: boolean;
  createdAt: Date;
}
