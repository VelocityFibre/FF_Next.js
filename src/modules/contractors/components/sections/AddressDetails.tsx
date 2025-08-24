/**
 * Address Details Section
 * Displays physical and postal address information
 */

import { MapPin } from 'lucide-react';
import { Contractor } from '@/types/contractor.types';

interface AddressDetailsProps {
  contractor: Contractor;
}

export function AddressDetails({ contractor }: AddressDetailsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Physical Address</label>
          <p className="text-gray-900">{contractor.physicalAddress || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Postal Address</label>
          <p className="text-gray-900">{contractor.postalAddress || 'Same as physical address'}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <p className="text-gray-900">{contractor.city || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Province</label>
            <p className="text-gray-900">{contractor.province || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Postal Code</label>
            <p className="text-gray-900">{contractor.postalCode || 'Not specified'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}