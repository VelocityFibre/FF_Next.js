/**
 * Refactored HomeInstallsList component
 * Split into modular components for better maintainability
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeInstall } from './types/home-install.types';
import { HomeInstallsHeader } from './components/HomeInstallsHeader';
import { HomeInstallsTable } from './components/HomeInstallsTable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { log } from '@/lib/logger';
import { 
  filterHomeInstalls, 
  exportInstallsToCSV, 
  generateMockInstalls 
} from './utils/homeInstallsHelpers';

export function HomeInstallsList() {
  const navigate = useNavigate();
  const [installs, setInstalls] = useState<HomeInstall[]>([]);
  const [filteredInstalls, setFilteredInstalls] = useState<HomeInstall[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load installs on mount
  useEffect(() => {
    loadInstalls();
  }, []);

  // Apply filters when search/filter criteria change
  useEffect(() => {
    const filtered = filterHomeInstalls(installs, searchTerm, statusFilter, dateFilter);
    setFilteredInstalls(filtered);
  }, [installs, searchTerm, statusFilter, dateFilter]);

  const loadInstalls = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockInstalls = generateMockInstalls();
      setInstalls(mockInstalls);
      setFilteredInstalls(mockInstalls);
    } catch (error) {
      log.error('Error loading installations:', { data: error }, 'HomeInstallsList');
    } finally {
      setLoading(false);
    }
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

  const handleAddNew = () => {
    navigate('/app/home-installs/new');
  };

  const handleView = (id: string) => {
    navigate(`/app/home-installs/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/app/home-installs/${id}/edit`);
  };

  const handleExport = () => {
    exportInstallsToCSV(filteredInstalls);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HomeInstallsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onAddNew={handleAddNew}
        onExport={handleExport}
      />

      <HomeInstallsTable
        installs={filteredInstalls}
        expandedRows={expandedRows}
        onToggleRow={toggleRowExpansion}
        onView={handleView}
        onEdit={handleEdit}
      />

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral-600">
            Showing {filteredInstalls.length} of {installs.length} installations
          </span>
          <div className="flex gap-4 text-sm">
            <span className="text-neutral-600">
              Scheduled: {filteredInstalls.filter(i => i.status === 'scheduled').length}
            </span>
            <span className="text-neutral-600">
              In Progress: {filteredInstalls.filter(i => i.status === 'in_progress').length}
            </span>
            <span className="text-success-600">
              Completed: {filteredInstalls.filter(i => i.status === 'completed').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}