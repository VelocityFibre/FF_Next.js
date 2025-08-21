import { 
  Clock, 
 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Users, 
  MapPin,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ActivityItem {
  id: string;
  type: 'task_completed' | 'project_updated' | 'staff_assigned' | 'issue_reported' | 'milestone_reached';
  user: {
    name: string;
    avatar?: string;
    role: string;
  };
  description: string;
  project?: string;
  timestamp: string;
  metadata?: {
    location?: string;
    progress?: number;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
}

interface RecentActivityFeedProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
  showAll?: boolean;
  className?: string;
}

const activityConfig = {
  task_completed: {
    icon: CheckCircle,
    color: 'text-success-600',
    bgColor: 'bg-success-100',
  },
  project_updated: {
    icon: FileText,
    color: 'text-info-600',
    bgColor: 'bg-info-100',
  },
  staff_assigned: {
    icon: Users,
    color: 'text-primary-600',
    bgColor: 'bg-primary-100',
  },
  issue_reported: {
    icon: AlertCircle,
    color: 'text-warning-600',
    bgColor: 'bg-warning-100',
  },
  milestone_reached: {
    icon: Calendar,
    color: 'text-accent-600',
    bgColor: 'bg-accent-100',
  },
};

// Mock data for development
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'task_completed',
    user: {
      name: 'Sarah Johnson',
      role: 'Field Technician',
    },
    description: 'Completed pole installation at Strand Beach Road',
    project: 'VF Network Expansion - Phase 1',
    timestamp: '2024-08-19T14:30:00Z',
    metadata: {
      location: 'Strand Beach Road',
    },
  },
  {
    id: '2',
    type: 'project_updated',
    user: {
      name: 'Mike Peters',
      role: 'Project Manager',
    },
    description: 'Updated project timeline and resource allocation',
    project: 'Stellenbosch Fibre Rollout',
    timestamp: '2024-08-19T13:15:00Z',
    metadata: {
      progress: 67,
    },
  },
  {
    id: '3',
    type: 'staff_assigned',
    user: {
      name: 'Lisa Chen',
      role: 'Team Lead',
    },
    description: 'Assigned 3 new technicians to installation crew',
    project: 'Paarl Industrial Zone',
    timestamp: '2024-08-19T11:45:00Z',
  },
  {
    id: '4',
    type: 'issue_reported',
    user: {
      name: 'David Wilson',
      role: 'Site Supervisor',
    },
    description: 'Reported underground cable damage during excavation',
    project: 'VF Network Expansion - Phase 1',
    timestamp: '2024-08-19T10:20:00Z',
    metadata: {
      priority: 'high',
      location: 'Main Road Junction',
    },
  },
  {
    id: '5',
    type: 'milestone_reached',
    user: {
      name: 'Team Alpha',
      role: 'Installation Team',
    },
    description: 'Reached 50% completion milestone ahead of schedule',
    project: 'Stellenbosch Fibre Rollout',
    timestamp: '2024-08-19T09:00:00Z',
    metadata: {
      progress: 50,
    },
  },
];

export function RecentActivityFeed({ 
  activities = mockActivities, 
  isLoading = false,
  showAll = false,
  className = '' 
}: RecentActivityFeedProps) {

  const displayedActivities = showAll ? activities : activities.slice(0, 5);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };



  if (isLoading) {
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

  return (
    <div className={cn(
      'bg-surface-primary rounded-lg border border-border-primary p-6',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-text-primary">
            Recent Activity
          </h3>
        </div>
        
        {!showAll && activities.length > 5 && (
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Activity Feed */}
      <div className="space-y-4">
        {displayedActivities.map((activity, index) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          const isLast = index === displayedActivities.length - 1;

          return (
            <div key={activity.id} className="relative">
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
        })}
      </div>

      {/* Empty state */}
      {displayedActivities.length === 0 && (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
          <p className="text-text-secondary">No recent activity</p>
        </div>
      )}
    </div>
  );
}