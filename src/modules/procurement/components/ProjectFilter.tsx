// 🟢 WORKING: Enhanced project filter with search and view mode switching
import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Search, 
  Building2, 
  X, 
  Globe, 
  Filter,
  Check
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import type { ProcurementViewMode } from '@/types/procurement/portal.types';

interface Project {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  lastActivity?: string;
}

interface ProjectFilterProps {
  selectedProject?: Project | undefined;
  viewMode: ProcurementViewMode;
  onProjectChange: (project: Project | undefined) => void;
  onViewModeChange: (mode: ProcurementViewMode) => void;
  disabled?: boolean;
}

export function ProjectFilter({
  selectedProject,
  viewMode,
  onProjectChange,
  onViewModeChange,
  disabled = false
}: ProjectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Project['status'] | 'all'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock projects - would be replaced with real data from API
  const allProjects: Project[] = [
    { 
      id: '1', 
      name: 'Johannesburg Fiber Rollout', 
      code: 'JHB-2024-001', 
      status: 'active',
      lastActivity: '2 hours ago'
    },
    { 
      id: '2', 
      name: 'Cape Town Metro Network', 
      code: 'CPT-2024-002', 
      status: 'active',
      lastActivity: '4 hours ago'
    },
    { 
      id: '3', 
      name: 'Durban Coastal Installation', 
      code: 'DBN-2024-003', 
      status: 'active',
      lastActivity: '1 day ago'
    },
    { 
      id: '4', 
      name: 'Pretoria Business District', 
      code: 'PTA-2024-004', 
      status: 'on-hold',
      lastActivity: '3 days ago'
    },
    { 
      id: '5', 
      name: 'Port Elizabeth Expansion', 
      code: 'PE-2024-005', 
      status: 'completed',
      lastActivity: '1 week ago'
    },
    { 
      id: '6', 
      name: 'Bloemfontein Network', 
      code: 'BFN-2024-006', 
      status: 'active',
      lastActivity: '6 hours ago'
    }
  ];

  // Filter projects based on search and status
  const filteredProjects = allProjects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle individual project selection
  const handleProjectSelect = (project: Project) => {
    onProjectChange(project);
    onViewModeChange('single');
    setIsOpen(false);
    setSearchTerm('');
    setStatusFilter('all');
  };

  // Handle "All Projects" selection
  const handleAllProjectsSelect = () => {
    onProjectChange(undefined);
    onViewModeChange('all');
    setIsOpen(false);
    setSearchTerm('');
    setStatusFilter('all');
  };

  // Handle clearing current selection
  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onProjectChange(undefined);
    onViewModeChange('single');
  };

  // Get status badge styles
  const getStatusBadgeStyles = (status: Project['status']) => {
    const baseStyles = 'px-2 py-0.5 text-xs font-medium rounded-full';
    
    switch (status) {
      case 'active':
        return `${baseStyles} bg-green-100 text-green-700`;
      case 'completed':
        return `${baseStyles} bg-blue-100 text-blue-700`;
      case 'on-hold':
        return `${baseStyles} bg-yellow-100 text-yellow-700`;
      case 'cancelled':
        return `${baseStyles} bg-red-100 text-red-700`;
      default:
        return `${baseStyles} bg-gray-100 text-gray-700`;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Filter Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="min-w-[300px] justify-between"
      >
        <div className="flex items-center gap-2 flex-1 text-left">
          {viewMode === 'all' ? (
            <>
              <Globe className="h-4 w-4 text-blue-600" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-blue-900 truncate">
                  All Projects
                </div>
                <div className="text-xs text-blue-600">
                  Aggregate view • {allProjects.filter(p => p.status === 'active').length} active
                </div>
              </div>
            </>
          ) : selectedProject ? (
            <>
              <Building2 className="h-4 w-4 text-gray-500" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {selectedProject.name}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <span>{selectedProject.code}</span>
                  <span className={getStatusBadgeStyles(selectedProject.status)}>
                    {selectedProject.status}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-gray-500">Select project or view all</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {(selectedProject || viewMode === 'all') && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="p-1 hover:bg-gray-100 rounded"
              disabled={disabled}
              title="Clear selection"
            >
              <X className="h-3 w-3 text-gray-400" />
            </button>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Search and Filters */}
          <div className="p-3 border-b border-gray-100 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoFocus
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs text-gray-500 py-1">Status:</span>
              {['all', 'active', 'completed', 'on-hold', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as Project['status'] | 'all')}
                  className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                    statusFilter === status
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('-', ' ')}
                  {statusFilter === status && <Check className="inline h-3 w-3 ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Project List */}
          <div className="max-h-64 overflow-y-auto">
            {/* All Projects Option */}
            {!searchTerm && statusFilter === 'all' && (
              <div className="py-1 border-b border-gray-100">
                <button
                  onClick={handleAllProjectsSelect}
                  className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                    viewMode === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium">All Projects</div>
                      <div className="text-sm text-gray-500">
                        Aggregate view across {allProjects.length} projects
                      </div>
                    </div>
                    {viewMode === 'all' && <Check className="h-4 w-4 text-blue-600" />}
                  </div>
                </button>
              </div>
            )}
            
            {/* Individual Projects */}
            {filteredProjects.length > 0 ? (
              <div className="py-1">
                {filteredProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      selectedProject?.id === project.id && viewMode === 'single' 
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{project.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <span>{project.code}</span>
                          <span className={getStatusBadgeStyles(project.status)}>
                            {project.status}
                          </span>
                          {project.lastActivity && (
                            <span className="text-xs">• {project.lastActivity}</span>
                          )}
                        </div>
                      </div>
                      {selectedProject?.id === project.id && viewMode === 'single' && (
                        <Check className="h-4 w-4 text-primary-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : searchTerm || statusFilter !== 'all' ? (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                <Filter className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No projects found</p>
                <p className="text-xs">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                <Building2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No projects available</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>
                {searchTerm || statusFilter !== 'all'
                  ? `${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''} found`
                  : `${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''} available`
                }
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-primary-600 hover:text-primary-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export for use in other components
export type { ProjectFilterProps };