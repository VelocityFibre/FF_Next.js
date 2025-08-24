/**
 * Onboarding Database Service
 * Handles all database operations for onboarding
 */

import { db } from '@/lib/neon/connection';
import { contractors } from '@/lib/neon/schema';
import { eq } from 'drizzle-orm';

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
      console.error('Failed to update contractor status:', error);
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
      console.error('Failed to get contractor IDs:', error);
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
      console.error('Failed to get contractor by ID:', error);
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
      console.error('Failed to get contractors by status:', error);
      return [];
    }
  }

  /**
   * Update contractor onboarding data
   */
  async updateOnboardingData(
    contractorId: string, 
    onboardingData: any
  ): Promise<void> {
    try {
      await db
        .update(contractors)
        .set({ 
          onboardingData,
          updatedAt: new Date()
        })
        .where(eq(contractors.id, contractorId));
    } catch (error) {
      console.error('Failed to update onboarding data:', error);
      throw error;
    }
  }

  /**
   * Get contractor onboarding data
   */
  async getOnboardingData(contractorId: string): Promise<any | null> {
    try {
      const result = await db
        .select({ onboardingData: contractors.onboardingData })
        .from(contractors)
        .where(eq(contractors.id, contractorId))
        .limit(1);
      
      return result.length > 0 ? result[0].onboardingData : null;
    } catch (error) {
      console.error('Failed to get onboarding data:', error);
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
      console.log(`Onboarding event for ${contractorId}: ${event}`, details);
    } catch (error) {
      console.error('Failed to log onboarding event:', error);
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
      console.error('Failed to get onboarding stats:', error);
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