import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Upload, FileText, Search, Filter } from 'lucide-react';
import { ProcurementErrorBoundary } from '../../components/error/ProcurementErrorBoundary';

/**
 * BOQ Dashboard - Main landing page for BOQ management
 * Following FibreFlow Universal Module Structure
 */
export function BOQDashboard() {
  // Mock data - will be replaced with real BOQ data
  const mockBOQs = [
    {
      id: '1',
      name: 'Project Alpha BOQ v2.1',
      project: 'Project Alpha',
      status: 'APPROVED',
      version: '2.1',
      uploadedAt: '2024-01-15',
      items: 245,
      mappedItems: 240,
      exceptions: 5
    },
    {
      id: '2',
      name: 'Beta Phase 1 BOQ',
      project: 'Project Beta',
      status: 'MAPPING_REVIEW',
      version: '1.0',
      uploadedAt: '2024-01-18',
      items: 189,
      mappedItems: 150,
      exceptions: 39
    },
    {
      id: '3',
      name: 'Gamma Project BOQ',
      project: 'Project Gamma',
      status: 'DRAFT',
      version: '1.0',
      uploadedAt: '2024-01-20',
      items: 98,
      mappedItems: 0,
      exceptions: 98
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'MAPPING_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProcurementErrorBoundary level="page">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bill of Quantities</h1>
            <p className="text-gray-600 mt-1">Upload, map, and manage project BOQs</p>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/app/procurement/boq/upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload BOQ
            </Link>
            <Link
              to="/app/procurement/boq/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create BOQ
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total BOQs</dt>
                    <dd className="text-lg font-semibold text-gray-900">12</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                    <dd className="text-lg font-semibold text-gray-900">8</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Under Review</dt>
                    <dd className="text-lg font-semibold text-gray-900">3</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Exceptions</dt>
                    <dd className="text-lg font-semibold text-gray-900">142</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">BOQ List</h3>
              <div className="flex space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search BOQs..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>
          </div>
          
          {/* BOQ Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BOQ Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items / Mapped
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockBOQs.map((boq) => (
                  <tr key={boq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{boq.name}</div>
                        <div className="text-sm text-gray-500">Version {boq.version}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {boq.project}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(boq.status)}`}>
                        {boq.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span>{boq.mappedItems}/{boq.items}</span>
                        {boq.exceptions > 0 && (
                          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            {boq.exceptions} exceptions
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {boq.uploadedAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/app/procurement/boq/${boq.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        {boq.status === 'MAPPING_REVIEW' && (
                          <Link
                            to={`/app/procurement/boq/${boq.id}/mapping`}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Map
                          </Link>
                        )}
                        <Link
                          to={`/app/procurement/boq/${boq.id}/edit`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Implementation Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                BOQ Management Ready
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  BOQ structure and navigation are complete. Next phase will implement:
                  Excel upload, catalog mapping, exception handling, and approval workflows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProcurementErrorBoundary>
  );
}