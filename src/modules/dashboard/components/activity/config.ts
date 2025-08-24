/**
 * Activity Configuration
 * Configuration for activity types with icons and colors
 */

import { 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Users, 
  Calendar
} from 'lucide-react';

export const activityConfig = {
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