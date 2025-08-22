import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Building2,
  CheckCircle,
  Circle,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import { useProject, useProjectHierarchy, useDeleteProject } from '@/hooks/useProjects';
import { ProjectStatus, PhaseStatus, TaskStatus, Priority } from '@/types/project.types';
import { EnhancedSOWDisplay } from '@/components/sow/EnhancedSOWDisplay';

const statusColors = {
  [ProjectStatus.PLANNING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  [ProjectStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  [ProjectStatus.ON_HOLD]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  [ProjectStatus.COMPLETED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  [ProjectStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
};

const priorityColors = {
  [Priority.LOW]: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
  [Priority.MEDIUM]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  [Priority.HIGH]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  [Priority.CRITICAL]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
};

const getPhaseStatusIcon = (status: PhaseStatus) => {
  switch (status) {
    case PhaseStatus.COMPLETED:
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case PhaseStatus.IN_PROGRESS:
      return <PlayCircle className="h-5 w-5 text-blue-600" />;
    case PhaseStatus.ON_HOLD:
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    default:
      return <Circle className="h-5 w-5 text-gray-400" />;
  }
};

export function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'hierarchy' | 'sow' | 'timeline'>('overview');
  
  const { data: project, isLoading, error } = useProject(id!);
  const { data: hierarchy, isLoading: isHierarchyLoading } = useProjectHierarchy(id!);
  const deleteMutation = useDeleteProject();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
          <p className="text-gray-600 mb-4">
            The project you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => navigate('/app/projects')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await deleteMutation.mutateAsync(id!);
      navigate('/app/projects');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-ZA', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'hierarchy', label: 'Project Hierarchy' },
    { id: 'sow', label: 'SOW Data' },
    { id: 'timeline', label: 'Timeline' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/app/projects')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-1">{project.code}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/app/projects/${id}/edit`)}
            className="inline-flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
          <button
            onClick={handleDeleteProject}
            className="inline-flex items-center px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Project Status & Priority */}
      <div className="flex items-center gap-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status] || 'bg-gray-100 text-gray-800'}`}>
          {project.status ? (project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')) : 'Unknown'}
        </span>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priorityColors[project.priority] || 'bg-gray-100 text-gray-800'}`}>
          {project.priority ? (project.priority.charAt(0).toUpperCase() + project.priority.slice(1) + ' Priority') : 'No Priority'}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          {project.projectType ? project.projectType.toUpperCase() : 'STANDARD'}
        </span>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h2>
              
              <div className="space-y-4">
                {project.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                    <p className="text-gray-900">{project.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                    <div className="flex items-center text-gray-900">
                      <MapPin className="h-4 w-4 mr-2" />
                      {project.location}
                    </div>
                  </div>
                  
                  {project.clientName && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Client</h3>
                      <div className="flex items-center text-gray-900">
                        <Building2 className="h-4 w-4 mr-2" />
                        {project.clientName}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Overall Progress</span>
                    <span>{Math.round(project.actualProgress || 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${project.actualProgress || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-semibold text-gray-900">{0}</div>
                    <div className="text-sm text-gray-500">Tasks Completed</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-semibold text-gray-900">{0}</div>
                    <div className="text-sm text-gray-500">Active Tasks</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Start Date</p>
                    <p className="text-sm text-gray-500">{formatDate(project.startDate)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Expected End</p>
                    <p className="text-sm text-gray-500">{formatDate(project.endDate)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Budget</p>
                    <p className="text-sm text-gray-500">{formatCurrency(project.budget || 0)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Working Hours</p>
                    <p className="text-sm text-gray-500">N/A</p>
                  </div>
                </div>

                {project.projectManager && (
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Project Manager</p>
                      <p className="text-sm text-gray-500">{project.projectManager}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Budget Used</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(project.actualCost || 0)}
                  </span>
                </div>
                
                {project.actualCost && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Actual Cost</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(project.actualCost)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Phase</span>
                  <span className="text-sm font-medium text-gray-900">
                    {project.phase || 'Planning'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {activeTab === 'hierarchy' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isHierarchyLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : hierarchy ? (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Project Hierarchy</h2>
              
              <div className="space-y-6">
                {hierarchy.phases && hierarchy.phases.length > 0 ? (
                  hierarchy.phases.map((phase: any) => (
                    <div key={phase.id} className="border border-gray-200 rounded-lg">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getPhaseStatusIcon(phase.status)}
                          <div className="ml-3">
                            <h3 className="text-base font-semibold text-gray-900">
                              Phase {phase.order}: {phase.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {phase.status.replace('_', ' ')} • {Math.round(phase.progress)}% complete
                            </p>
                          </div>
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${phase.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {phase.steps && phase.steps.length > 0 && (
                      <div className="p-4">
                        <div className="space-y-4">
                          {phase.steps.map((step: any) => (
                            <div key={step.id} className="ml-4 border-l-2 border-gray-200 pl-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {step.name}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    {step.status.replace('_', ' ')} • {step.estimatedHours}h estimated
                                  </p>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {Math.round(step.progress)}%
                                </div>
                              </div>
                              
                              {step.tasks && step.tasks.length > 0 && (
                                <div className="mt-2 ml-4 space-y-1">
                                  {step.tasks.slice(0, 3).map((task: any) => (
                                    <div key={task.id} className="flex items-center text-xs">
                                      <div className={`w-2 h-2 rounded-full mr-2 ${
                                        task.status === TaskStatus.COMPLETED 
                                          ? 'bg-green-500' 
                                          : task.status === TaskStatus.IN_PROGRESS
                                          ? 'bg-blue-500'
                                          : 'bg-gray-300'
                                      }`}></div>
                                      <span className="text-gray-600 truncate">{task.name}</span>
                                    </div>
                                  ))}
                                  {step.tasks.length > 3 && (
                                    <div className="text-xs text-gray-500 ml-4">
                                      +{step.tasks.length - 3} more tasks
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No project phases available</p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">No hierarchy data available</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sow' && (
        <EnhancedSOWDisplay projectId={id!} projectName={project.name} />
      )}

      {activeTab === 'timeline' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline</h2>
          <p className="text-gray-500">Timeline view coming soon...</p>
        </div>
      )}
    </div>
  );
}