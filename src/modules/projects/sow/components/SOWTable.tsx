import { Calendar, Eye, Edit, Download, Send } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SOW, SOWMilestone } from '../types/sow.types';

interface SOWTableProps {
  sows: SOW[];
}

function getStatusColor(status: SOW['status']) {
  switch (status) {
    case 'approved':
    case 'completed':
      return 'bg-success-100 text-success-800 border-success-200';
    case 'active':
      return 'bg-info-100 text-info-800 border-info-200';
    case 'pending_approval':
      return 'bg-warning-100 text-warning-800 border-warning-200';
    case 'rejected':
      return 'bg-error-100 text-error-800 border-error-200';
    default:
      return 'bg-neutral-100 text-neutral-800 border-neutral-200';
  }
}

function getMilestoneProgress(milestones: SOWMilestone[]) {
  if (milestones.length === 0) return 0;
  const completed = milestones.filter(m => m.status === 'completed').length;
  return (completed / milestones.length) * 100;
}

export function SOWTable({ sows }: SOWTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                SOW Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Milestones
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {sows.map(sow => (
              <tr key={sow.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-neutral-900">{sow.sowNumber}</div>
                    <div className="text-xs text-neutral-500">v{sow.version}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm text-neutral-900">{sow.projectName}</div>
                    {sow.importedData && (
                      <div className="text-xs text-neutral-500 mt-1">
                        {sow.importedData.poles} poles • {sow.importedData.houses} houses • {sow.importedData.spares} spares • {sow.importedData.fibre} fibre
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-neutral-900">{sow.clientName}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-neutral-900">
                    {sow.currency} {sow.value.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-neutral-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(sow.startDate).toLocaleDateString()} - 
                      {new Date(sow.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {sow.milestones.length > 0 ? (
                    <div>
                      <div className="text-sm text-neutral-900 mb-1">
                        {sow.milestones.filter(m => m.status === 'completed').length}/{sow.milestones.length}
                      </div>
                      <div className="w-20 bg-neutral-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${getMilestoneProgress(sow.milestones)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-neutral-400">No milestones</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    'px-2 py-1 text-xs font-medium rounded-full border',
                    getStatusColor(sow.status)
                  )}>
                    {sow.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1 hover:bg-neutral-100 rounded">
                      <Eye className="h-4 w-4 text-neutral-600" />
                    </button>
                    <button className="p-1 hover:bg-neutral-100 rounded">
                      <Edit className="h-4 w-4 text-neutral-600" />
                    </button>
                    <button className="p-1 hover:bg-neutral-100 rounded">
                      <Download className="h-4 w-4 text-neutral-600" />
                    </button>
                    {sow.status === 'draft' && (
                      <button className="p-1 hover:bg-neutral-100 rounded">
                        <Send className="h-4 w-4 text-primary-600" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}