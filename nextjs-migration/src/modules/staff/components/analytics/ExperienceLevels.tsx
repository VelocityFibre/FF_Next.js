/**
 * Experience Levels Component
 * Displays staff breakdown by experience level with colored progress bars
 */

import { BarChart3 } from 'lucide-react';

interface ExperienceLevelsProps {
  staffByLevel: Record<string, number>;
  totalStaff: number;
}

export function ExperienceLevels({ staffByLevel, totalStaff }: ExperienceLevelsProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'senior': return 'bg-purple-500';
      case 'intermediate': return 'bg-blue-500';
      case 'junior': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Experience Levels</h3>
        <BarChart3 className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-3">
        {Object.entries(staffByLevel).map(([level, count]) => {
          const percentage = (count / totalStaff) * 100;
          return (
            <div key={level}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 capitalize">
                  {level}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {count} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getLevelColor(level)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}