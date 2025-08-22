/**
 * BBBEE Service - Manages BBBEE certificates and compliance
 * Following FibreFlow patterns and staying under 250 lines
 */

import { BBBEECertificate } from './complianceTypes';

export const bbbeeService = {
  async getBBBEECertificates(contractorId: string): Promise<BBBEECertificate[]> {
    return [
      {
        id: 'bbbee_001',
        contractorId,
        certificateNumber: 'BBBEE-2024-001234',
        level: 4,
        points: 85.5,
        issueDate: new Date('2024-01-01'),
        expiryDate: new Date('2024-12-31'),
        issuingBody: 'SANAS Accredited Verification Agency',
        verificationStatus: 'verified',
        documentUrl: '/documents/bbbee/certificate_2024.pdf'
      }
    ];
  },

  async addBBBEECertificate(cert: Omit<BBBEECertificate, 'id'>): Promise<BBBEECertificate> {
    const newCert: BBBEECertificate = {
      ...cert,
      id: `bbbee_${Date.now()}`
    };
    return newCert;
  },

  async updateBBBEECertificate(certId: string, updates: Partial<BBBEECertificate>): Promise<BBBEECertificate> {
    const certs = await this.getBBBEECertificates(updates.contractorId || '');
    const cert = certs.find(c => c.id === certId);
    if (!cert) throw new Error('BBBEE certificate not found');
    
    return { ...cert, ...updates };
  },

  async getCurrentBBBEELevel(contractorId: string): Promise<{
    level: number;
    points: number;
    status: 'valid' | 'expired' | 'pending' | 'none';
    expiryDate?: Date;
  }> {
    const certs = await this.getBBBEECertificates(contractorId);
    const currentCert = certs
      .filter(c => c.expiryDate > new Date())
      .sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime())[0];
    
    if (!currentCert) {
      return { level: 8, points: 0, status: 'none' };
    }
    
    const status = currentCert.verificationStatus === 'verified' ? 'valid' : 'pending';
    
    return {
      level: currentCert.level,
      points: currentCert.points,
      status,
      expiryDate: currentCert.expiryDate
    };
  },

  async getExpiringBBBEECerts(contractorId: string, daysAhead: number = 60): Promise<BBBEECertificate[]> {
    const certs = await this.getBBBEECertificates(contractorId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysAhead);
    
    return certs.filter(cert => 
      cert.expiryDate <= cutoffDate &&
      cert.expiryDate >= new Date()
    );
  },

  async validateBBBEERequirements(contractorId: string, projectRequirements: any[]): Promise<{
    isCompliant: boolean;
    currentLevel: number;
    requiredLevel: number;
    meetsRequirement: boolean;
    pointsShortfall?: number;
  }> {
    const currentBBBEE = await this.getCurrentBBBEELevel(contractorId);
    const bbbeeReq = projectRequirements.find(req => req.type === 'bbbee');
    
    if (!bbbeeReq) {
      return {
        isCompliant: true,
        currentLevel: currentBBBEE.level,
        requiredLevel: 8,
        meetsRequirement: true
      };
    }
    
    const requiredLevel = bbbeeReq.minimumLevel || 4;
    const meetsRequirement = currentBBBEE.level <= requiredLevel && currentBBBEE.status === 'valid';
    
    return {
      isCompliant: meetsRequirement,
      currentLevel: currentBBBEE.level,
      requiredLevel,
      meetsRequirement,
      pointsShortfall: meetsRequirement ? undefined : this.calculatePointsNeeded(currentBBBEE.level, requiredLevel)
    };
  },

  calculatePointsNeeded(currentLevel: number, targetLevel: number): number {
    const pointsRequired = {
      1: 100,
      2: 95,
      3: 90,
      4: 80,
      5: 75,
      6: 70,
      7: 55,
      8: 30
    };
    
    return (pointsRequired[targetLevel as keyof typeof pointsRequired] || 0) - 
           (pointsRequired[currentLevel as keyof typeof pointsRequired] || 0);
  },

  async getBBBEEComplianceScore(contractorId: string): Promise<number> {
    const currentBBBEE = await this.getCurrentBBBEELevel(contractorId);
    
    if (currentBBBEE.status === 'none') return 0;
    if (currentBBBEE.status === 'expired') return 10;
    if (currentBBBEE.status === 'pending') return 50;
    
    const levelScores = {
      1: 100,
      2: 90,
      3: 80,
      4: 70,
      5: 60,
      6: 50,
      7: 40,
      8: 30
    };
    
    return levelScores[currentBBBEE.level as keyof typeof levelScores] || 0;
  },

  async generateBBBEEReport(contractorId: string): Promise<{
    currentStatus: any;
    history: BBBEECertificate[];
    trends: {
      levelImprovement: boolean;
      pointsGrowth: number;
      yearsCompliant: number;
    };
    recommendations: string[];
  }> {
    const [currentStatus, certificates] = await Promise.all([
      this.getCurrentBBBEELevel(contractorId),
      this.getBBBEECertificates(contractorId)
    ]);
    
    const sortedCerts = certificates.sort((a, b) => a.issueDate.getTime() - b.issueDate.getTime());
    const levelImprovement = sortedCerts.length > 1 && 
      sortedCerts[sortedCerts.length - 1].level < sortedCerts[0].level;
    
    const pointsGrowth = sortedCerts.length > 1 ? 
      sortedCerts[sortedCerts.length - 1].points - sortedCerts[0].points : 0;
    
    const recommendations: string[] = [];
    if (currentStatus.level > 4) {
      recommendations.push('Consider improving BBBEE level to access more opportunities');
    }
    if (currentStatus.expiryDate && 
        (currentStatus.expiryDate.getTime() - new Date().getTime()) < 60 * 24 * 60 * 60 * 1000) {
      recommendations.push('BBBEE certificate expires within 60 days - arrange renewal');
    }
    
    return {
      currentStatus,
      history: sortedCerts,
      trends: {
        levelImprovement,
        pointsGrowth,
        yearsCompliant: certificates.filter(c => c.verificationStatus === 'verified').length
      },
      recommendations
    };
  }
};
