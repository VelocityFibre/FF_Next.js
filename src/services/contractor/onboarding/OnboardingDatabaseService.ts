/**
 * Onboarding Database Service
 * Updated to use API endpoints instead of direct database access
 */

import { contractorsApi } from '@/services/api/contractorsApi';
import { log } from '@/lib/logger';

export class OnboardingDatabaseService {
  /**
   * Update contractor status via API
   */
  async updateContractorStatus(
    contractorId: string, 
    status: string, 
    isActive: boolean
  ): Promise<void> {
    try {
      await contractorsApi.updateContractor(contractorId, { 
        status,
        isActive
      });
    } catch (error) {
      log.error('Failed to update contractor status:', { data: error }, 'OnboardingDatabaseService');
      throw error;
    }
  }

  /**
   * Get all active contractor IDs via API
   */
  async getAllActiveContractorIds(): Promise<string[]> {
    try {
      const response = await contractorsApi.getContractors({ 
        isActive: true 
      });
      return (response.data || []).map(c => c.id);
    } catch (error) {
      log.error('Failed to get contractor IDs:', { data: error }, 'OnboardingDatabaseService');
      return [];
    }
  }

  /**
   * Get contractor by ID via API
   */
  async getContractorById(contractorId: string): Promise<any | null> {
    try {
      const response = await contractorsApi.getContractor(contractorId);
      return response.data || null;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      log.error('Failed to get contractor by ID:', { data: error }, 'OnboardingDatabaseService');
      return null;
    }
  }

  /**
   * Get contractors by status via API
   */
  async getContractorsByStatus(status: string): Promise<any[]> {
    try {
      const response = await contractorsApi.getContractors({ status });
      return response.data || [];
    } catch (error) {
      log.error('Failed to get contractors by status:', { data: error }, 'OnboardingDatabaseService');
      return [];
    }
  }

  /**
   * Update contractor onboarding data via API
   */
  async updateOnboardingData(
    contractorId: string, 
    onboardingProgress: number
  ): Promise<void> {
    try {
      await contractorsApi.updateContractor(contractorId, { 
        onboardingProgress 
      });
    } catch (error) {
      log.error('Failed to update onboarding data:', { data: error }, 'OnboardingDatabaseService');
      throw error;
    }
  }

  /**
   * Get contractor onboarding data via API
   */
  async getOnboardingData(contractorId: string): Promise<any | null> {
    try {
      const response = await contractorsApi.getOnboardingStatus(contractorId);
      return response.data || null;
    } catch (error) {
      log.error('Failed to get onboarding data:', { data: error }, 'OnboardingDatabaseService');
      return null;
    }
  }

  /**
   * Log onboarding event via API
   */
  async logOnboardingEvent(
    contractorId: string,
    event: string,
    details: any
  ): Promise<void> {
    try {
      // This would be handled by the onboarding status update
      const onboardingResponse = await contractorsApi.getOnboardingStatus(contractorId);
      if (onboardingResponse.data && onboardingResponse.data.id) {
        await contractorsApi.updateOnboardingStatus(onboardingResponse.data.id, {
          notes: `${event}: ${JSON.stringify(details)}`
        });
      }
    } catch (error) {
      log.error('Failed to log onboarding event:', { data: error }, 'OnboardingDatabaseService');
    }
  }

  /**
   * Get onboarding statistics via API
   */
  async getOnboardingStats(): Promise<{
    total: number;
    notStarted: number;
    inProgress: number;
    completed: number;
    approved: number;
    rejected: number;
  }> {
    try {
      const response = await contractorsApi.getOverallAnalytics();
      const onboardingFunnel = response.data?.onboardingFunnel || [];
      
      // Map the funnel data to our stats format
      const stats = {
        total: 0,
        notStarted: 0,
        inProgress: 0,
        completed: 0,
        approved: 0,
        rejected: 0
      };

      onboardingFunnel.forEach(stage => {
        switch (stage.stage) {
          case 'Started':
            stats.total = stage.count;
            break;
          case 'In Progress':
            stats.inProgress = stage.count;
            break;
          case 'Completed':
            stats.completed = stage.count;
            stats.approved = stage.count; // Assuming completed means approved
            break;
          case 'Rejected':
            stats.rejected = stage.count;
            break;
        }
      });

      // Calculate not started
      const allContractorsResponse = await contractorsApi.getContractors();
      const totalContractors = allContractorsResponse.total || 0;
      stats.notStarted = totalContractors - stats.total;

      return stats;
    } catch (error) {
      log.error('Failed to get onboarding stats:', { data: error }, 'OnboardingDatabaseService');
      return {
        total: 0,
        notStarted: 0,
        inProgress: 0,
        completed: 0,
        approved: 0,
        rejected: 0
      };
    }
  }
}