/**
 * Data Mappers for Contractor Neon Operations
 * Maps between database records and TypeScript types
 */

import type { Contractor } from '@/types/contractor.types';
import type { Contractor as NeonContractor } from '@/lib/neon/schema/contractor.schema';

/**
 * Map Neon database record to Contractor type
 */
export function mapToContractor(record: NeonContractor): Contractor {
  return {
    id: record.id,
    companyName: record.companyName,
    tradingName: record.tradingName || undefined,
    registrationNumber: record.registrationNumber,
    
    // Contact Information
    contactPerson: record.contactPerson,
    email: record.email,
    phone: record.phone || undefined,
    alternatePhone: record.alternatePhone || undefined,
    
    // Address
    physicalAddress: record.physicalAddress || undefined,
    postalAddress: record.postalAddress || undefined,
    city: record.city || undefined,
    province: record.province || undefined,
    postalCode: record.postalCode || undefined,
    
    // Business Details
    businessType: record.businessType || undefined,
    industryCategory: record.industryCategory || undefined,
    yearsInBusiness: record.yearsInBusiness || undefined,
    employeeCount: record.employeeCount || undefined,
    
    // Financial Information
    annualTurnover: record.annualTurnover ? parseFloat(record.annualTurnover) : undefined,
    creditRating: record.creditRating || undefined,
    paymentTerms: record.paymentTerms || undefined,
    bankName: record.bankName || undefined,
    accountNumber: record.accountNumber || undefined,
    branchCode: record.branchCode || undefined,
    
    // Status & Compliance
    status: record.status,
    isActive: record.isActive || true,
    complianceStatus: record.complianceStatus || 'pending',
    
    // RAG Scoring
    ragOverall: record.ragOverall || 'amber',
    ragFinancial: record.ragFinancial || 'amber',
    ragCompliance: record.ragCompliance || 'amber',
    ragPerformance: record.ragPerformance || 'amber',
    ragSafety: record.ragSafety || 'amber',
    
    // Performance Metrics
    performanceScore: record.performanceScore ? parseFloat(record.performanceScore.toString()) : undefined,
    safetyScore: record.safetyScore ? parseFloat(record.safetyScore.toString()) : undefined,
    qualityScore: record.qualityScore ? parseFloat(record.qualityScore.toString()) : undefined,
    timelinessScore: record.timelinessScore ? parseFloat(record.timelinessScore.toString()) : undefined,
    
    // Project Statistics
    totalProjects: record.totalProjects || 0,
    completedProjects: record.completedProjects || 0,
    activeProjects: record.activeProjects || 0,
    cancelledProjects: record.cancelledProjects || 0,
    
    // Onboarding
    onboardingProgress: record.onboardingProgress || 0,
    onboardingCompletedAt: record.onboardingCompletedAt || undefined,
    documentsExpiring: record.documentsExpiring || 0,
    
    // Metadata
    notes: record.notes || undefined,
    tags: record.tags ? (Array.isArray(record.tags) ? record.tags : []) : [],
    lastActivity: record.lastActivity || undefined,
    nextReviewDate: record.nextReviewDate || undefined,
    
    // Audit
    createdBy: record.createdBy || undefined,
    updatedBy: record.updatedBy || undefined,
    createdAt: record.createdAt || new Date(),
    updatedAt: record.updatedAt || new Date()
  };
}

/**
 * Map array of Neon records to Contractor array
 */
export function mapToContractors(records: NeonContractor[]): Contractor[] {
  return records.map(mapToContractor);
}

/**
 * Map contractor to dropdown option
 */
export function mapToDropdownOption(record: any): {id: string, label: string} {
  return {
    id: record.id,
    label: record.companyName
  };
}

/**
 * Map Contractor data to Neon insert format
 */
export function mapToNeonContractor(data: any): Partial<NeonContractor> {
  return {
    companyName: data.companyName,
    tradingName: data.tradingName || null,
    registrationNumber: data.registrationNumber,
    
    // Contact Information
    contactPerson: data.contactPerson,
    email: data.email,
    phone: data.phone || null,
    alternatePhone: data.alternatePhone || null,
    
    // Address
    physicalAddress: data.physicalAddress || null,
    postalAddress: data.postalAddress || null,
    city: data.city || null,
    province: data.province || null,
    postalCode: data.postalCode || null,
    
    // Business Details
    businessType: data.businessType || null,
    industryCategory: data.industryCategory || null,
    yearsInBusiness: data.yearsInBusiness || null,
    employeeCount: data.employeeCount || null,
    
    // Financial Information
    annualTurnover: data.annualTurnover ? data.annualTurnover.toString() : null,
    creditRating: data.creditRating || null,
    paymentTerms: data.paymentTerms || null,
    bankName: data.bankName || null,
    accountNumber: data.accountNumber || null,
    branchCode: data.branchCode || null,
    
    // Status & Compliance
    status: data.status || 'pending',
    isActive: data.isActive !== undefined ? data.isActive : true,
    complianceStatus: data.complianceStatus || 'pending',
    
    // RAG Scoring
    ragOverall: data.ragOverall || 'amber',
    ragFinancial: data.ragFinancial || 'amber',
    ragCompliance: data.ragCompliance || 'amber',
    ragPerformance: data.ragPerformance || 'amber',
    ragSafety: data.ragSafety || 'amber',
    
    // Performance Metrics
    performanceScore: data.performanceScore ? data.performanceScore.toString() : null,
    safetyScore: data.safetyScore ? data.safetyScore.toString() : null,
    qualityScore: data.qualityScore ? data.qualityScore.toString() : null,
    timelinessScore: data.timelinessScore ? data.timelinessScore.toString() : null,
    
    // Project Statistics
    totalProjects: data.totalProjects || 0,
    completedProjects: data.completedProjects || 0,
    activeProjects: data.activeProjects || 0,
    cancelledProjects: data.cancelledProjects || 0,
    
    // Onboarding
    onboardingProgress: data.onboardingProgress || 0,
    onboardingCompletedAt: data.onboardingCompletedAt || null,
    documentsExpiring: data.documentsExpiring || 0,
    
    // Metadata
    notes: data.notes || null,
    tags: data.tags || null,
    lastActivity: data.lastActivity || null,
    nextReviewDate: data.nextReviewDate || null,
    
    // Audit
    createdBy: data.createdBy || null,
    updatedBy: data.updatedBy || null,
    updatedAt: new Date()
  };
}