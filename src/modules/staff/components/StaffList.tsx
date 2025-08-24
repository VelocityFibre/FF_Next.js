/**
 * Staff List Component - Refactored Version
 * Main container for staff management with split components
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { staffService } from '@/services/staffService';
import { StaffImport } from '@/components/staff/StaffImport';
import { StaffListHeader } from './StaffListHeader';
import { StaffFilters } from './StaffFilters';
import { StaffTable } from './StaffTable';
import { StaffFilter, StaffMember } from '@/types/staff.types';

export function StaffList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [filter, setFilter] = useState<StaffFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  const { data: staff = [], isLoading, error, refetch } = useQuery({
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
      console.error('Failed to delete staff member:', error);
    }
  };

  const handleExport = async () => {
    try {
      const csvContent = staff.map(member => ({
        'Employee ID': member.employeeId,
        'Name': member.name,
        'Email': member.email,
        'Phone': member.phone,
        'Position': member.position || '',
        'Department': member.department || '',
        'Status': member.status || '',
        'Start Date': member.startDate || '',
        'Project Count': member.currentProjectCount || 0
      }));

      const csv = [
        Object.keys(csvContent[0]).join(','),
        ...csvContent.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `staff_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (showImport) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Import Staff</h1>
          <button
            onClick={() => setShowImport(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to List
          </button>
        </div>
        <StaffImport onComplete={() => {
          setShowImport(false);
          refetch();
        }} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load staff data</p>
        <button 
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StaffListHeader
        totalStaff={summary?.totalStaff || 0}
        activeStaff={summary?.activeStaff || 0}
        utilizationRate={Math.round(summary?.utilizationRate || 0)}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        onAddStaff={() => navigate('/app/staff/create')}
        onImport={() => setShowImport(true)}
        onSettings={() => navigate('/app/staff/settings')}
        onExport={handleExport}
      />

      {showFilters && (
        <StaffFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filter={filter}
          setFilter={setFilter}
          onSearch={handleSearch}
        />
      )}

      <StaffTable
        staff={staff}
        onView={(staff: StaffMember) => navigate(`/app/staff/${staff.id}`)}
        onEdit={(staff: StaffMember) => navigate(`/app/staff/edit/${staff.id}`)}
        onDelete={handleDelete}
      />

      {staff.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No staff members found</p>
          <button
            onClick={() => navigate('/app/staff/create')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add First Staff Member
          </button>
        </div>
      )}
    </div>
  );
}