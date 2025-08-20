import { ChevronDown, ChevronRight, Eye, Edit, MapPin, Phone, Clock, User, Package } from 'lucide-react';
import { HomeInstall } from '../types/home-install.types';
import { cn } from '@/utils/cn';

interface HomeInstallsTableProps {
  installs: HomeInstall[];
  expandedRows: Set<string>;
  onToggleRow: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

export function HomeInstallsTable({
  installs,
  expandedRows,
  onToggleRow,
  onView,
  onEdit,
}: HomeInstallsTableProps) {
  const getStatusColor = (status: HomeInstall['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-info-100 text-info-800 border-info-200';
      case 'in_progress':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'completed':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'cancelled':
        return 'bg-error-100 text-error-800 border-error-200';
      case 'pending':
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (installs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
        <div className="text-center">
          <Package className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-neutral-900 mb-1">No installations found</h3>
          <p className="text-neutral-600">Try adjusting your search or filter criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Schedule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Package
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Technician
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {installs.map((install) => (
              <React.Fragment key={install.id}>
                <tr className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button
                        onClick={() => onToggleRow(install.id)}
                        className="mr-2 p-1 hover:bg-neutral-100 rounded"
                      >
                        {expandedRows.has(install.id) ? (
                          <ChevronDown className="h-4 w-4 text-neutral-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-neutral-400" />
                        )}
                      </button>
                      <span className="text-sm font-medium text-neutral-900">
                        {install.orderNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-neutral-900">{install.customerName}</div>
                      {install.customerPhone && (
                        <div className="text-sm text-neutral-500">{install.customerPhone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-900">{install.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900">{formatDate(install.scheduledDate)}</div>
                    <div className="text-sm text-neutral-500">{formatTime(install.scheduledTime)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border',
                        getStatusColor(install.status)
                      )}
                    >
                      {install.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900">{install.packageType}</div>
                    <div className="text-sm text-neutral-500">{install.speed} Mbps</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900">
                      {install.assignedTechnician || 'Not assigned'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onView(install.id)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(install.id)}
                      className="text-neutral-600 hover:text-neutral-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
                
                {expandedRows.has(install.id) && (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 bg-neutral-50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-neutral-900">Customer Details</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-neutral-600">
                              <User className="h-4 w-4" />
                              <span>{install.customerEmail}</span>
                            </div>
                            <div className="flex items-center gap-2 text-neutral-600">
                              <Phone className="h-4 w-4" />
                              <span>{install.alternatePhone || 'No alternate phone'}</span>
                            </div>
                            <div className="flex items-start gap-2 text-neutral-600">
                              <MapPin className="h-4 w-4 mt-0.5" />
                              <span>{install.coordinates}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-neutral-900">Installation Details</h4>
                          <div className="space-y-1 text-sm text-neutral-600">
                            <div>ONT Serial: {install.ontSerial || 'Not assigned'}</div>
                            <div>Router Serial: {install.routerSerial || 'Not assigned'}</div>
                            <div>Cable Length: {install.cableLength || 0}m</div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>Est. Duration: {install.estimatedDuration || 2} hours</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-neutral-900">Notes</h4>
                          <p className="text-sm text-neutral-600">
                            {install.notes || 'No additional notes'}
                          </p>
                          {install.specialRequirements && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-neutral-900">Special Requirements:</span>
                              <p className="text-sm text-neutral-600">{install.specialRequirements}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}