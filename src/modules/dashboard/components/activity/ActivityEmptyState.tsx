/**
 * Activity Empty State Component
 * Empty state display when no activities are available
 */

import { Clock } from 'lucide-react';

export function ActivityEmptyState() {
  return (
    <div className="text-center py-8">
      <Clock className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
      <p className="text-text-secondary">No recent activity</p>
    </div>
  );
}