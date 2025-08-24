/**
 * Procurement Dashboard Component
 * Main dashboard providing overview of all procurement activities and quick access to functions
 */

import { ProcurementErrorBoundary } from '../error/ProcurementErrorBoundary';
import { DashboardCards } from './components/DashboardCards';
import { QuickActions } from './components/QuickActions';
import { RecentActivities } from './components/RecentActivities';
import { QuickStats } from './components/QuickStats';
import { ModuleStatusNotice } from './components/ModuleStatusNotice';
import { 
  dashboardCards, 
  quickActions, 
  recentActivities, 
  quickStats 
} from './data/dashboardData';

export function ProcurementDashboard() {
  return (
    <ProcurementErrorBoundary level="page">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Procurement Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your procurement processes and track progress</p>
          </div>
          <QuickActions actions={quickActions} />
        </div>

        <DashboardCards cards={dashboardCards} />

        {/* Recent Activities and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivities activities={recentActivities} />
          <QuickStats stats={quickStats} />
        </div>

        <ModuleStatusNotice />
      </div>
    </ProcurementErrorBoundary>
  );
}