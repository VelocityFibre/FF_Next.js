import { Mail, Phone, Globe, MapPin } from 'lucide-react';
import type { SectionProps } from '../types/clientSection.types';
import { getStatusColor, getPriorityColor } from '../utils/displayUtils';

export function ClientInfoSection({ client }: SectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
          <p className="text-gray-600">{client.industry}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
            {client.status.toUpperCase()}
          </span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(client.priority)}`}>
            {client.priority.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Primary Email</p>
            <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
              {client.email}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Primary Phone</p>
            <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">
              {client.phone}
            </a>
          </div>
        </div>

        {client.website && (
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Website</p>
              <a 
                href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {client.website}
              </a>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="text-gray-900">{client.city}, {client.province}</p>
          </div>
        </div>
      </div>
    </div>
  );
}