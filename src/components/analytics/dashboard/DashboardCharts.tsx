/**
 * Analytics Dashboard Charts Section
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DashboardChartsProps } from './AnalyticsDashboardTypes';

export function DashboardCharts({ projectTrends, kpiDashboard }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Project Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Project Completion Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={projectTrends}>
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
            <BarChart data={kpiDashboard}>
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
  );
}