import { MapPin, Home, Cable } from 'lucide-react';

interface TrackerStatsProps {
  stats: {
    poles: {
      total: number;
      completed: number;
      progress: number;
      pending: number;
    };
    drops: {
      total: number;
      completed: number;
      progress: number;
      pending: number;
    };
    fiber: {
      total: number;
      completed: number;
      progress: number;
      pending: number;
    };
  } | null;
}

export function TrackerStats({ stats }: TrackerStatsProps) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Poles</span>
          <MapPin className="w-4 h-4 text-gray-400" />
        </div>
        <div className="text-2xl font-bold">{stats.poles.total}</div>
        <div className="text-xs text-gray-500 mt-1">
          {stats.poles.completed} completed, {stats.poles.progress} in progress
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Home Drops</span>
          <Home className="w-4 h-4 text-gray-400" />
        </div>
        <div className="text-2xl font-bold">{stats.drops.total}</div>
        <div className="text-xs text-gray-500 mt-1">
          {stats.drops.completed} completed, {stats.drops.progress} in progress
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Fiber Sections</span>
          <Cable className="w-4 h-4 text-gray-400" />
        </div>
        <div className="text-2xl font-bold">{stats.fiber.total}</div>
        <div className="text-xs text-gray-500 mt-1">
          {stats.fiber.completed} completed, {stats.fiber.progress} in progress
        </div>
      </div>
    </div>
  );
}