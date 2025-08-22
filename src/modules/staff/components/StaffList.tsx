import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Settings,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone
} from 'lucide-react';
import { staffService } from '@/services/staffService';
import { StaffImport } from '@/components/staff/StaffImport';
import { StaffFilter, Department, StaffStatus, StaffLevel } from '@/types/staff.types';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

export function StaffList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [filter, setFilter] = useState<StaffFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  const { data: staff, isLoading, error, refetch } = useQuery({
    queryKey: ['staff', filter],
    queryFn: () => staffService.getAll(filter)
  });

  const { data: summary } = useQuery({
    queryKey: ['staff-summary'],
    queryFn: () => staffService.getStaffSummary()
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter(prev => ({ ...prev, searchTerm }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return;
    }
    
    try {
      await staffService.delete(id);
      refetch();
    } catch (error) {
      alert('Failed to delete staff member');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await staffService.exportToExcel(staff);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `staff_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export staff data');
    }
  };

  const formatDate = (date: Timestamp | Date | undefined) => {
    if (!date) return '-';
    const d = date instanceof Timestamp ? date.toDate() : date;
    return format(d, 'dd MMM yyyy');
  };

  const getStatusColor = (status: StaffStatus) => {
    switch (status) {
      case StaffStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case StaffStatus.ON_LEAVE:
        return 'bg-yellow-100 text-yellow-800';
      case StaffStatus.INACTIVE:
      case StaffStatus.SUSPENDED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showImport) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => {
              setShowImport(false);
              refetch();
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Staff List
          </button>
        </div>
        <StaffImport />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their information</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/app/settings/staff')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            title="Manage positions and departments"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
          <button
            onClick={() => navigate('/app/staff/import')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </button>
          <button
            onClick={handleExport}
            disabled={!staff || staff.length === 0}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => navigate('/app/staff/new')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Staff</p>
                <p className="text-2xl font-semibold text-gray-900">{summary.totalStaff}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-semibold text-green-600">{summary.activeStaff}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">On Leave</p>
                <p className="text-2xl font-semibold text-yellow-600">{summary.onLeaveStaff}</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-yellow-600 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Utilization</p>
                <p className="text-2xl font-semibold text-blue-600">{summary.utilizationRate.toFixed(0)}%</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, phone, or employee ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
          
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={filter.department?.[0] || ''}
                  onChange={(e) => setFilter(prev => {
                    const newFilter = { ...prev };
                    if (e.target.value) {
                      newFilter.department = [e.target.value as Department];
                    } else {
                      delete newFilter.department;
                    }
                    return newFilter;
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Departments</option>
                  {Object.values(Department).map(dept => (
                    <option key={dept} value={dept}>
                      {dept.replace('_', ' ').charAt(0).toUpperCase() + dept.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  value={filter.level?.[0] || ''}
                  onChange={(e) => setFilter(prev => {
                    const newFilter = { ...prev };
                    if (e.target.value) {
                      newFilter.level = [e.target.value as StaffLevel];
                    } else {
                      delete newFilter.level;
                    }
                    return newFilter;
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Levels</option>
                  {Object.values(StaffLevel).map(level => (
                    <option key={level} value={level}>
                      {level.replace('_', ' ').charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filter.status?.[0] || ''}
                  onChange={(e) => setFilter(prev => {
                    const newFilter = { ...prev };
                    if (e.target.value) {
                      newFilter.status = [e.target.value as StaffStatus];
                    } else {
                      delete newFilter.status;
                    }
                    return newFilter;
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Statuses</option>
                  {Object.values(StaffStatus).map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              )}
              
              {error && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-red-600">
                    Error loading staff: {(error as Error).message}
                  </td>
                </tr>
              )}
              
              {staff && staff.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No staff members found
                  </td>
                </tr>
              )}
              
              {staff?.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900">{member.position}</p>
                    <p className="text-xs text-gray-500">{member.level}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900">
                      {member.department.replace('_', ' ').charAt(0).toUpperCase() + member.department.slice(1)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <a href={`mailto:${member.email}`} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </a>
                      <a href={`tel:${member.phone}`} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {member.phone}
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(member.status)}`}>
                      {member.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900">
                      {member.currentProjectCount} / {member.maxProjectCount}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(member.currentProjectCount / member.maxProjectCount) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {formatDate(member.startDate)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/app/staff/${member.id}`)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/app/staff/${member.id}/edit`)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id!)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}