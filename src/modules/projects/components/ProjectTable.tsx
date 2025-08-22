import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface ProjectTableProps {
  projects: any[] | undefined;
  isLoading: boolean;
  error: Error | null | undefined;
  onDelete?: (id: string) => void;
}

export function ProjectTable({ projects, isLoading, error, onDelete }: ProjectTableProps) {
  const navigate = useNavigate();
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      PLANNING: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-green-100 text-green-800',
      ON_HOLD: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    
    const displayStatus = status?.replace('_', ' ');
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {displayStatus}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: any = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${priorityConfig[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority?.toLowerCase()}
      </span>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Loading projects...
                </td>
              </tr>
            )}
            
            {error && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-red-600">
                  Error loading projects: {error.message}
                </td>
              </tr>
            )}
            
            {projects && projects.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No projects found
                </td>
              </tr>
            )}
            
            {projects?.map((project) => (
              <tr 
                key={project.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/app/projects/${project.id}`)}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                    <div className="text-sm text-gray-500">{project.code || `PRJ-${project.id.slice(0, 6)}`}</div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{project.client_name || 'N/A'}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {project.city}, {project.state}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getStatusBadge(project.status)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getPriorityBadge(project.priority)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(project.start_date)} - {formatDate(project.end_date)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(Number(project.budget_allocated))}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setShowActionMenu(showActionMenu === project.id ? null : project.id)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {showActionMenu === project.id && (
                      <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => navigate(`/app/projects/${project.id}`)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </button>
                        <button
                          onClick={() => navigate(`/app/projects/${project.id}/edit`)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </button>
                        {onDelete && (
                          <button
                            onClick={() => onDelete(project.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        )}
                      </div>
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