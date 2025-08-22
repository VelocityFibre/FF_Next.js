/**
 * Agent OS - Core Orchestration System
 * Manages multi-agent coordination, task distribution, and system monitoring
 */

import { EventEmitter } from 'events';
import { AgentSpecification, AgentInstance, Task, TaskStatus, AgentStatus, CoordinationMessage } from '../types/agent.types';
import { Logger } from '../utils/logger';
import { MessageBroker } from './MessageBroker';
import { TaskDistributor } from './TaskDistributor';
import { HealthMonitor } from './HealthMonitor';
import { PerformanceTracker } from './PerformanceTracker';

export class AgentOrchestrator extends EventEmitter {
  private agents: Map<string, AgentInstance> = new Map();
  private tasks: Map<string, Task> = new Map();
  private agentSpecs: Map<string, AgentSpecification> = new Map();
  private messageBroker: MessageBroker;
  private taskDistributor: TaskDistributor;
  private healthMonitor: HealthMonitor;
  private performanceTracker: PerformanceTracker;
  private logger: Logger;
  private isRunning: boolean = false;

  constructor() {
    super();
    this.logger = new Logger('AgentOrchestrator');
    this.messageBroker = new MessageBroker();
    this.taskDistributor = new TaskDistributor(this);
    this.healthMonitor = new HealthMonitor(this);
    this.performanceTracker = new PerformanceTracker();

    this.initializeEventHandlers();
  }

  /**
   * Initialize the Agent OS system
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing Agent OS...');

    try {
      // Load agent specifications
      await this.loadAgentSpecifications();

      // Initialize core services
      await this.messageBroker.initialize();
      await this.healthMonitor.initialize();
      await this.performanceTracker.initialize();

      // Register specialized agents
      await this.registerSpecializedAgents();

      this.isRunning = true;
      this.logger.info('Agent OS initialized successfully');
      this.emit('system:initialized');

    } catch (error) {
      this.logger.error('Failed to initialize Agent OS:', error);
      throw error;
    }
  }

  /**
   * Register a new agent instance
   */
  async registerAgent(spec: AgentSpecification): Promise<string> {
    const agentId = this.generateAgentId(spec.type);
    
    const agent: AgentInstance = {
      id: agentId,
      specification: spec,
      status: AgentStatus.INITIALIZING,
      currentTasks: [],
      capabilities: spec.capabilities,
      metrics: {
        tasksCompleted: 0,
        tasksInProgress: 0,
        averageTaskTime: 0,
        successRate: 100,
        lastActive: new Date(),
        totalUptime: 0,
        memoryUsage: 0,
        cpuUsage: 0
      },
      communicationProtocols: spec.communicationProtocols,
      lastHeartbeat: new Date()
    };

    this.agents.set(agentId, agent);
    this.agentSpecs.set(spec.type, spec);

    this.logger.info(`Registered agent: ${agentId} (${spec.type})`);
    this.emit('agent:registered', { agentId, agent });

    // Initialize the agent
    await this.initializeAgent(agentId);

    return agentId;
  }

  /**
   * Create and distribute a new task
   */
  async createTask(taskData: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const taskId = this.generateTaskId();
    
    const task: Task = {
      id: taskId,
      ...taskData,
      status: TaskStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.set(taskId, task);
    this.logger.info(`Created task: ${taskId} (${task.type})`);

    // Distribute task to appropriate agent
    await this.taskDistributor.distributeTask(task);

    this.emit('task:created', { taskId, task });
    return taskId;
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: TaskStatus, result?: any): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const previousStatus = task.status;
    task.status = status;
    task.updatedAt = new Date();

    if (result) {
      task.result = result;
    }

    if (status === TaskStatus.COMPLETED) {
      task.completedAt = new Date();
      await this.performanceTracker.recordTaskCompletion(task);
    }

    this.logger.info(`Task ${taskId} status updated: ${previousStatus} -> ${status}`);
    this.emit('task:updated', { taskId, task, previousStatus });
  }

  /**
   * Get system status
   */
  getSystemStatus(): {
    isRunning: boolean;
    totalAgents: number;
    activeAgents: number;
    totalTasks: number;
    activeTasks: number;
    completedTasks: number;
    systemMetrics: any;
  } {
    const activeAgents = Array.from(this.agents.values()).filter(
      agent => agent.status === AgentStatus.ACTIVE || agent.status === AgentStatus.BUSY
    );

    const activeTasks = Array.from(this.tasks.values()).filter(
      task => task.status === TaskStatus.IN_PROGRESS
    );

    const completedTasks = Array.from(this.tasks.values()).filter(
      task => task.status === TaskStatus.COMPLETED
    );

    return {
      isRunning: this.isRunning,
      totalAgents: this.agents.size,
      activeAgents: activeAgents.length,
      totalTasks: this.tasks.size,
      activeTasks: activeTasks.length,
      completedTasks: completedTasks.length,
      systemMetrics: {} // this.performanceTracker.getSystemMetrics() - TODO: implement
    };
  }

  /**
   * Get agent status
   */
  getAgentStatus(agentId: string): AgentInstance | null {
    return this.agents.get(agentId) || null;
  }

  /**
   * Get all agents status
   */
  getAllAgentsStatus(): AgentInstance[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId: string): Task | null {
    return this.tasks.get(taskId) || null;
  }

  /**
   * Get all tasks
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Send message between agents
   */
  async sendMessage(fromAgentId: string, toAgentId: string, message: CoordinationMessage): Promise<void> {
    await this.messageBroker.sendMessage(fromAgentId, toAgentId, message);
  }

  /**
   * Broadcast message to all agents
   */
  async broadcastMessage(fromAgentId: string, message: CoordinationMessage): Promise<void> {
    await this.messageBroker.broadcastMessage(fromAgentId, message);
  }

  /**
   * Shutdown the Agent OS system
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Agent OS...');
    
    this.isRunning = false;

    // Stop all agents
    for (const agent of this.agents.values()) {
      await this.stopAgent(agent.id);
    }

    // Cleanup services
    await this.healthMonitor.shutdown();
    await this.performanceTracker.shutdown();
    await this.messageBroker.shutdown();

    this.logger.info('Agent OS shutdown complete');
    this.emit('system:shutdown');
  }

  // Private methods

  private async loadAgentSpecifications(): Promise<void> {
    // Load FibreFlow-specific agent specifications
    const specs = await import('../specifications/fibreflow-agents');
    
    for (const spec of specs.AGENT_SPECIFICATIONS) {
      this.agentSpecs.set(spec.type, spec);
    }
  }

  private async registerSpecializedAgents(): Promise<void> {
    const specs = Array.from(this.agentSpecs.values());
    
    for (const spec of specs) {
      if (spec.autoStart) {
        await this.registerAgent(spec);
      }
    }
  }

  private async initializeAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    try {
      agent.status = AgentStatus.ACTIVE;
      agent.lastHeartbeat = new Date();
      
      this.logger.info(`Initialized agent: ${agentId}`);
      this.emit('agent:initialized', { agentId, agent });

    } catch (error) {
      agent.status = AgentStatus.ERROR;
      this.logger.error(`Failed to initialize agent ${agentId}:`, error);
      this.emit('agent:error', { agentId, error });
    }
  }

  private async stopAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    agent.status = AgentStatus.STOPPING;
    
    // Cancel current tasks
    for (const taskId of agent.currentTasks) {
      await this.updateTaskStatus(taskId, TaskStatus.CANCELLED);
    }

    agent.status = AgentStatus.INACTIVE;
    agent.currentTasks = [];

    this.logger.info(`Stopped agent: ${agentId}`);
    this.emit('agent:stopped', { agentId, agent });
  }

  private generateAgentId(type: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${type}-${timestamp}-${random}`;
  }

  private generateTaskId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `task-${timestamp}-${random}`;
  }

  private initializeEventHandlers(): void {
    this.on('agent:heartbeat', this.handleAgentHeartbeat.bind(this));
    this.on('task:completed', this.handleTaskCompleted.bind(this));
    this.on('task:failed', this.handleTaskFailed.bind(this));
  }

  private handleAgentHeartbeat({ agentId }: { agentId: string }): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.lastHeartbeat = new Date();
    }
  }

  private async handleTaskCompleted({ taskId, result }: { taskId: string; result: any }): Promise<void> {
    await this.updateTaskStatus(taskId, TaskStatus.COMPLETED, result);
  }

  private async handleTaskFailed({ taskId, error }: { taskId: string; error: any }): Promise<void> {
    await this.updateTaskStatus(taskId, TaskStatus.FAILED, { error: error.message });
  }
}