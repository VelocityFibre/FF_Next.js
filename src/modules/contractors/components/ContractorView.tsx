/**
 * ContractorView Component - Detailed contractor view following FibreFlow patterns
 * Comprehensive contractor information with tabs for teams, assignments, and documents
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Building2, Users, FileText, Briefcase, CheckCircle } from 'lucide-react';
import { contractorService } from '@/services/contractorService';
import { Contractor } from '@/types/contractor.types';
import {
  ContractorInfoSection,
  ContactDetailsSection,
  CompanyDetailsSection,
  AddressDetailsSection,
  FinancialDetailsSection,
  PerformanceMetricsSection,
  ProjectMetricsSection,
  NotesSection
} from './ContractorDetailSections';
import { TeamManagement } from './teams/TeamManagement';
import { AssignmentManagement } from './assignments/AssignmentManagement';
import { RAGDashboard } from './RAGDashboard';
import { OnboardingWorkflow } from './onboarding/OnboardingWorkflow';
import { DocumentManagement } from './documents/DocumentManagement';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export function ContractorView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'assignments' | 'documents' | 'onboarding'>('overview');

  useEffect(() => {
    const loadContractor = async () => {
      if (!id) {
        navigate('/app/contractors');
        return;
      }

      try {
        const contractorData = await contractorService.getById(id);
        if (!contractorData) {
          toast.error('Contractor not found');
          navigate('/app/contractors');
          return;
        }
        setContractor(contractorData);
      } catch (error) {
        console.error('Failed to load contractor:', error);
        toast.error('Failed to load contractor data');
        navigate('/app/contractors');
      } finally {
        setIsLoading(false);
      }
    };

    loadContractor();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!id || !contractor) return;
    
    setIsDeleting(true);
    try {
      await contractorService.delete(id);
      toast.success('Contractor deleted successfully');
      navigate('/app/contractors');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete contractor');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" label="Loading contractor..." />
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Building2 className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Contractor not found</h3>
          <button
            onClick={() => navigate('/app/contractors')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Contractors
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
          onClick={() => navigate('/app/contractors')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Contractors
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <ContractorInfoSection contractor={contractor} />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/app/contractors/${id}/edit`)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
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
              onClick={() => setActiveTab('teams')}
              className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'teams'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4" />
              Teams
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'assignments'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Assignments ({contractor.activeProjects})
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'documents'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              Documents ({contractor.documentsExpiring})
            </button>
            <button
              onClick={() => setActiveTab('onboarding')}
              className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'onboarding'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Onboarding
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <ContactDetailsSection contractor={contractor} />
            <CompanyDetailsSection contractor={contractor} />
            <AddressDetailsSection contractor={contractor} />
            <FinancialDetailsSection contractor={contractor} />
            <NotesSection contractor={contractor} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <PerformanceMetricsSection contractor={contractor} />
            <ProjectMetricsSection contractor={contractor} />
            <RAGDashboard contractorId={contractor.id} />
          </div>
        </div>
      )}

      {activeTab === 'teams' && (
        <TeamManagement 
          contractorId={contractor.id} 
          contractorName={contractor.companyName} 
        />
      )}

      {activeTab === 'assignments' && (
        <AssignmentManagement 
          contractorId={contractor.id} 
          contractorName={contractor.companyName} 
        />
      )}

      {activeTab === 'documents' && (
        <DocumentManagement 
          contractorId={contractor.id} 
          contractorName={contractor.companyName} 
        />
      )}

      {activeTab === 'onboarding' && (
        <OnboardingWorkflow 
          contractorId={contractor.id} 
          contractorName={contractor.companyName} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Contractor?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{contractor.companyName}"? This action cannot be undone and will remove all associated data.
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
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Contractor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}