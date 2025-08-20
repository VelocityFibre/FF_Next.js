import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Download, 
  Plus,
  Home,
  Calendar,
  User,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wifi,
  Camera,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail
} from 'lucide-react';

export interface HomeInstall {
  id: string;
  dropNumber: string;
  address: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  scheduledDate: string;
  scheduledTime: string;
  teamId: string;
  teamName: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'rescheduled';
  equipment: {
    ontSerial?: string;
    routerSerial?: string;
    ontInstalled: boolean;
    routerInstalled: boolean;
  };
  speedTest?: {
    download: number;
    upload: number;
    ping: number;
    testedAt: string;
  };
  photos: {
    beforeInstall?: string;
    ontInstallation?: string;
    routerSetup?: string;
    speedTest?: string;
    completion?: string;
  };
  notes?: string;
  issues?: string[];
  completedAt?: string;
  duration?: number; // in minutes
}

export function HomeInstallsList() {
  const navigate = useNavigate();
  const [installs, setInstalls] = useState<HomeInstall[]>([]);
  const [filteredInstalls, setFilteredInstalls] = useState<HomeInstall[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInstalls();
  }, []);

  useEffect(() => {
    filterInstalls();
  }, [installs, searchTerm, statusFilter, dateFilter]);

  const loadInstalls = async () => {
    try {
      // Mock data for demonstration
      const mockInstalls: HomeInstall[] = [
        {
          id: '1',
          dropNumber: 'D001',
          address: '123 Main Street, Lawrenceburg',
          customerName: 'John Smith',
          customerPhone: '+1 234-567-8900',
          customerEmail: 'john.smith@email.com',
          scheduledDate: '2024-01-20',
          scheduledTime: '09:00',
          teamId: 'team1',
          teamName: 'Installation Team A',
          status: 'completed',
          equipment: {
            ontSerial: 'ONT123456',
            routerSerial: 'RTR789012',
            ontInstalled: true,
            routerInstalled: true
          },
          speedTest: {
            download: 945.5,
            upload: 912.3,
            ping: 3,
            testedAt: '2024-01-20T11:30:00'
          },
          photos: {
            beforeInstall: 'photo1.jpg',
            ontInstallation: 'photo2.jpg',
            routerSetup: 'photo3.jpg',
            speedTest: 'photo4.jpg',
            completion: 'photo5.jpg'
          },
          completedAt: '2024-01-20T11:45:00',
          duration: 165
        },
        {
          id: '2',
          dropNumber: 'D002',
          address: '456 Oak Avenue, Anderson',
          customerName: 'Jane Doe',
          customerPhone: '+1 234-567-8901',
          scheduledDate: '2024-01-20',
          scheduledTime: '14:00',
          teamId: 'team2',
          teamName: 'Installation Team B',
          status: 'in_progress',
          equipment: {
            ontInstalled: false,
            routerInstalled: false
          },
          photos: {}
        },
        {
          id: '3',
          dropNumber: 'D003',
          address: '789 Pine Road, Greendale',
          customerName: 'Bob Johnson',
          customerPhone: '+1 234-567-8902',
          scheduledDate: '2024-01-21',
          scheduledTime: '10:00',
          teamId: 'team1',
          teamName: 'Installation Team A',
          status: 'scheduled',
          equipment: {
            ontInstalled: false,
            routerInstalled: false
          },
          photos: {}
        }
      ];

      setInstalls(mockInstalls);
      setFilteredInstalls(mockInstalls);
    } catch (error) {
      console.error('Error loading installs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInstalls = () => {
    let filtered = [...installs];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(install =>
        install.address.toLowerCase().includes(search) ||
        install.customerName.toLowerCase().includes(search) ||
        install.dropNumber.toLowerCase().includes(search) ||
        install.teamName.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(install => install.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      if (dateFilter === 'today') {
        filtered = filtered.filter(install => install.scheduledDate === today);
      } else if (dateFilter === 'tomorrow') {
        filtered = filtered.filter(install => install.scheduledDate === tomorrow);
      } else if (dateFilter === 'week') {
        const weekFromNow = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
        filtered = filtered.filter(install => 
          install.scheduledDate >= today && install.scheduledDate <= weekFromNow
        );
      }
    }

    setFilteredInstalls(filtered);
  };

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusColor = (status: HomeInstall['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = () => {
    // Implementation for CSV export
    console.log('Exporting to CSV...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Home Installations</h1>
          <p className="text-gray-600 mt-1">Manage and track all home fiber installations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => navigate('/app/home-installs/schedule')}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Install
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by address, customer, drop number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="week">This Week</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Installs</p>
              <p className="text-2xl font-bold text-gray-900">{filteredInstalls.length}</p>
            </div>
            <Home className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredInstalls.filter(i => i.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {filteredInstalls.filter(i => i.status === 'in_progress').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-600">
                {filteredInstalls.filter(i => i.status === 'scheduled').length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Installations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Drop/Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInstalls.map((install) => (
                <>
                  <tr key={install.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleRowExpansion(install.id)}
                        className="flex items-center space-x-2 text-left"
                      >
                        {expandedRows.has(install.id) ? 
                          <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        }
                        <div>
                          <p className="text-sm font-medium text-gray-900">{install.dropNumber}</p>
                          <p className="text-sm text-gray-500">{install.address}</p>
                        </div>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{install.customerName}</p>
                        <p className="text-sm text-gray-500">{install.customerPhone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 text-sm text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{install.scheduledDate}</span>
                        <Clock className="w-4 h-4 text-gray-400 ml-2" />
                        <span>{install.scheduledTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{install.teamName}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(install.status)}`}>
                        {install.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {install.equipment.ontInstalled && (
                          <span className="text-green-600" title="ONT Installed">ONT ✓</span>
                        )}
                        {install.equipment.routerInstalled && (
                          <span className="text-green-600" title="Router Installed">Router ✓</span>
                        )}
                        {!install.equipment.ontInstalled && !install.equipment.routerInstalled && (
                          <span className="text-gray-400">Pending</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/app/home-installs/${install.id}`)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows.has(install.id) && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Equipment Details */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Equipment Details</h4>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-600">
                                ONT Serial: <span className="text-gray-900">{install.equipment.ontSerial || 'Not installed'}</span>
                              </p>
                              <p className="text-gray-600">
                                Router Serial: <span className="text-gray-900">{install.equipment.routerSerial || 'Not installed'}</span>
                              </p>
                            </div>
                          </div>

                          {/* Speed Test Results */}
                          {install.speedTest && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Speed Test Results</h4>
                              <div className="space-y-1 text-sm">
                                <p className="text-gray-600">
                                  Download: <span className="text-gray-900">{install.speedTest.download} Mbps</span>
                                </p>
                                <p className="text-gray-600">
                                  Upload: <span className="text-gray-900">{install.speedTest.upload} Mbps</span>
                                </p>
                                <p className="text-gray-600">
                                  Ping: <span className="text-gray-900">{install.speedTest.ping} ms</span>
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Photos Status */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Photo Evidence</h4>
                            <div className="flex flex-wrap gap-2">
                              {install.photos.beforeInstall && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  <Camera className="w-3 h-3 mr-1" />
                                  Before
                                </span>
                              )}
                              {install.photos.ontInstallation && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  <Camera className="w-3 h-3 mr-1" />
                                  ONT
                                </span>
                              )}
                              {install.photos.routerSetup && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  <Camera className="w-3 h-3 mr-1" />
                                  Router
                                </span>
                              )}
                              {install.photos.speedTest && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  <Camera className="w-3 h-3 mr-1" />
                                  Speed
                                </span>
                              )}
                              {install.photos.completion && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  <Camera className="w-3 h-3 mr-1" />
                                  Complete
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        {install.notes && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">Notes</h4>
                            <p className="text-sm text-gray-600">{install.notes}</p>
                          </div>
                        )}

                        {/* Issues */}
                        {install.issues && install.issues.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">Issues Reported</h4>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {install.issues.map((issue, idx) => (
                                <li key={idx}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInstalls.length === 0 && (
          <div className="text-center py-12">
            <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No installations found</p>
          </div>
        )}
      </div>
    </div>
  );
}