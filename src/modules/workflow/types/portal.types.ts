// 🟢 WORKING: Portal types for workflow management system
export type WorkflowTabId = 'templates' | 'editor' | 'projects' | 'analytics';

export interface WorkflowTabBadge {
  count?: number;
  type?: 'info' | 'warning' | 'error' | 'success';
}

export interface WorkflowTab {
  id: WorkflowTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: WorkflowTabBadge;
  disabled?: boolean;
}

export interface TemplateStats {
  totalTemplates: number;
  activeTemplates: number;
  draftTemplates: number;
  archivedTemplates: number;
  recentlyUpdated: number;
}

export interface ProjectWorkflowStats {
  totalProjectWorkflows: number;
  activeWorkflows: number;
  completedWorkflows: number;
  pausedWorkflows: number;
  overdueWorkflows: number;
  recentlyUpdated: number;
}

export interface WorkflowPortalState {
  activeTab: WorkflowTabId;
  isLoading: boolean;
  error?: string;
  templateStats: TemplateStats;
  projectWorkflowStats: ProjectWorkflowStats;
  tabBadges: Record<WorkflowTabId, WorkflowTabBadge>;
}

export interface WorkflowPortalActions {
  setActiveTab: (tab: WorkflowTabId) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  updateTabBadge: (tabId: WorkflowTabId, badge?: WorkflowTabBadge) => void;
  refreshData: () => Promise<void>;
  refreshTemplates: () => Promise<void>;
  loadTemplateStats: () => Promise<void>;
  loadProjectWorkflowStats: () => Promise<void>;
  // Project workflow management
  projectWorkflows: import('../types/workflow.types').ProjectWorkflow[];
  templates: import('../types/workflow.types').WorkflowTemplate[];
  loadProjectWorkflows: () => Promise<void>;
  loadTemplates: () => Promise<void>;
  createProjectWorkflow: (workflowData: import('../types/workflow.types').CreateProjectWorkflowRequest) => Promise<void>;
}

export interface WorkflowPortalContext extends WorkflowPortalState, WorkflowPortalActions {}

// Template list filtering and sorting
export interface TemplateFilter {
  search?: string;
  category?: string;
  status?: string;
  type?: string;
  tags?: string[];
}

export interface TemplateSorting {
  field: 'name' | 'category' | 'updatedAt' | 'createdAt' | 'projectCount';
  direction: 'asc' | 'desc';
}

export interface TemplateListState {
  templates: import('../types/workflow.types').WorkflowTemplate[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  filter: TemplateFilter;
  sorting: TemplateSorting;
  selectedTemplates: string[];
  isLoading: boolean;
  error?: string;
}

export interface TemplateListActions {
  loadTemplates: (page?: number) => Promise<void>;
  setFilter: (filter: Partial<TemplateFilter>) => void;
  setSorting: (sorting: TemplateSorting) => void;
  setSelectedTemplates: (templateIds: string[]) => void;
  toggleTemplateSelection: (templateId: string) => void;
  selectAllTemplates: () => void;
  clearSelection: () => void;
  deleteSelectedTemplates: () => Promise<void>;
  duplicateTemplate: (templateId: string, newName: string) => Promise<void>;
  exportTemplate: (templateId: string) => Promise<void>;
}

// Editor state types
export interface EditorState {
  templateId?: string;
  isEditing: boolean;
  isDirty: boolean;
  validationErrors: string[];
  isReadonly: boolean;
}

export interface EditorActions {
  openEditor: (templateId?: string) => void;
  closeEditor: () => void;
  saveTemplate: () => Promise<void>;
  setReadonly: (readonly: boolean) => void;
  validateTemplate: () => void;
}