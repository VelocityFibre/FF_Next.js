/**
 * Supplier Compliance Service - Legacy Compatibility Layer
 * @deprecated Use './compliance' modular components instead
 * This file maintains backward compatibility for existing imports
 * New code should import from './compliance' directly
 */

// Re-export everything from the modular structure
export * from './compliance';

// Import services for legacy class compatibility
import { 
  ComplianceCore,
  // DocumentManager, // Removed unused import
  ComplianceAuditService,
  ComplianceReportGenerator,
  RequirementsManager,
  SupplierDocument,
  ComplianceStatus,
  DocumentVerificationResult,
  ComplianceAuditResult,
  ComplianceReport as NewComplianceReport
} from './compliance';

/**
 * Supplier compliance service
 * @deprecated Use ComplianceCore from './compliance' instead
 */
export class SupplierComplianceService {
  /**
   * Update supplier compliance status
   * @deprecated Use ComplianceCore.updateCompliance() instead
   */
  static async updateCompliance(
    supplierId: string,
    complianceUpdates: Partial<ComplianceStatus>
  ): Promise<void> {
    return ComplianceCore.updateCompliance(supplierId, complianceUpdates);
  }

  /**
   * Add document to supplier
   * @deprecated Use ComplianceCore.addDocument() instead
   */
  static async addDocument(
    supplierId: string,
    document: Omit<SupplierDocument, 'id'>
  ): Promise<void> {
    return ComplianceCore.addDocument(supplierId, document);
  }

  /**
   * Remove document from supplier
   * @deprecated Use ComplianceCore.removeDocument() instead
   */
  static async removeDocument(supplierId: string, documentId: string): Promise<void> {
    return ComplianceCore.removeDocument(supplierId, documentId);
  }

  /**
   * Verify document
   * @deprecated Use ComplianceCore.verifyDocument() instead
   */
  static async verifyDocument(
    supplierId: string,
    documentId: string,
    verifiedBy: string,
    issues?: string[]
  ): Promise<DocumentVerificationResult> {
    return ComplianceCore.verifyDocument(supplierId, documentId, verifiedBy, issues);
  }

  /**
   * Perform compliance audit
   * @deprecated Use ComplianceAuditService.performComplianceAudit() instead
   */
  static async performComplianceAudit(): Promise<ComplianceAuditResult> {
    return ComplianceAuditService.performComplianceAudit();
  }

  /**
   * Get compliance requirements
   * @deprecated Use RequirementsManager.getComplianceRequirements() instead
   */
  static getComplianceRequirements(businessType: string) {
    return RequirementsManager.getComplianceRequirements(businessType);
  }

  /**
   * Generate compliance report
   * @deprecated Use ComplianceReportGenerator.generateComplianceReport() instead
   */
  static async generateComplianceReport(supplierId: string): Promise<NewComplianceReport> {
    return ComplianceReportGenerator.generateComplianceReport(supplierId);
  }
}

// Default export for backward compatibility
export { ComplianceCore as default } from './compliance';