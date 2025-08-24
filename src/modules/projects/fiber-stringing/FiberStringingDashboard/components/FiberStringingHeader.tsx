import { Cable } from 'lucide-react';
import { FiberStats } from '../types/fiberStringing.types';

interface FiberStringingHeaderProps {
  stats: FiberStats;
}

export function FiberStringingHeader({ stats }: FiberStringingHeaderProps) {
  const progressPercentage = (stats.completedDistance / stats.totalDistance) * 100 || 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Fiber Stringing Progress</h1>
          <p className="text-neutral-600 mt-1">Track fiber cable installation across sections</p>
        </div>
        <div className="flex items-center gap-2">
          <Cable className="h-8 w-8 text-primary-600" />
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-700">Overall Progress</span>
          <span className="text-sm font-semibold">{progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-3">
          <div 
            className="bg-primary-600 h-3 rounded-full transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-neutral-600">
          <span>{stats.completedDistance}m completed</span>
          <span>{stats.totalDistance}m total</span>
        </div>
      </div>
    </div>
  );
}