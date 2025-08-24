/**
 * Contractor Dashboard Types - Dashboard data structures
 */

import { ContractorAnalytics, ContractorPerformance, ContractorActivity, UrgentAction, Deadline } from './analytics.types';

export interface ContractorDashboardData {
  analytics: ContractorAnalytics;
  topPerformers: ContractorPerformance[];
  recentActivity: ContractorActivity[];
  urgentActions: UrgentAction[];
  upcomingDeadlines: Deadline[];
}