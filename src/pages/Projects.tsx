import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  DollarSign,
  Progress,
  Building2
} from 'lucide-react';
import { useProjects, useDeleteProject, useProjectFilters } from '@/hooks/useProjects';
import { ProjectStatus, ProjectType, Priority } from '@/types/project.types';

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

export function Projects() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { filter, updateFilter, clearFilter, hasActiveFilters } = useProjectFilters();
  const { data: projects = [], isLoading, error } = useProjects(filter);
  const deleteMutation = useDeleteProject();

  // Filter projects by search term
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await deleteMutation.mutateAsync(id);
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load projects</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all your fiber optic projects
          </p>
        </div>
        <button
          onClick={() => navigate('/app/projects/new')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Project
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search projects by name, code, or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
            hasActiveFilters 
              ? 'bg-blue-50 text-blue-700 border-blue-200' 
              : 'text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-5 w-5 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
              Active
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilter}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                multiple
                value={filter.status || []}
                onChange={(e) => updateFilter({ 
                  status: Array.from(e.target.selectedOptions, option => option.value) as ProjectStatus[]
                })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(ProjectStatus).map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
              <select
                multiple
                value={filter.projectType || []}
                onChange={(e) => updateFilter({ 
                  projectType: Array.from(e.target.selectedOptions, option => option.value) as ProjectType[]
                })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(ProjectType).map(type => (
                  <option key={type} value={type}>
                    {type.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                multiple
                value={filter.priorityLevel || []}
                onChange={(e) => updateFilter({ 
                  priorityLevel: Array.from(e.target.selectedOptions, option => option.value) as Priority[]
                })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(Priority).map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Project Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || hasActiveFilters 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first project'
            }
          </p>
          {!searchTerm && !hasActiveFilters && (
            <button
              onClick={() => navigate('/app/projects/new')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="text-lg font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600"
                      onClick={() => navigate(`/app/projects/${project.id}`)}
                    >
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-500">{project.projectCode}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
                    </span>
                    
                    {/* Actions Menu */}
                    <div className="relative group">
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      <div className="absolute right-0 top-8 bg-white shadow-lg border border-gray-200 rounded-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[120px]">
                        <button
                          onClick={() => navigate(`/app/projects/${project.id}`)}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/app/projects/${project.id}/edit`)}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id!)}
                          className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Info */}
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <Building2 className="h-4 w-4 mr-1" />
                  {project.clientName || 'No client assigned'}
                </div>

                {/* Project Type & Priority */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {project.projectType.toUpperCase()}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${priorityColors[project.priorityLevel]}`}>
                    {project.priorityLevel.charAt(0).toUpperCase() + project.priorityLevel.slice(1)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(project.overallProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.overallProgress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Project Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Due Date</p>
                      <p className="font-medium">{formatDate(project.expectedEndDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="font-medium">{formatCurrency(project.budget)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}