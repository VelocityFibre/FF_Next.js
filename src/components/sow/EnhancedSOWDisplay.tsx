import { useState } from 'react';
import { 
  MapPin, 
  Cable, 
  Home, 
  Database,
  CheckCircle,
  Activity,
  Upload,
  Plus
} from 'lucide-react';
import { useProjectSOW, useProjectPoles, useProjectDrops, useProjectFibre } from '@/hooks/useSOW';
import { SOWUploadSection } from '@/modules/projects/components/SOWUploadSection';
import { cn } from '@/utils/cn';

interface EnhancedSOWDisplayProps {
  projectId: string;
  projectName?: string;
}

export function EnhancedSOWDisplay({ projectId, projectName = 'Project' }: EnhancedSOWDisplayProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'poles' | 'drops' | 'fibre' | 'upload'>('summary');
  const [showUploadWizard, setShowUploadWizard] = useState(false);
  
  const { data: sowData, isLoading } = useProjectSOW(projectId);
  const { data: poles = [] } = useProjectPoles(projectId);
  const { data: drops = [] } = useProjectDrops(projectId);
  const { data: fibre = [] } = useProjectFibre(projectId);

  const hasData = poles.length > 0 || drops.length > 0 || fibre.length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading SOW data...</span>
      </div>
    );
  }

  // If no data exists, show upload prompt
  if (!hasData && !showUploadWizard) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No SOW Data Found</h3>
          <p className="text-gray-500 mb-6">
            This project doesn't have any Scope of Work data yet.
          </p>
          
          <button
            onClick={() => setShowUploadWizard(true)}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import SOW Data
          </button>
          
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Upload Excel files containing poles, drops, and fibre scope data
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show upload wizard if requested
  if (showUploadWizard) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Import SOW Data</h2>
          <p className="text-sm text-gray-600 mt-1">
            Upload Excel files containing poles, drops, and fibre scope data
          </p>
        </div>
        
        <SOWUploadSection
          projectId={projectId}
          projectName={projectName}
          onComplete={() => {
            setShowUploadWizard(false);
            setActiveTab('summary');
          }}
        />
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setShowUploadWizard(false)}
            className="text-sm text-gray-600 hover:text-gray-700"
          >
            Cancel and go back
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'summary', label: 'Summary', icon: Activity },
    { id: 'poles', label: `Poles (${poles.length})`, icon: MapPin },
    { id: 'drops', label: `Drops (${drops.length})`, icon: Home },
    { id: 'fibre', label: `Fibre (${fibre.length})`, icon: Cable },
    { id: 'upload', label: 'Import/Update', icon: Upload },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Scope of Work Data</h2>
              <p className="text-sm text-gray-600">Project SOW data management</p>
            </div>
          </div>
          
          {hasData && (
            <button
              onClick={() => setActiveTab('upload')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Update Data
            </button>
          )}
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
                className={cn(
                  "py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors",
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
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
                    <p className="text-2xl font-bold text-blue-600">{poles.length}</p>
                    <p className="text-sm text-blue-700">Infrastructure poles</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Home className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">Drops</h3>
                    <p className="text-2xl font-bold text-green-600">{drops.length}</p>
                    <p className="text-sm text-green-700">Home connections</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Cable className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900">Fibre</h3>
                    <p className="text-2xl font-bold text-purple-600">{fibre.length}</p>
                    <p className="text-sm text-purple-700">Cable segments</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Data Status</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Source:</span>
                  <span className="ml-2 font-medium">Firebase Firestore</span>
                </div>
                <div>
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="ml-2 font-medium">
                    {sowData?.poles?.uploadedAt ? new Date(sowData.poles.uploadedAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Total Items:</span>
                  <span className="ml-2 font-medium">
                    {poles.length + drops.length + fibre.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2 font-medium text-green-600">
                    <CheckCircle className="inline w-4 h-4 mr-1" />
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {poles.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">Pole Statistics</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Total Capacity:</span>
                    <span className="ml-2 font-medium text-blue-900">
                      {poles.reduce((sum, p: any) => sum + (p.max_drops || 12), 0)} drops
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-600">Avg Drops/Pole:</span>
                    <span className="ml-2 font-medium text-blue-900">
                      {(drops.length / poles.length).toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-600">Coverage:</span>
                    <span className="ml-2 font-medium text-blue-900">
                      {((drops.length / (poles.length * 12)) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'poles' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Poles Data</h3>
              <span className="text-sm text-gray-500">{poles.length} total poles</span>
            </div>
            
            {poles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-900">Pole Number</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-900">GPS Coordinates</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-900">Max Drops</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {poles.slice(0, 20).map((pole: any) => (
                      <tr key={pole.id || pole.pole_number} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-900">
                          {pole.pole_number}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {pole.latitude && pole.longitude 
                            ? `${Number(pole.latitude).toFixed(6)}, ${Number(pole.longitude).toFixed(6)}`
                            : 'No GPS'
                          }
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {pole.max_drops || 12}
                        </td>
                        <td className="px-4 py-2">
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                            pole.status === 'completed' 
                              ? "bg-green-100 text-green-800"
                              : pole.status === 'in_progress'
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          )}>
                            {pole.status || 'planned'}
                          </span>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Drops Data</h3>
              <span className="text-sm text-gray-500">{drops.length} total drops</span>
            </div>
            
            {drops.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-900">Drop Number</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-900">Pole Number</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-900">Address</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-900">Customer</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {drops.slice(0, 20).map((drop: any) => (
                      <tr key={drop.id || drop.drop_number} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-900">
                          {drop.drop_number}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {drop.pole_number || 'Not assigned'}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {drop.address || 'Not specified'}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {drop.customer_name || '-'}
                        </td>
                        <td className="px-4 py-2">
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                            drop.status === 'active' 
                              ? "bg-green-100 text-green-800"
                              : drop.status === 'installed'
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          )}>
                            {drop.status || 'planned'}
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Fibre Segments</h3>
              <span className="text-sm text-gray-500">{fibre.length} total segments</span>
            </div>
            
            {fibre.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-900">Segment ID</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-900">From → To</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-900">Distance</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-900">Cable Type</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-900">Installation</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {fibre.slice(0, 20).map((segment: any) => (
                      <tr key={segment.id || segment.segment_id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-900">
                          {segment.segment_id}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {segment.from_point} → {segment.to_point}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {segment.distance}m
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {segment.cable_type || 'standard'}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {segment.installation_method || 'aerial'}
                        </td>
                        <td className="px-4 py-2">
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                            segment.status === 'installed' 
                              ? "bg-green-100 text-green-800"
                              : segment.status === 'in_progress'
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          )}>
                            {segment.status || 'planned'}
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

        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Import or Update SOW Data</h3>
              <p className="text-sm text-gray-600">
                Upload new Excel files to add or update poles, drops, and fibre scope data for this project.
              </p>
            </div>
            
            <SOWUploadSection
              projectId={projectId}
              projectName={projectName}
              onComplete={() => {
                setActiveTab('summary');
              }}
              showActions={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}