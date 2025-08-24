/**
 * Compliance Report Builder
 * Main service for building comprehensive compliance reports
 */

import { ComplianceReport, ComplianceSummaryReport, SupplierDocument, ComplianceStatus } from './report-types';
import { ComplianceChecker } from './compliance-checker';

export class ComplianceReportBuilder {
  /**
   * Generate comprehensive compliance report for a single supplier
   */
  static async generateComplianceReport(supplierId: string): Promise<ComplianceReport> {
    try {
      // Get supplier data
      const supplierCrudService = await import('../../supplier.crud');
      const supplier = await supplierCrudService.SupplierCrudService.getById(supplierId);
      
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      const documents = supplier.documents || [];
      const businessType = supplier.businessType || 'unknown';
      
      // Get current compliance status or calculate it
      let complianceStatus: ComplianceStatus;
      if (supplier.complianceStatus) {
        complianceStatus = supplier.complianceStatus;
      } else {
        // Calculate compliance from documents
        complianceStatus = this.calculateComplianceFromDocuments(documents, businessType);
      }

      // Validate requirements
      const requirements = ComplianceChecker.validateRequirements(businessType, documents);
      const missingDocuments = requirements.missingRequired;

      // Check expiration status
      const expirationInfo = ComplianceChecker.checkDocumentExpiration(documents);
      const expiringDocuments = expirationInfo.filter(info => 
        info.status === 'expired' || (info.status === 'expiring' && info.daysUntilExpiry <= 90)
      );

      // Calculate overall status and score
      const overallStatus = ComplianceChecker.determineOverallStatus(
        complianceStatus,
        missingDocuments,
        expiringDocuments
      );

      const overallScore = ComplianceChecker.calculateComplianceScore(
        requirements.missingRequired.length + documents.length,
        documents.length,
        expirationInfo
      );

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        complianceStatus,
        missingDocuments,
        expiringDocuments,
        businessType
      );

      // Calculate category statuses
      const categoryStatuses = this.calculateCategoryStatuses(complianceStatus, documents);

      // Generate next actions
      const nextActions = this.generateNextActions(
        overallStatus,
        missingDocuments,
        expiringDocuments,
        recommendations
      );

      const report: ComplianceReport = {
        supplierId: supplier.id,
        supplierName: supplier.companyName,
        businessType,
        overallStatus,
        overallScore,
        lastUpdated: complianceStatus.lastUpdated,
        
        totalDocuments: documents.length,
        requiredDocuments: requirements.missingRequired.length + documents.length,
        providedDocuments: documents.length,
        missingDocuments,
        expiringDocuments,
        
        categoryStatuses,
        recommendations,
        nextActions,
        
        reportGeneratedAt: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      };

      return report;
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw new Error(`Failed to generate compliance report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate summary report for multiple suppliers
   */
  static async generateSummaryReport(supplierIds: string[]): Promise<ComplianceSummaryReport> {
    try {
      const supplierCrudService = await import('../../supplier.crud');
      const suppliers = await Promise.all(
        supplierIds.map(id => supplierCrudService.SupplierCrudService.getById(id))
      );

      const validSuppliers = suppliers.filter(s => s !== null);
      const totalSuppliers = validSuppliers.length;

      // Calculate compliance breakdown
      const complianceBreakdown = {
        compliant: 0,
        partial: 0,
        nonCompliant: 0
      };

      let totalScore = 0;
      const businessTypeBreakdown: Record<string, { total: number; compliant: number; averageScore: number }> = {};
      const issueTracker = new Map<string, number>();
      const expirationAlerts = {
        expiredDocuments: 0,
        expiringSoon: 0,
        expiringNextMonth: 0
      };

      // Process each supplier
      for (const supplier of validSuppliers) {
        const documents = supplier.documents || [];
        const businessType = supplier.businessType || 'unknown';
        
        // Calculate compliance status
        const complianceStatus = supplier.complianceStatus || 
          this.calculateComplianceFromDocuments(documents, businessType);

        // Update breakdown
        switch (complianceStatus.overall) {
          case 'compliant':
            complianceBreakdown.compliant++;
            break;
          case 'partial':
            complianceBreakdown.partial++;
            break;
          case 'non-compliant':
            complianceBreakdown.nonCompliant++;
            break;
        }

        totalScore += complianceStatus.score;

        // Business type tracking
        if (!businessTypeBreakdown[businessType]) {
          businessTypeBreakdown[businessType] = { total: 0, compliant: 0, averageScore: 0 };
        }
        businessTypeBreakdown[businessType].total++;
        businessTypeBreakdown[businessType].averageScore += complianceStatus.score;
        
        if (complianceStatus.overall === 'compliant') {
          businessTypeBreakdown[businessType].compliant++;
        }

        // Track issues
        const requirements = ComplianceChecker.validateRequirements(businessType, documents);
        requirements.missingRequired.forEach(missing => {
          issueTracker.set(missing, (issueTracker.get(missing) || 0) + 1);
        });

        // Check expirations
        const expirationInfo = ComplianceChecker.checkDocumentExpiration(documents);
        expirationInfo.forEach(info => {
          if (info.status === 'expired') {
            expirationAlerts.expiredDocuments++;
          } else if (info.daysUntilExpiry <= 30) {
            expirationAlerts.expiringSoon++;
          } else if (info.daysUntilExpiry <= 90) {
            expirationAlerts.expiringNextMonth++;
          }
        });
      }

      // Calculate averages for business types
      Object.values(businessTypeBreakdown).forEach(breakdown => {
        if (breakdown.total > 0) {
          breakdown.averageScore = Math.round((breakdown.averageScore / breakdown.total) * 100) / 100;
        }
      });

      // Get top issues
      const topIssues = Array.from(issueTracker.entries())
        .map(([issue, count]) => ({
          issue,
          affectedSuppliers: count,
          severity: this.determineSeverity(issue, count, totalSuppliers)
        }))
        .sort((a, b) => b.affectedSuppliers - a.affectedSuppliers)
        .slice(0, 10);

      const averageComplianceScore = totalSuppliers > 0 
        ? Math.round((totalScore / totalSuppliers) * 100) / 100 
        : 0;

      return {
        totalSuppliers,
        complianceBreakdown,
        averageComplianceScore,
        topIssues,
        expirationAlerts,
        businessTypeBreakdown,
        reportPeriod: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          endDate: new Date()
        },
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Error generating summary report:', error);
      throw new Error(`Failed to generate summary report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate compliance status from documents
   */
  private static calculateComplianceFromDocuments(
    documents: SupplierDocument[],
    businessType: string
  ): ComplianceStatus {
    const requirements = ComplianceChecker.validateRequirements(businessType, documents);
    const expirationInfo = ComplianceChecker.checkDocumentExpiration(documents);

    const score = ComplianceChecker.calculateComplianceScore(
      requirements.missingRequired.length + documents.length,
      documents.length,
      expirationInfo
    );

    const overallStatus = ComplianceChecker.determineOverallStatus(
      { overall: 'partial', score, lastUpdated: new Date(), categories: {} },
      requirements.missingRequired,
      expirationInfo
    );

    return {
      overall: overallStatus,
      score,
      lastUpdated: new Date(),
      categories: {}, // Would need more detailed category breakdown
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    };
  }

  /**
   * Generate recommendations based on compliance status
   */
  private static generateRecommendations(
    complianceStatus: ComplianceStatus,
    missingDocuments: string[],
    expiringDocuments: Array<{ type: string; expiryDate: Date; daysUntilExpiry: number }>,
    businessType: string
  ): string[] {
    const recommendations: string[] = [];

    // Missing documents recommendations
    if (missingDocuments.length > 0) {
      recommendations.push(`Submit missing required documents: ${missingDocuments.join(', ')}`);
    }

    // Expiring documents recommendations
    const urgentExpiring = expiringDocuments.filter(doc => doc.daysUntilExpiry <= 30);
    if (urgentExpiring.length > 0) {
      recommendations.push(`Urgent: Renew documents expiring within 30 days: ${urgentExpiring.map(d => d.type).join(', ')}`);
    }

    const soonExpiring = expiringDocuments.filter(doc => doc.daysUntilExpiry > 30 && doc.daysUntilExpiry <= 90);
    if (soonExpiring.length > 0) {
      recommendations.push(`Plan renewal for documents expiring in 30-90 days: ${soonExpiring.map(d => d.type).join(', ')}`);
    }

    // Score-based recommendations
    if (complianceStatus.score < 60) {
      recommendations.push('Critical: Compliance score below minimum threshold. Immediate action required.');
    } else if (complianceStatus.score < 80) {
      recommendations.push('Improve compliance score by addressing missing and expiring documents.');
    }

    // Business type specific recommendations
    if (businessType === 'corporation' || businessType === 'pty_ltd') {
      if (missingDocuments.includes('bbbee_certificate')) {
        recommendations.push('Submit valid BBBEE certificate to improve procurement opportunities.');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain current compliance level and monitor document expiration dates.');
    }

    return recommendations;
  }

  /**
   * Calculate category-specific compliance statuses
   */
  private static calculateCategoryStatuses(
    complianceStatus: ComplianceStatus,
    documents: SupplierDocument[]
  ): Record<string, {
    status: 'compliant' | 'partial' | 'non-compliant';
    score: number;
    requiredCount: number;
    providedCount: number;
  }> {
    const categories: Record<string, {
      status: 'compliant' | 'partial' | 'non-compliant';
      score: number;
      requiredCount: number;
      providedCount: number;
    }> = {};

    // Group documents by category
    const categoryGroups = new Map<string, SupplierDocument[]>();
    documents.forEach(doc => {
      const category = doc.category || 'general';
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, []);
      }
      categoryGroups.get(category)!.push(doc);
    });

    // Calculate status for each category
    categoryGroups.forEach((categoryDocs, categoryName) => {
      const requiredCount = categoryDocs.filter(doc => doc.isRequired).length;
      const providedCount = categoryDocs.length;
      const validCount = categoryDocs.filter(doc => doc.status === 'valid').length;

      const completionRate = requiredCount > 0 ? (validCount / requiredCount) * 100 : 100;
      let status: 'compliant' | 'partial' | 'non-compliant' = 'compliant';

      if (completionRate < 60) {
        status = 'non-compliant';
      } else if (completionRate < 90) {
        status = 'partial';
      }

      categories[categoryName] = {
        status,
        score: Math.round(completionRate),
        requiredCount,
        providedCount
      };
    });

    return categories;
  }

  /**
   * Generate next actions based on compliance status
   */
  private static generateNextActions(
    overallStatus: 'compliant' | 'partial' | 'non-compliant',
    missingDocuments: string[],
    expiringDocuments: Array<{ type: string; expiryDate: Date; daysUntilExpiry: number }>,
    recommendations: string[]
  ): string[] {
    const nextActions: string[] = [];

    // Prioritize by urgency
    const expiredDocs = expiringDocuments.filter(doc => doc.daysUntilExpiry < 0);
    const urgentDocs = expiringDocuments.filter(doc => doc.daysUntilExpiry >= 0 && doc.daysUntilExpiry <= 30);

    if (expiredDocs.length > 0) {
      nextActions.push(`URGENT: Replace expired documents: ${expiredDocs.map(d => d.type).join(', ')}`);
    }

    if (urgentDocs.length > 0) {
      nextActions.push(`HIGH PRIORITY: Renew expiring documents: ${urgentDocs.map(d => d.type).join(', ')}`);
    }

    if (missingDocuments.length > 0) {
      nextActions.push(`MEDIUM PRIORITY: Submit missing documents: ${missingDocuments.slice(0, 3).join(', ')}`);
    }

    const soonExpiring = expiringDocuments.filter(doc => doc.daysUntilExpiry > 30 && doc.daysUntilExpiry <= 90);
    if (soonExpiring.length > 0) {
      nextActions.push(`LOW PRIORITY: Plan renewal: ${soonExpiring.map(d => d.type).join(', ')}`);
    }

    if (nextActions.length === 0) {
      nextActions.push('Monitor compliance status and document expiration dates');
    }

    return nextActions;
  }

  /**
   * Determine issue severity based on impact
   */
  private static determineSeverity(
    issue: string,
    affectedCount: number,
    totalSuppliers: number
  ): 'high' | 'medium' | 'low' {
    const impactPercentage = (affectedCount / totalSuppliers) * 100;
    
    // Critical documents
    const criticalDocs = ['tax_certificate', 'insurance_certificate', 'certificate_of_incorporation'];
    if (criticalDocs.includes(issue) && impactPercentage > 20) {
      return 'high';
    }

    if (impactPercentage > 40) {
      return 'high';
    } else if (impactPercentage > 20) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}