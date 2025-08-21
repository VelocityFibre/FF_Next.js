import { useState } from 'react';
import { 
  FileText,
  Upload,
  Download,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Send,
  Calendar,
  DollarSign
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface SOW {
  id: string;
  sowNumber: string;
  projectName: string;
  clientName: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'active' | 'completed' | 'rejected';
  version: string;
  value: number;
  currency: string;
  startDate: string;
  endDate: string;
  scope: string[];
  deliverables: string[];
  milestones: SOWMilestone[];
  approvals: SOWApproval[];
  documents: SOWDocument[];
  createdDate: string;
  lastModified: string;
  createdBy: string;
}

interface SOWMilestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  value: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  deliverables: string[];
}

interface SOWApproval {
  id: string;
  approverName: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected';
  date?: string;
  comments?: string;
}

interface SOWDocument {
  id: string;
  name: string;
  type: 'contract' | 'technical' | 'financial' | 'legal' | 'other';
  url: string;
  uploadedDate: string;
  uploadedBy: string;
}

export function SOWManagement() {
  const [sows] = useState<SOW[]>([
    {
      id: '1',
      sowNumber: 'SOW-2024-001',
      projectName: 'Downtown Fiber Expansion',
      clientName: 'City Municipality',
      status: 'active',
      version: '2.0',
      value: 250000,
      currency: 'USD',
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      scope: [
        'Install 50km of fiber optic cable',
        'Connect 500 premises',
        'Setup 10 distribution points',
      ],
      deliverables: [
        'Network design documentation',
        'As-built drawings',
        'Test certificates',
        'Training materials',
      ],
      milestones: [
        {
          id: 'm1',
          name: 'Phase 1 - Design',
          description: 'Complete network design and approvals',
          dueDate: '2024-02-01',
          value: 50000,
          status: 'completed',
          deliverables: ['Network design', 'Permit approvals'],
        },
        {
          id: 'm2',
          name: 'Phase 2 - Installation',
          description: 'Install fiber infrastructure',
          dueDate: '2024-04-30',
          value: 150000,
          status: 'in_progress',
          deliverables: ['Installed cable', 'Connection reports'],
        },
        {
          id: 'm3',
          name: 'Phase 3 - Testing',
          description: 'Complete testing and handover',
          dueDate: '2024-06-30',
          value: 50000,
          status: 'pending',
          deliverables: ['Test results', 'Documentation'],
        },
      ],
      approvals: [
        {
          id: 'a1',
          approverName: 'John Manager',
          approverRole: 'Project Manager',
          status: 'approved',
          date: '2024-01-05',
        },
        {
          id: 'a2',
          approverName: 'Sarah Finance',
          approverRole: 'Finance Director',
          status: 'approved',
          date: '2024-01-06',
        },
      ],
      documents: [
        {
          id: 'd1',
          name: 'SOW_Contract_v2.pdf',
          type: 'contract',
          url: '#',
          uploadedDate: '2024-01-01',
          uploadedBy: 'Admin',
        },
        {
          id: 'd2',
          name: 'Technical_Specifications.xlsx',
          type: 'technical',
          url: '#',
          uploadedDate: '2024-01-02',
          uploadedBy: 'Tech Lead',
        },
      ],
      createdDate: '2023-12-15',
      lastModified: '2024-01-06',
      createdBy: 'Admin',
    },
    {
      id: '2',
      sowNumber: 'SOW-2024-002',
      projectName: 'Rural Connectivity Project',
      clientName: 'State Government',
      status: 'pending_approval',
      version: '1.0',
      value: 500000,
      currency: 'USD',
      startDate: '2024-02-01',
      endDate: '2024-12-31',
      scope: [
        'Connect 50 rural communities',
        'Install 100km backbone fiber',
        'Setup wireless last-mile connections',
      ],
      deliverables: [
        'Community coverage maps',
        'Installation reports',
        'Maintenance documentation',
      ],
      milestones: [],
      approvals: [
        {
          id: 'a3',
          approverName: 'Mark Director',
          approverRole: 'Operations Director',
          status: 'pending',
        },
      ],
      documents: [],
      createdDate: '2024-01-10',
      lastModified: '2024-01-15',
      createdBy: 'Sales Team',
    },
  ]);

  const [filter, setFilter] = useState<'all' | SOW['status']>('all');

  const getStatusColor = (status: SOW['status']) => {
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
  };

  const getMilestoneProgress = (milestones: SOWMilestone[]) => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.status === 'completed').length;
    return (completed / milestones.length) * 100;
  };

  const filteredSOWs = filter === 'all' 
    ? sows 
    : sows.filter(sow => sow.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">SOW Management</h1>
            <p className="text-neutral-600 mt-1">Manage Statements of Work and project contracts</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import SOW
            </button>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              New SOW
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">Total SOWs</span>
            <FileText className="h-4 w-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-semibold text-neutral-900">{sows.length}</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">Active</span>
            <CheckCircle className="h-4 w-4 text-success-600" />
          </div>
          <p className="text-2xl font-semibold text-success-600">
            {sows.filter(s => s.status === 'active').length}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">Pending</span>
            <Clock className="h-4 w-4 text-warning-600" />
          </div>
          <p className="text-2xl font-semibold text-warning-600">
            {sows.filter(s => s.status === 'pending_approval').length}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">Total Value</span>
            <DollarSign className="h-4 w-4 text-primary-600" />
          </div>
          <p className="text-2xl font-semibold text-primary-600">
            ${sows.reduce((sum, s) => sum + s.value, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-1">
        <div className="flex space-x-1">
          {(['all', 'draft', 'pending_approval', 'active', 'completed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                filter === status
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              )}
            >
              {status === 'all' ? 'All SOWs' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* SOW List */}
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
              {filteredSOWs.map(sow => (
                <tr key={sow.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-neutral-900">{sow.sowNumber}</div>
                      <div className="text-xs text-neutral-500">v{sow.version}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-900">{sow.projectName}</div>
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
    </div>
  );
}