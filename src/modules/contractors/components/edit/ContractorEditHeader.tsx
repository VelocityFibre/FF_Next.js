/**
 * Contractor Edit Header Component
 * Header section for contractor edit page
 */

import { ArrowLeft, Building2 } from 'lucide-react';

interface ContractorEditHeaderProps {
  onBack: () => void;
}

export function ContractorEditHeader({ onBack }: ContractorEditHeaderProps) {
  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Contractors
      </button>
      
      <div className="flex items-center gap-3">
        <Building2 className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Contractor</h1>
          <p className="text-gray-600">Update contractor information and settings</p>
        </div>
      </div>
    </div>
  );
}