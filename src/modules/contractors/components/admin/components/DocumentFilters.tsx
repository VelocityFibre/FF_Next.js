import { Search, Filter } from 'lucide-react';
import { FilterStatus } from '../hooks/useDocumentApproval';

interface DocumentFiltersProps {
  searchTerm: string;
  filterStatus: FilterStatus;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: FilterStatus) => void;
  pendingCount: number;
}

export function DocumentFilters({
  searchTerm,
  filterStatus,
  onSearchChange,
  onStatusChange,
  pendingCount
}: DocumentFiltersProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Document Approval</h2>
          <p className="text-gray-600">Review and approve contractor documents</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            {pendingCount} Pending
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by contractor, document name, or type..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value as FilterStatus)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Documents</option>
            <option value="pending">Pending Review</option>
            <option value="verified">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
    </div>
  );
}