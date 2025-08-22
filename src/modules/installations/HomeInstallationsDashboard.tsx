import React, { useState, useEffect } from 'react';
import { Plus, Home, Clock, Wrench, CheckCircle, AlertTriangle, Wifi, Router, User, MapPin, MoreVertical, Activity } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

interface Installation {
  id: string;
  homeNumber: string;
  clientName: string;
  address: string;
  installDate: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'issue' | 'cancelled';
  technician: string;
  equipment: {
    ont: boolean;
    router: boolean;
    cables: boolean;
    splitter: boolean;
  };
  speedTest: {
    download: number;
    upload: number;
    ping: number;
  };
  issues: string[];
  completionTime?: string;
  customerSatisfaction?: number;
}

const HomeInstallationsDashboard: React.FC = () => {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadInstallations();
  }, []);

  const loadInstallations = () => {
    // Mock data for now
    const mockData: Installation[] = [
      {
        id: 'INST001',
        homeNumber: 'H001',
        clientName: 'John Smith',
        address: '123 Main Street, Sandton',
        installDate: new Date('2024-01-20'),
        status: 'completed',
        technician: 'Mike Johnson',
        equipment: {
          ont: true,
          router: true,
          cables: true,
          splitter: true
        },
        speedTest: {
          download: 950,
          upload: 890,
          ping: 5
        },
        issues: [],
        completionTime: '2h 30m',
        customerSatisfaction: 5
      },
      {
        id: 'INST002',
        homeNumber: 'H002',
        clientName: 'Jane Doe',
        address: '456 Park Road, Rosebank',
        installDate: new Date('2024-01-21'),
        status: 'in_progress',
        technician: 'Sarah Williams',
        equipment: {
          ont: true,
          router: true,
          cables: false,
          splitter: false
        },
        speedTest: {
          download: 0,
          upload: 0,
          ping: 0
        },
        issues: ['Waiting for cable delivery']
      },
      {
        id: 'INST003',
        homeNumber: 'H003',
        clientName: 'Bob Wilson',
        address: '789 Oak Avenue, Fourways',
        installDate: new Date('2024-01-22'),
        status: 'scheduled',
        technician: 'Tom Davis',
        equipment: {
          ont: false,
          router: false,
          cables: false,
          splitter: false
        },
        speedTest: {
          download: 0,
          upload: 0,
          ping: 0
        },
        issues: []
      }
    ];
    setInstallations(mockData);
  };

  const getStatusColor = (status: Installation['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-gray-100 text-gray-800';
      case 'issue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSpeedQuality = (speed: number) => {
    if (speed >= 900) return 'text-green-600';
    if (speed >= 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const tabs = ['All Installations', 'Scheduled', 'In Progress', 'Completed', 'Issues'];

  const filteredInstallations = installations.filter(inst => {
    if (filterStatus === 'all') return true;
    return inst.status === filterStatus;
  });

  // Calculate stats
  const stats = {
    total: installations.length,
    completed: installations.filter(i => i.status === 'completed').length,
    inProgress: installations.filter(i => i.status === 'in_progress').length,
    scheduled: installations.filter(i => i.status === 'scheduled').length,
    issues: installations.filter(i => i.issues.length > 0).length,
    avgSpeed: installations
      .filter(i => i.speedTest.download > 0)
      .reduce((sum, i) => sum + i.speedTest.download, 0) / 
      (installations.filter(i => i.speedTest.download > 0).length || 1)
  };

  return (
    <div className="ff-page-container">
      <DashboardHeader 
        title="Home Installations"
        subtitle="Manage fiber installations and customer connections"
        actions={[
          {
            label: 'Schedule Installation',
            icon: Plus,
            onClick: () => {},
            variant: 'primary'
          }
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Home className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
              <Wrench className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
              </div>
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>

        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Issues</p>
                <p className="text-2xl font-bold">{stats.issues}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Speed</p>
                <p className="text-2xl font-bold">{Math.round(stats.avgSpeed)} Mbps</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="ff-card mb-6">
        <div className="border-b">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                onClick={() => {
                  setSelectedTab(index);
                  if (index === 0) setFilterStatus('all');
                  else if (index === 1) setFilterStatus('scheduled');
                  else if (index === 2) setFilterStatus('in_progress');
                  else if (index === 3) setFilterStatus('completed');
                  else if (index === 4) setFilterStatus('issue');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === index
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Installations Table */}
      <div className="ff-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Installation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technician
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Speed Test
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInstallations.map((installation) => (
                <tr key={installation.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {installation.homeNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {installation.id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {installation.clientName}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {installation.address}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(installation.status)}`}>
                      {installation.status.replace('_', ' ')}
                    </span>
                    {installation.issues.length > 0 && (
                      <div className="mt-1 text-xs text-red-600">
                        {installation.issues[0]}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-900">{installation.technician}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        installation.equipment.ont ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Wifi className={`w-4 h-4 ${
                          installation.equipment.ont ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        installation.equipment.router ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Router className={`w-4 h-4 ${
                          installation.equipment.router ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {installation.speedTest.download > 0 ? (
                      <div>
                        <div className={`text-sm font-medium ${getSpeedQuality(installation.speedTest.download)}`}>
                          ↓ {installation.speedTest.download} Mbps
                        </div>
                        <div className={`text-xs ${getSpeedQuality(installation.speedTest.upload)}`}>
                          ↑ {installation.speedTest.upload} Mbps
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HomeInstallationsDashboard;