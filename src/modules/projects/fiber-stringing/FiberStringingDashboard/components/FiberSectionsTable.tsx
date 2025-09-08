import { AlertCircle, MapPin, Users } from 'lucide-react';
import { cn } from '@/src/utils/cn';
import { FiberSection } from '../types/fiberStringing.types';
import { getStatusColor } from '../utils/fiberUtils';

interface FiberSectionsTableProps {
  sections: FiberSection[];
}

export function FiberSectionsTable({ sections }: FiberSectionsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Section
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Route
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Distance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Cable Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Team
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {sections.map(section => (
              <tr key={section.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-neutral-900">{section.sectionName}</div>
                  {section.notes && (
                    <div className="text-sm text-error-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {section.notes}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm text-neutral-600">
                    <MapPin className="h-4 w-4" />
                    {section.fromPole} → {section.toPole}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-900">
                  {section.distance}m
                </td>
                <td className="px-6 py-4 text-sm text-neutral-900">
                  {section.cableType}
                </td>
                <td className="px-6 py-4">
                  <div className="w-full max-w-[100px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-600">{section.progress}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div 
                        className={cn(
                          'h-2 rounded-full',
                          section.status === 'completed' ? 'bg-success-500' :
                          section.status === 'in_progress' ? 'bg-info-500' :
                          section.status === 'issues' ? 'bg-error-500' :
                          'bg-neutral-400'
                        )}
                        style={{ width: `${section.progress}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    'px-2 py-1 text-xs font-medium rounded-full border',
                    getStatusColor(section.status)
                  )}>
                    {section.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {section.team ? (
                    <div className="flex items-center gap-1 text-sm text-neutral-900">
                      <Users className="h-4 w-4 text-neutral-400" />
                      {section.team}
                    </div>
                  ) : (
                    <span className="text-sm text-neutral-400">Not assigned</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}