/**
 * ProjectComplianceManager Component - Project-specific compliance requirements and tracking
 * Following FibreFlow patterns and keeping under 250 lines
 */

import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, FileText, Calendar, Settings, Plus, Trash2 } from 'lucide-react';
import { ProjectComplianceRequirement, ContractorComplianceRecord } from '@/services/contractor/contractorComplianceService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

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
        // Load project compliance requirements
        const reqs = await loadProjectRequirements(projectId);
        setRequirements(reqs);
      } else {
        // Load contractor compliance tracking for project
        const records = await loadContractorComplianceRecords(projectId, contractorId!);
        setComplianceRecords(records);
      }
    } catch (error) {
      console.error('Failed to load compliance data:', error);
      toast.error('Failed to load compliance data');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data loaders (would integrate with actual services)
  const loadProjectRequirements = async (projectId: string): Promise<ProjectComplianceRequirement[]> => {
    // Mock project-specific requirements
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
    // Mock compliance records
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

  const getComplianceStatusColor = (status: string) => {
    const colors = {
      compliant: 'bg-green-100 text-green-800',
      non_compliant: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRequirementTypeIcon = (type: string) => {
    const icons = {
      insurance: <FileText className="w-4 h-4" />,
      safety: <AlertTriangle className="w-4 h-4" />,
      bbbee: <CheckCircle className="w-4 h-4" />,
      financial: <Calendar className="w-4 h-4" />,
      technical: <Settings className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || <FileText className="w-4 h-4" />;
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

      {mode === 'requirements' ? (
        /* Requirements Management */
        <div className="space-y-4">
          {requirements.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No compliance requirements defined</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Add your first requirement
              </button>
            </div>
          ) : (
            requirements.map((requirement) => (
              <div key={requirement.id} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      {getRequirementTypeIcon(requirement.requirementType)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{requirement.requirement}</h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>Type: <span className="font-medium">{requirement.requirementType.toUpperCase()}</span></p>
                        <p>Verification: <span className="font-medium">{requirement.verificationMethod.replace('_', ' ')}</span></p>
                        <p>Renewal: <span className="font-medium">{requirement.renewalFrequency}</span></p>
                        {requirement.expiryDate && (
                          <p>Expires: <span className="font-medium">{requirement.expiryDate.toLocaleDateString()}</span></p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      requirement.isMandatory ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {requirement.isMandatory ? 'MANDATORY' : 'OPTIONAL'}
                    </span>
                    <button className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Compliance Tracking */
        <div className="space-y-4">
          {complianceRecords.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No compliance records found for this contractor</p>
            </div>
          ) : (
            complianceRecords.map((record) => {
              const requirement = requirements.find(req => req.id === record.requirementId);
              return (
                <div key={record.id} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                        {getRequirementTypeIcon(requirement?.requirementType || 'technical')}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {requirement?.requirement || 'Unknown Requirement'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Next Review: {record.nextReviewDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getComplianceStatusColor(record.complianceStatus)}`}>
                        {record.complianceStatus.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        record.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                        record.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {record.riskLevel.toUpperCase()} RISK
                      </span>
                    </div>
                  </div>

                  {/* Evidence */}
                  {record.evidence && record.evidence.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Evidence</h4>
                      <div className="space-y-2">
                        {record.evidence.map((evidence) => (
                          <div key={evidence.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700">{evidence.documentType}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded ${
                                evidence.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                                evidence.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {evidence.verificationStatus.toUpperCase()}
                              </span>
                              <button className="text-blue-600 hover:text-blue-700 text-sm">
                                View
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verification Info */}
                  {record.verificationDate && record.verifiedBy && (
                    <div className="mt-3 p-3 bg-green-50 rounded">
                      <p className="text-sm text-green-700">
                        Verified by {record.verifiedBy} on {record.verificationDate.toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Non-compliance Reasons */}
                  {record.nonComplianceReasons && record.nonComplianceReasons.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 rounded">
                      <h4 className="text-sm font-medium text-red-900 mb-1">Non-Compliance Issues:</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {record.nonComplianceReasons.map((reason, index) => (
                          <li key={index}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Corrective Actions */}
                  {record.correctiveActions && record.correctiveActions.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Corrective Actions:</h4>
                      <div className="space-y-2">
                        {record.correctiveActions.map((action) => (
                          <div key={action.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                            <span className="text-sm text-blue-900">{action.action}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-blue-700">
                                Due: {action.dueDate.toLocaleDateString()}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded ${
                                action.status === 'completed' ? 'bg-green-100 text-green-800' :
                                action.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                action.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {action.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add Requirement Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Compliance Requirement</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Add requirement form would go here...</p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Add Requirement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}