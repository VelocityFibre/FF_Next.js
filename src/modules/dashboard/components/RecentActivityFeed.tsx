/**
 * Recent Activity Feed - Legacy Compatibility Layer
 * @deprecated Use modular components from './activity' instead
 * This file maintains backward compatibility for existing imports
 * New code should import from './activity' directly
 */

import { cn } from '@/utils/cn';
import { 
  RecentActivityFeedProps, 
  mockActivities,
  ActivityHeader,
  ActivityLoadingState,
  ActivityEmptyState,
  ActivityListItem
} from './activity';

export function RecentActivityFeed({ 
  activities = mockActivities, 
  isLoading = false,
  showAll = false,
  className = '' 
}: RecentActivityFeedProps) {

  const displayedActivities = showAll ? activities : activities.slice(0, 5);

  if (isLoading) {
    return <ActivityLoadingState className={className} />;
  }

  return (
    <div className={cn(
      'bg-surface-primary rounded-lg border border-border-primary p-6',
      className
    )}>
      <ActivityHeader 
        showAll={showAll}
        hasMore={activities.length > 5}
      />

      {/* Activity Feed */}
      <div className="space-y-4">
        {displayedActivities.map((activity, index) => (
          <ActivityListItem
            key={activity.id}
            activity={activity}
            isLast={index === displayedActivities.length - 1}
          />
        ))}
      </div>

      {/* Empty state */}
      {displayedActivities.length === 0 && <ActivityEmptyState />}
    </div>
  );
}