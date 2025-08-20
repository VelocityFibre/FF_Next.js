import { useState } from 'react';
import { FolderOpen, Calendar, MapPin, Users, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  progress: number;
  startDate: string;
  endDate: string;
  location: string;
  teamSize: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tasksCompleted: number;
  totalTasks: number;
}

interface ProjectOverviewCardProps {
  projects?: Project[];
  isLoading?: boolean;
  className?: string;
}

const statusConfig = {
  planning: {
    label: 'Planning',
    color: 'bg-info-100 text-info-800 border-info-200',
    dot: 'bg-info-500',
  },
  active: {
    label: 'Active',
    color: 'bg-success-100 text-success-800 border-success-200',
    dot: 'bg-success-500',
  },
  on_hold: {
    label: 'On Hold',
    color: 'bg-warning-100 text-warning-800 border-warning-200',
    dot: 'bg-warning-500',
  },
  completed: {
    label: 'Completed',
    color: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    dot: 'bg-neutral-500',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-error-100 text-error-800 border-error-200',
    dot: 'bg-error-500',
  },
};

const priorityConfig = {
  low: { color: 'text-success-600', bg: 'bg-success-100' },
  medium: { color: 'text-warning-600', bg: 'bg-warning-100' },
  high: { color: 'text-error-600', bg: 'bg-error-100' },
  critical: { color: 'text-error-700', bg: 'bg-error-200' },
};

// Mock data for development
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'VF Network Expansion - Phase 1',
    status: 'active',
    progress: 67,
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    location: 'Cape Town Central',
    teamSize: 12,
    priority: 'high',
    tasksCompleted: 34,
    totalTasks: 51,
  },
  {
    id: '2',
    name: 'Stellenbosch Fibre Rollout',
    status: 'active',
    progress: 23,
    startDate: '2024-02-01',
    endDate: '2024-08-15',
    location: 'Stellenbosch',
    teamSize: 8,
    priority: 'medium',
    tasksCompleted: 12,
    totalTasks: 52,
  },
  {
    id: '3',
    name: 'Paarl Industrial Zone',
    status: 'planning',
    progress: 5,
    startDate: '2024-03-01',
    endDate: '2024-09-30',
    location: 'Paarl',
    teamSize: 6,
    priority: 'low',
    tasksCompleted: 2,
    totalTasks: 38,
  },
];

export function ProjectOverviewCard({ 
  projects = mockProjects, 
  isLoading = false,
  className = '' 
}: ProjectOverviewCardProps) {
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'planning'>('all');

  const filteredProjects = projects.filter(project => {
    if (selectedTab === 'all') return true;
    return project.status === selectedTab;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className={cn(
        'bg-surface-primary rounded-lg border border-border-primary p-6',
        className
      )}>
        <div className="animate-pulse">
          <div className="h-4 bg-surface-secondary rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-surface-secondary rounded"></div>
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
          <FolderOpen className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-text-primary">
            Active Projects
          </h3>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-surface-secondary rounded-lg p-1">
          {[
            { key: 'all' as const, label: 'All' },
            { key: 'active' as const, label: 'Active' },
            { key: 'planning' as const, label: 'Planning' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={cn(
                'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                selectedTab === tab.key
                  ? 'bg-surface-primary text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.map((project) => {
          const status = statusConfig[project.status];
          const priority = priorityConfig[project.priority];
          const daysRemaining = getDaysRemaining(project.endDate);

          return (
            <div
              key={project.id}
              className="border border-border-secondary rounded-lg p-4 hover:border-border-primary transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-text-primary truncate">
                    {project.name}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-text-tertiary">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{project.teamSize} members</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(project.endDate)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {/* Priority indicator */}
                  {project.priority === 'high' || project.priority === 'critical' ? (
                    <div className={cn('p-1 rounded', priority.bg)}>
                      <AlertTriangle className={cn('w-3 h-3', priority.color)} />
                    </div>
                  ) : null}
                  
                  {/* Status badge */}
                  <span className={cn(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                    status.color
                  )}>
                    <div className={cn('w-1.5 h-1.5 rounded-full mr-1', status.dot)} />
                    {status.label}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">
                    Progress: {project.tasksCompleted}/{project.totalTasks} tasks
                  </span>
                  <span className="font-medium text-text-primary">
                    {project.progress}%
                  </span>
                </div>
                <div className="w-full bg-surface-secondary rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                
                {/* Timeline info */}
                <div className="flex items-center justify-between text-xs text-text-tertiary mt-2">
                  <span>Started {formatDate(project.startDate)}</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {daysRemaining > 0 
                        ? `${daysRemaining} days remaining`
                        : daysRemaining === 0
                        ? 'Due today'
                        : `${Math.abs(daysRemaining)} days overdue`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-8">
          <FolderOpen className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
          <p className="text-text-secondary">No {selectedTab} projects found</p>
        </div>
      )}
    </div>
  );
}