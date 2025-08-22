/**
 * Contractor Compliance Service - Main aggregator for compliance services
 * Following FibreFlow patterns and staying under 250 lines
 */

import { insuranceService } from './compliance/insuranceService';
import { safetyService } from './compliance/safetyService';
import { bbbeeService } from './compliance/bbbeeService';
import {
  ComplianceStatus,
  ComplianceIssue,
  ExpiringItem,
  ProjectComplianceRequirement,
  ContractorComplianceRecord,
  ComplianceAudit,
  ComplianceDashboardData
} from './compliance/complianceTypes';

export * from './compliance/complianceTypes';

export const contractorComplianceService = {
  async getComplianceStatus(contractorId: string, projectId?: string): Promise<ComplianceStatus> {
    const [insurancePolicies, safetyCerts, bbbeeStatus] = await Promise.all([
      insuranceService.getInsurancePolicies(contractorId),
      safetyService.getSafetyCertifications(contractorId),
      bbbeeService.getCurrentBBBEELevel(contractorId)
    ]);

    const issues: ComplianceIssue[] = [];
    const expiringItems: ExpiringItem[] = [];

    // Check insurance expiries
    const expiringInsurance = await insuranceService.getExpiringPolicies(contractorId, 30);
    expiringInsurance.forEach(policy => {
      const daysUntilExpiry = Math.floor((policy.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      expiringItems.push({
        id: policy.id,
        type: 'insurance_policy',
        name: `${policy.policyType} - ${policy.policyNumber}`,
        expiryDate: policy.expiryDate,
        daysUntilExpiry,
        isExpired: daysUntilExpiry < 0,
        isExpiringSoon: daysUntilExpiry <= 30 && daysUntilExpiry >= 0,
        renewalRequired: true,
        documentUrl: policy.documentUrl
      });

      if (daysUntilExpiry <= 7) {
        issues.push({
          id: `issue_insurance_${policy.id}`,
          type: 'insurance',
          severity: daysUntilExpiry < 0 ? 'critical' : 'high',
          description: `${policy.policyType} policy ${daysUntilExpiry < 0 ? 'expired' : 'expires soon'}`,
          requirementType: policy.policyType,
          dueDate: policy.expiryDate,
          actionRequired: 'Renew insurance policy immediately',
          status: 'open',
          createdAt: new Date()
        });
      }
    });

    // Check safety certifications
    const expiringSafety = await safetyService.getExpiringSafetyCerts(contractorId, 30);
    expiringSafety.forEach(cert => {
      const daysUntilExpiry = Math.floor((cert.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      expiringItems.push({
        id: cert.id,
        type: 'safety_certificate',
        name: `${cert.certificationType} - ${cert.certificateNumber}`,
        expiryDate: cert.expiryDate,
        daysUntilExpiry,
        isExpired: daysUntilExpiry < 0,
        isExpiringSoon: daysUntilExpiry <= 30 && daysUntilExpiry >= 0,
        renewalRequired: true,
        documentUrl: cert.documentUrl
      });
    });

    // Check BBBEE status
    if (bbbeeStatus.status === 'expired') {
      issues.push({
        id: 'issue_bbbee_expired',
        type: 'bbbee',
        severity: 'high',
        description: 'BBBEE certificate has expired',
        requirementType: 'bbbee_certificate',
        actionRequired: 'Renew BBBEE certificate',
        status: 'open',
        createdAt: new Date()
      });
    }

    // Determine overall compliance status
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const highIssues = issues.filter(i => i.severity === 'high');
    
    let overallStatus: ComplianceStatus['overall'];
    if (criticalIssues.length > 0) {
      overallStatus = 'non_compliant';
    } else if (highIssues.length > 0) {
      overallStatus = 'pending';
    } else if (issues.length > 0) {
      overallStatus = 'under_review';
    } else {
      overallStatus = 'compliant';
    }

    return {
      overall: overallStatus,
      issues,
      expiringItems,
      lastReviewDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)  // 30 days from now
    };
  },

  async getProjectRequirements(projectId: string): Promise<ProjectComplianceRequirement[]> {
    // Mock project-specific requirements
    return [
      {
        id: 'req_001',
        projectId,
        requirementType: 'insurance',
        requirement: 'Public Liability Insurance minimum R10 million',
        isMandatory: true,
        minimumStandard: { amount: 10000000, currency: 'ZAR' },
        verificationMethod: 'document_review',
        renewalFrequency: 'annually',
        effectiveDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'req_002',
        projectId,
        requirementType: 'safety',
        requirement: 'Construction Safety Certificate',
        isMandatory: true,
        minimumStandard: { validCertification: true },
        verificationMethod: 'document_review',
        renewalFrequency: 'annually',
        effectiveDate: new Date()
      },
      {
        id: 'req_003',
        projectId,
        requirementType: 'bbbee',
        requirement: 'BBBEE Level 4 or better',
        isMandatory: false,
        minimumStandard: { level: 4 },
        verificationMethod: 'document_review',
        renewalFrequency: 'annually',
        effectiveDate: new Date()
      }
    ];
  },

  async getContractorComplianceRecords(projectId: string, contractorId: string): Promise<ContractorComplianceRecord[]> {
    const requirements = await this.getProjectRequirements(projectId);
    
    return requirements.map(req => ({
      id: `record_${req.id}`,
      contractorId,
      projectId,
      requirementId: req.id,
      complianceStatus: Math.random() > 0.3 ? 'compliant' : 'pending',
      verificationDate: Math.random() > 0.5 ? new Date() : undefined,
      verifiedBy: Math.random() > 0.5 ? 'admin@fibreflow.com' : undefined,
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      evidence: req.requirementType === 'insurance' ? [{
        id: 'evidence_001',
        documentType: 'Insurance Certificate',
        documentUrl: '/documents/insurance_cert.pdf',
        uploadedDate: new Date(),
        verificationStatus: 'verified'
      }] : [],
      riskLevel: req.isMandatory ? 'high' : 'medium'
    }));
  },

  async getDashboardData(contractorId: string, projectId?: string): Promise<ComplianceDashboardData> {
    const [complianceStatus, upcomingRenewals] = await Promise.all([
      this.getComplianceStatus(contractorId, projectId),
      this.getUpcomingRenewals(contractorId, 60)
    ]);

    const criticalIssues = complianceStatus.issues.filter(issue => issue.severity === 'critical');

    return {
      contractorId,
      projectId,
      complianceStatus,
      upcomingRenewals,
      criticalIssues,
      recentAudits: [], // Mock empty for now
      performanceMetrics: {
        complianceScore: await this.calculateComplianceScore(contractorId),
        trendsLast12Months: [85, 87, 82, 89, 91, 88, 90, 92, 89, 87, 90, 93],
        averageResolutionTime: 5.2,
        recurringIssues: 2
      }
    };
  },

  async getUpcomingRenewals(contractorId: string, daysAhead: number): Promise<ExpiringItem[]> {
    const [expiringInsurance, expiringSafety, expiringBBBEE] = await Promise.all([
      insuranceService.getExpiringPolicies(contractorId, daysAhead),
      safetyService.getExpiringSafetyCerts(contractorId, daysAhead),
      bbbeeService.getExpiringBBBEECerts(contractorId, daysAhead)
    ]);

    const renewals: ExpiringItem[] = [];

    // Add insurance renewals
    expiringInsurance.forEach(policy => {
      const daysUntilExpiry = Math.floor((policy.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      renewals.push({
        id: policy.id,
        type: 'insurance_policy',
        name: `${policy.policyType} - ${policy.insurer}`,
        expiryDate: policy.expiryDate,
        daysUntilExpiry,
        isExpired: daysUntilExpiry < 0,
        isExpiringSoon: daysUntilExpiry <= 30,
        renewalRequired: true,
        documentUrl: policy.documentUrl
      });
    });

    // Add safety renewals
    expiringSafety.forEach(cert => {
      const daysUntilExpiry = Math.floor((cert.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      renewals.push({
        id: cert.id,
        type: 'safety_certificate',
        name: `${cert.certificationType} - ${cert.issuingBody}`,
        expiryDate: cert.expiryDate,
        daysUntilExpiry,
        isExpired: daysUntilExpiry < 0,
        isExpiringSoon: daysUntilExpiry <= 30,
        renewalRequired: true,
        documentUrl: cert.documentUrl
      });
    });

    return renewals.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  },

  async calculateComplianceScore(contractorId: string): Promise<number> {
    const [insuranceScore, safetyScore, bbbeeScore] = await Promise.all([
      this.calculateInsuranceScore(contractorId),
      safetyService.getSafetyComplianceScore(contractorId),
      bbbeeService.getBBBEEComplianceScore(contractorId)
    ]);

    return Math.round((insuranceScore + safetyScore + bbbeeScore) / 3);
  },

  async calculateInsuranceScore(contractorId: string): Promise<number> {
    const policies = await insuranceService.getInsurancePolicies(contractorId);
    const activePolicies = policies.filter(p => p.isActive && p.expiryDate > new Date());
    const verifiedPolicies = activePolicies.filter(p => p.verificationStatus === 'verified');
    
    if (policies.length === 0) return 0;
    
    return Math.round((verifiedPolicies.length / policies.length) * 100);
  }
};