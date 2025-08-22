/**
 * FibreFlow Agent OS - Main orchestration system
 * Coordinates all agents for the FibreFlow React migration project
 */

import { AgentOrchestrator } from './core/AgentOrchestrator';
import { AGENT_SPECIFICATIONS, TASK_TEMPLATES } from './specifications/fibreflow-agents';
import { 
  TaskType, 
  TaskPriority, 
  MigrationPhase, 
  ModuleType, 
  FibreFlowTask,
  Task,
  TaskStatus
} from './types/agent.types';
import { Logger } from './utils/logger';

export class FibreFlowAgentOS {
  private orchestrator: AgentOrchestrator;
  private logger: Logger;
  private migrationPhase: MigrationPhase = MigrationPhase.FOUNDATION;
  private activeModules: Set<ModuleType> = new Set();

  constructor() {
    this.orchestrator = new AgentOrchestrator();
    this.logger = new Logger('FibreFlowAgentOS');
  }

  /**
   * Initialize the FibreFlow Agent OS system
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing FibreFlow Agent OS...');

    try {
      // Initialize the core orchestrator
      await this.orchestrator.initialize();

      // Set up FibreFlow-specific event handlers
      this.setupEventHandlers();

      // Create initial migration tasks
      await this.createInitialMigrationTasks();

      this.logger.info('FibreFlow Agent OS initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize FibreFlow Agent OS:', error);
      throw error;
    }
  }

  /**
   * Create a FibreFlow-specific migration task
   */
  async createMigrationTask(taskData: {
    type: TaskType;
    name: string;
    description: string;
    priority?: TaskPriority;
    migrationPhase: MigrationPhase;
    moduleType: ModuleType;
    angularComponent?: string;
    reactComponent?: string;
    dependencies?: string[];
    estimatedDuration?: number;
  }): Promise<string> {
    const template = TASK_TEMPLATES[taskData.type as keyof typeof TASK_TEMPLATES] || {
      estimatedDuration: 900000,
      maxRetries: 2,
      requiredCapabilities: [],
      tags: []
    };
    
    const task: Omit<FibreFlowTask, 'id' | 'status' | 'createdAt' | 'updatedAt'> = {
      type: taskData.type,
      name: taskData.name,
      description: taskData.description,
      priority: taskData.priority || TaskPriority.MEDIUM,
      requiredCapabilities: template?.requiredCapabilities || [],
      parameters: {
        migrationPhase: taskData.migrationPhase,
        moduleType: taskData.moduleType,
        angularComponent: taskData.angularComponent,
        reactComponent: taskData.reactComponent
      },
      dependencies: taskData.dependencies || [],
      estimatedDuration: taskData.estimatedDuration || template?.estimatedDuration || 900000,
      retryCount: 0,
      maxRetries: template?.maxRetries || 2,
      tags: template?.tags || [],
      metadata: {
        migrationPhase: taskData.migrationPhase,
        moduleType: taskData.moduleType,
        framework: 'React'
      },
      migrationPhase: taskData.migrationPhase,
      moduleType: taskData.moduleType,
      angularComponent: taskData.angularComponent,
      reactComponent: taskData.reactComponent
    };

    const taskId = await this.orchestrator.createTask(task);
    
    this.logger.info(`Created migration task: ${taskId} for ${taskData.moduleType}`);
    return taskId;
  }

  /**
   * Start migration for a specific module
   */
  async startModuleMigration(moduleType: ModuleType): Promise<void> {
    this.logger.info(`Starting migration for module: ${moduleType}`);

    this.activeModules.add(moduleType);

    // Create module-specific migration tasks
    await this.createModuleMigrationTasks(moduleType);

    // Update migration phase if needed
    await this.updateMigrationPhase();
  }

  /**
   * Complete migration for a module
   */
  async completeModuleMigration(moduleType: ModuleType): Promise<void> {
    this.logger.info(`Completing migration for module: ${moduleType}`);

    this.activeModules.delete(moduleType);

    // Verify module completion
    await this.verifyModuleCompletion(moduleType);

    // Create post-migration tasks (testing, documentation, etc.)
    await this.createPostMigrationTasks(moduleType);

    this.logger.info(`Module ${moduleType} migration completed`);
  }

  /**
   * Get migration progress
   */
  getMigrationProgress(): {
    currentPhase: MigrationPhase;
    completedModules: ModuleType[];
    activeModules: ModuleType[];
    overallProgress: number;
    phaseProgress: number;
    estimatedCompletion: Date;
  } {
    const allModules = Object.values(ModuleType);
    const completedModules = allModules.filter(module => !this.activeModules.has(module));
    const overallProgress = (completedModules.length / allModules.length) * 100;

    // Calculate phase progress based on current phase tasks
    const phaseTasks = this.getPhaseSpecificTasks(this.migrationPhase);
    const completedPhaseTasks = phaseTasks.filter(task => task.status === TaskStatus.COMPLETED);
    const phaseProgress = phaseTasks.length > 0 ? (completedPhaseTasks.length / phaseTasks.length) * 100 : 0;

    // Estimate completion time based on current velocity
    const averageTaskTime = this.calculateAverageTaskTime();
    const remainingTasks = this.getRemainingTaskCount();
    const estimatedCompletion = new Date(Date.now() + (remainingTasks * averageTaskTime));

    return {
      currentPhase: this.migrationPhase,
      completedModules,
      activeModules: Array.from(this.activeModules),
      overallProgress,
      phaseProgress,
      estimatedCompletion
    };
  }

  /**
   * Get system status for dashboard
   */
  getSystemStatus() {
    const orchestratorStatus = this.orchestrator.getSystemStatus();
    const migrationProgress = this.getMigrationProgress();

    return {
      ...orchestratorStatus,
      migration: migrationProgress,
      agentSpecifications: AGENT_SPECIFICATIONS.map(spec => ({
        type: spec.type,
        name: spec.name,
        capabilities: spec.capabilities.length,
        status: 'active' // TODO: Get actual agent status
      }))
    };
  }

  /**
   * Get the orchestrator instance for dashboard integration
   */
  getOrchestrator(): AgentOrchestrator {
    return this.orchestrator;
  }

  /**
   * Shutdown the Agent OS
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down FibreFlow Agent OS...');
    
    await this.orchestrator.shutdown();
    
    this.logger.info('FibreFlow Agent OS shutdown complete');
  }

  // Private methods

  private setupEventHandlers(): void {
    this.orchestrator.on('task:completed', this.handleTaskCompleted.bind(this));
    this.orchestrator.on('task:failed', this.handleTaskFailed.bind(this));
    this.orchestrator.on('agent:error', this.handleAgentError.bind(this));
  }

  private async handleTaskCompleted({ taskId, task }: { taskId: string; task: FibreFlowTask }): Promise<void> {
    this.logger.info(`Task completed: ${taskId} (${task.moduleType})`);

    // Check if module migration is complete
    if (this.isModuleComplete(task.moduleType)) {
      await this.completeModuleMigration(task.moduleType);
    }

    // Create follow-up tasks if needed
    await this.createFollowUpTasks(task);
  }

  private async handleTaskFailed({ taskId, error }: { taskId: string; error: any }): Promise<void> {
    this.logger.error(`Task failed: ${taskId}`, error instanceof Error ? error : new Error(String(error)));

    // Implement failure recovery strategies
    await this.handleTaskFailure(taskId, error);
  }

  private async handleAgentError({ agentId, error }: { agentId: string; error: any }): Promise<void> {
    this.logger.error(`Agent error: ${agentId}`, error instanceof Error ? error : new Error(String(error)));

    // Implement agent recovery strategies
    await this.handleAgentFailure(agentId, error);
  }

  private async createInitialMigrationTasks(): Promise<void> {
    this.logger.info('Creating initial migration tasks...');

    // Foundation phase tasks
    const foundationTasks = [
      {
        type: TaskType.SYSTEM_DESIGN,
        name: 'Architecture Analysis',
        description: 'Analyze current Angular architecture and design React migration strategy',
        priority: TaskPriority.HIGH,
        migrationPhase: MigrationPhase.FOUNDATION,
        moduleType: ModuleType.AUTHENTICATION
      },
      {
        type: TaskType.ENVIRONMENT_SETUP,
        name: 'Development Environment Setup',
        description: 'Set up React development environment and build tools',
        priority: TaskPriority.HIGH,
        migrationPhase: MigrationPhase.FOUNDATION,
        moduleType: ModuleType.AUTHENTICATION
      },
      {
        type: TaskType.CODE_GENERATION,
        name: 'Base Component Library',
        description: 'Create base React component library and common utilities',
        priority: TaskPriority.MEDIUM,
        migrationPhase: MigrationPhase.FOUNDATION,
        moduleType: ModuleType.AUTHENTICATION
      }
    ];

    for (const taskData of foundationTasks) {
      await this.createMigrationTask(taskData);
    }

    this.logger.info(`Created ${foundationTasks.length} initial migration tasks`);
  }

  private async createModuleMigrationTasks(moduleType: ModuleType): Promise<void> {
    const moduleTasks = this.getModuleSpecificTasks(moduleType);
    
    for (const taskData of moduleTasks) {
      await this.createMigrationTask(taskData);
    }

    this.logger.info(`Created ${moduleTasks.length} tasks for module: ${moduleType}`);
  }

  private getModuleSpecificTasks(moduleType: ModuleType): any[] {
    // Define module-specific task templates
    const moduleTaskTemplates: Record<ModuleType, any[]> = {
      [ModuleType.AUTHENTICATION]: [
        {
          type: TaskType.CODE_MIGRATION,
          name: 'Migrate Auth Service',
          description: 'Convert Angular auth service to React custom hooks',
          priority: TaskPriority.HIGH,
          migrationPhase: MigrationPhase.CORE_MODULES,
          moduleType,
          angularComponent: 'AuthService',
          reactComponent: 'useAuth'
        },
        {
          type: TaskType.COMPONENT_CREATION,
          name: 'Login Component',
          description: 'Create React login component',
          priority: TaskPriority.HIGH,
          migrationPhase: MigrationPhase.CORE_MODULES,
          moduleType,
          reactComponent: 'LoginForm'
        }
      ],
      [ModuleType.PROJECTS]: [
        {
          type: TaskType.CODE_MIGRATION,
          name: 'Migrate Project Service',
          description: 'Convert Angular project service to React hooks',
          priority: TaskPriority.HIGH,
          migrationPhase: MigrationPhase.CORE_MODULES,
          moduleType,
          angularComponent: 'ProjectService',
          reactComponent: 'useProjects'
        }
      ],
      // Add other modules...
      [ModuleType.POLE_TRACKER]: [],
      [ModuleType.STAFF_MANAGEMENT]: [],
      [ModuleType.STOCK_MATERIALS]: [],
      [ModuleType.BOQ]: [],
      [ModuleType.CONTRACTORS]: [],
      [ModuleType.DAILY_PROGRESS]: [],
      [ModuleType.ANALYTICS]: [],
      [ModuleType.SETTINGS]: []
    };

    return moduleTaskTemplates[moduleType] || [];
  }

  private async createPostMigrationTasks(moduleType: ModuleType): Promise<void> {
    const postTasks = [
      {
        type: TaskType.UNIT_TESTING,
        name: `${moduleType} Unit Tests`,
        description: `Create comprehensive unit tests for ${moduleType} module`,
        priority: TaskPriority.MEDIUM,
        migrationPhase: MigrationPhase.TESTING,
        moduleType
      },
      {
        type: TaskType.E2E_TESTING,
        name: `${moduleType} E2E Tests`,
        description: `Create end-to-end tests for ${moduleType} module`,
        priority: TaskPriority.MEDIUM,
        migrationPhase: MigrationPhase.TESTING,
        moduleType
      },
      {
        type: TaskType.TECHNICAL_DOCUMENTATION,
        name: `${moduleType} Documentation`,
        description: `Create technical documentation for ${moduleType} module`,
        priority: TaskPriority.LOW,
        migrationPhase: MigrationPhase.TESTING,
        moduleType
      }
    ];

    for (const taskData of postTasks) {
      await this.createMigrationTask(taskData);
    }
  }

  private async updateMigrationPhase(): Promise<void> {
    // Logic to determine if we should move to the next migration phase
    const currentPhaseTasks = this.getPhaseSpecificTasks(this.migrationPhase);
    const completedTasks = currentPhaseTasks.filter(task => task.status === TaskStatus.COMPLETED);
    
    if (completedTasks.length === currentPhaseTasks.length && currentPhaseTasks.length > 0) {
      const nextPhase = this.getNextMigrationPhase();
      if (nextPhase) {
        this.migrationPhase = nextPhase;
        this.logger.info(`Migration phase updated to: ${this.migrationPhase}`);
      }
    }
  }

  private getNextMigrationPhase(): MigrationPhase | null {
    const phases = Object.values(MigrationPhase);
    const currentIndex = phases.indexOf(this.migrationPhase);
    return currentIndex < phases.length - 1 ? phases[currentIndex + 1] : null;
  }

  private async createFollowUpTasks(task: FibreFlowTask): Promise<void> {
    // Create follow-up tasks based on completed task
    if (task.type === TaskType.CODE_MIGRATION && task.reactComponent) {
      // Create testing tasks for the migrated component
      await this.createMigrationTask({
        type: TaskType.UNIT_TESTING,
        name: `Test ${task.reactComponent}`,
        description: `Create unit tests for ${task.reactComponent}`,
        priority: TaskPriority.MEDIUM,
        migrationPhase: MigrationPhase.TESTING,
        moduleType: task.moduleType,
        dependencies: [task.id!]
      });
    }
  }

  private async verifyModuleCompletion(moduleType: ModuleType): Promise<void> {
    // Verification logic for module completion
    this.logger.info(`Verifying completion of module: ${moduleType}`);
    
    // Create verification task
    await this.createMigrationTask({
      type: TaskType.CODE_REVIEW,
      name: `${moduleType} Completion Verification`,
      description: `Verify that ${moduleType} module migration is complete and functional`,
      priority: TaskPriority.HIGH,
      migrationPhase: MigrationPhase.TESTING,
      moduleType
    });
  }

  private isModuleComplete(moduleType: ModuleType): boolean {
    const moduleTasks = this.orchestrator.getAllTasks()
      .filter(task => (task as FibreFlowTask).moduleType === moduleType);
    
    return moduleTasks.every(task => 
      task.status === TaskStatus.COMPLETED || task.status === TaskStatus.CANCELLED
    );
  }

  private getPhaseSpecificTasks(phase: MigrationPhase): Task[] {
    return this.orchestrator.getAllTasks()
      .filter(task => (task as FibreFlowTask).migrationPhase === phase);
  }

  private calculateAverageTaskTime(): number {
    const completedTasks = this.orchestrator.getAllTasks()
      .filter(task => task.status === TaskStatus.COMPLETED && task.actualDuration);
    
    if (completedTasks.length === 0) return 900000; // Default 15 minutes
    
    const totalTime = completedTasks.reduce((sum, task) => sum + (task.actualDuration || 0), 0);
    return totalTime / completedTasks.length;
  }

  private getRemainingTaskCount(): number {
    return this.orchestrator.getAllTasks()
      .filter(task => task.status === TaskStatus.PENDING || task.status === TaskStatus.IN_PROGRESS)
      .length;
  }

  private async handleTaskFailure(taskId: string, _error: any): Promise<void> {
    // Implement task failure recovery
    this.logger.warn(`Implementing failure recovery for task: ${taskId}`);
    
    // Could create a recovery task or retry the failed task
  }

  private async handleAgentFailure(agentId: string, _error: any): Promise<void> {
    // Implement agent failure recovery
    this.logger.warn(`Implementing failure recovery for agent: ${agentId}`);
    
    // Could restart the agent or redistribute its tasks
  }
}