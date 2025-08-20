import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Search, Filter, Download, Upload, MapPin, Home, Cable,
  CheckCircle, AlertTriangle, Camera, TrendingUp, Calendar,
  ChevronDown, ChevronUp, Eye, RefreshCw, Grid3X3
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

interface TrackerItem {
  id: string;
  type: 'pole' | 'drop' | 'fiber';
  identifier: string; // poleNumber, dropNumber, or sectionId
  location: string;
  phase: string;
  status: 'pending' | 'in_progress' | 'completed' | 'issue';
  progress: number;
  lastUpdated: Date;
  photos: number;
  totalPhotos: number;
  qualityChecks: number;
  totalChecks: number;
  metadata: any;
}

export function UnifiedTrackerGrid() {
  const { projectId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'pole' | 'drop' | 'fiber'>('all');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'identifier' | 'status' | 'progress' | 'updated'>('identifier');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Fetch all tracker data
  const { data: trackerData, isLoading, refetch } = useQuery({
    queryKey: ['unified-trackers', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const items: TrackerItem[] = [];

      // Fetch poles
      const polesQuery = query(
        collection(db, 'poles'),
        where('projectId', '==', projectId),
        orderBy('poleNumber')
      );
      const polesSnapshot = await getDocs(polesQuery);
      polesSnapshot.forEach(doc => {
        const data = doc.data();
        const photosCount = Object.values(data.photos || {}).filter(Boolean).length;
        const checksCount = Object.values(data.qualityChecks || {}).filter(v => v !== null).length;
        
        items.push({
          id: doc.id,
          type: 'pole',
          identifier: data.poleNumber,
          location: data.location || 'Not specified',
          phase: data.phase || 'Phase 1',
          status: data.status || 'pending',
          progress: calculateProgress(data),
          lastUpdated: data.metadata?.lastUpdated?.toDate() || new Date(),
          photos: photosCount,
          totalPhotos: 6,
          qualityChecks: checksCount,
          totalChecks: 8,
          metadata: data
        });
      });

      // Fetch drops
      const dropsQuery = query(
        collection(db, 'drops'),
        where('projectId', '==', projectId),
        orderBy('dropNumber')
      );
      const dropsSnapshot = await getDocs(dropsQuery);
      dropsSnapshot.forEach(doc => {
        const data = doc.data();
        const photosCount = Object.values(data.photos || {}).filter(Boolean).length;
        const checksCount = Object.values(data.qualityChecks || {}).filter(v => v !== null).length;
        
        items.push({
          id: doc.id,
          type: 'drop',
          identifier: data.dropNumber,
          location: data.address || 'Not specified',
          phase: data.phase || 'Phase 1',
          status: data.status || 'pending',
          progress: calculateProgress(data),
          lastUpdated: data.metadata?.lastUpdated?.toDate() || new Date(),
          photos: photosCount,
          totalPhotos: 6,
          qualityChecks: checksCount,
          totalChecks: 6,
          metadata: data
        });
      });

      // Fetch fiber sections
      const fiberQuery = query(
        collection(db, 'fiberSections'),
        where('projectId', '==', projectId),
        orderBy('sectionId')
      );
      const fiberSnapshot = await getDocs(fiberQuery);
      fiberSnapshot.forEach(doc => {
        const data = doc.data();
        const photosCount = Object.values(data.photos || {}).filter(Boolean).length;
        const checksCount = Object.values(data.qualityChecks || {}).filter(v => v !== null).length;
        
        items.push({
          id: doc.id,
          type: 'fiber',
          identifier: data.sectionId,
          location: `${data.startPoint || 'Start'} → ${data.endPoint || 'End'}`,
          phase: data.phase || 'Phase 1',
          status: data.status || 'pending',
          progress: calculateProgress(data),
          lastUpdated: data.metadata?.lastUpdated?.toDate() || new Date(),
          photos: photosCount,
          totalPhotos: 6,
          qualityChecks: checksCount,
          totalChecks: 6,
          metadata: data
        });
      });

      return items;
    },
    enabled: !!projectId
  });

  // Calculate progress percentage
  function calculateProgress(data: any): number {
    let totalSteps = 0;
    let completedSteps = 0;

    // Check photos
    if (data.photos) {
      const photoValues = Object.values(data.photos);
      totalSteps += photoValues.length;
      completedSteps += photoValues.filter(Boolean).length;
    }

    // Check quality checks
    if (data.qualityChecks) {
      const checkValues = Object.values(data.qualityChecks);
      totalSteps += checkValues.length;
      completedSteps += checkValues.filter(v => v !== null).length;
    }

    // Check status
    totalSteps += 1;
    if (data.status === 'completed') completedSteps += 1;

    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  }

  // Filter and sort data
  const filteredData = useMemo(() => {
    if (!trackerData) return [];

    let filtered = [...trackerData];

    // Apply filters
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    if (selectedPhase !== 'all') {
      filtered = filtered.filter(item => item.phase === selectedPhase);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy];
      let bVal: any = b[sortBy];

      if (sortBy === 'updated') {
        aVal = a.lastUpdated.getTime();
        bVal = b.lastUpdated.getTime();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [trackerData, searchTerm, selectedType, selectedPhase, selectedStatus, sortBy, sortOrder]);

  // Get unique phases
  const phases = useMemo(() => {
    if (!trackerData) return [];
    const uniquePhases = new Set(trackerData.map(item => item.phase));
    return Array.from(uniquePhases).sort();
  }, [trackerData]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!trackerData) return null;

    const poleStats = trackerData.filter(i => i.type === 'pole');
    const dropStats = trackerData.filter(i => i.type === 'drop');
    const fiberStats = trackerData.filter(i => i.type === 'fiber');

    return {
      poles: {
        total: poleStats.length,
        completed: poleStats.filter(i => i.status === 'completed').length,
        progress: poleStats.filter(i => i.status === 'in_progress').length,
        pending: poleStats.filter(i => i.status === 'pending').length
      },
      drops: {
        total: dropStats.length,
        completed: dropStats.filter(i => i.status === 'completed').length,
        progress: dropStats.filter(i => i.status === 'in_progress').length,
        pending: dropStats.filter(i => i.status === 'pending').length
      },
      fiber: {
        total: fiberStats.length,
        completed: fiberStats.filter(i => i.status === 'completed').length,
        progress: fiberStats.filter(i => i.status === 'in_progress').length,
        pending: fiberStats.filter(i => i.status === 'pending').length
      }
    };
  }, [trackerData]);

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

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

  const exportData = () => {
    // Export filtered data to CSV
    const csv = [
      ['Type', 'Identifier', 'Location', 'Phase', 'Status', 'Progress', 'Photos', 'Quality Checks', 'Last Updated'],
      ...filteredData.map(item => [
        item.type,
        item.identifier,
        item.location,
        item.phase,
        item.status,
        `${item.progress}%`,
        `${item.photos}/${item.totalPhotos}`,
        `${item.qualityChecks}/${item.totalChecks}`,
        format(item.lastUpdated, 'yyyy-MM-dd HH:mm')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracker-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Grid3X3 className="w-6 h-6" />
            Unified Tracker Grid
          </h1>
          <p className="text-gray-600 mt-1">Track all poles, drops, and fiber sections in one place</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={exportData}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Poles</span>
              <MapPin className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{stats.poles.total}</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.poles.completed} completed, {stats.poles.progress} in progress
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Home Drops</span>
              <Home className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{stats.drops.total}</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.drops.completed} completed, {stats.drops.progress} in progress
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Fiber Sections</span>
              <Cable className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{stats.fiber.total}</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.fiber.completed} completed, {stats.fiber.progress} in progress
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by ID or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="pole">Poles</option>
            <option value="drop">Home Drops</option>
            <option value="fiber">Fiber Sections</option>
          </select>
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Phases</option>
            {phases.map(phase => (
              <option key={phase} value={phase}>{phase}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="issue">Issue</option>
          </select>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="identifier-asc">ID (A-Z)</option>
            <option value="identifier-desc">ID (Z-A)</option>
            <option value="status-asc">Status (A-Z)</option>
            <option value="status-desc">Status (Z-A)</option>
            <option value="progress-asc">Progress (Low-High)</option>
            <option value="progress-desc">Progress (High-Low)</option>
            <option value="updated-desc">Recently Updated</option>
            <option value="updated-asc">Oldest Updated</option>
          </select>
        </div>
      </div>

      {/* Grid */}
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
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    No items found matching your filters
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
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
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-medium mb-2">Details</h4>
                              <dl className="space-y-1">
                                {item.type === 'pole' && (
                                  <>
                                    <div className="flex justify-between">
                                      <dt className="text-gray-600">Drop Count:</dt>
                                      <dd className="font-medium">{item.metadata.dropCount || 0}/12</dd>
                                    </div>
                                  </>
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
    </div>
  );
}