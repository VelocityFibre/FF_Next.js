/**
 * Dashboard Data Hook - Centralized data management for all dashboards
 * Provides consistent data loading, error handling, and loading states
 */

import { useState, useEffect, useCallback } from 'react';

// 🟢 WORKING: Core dashboard data types
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  completedTasks: number;
  teamMembers: number;
  openIssues: number;
  polesInstalled: number;
  dropsCompleted: number;
  fiberInstalled: number;
  totalRevenue: number;
  contractorsActive: number;
  contractorsPending: number;
  boqsActive: number;
  rfqsActive: number;
  supplierActive: number;
  reportsGenerated: number;
  performanceScore: number;
  qualityScore: number;
  onTimeDelivery: number;
  budgetUtilization: number;
}

export interface DashboardMetrics {
  stats: DashboardStats;
  trends: Record<string, {
    value: number;
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  }>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// 🟢 WORKING: Main dashboard data hook
export function useDashboardData() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    stats: {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      completedTasks: 0,
      teamMembers: 0,
      openIssues: 0,
      polesInstalled: 0,
      dropsCompleted: 0,
      fiberInstalled: 0,
      totalRevenue: 0,
      contractorsActive: 0,
      contractorsPending: 0,
      boqsActive: 0,
      rfqsActive: 0,
      supplierActive: 0,
      reportsGenerated: 0,
      performanceScore: 0,
      qualityScore: 0,
      onTimeDelivery: 0,
      budgetUtilization: 0,
    },
    trends: {},
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  // 🟢 WORKING: Load dashboard data with error handling
  const loadDashboardData = useCallback(async () => {
    try {
      setMetrics(prev => ({ ...prev, isLoading: true, error: null }));

      // TODO: Replace with real API calls when backend is ready
      // For now, using realistic mock data based on the codebase
      const mockStats: DashboardStats = {
        totalProjects: 24,
        activeProjects: 15,
        completedProjects: 9,
        completedTasks: 342,
        teamMembers: 67,
        openIssues: 12,
        polesInstalled: 2847,
        dropsCompleted: 8934,
        fiberInstalled: 125600,
        totalRevenue: 3840000,
        contractorsActive: 23,
        contractorsPending: 7,
        boqsActive: 18,
        rfqsActive: 11,
        supplierActive: 34,
        reportsGenerated: 89,
        performanceScore: 87.4,
        qualityScore: 92.1,
        onTimeDelivery: 78.3,
        budgetUtilization: 84.7,
      };

      const mockTrends = {
        totalProjects: { value: 24, direction: 'up' as const, percentage: 12.5 },
        activeProjects: { value: 15, direction: 'up' as const, percentage: 8.3 },
        completedTasks: { value: 342, direction: 'up' as const, percentage: 15.2 },
        teamMembers: { value: 67, direction: 'up' as const, percentage: 5.8 },
        openIssues: { value: 12, direction: 'down' as const, percentage: 3.4 },
        polesInstalled: { value: 2847, direction: 'up' as const, percentage: 18.7 },
        dropsCompleted: { value: 8934, direction: 'up' as const, percentage: 22.1 },
        fiberInstalled: { value: 125600, direction: 'up' as const, percentage: 16.8 },
        totalRevenue: { value: 3840000, direction: 'up' as const, percentage: 24.3 },
        contractorsActive: { value: 23, direction: 'stable' as const, percentage: 0 },
        contractorsPending: { value: 7, direction: 'down' as const, percentage: 2.1 },
        performanceScore: { value: 87.4, direction: 'up' as const, percentage: 4.2 },
        qualityScore: { value: 92.1, direction: 'up' as const, percentage: 2.8 },
        onTimeDelivery: { value: 78.3, direction: 'down' as const, percentage: 1.7 },
        budgetUtilization: { value: 84.7, direction: 'stable' as const, percentage: 0.3 },
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setMetrics({
        stats: mockStats,
        trends: mockTrends,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setMetrics(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data',
      }));
    }
  }, []);

  // 🟢 WORKING: Initialize data on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // 🟢 WORKING: Utility functions
  const formatNumber = useCallback((num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }, []);

  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatPercentage = useCallback((value: number): string => {
    return `${value.toFixed(1)}%`;
  }, []);

  const getTrendColor = useCallback((direction: 'up' | 'down' | 'stable'): string => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  }, []);

  const getTrendIcon = useCallback((direction: 'up' | 'down' | 'stable'): string => {
    switch (direction) {
      case 'up': return '↗';
      case 'down': return '↘';
      case 'stable': return '→';
      default: return '→';
    }
  }, []);

  return {
    ...metrics,
    loadDashboardData,
    formatNumber,
    formatCurrency,
    formatPercentage,
    getTrendColor,
    getTrendIcon,
  };
}

// 🟢 WORKING: Specialized hooks for different dashboard types
export function useMainDashboardData() {
  const dashboardData = useDashboardData();

  const mainDashboardStats = {
    activeProjects: dashboardData.stats.activeProjects,
    teamMembers: dashboardData.stats.teamMembers,
    completedTasks: dashboardData.stats.completedTasks,
    openIssues: dashboardData.stats.openIssues,
    polesInstalled: dashboardData.stats.polesInstalled,
    totalRevenue: dashboardData.stats.totalRevenue,
  };

  return {
    ...dashboardData,
    stats: mainDashboardStats,
  };
}

export function useContractorsDashboardData() {
  const dashboardData = useDashboardData();

  const contractorStats = {
    contractorsActive: dashboardData.stats.contractorsActive,
    contractorsPending: dashboardData.stats.contractorsPending,
    totalProjects: dashboardData.stats.totalProjects,
    performanceScore: dashboardData.stats.performanceScore,
    qualityScore: dashboardData.stats.qualityScore,
    onTimeDelivery: dashboardData.stats.onTimeDelivery,
  };

  return {
    ...dashboardData,
    stats: contractorStats,
  };
}

export function useProcurementDashboardData() {
  const dashboardData = useDashboardData();

  const procurementStats = {
    boqsActive: dashboardData.stats.boqsActive,
    rfqsActive: dashboardData.stats.rfqsActive,
    supplierActive: dashboardData.stats.supplierActive,
    budgetUtilization: dashboardData.stats.budgetUtilization,
    totalRevenue: dashboardData.stats.totalRevenue,
    openIssues: dashboardData.stats.openIssues,
  };

  return {
    ...dashboardData,
    stats: procurementStats,
  };
}

export function useKPIDashboardData() {
  const dashboardData = useDashboardData();

  const kpiStats = {
    performanceScore: dashboardData.stats.performanceScore,
    qualityScore: dashboardData.stats.qualityScore,
    onTimeDelivery: dashboardData.stats.onTimeDelivery,
    budgetUtilization: dashboardData.stats.budgetUtilization,
    teamMembers: dashboardData.stats.teamMembers,
    activeProjects: dashboardData.stats.activeProjects,
  };

  return {
    ...dashboardData,
    stats: kpiStats,
  };
}

export function useReportsDashboardData() {
  const dashboardData = useDashboardData();

  const reportsStats = {
    reportsGenerated: dashboardData.stats.reportsGenerated,
    activeProjects: dashboardData.stats.activeProjects,
    totalRevenue: dashboardData.stats.totalRevenue,
    performanceScore: dashboardData.stats.performanceScore,
    completedTasks: dashboardData.stats.completedTasks,
    teamMembers: dashboardData.stats.teamMembers,
  };

  return {
    ...dashboardData,
    stats: reportsStats,
  };
}