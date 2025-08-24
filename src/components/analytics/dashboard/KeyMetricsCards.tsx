/**
 * Analytics Dashboard Key Metrics Cards
 */

import { Activity, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { KeyMetricsProps } from './AnalyticsDashboardTypes';

export function KeyMetricsCards({ data }: KeyMetricsProps) {
  return (
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
  );
}