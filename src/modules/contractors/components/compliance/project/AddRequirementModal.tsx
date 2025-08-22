/**
 * AddRequirementModal Component - Simple modal for adding requirements
 */

import { ProjectComplianceRequirement } from '@/services/contractor/contractorComplianceService';

interface AddRequirementModalProps {
  projectId: string;
  onClose: () => void;
  onSave: (requirement: ProjectComplianceRequirement) => void;
}

export function AddRequirementModal({ projectId, onClose, onSave }: AddRequirementModalProps) {
  const handleSave = () => {
    const newRequirement: ProjectComplianceRequirement = {
      id: `req_${Date.now()}`,
      projectId,
      requirementType: 'insurance',
      requirement: 'New requirement',
      isMandatory: true,
      minimumStandard: {},
      verificationMethod: 'document_review',
      renewalFrequency: 'annually',
      effectiveDate: new Date()
    };
    onSave(newRequirement);
  };

  return (
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
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Add Requirement
          </button>
        </div>
      </div>
    </div>
  );
}