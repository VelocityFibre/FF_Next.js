/**
 * Import Progress Component
 * Displays import progress and status information
 */

import { ImportProgress as ImportProgressType } from '../types/importAdvanced.types';
import { getStatusColor, getStatusText } from '../utils/importUtils';

interface ImportProgressProps {
  progress: ImportProgressType;
}

export function ImportProgress({ progress }: ImportProgressProps) {
  if (progress.status === 'idle') return null;

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className={`font-medium ${getStatusColor(progress.status)}`}>
          {getStatusText(progress.status)}
        </span>
        {progress.total > 0 && (
          <span className="text-sm text-gray-600">
            {progress.processed} / {progress.total}
          </span>
        )}
      </div>
      {progress.total > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(progress.processed / progress.total) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}