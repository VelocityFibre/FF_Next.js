/**
 * Activity List Item Component
 * Individual activity item display
 */

import { FileText, MapPin } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ActivityItem } from './types';
import { activityConfig } from './config';
import { formatTimestamp } from './utils';

interface ActivityListItemProps {
  activity: ActivityItem;
  isLast: boolean;
}

export function ActivityListItem({ activity, isLast }: ActivityListItemProps) {
  const config = activityConfig[activity.type];
  const Icon = config.icon;

  return (
    <div className="relative">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-4 top-10 w-0.5 h-12 bg-border-secondary" />
      )}
      
      <div className="flex items-start space-x-3">
        {/* Activity icon */}
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          config.bgColor
        )}>
          <Icon className={cn('w-4 h-4', config.color)} />
        </div>

        {/* Activity content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* User info */}
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-text-primary text-sm">
                  {activity.user.name}
                </span>
                <span className="text-xs text-text-tertiary">
                  ({activity.user.role})
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-text-secondary mb-2">
                {activity.description}
              </p>

              {/* Project link */}
              {activity.project && (
                <div className="flex items-center space-x-1 mb-2">
                  <FileText className="w-3 h-3 text-text-tertiary" />
                  <span className="text-xs text-primary-600 hover:text-primary-700 cursor-pointer">
                    {activity.project}
                  </span>
                </div>
              )}

              {/* Metadata */}
              {activity.metadata && (
                <div className="flex items-center space-x-3 text-xs text-text-tertiary">
                  {activity.metadata.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{activity.metadata.location}</span>
                    </div>
                  )}
                  {activity.metadata.progress && (
                    <div className="flex items-center space-x-1">
                      <span>{activity.metadata.progress}% complete</span>
                    </div>
                  )}
                  {activity.metadata.priority && (
                    <span className={cn(
                      'px-1.5 py-0.5 rounded text-xs font-medium',
                      activity.metadata.priority === 'critical' 
                        ? 'bg-error-100 text-error-700'
                        : activity.metadata.priority === 'high'
                        ? 'bg-warning-100 text-warning-700'
                        : 'bg-info-100 text-info-700'
                    )}>
                      {activity.metadata.priority.toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Timestamp */}
            <div className="text-xs text-text-tertiary ml-4">
              {formatTimestamp(activity.timestamp)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}