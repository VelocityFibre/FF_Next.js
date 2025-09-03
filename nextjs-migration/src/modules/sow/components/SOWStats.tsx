import { FileText, MapPin, Home, TrendingUp } from 'lucide-react';
import { SOWListItem } from '../types/sow.types';
import { SOWDocumentType, DocumentStatus } from '@/modules/projects/types/project.types';

interface SOWStatsProps {
  documents: SOWListItem[];
}

export function SOWStats({ documents }: SOWStatsProps) {
  const stats = {
    totalDocuments: documents.length,
    totalPoles: documents
      .filter(d => d.type === SOWDocumentType.POLES)
      .reduce((acc, d) => acc + (d.metadata?.poleCount || 0), 0),
    totalDrops: documents
      .filter(d => d.type === SOWDocumentType.DROPS)
      .reduce((acc, d) => acc + (d.metadata?.dropCount || 0), 0),
    totalCable: documents
      .filter(d => d.type === SOWDocumentType.CABLE)
      .reduce((acc, d) => acc + ((d.metadata?.cableLength || 0) / 1000), 0), // Convert to km
    approvedCount: documents.filter(d => d.status === DocumentStatus.APPROVED).length,
    pendingCount: documents.filter(d => d.status === DocumentStatus.PENDING).length,
    rejectedCount: documents.filter(d => d.status === DocumentStatus.REJECTED).length,
    totalEstimatedCost: documents.reduce((acc, d) => acc + (d.metadata?.estimatedCost || 0), 0)
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Documents</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalDocuments}</p>
            <div className="mt-2 text-xs text-gray-500">
              <span className="text-green-600">{stats.approvedCount} approved</span>
              {' • '}
              <span className="text-yellow-600">{stats.pendingCount} pending</span>
              {stats.rejectedCount > 0 && (
                <>
                  {' • '}
                  <span className="text-red-600">{stats.rejectedCount} rejected</span>
                </>
              )}
            </div>
          </div>
          <FileText className="h-12 w-12 text-blue-500" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Poles</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.totalPoles.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-2">Across all projects</p>
          </div>
          <MapPin className="h-12 w-12 text-green-500" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Drops</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.totalDrops.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-2">Customer connections</p>
          </div>
          <Home className="h-12 w-12 text-purple-500" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Estimated Value</p>
            <p className="text-2xl font-semibold text-gray-900">
              ${(stats.totalEstimatedCost / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-gray-500 mt-2">Total project value</p>
          </div>
          <TrendingUp className="h-12 w-12 text-orange-500" />
        </div>
      </div>
    </div>
  );
}