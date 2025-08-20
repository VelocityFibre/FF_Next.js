import React from 'react';
import { MapPin, Home, Cable, Camera, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { TrackerItem } from '../types/tracker.types';

interface TrackerTableProps {
  data: TrackerItem[];
  isLoading: boolean;
  expandedRows: Set<string>;
  toggleRowExpansion: (id: string) => void;
}

export function TrackerTable({ data, isLoading, expandedRows, toggleRowExpansion }: TrackerTableProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pole': return <MapPin className="w-4 h-4" />;
      case 'drop': return <Home className="w-4 h-4" />;
      case 'fiber': return <Cable className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'issue': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identifier</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phase</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Photos</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">QC</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  Loading tracker data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  No items found matching your filters
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <React.Fragment key={item.id}>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <span className="text-xs font-medium uppercase text-gray-600">
                          {item.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{item.identifier}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.location}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-gray-600">{item.phase}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.progress === 100 ? 'bg-green-500' :
                              item.progress >= 50 ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{item.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Camera className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{item.photos}/{item.totalPhotos}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {item.qualityChecks === item.totalChecks ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="text-sm">{item.qualityChecks}/{item.totalChecks}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(item.lastUpdated, 'MMM dd, HH:mm')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleRowExpansion(item.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {expandedRows.has(item.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                  {expandedRows.has(item.id) && (
                    <tr className="bg-gray-50">
                      <td colSpan={10} className="px-8 py-4">
                        <TrackerRowDetails item={item} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TrackerRowDetails({ item }: { item: TrackerItem }) {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <h4 className="font-medium mb-2">Details</h4>
        <dl className="space-y-1">
          {item.type === 'pole' && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Drop Count:</dt>
              <dd className="font-medium">{item.metadata.dropCount || 0}/12</dd>
            </div>
          )}
          {item.type === 'drop' && (
            <>
              <div className="flex justify-between">
                <dt className="text-gray-600">Pole Number:</dt>
                <dd className="font-medium">{item.metadata.poleNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Home Owner:</dt>
                <dd className="font-medium">{item.metadata.homeOwner || 'N/A'}</dd>
              </div>
            </>
          )}
          {item.type === 'fiber' && (
            <>
              <div className="flex justify-between">
                <dt className="text-gray-600">Length:</dt>
                <dd className="font-medium">{item.metadata.length || 0}m</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Cable Type:</dt>
                <dd className="font-medium">{item.metadata.cableType || 'N/A'}</dd>
              </div>
            </>
          )}
        </dl>
      </div>
      <div>
        <h4 className="font-medium mb-2">Actions</h4>
        <div className="space-y-2">
          <button className="w-full px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
            View Details
          </button>
          <button className="w-full px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
}