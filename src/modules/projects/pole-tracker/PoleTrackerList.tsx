import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Download, MapPin, Camera, CheckCircle, AlertTriangle } from 'lucide-react';
import { InstallationPhase } from './types/pole-tracker.types';

export function PoleTrackerList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');

  // Mock data for demonstration
  const poles = [
    {
      id: '1',
      vfPoleId: 'LAW.P.A001',
      poleNumber: 'P001',
      projectName: 'Lawley Extension',
      contractorName: 'ABC Contractors',
      status: 'Pole Permission: Approved',
      installationPhase: InstallationPhase.INSTALLATION,
      location: 'Lawley Ext 3',
      dropCount: 8,
      maxCapacity: 12,
      dateInstalled: new Date('2025-08-15'),
      hasPhotos: true,
      qualityStatus: 'pass',
    },
    {
      id: '2',
      vfPoleId: 'LAW.P.A002',
      poleNumber: 'P002',
      projectName: 'Lawley Extension',
      contractorName: 'XYZ Builders',
      status: 'Construction: In Progress',
      installationPhase: InstallationPhase.EXCAVATION,
      location: 'Lawley Ext 4',
      dropCount: 5,
      maxCapacity: 12,
      dateInstalled: new Date('2025-08-18'),
      hasPhotos: false,
      qualityStatus: 'pending',
    },
  ];

  const getStatusColor = (status: string) => {
    if (status.includes('Approved')) return 'bg-green-100 text-green-800';
    if (status.includes('In Progress')) return 'bg-yellow-100 text-yellow-800';
    if (status.includes('Pending')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getPhaseColor = (phase: InstallationPhase) => {
    switch (phase) {
      case InstallationPhase.COMPLETION: return 'text-green-600';
      case InstallationPhase.TESTING: return 'text-blue-600';
      case InstallationPhase.INSTALLATION: return 'text-purple-600';
      case InstallationPhase.EXCAVATION: return 'text-orange-600';
      case InstallationPhase.PERMISSION: return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pole Tracker</h1>
          <p className="text-gray-600 mt-1">Manage and track pole installations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/app/pole-tracker/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Pole
          </button>
          <button
            onClick={() => navigate('/app/pole-tracker/import')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Import
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pole number, VF ID..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Phases</option>
              <option value={InstallationPhase.PERMISSION}>Permission</option>
              <option value={InstallationPhase.EXCAVATION}>Excavation</option>
              <option value={InstallationPhase.INSTALLATION}>Installation</option>
              <option value={InstallationPhase.TESTING}>Testing</option>
              <option value={InstallationPhase.COMPLETION}>Completion</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Pole List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pole ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phase
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Drops
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {poles.map((pole) => (
                <tr key={pole.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pole.vfPoleId}</div>
                      <div className="text-sm text-gray-500">{pole.poleNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900">{pole.projectName}</div>
                      <div className="text-sm text-gray-500">{pole.contractorName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{pole.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(pole.status)}`}>
                      {pole.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${getPhaseColor(pole.installationPhase)}`}>
                      {pole.installationPhase.charAt(0).toUpperCase() + pole.installationPhase.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-900">
                        {pole.dropCount}/{pole.maxCapacity}
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(pole.dropCount / pole.maxCapacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {pole.qualityStatus === 'pass' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {pole.qualityStatus === 'pending' && (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                      {pole.hasPhotos && (
                        <Camera className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/app/pole-tracker/${pole.id}`)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing 1 to 2 of 2 results
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}