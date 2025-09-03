import { Cable, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { FiberStats } from '../types/fiberStringing.types';

interface FiberStatsCardsProps {
  stats: FiberStats;
}

export function FiberStatsCards({ stats }: FiberStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Cable className="h-5 w-5 text-primary-600" />
          </div>
          <span className="text-sm text-neutral-600">Total Sections</span>
        </div>
        <p className="text-2xl font-semibold text-neutral-900">{stats.sectionsTotal}</p>
        <p className="text-sm text-neutral-600 mt-1">
          {stats.totalDistance}m total distance
        </p>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-success-100 rounded-lg">
            <CheckCircle className="h-5 w-5 text-success-600" />
          </div>
          <span className="text-sm text-neutral-600">Completed</span>
        </div>
        <p className="text-2xl font-semibold text-neutral-900">{stats.sectionsCompleted}</p>
        <p className="text-sm text-success-600 mt-1">
          {stats.completedDistance}m installed
        </p>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-info-100 rounded-lg">
            <Clock className="h-5 w-5 text-info-600" />
          </div>
          <span className="text-sm text-neutral-600">In Progress</span>
        </div>
        <p className="text-2xl font-semibold text-neutral-900">{stats.sectionsInProgress}</p>
        <p className="text-sm text-info-600 mt-1">Active installations</p>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-warning-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-warning-600" />
          </div>
          <span className="text-sm text-neutral-600">Avg Speed</span>
        </div>
        <p className="text-2xl font-semibold text-neutral-900">
          {stats.averageSpeed.toFixed(0)}m/day
        </p>
        <p className="text-sm text-neutral-600 mt-1">
          Est. completion: {stats.estimatedCompletion}
        </p>
      </div>
    </div>
  );
}