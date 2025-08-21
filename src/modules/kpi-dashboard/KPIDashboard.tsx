import { BarChart3, Users, Calendar, Target, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function KPIDashboard() {
  const navigate = useNavigate();

  const kpiCards = [
    {
      title: 'Project KPIs',
      value: '87%',
      change: '+5%',
      icon: BarChart3,
      color: 'bg-blue-500',
      trend: 'up',
    },
    {
      title: 'Team Performance',
      value: '92%',
      change: '+3%',
      icon: Users,
      color: 'bg-green-500',
      trend: 'up',
    },
    {
      title: 'Timeline Adherence',
      value: '78%',
      change: '-2%',
      icon: Calendar,
      color: 'bg-purple-500',
      trend: 'down',
    },
    {
      title: 'Quality Score',
      value: '95%',
      change: '+1%',
      icon: Target,
      color: 'bg-orange-500',
      trend: 'up',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KPI Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time performance metrics overview</p>
        </div>
        <button
          onClick={() => navigate('/app/kpi-dashboard/export')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          Export Dashboard
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((kpi) => (
          <div key={kpi.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`${kpi.color} p-3 rounded-lg`}>
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                <span className={`text-sm ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.change} vs last month
                </span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600">{kpi.title}</h3>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Chart visualization coming soon</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Comparison</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Chart visualization coming soon</p>
          </div>
        </div>
      </div>

      {/* Recent Performance */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Performance Updates</h2>
        <div className="space-y-4">
          <p className="text-gray-500 text-center">No recent updates</p>
        </div>
      </div>
    </div>
  );
}