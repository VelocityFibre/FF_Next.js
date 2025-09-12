'use client';

import { useRouter } from 'next/router';
import { 
  Plus, 
  FolderPlus, 
  UserPlus, 
  FileText, 
  Calendar, 
  AlertCircle,
  MapPin,
  Package,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Permission } from '@/types/auth.types';
import { cn } from '@/utils/cn';

interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  route: string;
  requiredPermissions: Permission[];
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
}

interface QuickActionsProps {
  className?: string;
}

const quickActions: QuickActionItem[] = [
  {
    id: 'create-project',
    title: 'New Project',
    description: 'Start a new fibre installation project',
    icon: FolderPlus,
    route: '/projects/new',
    requiredPermissions: [Permission.PROJECTS_CREATE],
    variant: 'primary',
  },
  {
    id: 'add-staff',
    title: 'Add Staff',
    description: 'Register new team member',
    icon: UserPlus,
    route: '/staff/new',
    requiredPermissions: [Permission.STAFF_CREATE],
    variant: 'secondary',
  },
  {
    id: 'create-sow',
    title: 'Upload SOW',
    description: 'Upload Statement of Work document',
    icon: FileText,
    route: '/sow/import',
    requiredPermissions: [Permission.MANAGE_SOW],
    variant: 'secondary',
  },
  {
    id: 'schedule-meeting',
    title: 'Schedule Meeting',
    description: 'Plan team or client meeting',
    icon: Calendar,
    route: '/meetings',
    requiredPermissions: [Permission.CREATE_COMMUNICATIONS],
    variant: 'secondary',
  },
  {
    id: 'report-issue',
    title: 'Report Issue',
    description: 'Log project issue or concern',
    icon: AlertCircle,
    route: '/action-items',
    requiredPermissions: [Permission.CREATE_COMMUNICATIONS],
    variant: 'warning',
  },
  {
    id: 'track-poles',
    title: 'Pole Tracker',
    description: 'View and update pole installations',
    icon: MapPin,
    route: '/pole-tracker',
    requiredPermissions: [Permission.PROJECTS_READ],
    variant: 'secondary',
  },
  {
    id: 'manage-inventory',
    title: 'Inventory',
    description: 'Check stock and materials',
    icon: Package,
    route: '/procurement',
    requiredPermissions: [Permission.VIEW_PROCUREMENT],
    variant: 'secondary',
  },
  {
    id: 'view-analytics',
    title: 'Analytics',
    description: 'View project performance metrics',
    icon: BarChart3,
    route: '/analytics',
    requiredPermissions: [Permission.ANALYTICS_READ],
    variant: 'secondary',
  },
];

const variantStyles = {
  primary: {
    card: 'bg-primary-50 border-primary-200 hover:bg-primary-100',
    icon: 'bg-primary-500 text-white',
    title: 'text-primary-900',
    description: 'text-primary-700',
  },
  secondary: {
    card: 'bg-[var(--ff-surface-primary)] border-[var(--ff-border-primary)] hover:bg-[var(--ff-surface-secondary)]',
    icon: 'bg-neutral-100 text-neutral-700',
    title: 'text-[var(--ff-text-primary)]',
    description: 'text-[var(--ff-text-secondary)]',
  },
  success: {
    card: 'bg-success-50 border-success-200 hover:bg-success-100',
    icon: 'bg-success-500 text-white',
    title: 'text-success-900',
    description: 'text-success-700',
  },
  warning: {
    card: 'bg-warning-50 border-warning-200 hover:bg-warning-100',
    icon: 'bg-warning-500 text-white',
    title: 'text-warning-900',
    description: 'text-warning-700',
  },
};

export function QuickActions({ className = '' }: QuickActionsProps) {
  const router = useRouter();
  const { hasPermission } = useAuth();

  // Filter actions based on user permissions
  const availableActions = quickActions.filter(action => 
    action.requiredPermissions.length === 0 || 
    action.requiredPermissions.some(permission => hasPermission(permission))
  );

  const handleActionClick = (action: QuickActionItem) => {
    router.push(action.route);
  };

  return (
    <div className={cn(
      'bg-[var(--ff-surface-primary)] rounded-lg border border-[var(--ff-border-primary)] p-6',
      className
    )}>
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <Plus className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-[var(--ff-text-primary)]">
          Quick Actions
        </h3>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {availableActions.map((action) => {
          const Icon = action.icon;
          const variant = action.variant || 'secondary';
          const styles = variantStyles[variant];

          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={cn(
                'p-4 rounded-lg border transition-all duration-200 text-left group',
                'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
                styles.card
              )}
            >
              <div className="flex items-start space-x-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  'group-hover:scale-110 transition-transform duration-200',
                  styles.icon
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    'font-medium text-sm mb-1 group-hover:translate-x-1 transition-transform duration-200',
                    styles.title
                  )}>
                    {action.title}
                  </h4>
                  <p className={cn(
                    'text-xs leading-relaxed',
                    styles.description
                  )}>
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {availableActions.length === 0 && (
        <div className="text-center py-8">
          <Plus className="w-12 h-12 text-[var(--ff-text-tertiary)] mx-auto mb-3" />
          <p className="text-[var(--ff-text-secondary)]">No quick actions available</p>
          <p className="text-xs text-[var(--ff-text-tertiary)] mt-1">
            Contact your administrator for access permissions
          </p>
        </div>
      )}
    </div>
  );
}