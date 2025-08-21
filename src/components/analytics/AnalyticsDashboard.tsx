/**
 * Analytics Dashboard Component
 * Displays data from Neon analytics database
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { analyticsService } from '@/services/analytics/analyticsService';
import { firebaseToNeonSync } from '@/services/sync/firebaseToNeonSync';
import { Loader2, Database, RefreshCw, TrendingUp, DollarSign, Users, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardData {
  projectOverview: any;
  kpiDashboard: any[];
  financialOverview: any;
  topClients: any[];
  projectTrends: any[];
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

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
        kpiDashboard,
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
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <Database className="h-16 w-16 text-gray-400 mb-4" />
        <p className="text-gray-600 mb-4">No analytics data available</p>
        <Button onClick={syncData} disabled={syncing}>
          {syncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Sync from Firebase
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Insights from Neon analytical database</p>
        </div>
        <div className="flex items-center space-x-4">
          {lastSyncTime && (
            <span className="text-sm text-gray-500">
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={syncData} disabled={syncing}>
            {syncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Sync Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.projectOverview.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active projects in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R {Number(data.projectOverview.totalBudget || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined project budgets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(data.projectOverview.avgCompletion || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average project completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.topClients.length}</div>
            <p className="text-xs text-muted-foreground">
              Active premium clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Project Completion Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.projectTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="avgCompletion" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Avg Completion %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* KPI Overview */}
        <Card>
          <CardHeader>
            <CardTitle>KPI Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.kpiDashboard}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metricType" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="currentValue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                R {Number(data.financialOverview.totalAmount || 0).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                R {Number(data.financialOverview.paidAmount || 0).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Paid Amount</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                R {Number(data.financialOverview.pendingAmount || 0).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Pending Amount</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Top Clients by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topClients.map((client: any, index: number) => (
              <div key={client.clientId} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{client.clientName}</p>
                    <p className="text-sm text-gray-600">{client.totalProjects} projects</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">R {Number(client.totalRevenue || 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">
                    Score: {Number(client.paymentScore || 0).toFixed(0)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Firebase (Real-time)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Neon (Analytics)</span>
            </div>
            {lastSyncTime && (
              <span className="text-sm text-gray-600">
                Last synced: {lastSyncTime.toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}