// 🟢 WORKING: Main Procurement Portal with comprehensive tabbed navigation
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Project } from '@/types/project.types';
import { ProjectType, ProjectStatus, Priority } from '@/types/project.types';
import { AlertCircle } from 'lucide-react';
import { ProcurementTabs } from './components/ProcurementTabs';
import { ProjectFilter } from './components/ProjectFilter';
import { ProcurementPortalProvider } from './context/ProcurementPortalProvider';
import { useProcurementPermissions } from './hooks/useProcurementPermissions';
import { log } from '@/lib/logger';
import type { 
  ProcurementTabId, 
  ProcurementViewMode,
  AggregateProjectMetrics,
  ProjectSummary,
  ProcurementPortalContext
} from '@/types/procurement/portal.types';

interface ProcurementPortalPageProps {
  children?: React.ReactNode;
}

export function ProcurementPortalPage({ children }: ProcurementPortalPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(() => {
    const projectId = searchParams.get('project');
    const projectName = searchParams.get('projectName');
    const projectCode = searchParams.get('projectCode');
    
    if (projectId && projectName && projectCode) {
      return {
        id: projectId,
        name: projectName,
        code: projectCode,
        projectType: ProjectType.FIBRE,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        status: ProjectStatus.ACTIVE,
        priority: Priority.MEDIUM,
        plannedProgress: 0,
        actualProgress: 0,
        createdBy: 'system',
        createdAt: new Date().toISOString()
      };
    }
    return undefined;
  });

  const [viewMode, setViewMode] = useState<ProcurementViewMode>(() => {
    const urlViewMode = searchParams.get('viewMode') as ProcurementViewMode;
    const hasProject = searchParams.get('project');
    
    if (urlViewMode) return urlViewMode;
    return hasProject ? 'single' : 'all';
  });

  const [activeTab, setActiveTab] = useState<ProcurementTabId>(() => {
    const urlTab = searchParams.get('tab') as ProcurementTabId;
    return urlTab || 'overview';
  });

  const [aggregateMetrics, setAggregateMetrics] = useState<AggregateProjectMetrics | undefined>();
  const [projectSummaries, setProjectSummaries] = useState<ProjectSummary[] | undefined>();
  const [tabBadges, setTabBadges] = useState<Record<ProcurementTabId, { count?: number; type?: 'info' | 'warning' | 'error' | 'success' }>>({
    overview: {},
    boq: {},
    rfq: {},
    quotes: {},
    'purchase-orders': {},
    stock: {},
    suppliers: {},
    reports: {}
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Get permissions for selected project
  const permissions = useProcurementPermissions(selectedProject?.id);

  /**
   * Load aggregate metrics for "All Projects" view
   */
  const loadAggregateMetrics = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockAggregateMetrics: AggregateProjectMetrics = {
        totalProjects: 12,
        totalBOQValue: 2450000,
        totalActiveRFQs: 18,
        totalPurchaseOrders: 42,
        totalStockItems: 1250,
        totalSuppliers: 28,
        averageCostSavings: 12.5,
        averageCycleDays: 14.5,
        averageSupplierOTIF: 92,
        criticalAlerts: 8,
        pendingApprovals: 15
      };

      const mockProjectSummaries: ProjectSummary[] = [
        {
          id: '1',
          name: 'Johannesburg Fiber Rollout',
          code: 'JHB-2024-001',
          status: 'active',
          boqValue: 850000,
          activeRFQs: 5,
          completionPercentage: 68,
          lastActivity: '2 hours ago',
          alertCount: 2
        },
        {
          id: '2',
          name: 'Cape Town Metro Network',
          code: 'CPT-2024-002',
          status: 'active',
          boqValue: 720000,
          activeRFQs: 3,
          completionPercentage: 45,
          lastActivity: '4 hours ago',
          alertCount: 1
        },
        {
          id: '3',
          name: 'Durban Coastal Installation',
          code: 'DBN-2024-003',
          status: 'active',
          boqValue: 450000,
          activeRFQs: 2,
          completionPercentage: 78,
          lastActivity: '1 day ago',
          alertCount: 0
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setAggregateMetrics(mockAggregateMetrics);
      setProjectSummaries(mockProjectSummaries);
    } catch (error) {
      log.error('Error loading aggregate metrics:', { data: error }, 'ProcurementPortalPage');
      setError('Failed to load aggregate data');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load project-specific data and update tab badges
   */
  const loadProjectData = async (_projectId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API calls
      // Simulate loading project-specific data
      await new Promise(resolve => setTimeout(resolve, 600));

      // Update tab badges with project-specific counts
      setTabBadges({
        overview: {},
        boq: { count: 3, type: 'info' },
        rfq: { count: 2, type: 'warning' },
        quotes: { count: 1, type: 'success' },
        'purchase-orders': { count: 4, type: 'info' },
        stock: { count: 5, type: 'error' },
        suppliers: { count: 12, type: 'info' },
        reports: {}
      });
    } catch (error) {
      log.error('Error loading project data:', { data: error }, 'ProcurementPortalPage');
      setError('Failed to load project data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle project selection
  const handleProjectChange = (project: Project | undefined) => {
    setSelectedProject(project);
    
    // Update URL parameters
    if (project) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('project', project.id);
        newParams.set('projectName', project.name);
        newParams.set('projectCode', project.code);
        newParams.set('viewMode', 'single');
        return newParams;
      });
    } else {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('project');
        newParams.delete('projectName');
        newParams.delete('projectCode');
        return newParams;
      });
    }
  };

  // Handle view mode changes
  const handleViewModeChange = (mode: ProcurementViewMode) => {
    setViewMode(mode);
    
    // Update URL parameters
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (mode === 'all') {
        newParams.set('viewMode', 'all');
        // Clear project params when switching to all projects
        newParams.delete('project');
        newParams.delete('projectName');
        newParams.delete('projectCode');
        setSelectedProject(undefined);
      } else {
        newParams.set('viewMode', 'single');
      }
      return newParams;
    });
  };

  // Handle tab changes
  const handleTabChange = (tabId: ProcurementTabId) => {
    setActiveTab(tabId);
    
    // Update URL with tab parameter
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('tab', tabId);
      return newParams;
    });
  };

  // Update tab badge
  const updateTabBadge = (tabId: ProcurementTabId, badge?: { count?: number; type?: 'error' | 'success' | 'warning' | 'info' }) => {
    setTabBadges(prev => ({
      ...prev,
      [tabId]: badge || {}
    }));
  };

  // Refresh data based on current context
  const refreshData = async () => {
    if (viewMode === 'all') {
      await loadAggregateMetrics();
    } else if (selectedProject) {
      await loadProjectData(selectedProject.id);
    }
  };

  // Create portal context
  const portalContext: ProcurementPortalContext = {
    selectedProject,
    viewMode,
    aggregateMetrics,
    projectSummaries,
    activeTab,
    availableTabs: [], // Will be populated by ProcurementTabs
    tabBadges,
    permissions,
    isLoading,
    error,
    setProject: handleProjectChange,
    setViewMode: handleViewModeChange,
    setActiveTab: handleTabChange,
    setLoading: setIsLoading,
    setError,
    updateTabBadge,
    refreshData
  };

  // Load data based on view mode and project selection
  useEffect(() => {
    if (viewMode === 'all') {
      loadAggregateMetrics();
    } else if (selectedProject) {
      loadProjectData(selectedProject.id);
    } else {
      // Clear badges when no project selected
      setTabBadges({
        overview: {},
        boq: {},
        rfq: {},
        quotes: {},
        'purchase-orders': {},
        stock: {},
        suppliers: {},
        reports: {}
      });
    }
  }, [viewMode, selectedProject?.id]);

  // Persist active tab to session storage
  useEffect(() => {
    sessionStorage.setItem('procurementActiveTab', activeTab);
  }, [activeTab]);

  // Restore active tab from session storage on mount
  useEffect(() => {
    const savedTab = sessionStorage.getItem('procurementActiveTab') as ProcurementTabId;
    if (savedTab && !searchParams.get('tab')) {
      setActiveTab(savedTab);
    }
  }, []);

  return (
    <ProcurementPortalProvider value={portalContext}>
      <div className="flex flex-col h-full bg-gray-50">
        {/* Portal Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Procurement Portal</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {viewMode === 'all' 
                    ? 'Integrated view across all projects' 
                    : selectedProject 
                    ? `Managing ${selectedProject.name} (${selectedProject.code})`
                    : 'Select a project or view all projects'
                  }
                </p>
              </div>
              
              {/* Project Filter */}
              <div className="flex items-center gap-4">
                <ProjectFilter
                  selectedProject={selectedProject ? { 
                    id: selectedProject.id, 
                    name: selectedProject.name, 
                    code: selectedProject.code, 
                    status: selectedProject.status 
                  } : undefined}
                  viewMode={viewMode}
                  onProjectChange={(project) => {
                    if (project) {
                      // Convert ProjectFilterProject back to Project
                      const fullProject: Project = {
                        ...project,
                        projectType: ProjectType.FIBRE,
                        startDate: new Date(),
                        endDate: new Date(),
                        priority: Priority.MEDIUM,
                        clientId: '',
                        plannedProgress: 0,
                        actualProgress: 0,
                        createdBy: 'system',
                        createdAt: new Date()
                      };
                      handleProjectChange(fullProject);
                    } else {
                      handleProjectChange(undefined);
                    }
                  }}
                  onViewModeChange={handleViewModeChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
                <button
                  onClick={() => setError(undefined)}
                  className="ml-auto text-red-600 hover:text-red-800 p-1"
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            )}

            {/* Tab Navigation */}
            <ProcurementTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              selectedProject={selectedProject}
              tabBadges={tabBadges}
              permissions={permissions}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {isLoading && !children ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
                <p className="text-gray-500">Loading procurement data...</p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              {children}
            </div>
          )}
        </div>
      </div>
    </ProcurementPortalProvider>
  );
}