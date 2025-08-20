import { useState, useMemo } from 'react';
import { 
  Search, Filter, Download, Upload, MapPin, Home, Cable, 
  CheckCircle, AlertTriangle, Camera, TrendingUp, Calendar,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { TrackerType, TrackerGridItem, TrackerFilters } from './types/tracker.types';
import { useTrackers } from './hooks/useTracker';

export function TrackerGrid() {
  const [filters, setFilters] = useState<TrackerFilters>({
    type: 'all',
    search: '',
  });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<keyof TrackerGridItem>('identifier');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { data: trackers, isLoading } = useTrackers(filters);

  // Type icons
  const getTypeIcon = (type: TrackerType) => {
    switch (type) {
      case 'pole': return MapPin;
      case 'drop': return Home;
      case 'fiber': return Cable;
    }
  };

  // Type colors
  const getTypeColor = (type: TrackerType) => {
    switch (type) {
      case 'pole': return 'text-blue-600 bg-blue-100';
      case 'drop': return 'text-green-600 bg-green-100';
      case 'fiber': return 'text-purple-600 bg-purple-100';
    }
  };

  // Status colors
  const getStatusColor = (status: string) => {
    if (status.toLowerCase().includes('complete')) return 'bg-green-100 text-green-800';
    if (status.toLowerCase().includes('progress')) return 'bg-yellow-100 text-yellow-800';
    if (status.toLowerCase().includes('pending')) return 'bg-gray-100 text-gray-800';
    if (status.toLowerCase().includes('failed')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Quality status icon
  const getQualityIcon = (status?: string) => {
    if (status === 'pass') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'fail') return <AlertTriangle className="w-4 h-4 text-red-500" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!trackers) return [];
    
    return [...trackers].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [trackers, sortField, sortDirection]);

  // Toggle sort
  const handleSort = (field: keyof TrackerGridItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Select/deselect items
  const toggleItemSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Select all visible items
  const toggleSelectAll = () => {
    if (selectedItems.size === sortedData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(sortedData.map(item => item.id)));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Tracker Grid</h1>
          <p className="text-gray-600 mt-1">Track all poles, drops, and fiber sections</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Upload className="w-4 h-4" />
            Import Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search ID, location, customer..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as TrackerType | 'all' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="pole">Poles</option>
              <option value="drop">Drops</option>
              <option value="fiber">Fiber</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status || 'all'}
              onChange={(e) => setFilters({ ...filters, status: e.target.value === 'all' ? undefined : e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Quality Filter */}
          <div>
            <select
              value={filters.qualityStatus || 'all'}
              onChange={(e) => setFilters({ ...filters, qualityStatus: e.target.value === 'all' ? undefined : e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Quality</option>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            <button className="text-sm text-blue-600 hover:text-blue-700">
              <Filter className="w-4 h-4 inline mr-1" />
              Advanced Filters
            </button>
            <button 
              onClick={() => setFilters({ type: 'all', search: '' })}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              Clear Filters
            </button>
          </div>
          <div className="text-sm text-gray-600">
            {sortedData.length} items {selectedItems.size > 0 && `(${selectedItems.size} selected)`}
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === sortedData.length && sortedData.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('type')}
                    className="text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Type
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('identifier')}
                    className="text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    ID / Number
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('location')}
                    className="text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Location
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('status')}
                    className="text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Status
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('progress')}
                    className="text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Progress
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contractor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Photos
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    Loading tracker data...
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    No tracker items found. Import data to get started.
                  </td>
                </tr>
              ) : (
                sortedData.map((item) => {
                  const Icon = getTypeIcon(item.type);
                  const isExpanded = expandedRows.has(item.id);
                  
                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                            <Icon className="w-3 h-3 mr-1" />
                            {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.identifier}</div>
                            <div className="text-xs text-gray-500">{item.vfId}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-900">{item.location}</span>
                          </div>
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
                                  item.progress > 50 ? 'bg-blue-500' : 'bg-yellow-500'
                                }`}
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">{item.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">{item.contractorName || '-'}</div>
                          {item.teamName && (
                            <div className="text-xs text-gray-500">{item.teamName}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {getQualityIcon(item.qualityStatus)}
                        </td>
                        <td className="px-4 py-3">
                          {item.hasPhotos ? (
                            <Camera className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Camera className="w-4 h-4 text-gray-300" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleRowExpansion(item.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Row Details */}
                      {isExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan={10} className="px-8 py-4">
                            <div className="grid grid-cols-3 gap-4">
                              {/* Type-specific details */}
                              {item.type === 'pole' && (
                                <>
                                  <div>
                                    <span className="text-xs text-gray-500">Drop Capacity</span>
                                    <p className="text-sm font-medium">{item.dropCount || 0}/{item.maxCapacity || 12}</p>
                                  </div>
                                </>
                              )}
                              {item.type === 'drop' && (
                                <>
                                  <div>
                                    <span className="text-xs text-gray-500">Customer</span>
                                    <p className="text-sm font-medium">{item.customerName || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">Cable Length</span>
                                    <p className="text-sm font-medium">{item.cableLength || 0}m</p>
                                  </div>
                                </>
                              )}
                              {item.type === 'fiber' && (
                                <>
                                  <div>
                                    <span className="text-xs text-gray-500">Cable Length</span>
                                    <p className="text-sm font-medium">{item.cableLength || 0}m</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">Core Count</span>
                                    <p className="text-sm font-medium">{item.coreCount || 0}</p>
                                  </div>
                                </>
                              )}
                              <div>
                                <span className="text-xs text-gray-500">Planned Date</span>
                                <p className="text-sm font-medium">
                                  {item.plannedDate ? new Date(item.plannedDate).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500">Completed Date</span>
                                <p className="text-sm font-medium">
                                  {item.completedDate ? new Date(item.completedDate).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                              <button className="text-sm text-blue-600 hover:text-blue-700">View Details</button>
                              <button className="text-sm text-blue-600 hover:text-blue-700">Edit</button>
                              <button className="text-sm text-blue-600 hover:text-blue-700">Upload Photos</button>
                              <button className="text-sm text-blue-600 hover:text-blue-700">Quality Check</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing 1 to {Math.min(10, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-blue-700">
            {selectedItems.size} items selected
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-white border border-blue-300 text-blue-700 rounded-md text-sm hover:bg-blue-50">
              Update Status
            </button>
            <button className="px-3 py-1 bg-white border border-blue-300 text-blue-700 rounded-md text-sm hover:bg-blue-50">
              Assign Team
            </button>
            <button className="px-3 py-1 bg-white border border-blue-300 text-blue-700 rounded-md text-sm hover:bg-blue-50">
              Export Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
}