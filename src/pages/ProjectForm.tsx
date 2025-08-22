import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useProjectForm } from '@/hooks/useProjects';
import { useClientSelection } from '@/hooks/useClients';
import { useProjectManagerSelection } from '@/hooks/useStaff';
import { ProjectFormData, ProjectStatus, ProjectType, Priority } from '@/types/project.types';
import { SOWUploadWizard } from '@/components/sow/SOWUploadWizard';
import { safeToISOString } from '@/utils/dateHelpers';

export function ProjectForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const { project, isLoading, save, error } = useProjectForm(id);
  const { clients, isLoading: isClientsLoading } = useClientSelection();
  const { isLoading: isManagersLoading, getAvailableProjectManagers } = useProjectManagerSelection();

  const [formData, setFormData] = useState<ProjectFormData>({
    code: '',
    name: '',
    description: '',
    clientId: '',
    location: '',
    projectType: ProjectType.FIBER,
    priority: Priority.MEDIUM,
    status: ProjectStatus.PLANNING,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
    projectManagerId: '',
    budget: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSOWWizard, setShowSOWWizard] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (project) {
      setFormData({
        code: project.code,
        name: project.name,
        description: project.description || '',
        clientId: project.clientId || '',
        location: project.location || '',
        projectType: project.projectType,
        priority: project.priority,
        status: project.status,
        startDate: safeToISOString(project.startDate),
        endDate: safeToISOString(project.endDate),
        projectManagerId: project.projectManagerId || '',
        budget: project.budget || 0,
      });
    }
  }, [project]);

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await save(formData);
      
      if (result && !isEditing) {
        // Project created successfully - show SOW wizard
        setCreatedProjectId(result);
        setIsSubmitting(false);
        setShowSOWWizard(true);
      } else {
        // Updated existing project, navigate back to list
        navigate('/app/projects');
      }
    } catch (error) {
      console.error('Failed to save project:', error);
      setIsSubmitting(false);
    }
  };

  const handleSOWComplete = () => {
    setShowSOWWizard(false);
    // Navigate to the project detail page
    if (createdProjectId) {
      navigate(`/app/projects/${createdProjectId}`);
    } else {
      navigate('/app/projects');
    }
  };

  const handleSOWCancel = () => {
    setShowSOWWizard(false);
    // Still navigate to project detail, just skip SOW upload
    if (createdProjectId) {
      navigate(`/app/projects/${createdProjectId}`);
    } else {
      navigate('/app/projects');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/app/projects')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing 
              ? 'Update project information and settings' 
              : 'Set up a new fiber optic project'
            }
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error.message}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Project Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., LAW-001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Lawley Fiber Installation"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the project scope and objectives..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Lawley, Johannesburg"
                  required
                />
              </div>

            </div>
          </div>
        </div>

        {/* Client Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Client Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Organization *
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => handleInputChange('clientId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isClientsLoading}
                >
                  <option value="">
                    {isClientsLoading ? 'Loading clients...' : 'Select a client'}
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.contactPerson})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Choose the client organization for this project
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Project Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Project Details</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Type *
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => handleInputChange('projectType', e.target.value as ProjectType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {Object.values(ProjectType).map(type => (
                    <option key={type} value={type}>
                      {type.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value as Priority)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {Object.values(Priority).map(priority => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as ProjectStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {Object.values(ProjectStatus).map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Schedule & Budget Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Schedule & Budget</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate.split('T')[0]}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate.split('T')[0]}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (ZAR) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

        </div>

        {/* Project Manager Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Project Assignment</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Manager *
                </label>
                <select
                  value={formData.projectManagerId}
                  onChange={(e) => handleInputChange('projectManagerId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isManagersLoading}
                >
                  <option value="">
                    {isManagersLoading ? 'Loading project managers...' : 'Select a project manager'}
                  </option>
                  {getAvailableProjectManagers().map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name} - {manager.position} ({manager.currentProjectCount}/{manager.maxProjectCount} projects)
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Choose an available project manager to lead this project
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Form Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/app/projects')}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Project' : 'Create Project'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* SOW Upload Wizard */}
      {showSOWWizard && createdProjectId && (
        <SOWUploadWizard
          projectId={createdProjectId}
          projectName={formData.name}
          onComplete={handleSOWComplete}
          onCancel={handleSOWCancel}
        />
      )}

    </div>
  );
}