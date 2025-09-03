/**
 * Activity Types
 * Type definitions for activity feed items
 */

export interface ActivityUser {
  name: string;
  avatar?: string;
  role: string;
}

export interface ActivityMetadata {
  location?: string;
  progress?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ActivityItem {
  id: string;
  type: 'task_completed' | 'project_updated' | 'staff_assigned' | 'issue_reported' | 'milestone_reached';
  user: ActivityUser;
  description: string;
  project?: string;
  timestamp: string;
  metadata?: ActivityMetadata;
}

export interface RecentActivityFeedProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
  showAll?: boolean;
  className?: string;
}