/**
 * ContractorList Component - Main contractors listing with filtering and search
 * Following FibreFlow patterns with comprehensive filtering and real-time updates
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Building2, Users, AlertCircle } from 'lucide-react';
import { contractorService } from '@/services/contractorService';
import { Contractor, ContractorFilter, ContractorAnalytics } from '@/types/contractor.types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export function ContractorList() {
  const navigate = useNavigate();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [analytics, setAnalytics] = useState<ContractorAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filter, setFilter] = useState<ContractorFilter>({
    searchTerm: '',
    status: [],
    ragOverall: [],
    businessType: [],
    province: [],
    hasActiveProjects: undefined,
    documentsExpiring: undefined
  });

  useEffect(() => {
    loadContractors();
    loadAnalytics();
  }, [filter]);

  const loadContractors = async () => {
    try {
      setIsLoading(true);
      const data = await contractorService.getAll(filter);
      setContractors(data);
    } catch (error) {
      console.error('Failed to load contractors:', error);
      toast.error('Failed to load contractors');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await contractorService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const handleFilterChange = (key: keyof ContractorFilter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const handleSearchChange = (value: string) => {
    setFilter(prev => ({ ...prev, searchTerm: value }));
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      blacklisted: 'bg-red-100 text-red-800',
      under_review: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRagColor = (rag: string) => {
    const colors = {
      green: 'bg-green-100 text-green-800',
      amber: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800'
    };
    return colors[rag as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contractors</h1>
          <p className="text-gray-600">Manage contractor relationships and performance</p>
        </div>
        <button
          onClick={() => navigate('/app/contractors/new')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Contractor
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Contractors</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalContractors}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.approvedContractors}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.pendingApproval}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-600">RAG</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Green Rating</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.ragDistribution.green}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search contractors..."
              value={filter.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium border rounded-lg ${
              showFilters 
                ? 'bg-blue-50 text-blue-700 border-blue-300' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  multiple
                  value={filter.status}
                  onChange={(e) => handleFilterChange('status', Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="suspended">Suspended</option>
                  <option value="blacklisted">Blacklisted</option>
                  <option value="under_review">Under Review</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RAG Rating</label>
                <select
                  multiple
                  value={filter.ragOverall}
                  onChange={(e) => handleFilterChange('ragOverall', Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="green">Green</option>
                  <option value="amber">Amber</option>
                  <option value="red">Red</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                <select
                  multiple
                  value={filter.businessType}
                  onChange={(e) => handleFilterChange('businessType', Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pty_ltd">Pty Ltd</option>
                  <option value="cc">Close Corporation</option>
                  <option value="sole_proprietor">Sole Proprietor</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filter.hasActiveProjects === true}
                  onChange={(e) => handleFilterChange('hasActiveProjects', e.target.checked ? true : undefined)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Has Active Projects</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filter.documentsExpiring === true}
                  onChange={(e) => handleFilterChange('documentsExpiring', e.target.checked ? true : undefined)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Documents Expiring</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Contractors Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" label="Loading contractors..." />
          </div>
        ) : contractors.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contractors found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first contractor.</p>
            <button
              onClick={() => navigate('/app/contractors/new')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contractor
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RAG
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contractors.map((contractor) => (
                  <tr 
                    key={contractor.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/app/contractors/${contractor.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{contractor.companyName}</div>
                          <div className="text-sm text-gray-500">{contractor.registrationNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contractor.contactPerson}</div>
                      <div className="text-sm text-gray-500">{contractor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contractor.status)}`}>
                        {contractor.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRagColor(contractor.ragOverall)}`}>
                        {contractor.ragOverall.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-4">
                        <span className="text-blue-600 font-medium">{contractor.activeProjects}</span>
                        <span className="text-gray-400">/</span>
                        <span>{contractor.totalProjects}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/contractors/${contractor.id}/edit`);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/contractors/${contractor.id}`);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}