/**
 * Neon SOW Data Tables for Poles, Drops, and Fibre
 */

interface NeonSOWDataTablesProps {
  data: any[];
  type: 'poles' | 'drops' | 'fibre';
  title: string;
}

export function NeonSOWDataTables({ data, type, title }: NeonSOWDataTablesProps) {
  const maxItems = 20;
  const displayData = data.slice(0, maxItems);

  if (data.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-500">No {type} data found</p>
      </div>
    );
  }

  const getStatusBadge = (status: string, statusType: 'poles' | 'drops' | 'fibre') => {
    let colorClass = 'bg-gray-100 text-gray-800';
    
    if (statusType === 'poles') {
      if (status === 'approved') colorClass = 'bg-green-100 text-green-800';
      else if (status === 'pending') colorClass = 'bg-yellow-100 text-yellow-800';
    } else if (statusType === 'drops') {
      if (status === 'active') colorClass = 'bg-green-100 text-green-800';
      else if (status === 'planned') colorClass = 'bg-blue-100 text-blue-800';
    } else if (statusType === 'fibre') {
      if (status === 'installed') colorClass = 'bg-green-100 text-green-800';
      else if (status === 'planned') colorClass = 'bg-blue-100 text-blue-800';
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  const renderPolesTable = () => (
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left font-medium text-gray-900">Pole Number</th>
          <th className="px-4 py-2 text-left font-medium text-gray-900">Location</th>
          <th className="px-4 py-2 text-left font-medium text-gray-900">Status</th>
          <th className="px-4 py-2 text-left font-medium text-gray-900">GPS</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {displayData.map((pole: any, index: number) => (
          <tr key={index} className="hover:bg-gray-50">
            <td className="px-4 py-2 font-medium text-gray-900">
              {pole.pole_number || pole.id}
            </td>
            <td className="px-4 py-2 text-gray-700">
              {pole.address || 'Not specified'}
            </td>
            <td className="px-4 py-2">
              {getStatusBadge(pole.status, 'poles')}
            </td>
            <td className="px-4 py-2 text-gray-600">
              {pole.latitude && pole.longitude 
                ? `${Number(pole.latitude).toFixed(6)}, ${Number(pole.longitude).toFixed(6)}`
                : 'No GPS'
              }
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderDropsTable = () => (
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left font-medium text-gray-900">Drop Number</th>
          <th className="px-4 py-2 text-left font-medium text-gray-900">Connected Pole</th>
          <th className="px-4 py-2 text-left font-medium text-gray-900">Address</th>
          <th className="px-4 py-2 text-left font-medium text-gray-900">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {displayData.map((drop: any, index: number) => (
          <tr key={index} className="hover:bg-gray-50">
            <td className="px-4 py-2 font-medium text-gray-900">
              {drop.drop_number || drop.id}
            </td>
            <td className="px-4 py-2 text-gray-700">
              {drop.pole_number || 'Not assigned'}
            </td>
            <td className="px-4 py-2 text-gray-700">
              {drop.address || 'Not specified'}
            </td>
            <td className="px-4 py-2">
              {getStatusBadge(drop.status, 'drops')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderFibreTable = () => (
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left font-medium text-gray-900">Segment ID</th>
          <th className="px-4 py-2 text-left font-medium text-gray-900">From → To</th>
          <th className="px-4 py-2 text-left font-medium text-gray-900">Distance</th>
          <th className="px-4 py-2 text-left font-medium text-gray-900">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {displayData.map((segment: any, index: number) => (
          <tr key={index} className="hover:bg-gray-50">
            <td className="px-4 py-2 font-medium text-gray-900">
              {segment.segment_id || segment.id}
            </td>
            <td className="px-4 py-2 text-gray-700">
              {segment.from_point && segment.to_point 
                ? `${segment.from_point} → ${segment.to_point}`
                : 'Not specified'
              }
            </td>
            <td className="px-4 py-2 text-gray-700">
              {segment.distance ? `${segment.distance}m` : 'Unknown'}
            </td>
            <td className="px-4 py-2">
              {getStatusBadge(segment.status, 'fibre')}
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="overflow-x-auto">
        {renderTable()}
        {data.length > maxItems && (
          <div className="text-center py-4 text-gray-500 text-sm">
            Showing first {maxItems} of {data.length} {type}
          </div>
        )}
      </div>
    </div>
  );
}