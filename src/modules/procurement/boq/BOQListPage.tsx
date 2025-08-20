import { useState } from 'react';
import { Plus, Download, Upload, Filter, Search } from 'lucide-react';
import { useBOQs } from '../hooks/useBOQ';
import { BOQStatus } from '@/types/procurement.types';
import { BOQCard } from '../components/BOQCard';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useNavigate } from 'react-router-dom';

export function BOQListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BOQStatus | 'all'>('all');
  
  const { data: boqs, isLoading, error } = useBOQs({
    status: statusFilter === 'all' ? undefined : statusFilter
  });

  const filteredBOQs = boqs?.filter(boq => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        boq.boqNumber.toLowerCase().includes(search) ||
        boq.title.toLowerCase().includes(search) ||
        boq.projectName?.toLowerCase().includes(search) ||
        boq.clientName?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const handleCreate = () => {
    navigate('/procurement/boq/new');
  };

  const handleImport = () => {
    // TODO: Implement Excel import
    console.log('Import BOQ from Excel');
  };

  const handleExportAll = () => {
    // TODO: Implement bulk export
    console.log('Export all BOQs');
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading BOQs: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bill of Quantities</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage project BOQs, templates, and pricing
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleImport}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button
            onClick={handleExportAll}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export All
          </Button>
          <Button
            onClick={handleCreate}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New BOQ
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search BOQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BOQStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value={BOQStatus.DRAFT}>Draft</option>
            <option value={BOQStatus.PENDING_REVIEW}>Pending Review</option>
            <option value={BOQStatus.APPROVED}>Approved</option>
            <option value={BOQStatus.REVISED}>Revised</option>
            <option value={BOQStatus.REJECTED}>Rejected</option>
            <option value={BOQStatus.EXPIRED}>Expired</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total BOQs</p>
          <p className="text-2xl font-bold text-gray-900">{boqs?.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Draft</p>
          <p className="text-2xl font-bold text-yellow-600">
            {boqs?.filter(b => b.status === BOQStatus.DRAFT).length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {boqs?.filter(b => b.status === BOQStatus.APPROVED).length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="text-2xl font-bold text-gray-900">
            R {boqs?.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* BOQ List */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredBOQs && filteredBOQs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBOQs.map((boq) => (
            <BOQCard key={boq.id} boq={boq} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-500">No BOQs found</p>
          <Button
            onClick={handleCreate}
            className="mt-4"
          >
            Create First BOQ
          </Button>
        </div>
      )}
    </div>
  );
}