import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Globe,
  DollarSign
} from 'lucide-react';
import { clientService } from '@/services/clientService';
import { ClientImport } from '@/components/clients/ClientImport';
import { ClientFilter, ClientStatus, ClientCategory, ClientPriority } from '@/types/client.types';

export function ClientList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [filter, setFilter] = useState<ClientFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  const { data: clients, isLoading, error, refetch } = useQuery({
    queryKey: ['clients', filter],
    queryFn: () => clientService.getAll(filter)
  });

  const { data: summary } = useQuery({
    queryKey: ['client-summary'],
    queryFn: () => clientService.getClientSummary()
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter(prev => ({ ...prev, searchTerm }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }
    
    try {
      await clientService.delete(id);
      refetch();
    } catch (error: any) {
      alert(error.message || 'Failed to delete client');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await clientService.exportToExcel(clients);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export client data');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case ClientStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case ClientStatus.PROSPECT:
        return 'bg-blue-100 text-blue-800';
      case ClientStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800';
      case ClientStatus.SUSPENDED:
        return 'bg-red-100 text-red-800';
      case ClientStatus.FORMER:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: ClientPriority) => {
    switch (priority) {
      case ClientPriority.VIP:
        return 'bg-purple-100 text-purple-800';
      case ClientPriority.CRITICAL:
        return 'bg-red-100 text-red-800';
      case ClientPriority.HIGH:
        return 'bg-orange-100 text-orange-800';
      case ClientPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case ClientPriority.LOW:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: ClientCategory) => {
    switch (category) {
      case ClientCategory.ENTERPRISE:
        return '🏢';
      case ClientCategory.SME:
        return '🏪';
      case ClientCategory.RESIDENTIAL:
        return '🏠';
      case ClientCategory.GOVERNMENT:
        return '🏛️';
      case ClientCategory.NON_PROFIT:
        return '❤️';
      case ClientCategory.EDUCATION:
        return '🎓';
      case ClientCategory.HEALTHCARE:
        return '🏥';
      default:
        return '📋';
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
            ← Back to Client List
          </button>
        </div>
        <ClientImport />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-1">Manage your client relationships and information</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImport(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </button>
          <button
            onClick={handleExport}
            disabled={!clients || clients.length === 0}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => navigate('/app/clients/new')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Clients</p>
                <p className="text-2xl font-semibold text-gray-900">{summary.totalClients}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-semibold text-green-600">{summary.activeClients}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Prospects</p>
                <p className="text-2xl font-semibold text-blue-600">{summary.prospectClients}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(summary.totalProjectValue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Value</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(summary.averageProjectValue)}
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-purple-600" />
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
                  placeholder="Search by company name, contact person, email, or industry..."
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filter.status?.[0] || ''}
                  onChange={(e) => {
                    const newFilter = { ...filter };
                    if (e.target.value) {
                      newFilter.status = [e.target.value as ClientStatus];
                    } else {
                      delete newFilter.status;
                    }
                    setFilter(newFilter);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Statuses</option>
                  {Object.values(ClientStatus).map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filter.category?.[0] || ''}
                  onChange={(e) => {
                    const newFilter = { ...filter };
                    if (e.target.value) {
                      newFilter.category = [e.target.value as ClientCategory];
                    } else {
                      delete newFilter.category;
                    }
                    setFilter(newFilter);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Categories</option>
                  {Object.values(ClientCategory).map(category => (
                    <option key={category} value={category}>
                      {category.replace('_', ' ').charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filter.priority?.[0] || ''}
                  onChange={(e) => {
                    const newFilter = { ...filter };
                    if (e.target.value) {
                      newFilter.priority = [e.target.value as ClientPriority];
                    } else {
                      delete newFilter.priority;
                    }
                    setFilter(newFilter);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Priorities</option>
                  {Object.values(ClientPriority).map(priority => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Client Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
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
                    Error loading clients: {(error as Error).message}
                  </td>
                </tr>
              )}
              
              {clients && clients.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No clients found
                  </td>
                </tr>
              )}
              
              {clients?.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                        {getCategoryIcon(client.category)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{client.name}</p>
                        <p className="text-xs text-gray-500">{client.industry}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-gray-900">{client.contactPerson}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <a href={`mailto:${client.email}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <a href={`tel:${client.phone}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900">
                      {client.category.replace('_', ' ').charAt(0).toUpperCase() + client.category.slice(1)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(client.priority)}`}>
                      {client.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <p className="text-gray-900">
                        {client.activeProjects} active
                      </p>
                      <p className="text-xs text-gray-500">
                        {client.totalProjects} total
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <p className="text-gray-900 font-medium">
                        {formatCurrency(client.totalProjectValue)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {client.paymentTerms.replace('_', ' ')}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/app/clients/${client.id}`)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/app/clients/${client.id}/edit`)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {client.website && (
                        <a
                          href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Visit Website"
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(client.id!)}
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