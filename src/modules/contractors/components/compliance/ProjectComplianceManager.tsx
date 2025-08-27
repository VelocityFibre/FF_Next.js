/**
 * ProjectComplianceManager Component - Simplified project compliance management
 * Following FibreFlow patterns and staying under 200 lines
 */

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ProjectComplianceRequirement, ContractorComplianceRecord } from '@/services/contractor/contractorComplianceService';
import { ProjectRequirementsList } from './project/ProjectRequirementsList';
import { ComplianceTrackingList } from './project/ComplianceTrackingList';
import { AddRequirementModal } from './project/AddRequirementModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { log } from '@/lib/logger';

interface ProjectComplianceManagerProps {
  projectId: string;
  projectName: string;
  contractorId?: string;
  mode: 'requirements' | 'tracking';
}

export function ProjectComplianceManager({ 
  projectId, 
  projectName, 
  contractorId, 
  mode 
}: ProjectComplianceManagerProps) {
  const [requirements, setRequirements] = useState<ProjectComplianceRequirement[]>([]);
  const [complianceRecords, setComplianceRecords] = useState<ContractorComplianceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId, contractorId, mode]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      if (mode === 'requirements') {
        const reqs = await loadProjectRequirements(projectId);
        setRequirements(reqs);
      } else {
        const records = await loadContractorComplianceRecords(projectId, contractorId!);
        setComplianceRecords(records);
      }
    } catch (error) {
      log.error('Failed to load compliance data:', { data: error }, 'ProjectComplianceManager');
      toast.error('Failed to load compliance data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectRequirements = async (projectId: string): Promise<ProjectComplianceRequirement[]> => {
    return [
      {
        id: 'req_001',
        projectId,
        requirementType: 'insurance',
        requirement: 'Public Liability Insurance minimum R10 million',
        isMandatory: true,
        minimumStandard: { amount: 10000000, currency: 'ZAR' },
        verificationMethod: 'document_review',
        renewalFrequency: 'annually',
        effectiveDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'req_002',
        projectId,
        requirementType: 'safety',
        requirement: 'Construction Safety Certificate',
        isMandatory: true,
        minimumStandard: { validCertification: true },
        verificationMethod: 'document_review',
        renewalFrequency: 'annually',
        effectiveDate: new Date()
      },
      {
        id: 'req_003',
        projectId,
        requirementType: 'bbbee',
        requirement: 'BBBEE Level 4 or better',
        isMandatory: false,
        minimumStandard: { level: 4 },
        verificationMethod: 'document_review',
        renewalFrequency: 'annually',
        effectiveDate: new Date()
      }
    ];
  };

  const loadContractorComplianceRecords = async (
    projectId: string, 
    contractorId: string
  ): Promise<ContractorComplianceRecord[]> => {
    return [
      {
        id: 'record_001',
        contractorId,
        projectId,
        requirementId: 'req_001',
        complianceStatus: 'compliant',
        verificationDate: new Date(),
        verifiedBy: 'admin@fibreflow.com',
        nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        evidence: [
          {
            id: 'evidence_001',
            documentType: 'Insurance Certificate',
            documentUrl: '/documents/insurance_cert.pdf',
            uploadedDate: new Date(),
            verificationStatus: 'verified'
          }
        ],
        riskLevel: 'low'
      },
      {
        id: 'record_002',
        contractorId,
        projectId,
        requirementId: 'req_002',
        complianceStatus: 'pending',
        nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        evidence: [],
        riskLevel: 'medium'
      }
    ];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" label="Loading compliance data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'requirements' ? 'Compliance Requirements' : 'Compliance Tracking'}
          </h2>
          <p className="text-gray-600">
            {projectName} {contractorId && mode === 'tracking' ? '- Contractor Compliance' : ''}
          </p>
        </div>
        {mode === 'requirements' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Requirement
          </button>
        )}
      </div>

      {/* Content */}
      {mode === 'requirements' ? (
        <ProjectRequirementsList requirements={requirements} />
      ) : (
        <ComplianceTrackingList 
          records={complianceRecords} 
          requirements={requirements}
        />
      )}

      {/* Add Requirement Modal */}
      {showAddForm && (
        <AddRequirementModal
          projectId={projectId}
          onClose={() => setShowAddForm(false)}
          onSave={(requirement) => {
            setRequirements(prev => [...prev, requirement]);
            setShowAddForm(false);
            toast.success('Requirement added successfully');
          }}
        />
      )}
    </div>
  );
}