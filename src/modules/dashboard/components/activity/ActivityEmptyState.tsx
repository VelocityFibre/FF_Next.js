/**
 * Activity Empty State Component
 * Empty state display when no activities are available
 */

import { Clock } from 'lucide-react';

export function ActivityEmptyState() {
  return (
    <div className="text-center py-8">
      <Clock className="w-12 h-12 text-[var(--ff-text-tertiary)] mx-auto mb-3" />
      <p className="text-[var(--ff-text-secondary)]">No recent activity</p>
      <p className="text-xs text-[var(--ff-text-tertiary)] mt-1">Activity tracking will appear here when available</p>
    </div>
  );
}