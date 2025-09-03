/**
 * Client Analytics Operations (Neon)
 */

import { analyticsService } from '@/services/analytics/analyticsService';

/**
 * Get client analytics
 */
export async function getClientAnalytics(clientId?: string) {
  return await analyticsService.getClientAnalytics(clientId);
}

/**
 * Get top clients
 */
export async function getTopClients(limit: number = 10) {
  return await analyticsService.getTopClients(limit);
}

/**
 * Sync client data to analytics database
 */
export async function syncClientToAnalytics(_clientId: string, _clientData: any): Promise<void> {
  try {
    // const _analyticsData: NewClientAnalytics = {
    //   clientId,
    //   clientName: clientData.name || 'Unknown Client',
    //   totalProjects: 0, // Would be calculated from projects
    //   activeProjects: 0, // Would be calculated from projects
    //   completedProjects: 0, // Would be calculated from projects
    //   totalRevenue: '0', // Would be calculated from transactions
    //   outstandingBalance: clientData.currentBalance?.toString() || '0',
    //   averageProjectValue: '0', // Would be calculated
    //   paymentScore: '100', // Default score
    //   clientCategory: clientData.category || 'Regular',
    //   lifetimeValue: '0', // Would be calculated
    // };

    // TODO: Implement actual client analytics sync
    
  } catch (error) {
    // Silent fail for analytics sync
  }
}