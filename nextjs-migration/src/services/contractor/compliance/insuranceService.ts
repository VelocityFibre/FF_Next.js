/**
 * Insurance Service - Manages insurance policies and claims
 * Following FibreFlow patterns and staying under 250 lines
 */

// Insurance service - removed unused imports
import { InsurancePolicy, InsuranceClaim } from './complianceTypes';

export const insuranceService = {
  async getInsurancePolicies(contractorId: string): Promise<InsurancePolicy[]> {
    return [
      {
        id: 'policy_001',
        contractorId,
        policyType: 'public_liability',
        policyNumber: 'PL-2024-001234',
        insurer: 'Santam Insurance',
        coverageAmount: 10000000,
        currency: 'ZAR',
        effectiveDate: new Date('2024-01-01'),
        expiryDate: new Date('2024-12-31'),
        isActive: true,
        verificationStatus: 'verified',
        documentUrl: '/documents/insurance/public_liability.pdf'
      },
      {
        id: 'policy_002',
        contractorId,
        policyType: 'professional_indemnity',
        policyNumber: 'PI-2024-005678',
        insurer: 'Old Mutual Insurance',
        coverageAmount: 5000000,
        currency: 'ZAR',
        effectiveDate: new Date('2024-02-01'),
        expiryDate: new Date('2025-01-31'),
        isActive: true,
        verificationStatus: 'pending',
        documentUrl: '/documents/insurance/professional_indemnity.pdf'
      }
    ];
  },

  async addInsurancePolicy(policy: Omit<InsurancePolicy, 'id'>): Promise<InsurancePolicy> {
    const newPolicy: InsurancePolicy = {
      ...policy,
      id: `policy_${Date.now()}`
    };
    return newPolicy;
  },

  async updateInsurancePolicy(policyId: string, updates: Partial<InsurancePolicy>): Promise<InsurancePolicy> {
    const policies = await this.getInsurancePolicies(updates.contractorId || '');
    const policy = policies.find(p => p.id === policyId);
    if (!policy) throw new Error('Policy not found');
    
    return { ...policy, ...updates };
  },

  async getExpiringPolicies(contractorId: string, daysAhead: number = 30): Promise<InsurancePolicy[]> {
    const policies = await this.getInsurancePolicies(contractorId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysAhead);
    
    return policies.filter(policy => 
      policy.isActive && 
      policy.expiryDate <= cutoffDate &&
      policy.expiryDate >= new Date()
    );
  },

  async getInsuranceClaims(policyId: string): Promise<InsuranceClaim[]> {
    return [
      {
        id: 'claim_001',
        policyId,
        claimNumber: 'CLM-2024-001',
        incidentDate: new Date('2024-08-15'),
        claimAmount: 50000,
        status: 'pending',
        description: 'Equipment damage during installation'
      }
    ];
  },

  async addInsuranceClaim(claim: Omit<InsuranceClaim, 'id'>): Promise<InsuranceClaim> {
    const newClaim: InsuranceClaim = {
      ...claim,
      id: `claim_${Date.now()}`
    };
    return newClaim;
  },

  async validatePolicyRequirements(contractorId: string, projectRequirements: any[]): Promise<{
    isCompliant: boolean;
    missingPolicies: string[];
    insufficientCoverage: string[];
  }> {
    const policies = await this.getInsurancePolicies(contractorId);
    const activePolicies = policies.filter(p => p.isActive && p.expiryDate > new Date());
    
    const missingPolicies: string[] = [];
    const insufficientCoverage: string[] = [];
    
    projectRequirements.forEach(req => {
      if (req.type === 'insurance') {
        const policy = activePolicies.find(p => p.policyType === req.policyType);
        
        if (!policy) {
          missingPolicies.push(req.policyType);
        } else if (policy.coverageAmount < req.minimumCoverage) {
          insufficientCoverage.push(req.policyType);
        }
      }
    });
    
    return {
      isCompliant: missingPolicies.length === 0 && insufficientCoverage.length === 0,
      missingPolicies,
      insufficientCoverage
    };
  },

  async getPolicyMetrics(contractorId: string): Promise<{
    totalActivePolicies: number;
    totalCoverageAmount: number;
    expiringIn30Days: number;
    pendingVerification: number;
    openClaims: number;
  }> {
    const policies = await this.getInsurancePolicies(contractorId);
    const activePolicies = policies.filter(p => p.isActive);
    const expiringPolicies = await this.getExpiringPolicies(contractorId, 30);
    
    let totalClaims = 0;
    for (const policy of activePolicies) {
      const claims = await this.getInsuranceClaims(policy.id);
      totalClaims += claims.filter(c => c.status === 'pending').length;
    }
    
    return {
      totalActivePolicies: activePolicies.length,
      totalCoverageAmount: activePolicies.reduce((sum, p) => sum + p.coverageAmount, 0),
      expiringIn30Days: expiringPolicies.length,
      pendingVerification: activePolicies.filter(p => p.verificationStatus === 'pending').length,
      openClaims: totalClaims
    };
  }
};
