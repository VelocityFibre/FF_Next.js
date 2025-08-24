import { Home, CheckCircle, Wrench, Clock, AlertTriangle, Activity } from 'lucide-react';
import { InstallationStats } from '../types/installation.types';

interface InstallationStatsCardsProps {
  stats: InstallationStats;
}

export function InstallationStatsCards({ stats }: InstallationStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      <div className="ff-card">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Home className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="ff-card">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="ff-card">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
            </div>
            <Wrench className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="ff-card">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold">{stats.scheduled}</p>
            </div>
            <Clock className="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>

      <div className="ff-card">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Issues</p>
              <p className="text-2xl font-bold">{stats.issues}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="ff-card">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Speed</p>
              <p className="text-2xl font-bold">{Math.round(stats.avgSpeed)} Mbps</p>
            </div>
            <Activity className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
}