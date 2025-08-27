// 🟢 WORKING: Template list component for workflow template management
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Copy, 
  Trash2, 
  Download, 
  Upload,
  MoreVertical,
  FileText,
  Calendar,
  Tag,
  Users,
  AlertCircle
} from 'lucide-react';
import { workflowManagementService } from '../../services/WorkflowManagementService';
import { workflowTemplateService } from '../../services/WorkflowTemplateService';
import { log } from '@/lib/logger';
import type { 
  WorkflowTemplate,
  WorkflowTemplateQuery,
  WorkflowCategory,
  WorkflowStatus,
  WorkflowType 
} from '../../types/workflow.types';
import type { 
  TemplateFilter, 
  TemplateSorting, 
  TemplateListState 
} from '../../types/portal.types';

interface TemplateListProps {
  onTemplateSelect?: (template: WorkflowTemplate) => void;
  onTemplateEdit?: (templateId: string) => void;
  selectedTemplateId?: string;
}

// Template card component
interface TemplateCardProps {
  template: WorkflowTemplate;
  isSelected?: boolean;
  onSelect?: (template: WorkflowTemplate) => void;
  onEdit?: (templateId: string) => void;
  onDuplicate?: (templateId: string) => void;
  onDelete?: (templateId: string) => void;
  onExport?: (templateId: string) => void;
}

function TemplateCard({
  template,
  isSelected = false,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onExport
}: TemplateCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: WorkflowCategory) => {
    switch (category) {
      case 'project': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'maintenance': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'emergency': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'telecommunications': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
        isSelected 
          ? 'border-blue-500 shadow-md' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
      }`}
      onClick={() => onSelect?.(template)}
    >
      {/* Template Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {template.name}
              </h3>
              {template.isDefault && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300">
                  Default
                </span>
              )}
            </div>
            
            {template.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {template.description}
              </p>
            )}

            <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>v{template.version}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{template.projectCount || 0} projects</span>
              </span>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Template actions"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 w-32">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(template.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate?.(template.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExport?.(template.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export</span>
                  </button>
                  {!template.isSystem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(template.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Template Footer */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
              {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
              {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
            </span>
          </div>
          
          {template.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <Tag className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {template.tags.length} tag{template.tags.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main TemplateList component
export function TemplateList({ 
  onTemplateSelect, 
  onTemplateEdit,
  selectedTemplateId 
}: TemplateListProps) {
  const [state, setState] = useState<TemplateListState>({
    templates: [],
    totalCount: 0,
    currentPage: 1,
    pageSize: 12,
    filter: {},
    sorting: { field: 'updatedAt', direction: 'desc' },
    selectedTemplates: [],
    isLoading: false,
    error: undefined
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Load templates
  const loadTemplates = useCallback(async (page = 1) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const query: WorkflowTemplateQuery = {
        ...state.filter,
        search: searchTerm || undefined,
        limit: state.pageSize,
        offset: (page - 1) * state.pageSize,
        orderBy: state.sorting.field,
        orderDirection: state.sorting.direction
      };

      const result = await workflowManagementService.getTemplates(query);

      setState(prev => ({
        ...prev,
        templates: result.templates,
        totalCount: result.total || result.templates.length,
        currentPage: page,
        isLoading: false
      }));
    } catch (error) {
      log.error('Error loading templates:', { data: error }, 'TemplateList');
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load templates',
        isLoading: false
      }));
    }
  }, [state.filter, state.pageSize, state.sorting, searchTerm]);

  // Handle template actions
  const handleDuplicate = useCallback(async (templateId: string) => {
    try {
      const template = state.templates.find(t => t.id === templateId);
      if (!template) return;

      const newName = `${template.name} (Copy)`;
      await workflowManagementService.duplicateTemplate(templateId, newName, 'current-user');
      await loadTemplates(state.currentPage);
    } catch (error) {
      log.error('Error duplicating template:', { data: error }, 'TemplateList');
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to duplicate template'
      }));
    }
  }, [state.templates, state.currentPage, loadTemplates]);

  const handleDelete = useCallback(async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      await workflowManagementService.deleteTemplate(templateId);
      await loadTemplates(state.currentPage);
    } catch (error) {
      log.error('Error deleting template:', { data: error }, 'TemplateList');
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete template'
      }));
    }
  }, [state.currentPage, loadTemplates]);

  const handleExport = useCallback(async (templateId: string) => {
    try {
      const exportData = await workflowTemplateService.exportTemplate(templateId, 'current-user');
      
      // Create download link
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `workflow-template-${exportData.template.name.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      log.error('Error exporting template:', { data: error }, 'TemplateList');
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to export template'
      }));
    }
  }, []);

  // Load templates on mount and when dependencies change
  useEffect(() => {
    loadTemplates(1);
  }, [state.filter, state.sorting, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear error after 5 seconds
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, error: undefined }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Workflow Templates
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your workflow templates and create new ones
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
            showFilters
              ? 'border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300'
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </button>
      </div>

      {/* Error Alert */}
      {state.error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-300">{state.error}</span>
        </div>
      )}

      {/* Templates Grid */}
      {state.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading templates...</span>
        </div>
      ) : state.templates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No templates found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || Object.keys(state.filter).length > 0
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first workflow template'}
          </p>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplateId === template.id}
              onSelect={onTemplateSelect}
              onEdit={onTemplateEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onExport={handleExport}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {state.templates.length > 0 && state.totalCount > state.pageSize && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((state.currentPage - 1) * state.pageSize) + 1} to{' '}
            {Math.min(state.currentPage * state.pageSize, state.totalCount)} of{' '}
            {state.totalCount} templates
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => loadTemplates(state.currentPage - 1)}
              disabled={state.currentPage <= 1 || state.isLoading}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
            
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              Page {state.currentPage} of {Math.ceil(state.totalCount / state.pageSize)}
            </span>
            
            <button
              onClick={() => loadTemplates(state.currentPage + 1)}
              disabled={state.currentPage >= Math.ceil(state.totalCount / state.pageSize) || state.isLoading}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}