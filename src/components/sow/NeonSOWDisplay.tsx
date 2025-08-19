import { useState } from 'react';
import { 
  FileSpreadsheet, 
  MapPin, 
  Cable, 
  Home, 
  Database,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Wifi,
  Activity
} from 'lucide-react';
import { useProjectSOW, useNeonHealth } from '@/hooks/useNeonSOW';

interface NeonSOWDisplayProps {
  projectId: string;
}

export function NeonSOWDisplay({ projectId }: NeonSOWDisplayProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'poles' | 'drops' | 'fibre'>('summary');
  
  const { data: sowData, isLoading, error } = useProjectSOW(projectId);
  const { data: neonHealth } = useNeonHealth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading SOW data from Neon...</span>
      </div>
    );
  }

  if (error || !sowData?.success) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-red-800 font-medium">Failed to Load SOW Data</h3>
              <p className="text-red-700 text-sm mt-1">
                {sowData?.error || error?.message || 'Unknown error accessing Neon database'}
              </p>
              {!neonHealth?.connected && (
                <p className="text-red-600 text-xs mt-2">
                  Database connection issue. Check your Neon configuration.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { poles = [], drops = [], fibre = [], summary } = sowData.data || {};

  // If no data exists
  if (summary.totalPoles === 0 && summary.totalDrops === 0 && summary.totalFibre === 0) {
    return (
      <div className="p-8 text-center">
        <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No SOW Data Found</h3>
        <p className="text-gray-500 mb-4">
          This project doesn't have any Scope of Work data in the Neon database yet.
        </p>
        <div className="text-sm text-gray-400 space-y-1">
          <p>To import SOW data, use the import scripts:</p>
          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
            node scripts/sow-import/import-sow-to-neon.js
          </code>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'summary', label: 'Summary', icon: Activity },
    { id: 'poles', label: `Poles (${summary.totalPoles})`, icon: MapPin },
    { id: 'drops', label: `Drops (${summary.totalDrops})`, icon: Home },
    { id: 'fibre', label: `Fibre (${summary.totalFibre})`, icon: Cable },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with Neon indicator */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="h-6 w-6 text-purple-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Scope of Work Data</h2>
              <p className="text-sm text-gray-600">Data from Neon PostgreSQL database</p>
            </div>
          </div>
          
          {/* Neon connection status */}
          <div className="flex items-center text-sm">
            {neonHealth?.connected ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>Connected</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>Disconnected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <MapPin className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Poles</h3>
                    <p className="text-2xl font-bold text-blue-600">{summary.totalPoles}</p>
                    <p className="text-sm text-blue-700">Infrastructure poles</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Home className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">Drops</h3>
                    <p className="text-2xl font-bold text-green-600">{summary.totalDrops}</p>
                    <p className="text-sm text-green-700">Home connections</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Cable className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900">Fibre</h3>
                    <p className="text-2xl font-bold text-purple-600">{summary.totalFibre}</p>
                    <p className="text-sm text-purple-700">Cable segments</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Source Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Data Source</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Database:</span>
                  <span className="ml-2 font-medium">Neon PostgreSQL</span>
                </div>
                <div>
                  <span className="text-gray-600">Tables:</span>
                  <span className="ml-2 font-medium">
                    {neonHealth?.availableTables?.join(', ') || 'Unknown'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 font-medium ${
                    neonHealth?.connected ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {neonHealth?.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Version:</span>
                  <span className="ml-2 font-medium text-xs">
                    {neonHealth?.info?.version?.split(' ').slice(0, 2).join(' ') || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'poles' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Poles Data</h3>
            {poles.length > 0 ? (
              <div className="overflow-x-auto">
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
                    {poles.slice(0, 20).map((pole: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-900">
                          {pole.pole_number || pole.id}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {pole.address || 'Not specified'}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            pole.status === 'approved' 
                              ? 'bg-green-100 text-green-800'
                              : pole.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {pole.status || 'Unknown'}
                          </span>
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
                {poles.length > 20 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Showing first 20 of {poles.length} poles
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No poles data found</p>
            )}
          </div>
        )}

        {activeTab === 'drops' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Drops Data</h3>
            {drops.length > 0 ? (
              <div className="overflow-x-auto">
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
                    {drops.slice(0, 20).map((drop: any, index: number) => (
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
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            drop.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : drop.status === 'planned'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {drop.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {drops.length > 20 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Showing first 20 of {drops.length} drops
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No drops data found</p>
            )}
          </div>
        )}

        {activeTab === 'fibre' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Fibre Segments</h3>
            {fibre.length > 0 ? (
              <div className="overflow-x-auto">
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
                    {fibre.slice(0, 20).map((segment: any, index: number) => (
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
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            segment.status === 'installed' 
                              ? 'bg-green-100 text-green-800'
                              : segment.status === 'planned'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {segment.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {fibre.length > 20 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Showing first 20 of {fibre.length} segments
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No fibre data found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}