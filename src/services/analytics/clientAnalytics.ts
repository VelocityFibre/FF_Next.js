/**
 * Client Analytics Service
 * Handles client performance metrics and revenue analysis
 */

import { neonDb } from '@/lib/neon/connection';
import { clientAnalytics } from '@/lib/neon/schema';
import { eq, desc } from 'drizzle-orm';
import type { ClientAnalyticsData } from './types';

export class ClientAnalyticsService {
  /**
   * Get client performance metrics
   */
  async getClientAnalytics(clientId?: string): Promise<ClientAnalyticsData | ClientAnalyticsData[]> {
    try {
      const baseQuery = neonDb
        .select({
          clientId: clientAnalytics.clientId,
          clientName: clientAnalytics.clientName,
          totalRevenue: clientAnalytics.totalRevenue,
          totalProjects: clientAnalytics.totalProjects,
          lifetimeValue: clientAnalytics.lifetimeValue,
          paymentScore: clientAnalytics.paymentScore,
        })
        .from(clientAnalytics)
        .orderBy(desc(clientAnalytics.lifetimeValue));

      if (clientId) {
        const result = await baseQuery.where(eq(clientAnalytics.clientId, clientId));
        // Map to ensure types match
        if (result[0]) {
          return {
            clientId: result[0].clientId,
            clientName: result[0].clientName,
            totalRevenue: Number(result[0].totalRevenue || 0),
            totalProjects: result[0].totalProjects || 0,
            lifetimeValue: Number(result[0].lifetimeValue || 0),
            paymentScore: Number(result[0].paymentScore || 0)
          };
        }
        throw new Error('Client not found');
      }

      const results = await baseQuery;
      return results.map(row => ({
        clientId: row.clientId,
        clientName: row.clientName,
        totalRevenue: Number(row.totalRevenue || 0),
        totalProjects: row.totalProjects || 0,
        lifetimeValue: Number(row.lifetimeValue || 0),
        paymentScore: Number(row.paymentScore || 0)
      }));
    } catch (error) {
      console.error('Failed to get client analytics:', error);
      throw error;
    }
  }

  /**
   * Get top clients by revenue
   */
  async getTopClients(limit: number = 10): Promise<ClientAnalyticsData[]> {
    try {
      const results = await neonDb
        .select({
          clientId: clientAnalytics.clientId,
          clientName: clientAnalytics.clientName,
          totalRevenue: clientAnalytics.totalRevenue,
          totalProjects: clientAnalytics.totalProjects,
          lifetimeValue: clientAnalytics.lifetimeValue,
          paymentScore: clientAnalytics.paymentScore,
        })
        .from(clientAnalytics)
        .orderBy(desc(clientAnalytics.totalRevenue))
        .limit(limit);
      
      return results.map(row => ({
        clientId: row.clientId,
        clientName: row.clientName,
        totalRevenue: Number(row.totalRevenue || 0),
        totalProjects: row.totalProjects || 0,
        lifetimeValue: Number(row.lifetimeValue || 0),
        paymentScore: Number(row.paymentScore || 0)
      }));
    } catch (error) {
      console.error('Failed to get top clients:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const clientAnalyticsService = new ClientAnalyticsService();