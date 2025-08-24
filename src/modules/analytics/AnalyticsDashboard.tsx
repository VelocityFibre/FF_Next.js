/**
 * Analytics Dashboard Component - Refactored version
 * Main container using split components
 */

import React, { useState } from 'react';
import { Calendar, Filter, Download, RefreshCw } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useAnalyticsData } from './hooks/useAnalyticsData';
import { TimeRange } from './types/analytics.types';
import {
  AnalyticsStatsCards,
  DailyProgressChart,
  ProjectStatusView,
  TeamPerformanceTable,
  KeyInsights
} from './components';

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  
  const {
    dailyProgress,
    projectMetrics,
    teamPerformance,
    isLoading,
    stats,
    formatNumber,
    getStatusColor,
    loadAnalyticsData
  } = useAnalyticsData(timeRange);

  const handleExport = () => {
    // Export functionality - placeholder
    console.log('Exporting analytics data...');
  };

  return (
    <div className="ff-page-container">
      <DashboardHeader 
        title="Analytics Dashboard"
        subtitle="Performance metrics and insights"
        actions={[
          {
            label: 'Export Report',
            icon: Download,
            onClick: handleExport,
            variant: 'secondary'
          },
          {
            label: 'Refresh Data',
            icon: RefreshCw,
            onClick: loadAnalyticsData,
            variant: 'primary'
          }
        ]}
      />

      {/* Filters Bar */}
      <div className="ff-card mb-6">
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Metrics</option>
                <option value="poles">Poles Only</option>
                <option value="drops">Drops Only</option>
                <option value="fiber">Fiber Only</option>
                <option value="revenue">Revenue Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <AnalyticsStatsCards stats={stats} formatNumber={formatNumber} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DailyProgressChart dailyProgress={dailyProgress} isLoading={isLoading} />
        <ProjectStatusView projectMetrics={projectMetrics} getStatusColor={getStatusColor} />
      </div>

      {/* Team Performance Table */}
      <TeamPerformanceTable teamPerformance={teamPerformance} />

      {/* Key Insights */}
      <KeyInsights />
    </div>
  );
};

export default AnalyticsDashboard;