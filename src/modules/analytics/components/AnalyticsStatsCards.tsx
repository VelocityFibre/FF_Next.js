import { 
  TrendingUp, TrendingDown, Home, Wifi, Activity, 
  Users, DollarSign, CheckCircle 
} from 'lucide-react';
import { AnalyticsStats } from '../types/analytics.types';

interface AnalyticsStatsCardsProps {
  stats: AnalyticsStats;
  formatNumber: (num: number) => string;
}

export function AnalyticsStatsCards({ stats, formatNumber }: AnalyticsStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="ff-card">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Poles</span>
            <Home className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{formatNumber(stats.totalPoles)}</p>
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
          <p className="text-2xl font-bold">{formatNumber(stats.totalDrops)}</p>
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
          <p className="text-2xl font-bold">{formatNumber(stats.totalFiber)}m</p>
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
          <p className="text-2xl font-bold">{stats.activeTeams}</p>
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
          <p className="text-2xl font-bold">R{formatNumber(stats.totalRevenue)}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600">+15% vs last period</span>
          </div>
        </div>
      </div>
    </div>
  );
}