/**
 * Neon Operations for Contractors
 * Handles Neon PostgreSQL operations for contractor analytics
 */

import { neonDb } from '@/lib/neon/connection';
import { contractors } from '@/lib/neon/schema';
import { eq, count, and } from 'drizzle-orm';
import { NewContractor } from '@/lib/neon/schema';
import { ContractorFormData, ContractorAnalytics } from '@/types/contractor.types';
import { log } from '@/lib/logger';

/**
 * Create contractor record in Neon for analytics
 */
export async function createContractorInNeon(id: string, data: ContractorFormData): Promise<void> {
  try {
    const neonData: NewContractor = {
      id: id,
      companyName: data.companyName,
      registrationNumber: data.registrationNumber,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      alternatePhone: data.alternatePhone,
      physicalAddress: data.physicalAddress,
      postalAddress: data.postalAddress,
      city: data.city,
      province: data.province,
      postalCode: data.postalCode,
      businessType: data.businessType,
      industryCategory: data.industryCategory,
      yearsInBusiness: data.yearsInBusiness,
      employeeCount: data.employeeCount,
      annualTurnover: data.annualTurnover?.toString(),
      creditRating: data.creditRating,
      paymentTerms: data.paymentTerms,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      branchCode: data.branchCode,
      status: data.status || 'pending',
      isActive: true,
      complianceStatus: data.complianceStatus || 'pending',
      ragOverall: 'amber',
      ragFinancial: 'amber',
      ragCompliance: 'amber',
      ragPerformance: 'amber',
      ragSafety: 'amber',
      totalProjects: 0,
      completedProjects: 0,
      activeProjects: 0,
      cancelledProjects: 0,
      onboardingProgress: 0,
      documentsExpiring: 0,
      notes: data.notes,
      tags: data.tags || [],
      createdBy: 'current-user',
      updatedBy: 'current-user',
    };
    
    await neonDb.insert(contractors).values(neonData);
  } catch (error) {
    log.warn('Failed to sync contractor to Neon:', { data: error }, 'neonOperations');
    // Don't fail the entire operation for analytics sync issues
    throw error;
  }
}

/**
 * Update contractor record in Neon for analytics
 */
export async function updateContractorInNeon(id: string, data: Partial<ContractorFormData>): Promise<void> {
  try {
    const neonUpdateData: any = {};
    
    // Map Firebase fields to Neon fields
    if (data.companyName) neonUpdateData.companyName = data.companyName;
    if (data.contactPerson) neonUpdateData.contactPerson = data.contactPerson;
    if (data.email) neonUpdateData.email = data.email;
    if (data.phone) neonUpdateData.phone = data.phone;
    if (data.status) neonUpdateData.status = data.status;
    if (data.notes) neonUpdateData.notes = data.notes;
    if (data.tags) neonUpdateData.tags = data.tags;
    
    neonUpdateData.updatedBy = 'current-user';
    neonUpdateData.updatedAt = new Date();
    
    if (Object.keys(neonUpdateData).length > 2) { // Only update if there are fields beyond audit fields
      await neonDb
        .update(contractors)
        .set(neonUpdateData)
        .where(eq(contractors.id, id));
    }
  } catch (error) {
    log.warn('Failed to sync contractor update to Neon:', { data: error }, 'neonOperations');
    throw error;
  }
}

/**
 * Delete contractor from Neon
 */
export async function deleteContractorFromNeon(id: string): Promise<void> {
  try {
    await neonDb
      .delete(contractors)
      .where(eq(contractors.id, id));
  } catch (error) {
    log.warn('Failed to delete contractor from Neon:', { data: error }, 'neonOperations');
    throw error;
  }
}

/**
 * Get contractor analytics from Neon
 */
export async function getContractorAnalytics(): Promise<ContractorAnalytics> {
  try {
    // Get total counts
    const totalResult = await neonDb
      .select({ count: count() })
      .from(contractors);

    const activeResult = await neonDb
      .select({ count: count() })
      .from(contractors)
      .where(eq(contractors.isActive, true));

    const approvedResult = await neonDb
      .select({ count: count() })
      .from(contractors)
      .where(eq(contractors.status, 'approved'));

    const pendingResult = await neonDb
      .select({ count: count() })
      .from(contractors)
      .where(eq(contractors.status, 'pending'));

    const suspendedResult = await neonDb
      .select({ count: count() })
      .from(contractors)
      .where(eq(contractors.status, 'suspended'));

    const blacklistedResult = await neonDb
      .select({ count: count() })
      .from(contractors)
      .where(eq(contractors.status, 'blacklisted'));

    // RAG distribution
    const greenRagResult = await neonDb
      .select({ count: count() })
      .from(contractors)
      .where(eq(contractors.ragOverall, 'green'));

    const amberRagResult = await neonDb
      .select({ count: count() })
      .from(contractors)
      .where(eq(contractors.ragOverall, 'amber'));

    const redRagResult = await neonDb
      .select({ count: count() })
      .from(contractors)
      .where(eq(contractors.ragOverall, 'red'));

    const expiringDocsResult = await neonDb
      .select({ count: count() })
      .from(contractors)
      .where(and(
        eq(contractors.isActive, true)
        // TODO: Add expiring documents condition when field is available
      ));

    return {
      totalContractors: totalResult[0]?.count || 0,
      activeContractors: activeResult[0]?.count || 0,
      approvedContractors: approvedResult[0]?.count || 0,
      pendingApproval: pendingResult[0]?.count || 0,
      suspended: suspendedResult[0]?.count || 0,
      blacklisted: blacklistedResult[0]?.count || 0,
      
      ragDistribution: {
        green: greenRagResult[0]?.count || 0,
        amber: amberRagResult[0]?.count || 0,
        red: redRagResult[0]?.count || 0,
      },
      
      // Placeholder values - would calculate from actual data
      averagePerformanceScore: 0,
      averageSafetyScore: 0,
      averageQualityScore: 0,
      averageTimelinessScore: 0,
      
      totalActiveProjects: 0,
      totalCompletedProjects: 0,
      averageProjectsPerContractor: 0,
      
      documentsExpiringSoon: expiringDocsResult[0]?.count || 0,
      complianceIssues: 0,
      pendingDocuments: 0,
    };
  } catch (error) {
    log.error('Error getting contractor analytics:', { data: error }, 'neonOperations');
    throw new Error('Failed to fetch contractor analytics');
  }
}