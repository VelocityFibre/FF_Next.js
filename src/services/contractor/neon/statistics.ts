/**
 * Statistics functions for Contractor API
 * Updated to use API endpoints instead of direct database queries
 */

import { contractorsApi } from '@/services/api/contractorsApi';
import type { ContractorAnalytics } from '@/types/contractor.types';
import { log } from '@/lib/logger';

/**
 * Get contractor summary statistics via API
 */
export async function getContractorSummary(): Promise<ContractorAnalytics> {
  try {
    const response = await contractorsApi.getOverallAnalytics();
    return response.data;
  } catch (error) {
    log.error('Error fetching contractor summary:', { data: error }, 'statistics');
    throw error;
  }
}

/**
 * Get contractor statistics by date range via API
 */
export async function getContractorStatsByDateRange(
  dateFrom: string, 
  dateTo: string
): Promise<ContractorAnalytics> {
  try {
    const response = await contractorsApi.getOverallAnalytics({
      dateFrom,
      dateTo
    });
    return response.data;
  } catch (error) {
    log.error('Error fetching contractor stats by date:', { data: error }, 'statistics');
    throw error;
  }
}

/**
 * Get individual contractor analytics via API
 */
export async function getContractorAnalytics(contractorId: string): Promise<ContractorAnalytics> {
  try {
    const response = await contractorsApi.getContractorAnalytics(contractorId);
    return response.data;
  } catch (error) {
    log.error('Error fetching contractor analytics:', { data: error }, 'statistics');
    throw error;
  }
}

/**
 * Get contractor distribution by a specific field via API
 */
export async function getContractorDistribution(groupBy: string): Promise<any> {
  try {
    const response = await contractorsApi.getOverallAnalytics({ groupBy });
    return response.data.distribution;
  } catch (error) {
    log.error('Error fetching contractor distribution:', { data: error }, 'statistics');
    throw error;
  }
}

/**
 * Get contractor onboarding funnel statistics via API
 */
export async function getOnboardingFunnelStats(): Promise<any> {
  try {
    const response = await contractorsApi.getOverallAnalytics();
    return response.data.onboardingFunnel;
  } catch (error) {
    log.error('Error fetching onboarding funnel stats:', { data: error }, 'statistics');
    throw error;
  }
}

/**
 * Get contractor growth trends via API
 */
export async function getContractorGrowthTrends(): Promise<any> {
  try {
    const response = await contractorsApi.getOverallAnalytics();
    return response.data.growthTrends;
  } catch (error) {
    log.error('Error fetching growth trends:', { data: error }, 'statistics');
    throw error;
  }
}

/**
 * Get top performing contractors via API
 */
export async function getTopPerformingContractors(limit: number = 10): Promise<any[]> {
  try {
    const response = await contractorsApi.getOverallAnalytics();
    return response.data.topPerformers?.slice(0, limit) || [];
  } catch (error) {
    log.error('Error fetching top performers:', { data: error }, 'statistics');
    throw error;
  }
}