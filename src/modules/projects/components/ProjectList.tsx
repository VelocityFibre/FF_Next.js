import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  MapPin,
  Users,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProjectStatus, ProjectPriority, ProjectFilters } from '../types/project.types';
import { cn } from '@/utils/cn';

const statusConfig = {
  [ProjectStatus.PLANNING]: {
    label: 'Planning',
    color: 'bg-info-100 text-info-800 border-info-200',
    dot: 'bg-info-500',
  },
  [ProjectStatus.ACTIVE]: {
    label: 'Active',
    color: 'bg-success-100 text-success-800 border-success-200',
    dot: 'bg-success-500',
  },
  [ProjectStatus.ON_HOLD]: {
    label: 'On Hold',
    color: 'bg-warning-100 text-warning-800 border-warning-200',
    dot: 'bg-warning-500',
  },
  [ProjectStatus.COMPLETED]: {
    label: 'Completed',
    color: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    dot: 'bg-neutral-500',
  },
  [ProjectStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-error-100 text-error-800 border-error-200',
    dot: 'bg-error-500',
  },
};

const priorityConfig = {
  [ProjectPriority.LOW]: { icon: null, color: 'text-success-600' },
  [ProjectPriority.MEDIUM]: { icon: null, color: 'text-warning-600' },
  [ProjectPriority.HIGH]: { icon: AlertCircle, color: 'text-error-600' },
  [ProjectPriority.CRITICAL]: { icon: AlertCircle, color: 'text-error-700' },
};

export function ProjectList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<ProjectPriority[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const filters: ProjectFilters = {
    status: selectedStatus.length > 0 ? selectedStatus : undefined,
    priority: selectedPriority.length > 0 ? selectedPriority : undefined,
    searchTerm: searchQuery || undefined,
  };

  const { data, isLoading, error } = useProjects({
    filters,
    page: 1,
    limit: 20,
  });

  const handleCreateProject = () => {
    navigate('/app/projects/create');
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/app/projects/${projectId}`);
  };

  const handleEditProject = (projectId: string) => {
    navigate(`/app/projects/${projectId}/edit`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" label="Loading projects..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 border border-error-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-error-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-error-900 mb-2">Failed to load projects</h3>
        <p className="text-error-700">{(error as Error).message}</p>
      </div>
    );
  }

  const projects = data?.projects || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface-primary rounded-lg border border-border-primary p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
            <p className="text-text-secondary mt-1">
              Manage your fibre installation projects
            </p>
          </div>
          <button
            onClick={handleCreateProject}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border-primary rounded-lg bg-background-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-border-focus"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "px-4 py-2 border rounded-lg font-medium flex items-center space-x-2 transition-colors",
              showFilters 
                ? "bg-primary-50 border-primary-200 text-primary-700"
                : "bg-surface-primary border-border-primary text-text-primary hover:bg-surface-secondary"
            )}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {(selectedStatus.length > 0 || selectedPriority.length > 0) && (
              <span className="bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {selectedStatus.length + selectedPriority.length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 p-4 bg-surface-secondary rounded-lg border border-border-secondary">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-2">Status</h4>
                <div className="space-y-2">
                  {Object.values(ProjectStatus).map((status) => (
                    <label key={status} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedStatus.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStatus([...selectedStatus, status]);
                          } else {
                            setSelectedStatus(selectedStatus.filter(s => s !== status));
                          }
                        }}
                        className="rounded border-border-primary text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-text-primary">
                        {statusConfig[status].label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-2">Priority</h4>
                <div className="space-y-2">
                  {Object.values(ProjectPriority).map((priority) => (
                    <label key={priority} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedPriority.includes(priority)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPriority([...selectedPriority, priority]);
                          } else {
                            setSelectedPriority(selectedPriority.filter(p => p !== priority));
                          }
                        }}
                        className="rounded border-border-primary text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-text-primary capitalize">
                        {priority}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-surface-primary rounded-lg border border-border-primary p-12 text-center">
          <FolderOpen className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No projects found</h3>
          <p className="text-text-secondary mb-4">
            {searchQuery || selectedStatus.length > 0 || selectedPriority.length > 0
              ? 'Try adjusting your filters'
              : 'Get started by creating your first project'}
          </p>
          {!searchQuery && selectedStatus.length === 0 && selectedPriority.length === 0 && (
            <button
              onClick={handleCreateProject}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Project</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => {
            const status = statusConfig[project.status];
            const priority = priorityConfig[project.priority];
            const PriorityIcon = priority.icon;

            return (
              <div
                key={project.id}
                className="bg-surface-primary rounded-lg border border-border-primary hover:border-border-focus hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => handleViewProject(project.id)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text-primary truncate">
                        {project.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={cn(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                          status.color
                        )}>
                          <div className={cn('w-1.5 h-1.5 rounded-full mr-1', status.dot)} />
                          {status.label}
                        </span>
                        {PriorityIcon && (
                          <PriorityIcon className={cn('w-4 h-4', priority.color)} />
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActionMenu(showActionMenu === project.id ? null : project.id);
                        }}
                        className="p-1 hover:bg-surface-secondary rounded transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-text-tertiary" />
                      </button>
                      
                      {showActionMenu === project.id && (
                        <div className="absolute right-0 top-8 w-48 bg-surface-elevated rounded-lg shadow-lg border border-border-primary py-1 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProject(project.id);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface-secondary flex items-center space-x-2"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProject(project.id);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface-secondary flex items-center space-x-2"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit Project</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle delete
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-error-600 hover:bg-error-50 flex items-center space-x-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-text-secondary">
                      <MapPin className="w-4 h-4 mr-2 text-text-tertiary" />
                      <span className="truncate">
                        {project.location.city}, {project.location.province}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-text-secondary">
                      <Calendar className="w-4 h-4 mr-2 text-text-tertiary" />
                      <span>
                        {formatDate(project.startDate)} - {formatDate(project.endDate)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-text-secondary">
                      <Users className="w-4 h-4 mr-2 text-text-tertiary" />
                      <span>{project.teamMembers?.length || 0} team members</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-text-secondary">Progress</span>
                      <span className="font-medium text-text-primary">
                        {project.progress.overallPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-secondary rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress.overallPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}