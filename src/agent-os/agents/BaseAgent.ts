/**
 * Base Agent - Abstract base class for all specialized agents
 * Provides common functionality and interface for agent implementations
 */

import { EventEmitter } from 'events';
import { 
  AgentSpecification, 
  AgentInstance, 
  Task, 
  TaskStatus, 
  AgentStatus, 
  CoordinationMessage,
  MessageType,
  MessagePriority,
  TaskExecutionContext,
  AgentMetrics
} from '../types/agent.types';
import { Logger } from '../utils/logger';
import { MessageBroker } from '../core/MessageBroker';

export abstract class BaseAgent extends EventEmitter {
  protected specification: AgentSpecification;
  protected instance: AgentInstance;
  protected logger: Logger;
  protected messageBroker: MessageBroker | null = null;
  protected currentTasks: Map<string, TaskExecutionContext> = new Map();
  protected isRunning: boolean = false;
  protected heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(specification: AgentSpecification) {
    super();
    this.specification = specification;
    this.logger = new Logger(`Agent:${specification.type}`);
    
    // Initialize agent instance
    this.instance = {
      id: this.generateAgentId(),
      specification,
      status: AgentStatus.INITIALIZING,
      currentTasks: [],
      capabilities: specification.capabilities,
      metrics: this.initializeMetrics(),
      communicationProtocols: specification.communicationProtocols,
      lastHeartbeat: new Date()
    };
  }

  /**
   * Initialize the agent
   */
  async initialize(messageBroker: MessageBroker): Promise<void> {
    this.logger.info('Initializing agent...');
    
    try {
      this.messageBroker = messageBroker;
      
      // Subscribe to messages
      this.messageBroker.subscribe(this.instance.id, this.handleMessage.bind(this));
      
      // Perform agent-specific initialization
      await this.onInitialize();
      
      // Start heartbeat
      this.startHeartbeat();
      
      this.instance.status = AgentStatus.ACTIVE;
      this.isRunning = true;
      
      this.logger.info('Agent initialized successfully');
      this.emit('agent:initialized', { agentId: this.instance.id });
      
    } catch (error) {
      this.instance.status = AgentStatus.ERROR;
      this.logger.error('Failed to initialize agent:', error);
      throw error;
    }
  }

  /**
   * Execute a task
   */
  async executeTask(task: Task): Promise<any> {
    const executionContext: TaskExecutionContext = {
      taskId: task.id,
      agentId: this.instance.id,
      startTime: new Date(),
      parameters: task.parameters,
      resources: [], // TODO: Implement resource allocation
      environment: process.env as Record<string, string>
    };

    this.currentTasks.set(task.id, executionContext);
    this.instance.currentTasks.push(task.id);
    this.instance.status = AgentStatus.BUSY;
    this.instance.metrics.tasksInProgress++;

    this.logger.info(`Executing task: ${task.id} (${task.type})`);

    try {
      // Update task status
      task.status = TaskStatus.IN_PROGRESS;
      task.startedAt = new Date();
      
      // Execute the task using agent-specific logic
      const result = await this.executeTaskInternal(task, executionContext);
      
      // Mark task as completed
      task.status = TaskStatus.COMPLETED;
      task.completedAt = new Date();
      task.actualDuration = task.completedAt.getTime() - task.startedAt.getTime();
      task.result = result;

      // Update metrics
      this.updateTaskMetrics(task, true);
      
      this.logger.info(`Task completed: ${task.id}`);
      this.emit('task:completed', { taskId: task.id, result });

      return result;

    } catch (error) {
      // Mark task as failed
      task.status = TaskStatus.FAILED;
      task.error = error instanceof Error ? error.message : String(error);
      task.completedAt = new Date();
      task.actualDuration = task.completedAt ? task.completedAt.getTime() - task.startedAt!.getTime() : 0;

      // Update metrics
      this.updateTaskMetrics(task, false);
      
      this.logger.error(`Task failed: ${task.id}`, error);
      this.emit('task:failed', { taskId: task.id, error });

      throw error;

    } finally {
      // Clean up
      this.currentTasks.delete(task.id);
      this.instance.currentTasks = this.instance.currentTasks.filter(id => id !== task.id);
      this.instance.metrics.tasksInProgress--;
      
      // Update status
      if (this.instance.currentTasks.length === 0) {
        this.instance.status = AgentStatus.ACTIVE;
      }
    }
  }

  /**
   * Send a message to another agent
   */
  async sendMessage(toAgentId: string, messageType: MessageType, payload: any, priority: MessagePriority = MessagePriority.NORMAL): Promise<void> {
    if (!this.messageBroker) {
      throw new Error('Message broker not initialized');
    }

    const message: CoordinationMessage = {
      id: this.generateMessageId(),
      type: messageType,
      fromAgentId: this.instance.id,
      toAgentId,
      payload,
      timestamp: new Date(),
      priority
    };

    await this.messageBroker.sendMessage(this.instance.id, toAgentId, message);
    
    this.logger.debug(`Sent message to ${toAgentId}: ${messageType}`);
  }

  /**
   * Broadcast a message to all agents
   */
  async broadcastMessage(messageType: MessageType, payload: any, priority: MessagePriority = MessagePriority.NORMAL): Promise<void> {
    if (!this.messageBroker) {
      throw new Error('Message broker not initialized');
    }

    const message: CoordinationMessage = {
      id: this.generateMessageId(),
      type: messageType,
      fromAgentId: this.instance.id,
      payload,
      timestamp: new Date(),
      priority
    };

    await this.messageBroker.broadcastMessage(this.instance.id, message);
    
    this.logger.debug(`Broadcast message: ${messageType}`);
  }

  /**
   * Get current agent status
   */
  getStatus(): AgentInstance {
    this.instance.lastHeartbeat = new Date();
    return { ...this.instance };
  }

  /**
   * Check if agent can handle a specific task
   */
  canHandleTask(task: Task): boolean {
    // Check if agent has all required capabilities
    const hasCapabilities = task.requiredCapabilities.every(reqCap =>
      this.instance.capabilities.some(cap => cap.name === reqCap)
    );

    // Check if agent has capacity
    const hasCapacity = this.instance.currentTasks.length < this.specification.maxConcurrentTasks;

    // Check if agent is active
    const isActive = this.instance.status === AgentStatus.ACTIVE || this.instance.status === AgentStatus.IDLE;

    return hasCapabilities && hasCapacity && isActive;
  }

  /**
   * Stop the agent
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down agent...');
    
    this.isRunning = false;
    this.instance.status = AgentStatus.STOPPING;
    
    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Cancel current tasks
    for (const taskId of this.instance.currentTasks) {
      this.emit('task:cancelled', { taskId });
    }

    // Perform agent-specific cleanup
    await this.onShutdown();

    // Unsubscribe from messages
    if (this.messageBroker) {
      this.messageBroker.unregisterAgent(this.instance.id);
    }

    this.instance.status = AgentStatus.INACTIVE;
    this.currentTasks.clear();
    this.instance.currentTasks = [];

    this.logger.info('Agent shutdown complete');
    this.emit('agent:shutdown', { agentId: this.instance.id });
  }

  // Abstract methods that must be implemented by subclasses

  /**
   * Agent-specific initialization logic
   */
  protected abstract onInitialize(): Promise<void>;

  /**
   * Execute a task with agent-specific logic
   */
  protected abstract executeTaskInternal(task: Task, context: TaskExecutionContext): Promise<any>;

  /**
   * Agent-specific shutdown logic
   */
  protected abstract onShutdown(): Promise<void>;

  // Protected helper methods

  protected async handleMessage(message: CoordinationMessage): Promise<void> {
    this.logger.debug(`Received message: ${message.type} from ${message.fromAgentId}`);

    try {
      switch (message.type) {
        case 'TASK_REQUEST' as any:
          await this.handleTaskRequest(message);
          break;
        
        case 'COORDINATION_REQUEST' as any:
          await this.handleCoordinationRequest(message);
          break;
        
        case 'STATUS_UPDATE' as any:
          await this.handleStatusUpdate(message);
          break;
        
        case 'SHUTDOWN_SIGNAL' as any:
          await this.handleShutdownSignal(message);
          break;
        
        default:
          await this.handleCustomMessage(message);
      }

      // Acknowledge message receipt
      if (this.messageBroker) {
        this.messageBroker.acknowledgeMessage(this.instance.id, message.id);
      }

    } catch (error) {
      this.logger.error(`Failed to handle message ${message.id}:`, error instanceof Error ? error : new Error(String(error)));
    }
  }

  protected async handleTaskRequest(message: CoordinationMessage): Promise<void> {
    const task = message.payload as Task;
    
    if (this.canHandleTask(task)) {
      try {
        await this.executeTask(task);
        
        // Send response
        await this.sendMessage(
          message.fromAgentId,
          'TASK_RESPONSE' as any,
          { taskId: task.id, status: 'completed', result: task.result },
          MessagePriority.HIGH
        );
      } catch (error) {
        // Send error response
        await this.sendMessage(
          message.fromAgentId,
          'TASK_RESPONSE' as any,
          { taskId: task.id, status: 'failed', error: error instanceof Error ? error.message : String(error) },
          MessagePriority.HIGH
        );
      }
    } else {
      // Reject task
      await this.sendMessage(
        message.fromAgentId,
        'TASK_RESPONSE' as any,
        { taskId: task.id, status: 'rejected', reason: 'Cannot handle task' },
        MessagePriority.NORMAL
      );
    }
  }

  protected async handleCoordinationRequest(message: CoordinationMessage): Promise<void> {
    // Default coordination handling - can be overridden by subclasses
    this.logger.debug(`Handling coordination request: ${JSON.stringify(message.payload)}`);
  }

  protected async handleStatusUpdate(message: CoordinationMessage): Promise<void> {
    // Handle status updates from other agents
    this.logger.debug(`Received status update from ${message.fromAgentId}`);
  }

  protected async handleShutdownSignal(_message: CoordinationMessage): Promise<void> {
    this.logger.info('Received shutdown signal');
    await this.shutdown();
  }

  protected async handleCustomMessage(_message: CoordinationMessage): Promise<void> {
    // Override in subclasses to handle agent-specific messages
    this.logger.debug(`Unhandled message type: ${_message.type}`);
  }

  protected validateTaskParameters(task: Task, requiredParams: string[]): void {
    for (const param of requiredParams) {
      if (!(param in task.parameters)) {
        throw new Error(`Missing required parameter: ${param}`);
      }
    }
  }

  protected reportProgress(taskId: string, progress: number, message?: string): void {
    this.emit('task:progress', {
      taskId,
      agentId: this.instance.id,
      progress: Math.min(Math.max(progress, 0), 100),
      message
    });
  }

  private initializeMetrics(): AgentMetrics {
    return {
      tasksCompleted: 0,
      tasksInProgress: 0,
      averageTaskTime: 0,
      successRate: 100,
      lastActive: new Date(),
      totalUptime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      errorCount: 0,
      warningCount: 0
    };
  }

  private updateTaskMetrics(task: Task, success: boolean): void {
    if (success) {
      this.instance.metrics.tasksCompleted++;
    } else {
      this.instance.metrics.errorCount = (this.instance.metrics.errorCount || 0) + 1;
    }

    // Update average task time
    if (task.actualDuration) {
      const totalTime = this.instance.metrics.averageTaskTime * this.instance.metrics.tasksCompleted + task.actualDuration;
      this.instance.metrics.averageTaskTime = totalTime / (this.instance.metrics.tasksCompleted + 1);
    }

    // Update success rate
    const totalTasks = this.instance.metrics.tasksCompleted + (this.instance.metrics.errorCount || 0);
    this.instance.metrics.successRate = totalTasks > 0 ? 
      (this.instance.metrics.tasksCompleted / totalTasks) * 100 : 100;

    this.instance.metrics.lastActive = new Date();
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.instance.lastHeartbeat = new Date();
      this.emit('agent:heartbeat', { agentId: this.instance.id });
    }, 30000); // Every 30 seconds
  }

  private generateAgentId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${this.specification.type.toLowerCase()}-${timestamp}-${random}`;
  }

  private generateMessageId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `msg-${this.instance.id}-${timestamp}-${random}`;
  }
}