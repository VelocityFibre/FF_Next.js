/**
 * Safety Service - Manages safety certifications and metrics
 * Following FibreFlow patterns and staying under 250 lines
 */

import { SafetyCertification, SafetyMetrics } from './complianceTypes';

export const safetyService = {
  async getSafetyCertifications(contractorId: string): Promise<SafetyCertification[]> {
    return [
      {
        id: 'safety_001',
        contractorId,
        certificationType: 'construction_safety',
        certificateNumber: 'CS-2024-001234',
        issuingBody: 'South African Institute of Occupational Safety',
        issueDate: new Date('2024-01-15'),
        expiryDate: new Date('2025-01-15'),
        verificationStatus: 'verified',
        documentUrl: '/documents/safety/construction_safety.pdf'
      },
      {
        id: 'safety_002',
        contractorId,
        certificationType: 'electrical_safety',
        certificateNumber: 'ES-2024-005678',
        issuingBody: 'Electrical Contractors Association',
        issueDate: new Date('2024-03-01'),
        expiryDate: new Date('2025-03-01'),
        verificationStatus: 'pending',
        documentUrl: '/documents/safety/electrical_safety.pdf'
      }
    ];
  },

  async getSafetyMetrics(contractorId: string): Promise<SafetyMetrics> {
    return {
      contractorId,
      incidentRate: 0.5,
      daysWithoutIncident: 127,
      safetyRating: 'good',
      lastIncidentDate: new Date('2024-04-10'),
      totalIncidents: 2,
      safetyTrainingHours: 240,
      lastUpdate: new Date()
    };
  },

  async addSafetyCertification(cert: Omit<SafetyCertification, 'id'>): Promise<SafetyCertification> {
    const newCert: SafetyCertification = {
      ...cert,
      id: `safety_${Date.now()}`
    };
    return newCert;
  },

  async updateSafetyMetrics(contractorId: string, metrics: Partial<SafetyMetrics>): Promise<SafetyMetrics> {
    const currentMetrics = await this.getSafetyMetrics(contractorId);
    return {
      ...currentMetrics,
      ...metrics,
      lastUpdate: new Date()
    };
  },

  async getExpiringSafetyCerts(contractorId: string, daysAhead: number = 30): Promise<SafetyCertification[]> {
    const certs = await this.getSafetyCertifications(contractorId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysAhead);
    
    return certs.filter(cert => 
      cert.expiryDate <= cutoffDate &&
      cert.expiryDate >= new Date()
    );
  },

  async validateSafetyRequirements(contractorId: string, projectRequirements: any[]): Promise<{
    isCompliant: boolean;
    missingCertifications: string[];
    expiredCertifications: string[];
  }> {
    const certs = await this.getSafetyCertifications(contractorId);
    const validCerts = certs.filter(c => c.expiryDate > new Date() && c.verificationStatus === 'verified');
    
    const missingCertifications: string[] = [];
    const expiredCertifications: string[] = [];
    
    projectRequirements.forEach(req => {
      if (req.type === 'safety') {
        const cert = validCerts.find(c => c.certificationType === req.certificationType);
        
        if (!cert) {
          const expiredCert = certs.find(c => 
            c.certificationType === req.certificationType && 
            c.expiryDate <= new Date()
          );
          
          if (expiredCert) {
            expiredCertifications.push(req.certificationType);
          } else {
            missingCertifications.push(req.certificationType);
          }
        }
      }
    });
    
    return {
      isCompliant: missingCertifications.length === 0 && expiredCertifications.length === 0,
      missingCertifications,
      expiredCertifications
    };
  },

  async recordSafetyIncident(contractorId: string, incident: {
    date: Date;
    description: string;
    severity: 'minor' | 'moderate' | 'major' | 'critical';
    injuriesReported: boolean;
    correctionActions: string[];
  }): Promise<void> {
    const currentMetrics = await this.getSafetyMetrics(contractorId);
    
    await this.updateSafetyMetrics(contractorId, {
      totalIncidents: currentMetrics.totalIncidents + 1,
      lastIncidentDate: incident.date,
      daysWithoutIncident: 0,
      safetyRating: this.calculateSafetyRating(currentMetrics.totalIncidents + 1, currentMetrics.incidentRate)
    });
  },

  calculateSafetyRating(totalIncidents: number, incidentRate: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (incidentRate <= 0.1 && totalIncidents <= 1) return 'excellent';
    if (incidentRate <= 0.5 && totalIncidents <= 3) return 'good';
    if (incidentRate <= 1.0 && totalIncidents <= 6) return 'fair';
    return 'poor';
  },

  async getSafetyComplianceScore(contractorId: string): Promise<number> {
    const [certs, metrics] = await Promise.all([
      this.getSafetyCertifications(contractorId),
      this.getSafetyMetrics(contractorId)
    ]);
    
    const validCerts = certs.filter(c => c.expiryDate > new Date() && c.verificationStatus === 'verified');
    const certScore = (validCerts.length / Math.max(certs.length, 1)) * 50;
    
    const safetyScore = {
      excellent: 50,
      good: 35,
      fair: 20,
      poor: 0
    }[metrics.safetyRating];
    
    return Math.min(100, certScore + safetyScore);
  }
};
