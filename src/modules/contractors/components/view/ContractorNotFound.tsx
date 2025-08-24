/**
 * Contractor Not Found Component
 * Error state when contractor is not found
 */

import { Building2 } from 'lucide-react';

interface ContractorNotFoundProps {
  onBack: () => void;
}

export function ContractorNotFound({ onBack }: ContractorNotFoundProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <Building2 className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-red-900 mb-2">
          Contractor not found
        </h3>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Back to Contractors
        </button>
      </div>
    </div>
  );
}