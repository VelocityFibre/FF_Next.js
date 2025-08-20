import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Building, MoreVertical, Activity, FileText } from 'lucide-react';
import { useClient, useDeleteClient } from '@/hooks/useClients';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  ClientInfoSection,
  ContactDetailsSection,
  CompanyDetailsSection,
  AddressDetailsSection,
  FinancialDetailsSection,
  ProjectMetricsSection,
  ServiceTypesSection,
  NotesSection
} from './ClientDetailSections';
import { useAuth } from '@/contexts/AuthContext';
import { Permission } from '@/types/auth.types';

export function ClientDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const { data: client, isLoading, error } = useClient(id || '');
  const deleteMutation = useDeleteClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'history'>('overview');

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteMutation.mutateAsync(id);
      navigate('/app/clients');
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" label="Loading client..." />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Building className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Client not found</h3>
          <button
            onClick={() => navigate('/app/clients')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Client List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/app/clients')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Client List
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <ClientInfoSection client={client} />
            </div>

            {hasPermission(Permission.EDIT_CLIENTS) && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/app/clients/${id}/edit`)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                
                {hasPermission(Permission.DELETE_CLIENTS) && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'projects'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              Projects ({client.totalProjects})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              Contact History
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <ContactDetailsSection client={client} />
            <CompanyDetailsSection client={client} />
            <AddressDetailsSection client={client} />
            <ServiceTypesSection client={client} />
            <NotesSection client={client} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <FinancialDetailsSection client={client} />
            <ProjectMetricsSection client={client} />
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Client Projects</h3>
            {hasPermission(Permission.CREATE_PROJECTS) && (
              <button
                onClick={() => navigate(`/app/projects/new?clientId=${id}`)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                New Project
              </button>
            )}
          </div>
          
          {client.totalProjects > 0 ? (
            <div className="text-gray-600">
              <p className="mb-4">
                This client has {client.activeProjects} active project{client.activeProjects !== 1 ? 's' : ''} and {' '}
                {client.completedProjects} completed project{client.completedProjects !== 1 ? 's' : ''}.
              </p>
              <button
                onClick={() => navigate(`/app/projects?clientId=${id}`)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Projects →
              </button>
            </div>
          ) : (
            <p className="text-gray-500">No projects found for this client.</p>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact History</h3>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Add Contact
            </button>
          </div>
          <p className="text-gray-500">Contact history feature coming soon.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Client?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{client.name}"? This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}