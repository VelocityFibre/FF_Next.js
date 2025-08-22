import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, BarChart3, Users, Download, RefreshCw,
  Calendar, Filter, Activity, Home, Wifi,
  UserCheck, AlertCircle, CheckCircle, DollarSign
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

interface DailyProgress {
  date: string;
  polesInstalled: number;
  dropsCompleted: number;
  fiberMeters: number;
  tasksCompleted: number;
  revenue: number;
}

interface ProjectMetrics {
  projectName: string;
  completion: number;
  polesCompleted: number;
  totalPoles: number;
  dropsCompleted: number;
  totalDrops: number;
  status: 'on-track' | 'delayed' | 'ahead';
  trend: 'up' | 'down' | 'stable';
}

interface TeamPerformance {
  teamName: string;
  productivity: number;
  tasksCompleted: number;
  avgCompletionTime: number;
  qualityScore: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
  const [projectMetrics, setProjectMetrics] = useState<ProjectMetrics[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = () => {
    setIsLoading(true);
    
    // Mock data
    const mockDailyProgress: DailyProgress[] = [
      { date: 'Mon', polesInstalled: 45, dropsCompleted: 120, fiberMeters: 2500, tasksCompleted: 28, revenue: 15000 },
      { date: 'Tue', polesInstalled: 52, dropsCompleted: 135, fiberMeters: 2800, tasksCompleted: 32, revenue: 17500 },
      { date: 'Wed', polesInstalled: 38, dropsCompleted: 98, fiberMeters: 2100, tasksCompleted: 25, revenue: 13000 },
      { date: 'Thu', polesInstalled: 61, dropsCompleted: 158, fiberMeters: 3200, tasksCompleted: 38, revenue: 21000 },
      { date: 'Fri', polesInstalled: 55, dropsCompleted: 142, fiberMeters: 2900, tasksCompleted: 35, revenue: 19000 },
      { date: 'Sat', polesInstalled: 42, dropsCompleted: 110, fiberMeters: 2300, tasksCompleted: 26, revenue: 14500 },
      { date: 'Sun', polesInstalled: 28, dropsCompleted: 72, fiberMeters: 1500, tasksCompleted: 18, revenue: 9500 }
    ];

    const mockProjectMetrics: ProjectMetrics[] = [
      {
        projectName: 'Stellenbosch Phase 1',
        completion: 78,
        polesCompleted: 3900,
        totalPoles: 5000,
        dropsCompleted: 15600,
        totalDrops: 20000,
        status: 'on-track',
        trend: 'up'
      },
      {
        projectName: 'Paarl Expansion',
        completion: 45,
        polesCompleted: 2250,
        totalPoles: 5000,
        dropsCompleted: 9000,
        totalDrops: 20000,
        status: 'delayed',
        trend: 'down'
      },
      {
        projectName: 'Wellington Connect',
        completion: 92,
        polesCompleted: 4600,
        totalPoles: 5000,
        dropsCompleted: 18400,
        totalDrops: 20000,
        status: 'ahead',
        trend: 'up'
      }
    ];

    const mockTeamPerformance: TeamPerformance[] = [
      { teamName: 'Alpha Team', productivity: 95, tasksCompleted: 156, avgCompletionTime: 2.3, qualityScore: 98 },
      { teamName: 'Bravo Team', productivity: 88, tasksCompleted: 142, avgCompletionTime: 2.8, qualityScore: 92 },
      { teamName: 'Charlie Team', productivity: 92, tasksCompleted: 149, avgCompletionTime: 2.5, qualityScore: 95 },
      { teamName: 'Delta Team', productivity: 79, tasksCompleted: 128, avgCompletionTime: 3.2, qualityScore: 88 }
    ];

    setTimeout(() => {
      setDailyProgress(mockDailyProgress);
      setProjectMetrics(mockProjectMetrics);
      setTeamPerformance(mockTeamPerformance);
      setIsLoading(false);
    }, 1000);
  };

  // Calculate summary stats
  const totalPoles = dailyProgress.reduce((sum, day) => sum + day.polesInstalled, 0);
  const totalDrops = dailyProgress.reduce((sum, day) => sum + day.dropsCompleted, 0);
  const totalFiber = dailyProgress.reduce((sum, day) => sum + day.fiberMeters, 0);
  const totalRevenue = dailyProgress.reduce((sum, day) => sum + day.revenue, 0);
  const avgDailyPoles = Math.round(totalPoles / dailyProgress.length);
  const avgDailyDrops = Math.round(totalDrops / dailyProgress.length);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-100';
      case 'delayed': return 'text-red-600 bg-red-100';
      case 'ahead': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
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
            onClick: () => {},
            variant: 'secondary'
          },
          {
            label: 'Refresh',
            icon: RefreshCw,
            onClick: loadAnalyticsData,
            variant: 'primary'
          }
        ]}
      />

      {/* Time Range Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select 
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Metrics</option>
            <option value="poles">Poles Only</option>
            <option value="drops">Drops Only</option>
            <option value="fiber">Fiber Only</option>
            <option value="revenue">Revenue Only</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Poles</span>
              <Home className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">{formatNumber(totalPoles)}</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">+12% vs last period</span>
            </div>
          </div>
        </div>

        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Drops</span>
              <Wifi className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold">{formatNumber(totalDrops)}</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">+8% vs last period</span>
            </div>
          </div>
        </div>

        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Fiber Installed</span>
              <Activity className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold">{formatNumber(totalFiber)}m</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600">-3% vs last period</span>
            </div>
          </div>
        </div>

        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Active Teams</span>
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold">{teamPerformance.length}</p>
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">All operational</span>
            </div>
          </div>
        </div>

        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Revenue</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold">R{formatNumber(totalRevenue)}</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">+15% vs last period</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Progress Chart */}
        <div className="ff-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Daily Progress</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {dailyProgress.map((day, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{day.date}</span>
                      <span className="text-sm text-gray-600">
                        {day.polesInstalled} poles, {day.dropsCompleted} drops
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(day.polesInstalled / 70) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Project Status */}
        <div className="ff-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Project Status</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {projectMetrics.map((project, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{project.projectName}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                      {project.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Completion</span>
                      <span>{project.completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          project.status === 'on-track' ? 'bg-green-500' :
                          project.status === 'delayed' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${project.completion}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Poles: </span>
                      <span className="font-medium">
                        {formatNumber(project.polesCompleted)}/{formatNumber(project.totalPoles)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Drops: </span>
                      <span className="font-medium">
                        {formatNumber(project.dropsCompleted)}/{formatNumber(project.totalDrops)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Performance Table */}
      <div className="ff-card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Team Performance</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Team</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Productivity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tasks Completed</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Avg Time (hrs)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Quality Score</th>
                </tr>
              </thead>
              <tbody>
                {teamPerformance.map((team, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserCheck className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium">{team.teamName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              team.productivity >= 90 ? 'bg-green-500' :
                              team.productivity >= 80 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${team.productivity}%` }}
                          />
                        </div>
                        <span className="text-sm">{team.productivity}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{team.tasksCompleted}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{team.avgCompletionTime}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-medium ${
                          team.qualityScore >= 95 ? 'text-green-600' :
                          team.qualityScore >= 90 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {team.qualityScore}%
                        </span>
                        {team.qualityScore >= 95 && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="ff-card bg-green-50 border-green-200">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Top Performance</span>
            </div>
            <p className="text-sm text-green-700">
              Wellington Connect project is 92% complete and ahead of schedule by 5 days.
            </p>
          </div>
        </div>

        <div className="ff-card bg-yellow-50 border-yellow-200">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Attention Needed</span>
            </div>
            <p className="text-sm text-yellow-700">
              Paarl Expansion is delayed by 3 days due to equipment shortages.
            </p>
          </div>
        </div>

        <div className="ff-card bg-blue-50 border-blue-200">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Weekly Average</span>
            </div>
            <p className="text-sm text-blue-700">
              Teams are averaging {avgDailyPoles} poles and {avgDailyDrops} drops per day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;