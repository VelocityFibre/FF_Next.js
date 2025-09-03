import type { SectionProps } from '../types/clientSection.types';
import { formatTextUppercase } from '../utils/displayUtils';

export function ContactDetailsSection({ client }: SectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500">Contact Person</p>
          <p className="font-medium">{client.contactPerson}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Primary Email</p>
          <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
            {client.email}
          </a>
        </div>

        {client.alternativeEmail && (
          <div>
            <p className="text-sm text-gray-500">Alternative Email</p>
            <a href={`mailto:${client.alternativeEmail}`} className="text-blue-600 hover:underline">
              {client.alternativeEmail}
            </a>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500">Primary Phone</p>
          <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">
            {client.phone}
          </a>
        </div>

        {client.alternativePhone && (
          <div>
            <p className="text-sm text-gray-500">Alternative Phone</p>
            <a href={`tel:${client.alternativePhone}`} className="text-blue-600 hover:underline">
              {client.alternativePhone}
            </a>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500">Communication Preferences</p>
          <p className="font-medium">
            {formatTextUppercase(client.preferredContactMethod)} • {client.communicationLanguage}
          </p>
        </div>
      </div>
    </div>
  );
}