/**
 * Staff List Header Component
 */

import { Users, Plus, Upload, Settings, Filter, Download } from 'lucide-react';

interface StaffListHeaderProps {
  totalStaff: number;
  activeStaff: number;
  utilizationRate: number;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  onAddStaff: () => void;
  onImport: () => void;
  onSettings: () => void;
  onExport: () => void;
}

export function StaffListHeader({
  totalStaff,
  activeStaff,
  utilizationRate,
  showFilters,
  setShowFilters,
  onAddStaff,
  onImport,
  onSettings,
  onExport
}: StaffListHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                {totalStaff} total staff • {activeStaff} active • {utilizationRate}% utilization
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-md text-sm font-medium flex items-center ${
                showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            <button
              onClick={onExport}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={onImport}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button>
            <button
              onClick={onSettings}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Staff Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={onAddStaff}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}