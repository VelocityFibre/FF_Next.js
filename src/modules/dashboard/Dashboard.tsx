import { 
  FolderOpen, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Package,
  MapPin
} from 'lucide-react';
import { StatsCard } from './components/StatsCard';
import { ProjectOverviewCard } from './components/ProjectOverviewCard';
import { RecentActivityFeed } from './components/RecentActivityFeed';
import { QuickActions } from './components/QuickActions';
import { useAuth } from '@/contexts/AuthContext';
import { Permission } from '@/types/auth.types';

// Mock data for development - will be replaced with real data services
const mockStats = {
  totalProjects: 12,
  activeProjects: 7,
  completedTasks: 234,
  teamMembers: 45,
  completionRate: 67.5,
  issuesOpen: 8,
  deliveriesThisMonth: 156,
  polesInstalled: 1247,
};

export function Dashboard() {
  const { currentUser, hasPermission } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = currentUser?.displayName?.split(' ')[0] || 'there';
    
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  const statsCards = [
    {
      title: 'Active Projects',
      value: mockStats.activeProjects,
      icon: FolderOpen,
      description: `${mockStats.totalProjects} total projects`,
      trend: {
        value: 12.5,
        isPositive: true,
        label: 'vs last month',
      },
      variant: 'primary' as const,
      requiredPermissions: [Permission.PROJECTS_READ],
    },
    {
      title: 'Team Members',
      value: mockStats.teamMembers,
      icon: Users,
      description: 'Across all projects',
      trend: {
        value: 8.3,
        isPositive: true,
        label: 'new this month',
      },
      variant: 'success' as const,
      requiredPermissions: [Permission.STAFF_READ],
    },
    {
      title: 'Tasks Completed',
      value: mockStats.completedTasks,
      icon: CheckCircle,
      description: `${mockStats.completionRate}% completion rate`,
      trend: {
        value: 5.2,
        isPositive: true,
        label: 'vs last week',
      },
      variant: 'success' as const,
      requiredPermissions: [Permission.PROJECTS_READ],
    },
    {
      title: 'Open Issues',
      value: mockStats.issuesOpen,
      icon: AlertTriangle,
      description: '3 high priority',
      trend: {
        value: 2.1,
        isPositive: false,
        label: 'requires attention',
      },
      variant: 'warning' as const,
      requiredPermissions: [Permission.VIEW_COMMUNICATIONS],
    },
    {
      title: 'Poles Installed',
      value: mockStats.polesInstalled,
      icon: MapPin,
      description: 'This quarter',
      trend: {
        value: 15.7,
        isPositive: true,
        label: 'ahead of target',
      },
      variant: 'primary' as const,
      requiredPermissions: [Permission.PROJECTS_READ],
    },
    {
      title: 'Material Deliveries',
      value: mockStats.deliveriesThisMonth,
      icon: Package,
      description: 'This month',
      trend: {
        value: 4.2,
        isPositive: true,
        label: 'vs last month',
      },
      variant: 'default' as const,
      requiredPermissions: [Permission.VIEW_PROCUREMENT],
    },
  ];

  // Filter stats based on permissions
  const visibleStats = statsCards.filter(stat => 
    stat.requiredPermissions.length === 0 || 
    stat.requiredPermissions.some(permission => hasPermission(permission))
  );

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {getGreeting()}
            </h1>
            <p className="text-primary-100">
              Welcome to your FibreFlow dashboard. Here's what's happening with your projects.
            </p>
          </div>
          <div className="hidden lg:flex items-center space-x-4 text-right">
            <div>
              <div className="text-sm text-primary-200">Today</div>
              <div className="font-semibold">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            description={stat.description}
            trend={stat.trend}
            variant={stat.variant}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Overview - Takes 2 columns */}
        {hasPermission(Permission.PROJECTS_READ) && (
          <div className="lg:col-span-2">
            <ProjectOverviewCard />
          </div>
        )}

        {/* Quick Actions - Takes 1 column */}
        <div className={hasPermission(Permission.PROJECTS_READ) ? '' : 'lg:col-span-3'}>
          <QuickActions />
        </div>
      </div>

      {/* Recent Activity - Full Width */}
      {hasPermission(Permission.VIEW_COMMUNICATIONS) && (
        <div className="grid grid-cols-1">
          <RecentActivityFeed />
        </div>
      )}

      {/* Additional KPI Cards for Analytics Users */}
      {hasPermission(Permission.ANALYTICS_READ) && (
        <div className="bg-surface-primary rounded-lg border border-border-primary p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-text-primary">
              Performance Metrics
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface-secondary rounded-lg p-4">
              <div className="text-2xl font-bold text-success-600">94.2%</div>
              <div className="text-sm text-text-secondary">Quality Score</div>
            </div>
            <div className="bg-surface-secondary rounded-lg p-4">
              <div className="text-2xl font-bold text-primary-600">87%</div>
              <div className="text-sm text-text-secondary">On-Time Delivery</div>
            </div>
            <div className="bg-surface-secondary rounded-lg p-4">
              <div className="text-2xl font-bold text-warning-600">15.3</div>
              <div className="text-sm text-text-secondary">Avg. Task Time (hrs)</div>
            </div>
            <div className="bg-surface-secondary rounded-lg p-4">
              <div className="text-2xl font-bold text-info-600">R2.4M</div>
              <div className="text-sm text-text-secondary">Revenue This Month</div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State for Limited Permissions */}
      {visibleStats.length === 0 && (
        <div className="bg-surface-primary rounded-lg border border-border-primary p-12 text-center">
          <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-text-tertiary" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Welcome to FibreFlow
          </h3>
          <p className="text-text-secondary mb-4">
            Your dashboard will display relevant information once you have access to project data.
          </p>
          <p className="text-sm text-text-tertiary">
            Contact your administrator to request additional permissions.
          </p>
        </div>
      )}
    </div>
  );
}