/**
 * Contractor View Header Component
 * Header section with navigation and actions
 */

import { ArrowLeft, Edit, Trash2, Building2 } from 'lucide-react';
import { Contractor } from '@/types/contractor.types';
import { ContractorInfoSection } from '../ContractorDetailSections';

interface ContractorViewHeaderProps {
  contractor: Contractor;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ContractorViewHeader({
  contractor,
  onBack,
  onEdit,
  onDelete
}: ContractorViewHeaderProps) {
  return (
    <>
      <div className="mb-6">
        <button
          onClick={onBack}
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
                onClick={onEdit}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              
              <button
                onClick={onDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}