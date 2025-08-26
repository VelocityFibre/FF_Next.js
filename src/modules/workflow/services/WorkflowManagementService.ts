/**
 * WorkflowManagementService - Core service for workflow template management
 * Handles CRUD operations for workflow templates, phases, steps, and tasks
 */

import { neonDb } from '@/lib/neon/connection';
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
  private client = neonDb;

  /**
   * WORKFLOW TEMPLATE OPERATIONS
   */

  async getTemplates(query: WorkflowTemplateQuery = {}): Promise<{
    templates: WorkflowTemplate[];
    total: number;
  }> {
    const {
      category,
      type,
      status,
      search,
      tags,
      isDefault,
      isSystem,
      limit = 50,
      offset = 0,
      orderBy = 'createdAt',
      orderDirection = 'desc'
    } = query;

    let sql = `
      SELECT 
        wt.*,
        COUNT(pw.id) as project_count
      FROM workflow_templates wt
      LEFT JOIN project_workflows pw ON wt.id = pw.workflow_template_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      sql += ` AND wt.category = $${paramIndex++}`;
      params.push(category);
    }

    if (type) {
      sql += ` AND wt.type = $${paramIndex++}`;
      params.push(type);
    }

    if (status) {
      sql += ` AND wt.status = $${paramIndex++}`;
      params.push(status);
    }

    if (search) {
      sql += ` AND (wt.name ILIKE $${paramIndex++} OR wt.description ILIKE $${paramIndex++})`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (tags && tags.length > 0) {
      sql += ` AND wt.tags ?| $${paramIndex++}`;
      params.push(tags);
    }

    if (isDefault !== undefined) {
      sql += ` AND wt.is_default = $${paramIndex++}`;
      params.push(isDefault);
    }

    if (isSystem !== undefined) {
      sql += ` AND wt.is_system = $${paramIndex++}`;
      params.push(isSystem);
    }

    sql += ` GROUP BY wt.id`;
    sql += ` ORDER BY wt.${orderBy} ${orderDirection.toUpperCase()}`;
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await this.client.query(sql, params);

    // Get total count
    let countSql = `
      SELECT COUNT(DISTINCT wt.id) as total
      FROM workflow_templates wt
      WHERE 1=1
    `;

    const countParams: any[] = [];
    let countParamIndex = 1;

    if (category) {
      countSql += ` AND wt.category = $${countParamIndex++}`;
      countParams.push(category);
    }

    if (type) {
      countSql += ` AND wt.type = $${countParamIndex++}`;
      countParams.push(type);
    }

    if (status) {
      countSql += ` AND wt.status = $${countParamIndex++}`;
      countParams.push(status);
    }

    if (search) {
      countSql += ` AND (wt.name ILIKE $${countParamIndex++} OR wt.description ILIKE $${countParamIndex++})`;
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (tags && tags.length > 0) {
      countSql += ` AND wt.tags ?| $${countParamIndex++}`;
      countParams.push(tags);
    }

    if (isDefault !== undefined) {
      countSql += ` AND wt.is_default = $${countParamIndex++}`;
      countParams.push(isDefault);
    }

    if (isSystem !== undefined) {
      countSql += ` AND wt.is_system = $${countParamIndex++}`;
      countParams.push(isSystem);
    }

    const countResult = await this.client.query(countSql, countParams);

    return {
      templates: result.rows.map(this.mapWorkflowTemplate),
      total: parseInt(countResult.rows[0]?.total || '0', 10)
    };
  }

  async getTemplateById(id: string): Promise<WorkflowTemplate | null> {
    const sql = `
      SELECT 
        wt.*,
        COUNT(pw.id) as project_count
      FROM workflow_templates wt
      LEFT JOIN project_workflows pw ON wt.id = pw.workflow_template_id
      WHERE wt.id = $1
      GROUP BY wt.id
    `;

    const result = await this.client.query(sql, [id]);
    return result.rows.length > 0 ? this.mapWorkflowTemplate(result.rows[0]) : null;
  }

  async createTemplate(request: CreateWorkflowTemplateRequest, userId: string): Promise<WorkflowTemplate> {
    const sql = `
      INSERT INTO workflow_templates (
        name, description, category, type, tags, metadata, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const params = [
      request.name,
      request.description || null,
      request.category,
      request.type || 'custom',
      JSON.stringify(request.tags || []),
      JSON.stringify(request.metadata || {}),
      userId,
      userId
    ];

    const result = await this.client.query(sql, params);
    return this.mapWorkflowTemplate(result.rows[0]);
  }

  async updateTemplate(id: string, request: UpdateWorkflowTemplateRequest, userId: string): Promise<WorkflowTemplate> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (request.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(request.name);
    }

    if (request.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(request.description);
    }

    if (request.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      params.push(request.category);
    }

    if (request.type !== undefined) {
      updates.push(`type = $${paramIndex++}`);
      params.push(request.type);
    }

    if (request.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(request.status);
    }

    if (request.version !== undefined) {
      updates.push(`version = $${paramIndex++}`);
      params.push(request.version);
    }

    if (request.tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      params.push(JSON.stringify(request.tags));
    }

    if (request.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      params.push(JSON.stringify(request.metadata));
    }

    updates.push(`updated_by = $${paramIndex++}`);
    params.push(userId);

    updates.push(`updated_at = NOW()`);

    const sql = `
      UPDATE workflow_templates
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    params.push(id);

    const result = await this.client.query(sql, params);
    if (result.rows.length === 0) {
      throw new Error('Workflow template not found');
    }

    return this.mapWorkflowTemplate(result.rows[0]);
  }

  async deleteTemplate(id: string): Promise<void> {
    // First check if template is being used by any active projects
    const usageCheck = await this.client.query(
      'SELECT COUNT(*) as count FROM project_workflows WHERE workflow_template_id = $1 AND status = $2',
      [id, 'active']
    );

    if (parseInt(usageCheck.rows[0].count, 10) > 0) {
      throw new Error('Cannot delete template: it is being used by active projects');
    }

    const result = await this.client.query(
      'DELETE FROM workflow_templates WHERE id = $1 AND is_system = false',
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error('Template not found or cannot delete system template');
    }
  }

  async duplicateTemplate(id: string, newName: string, userId: string): Promise<WorkflowTemplate> {
    const template = await this.getTemplateById(id);
    if (!template) {
      throw new Error('Template not found');
    }

    // Start transaction
    await this.client.query('BEGIN');

    try {
      // Create new template
      const newTemplate = await this.createTemplate({
        name: newName,
        description: template.description,
        category: template.category,
        type: 'custom',
        tags: template.tags,
        metadata: template.metadata
      }, userId);

      // Get phases and duplicate them
      const phases = await this.getPhases(id);
      for (const phase of phases) {
        const newPhase = await this.createPhase({
          workflowTemplateId: newTemplate.id,
          name: phase.name,
          description: phase.description,
          orderIndex: phase.orderIndex,
          color: phase.color,
          icon: phase.icon,
          estimatedDuration: phase.estimatedDuration,
          requiredRoles: phase.requiredRoles,
          dependencies: [], // Reset dependencies for duplicated template
          completionCriteria: phase.completionCriteria,
          isOptional: phase.isOptional,
          isParallel: phase.isParallel,
          metadata: phase.metadata
        });

        // Get steps and duplicate them
        const steps = await this.getSteps(phase.id);
        for (const step of steps) {
          const newStep = await this.createStep({
            workflowPhaseId: newPhase.id,
            name: step.name,
            description: step.description,
            orderIndex: step.orderIndex,
            stepType: step.stepType,
            estimatedDuration: step.estimatedDuration,
            assigneeRole: step.assigneeRole,
            dependencies: [], // Reset dependencies
            preconditions: step.preconditions,
            postconditions: step.postconditions,
            instructions: step.instructions,
            resources: step.resources,
            validation: step.validation,
            isRequired: step.isRequired,
            isAutomated: step.isAutomated,
            automationConfig: step.automationConfig,
            metadata: step.metadata
          });

          // Get tasks and duplicate them
          const tasks = await this.getTasks(step.id);
          for (const task of tasks) {
            await this.createTask({
              workflowStepId: newStep.id,
              name: task.name,
              description: task.description,
              orderIndex: task.orderIndex,
              priority: task.priority,
              estimatedHours: task.estimatedHours,
              skillsRequired: task.skillsRequired,
              tools: task.tools,
              deliverables: task.deliverables,
              acceptanceCriteria: task.acceptanceCriteria,
              isOptional: task.isOptional,
              canBeParallel: task.canBeParallel,
              tags: task.tags,
              metadata: task.metadata
            });
          }
        }
      }

      await this.client.query('COMMIT');
      return newTemplate;
    } catch (error) {
      await this.client.query('ROLLBACK');
      throw error;
    }
  }

  /**
   * WORKFLOW PHASE OPERATIONS
   */

  async getPhases(templateId: string): Promise<WorkflowPhase[]> {
    const sql = `
      SELECT * FROM workflow_phases
      WHERE workflow_template_id = $1
      ORDER BY order_index ASC
    `;

    const result = await this.client.query(sql, [templateId]);
    return result.rows.map(this.mapWorkflowPhase);
  }

  async createPhase(request: CreateWorkflowPhaseRequest): Promise<WorkflowPhase> {
    const sql = `
      INSERT INTO workflow_phases (
        workflow_template_id, name, description, order_index, color, icon,
        estimated_duration, required_roles, dependencies, completion_criteria,
        is_optional, is_parallel, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const params = [
      request.workflowTemplateId,
      request.name,
      request.description || null,
      request.orderIndex,
      request.color || '#3B82F6',
      request.icon || null,
      request.estimatedDuration || null,
      JSON.stringify(request.requiredRoles || []),
      JSON.stringify(request.dependencies || []),
      JSON.stringify(request.completionCriteria || []),
      request.isOptional || false,
      request.isParallel || false,
      JSON.stringify(request.metadata || {})
    ];

    const result = await this.client.query(sql, params);
    return this.mapWorkflowPhase(result.rows[0]);
  }

  async updatePhase(id: string, request: UpdateWorkflowPhaseRequest): Promise<WorkflowPhase> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (request.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(request.name);
    }

    if (request.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(request.description);
    }

    if (request.orderIndex !== undefined) {
      updates.push(`order_index = $${paramIndex++}`);
      params.push(request.orderIndex);
    }

    if (request.color !== undefined) {
      updates.push(`color = $${paramIndex++}`);
      params.push(request.color);
    }

    if (request.icon !== undefined) {
      updates.push(`icon = $${paramIndex++}`);
      params.push(request.icon);
    }

    if (request.estimatedDuration !== undefined) {
      updates.push(`estimated_duration = $${paramIndex++}`);
      params.push(request.estimatedDuration);
    }

    if (request.requiredRoles !== undefined) {
      updates.push(`required_roles = $${paramIndex++}`);
      params.push(JSON.stringify(request.requiredRoles));
    }

    if (request.dependencies !== undefined) {
      updates.push(`dependencies = $${paramIndex++}`);
      params.push(JSON.stringify(request.dependencies));
    }

    if (request.completionCriteria !== undefined) {
      updates.push(`completion_criteria = $${paramIndex++}`);
      params.push(JSON.stringify(request.completionCriteria));
    }

    if (request.isOptional !== undefined) {
      updates.push(`is_optional = $${paramIndex++}`);
      params.push(request.isOptional);
    }

    if (request.isParallel !== undefined) {
      updates.push(`is_parallel = $${paramIndex++}`);
      params.push(request.isParallel);
    }

    if (request.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      params.push(JSON.stringify(request.metadata));
    }

    updates.push(`updated_at = NOW()`);

    const sql = `
      UPDATE workflow_phases
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    params.push(id);

    const result = await this.client.query(sql, params);
    if (result.rows.length === 0) {
      throw new Error('Workflow phase not found');
    }

    return this.mapWorkflowPhase(result.rows[0]);
  }

  async deletePhase(id: string): Promise<void> {
    const result = await this.client.query(
      'DELETE FROM workflow_phases WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error('Phase not found');
    }
  }

  async reorderPhases(templateId: string, items: BulkUpdateOrderRequest): Promise<void> {
    await this.client.query('BEGIN');

    try {
      for (const item of items.items) {
        await this.client.query(
          'UPDATE workflow_phases SET order_index = $1, updated_at = NOW() WHERE id = $2 AND workflow_template_id = $3',
          [item.orderIndex, item.id, templateId]
        );
      }

      await this.client.query('COMMIT');
    } catch (error) {
      await this.client.query('ROLLBACK');
      throw error;
    }
  }

  /**
   * WORKFLOW STEP OPERATIONS
   */

  async getSteps(phaseId: string): Promise<WorkflowStep[]> {
    const sql = `
      SELECT ws.*, s.name as assignee_name
      FROM workflow_steps ws
      LEFT JOIN staff s ON ws.assignee_id = s.id
      WHERE ws.workflow_phase_id = $1
      ORDER BY ws.order_index ASC
    `;

    const result = await this.client.query(sql, [phaseId]);
    return result.rows.map(this.mapWorkflowStep);
  }

  async createStep(request: CreateWorkflowStepRequest): Promise<WorkflowStep> {
    const sql = `
      INSERT INTO workflow_steps (
        workflow_phase_id, name, description, order_index, step_type,
        estimated_duration, assignee_role, assignee_id, dependencies,
        preconditions, postconditions, instructions, resources, validation,
        is_required, is_automated, automation_config, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;

    const params = [
      request.workflowPhaseId,
      request.name,
      request.description || null,
      request.orderIndex,
      request.stepType || 'task',
      request.estimatedDuration || null,
      request.assigneeRole || null,
      request.assigneeId || null,
      JSON.stringify(request.dependencies || []),
      JSON.stringify(request.preconditions || []),
      JSON.stringify(request.postconditions || []),
      request.instructions || null,
      JSON.stringify(request.resources || []),
      JSON.stringify(request.validation || []),
      request.isRequired !== false,
      request.isAutomated || false,
      JSON.stringify(request.automationConfig || {}),
      JSON.stringify(request.metadata || {})
    ];

    const result = await this.client.query(sql, params);
    return this.mapWorkflowStep(result.rows[0]);
  }

  async updateStep(id: string, request: UpdateWorkflowStepRequest): Promise<WorkflowStep> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (request.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(request.name);
    }

    if (request.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(request.description);
    }

    if (request.orderIndex !== undefined) {
      updates.push(`order_index = $${paramIndex++}`);
      params.push(request.orderIndex);
    }

    if (request.stepType !== undefined) {
      updates.push(`step_type = $${paramIndex++}`);
      params.push(request.stepType);
    }

    if (request.estimatedDuration !== undefined) {
      updates.push(`estimated_duration = $${paramIndex++}`);
      params.push(request.estimatedDuration);
    }

    if (request.assigneeRole !== undefined) {
      updates.push(`assignee_role = $${paramIndex++}`);
      params.push(request.assigneeRole);
    }

    if (request.assigneeId !== undefined) {
      updates.push(`assignee_id = $${paramIndex++}`);
      params.push(request.assigneeId);
    }

    if (request.dependencies !== undefined) {
      updates.push(`dependencies = $${paramIndex++}`);
      params.push(JSON.stringify(request.dependencies));
    }

    if (request.preconditions !== undefined) {
      updates.push(`preconditions = $${paramIndex++}`);
      params.push(JSON.stringify(request.preconditions));
    }

    if (request.postconditions !== undefined) {
      updates.push(`postconditions = $${paramIndex++}`);
      params.push(JSON.stringify(request.postconditions));
    }

    if (request.instructions !== undefined) {
      updates.push(`instructions = $${paramIndex++}`);
      params.push(request.instructions);
    }

    if (request.resources !== undefined) {
      updates.push(`resources = $${paramIndex++}`);
      params.push(JSON.stringify(request.resources));
    }

    if (request.validation !== undefined) {
      updates.push(`validation = $${paramIndex++}`);
      params.push(JSON.stringify(request.validation));
    }

    if (request.isRequired !== undefined) {
      updates.push(`is_required = $${paramIndex++}`);
      params.push(request.isRequired);
    }

    if (request.isAutomated !== undefined) {
      updates.push(`is_automated = $${paramIndex++}`);
      params.push(request.isAutomated);
    }

    if (request.automationConfig !== undefined) {
      updates.push(`automation_config = $${paramIndex++}`);
      params.push(JSON.stringify(request.automationConfig));
    }

    if (request.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      params.push(JSON.stringify(request.metadata));
    }

    updates.push(`updated_at = NOW()`);

    const sql = `
      UPDATE workflow_steps
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    params.push(id);

    const result = await this.client.query(sql, params);
    if (result.rows.length === 0) {
      throw new Error('Workflow step not found');
    }

    return this.mapWorkflowStep(result.rows[0]);
  }

  async deleteStep(id: string): Promise<void> {
    const result = await this.client.query(
      'DELETE FROM workflow_steps WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error('Step not found');
    }
  }

  async reorderSteps(phaseId: string, items: BulkUpdateOrderRequest): Promise<void> {
    await this.client.query('BEGIN');

    try {
      for (const item of items.items) {
        await this.client.query(
          'UPDATE workflow_steps SET order_index = $1, updated_at = NOW() WHERE id = $2 AND workflow_phase_id = $3',
          [item.orderIndex, item.id, phaseId]
        );
      }

      await this.client.query('COMMIT');
    } catch (error) {
      await this.client.query('ROLLBACK');
      throw error;
    }
  }

  /**
   * WORKFLOW TASK OPERATIONS
   */

  async getTasks(stepId: string): Promise<WorkflowTask[]> {
    const sql = `
      SELECT * FROM workflow_tasks
      WHERE workflow_step_id = $1
      ORDER BY order_index ASC
    `;

    const result = await this.client.query(sql, [stepId]);
    return result.rows.map(this.mapWorkflowTask);
  }

  async createTask(request: CreateWorkflowTaskRequest): Promise<WorkflowTask> {
    const sql = `
      INSERT INTO workflow_tasks (
        workflow_step_id, name, description, order_index, priority,
        estimated_hours, skills_required, tools, deliverables,
        acceptance_criteria, is_optional, can_be_parallel, tags, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const params = [
      request.workflowStepId,
      request.name,
      request.description || null,
      request.orderIndex,
      request.priority || 'medium',
      request.estimatedHours || null,
      JSON.stringify(request.skillsRequired || []),
      JSON.stringify(request.tools || []),
      JSON.stringify(request.deliverables || []),
      JSON.stringify(request.acceptanceCriteria || []),
      request.isOptional || false,
      request.canBeParallel !== false,
      JSON.stringify(request.tags || []),
      JSON.stringify(request.metadata || {})
    ];

    const result = await this.client.query(sql, params);
    return this.mapWorkflowTask(result.rows[0]);
  }

  async updateTask(id: string, request: UpdateWorkflowTaskRequest): Promise<WorkflowTask> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (request.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(request.name);
    }

    if (request.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(request.description);
    }

    if (request.orderIndex !== undefined) {
      updates.push(`order_index = $${paramIndex++}`);
      params.push(request.orderIndex);
    }

    if (request.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      params.push(request.priority);
    }

    if (request.estimatedHours !== undefined) {
      updates.push(`estimated_hours = $${paramIndex++}`);
      params.push(request.estimatedHours);
    }

    if (request.skillsRequired !== undefined) {
      updates.push(`skills_required = $${paramIndex++}`);
      params.push(JSON.stringify(request.skillsRequired));
    }

    if (request.tools !== undefined) {
      updates.push(`tools = $${paramIndex++}`);
      params.push(JSON.stringify(request.tools));
    }

    if (request.deliverables !== undefined) {
      updates.push(`deliverables = $${paramIndex++}`);
      params.push(JSON.stringify(request.deliverables));
    }

    if (request.acceptanceCriteria !== undefined) {
      updates.push(`acceptance_criteria = $${paramIndex++}`);
      params.push(JSON.stringify(request.acceptanceCriteria));
    }

    if (request.isOptional !== undefined) {
      updates.push(`is_optional = $${paramIndex++}`);
      params.push(request.isOptional);
    }

    if (request.canBeParallel !== undefined) {
      updates.push(`can_be_parallel = $${paramIndex++}`);
      params.push(request.canBeParallel);
    }

    if (request.tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      params.push(JSON.stringify(request.tags));
    }

    if (request.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      params.push(JSON.stringify(request.metadata));
    }

    updates.push(`updated_at = NOW()`);

    const sql = `
      UPDATE workflow_tasks
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    params.push(id);

    const result = await this.client.query(sql, params);
    if (result.rows.length === 0) {
      throw new Error('Workflow task not found');
    }

    return this.mapWorkflowTask(result.rows[0]);
  }

  async deleteTask(id: string): Promise<void> {
    const result = await this.client.query(
      'DELETE FROM workflow_tasks WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error('Task not found');
    }
  }

  async bulkDeleteTasks(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    const placeholders = ids.map((_, index) => `$${index + 1}`).join(', ');
    const result = await this.client.query(
      `DELETE FROM workflow_tasks WHERE id IN (${placeholders})`,
      ids
    );

    if (result.rowCount !== ids.length) {
      throw new Error('Some tasks could not be deleted');
    }
  }

  async reorderTasks(stepId: string, items: BulkUpdateOrderRequest): Promise<void> {
    await this.client.query('BEGIN');

    try {
      for (const item of items.items) {
        await this.client.query(
          'UPDATE workflow_tasks SET order_index = $1, updated_at = NOW() WHERE id = $2 AND workflow_step_id = $3',
          [item.orderIndex, item.id, stepId]
        );
      }

      await this.client.query('COMMIT');
    } catch (error) {
      await this.client.query('ROLLBACK');
      throw error;
    }
  }

  /**
   * VALIDATION METHODS
   */

  async validateTemplate(templateId: string): Promise<WorkflowValidationResult> {
    const errors: WorkflowValidationError[] = [];
    const warnings: WorkflowValidationWarning[] = [];

    // Get template and all related data
    const template = await this.getTemplateById(templateId);
    if (!template) {
      errors.push({
        type: 'missing_required',
        level: 'template',
        message: 'Template not found',
      });
      return { isValid: false, errors, warnings };
    }

    const phases = await this.getPhases(templateId);
    
    // Validate template has phases
    if (phases.length === 0) {
      errors.push({
        type: 'missing_required',
        level: 'template',
        itemId: templateId,
        message: 'Template must have at least one phase',
      });
    }

    // Validate phases
    for (const phase of phases) {
      await this.validatePhase(phase, errors, warnings);
    }

    // Check for circular dependencies at phase level
    this.checkCircularDependencies(phases.map(p => ({
      id: p.id,
      dependencies: p.dependencies
    })), 'phase', errors);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private async validatePhase(
    phase: WorkflowPhase,
    errors: WorkflowValidationError[],
    warnings: WorkflowValidationWarning[]
  ): Promise<void> {
    // Check if phase has steps
    const steps = await this.getSteps(phase.id);
    if (steps.length === 0) {
      warnings.push({
        type: 'incomplete_data',
        level: 'phase',
        itemId: phase.id,
        message: `Phase "${phase.name}" has no steps`,
        suggestion: 'Consider adding steps to this phase or marking it as optional'
      });
    }

    // Validate step order indices are unique
    const orderIndices = steps.map(s => s.orderIndex);
    const duplicateOrders = orderIndices.filter((index, i) => orderIndices.indexOf(index) !== i);
    if (duplicateOrders.length > 0) {
      errors.push({
        type: 'duplicate_order',
        level: 'step',
        itemId: phase.id,
        message: `Duplicate order indices found in phase "${phase.name}": ${duplicateOrders.join(', ')}`,
      });
    }

    // Validate each step
    for (const step of steps) {
      await this.validateStep(step, errors, warnings);
    }

    // Check for circular dependencies at step level
    this.checkCircularDependencies(steps.map(s => ({
      id: s.id,
      dependencies: s.dependencies
    })), 'step', errors);
  }

  private async validateStep(
    step: WorkflowStep,
    errors: WorkflowValidationError[],
    warnings: WorkflowValidationWarning[]
  ): Promise<void> {
    // Check if step has tasks
    const tasks = await this.getTasks(step.id);
    if (tasks.length === 0 && step.stepType === 'task') {
      warnings.push({
        type: 'incomplete_data',
        level: 'step',
        itemId: step.id,
        message: `Step "${step.name}" of type "task" has no tasks`,
        suggestion: 'Consider adding tasks or changing the step type'
      });
    }

    // Validate assignee role is specified for required steps
    if (step.isRequired && !step.assigneeRole && !step.assigneeId) {
      warnings.push({
        type: 'best_practice',
        level: 'step',
        itemId: step.id,
        message: `Required step "${step.name}" has no assigned role or user`,
        suggestion: 'Specify either an assignee role or specific user for better accountability'
      });
    }

    // Validate task order indices are unique
    const orderIndices = tasks.map(t => t.orderIndex);
    const duplicateOrders = orderIndices.filter((index, i) => orderIndices.indexOf(index) !== i);
    if (duplicateOrders.length > 0) {
      errors.push({
        type: 'duplicate_order',
        level: 'task',
        itemId: step.id,
        message: `Duplicate order indices found in step "${step.name}": ${duplicateOrders.join(', ')}`,
      });
    }

    // Performance warning for too many tasks
    if (tasks.length > 20) {
      warnings.push({
        type: 'performance',
        level: 'step',
        itemId: step.id,
        message: `Step "${step.name}" has ${tasks.length} tasks`,
        suggestion: 'Consider breaking down large steps into multiple smaller steps for better manageability'
      });
    }
  }

  private checkCircularDependencies(
    items: { id: string; dependencies: string[] }[],
    level: 'phase' | 'step',
    errors: WorkflowValidationError[]
  ): void {
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const hasCycle = (itemId: string): boolean => {
      if (visiting.has(itemId)) return true;
      if (visited.has(itemId)) return false;

      visiting.add(itemId);

      const item = items.find(i => i.id === itemId);
      if (item) {
        for (const depId of item.dependencies) {
          if (hasCycle(depId)) return true;
        }
      }

      visiting.delete(itemId);
      visited.add(itemId);
      return false;
    };

    for (const item of items) {
      if (hasCycle(item.id)) {
        errors.push({
          type: 'circular_dependency',
          level,
          itemId: item.id,
          message: `Circular dependency detected starting from ${level} "${item.id}"`,
        });
      }
    }
  }

  /**
   * PRIVATE MAPPING METHODS
   */

  private mapWorkflowTemplate(row: any): WorkflowTemplate {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      type: row.type,
      status: row.status,
      version: row.version,
      isDefault: row.is_default,
      isSystem: row.is_system,
      tags: JSON.parse(row.tags || '[]'),
      metadata: JSON.parse(row.metadata || '{}'),
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      projectCount: parseInt(row.project_count || '0', 10)
    };
  }

  private mapWorkflowPhase(row: any): WorkflowPhase {
    return {
      id: row.id,
      workflowTemplateId: row.workflow_template_id,
      name: row.name,
      description: row.description,
      orderIndex: row.order_index,
      color: row.color,
      icon: row.icon,
      estimatedDuration: row.estimated_duration,
      requiredRoles: JSON.parse(row.required_roles || '[]'),
      dependencies: JSON.parse(row.dependencies || '[]'),
      completionCriteria: JSON.parse(row.completion_criteria || '[]'),
      isOptional: row.is_optional,
      isParallel: row.is_parallel,
      metadata: JSON.parse(row.metadata || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapWorkflowStep(row: any): WorkflowStep {
    return {
      id: row.id,
      workflowPhaseId: row.workflow_phase_id,
      name: row.name,
      description: row.description,
      orderIndex: row.order_index,
      stepType: row.step_type,
      estimatedDuration: row.estimated_duration,
      assigneeRole: row.assignee_role,
      assigneeId: row.assignee_id,
      dependencies: JSON.parse(row.dependencies || '[]'),
      preconditions: JSON.parse(row.preconditions || '[]'),
      postconditions: JSON.parse(row.postconditions || '[]'),
      instructions: row.instructions,
      resources: JSON.parse(row.resources || '[]'),
      validation: JSON.parse(row.validation || '[]'),
      isRequired: row.is_required,
      isAutomated: row.is_automated,
      automationConfig: JSON.parse(row.automation_config || '{}'),
      metadata: JSON.parse(row.metadata || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapWorkflowTask(row: any): WorkflowTask {
    return {
      id: row.id,
      workflowStepId: row.workflow_step_id,
      name: row.name,
      description: row.description,
      orderIndex: row.order_index,
      priority: row.priority,
      estimatedHours: row.estimated_hours ? parseFloat(row.estimated_hours) : undefined,
      skillsRequired: JSON.parse(row.skills_required || '[]'),
      tools: JSON.parse(row.tools || '[]'),
      deliverables: JSON.parse(row.deliverables || '[]'),
      acceptanceCriteria: JSON.parse(row.acceptance_criteria || '[]'),
      isOptional: row.is_optional,
      canBeParallel: row.can_be_parallel,
      tags: JSON.parse(row.tags || '[]'),
      metadata: JSON.parse(row.metadata || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

// Export singleton instance
export const workflowManagementService = new WorkflowManagementService();