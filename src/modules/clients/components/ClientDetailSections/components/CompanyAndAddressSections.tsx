import type { SectionProps } from '../types/clientSection.types';
import { formatText } from '../utils/displayUtils';

export function CompanyDetailsSection({ client }: SectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Details</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {client.registrationNumber && (
          <div>
            <p className="text-sm text-gray-500">Registration Number</p>
            <p className="font-medium">{client.registrationNumber}</p>
          </div>
        )}

        {client.vatNumber && (
          <div>
            <p className="text-sm text-gray-500">VAT Number</p>
            <p className="font-medium">{client.vatNumber}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500">Category</p>
          <p className="font-medium">{formatText(client.category)}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Industry</p>
          <p className="font-medium">{client.industry}</p>
        </div>
      </div>
    </div>
  );
}

export function AddressDetailsSection({ client }: SectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
      
      <div className="space-y-2">
        <p className="text-gray-900">{client.address}</p>
        <p className="text-gray-900">
          {client.city}, {client.province} {client.postalCode}
        </p>
        <p className="text-gray-900">{client.country}</p>
      </div>
    </div>
  );
}