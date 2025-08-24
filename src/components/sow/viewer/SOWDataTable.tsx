/**
 * SOW Data Table Component for Poles, Drops, and Fibre
 */

import { CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SOWDataTableProps {
  data: any[];
  type: 'poles' | 'drops' | 'fibre';
  maxItems?: number;
}

export function SOWDataTable({ data, type, maxItems = 50 }: SOWDataTableProps) {
  const displayData = data.slice(0, maxItems);
  
  const getStatusBadge = (status: string) => (
    <span className={cn(
      "inline-flex px-2 py-1 text-xs font-medium rounded-full",
      status === 'completed' 
        ? "bg-success-100 text-success-700"
        : status === 'in_progress'
        ? "bg-warning-100 text-warning-700"
        : "bg-surface-secondary text-text-tertiary"
    )}>
      {status || 'planned'}
    </span>
  );

  const renderPolesTable = () => (
    <table className="w-full">
      <thead>
        <tr className="border-b border-border-primary">
          <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
            Pole Number
          </th>
          <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
            Coordinates
          </th>
          <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
            Type
          </th>
          <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
            Status
          </th>
          <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
            Municipality
          </th>
        </tr>
      </thead>
      <tbody>
        {displayData.map((pole: any, index: number) => (
          <tr key={pole.id || index} className="border-b border-border-secondary hover:bg-surface-primary">
            <td className="px-4 py-3 text-sm font-medium text-text-primary">
              {pole.pole_number}
            </td>
            <td className="px-4 py-3 text-sm text-text-secondary">
              {pole.latitude?.toFixed(6)}, {pole.longitude?.toFixed(6)}
            </td>
            <td className="px-4 py-3 text-sm text-text-secondary">
              {pole.pole_type || '-'}
            </td>
            <td className="px-4 py-3">
              {getStatusBadge(pole.status)}
            </td>
            <td className="px-4 py-3 text-sm text-text-secondary">
              {pole.municipality || '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderDropsTable = () => (
    <table className="w-full">
      <thead>
        <tr className="border-b border-border-primary">
          <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
            Drop Number
          </th>
          <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
            Pole Number
          </th>
          <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
            Address
          </th>
          <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
            Cable Type
          </th>
          <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
            Length
          </th>
        </tr>
      </thead>
      <tbody>
        {displayData.map((drop: any, index: number) => (
          <tr key={drop.id || index} className="border-b border-border-secondary hover:bg-surface-primary">
            <td className="px-4 py-3 text-sm font-medium text-text-primary">
              {drop.drop_number}
            </td>
            <td className="px-4 py-3 text-sm text-text-secondary">
              {drop.pole_number || '-'}
            </td>
            <td className="px-4 py-3 text-sm text-text-secondary">
              {drop.address || '-'}
            </td>
            <td className="px-4 py-3 text-sm text-text-secondary">
              {drop.cable_type || '-'}
            </td>
            <td className="px-4 py-3 text-sm text-text-secondary">
              {drop.cable_length || '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderFibreTable = () => (
    <table className="w-full">
      <thead>
        <tr className="border-b border-border-primary">
          <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
            Segment ID
          </th>
          <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
            Cable Size
          </th>
          <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
            Layer
          </th>
          <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
            Length (m)
          </th>
          <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
            Complete
          </th>
          <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
            Contractor
          </th>
        </tr>
      </thead>
      <tbody>
        {displayData.map((segment: any, index: number) => (
          <tr key={segment.id || index} className="border-b border-border-secondary hover:bg-surface-primary">
            <td className="px-4 py-3 text-sm font-medium text-text-primary">
              {segment.segment_id}
            </td>
            <td className="px-4 py-3 text-sm text-text-secondary">
              {segment.cable_size || '-'}
            </td>
            <td className="px-4 py-3 text-sm text-text-secondary">
              {segment.layer || '-'}
            </td>
            <td className="px-4 py-3 text-sm text-text-secondary">
              {segment.length?.toLocaleString() || '-'}
            </td>
            <td className="px-4 py-3">
              {segment.is_complete ? (
                <CheckCircle className="w-4 h-4 text-success-600" />
              ) : (
                <span className="text-text-tertiary">-</span>
              )}
            </td>
            <td className="px-4 py-3 text-sm text-text-secondary">
              {segment.contractor || '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderTable = () => {
    switch (type) {
      case 'poles':
        return renderPolesTable();
      case 'drops':
        return renderDropsTable();
      case 'fibre':
        return renderFibreTable();
      default:
        return null;
    }
  };

  return (
    <div className="bg-background-secondary rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        {renderTable()}
        {data.length > maxItems && (
          <div className="px-4 py-3 text-sm text-text-secondary bg-surface-secondary">
            Showing {maxItems} of {data.length} {type}
          </div>
        )}
      </div>
    </div>
  );
}