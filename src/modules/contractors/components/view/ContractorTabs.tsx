/**
 * Contractor Tabs Component
 * Tab navigation for contractor view
 */

import { Users, FileText, Briefcase, CheckCircle, Shield, DollarSign } from 'lucide-react';
import { Contractor } from '@/types/contractor.types';
import { TabType } from './useContractorView';

interface ContractorTabsProps {
  contractor: Contractor;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function ContractorTabs({
  contractor,
  activeTab,
  onTabChange
}: ContractorTabsProps) {
  return (
    <div className="flex space-x-1 border-b border-gray-200">
      <button
        onClick={() => onTabChange('overview')}
        className={`px-4 py-2 font-medium text-sm ${
          activeTab === 'overview'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Overview
      </button>
      <button
        onClick={() => onTabChange('teams')}
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
        onClick={() => onTabChange('assignments')}
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
        onClick={() => onTabChange('documents')}
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
        onClick={() => onTabChange('onboarding')}
        className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
          activeTab === 'onboarding'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <CheckCircle className="w-4 h-4" />
        Onboarding
      </button>
      <button
        onClick={() => onTabChange('compliance')}
        className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
          activeTab === 'compliance'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Shield className="w-4 h-4" />
        Compliance
      </button>
      <button
        onClick={() => onTabChange('ratecards')}
        className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
          activeTab === 'ratecards'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <DollarSign className="w-4 h-4" />
        Rate Cards
      </button>
    </div>
  );
}