/**
 * Contractor Statistics for Neon Database
 * Provides summary statistics and analytics for contractors
 */

import { neonDb } from '@/lib/neon/connection';
import { contractors } from '@/lib/neon/schema/contractor.schema';
import { count, eq, and, avg, sum } from 'drizzle-orm';
import type { ContractorAnalytics } from '@/types/contractor.types';

/**
 * Get contractor summary statistics
 */
export async function getContractorSummary() {
  try {
    // Get basic counts
    const totalContractors = await neonDb
      .select({ count: count() })
      .from(contractors);

    const activeContractors = await neonDb
      .select({ count: count() })
      .from(contractors)
      .where(eq(contractors.isActive, true));

    const approvedContractors = await neonDb
      .select({ count: count() })
      .from(contractors)
      .where(and(
        eq(contractors.isActive, true),
        eq(contractors.status, 'approved')
      ));

    const pendingContractors = await neonDb
      .select({ count: count() })
      .from(contractors)
      .where(and(
        eq(contractors.isActive, true),
        eq(contractors.status, 'pending')
      ));

    // Calculate utilization rate (approved / total active)
    const total = activeContractors[0]?.count || 0;
    const approved = approvedContractors[0]?.count || 0;
    const utilizationRate = total > 0 ? Math.round((approved / total) * 100) : 0;

    return {
      totalContractors: totalContractors[0]?.count || 0,
      activeContractors: total,
      approvedContractors: approved,
      pendingContractors: pendingContractors[0]?.count || 0,
      utilizationRate
    };
  } catch (error) {
    console.error('Error getting contractor summary:', error);
    throw new Error('Failed to get contractor summary');
  }
}

/**
 * Get contractor analytics
 */
export async function getContractorAnalytics(): Promise<ContractorAnalytics> {
  try {
    const summary = await getContractorSummary();
    
    // Get RAG distribution
    const ragDistribution = await neonDb
      .select({
        ragOverall: contractors.ragOverall,
        count: count()
      })
      .from(contractors)
      .where(eq(contractors.isActive, true))
      .groupBy(contractors.ragOverall);

    // Get business type distribution
    const businessTypeDistribution = await neonDb
      .select({
        businessType: contractors.businessType,
        count: count()
      })
      .from(contractors)
      .where(eq(contractors.isActive, true))
      .groupBy(contractors.businessType);

    // Get province distribution
    const provinceDistribution = await neonDb
      .select({
        province: contractors.province,
        count: count()
      })
      .from(contractors)
      .where(and(
        eq(contractors.isActive, true),
        // Only count contractors with provinces
      ))
      .groupBy(contractors.province);

    // Get performance averages
    const performanceStats = await neonDb
      .select({
        avgPerformance: avg(contractors.performanceScore),
        avgSafety: avg(contractors.safetyScore),
        avgQuality: avg(contractors.qualityScore),
        avgTimeliness: avg(contractors.timelinessScore)
      })
      .from(contractors)
      .where(eq(contractors.isActive, true));

    // Get project statistics
    const projectStats = await neonDb
      .select({
        totalProjects: sum(contractors.totalProjects),
        completedProjects: sum(contractors.completedProjects),
        activeProjects: sum(contractors.activeProjects)
      })
      .from(contractors)
      .where(eq(contractors.isActive, true));

    return {
      summary,
      ragDistribution: ragDistribution.map(r => ({
        label: r.ragOverall || 'unknown',
        value: r.count,
        color: r.ragOverall === 'green' ? '#10b981' : 
               r.ragOverall === 'amber' ? '#f59e0b' : '#ef4444'
      })),
      businessTypeDistribution: businessTypeDistribution.map(b => ({
        label: b.businessType || 'unknown',
        value: b.count
      })),
      provinceDistribution: provinceDistribution.map(p => ({
        label: p.province || 'unknown',
        value: p.count
      })),
      performanceAverages: {
        performance: performanceStats[0]?.avgPerformance ? 
          Math.round(parseFloat(performanceStats[0].avgPerformance.toString())) : 0,
        safety: performanceStats[0]?.avgSafety ? 
          Math.round(parseFloat(performanceStats[0].avgSafety.toString())) : 0,
        quality: performanceStats[0]?.avgQuality ? 
          Math.round(parseFloat(performanceStats[0].avgQuality.toString())) : 0,
        timeliness: performanceStats[0]?.avgTimeliness ? 
          Math.round(parseFloat(performanceStats[0].avgTimeliness.toString())) : 0
      },
      projectTotals: {
        total: projectStats[0]?.totalProjects ? 
          parseInt(projectStats[0].totalProjects.toString()) : 0,
        completed: projectStats[0]?.completedProjects ? 
          parseInt(projectStats[0].completedProjects.toString()) : 0,
        active: projectStats[0]?.activeProjects ? 
          parseInt(projectStats[0].activeProjects.toString()) : 0
      }
    };
  } catch (error) {
    console.error('Error getting contractor analytics:', error);
    throw new Error('Failed to get contractor analytics');
  }
}

/**
 * Get contractors by status count
 */
export async function getContractorsByStatus() {
  try {
    return await neonDb
      .select({
        status: contractors.status,
        count: count()
      })
      .from(contractors)
      .where(eq(contractors.isActive, true))
      .groupBy(contractors.status);
  } catch (error) {
    console.error('Error getting contractors by status:', error);
    throw new Error('Failed to get contractors by status');
  }
}

/**
 * Get compliance statistics
 */
export async function getComplianceStats() {
  try {
    const compliantCount = await neonDb
      .select({ count: count() })
      .from(contractors)
      .where(and(
        eq(contractors.isActive, true),
        eq(contractors.complianceStatus, 'compliant')
      ));

    const nonCompliantCount = await neonDb
      .select({ count: count() })
      .from(contractors)
      .where(and(
        eq(contractors.isActive, true),
        eq(contractors.complianceStatus, 'non-compliant')
      ));

    const pendingCount = await neonDb
      .select({ count: count() })
      .from(contractors)
      .where(and(
        eq(contractors.isActive, true),
        eq(contractors.complianceStatus, 'pending')
      ));

    const total = compliantCount[0]?.count + nonCompliantCount[0]?.count + pendingCount[0]?.count;
    const complianceRate = total > 0 ? Math.round((compliantCount[0]?.count / total) * 100) : 0;

    return {
      compliant: compliantCount[0]?.count || 0,
      nonCompliant: nonCompliantCount[0]?.count || 0,
      pending: pendingCount[0]?.count || 0,
      complianceRate
    };
  } catch (error) {
    console.error('Error getting compliance stats:', error);
    throw new Error('Failed to get compliance statistics');
  }
}