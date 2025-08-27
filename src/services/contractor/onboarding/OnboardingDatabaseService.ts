/**
 * Onboarding Database Service
 * Handles all database operations for onboarding
 */

import { db } from '@/lib/neon/connection';
import { contractors } from '@/lib/neon/schema';
import { eq } from 'drizzle-orm';
import { log } from '@/lib/logger';

export class OnboardingDatabaseService {
  /**
   * Update contractor status in database
   */
  async updateContractorStatus(
    contractorId: string, 
    status: string, 
    isActive: boolean
  ): Promise<void> {
    try {
      await db
        .update(contractors)
        .set({ 
          status,
          isActive,
          updatedAt: new Date()
        })
        .where(eq(contractors.id, contractorId));
    } catch (error) {
      log.error('Failed to update contractor status:', { data: error }, 'OnboardingDatabaseService');
      throw error;
    }
  }

  /**
   * Get all active contractor IDs
   */
  async getAllActiveContractorIds(): Promise<string[]> {
    try {
      const result = await db
        .select({ id: contractors.id })
        .from(contractors)
        .where(eq(contractors.isActive, true));
      
      return result.map(r => r.id);
    } catch (error) {
      log.error('Failed to get contractor IDs:', { data: error }, 'OnboardingDatabaseService');
      return [];
    }
  }

  /**
   * Get contractor by ID
   */
  async getContractorById(contractorId: string): Promise<any | null> {
    try {
      const result = await db
        .select()
        .from(contractors)
        .where(eq(contractors.id, contractorId))
        .limit(1);
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      log.error('Failed to get contractor by ID:', { data: error }, 'OnboardingDatabaseService');
      return null;
    }
  }

  /**
   * Get contractors by status
   */
  async getContractorsByStatus(status: string): Promise<any[]> {
    try {
      const result = await db
        .select()
        .from(contractors)
        .where(eq(contractors.status, status));
      
      return result;
    } catch (error) {
      log.error('Failed to get contractors by status:', { data: error }, 'OnboardingDatabaseService');
      return [];
    }
  }

  /**
   * Update contractor onboarding data
   */
  async updateOnboardingData(
    contractorId: string, 
    onboardingProgress: number
  ): Promise<void> {
    try {
      await db
        .update(contractors)
        .set({ 
          onboardingProgress,
          updatedAt: new Date()
        })
        .where(eq(contractors.id, contractorId));
    } catch (error) {
      log.error('Failed to update onboarding data:', { data: error }, 'OnboardingDatabaseService');
      throw error;
    }
  }

  /**
   * Get contractor onboarding data
   */
  async getOnboardingData(contractorId: string): Promise<any | null> {
    try {
      const result = await db
        .select({ onboardingProgress: contractors.onboardingProgress })
        .from(contractors)
        .where(eq(contractors.id, contractorId))
        .limit(1);
      
      return result.length > 0 ? result[0].onboardingProgress : null;
    } catch (error) {
      log.error('Failed to get onboarding data:', { data: error }, 'OnboardingDatabaseService');
      return null;
    }
  }

  /**
   * Log onboarding event
   */
  async logOnboardingEvent(
    contractorId: string,
    event: string,
    details: any
  ): Promise<void> {
    try {
      // In production, this would log to an events table

    } catch (error) {
      log.error('Failed to log onboarding event:', { data: error }, 'OnboardingDatabaseService');
    }
  }

  /**
   * Get onboarding statistics from database
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
      // In production, this would aggregate from database
      // For now, return mock data
      return {
        total: 0,
        notStarted: 0,
        inProgress: 0,
        completed: 0,
        approved: 0,
        rejected: 0
      };
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