import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useNeonProjects } from '@/hooks/neon/useNeonProjects';
import { ProjectListHeader } from './ProjectListHeader';
import { ProjectSummaryCards } from './ProjectSummaryCards';
import { ProjectTable } from './ProjectTable';

export function ProjectList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string[]>([]);
  
  const { projects, loading: isLoading, error } = useNeonProjects();
  
  // Filter projects based on search and filters
  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch = !searchTerm || 
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus.length === 0 || 
      selectedStatus.includes(project.status);
    
    const matchesPriority = selectedPriority.length === 0 || 
      selectedPriority.includes(project.priority);
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleDelete = async (_id: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    try {
      // TODO: Implement delete functionality

    } catch (error: any) {
      alert(error.message || 'Failed to delete project');
    }
  };

  const handleExport = async () => {
    // TODO: Implement export functionality
    alert('Export functionality coming soon');
  };

  const statuses = ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  return (
    <div className="space-y-6">
      <ProjectListHeader 
        onExport={handleExport}
        projectCount={filteredProjects.length}
      />

      <ProjectSummaryCards projects={projects} />

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters || selectedStatus.length > 0 || selectedPriority.length > 0
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {(selectedStatus.length > 0 || selectedPriority.length > 0) && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                {selectedStatus.length + selectedPriority.length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                <div className="space-y-2">
                  {statuses.map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedStatus.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStatus([...selectedStatus, status]);
                          } else {
                            setSelectedStatus(selectedStatus.filter(s => s !== status));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {status.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Priority</h4>
                <div className="space-y-2">
                  {priorities.map((priority) => (
                    <label key={priority} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPriority.includes(priority)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPriority([...selectedPriority, priority]);
                          } else {
                            setSelectedPriority(selectedPriority.filter(p => p !== priority));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {priority.toLowerCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            {(selectedStatus.length > 0 || selectedPriority.length > 0) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedStatus([]);
                    setSelectedPriority([]);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <ProjectTable 
        projects={filteredProjects}
        isLoading={isLoading}
        error={error ? new Error(error) : null}
        onDelete={handleDelete}
      />
    </div>
  );
}