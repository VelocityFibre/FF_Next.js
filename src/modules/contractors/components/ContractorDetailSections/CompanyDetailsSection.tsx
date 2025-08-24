/**
 * Company Details Section
 * Business type, industry category, and company metrics
 */

import { Building2 } from 'lucide-react';
import { ContractorSectionProps } from './types';

export function CompanyDetailsSection({ contractor }: ContractorSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Company Details</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Type</label>
          <p className="text-gray-900">{contractor.businessType?.replace('_', ' ').toUpperCase()}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Industry Category</label>
          <p className="text-gray-900">{contractor.industryCategory}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Years in Business</label>
          <p className="text-gray-900">{contractor.yearsInBusiness || 'Not specified'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Employee Count</label>
          <p className="text-gray-900">{contractor.employeeCount || 'Not specified'}</p>
        </div>
      </div>
    </div>
  );
}