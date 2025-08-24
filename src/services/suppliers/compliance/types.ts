/**
 * Supplier Compliance Types and Interfaces
 */

/**
 * Document types for supplier compliance
 */
export interface SupplierDocument {
  id: string;
  name: string;
  type: 'tax_clearance' | 'bee_certificate' | 'insurance' | 'registration' | 'contract' | 'other';
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
  expiryDate?: Date;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  fileSize?: number;
  mimeType?: string;
}

/**
 * Compliance status interface
 */
export interface ComplianceStatus {
  taxCompliant: boolean;
  taxClearanceExpiry?: Date;
  beeCompliant: boolean;
  beeLevel?: number;
  beeCertificateExpiry?: Date;
  insuranceValid: boolean;
  insuranceExpiry?: Date;
  registrationValid: boolean;
  registrationExpiry?: Date;
  documentsComplete: boolean;
  lastComplianceCheck?: Date;
  complianceScore: number; // 0-100
}

/**
 * Compliance requirements by business type
 */
export interface ComplianceRequirements {
  required: string[];
  optional: string[];
  exemptions?: string[];
  specialRules?: Record<string, any>;
}

/**
 * Compliance audit result
 */
export interface ComplianceAuditResult {
  totalSuppliers: number;
  compliantSuppliers: number;
  nonCompliantSuppliers: number;
  pendingDocuments: number;
  expiringDocuments: Array<{
    supplierId: string;
    supplierName: string;
    documentType: string;
    expiryDate: Date;
    daysUntilExpiry: number;
  }>;
  complianceByType: Record<string, {
    compliant: number;
    nonCompliant: number;
    percentage: number;
  }>;
  recommendations: string[];
}

/**
 * Compliance report data
 */
export interface ComplianceReport {
  supplierId: string;
  supplierName: string;
  complianceStatus: ComplianceStatus;
  documents: SupplierDocument[];
  missingDocuments: string[];
  expiringDocuments: Array<{
    type: string;
    expiryDate: Date;
    daysUntilExpiry: number;
  }>;
  recommendations: string[];
  lastUpdated: Date;
  overallStatus: 'compliant' | 'non_compliant' | 'pending' | 'expired';
}

/**
 * Document verification result
 */
export interface DocumentVerificationResult {
  success: boolean;
  documentId: string;
  verifiedBy: string;
  verifiedAt: Date;
  issues?: string[];
  nextReviewDate?: Date;
}