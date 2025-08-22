/**
 * Contractor Compliance Service - Manages compliance requirements and tracking
 * Handles insurance, certifications, BBBEE, safety ratings, and project-specific compliance
 */

import { db } from '@/lib/neon/db';
import { contractors, contractorDocuments } from '@/lib/neon/schema';
import { eq, and, lt, gte, sql, desc } from 'drizzle-orm';

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
  isExpiringSoon: boolean; // Within 30 days
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
  policyDocument?: string;
  claimsHistory: InsuranceClaim[];
  renewalNotificationSent: boolean;
  complianceRequirement: boolean; // Required for project participation
}

export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  dateOfClaim: Date;
  claimAmount: number;
  status: 'pending' | 'approved' | 'denied' | 'settled';
  description: string;
  impactOnPremium: number;
}

export interface BBBEECertificate {
  id: string;
  contractorId: string;
  bbbeeLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 'non_compliant';
  certificateNumber: string;
  issuingBody: string;
  issueDate: Date;
  expiryDate: Date;
  scorecard: {
    ownership: number;
    management: number;
    skillsDevelopment: number;
    enterpriseSupplierDevelopment: number;
    socioEconomicDevelopment: number;
  };
  verificationStatus: 'verified' | 'pending' | 'rejected';
  documentUrl?: string;
  complianceStatus: 'compliant' | 'non_compliant';
}

export interface SafetyCertification {
  id: string;
  contractorId: string;
  certificationType: 'construction_safety' | 'occupational_health' | 'environmental' | 'electrical_safety';
  certificationBody: string;
  certificateNumber: string;
  issueDate: Date;
  expiryDate: Date;
  safetyRating: number; // 1-10 scale
  incidentHistory: SafetyIncident[];
  complianceRequirement: boolean;
  documentUrl?: string;
}

export interface SafetyIncident {
  id: string;
  incidentDate: Date;
  incidentType: 'injury' | 'near_miss' | 'property_damage' | 'environmental';
  severity: 'minor' | 'moderate' | 'serious' | 'fatal';
  description: string;
  correctiveActions: string;
  reportedToAuthorities: boolean;
}

export interface ProjectComplianceRequirement {
  id: string;
  projectId: string;
  requirementType: 'insurance' | 'certification' | 'bbbee' | 'safety' | 'financial' | 'technical';
  requirement: string;
  isMandatory: boolean;
  minimumStandard: any; // Varies by requirement type
  verificationMethod: 'document_review' | 'site_inspection' | 'third_party_audit';
  renewalFrequency: 'monthly' | 'quarterly' | 'annually' | 'project_duration';
  effectiveDate: Date;
  expiryDate?: Date;
}

export interface ContractorComplianceRecord {
  id: string;
  contractorId: string;
  projectId?: string; // Project-specific compliance
  requirementId: string;
  complianceStatus: 'compliant' | 'non_compliant' | 'pending' | 'under_review';
  verificationDate?: Date;
  verifiedBy?: string;
  expiryDate?: Date;
  nextReviewDate: Date;
  evidence: ComplianceEvidence[];
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
  verificationNotes?: string;
}

export interface CorrectiveAction {
  id: string;
  action: string;
  dueDate: Date;
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedDate?: Date;
  verificationRequired: boolean;
}

class ContractorComplianceService {
  /**
   * Get comprehensive compliance status for a contractor
   */
  async getComplianceStatus(contractorId: string, projectId?: string): Promise<ComplianceStatus> {
    try {
      const [issues, expiringItems] = await Promise.all([
        this.getComplianceIssues(contractorId, projectId),
        this.getExpiringItems(contractorId)
      ]);

      // Determine overall compliance status
      const criticalIssues = issues.filter(issue => issue.severity === 'critical');
      const highPriorityIssues = issues.filter(issue => issue.severity === 'high');
      
      let overall: ComplianceStatus['overall'] = 'compliant';
      
      if (criticalIssues.length > 0) {
        overall = 'non_compliant';
      } else if (highPriorityIssues.length > 0 || expiringItems.some(item => item.isExpired)) {
        overall = 'under_review';
      } else if (expiringItems.some(item => item.isExpiringSoon)) {
        overall = 'pending';
      }

      return {
        overall,
        issues,
        expiringItems,
        lastReviewDate: new Date(), // TODO: Get from database
        nextReviewDate: this.calculateNextReviewDate()
      };
    } catch (error) {
      console.error('Failed to get compliance status:', error);
      throw error;
    }
  }

  /**
   * Get all compliance issues for a contractor
   */
  private async getComplianceIssues(contractorId: string, projectId?: string): Promise<ComplianceIssue[]> {
    const issues: ComplianceIssue[] = [];

    // Check insurance compliance
    const insuranceIssues = await this.checkInsuranceCompliance(contractorId);
    issues.push(...insuranceIssues);

    // Check BBBEE compliance
    const bbbeeIssues = await this.checkBBBEECompliance(contractorId);
    issues.push(...bbbeeIssues);

    // Check safety compliance
    const safetyIssues = await this.checkSafetyCompliance(contractorId);
    issues.push(...safetyIssues);

    // Check financial compliance
    const financialIssues = await this.checkFinancialCompliance(contractorId);
    issues.push(...financialIssues);

    // Check project-specific compliance if projectId provided
    if (projectId) {
      const projectIssues = await this.checkProjectSpecificCompliance(contractorId, projectId);
      issues.push(...projectIssues);
    }

    return issues;
  }

  /**
   * Check insurance policy compliance
   */
  private async checkInsuranceCompliance(contractorId: string): Promise<ComplianceIssue[]> {
    const issues: ComplianceIssue[] = [];
    
    // Required insurance types
    const requiredInsurance = [
      'public_liability',
      'professional_indemnity', 
      'workers_compensation'
    ];

    for (const insuranceType of requiredInsurance) {
      const policy = await this.getActiveInsurancePolicy(contractorId, insuranceType);
      
      if (!policy) {
        issues.push({
          id: `insurance_missing_${insuranceType}`,
          type: 'insurance',
          severity: 'critical',
          description: `Missing required ${insuranceType.replace('_', ' ')} insurance policy`,
          requirementType: `${insuranceType}_insurance`,
          actionRequired: 'Upload valid insurance policy certificate',
          status: 'open',
          createdAt: new Date()
        });
      } else if (this.isPolicyExpiringSoon(policy)) {
        issues.push({
          id: `insurance_expiring_${insuranceType}`,
          type: 'insurance',
          severity: policy.expiryDate < new Date() ? 'critical' : 'high',
          description: `${insuranceType.replace('_', ' ')} insurance policy expires on ${policy.expiryDate.toLocaleDateString()}`,
          requirementType: `${insuranceType}_insurance`,
          dueDate: policy.expiryDate,
          actionRequired: 'Renew insurance policy before expiry',
          status: policy.expiryDate < new Date() ? 'overdue' : 'open',
          createdAt: new Date()
        });
      }
    }

    return issues;
  }

  /**
   * Check BBBEE compliance
   */
  private async checkBBBEECompliance(contractorId: string): Promise<ComplianceIssue[]> {
    const issues: ComplianceIssue[] = [];
    
    const bbbeeStatus = await this.getBBBEEStatus(contractorId);
    
    if (!bbbeeStatus) {
      issues.push({
        id: 'bbbee_missing',
        type: 'bbbee',
        severity: 'high',
        description: 'No BBBEE certificate on file',
        requirementType: 'bbbee_certificate',
        actionRequired: 'Upload valid BBBEE certificate',
        status: 'open',
        createdAt: new Date()
      });
    } else if (bbbeeStatus.expiryDate < new Date()) {
      issues.push({
        id: 'bbbee_expired',
        type: 'bbbee',
        severity: 'critical',
        description: 'BBBEE certificate has expired',
        requirementType: 'bbbee_certificate',
        dueDate: bbbeeStatus.expiryDate,
        actionRequired: 'Renew BBBEE certificate',
        status: 'overdue',
        createdAt: new Date()
      });
    } else if (this.isBBBEEExpiringSoon(bbbeeStatus)) {
      issues.push({
        id: 'bbbee_expiring',
        type: 'bbbee',
        severity: 'medium',
        description: `BBBEE certificate expires on ${bbbeeStatus.expiryDate.toLocaleDateString()}`,
        requirementType: 'bbbee_certificate',
        dueDate: bbbeeStatus.expiryDate,
        actionRequired: 'Schedule BBBEE certificate renewal',
        status: 'open',
        createdAt: new Date()
      });
    }

    return issues;
  }

  /**
   * Check safety compliance
   */
  private async checkSafetyCompliance(contractorId: string): Promise<ComplianceIssue[]> {
    const issues: ComplianceIssue[] = [];
    
    const safetyCertifications = await this.getSafetyCertifications(contractorId);
    const recentIncidents = await this.getRecentSafetyIncidents(contractorId, 12); // Last 12 months

    // Check for required safety certifications
    if (safetyCertifications.length === 0) {
      issues.push({
        id: 'safety_cert_missing',
        type: 'safety',
        severity: 'critical',
        description: 'No safety certifications on file',
        requirementType: 'safety_certification',
        actionRequired: 'Upload safety certifications',
        status: 'open',
        createdAt: new Date()
      });
    }

    // Check for expired certifications
    for (const cert of safetyCertifications) {
      if (cert.expiryDate < new Date()) {
        issues.push({
          id: `safety_cert_expired_${cert.id}`,
          type: 'safety',
          severity: 'critical',
          description: `${cert.certificationType} certification has expired`,
          requirementType: 'safety_certification',
          dueDate: cert.expiryDate,
          actionRequired: 'Renew safety certification',
          status: 'overdue',
          createdAt: new Date()
        });
      }
    }

    // Check safety incident history
    const seriousIncidents = recentIncidents.filter(incident => 
      incident.severity === 'serious' || incident.severity === 'fatal'
    );

    if (seriousIncidents.length > 0) {
      issues.push({
        id: 'safety_incidents',
        type: 'safety',
        severity: 'high',
        description: `${seriousIncidents.length} serious safety incident(s) in the last 12 months`,
        requirementType: 'safety_performance',
        actionRequired: 'Review safety procedures and provide additional training',
        status: 'open',
        createdAt: new Date()
      });
    }

    return issues;
  }

  /**
   * Check financial compliance
   */
  private async checkFinancialCompliance(contractorId: string): Promise<ComplianceIssue[]> {
    const issues: ComplianceIssue[] = [];
    
    // This would integrate with financial systems to check:
    // - Outstanding payments
    // - Credit rating
    // - Financial statements
    // - Tax compliance
    
    // Placeholder for financial compliance checks
    return issues;
  }

  /**
   * Check project-specific compliance requirements
   */
  private async checkProjectSpecificCompliance(contractorId: string, projectId: string): Promise<ComplianceIssue[]> {
    const issues: ComplianceIssue[] = [];
    
    // Get project-specific requirements
    const projectRequirements = await this.getProjectComplianceRequirements(projectId);
    
    for (const requirement of projectRequirements) {
      const complianceRecord = await this.getContractorComplianceRecord(
        contractorId, 
        requirement.id, 
        projectId
      );
      
      if (!complianceRecord || complianceRecord.complianceStatus === 'non_compliant') {
        issues.push({
          id: `project_compliance_${requirement.id}`,
          type: requirement.requirementType as any,
          severity: requirement.isMandatory ? 'critical' : 'medium',
          description: `Project requirement not met: ${requirement.requirement}`,
          requirementType: requirement.requirementType,
          actionRequired: 'Provide evidence of compliance',
          status: 'open',
          createdAt: new Date()
        });
      }
    }

    return issues;
  }

  /**
   * Get expiring items for a contractor
   */
  private async getExpiringItems(contractorId: string): Promise<ExpiringItem[]> {
    const items: ExpiringItem[] = [];
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));

    // Insurance policies
    const insurancePolicies = await this.getInsurancePolicies(contractorId);
    for (const policy of insurancePolicies) {
      if (policy.expiryDate <= thirtyDaysFromNow) {
        items.push({
          id: `insurance_${policy.id}`,
          type: 'insurance_policy',
          name: `${policy.policyType} Insurance`,
          expiryDate: policy.expiryDate,
          daysUntilExpiry: Math.ceil((policy.expiryDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)),
          isExpired: policy.expiryDate < today,
          isExpiringSoon: policy.expiryDate <= thirtyDaysFromNow,
          renewalRequired: true,
          documentUrl: policy.policyDocument
        });
      }
    }

    // Safety certifications
    const safetyCerts = await this.getSafetyCertifications(contractorId);
    for (const cert of safetyCerts) {
      if (cert.expiryDate <= thirtyDaysFromNow) {
        items.push({
          id: `safety_${cert.id}`,
          type: 'safety_certificate',
          name: `${cert.certificationType} Certificate`,
          expiryDate: cert.expiryDate,
          daysUntilExpiry: Math.ceil((cert.expiryDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)),
          isExpired: cert.expiryDate < today,
          isExpiringSoon: cert.expiryDate <= thirtyDaysFromNow,
          renewalRequired: true,
          documentUrl: cert.documentUrl
        });
      }
    }

    // BBBEE certificate
    const bbbeeStatus = await this.getBBBEEStatus(contractorId);
    if (bbbeeStatus && bbbeeStatus.expiryDate <= thirtyDaysFromNow) {
      items.push({
        id: `bbbee_${bbbeeStatus.id}`,
        type: 'bbbee_certificate',
        name: 'BBBEE Certificate',
        expiryDate: bbbeeStatus.expiryDate,
        daysUntilExpiry: Math.ceil((bbbeeStatus.expiryDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)),
        isExpired: bbbeeStatus.expiryDate < today,
        isExpiringSoon: bbbeeStatus.expiryDate <= thirtyDaysFromNow,
        renewalRequired: true,
        documentUrl: bbbeeStatus.documentUrl
      });
    }

    return items.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }

  // Helper methods for data retrieval (these would integrate with actual database)
  private async getActiveInsurancePolicy(contractorId: string, policyType: string): Promise<InsurancePolicy | null> {
    // TODO: Implement database query
    return null;
  }

  private async getInsurancePolicies(contractorId: string): Promise<InsurancePolicy[]> {
    // TODO: Implement database query
    return [];
  }

  private async getBBBEEStatus(contractorId: string): Promise<BBBEECertificate | null> {
    // TODO: Implement database query
    return null;
  }

  private async getSafetyCertifications(contractorId: string): Promise<SafetyCertification[]> {
    // TODO: Implement database query
    return [];
  }

  private async getRecentSafetyIncidents(contractorId: string, months: number): Promise<SafetyIncident[]> {
    // TODO: Implement database query
    return [];
  }

  private async getProjectComplianceRequirements(projectId: string): Promise<ProjectComplianceRequirement[]> {
    // TODO: Implement database query
    return [];
  }

  private async getContractorComplianceRecord(
    contractorId: string, 
    requirementId: string, 
    projectId?: string
  ): Promise<ContractorComplianceRecord | null> {
    // TODO: Implement database query
    return null;
  }

  // Helper methods for compliance checking
  private isPolicyExpiringSoon(policy: InsurancePolicy): boolean {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return policy.expiryDate <= thirtyDaysFromNow;
  }

  private isBBBEEExpiringSoon(certificate: BBBEECertificate): boolean {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return certificate.expiryDate <= thirtyDaysFromNow;
  }

  private calculateNextReviewDate(): Date {
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + 30); // 30 days from now
    return nextReview;
  }

  /**
   * Update contractor compliance status
   */
  async updateComplianceRecord(
    contractorId: string,
    requirementId: string,
    status: ContractorComplianceRecord['complianceStatus'],
    evidence?: ComplianceEvidence[],
    projectId?: string
  ): Promise<void> {
    try {
      // TODO: Update database
      console.log('Updating compliance record:', {
        contractorId,
        requirementId,
        status,
        evidence,
        projectId
      });
    } catch (error) {
      console.error('Failed to update compliance record:', error);
      throw error;
    }
  }

  /**
   * Get compliance summary for multiple contractors
   */
  async getComplianceSummary(contractorIds: string[]): Promise<Map<string, ComplianceStatus>> {
    const summaryMap = new Map<string, ComplianceStatus>();
    
    for (const contractorId of contractorIds) {
      try {
        const status = await this.getComplianceStatus(contractorId);
        summaryMap.set(contractorId, status);
      } catch (error) {
        console.error(`Failed to get compliance status for contractor ${contractorId}:`, error);
      }
    }
    
    return summaryMap;
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(contractorId: string, projectId?: string): Promise<any> {
    try {
      const complianceStatus = await this.getComplianceStatus(contractorId, projectId);
      
      return {
        contractorId,
        projectId,
        reportDate: new Date(),
        complianceStatus,
        recommendations: this.generateRecommendations(complianceStatus),
        riskAssessment: this.assessComplianceRisk(complianceStatus)
      };
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
      throw error;
    }
  }

  private generateRecommendations(status: ComplianceStatus): string[] {
    const recommendations: string[] = [];
    
    if (status.overall === 'non_compliant') {
      recommendations.push('Immediately address all critical compliance issues before project continuation');
    }
    
    if (status.expiringItems.length > 0) {
      recommendations.push('Schedule renewal of expiring certificates and policies');
    }
    
    if (status.issues.some(issue => issue.type === 'safety')) {
      recommendations.push('Review and update safety procedures and training programs');
    }
    
    return recommendations;
  }

  private assessComplianceRisk(status: ComplianceStatus): string {
    const criticalIssues = status.issues.filter(issue => issue.severity === 'critical').length;
    const expiredItems = status.expiringItems.filter(item => item.isExpired).length;
    
    if (criticalIssues > 0 || expiredItems > 0) {
      return 'high';
    } else if (status.issues.filter(issue => issue.severity === 'high').length > 0) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}

export const contractorComplianceService = new ContractorComplianceService();