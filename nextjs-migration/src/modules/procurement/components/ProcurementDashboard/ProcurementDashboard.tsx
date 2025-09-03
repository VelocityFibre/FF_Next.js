/**
 * Procurement Dashboard Component - Enhanced with comprehensive metrics
 * Features procurement stats, BOQ/RFQ tracking, and supplier management
 */

import { useState } from 'react';
import { Plus, Download, RefreshCw } from 'lucide-react';
import { ProcurementErrorBoundary } from '../error/ProcurementErrorBoundary';
import { DashboardCards } from './components/DashboardCards';
import { QuickActions } from './components/QuickActions';
import { RecentActivities } from './components/RecentActivities';
import { QuickStats } from './components/QuickStats';
import { ModuleStatusNotice } from './components/ModuleStatusNotice';
import { StatsGrid } from '@/components/dashboard/EnhancedStatCard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useProcurementDashboardData } from '@/hooks/useDashboardData';
import { getProcurementDashboardCards } from '@/config/dashboards/dashboardConfigs';
import { 
  dashboardCards, 
  quickActions, 
  recentActivities, 
  quickStats 
} from './data/dashboardData';

export function ProcurementDashboard() {
  const [activeView, setActiveView] = useState<'overview' | 'detailed'>('overview');
  
  const { 
    stats, 
    trends, 
    isLoading: _isLoading, 
    error: _error, 
    formatNumber, 
    formatCurrency, 
    formatPercentage,
    loadDashboardData 
  } = useProcurementDashboardData();

  // Note: isLoading and error states could be used for loading indicators and error handling
  // but are currently not implemented in the UI layer

  // 🟢 WORKING: Get procurement dashboard cards
  const procurementCards = getProcurementDashboardCards(
    stats, 
    trends, 
    { formatNumber, formatCurrency, formatPercentage }
  );

  return (
    <ProcurementErrorBoundary level="page">
      <div className="ff-page-container">
        <DashboardHeader 
          title="Procurement Dashboard"
          subtitle="Manage procurement processes, BOQs, RFQs and supplier relationships"
          actions={[
            {
              label: 'Create BOQ',
              icon: Plus as React.ComponentType<{ className?: string; }>,
              onClick: () => window.location.href = '/app/procurement/boq/create',
              variant: 'primary'
            },
            {
              label: 'Export Report',
              icon: Download as React.ComponentType<{ className?: string; }>,
              onClick: () => {/* TODO: Implement export procurement report */},
              variant: 'secondary'
            },
            {
              label: 'Refresh Data',
              icon: RefreshCw as React.ComponentType<{ className?: string; }>,
              onClick: loadDashboardData,
              variant: 'secondary'
            }
          ]}
        />

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeView === 'overview' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('detailed')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeView === 'detailed' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Detailed View
            </button>
          </div>
        </div>

        {/* Enhanced Procurement Stats Cards */}
        <StatsGrid 
          cards={procurementCards}
          columns={3}
          className="mb-8"
        />

        {/* Original Dashboard Cards for backward compatibility */}
        {activeView === 'detailed' && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Procurement Overview</h3>
            <DashboardCards cards={dashboardCards} />
          </div>
        )}

        {/* Quick Actions Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <QuickActions actions={quickActions} />
        </div>

        {/* Recent Activities and Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-6">
            <RecentActivities activities={recentActivities} />
          </div>
          
          <div className="space-y-6">
            <QuickStats stats={quickStats} />
            
            {/* BOQ/RFQ Status Summary */}
            <div className="ff-card">
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Process Status</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-900">BOQs in Review</span>
                    <span className="font-semibold text-blue-600">{stats.boqsActive || 8}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-purple-900">RFQs Active</span>
                    <span className="font-semibold text-purple-600">{stats.rfqsActive || 11}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-900">Suppliers Verified</span>
                    <span className="font-semibold text-green-600">{stats.supplierActive || 34}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium text-yellow-900">Pending Approvals</span>
                    <span className="font-semibold text-yellow-600">{stats.openIssues || 12}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ModuleStatusNotice />
      </div>
    </ProcurementErrorBoundary>
  );
}