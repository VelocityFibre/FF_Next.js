import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Home, 
  Cable, 
  Loader2, 
  RefreshCw, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { neonSOWService } from '@/services/neonSOWService';
import { cn } from '@/utils/cn';

interface SOWDataViewerProps {
  projectId: string;
  projectName: string;
}

export function SOWDataViewer({ projectId }: SOWDataViewerProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'poles' | 'drops' | 'fibre' | 'summary'>('summary');

  useEffect(() => {
    loadSOWData();
  }, [projectId]);

  const loadSOWData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await neonSOWService.getProjectSOWData(projectId);
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load SOW data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { 
      id: 'summary' as const, 
      label: 'Summary', 
      icon: CheckCircle,
      count: null
    },
    { 
      id: 'poles' as const, 
      label: 'Poles', 
      icon: MapPin,
      count: data?.poles?.length || 0
    },
    { 
      id: 'drops' as const, 
      label: 'Drops', 
      icon: Home,
      count: data?.drops?.length || 0
    },
    { 
      id: 'fibre' as const, 
      label: 'Fibre', 
      icon: Cable,
      count: data?.fibre?.length || 0
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-4" />
        <p className="text-text-secondary">Loading SOW data from Neon...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 border border-error-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-error-900">Failed to load SOW data</h3>
            <p className="text-sm text-error-700 mt-1">{error}</p>
            <button
              onClick={loadSOWData}
              className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-error-600 hover:text-error-700 hover:bg-error-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data || (!data.poles?.length && !data.drops?.length && !data.fibre?.length)) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">No SOW Data</h3>
        <p className="text-text-secondary">
          No Scope of Work data has been uploaded for this project yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-border-primary">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-1 py-3 border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
                {tab.count !== null && (
                  <span className={cn(
                    "ml-2 px-2 py-0.5 text-xs rounded-full",
                    activeTab === tab.id
                      ? "bg-primary-100 text-primary-700"
                      : "bg-surface-secondary text-text-tertiary"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'summary' && data.summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total Poles</span>
              </div>
              <p className="text-2xl font-semibold text-blue-700">
                {data.summary.total_poles || 0}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Home className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Total Drops</span>
              </div>
              <p className="text-2xl font-semibold text-green-700">
                {data.summary.total_drops || 0}
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Cable className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Fibre Segments</span>
              </div>
              <p className="text-2xl font-semibold text-purple-700">
                {data.summary.total_fibre_segments || 0}
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Cable className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Total Length</span>
              </div>
              <p className="text-2xl font-semibold text-orange-700">
                {(data.summary.total_fibre_length || 0).toLocaleString()}m
              </p>
            </div>
          </div>
        )}

        {activeTab === 'poles' && (
          <div className="bg-background-secondary rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
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
                  {data.poles.slice(0, 50).map((pole: any, index: number) => (
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
                        <span className={cn(
                          "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                          pole.status === 'completed' 
                            ? "bg-success-100 text-success-700"
                            : pole.status === 'in_progress'
                            ? "bg-warning-100 text-warning-700"
                            : "bg-surface-secondary text-text-tertiary"
                        )}>
                          {pole.status || 'planned'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {pole.municipality || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.poles.length > 50 && (
                <div className="px-4 py-3 text-sm text-text-secondary bg-surface-secondary">
                  Showing 50 of {data.poles.length} poles
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'drops' && (
          <div className="bg-background-secondary rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
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
                  {data.drops.slice(0, 50).map((drop: any, index: number) => (
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
              {data.drops.length > 50 && (
                <div className="px-4 py-3 text-sm text-text-secondary bg-surface-secondary">
                  Showing 50 of {data.drops.length} drops
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'fibre' && (
          <div className="bg-background-secondary rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
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
                  {data.fibre.slice(0, 50).map((segment: any, index: number) => (
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
              {data.fibre.length > 50 && (
                <div className="px-4 py-3 text-sm text-text-secondary bg-surface-secondary">
                  Showing 50 of {data.fibre.length} segments
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}