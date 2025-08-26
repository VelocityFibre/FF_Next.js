/**
 * WorkflowManagementService - Core service for workflow template management
 * Temporary mock implementation until database schema is ready
 */

import type {
  WorkflowTemplate,
  WorkflowPhase,
  WorkflowStep,
  WorkflowTask,
  CreateWorkflowTemplateRequest,
  UpdateWorkflowTemplateRequest,
  CreateWorkflowPhaseRequest,
  UpdateWorkflowPhaseRequest,
  CreateWorkflowStepRequest,
  UpdateWorkflowStepRequest,
  CreateWorkflowTaskRequest,
  UpdateWorkflowTaskRequest,
  WorkflowTemplateQuery,
  BulkUpdateOrderRequest,
  WorkflowValidationResult,
  WorkflowValidationError,
  WorkflowValidationWarning
} from '../types/workflow.types';

export class WorkflowManagementService {
  /**
   * MOCK DATA - Replace with real database calls when schema is ready
   */
  private mockTemplates: WorkflowTemplate[] = [
    {
      id: '1',
      name: 'Standard Project Workflow',
      description: 'Default workflow for standard telecommunications projects',
      category: 'telecommunications' as any,
      type: 'default',
      status: 'active',
      version: '1.0',
      isDefault: true,
      isSystem: false,
      tags: ['standard', 'telecom'],
      metadata: { complexity: 'medium', industry: 'telecommunications' },
      createdBy: 'system',
      updatedBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectCount: 15
    },
    {
      id: '2',
      name: 'Emergency Response Workflow',
      description: 'Rapid deployment workflow for emergency situations',
      category: 'emergency' as any,
      type: 'custom',
      status: 'active',
      version: '2.1',
      isDefault: false,
      isSystem: false,
      tags: ['emergency', 'rapid'],
      metadata: { complexity: 'high', industry: 'emergency' },
      createdBy: 'admin',
      updatedBy: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectCount: 8
    },
    {
      id: '3',
      name: 'Maintenance Workflow',
      description: 'Standard maintenance and repair workflow',
      category: 'maintenance' as any,
      type: 'default',
      status: 'active',
      version: '1.2',
      isDefault: false,
      isSystem: true,
      tags: ['maintenance', 'repair'],
      metadata: { complexity: 'low', industry: 'telecommunications' },
      createdBy: 'system',
      updatedBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectCount: 22
    }
  ];

  /**
   * WORKFLOW TEMPLATE OPERATIONS
   */
  async getTemplates(query: WorkflowTemplateQuery = {}): Promise<{ templates: WorkflowTemplate[]; total: number }> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));

    let filtered = [...this.mockTemplates];

    // Apply filters
    if (query.category) {
      filtered = filtered.filter(t => t.category === query.category);
    }

    if (query.type) {
      filtered = filtered.filter(t => t.type === query.type);
    }

    if (query.status) {
      filtered = filtered.filter(t => t.status === query.status);
    }

    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchLower) || 
        (t.description && t.description.toLowerCase().includes(searchLower))
      );
    }

    if (query.tags && query.tags.length > 0) {
      filtered = filtered.filter(t => 
        query.tags!.some(tag => t.tags.includes(tag))
      );
    }

    if (query.isDefault !== undefined) {
      filtered = filtered.filter(t => t.isDefault === query.isDefault);
    }

    if (query.isSystem !== undefined) {
      filtered = filtered.filter(t => t.isSystem === query.isSystem);
    }

    // Apply pagination
    const limit = query.limit || 50;
    const offset = query.offset || 0;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      templates: paginated,
      total: filtered.length
    };
  }

  async getTemplateById(id: string): Promise<WorkflowTemplate | null> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return this.mockTemplates.find(t => t.id === id) || null;
  }

  async createTemplate(request: CreateWorkflowTemplateRequest, userId: string): Promise<WorkflowTemplate> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const newTemplate: WorkflowTemplate = {
      id: crypto.randomUUID(),
      name: request.name,
      description: request.description,
      category: request.category,
      type: request.type || 'custom',
      status: 'active',
      version: '1.0',
      isDefault: false,
      isSystem: false,
      tags: request.tags || [],
      metadata: request.metadata || {},
      createdBy: userId,
      updatedBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectCount: 0
    };

    this.mockTemplates.push(newTemplate);
    return newTemplate;
  }

  async updateTemplate(id: string, request: UpdateWorkflowTemplateRequest, userId: string): Promise<WorkflowTemplate> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const template = this.mockTemplates.find(t => t.id === id);
    if (!template) {
      throw new Error('Template not found');
    }

    Object.assign(template, {
      ...request,
      updatedBy: userId,
      updatedAt: new Date().toISOString()
    });

    return template;
  }

  async deleteTemplate(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const index = this.mockTemplates.findIndex(t => t.id === id);
    if (index > -1) {
      this.mockTemplates.splice(index, 1);
    }
  }

  async duplicateTemplate(id: string, newName: string, userId: string): Promise<WorkflowTemplate> {
    const original = await this.getTemplateById(id);
    if (!original) {
      throw new Error('Template not found');
    }

    return this.createTemplate({
      name: newName,
      description: original.description,
      category: original.category,
      type: 'custom',
      tags: [...original.tags],
      metadata: { ...original.metadata }
    }, userId);
  }

  /**
   * WORKFLOW PHASE OPERATIONS
   */
  async getPhases(templateId: string): Promise<WorkflowPhase[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Return mock phases
    return [
      {
        id: `${templateId}-phase-1`,
        workflowTemplateId: templateId,
        name: 'Planning',
        description: 'Initial project planning and setup',
        orderIndex: 0,
        color: '#3B82F6',
        icon: 'Planning',
        estimatedDuration: 7,
        requiredRoles: ['project-manager', 'engineer'],
        dependencies: [],
        completionCriteria: ['Project scope defined', 'Resources allocated'],
        isOptional: false,
        isParallel: false,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `${templateId}-phase-2`,
        workflowTemplateId: templateId,
        name: 'Execution',
        description: 'Project implementation and delivery',
        orderIndex: 1,
        color: '#10B981',
        icon: 'Build',
        estimatedDuration: 21,
        requiredRoles: ['engineer', 'technician'],
        dependencies: [`${templateId}-phase-1`],
        completionCriteria: ['All deliverables completed', 'Quality checks passed'],
        isOptional: false,
        isParallel: false,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async createPhase(request: CreateWorkflowPhaseRequest): Promise<WorkflowPhase> {
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      id: crypto.randomUUID(),
      workflowTemplateId: request.workflowTemplateId,
      name: request.name,
      description: request.description,
      orderIndex: request.orderIndex,
      color: request.color || '#3B82F6',
      icon: request.icon,
      estimatedDuration: request.estimatedDuration,
      requiredRoles: request.requiredRoles || [],
      dependencies: request.dependencies || [],
      completionCriteria: request.completionCriteria || [],
      isOptional: request.isOptional || false,
      isParallel: request.isParallel || false,
      metadata: request.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async updatePhase(id: string, request: UpdateWorkflowPhaseRequest): Promise<WorkflowPhase> {
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock implementation - would update in database
    const phase = await this.createPhase({
      workflowTemplateId: 'mock',
      name: 'Updated Phase',
      orderIndex: 0,
      ...request
    } as CreateWorkflowPhaseRequest);

    return { ...phase, id };
  }

  async deletePhase(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    // Mock implementation
  }

  /**
   * WORKFLOW STEP OPERATIONS
   */
  async getSteps(phaseId: string): Promise<WorkflowStep[]> {
    await new Promise(resolve => setTimeout(resolve, 50));

    return [
      {
        id: `${phaseId}-step-1`,
        workflowPhaseId: phaseId,
        name: 'Initial Setup',
        description: 'Set up project environment and tools',
        orderIndex: 0,
        stepType: 'task',
        estimatedDuration: 4,
        assigneeRole: 'engineer',
        dependencies: [],
        preconditions: ['Project approved'],
        postconditions: ['Environment ready'],
        instructions: 'Follow setup guide',
        resources: ['Setup guide', 'Tools'],
        validation: ['Environment test passed'],
        isRequired: true,
        isAutomated: false,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async createStep(request: CreateWorkflowStepRequest): Promise<WorkflowStep> {
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      id: crypto.randomUUID(),
      workflowPhaseId: request.workflowPhaseId,
      name: request.name,
      description: request.description,
      orderIndex: request.orderIndex,
      stepType: request.stepType || 'task',
      estimatedDuration: request.estimatedDuration,
      assigneeRole: request.assigneeRole,
      assigneeId: request.assigneeId,
      dependencies: request.dependencies || [],
      preconditions: request.preconditions || [],
      postconditions: request.postconditions || [],
      instructions: request.instructions,
      resources: request.resources || [],
      validation: request.validation || [],
      isRequired: request.isRequired !== false,
      isAutomated: request.isAutomated || false,
      automationConfig: request.automationConfig,
      metadata: request.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async updateStep(id: string, request: UpdateWorkflowStepRequest): Promise<WorkflowStep> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const step = await this.createStep({
      workflowPhaseId: 'mock',
      name: 'Updated Step',
      orderIndex: 0,
      ...request
    } as CreateWorkflowStepRequest);

    return { ...step, id };
  }

  async deleteStep(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * WORKFLOW TASK OPERATIONS
   */
  async getTasks(stepId: string): Promise<WorkflowTask[]> {
    await new Promise(resolve => setTimeout(resolve, 50));

    return [
      {
        id: `${stepId}-task-1`,
        workflowStepId: stepId,
        name: 'Configure Environment',
        description: 'Set up development environment',
        orderIndex: 0,
        priority: 'medium',
        estimatedHours: 2,
        skillsRequired: ['DevOps', 'Configuration'],
        tools: ['Docker', 'CLI'],
        deliverables: ['Environment config'],
        acceptanceCriteria: ['Environment passes health check'],
        isOptional: false,
        canBeParallel: false,
        tags: ['setup', 'environment'],
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async createTask(request: CreateWorkflowTaskRequest): Promise<WorkflowTask> {
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      id: crypto.randomUUID(),
      workflowStepId: request.workflowStepId,
      name: request.name,
      description: request.description,
      orderIndex: request.orderIndex,
      priority: request.priority || 'medium',
      estimatedHours: request.estimatedHours,
      skillsRequired: request.skillsRequired || [],
      tools: request.tools || [],
      deliverables: request.deliverables || [],
      acceptanceCriteria: request.acceptanceCriteria || [],
      isOptional: request.isOptional || false,
      canBeParallel: request.canBeParallel || false,
      tags: request.tags || [],
      metadata: request.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async updateTask(id: string, request: UpdateWorkflowTaskRequest): Promise<WorkflowTask> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const task = await this.createTask({
      workflowStepId: 'mock',
      name: 'Updated Task',
      orderIndex: 0,
      ...request
    } as CreateWorkflowTaskRequest);

    return { ...task, id };
  }

  async deleteTask(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * VALIDATION AND UTILITY METHODS
   */
  async validateTemplate(templateId: string): Promise<WorkflowValidationResult> {
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      isValid: true,
      errors: [],
      warnings: [
        {
          type: 'performance',
          level: 'template',
          itemId: templateId,
          message: 'Template has no estimated durations for some phases',
          suggestion: 'Add duration estimates for better project planning'
        }
      ]
    };
  }

  async bulkUpdateOrder(items: BulkUpdateOrderRequest): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    // Mock implementation
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    // Mock implementation
  }
}

// Export singleton instance
export const workflowManagementService = new WorkflowManagementService();