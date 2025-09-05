import { useState } from 'react';
import { useRouter } from 'next/router';
// // import { useUser } from '@clerk/nextjs';
import { useProjects, useCreateProject, useDeleteProject } from '@/hooks/useProjects';
import { useStore } from '@/store/useStore';
import { useForm } from 'react-hook-form';
import type { NewProject } from '@/lib/db';

export default function ProjectsPage() {
  // For testing: mock user
  const user = { id: 'test-user-123', name: 'Test User' };
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Zustand store
  const { projectFilters, setProjectFilters, setSelectedProject } = useStore();
  
  // React Query hooks
  const { data: projects, isLoading, error } = useProjects();
  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();
  
  // React Hook Form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewProject>();
  
  // Handle project creation
  const onSubmit = async (data: NewProject) => {
    try {
      await createProjectMutation.mutateAsync(data);
      reset();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };
  
  // Handle project selection
  const handleSelectProject = (project: any) => {
    setSelectedProject(project);
    router.push(`/projects/${project.id}`);
  };
  
  // Handle project deletion
  const handleDeleteProject = async (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProjectMutation.mutateAsync(id);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setProjectFilters({ [key]: value || undefined });
  };
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please sign in to view projects</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="mt-2 text-gray-600">Manage your FibreFlow projects</p>
        </div>
        
        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search projects..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={projectFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={projectFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Project
          </button>
        </div>
        
        {/* Create Project Form */}
        {showCreateForm && (
          <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  {...register('name', { required: 'Project name is required' })}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={createProjectMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setShowCreateForm(false);
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Projects List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Loading projects...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">Error loading projects</p>
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSelectProject(project)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {project.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {project.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            project.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : project.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">No projects found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}