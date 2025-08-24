/**
 * Reporting Service
 * Handles executive reports and summary generation
 */

import type { ExecutiveSummary, ProjectOverview, FinancialOverview, KPIDashboardItem, ClientAnalyticsData } from './types';
import { projectAnalyticsService } from './projectAnalytics';
import { financialAnalyticsService } from './financialAnalytics';
import { kpiAnalyticsService } from './kpiAnalytics';
import { clientAnalyticsService } from './clientAnalytics';

export class ReportingService {
  /**
   * Generate executive summary report
   */
  async getExecutiveSummary(dateFrom: Date, dateTo: Date): Promise<ExecutiveSummary> {
    try {
      // Run multiple queries in parallel
      const [
        projectSummary,
        financialSummary,
        kpiSummary,
        topClients
      ] = await Promise.all([
        projectAnalyticsService.getProjectOverview(),
        financialAnalyticsService.getFinancialOverview(),
        kpiAnalyticsService.getKPIDashboard(undefined, dateFrom, dateTo),
        clientAnalyticsService.getTopClients(5)
      ]);

      return {
        projects: projectSummary as ProjectOverview[],
        financial: financialSummary as FinancialOverview[],
        kpis: kpiSummary as KPIDashboardItem[],
        topClients: topClients as ClientAnalyticsData[],
        generatedAt: new Date(),
        period: { from: dateFrom, to: dateTo },
      };
    } catch (error) {
      console.error('Failed to generate executive summary:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const reportingService = new ReportingService();