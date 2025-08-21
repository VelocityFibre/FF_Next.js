import { useState, useEffect } from 'react';
import { 
  Home,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  Cable,
  Search
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface Drop {
  id: string;
  dropNumber: string;
  poleNumber: string;
  customerName: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'failed';
  installationType: 'aerial' | 'underground' | 'hybrid';
  cableLength: number; // meters
  scheduledDate?: string;
  completedDate?: string;
  technician?: string;
  notes?: string;
  issues?: string[];
  photos?: string[];
}

interface DropsStats {
  totalDrops: number;
  completedDrops: number;
  pendingDrops: number;
  inProgressDrops: number;
  failedDrops: number;
  completionRate: number;
  averageInstallTime: number; // hours
  totalCableUsed: number; // meters
}

export function DropsManagement() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [stats, setStats] = useState<DropsStats>({
    totalDrops: 0,
    completedDrops: 0,
    pendingDrops: 0,
    inProgressDrops: 0,
    failedDrops: 0,
    completionRate: 0,
    averageInstallTime: 0,
    totalCableUsed: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Load drops data - TODO: Replace with actual API call
    const mockDrops: Drop[] = [
      {
        id: '1',
        dropNumber: 'D001',
        poleNumber: 'P001',
        customerName: 'John Smith',
        address: '123 Main St',
        status: 'completed',
        installationType: 'aerial',
        cableLength: 45,
        scheduledDate: '2024-01-15',
        completedDate: '2024-01-15',
        technician: 'Mike Johnson',
      },
      {
        id: '2',
        dropNumber: 'D002',
        poleNumber: 'P001',
        customerName: 'Jane Doe',
        address: '125 Main St',
        status: 'in_progress',
        installationType: 'aerial',
        cableLength: 52,
        scheduledDate: '2024-01-20',
        technician: 'Tom Wilson',
      },
      {
        id: '3',
        dropNumber: 'D003',
        poleNumber: 'P002',
        customerName: 'Bob Wilson',
        address: '456 Oak Ave',
        status: 'scheduled',
        installationType: 'underground',
        cableLength: 78,
        scheduledDate: '2024-01-22',
        technician: 'Sarah Lee',
      },
      {
        id: '4',
        dropNumber: 'D004',
        poleNumber: 'P002',
        customerName: 'Alice Brown',
        address: '458 Oak Ave',
        status: 'pending',
        installationType: 'aerial',
        cableLength: 60,
      },
      {
        id: '5',
        dropNumber: 'D005',
        poleNumber: 'P003',
        customerName: 'Charlie Davis',
        address: '789 Pine Rd',
        status: 'failed',
        installationType: 'hybrid',
        cableLength: 95,
        scheduledDate: '2024-01-18',
        technician: 'Mike Johnson',
        issues: ['Customer not available', 'Rescheduling required'],
      },
    ];

    setDrops(mockDrops);
    calculateStats(mockDrops);
  }, []);

  const calculateStats = (dropsData: Drop[]) => {
    const total = dropsData.length;
    const completed = dropsData.filter(d => d.status === 'completed').length;
    const pending = dropsData.filter(d => d.status === 'pending').length;
    const inProgress = dropsData.filter(d => d.status === 'in_progress').length;
    const failed = dropsData.filter(d => d.status === 'failed').length;
    
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const totalCable = dropsData.reduce((sum, d) => sum + d.cableLength, 0);
    
    // Calculate average install time from completed drops
    const completedWithTime = dropsData.filter(
      d => d.status === 'completed' && d.scheduledDate && d.completedDate
    );
    
    let avgTime = 0;
    if (completedWithTime.length > 0) {
      // Simplified: assuming same-day installation for now
      avgTime = 4; // Average 4 hours per installation
    }

    setStats({
      totalDrops: total,
      completedDrops: completed,
      pendingDrops: pending,
      inProgressDrops: inProgress,
      failedDrops: failed,
      completionRate,
      averageInstallTime: avgTime,
      totalCableUsed: totalCable,
    });
  };

  const filteredDrops = drops.filter(drop => {
    const matchesSearch = searchTerm === '' || 
      drop.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drop.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drop.dropNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drop.poleNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || drop.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Drop['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'in_progress':
        return 'bg-info-100 text-info-800 border-info-200';
      case 'scheduled':
        return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'failed':
        return 'bg-error-100 text-error-800 border-error-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getStatusIcon = (status: Drop['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Drops Management</h1>
            <p className="text-neutral-600 mt-1">Track and manage customer drop installations</p>
          </div>
          <div className="flex items-center gap-2">
            <Home className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        {/* Progress Overview */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">Completion Rate</span>
            <span className="text-sm font-semibold">{stats.completionRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-3">
            <div 
              className="bg-success-600 h-3 rounded-full transition-all"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">Total Drops</span>
            <Home className="h-4 w-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-semibold text-neutral-900">{stats.totalDrops}</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">Completed</span>
            <CheckCircle className="h-4 w-4 text-success-600" />
          </div>
          <p className="text-2xl font-semibold text-success-600">{stats.completedDrops}</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">In Progress</span>
            <Clock className="h-4 w-4 text-info-600" />
          </div>
          <p className="text-2xl font-semibold text-info-600">{stats.inProgressDrops}</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">Pending</span>
            <Clock className="h-4 w-4 text-warning-600" />
          </div>
          <p className="text-2xl font-semibold text-warning-600">{stats.pendingDrops}</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">Cable Used</span>
            <Cable className="h-4 w-4 text-primary-600" />
          </div>
          <p className="text-2xl font-semibold text-neutral-900">{stats.totalCableUsed}m</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by customer, address, drop or pole number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Drops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrops.map(drop => (
          <div
            key={drop.id}
            className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => console.log('Drop selected:', drop)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-neutral-900">{drop.dropNumber}</h3>
                <p className="text-sm text-neutral-600">Pole: {drop.poleNumber}</p>
              </div>
              <span className={cn(
                'px-2 py-1 text-xs font-medium rounded-full border flex items-center gap-1',
                getStatusColor(drop.status)
              )}>
                {getStatusIcon(drop.status)}
                {drop.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-neutral-400" />
                <span className="text-neutral-900">{drop.customerName}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-neutral-400" />
                <span className="text-neutral-600">{drop.address}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Cable className="h-4 w-4 text-neutral-400" />
                <span className="text-neutral-600">
                  {drop.cableLength}m • {drop.installationType}
                </span>
              </div>

              {drop.scheduledDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-600">
                    {new Date(drop.scheduledDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {drop.technician && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-600">{drop.technician}</span>
                </div>
              )}

              {drop.issues && drop.issues.length > 0 && (
                <div className="mt-2 p-2 bg-error-50 rounded text-sm text-error-700">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  {drop.issues[0]}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}