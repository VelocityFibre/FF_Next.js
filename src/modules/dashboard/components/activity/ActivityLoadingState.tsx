/**
 * Activity Loading State Component
 * Loading skeleton for activity feed
 */

import { cn } from '@/utils/cn';

interface ActivityLoadingStateProps {
  className?: string;
}

export function ActivityLoadingState({ className }: ActivityLoadingStateProps) {
  return (
    <div className={cn(
      'bg-surface-primary rounded-lg border border-border-primary p-6',
      className
    )}>
      <div className="animate-pulse">
        <div className="h-4 bg-surface-secondary rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-surface-secondary rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-secondary rounded w-3/4"></div>
                <div className="h-3 bg-surface-secondary rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}