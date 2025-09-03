import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter } from 'lucide-react';
import { clientService } from '@/services/clientService';
import { ClientImport } from '@/components/clients/ClientImport';
import { ClientFilter } from '@/types/client.types';
import { ClientListHeader } from './ClientListHeader';
import { ClientSummaryCards } from './ClientSummaryCards';
import { ClientTable } from './ClientTable';

export function ClientList() {
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
      const blob = await clientService.export.exportToExcel(clients);
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
      <ClientListHeader 
        onImport={() => setShowImport(true)}
        onExport={handleExport}
        clientCount={clients?.length || 0}
      />

      {summary && <ClientSummaryCards summary={summary} />}

      {/* Search and Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      <ClientTable 
        clients={clients}
        isLoading={isLoading}
        error={error}
        onDelete={handleDelete}
      />
    </div>
  );
}