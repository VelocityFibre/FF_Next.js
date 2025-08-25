/**
 * Analytics Dashboard Component
 * Displays data from Neon analytics database
 */

import { useState, useEffect } from 'react';
import { analyticsService } from '@/services/analytics';
import { FirebaseToNeonSync } from '@/services/sync';
import { transformKPIDashboardItemsToMetrics } from '@/types/analytics';
import {
  DashboardData,
  DashboardLoadingState,
  DashboardEmptyState,
  DashboardHeader,
  KeyMetricsCards,
  DashboardCharts,
  FinancialOverview,
  TopClientsSection,
  SystemStatus
} from './dashboard';

export function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  // Create sync service instance
  const firebaseToNeonSync = new FirebaseToNeonSync();

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        projectOverview,
        kpiDashboard, 
        financialOverview,
        topClients,
        projectTrends
      ] = await Promise.all([
        analyticsService.getProjectOverview(),
        analyticsService.getKPIDashboard(),
        analyticsService.getFinancialOverview(),
        analyticsService.getTopClients(5),
        analyticsService.getProjectTrends(
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
          new Date()
        )
      ]);

      setData({
        projectOverview: projectOverview[0] || {},
        kpiDashboard: transformKPIDashboardItemsToMetrics(kpiDashboard),
        financialOverview: financialOverview[0] || {},
        topClients,
        projectTrends
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync data from Firebase
  const syncData = async () => {
    try {
      setSyncing(true);
      await firebaseToNeonSync.performFullSync();
      setLastSyncTime(new Date());
      await loadDashboardData();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <DashboardLoadingState loading={loading} />;
  }

  if (!data) {
    return <DashboardEmptyState onSync={syncData} syncing={syncing} />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        lastSyncTime={lastSyncTime}
        onSync={syncData}
        syncing={syncing}
      />

      <KeyMetricsCards data={data} />

      <DashboardCharts
        projectTrends={data.projectTrends}
        kpiDashboard={data.kpiDashboard}
      />

      <FinancialOverview financialOverview={data.financialOverview} />

      <TopClientsSection topClients={data.topClients} />

      <SystemStatus lastSyncTime={lastSyncTime} />
    </div>
  );
}