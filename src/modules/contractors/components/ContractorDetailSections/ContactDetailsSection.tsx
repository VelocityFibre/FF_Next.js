/**
 * Contact Details Section
 * Contact person and communication information
 */

import { User } from 'lucide-react';
import { ContractorSectionProps } from './types';

export function ContactDetailsSection({ contractor }: ContractorSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Person</label>
          <p className="text-gray-900">{contractor.contactPerson}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="text-gray-900">{contractor.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <p className="text-gray-900">{contractor.phone || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Alternative Phone</label>
          <p className="text-gray-900">{contractor.alternatePhone || 'Not provided'}</p>
        </div>
      </div>
    </div>
  );
}