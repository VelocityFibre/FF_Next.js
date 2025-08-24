
import type { SectionProps } from '../types/clientSection.types';
import { formatCurrency } from '../utils/displayUtils';

export function ProjectMetricsSection({ client }: SectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Metrics</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">{client.activeProjects}</p>
          <p className="text-sm text-gray-500">Active Projects</p>
        </div>

        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">{client.completedProjects}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>

        <div className="text-center">
          <p className="text-3xl font-bold text-gray-600">{client.totalProjects}</p>
          <p className="text-sm text-gray-500">Total Projects</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Project Value</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatCurrency(client.totalProjectValue)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Average Project Value</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatCurrency(client.averageProjectValue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServiceTypesSection({ client }: SectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Types</h3>
      
      <div className="flex flex-wrap gap-2">
        {client.serviceTypes.map(service => (
          <span
            key={service}
            className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
          >
            {service.toUpperCase()}
          </span>
        ))}
      </div>

      {client.specialRequirements && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Special Requirements</p>
          <p className="text-gray-900">{client.specialRequirements}</p>
        </div>
      )}
    </div>
  );
}