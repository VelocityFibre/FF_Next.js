import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Users,
  FileText,
  BarChart3,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Upload,
  Download,
  Eye,
  MoreVertical
} from 'lucide-react';
import { useProject, useDeleteProject } from '../hooks/useProjects';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProjectStatus, ProjectPriority, SOWDocumentType } from '../types/project.types';
import { cn } from '@/utils/cn';
import { useAuth } from '@/contexts/AuthContext';
import { Permission } from '@/types/auth.types';

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

const priorityIcons = {
  [ProjectPriority.LOW]: null,
  [ProjectPriority.MEDIUM]: null,
  [ProjectPriority.HIGH]: AlertCircle,
  [ProjectPriority.CRITICAL]: AlertCircle,
};

export function ProjectDetail() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'documents' | 'progress'>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { data: project, isLoading, error } = useProject(projectId || '');
  const deleteProject = useDeleteProject();

  const handleEdit = () => {
    navigate(`/app/projects/${projectId}/edit`);
  };

  const handleDelete = async () => {
    if (!projectId) return;
    
    try {
      await deleteProject.mutateAsync(projectId);
      navigate('/app/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateDaysRemaining = () => {
    if (!project) return 0;
    const end = new Date(project.endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" label="Loading project..." />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-error-50 border border-error-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-error-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-error-900 mb-2">Project not found</h3>
        <button
          onClick={() => navigate('/app/projects')}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const status = statusConfig[project.status];
  const PriorityIcon = priorityIcons[project.priority];
  const daysRemaining = calculateDaysRemaining();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-surface-primary rounded-lg border border-border-primary p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/app/projects')}
              className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-text-secondary" />
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                {project.name}
              </h1>
              <div className="flex items-center space-x-3">
                <span className={cn(
                  'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
                  status.color
                )}>
                  <div className={cn('w-2 h-2 rounded-full mr-2', status.dot)} />
                  {status.label}
                </span>
                
                {PriorityIcon && (
                  <span className={cn(
                    'inline-flex items-center space-x-1 text-sm',
                    project.priority === ProjectPriority.CRITICAL 
                      ? 'text-error-700' 
                      : 'text-warning-600'
                  )}>
                    <PriorityIcon className="w-4 h-4" />
                    <span className="capitalize">{project.priority} Priority</span>
                  </span>
                )}
                
                <span className="text-sm text-text-tertiary">
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
          
          {hasPermission(Permission.EDIT_PROJECTS) && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              
              {hasPermission(Permission.DELETE_PROJECTS) && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-border-secondary">
          {['overview', 'team', 'documents', 'progress'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                'px-4 py-2 font-medium capitalize transition-colors',
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Details */}
          <div className="lg:col-span-2 bg-surface-primary rounded-lg border border-border-primary p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Project Details</h2>
            
            <div className="space-y-4">
              {project.description && (
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-1">Description</h3>
                  <p className="text-text-primary">{project.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-1">Start Date</h3>
                  <p className="text-text-primary flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-text-tertiary" />
                    {formatDate(project.startDate)}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-1">End Date</h3>
                  <p className="text-text-primary flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-text-tertiary" />
                    {formatDate(project.endDate)}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-1">Location</h3>
                  <p className="text-text-primary flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-text-tertiary" />
                    {project.location.city}, {project.location.province}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-1">Client</h3>
                  <p className="text-text-primary">{project.clientName || project.clientId}</p>
                </div>
              </div>

              {/* Progress Overview */}
              <div className="border-t border-border-secondary pt-4">
                <h3 className="text-sm font-medium text-text-secondary mb-3">Progress Overview</h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-text-secondary">Overall Progress</span>
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
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Tasks</span>
                      <span className="font-medium text-text-primary">
                        {project.progress.tasksCompleted}/{project.progress.totalTasks}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Poles</span>
                      <span className="font-medium text-text-primary">
                        {project.progress.polesInstalled}/{project.progress.totalPoles}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Drops</span>
                      <span className="font-medium text-text-primary">
                        {project.progress.dropsCompleted}/{project.progress.totalDrops}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Fibre Cable</span>
                      <span className="font-medium text-text-primary">
                        {project.progress.fibreCableInstalled}m/{project.progress.totalFibreCableRequired}m
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Summary */}
          <div className="bg-surface-primary rounded-lg border border-border-primary p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Budget
            </h2>
            
            {project.budget ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Total Budget</span>
                  <span className="font-medium text-text-primary">
                    R{project.budget.totalBudget?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Spent</span>
                  <span className="font-medium text-text-primary">
                    R{project.budget.spentAmount?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Remaining</span>
                  <span className="font-medium text-success-600">
                    R{project.budget.remainingBudget?.toLocaleString() || 0}
                  </span>
                </div>
                
                <div className="border-t border-border-secondary pt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-text-secondary">Budget Utilization</span>
                    <span className="font-medium text-text-primary">
                      {Math.round((project.budget.spentAmount / project.budget.totalBudget) * 100) || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-surface-secondary rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        (project.budget.spentAmount / project.budget.totalBudget) > 0.9
                          ? "bg-error-500"
                          : (project.budget.spentAmount / project.budget.totalBudget) > 0.7
                          ? "bg-warning-500"
                          : "bg-success-500"
                      )}
                      style={{ 
                        width: `${Math.min(100, Math.round((project.budget.spentAmount / project.budget.totalBudget) * 100) || 0)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">No budget information available</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="bg-surface-primary rounded-lg border border-border-primary p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Team Members</h2>
            {hasPermission(Permission.EDIT_PROJECTS) && (
              <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors">
                <Users className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            )}
          </div>
          
          {project.teamMembers && project.teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.teamMembers.map((member) => (
                <div
                  key={member.staffId}
                  className="border border-border-secondary rounded-lg p-4 hover:border-border-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-text-primary">
                        {member.name || 'Team Member'}
                      </h3>
                      <p className="text-sm text-text-secondary">{member.role}</p>
                      <p className="text-sm text-text-tertiary">{member.position}</p>
                      <p className="text-xs text-text-tertiary mt-2">
                        Joined {new Date(member.assignedDate).toLocaleDateString()}
                      </p>
                    </div>
                    {member.isActive ? (
                      <span className="px-2 py-1 bg-success-100 text-success-700 text-xs rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary">No team members assigned yet</p>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-surface-primary rounded-lg border border-border-primary p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">SOW Documents</h2>
            {hasPermission(Permission.MANAGE_SOW) && (
              <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
              </button>
            )}
          </div>
          
          {project.sowDocuments && project.sowDocuments.length > 0 ? (
            <div className="space-y-3">
              {project.sowDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between border border-border-secondary rounded-lg p-4 hover:border-border-primary transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-text-tertiary" />
                    <div>
                      <h3 className="font-medium text-text-primary">{doc.name}</h3>
                      <p className="text-sm text-text-secondary capitalize">
                        {doc.type.replace('_', ' ')} • Version {doc.version}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <a
                      href={doc.fileUrl}
                      download
                      className="p-2 text-text-secondary hover:bg-surface-secondary rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary">No SOW documents uploaded yet</p>
          )}
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="bg-surface-primary rounded-lg border border-border-primary p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Project Progress</h2>
          
          {project.progress.phases && project.progress.phases.length > 0 ? (
            <div className="space-y-4">
              {project.progress.phases.map((phase) => (
                <div key={phase.id} className="border border-border-secondary rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-text-primary">{phase.name}</h3>
                      {phase.description && (
                        <p className="text-sm text-text-secondary">{phase.description}</p>
                      )}
                    </div>
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      phase.status === ProjectStatus.COMPLETED
                        ? 'bg-success-100 text-success-700'
                        : phase.status === ProjectStatus.ACTIVE
                        ? 'bg-info-100 text-info-700'
                        : 'bg-neutral-100 text-neutral-700'
                    )}>
                      {phase.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Progress</span>
                      <span className="font-medium text-text-primary">{phase.progress}%</span>
                    </div>
                    <div className="w-full bg-surface-secondary rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${phase.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-tertiary">
                      <span>{formatDate(phase.startDate)}</span>
                      <span>{formatDate(phase.endDate)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary">No project phases defined yet</p>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-surface-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-surface-primary rounded-lg shadow-xl border border-border-primary p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Delete Project?</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-border-primary rounded-lg font-medium text-text-primary hover:bg-surface-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-error-600 hover:bg-error-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}