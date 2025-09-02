import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { ProjectQueryService } from '@/services/projects/core/projectQueryService';
import type { Project } from '@/types/project.types';
import { log } from '@/lib/logger';

interface SOWProjectSelectorProps {
  onProjectSelect: (project: Project) => void;
  className?: string;
}

export function SOWProjectSelector({ onProjectSelect, className = '' }: SOWProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  // Load projects from database
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const projects = await ProjectQueryService.getActiveProjects();
        setAllProjects(projects);
      } catch (error) {
        log.error('Error loading projects:', { data: error }, 'SOWProjectSelector');
        setAllProjects([]);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  // Filter projects based on search
  const filteredProjects = allProjects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    onProjectSelect(project);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="min-w-[320px] justify-between"
      >
        <div className="flex items-center gap-2 flex-1 text-left">
          {selectedProject ? (
            <>
              <Building2 className="h-4 w-4 text-gray-500" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {selectedProject.name}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedProject.code}
                </div>
              </div>
            </>
          ) : (
            <>
              <Building2 className="h-4 w-4 text-gray-500" />
              <span className="text-gray-500">Select a project</span>
            </>
          )}
        </div>
        
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-100">
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
          </div>

          <div className="max-h-64 overflow-y-auto">
            {isLoadingProjects ? (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading projects...
                </div>
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="py-1">
                {filteredProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      selectedProject?.id === project.id
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-gray-500">{project.code || 'No code'}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                No projects found matching "{searchTerm}"
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                No active projects available
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>
                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} available
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