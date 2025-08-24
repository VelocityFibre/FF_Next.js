/**
 * Activity Header Component
 * Header section for the activity feed
 */

import { Clock, ArrowRight } from 'lucide-react';

interface ActivityHeaderProps {
  showAll: boolean;
  hasMore: boolean;
  onViewAll?: () => void;
}

export function ActivityHeader({ showAll, hasMore, onViewAll }: ActivityHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-2">
        <Clock className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-text-primary">
          Recent Activity
        </h3>
      </div>
      
      {!showAll && hasMore && onViewAll && (
        <button 
          onClick={onViewAll}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}