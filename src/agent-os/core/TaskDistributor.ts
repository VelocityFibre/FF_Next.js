/**
 * Task Distributor - Intelligent task assignment and load balancing
 * Distributes tasks to appropriate agents based on capabilities and current load
 */

import { Task, AgentInstance, TaskStatus, TaskPriority, AgentStatus } from '../types/agent.types';
import { Logger } from '../utils/logger';
import { AgentOrchestrator } from './AgentOrchestrator';

interface TaskAssignment {
  taskId: string;
  agentId: string;
  assignedAt: Date;
  estimatedCompletion: Date;
}

interface AgentLoadInfo {
  agentId: string;
  currentLoad: number; // 0-1
  availableCapacity: number;
  activeTasks: number;
  averageTaskTime: number;
  successRate: number;
  specializations: string[];
}

export class TaskDistributor {
  private orchestrator: AgentOrchestrator;
  private assignments: Map<string, TaskAssignment> = new Map();
  private logger: Logger;
  private distributionStrategy: DistributionStrategy = DistributionStrategy.CAPABILITY_BASED;

  constructor(orchestrator: AgentOrchestrator) {
    this.orchestrator = orchestrator;
    this.logger = new Logger('TaskDistributor');
  }

  /**
   * Distribute a task to the most appropriate agent
   */
  async distributeTask(task: Task): Promise<string> {
    this.logger.info(`Distributing task: ${task.id} (${task.type})`);

    try {
      const candidateAgents = await this.findCandidateAgents(task);
      
      if (candidateAgents.length === 0) {
        throw new Error(`No suitable agents found for task: ${task.id}`);
      }

      const selectedAgent = await this.selectBestAgent(task, candidateAgents);
      
      await this.assignTaskToAgent(task, selectedAgent);

      return selectedAgent.id;

    } catch (error) {
      this.logger.error(`Failed to distribute task ${task.id}:`, error);
      throw error;
    }
  }

  /**
   * Reassign a task to a different agent
   */
  async reassignTask(taskId: string, reason: string): Promise<void> {
    this.logger.info(`Reassigning task: ${taskId}, reason: ${reason}`);

    const assignment = this.assignments.get(taskId);
    if (!assignment) {
      throw new Error(`Task assignment not found: ${taskId}`);
    }

    const task = this.orchestrator.getTaskStatus(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    // Remove current assignment
    this.assignments.delete(taskId);
    
    // Update task status
    task.status = TaskStatus.PENDING;
    if ('assignedAgentId' in task) {
      delete (task as any).assignedAgentId;
    }

    // Redistribute the task
    await this.distributeTask(task);
  }

  /**
   * Get current task assignments
   */
  getAssignments(): TaskAssignment[] {
    return Array.from(this.assignments.values());
  }

  /**
   * Get agent load information
   */
  getAgentLoad(agentId: string): AgentLoadInfo | null {
    const agent = this.orchestrator.getAgentStatus(agentId);
    if (!agent) return null;

    return this.calculateAgentLoad(agent);
  }

  /**
   * Get system load distribution
   */
  getSystemLoad(): {
    totalTasks: number;
    activeTasks: number;
    averageLoad: number;
    agentLoads: AgentLoadInfo[];
    bottlenecks: string[];
  } {
    const agents = this.orchestrator.getAllAgentsStatus();
    const agentLoads = agents.map(agent => this.calculateAgentLoad(agent));
    
    const activeTasks = Array.from(this.assignments.values()).length;
    const totalTasks = this.orchestrator.getAllTasks().length;
    const averageLoad = agentLoads.reduce((sum, load) => sum + load.currentLoad, 0) / agentLoads.length;
    
    const bottlenecks = agentLoads
      .filter(load => load.currentLoad > 0.8)
      .map(load => load.agentId);

    return {
      totalTasks,
      activeTasks,
      averageLoad,
      agentLoads,
      bottlenecks
    };
  }

  /**
   * Balance load across agents by reassigning tasks
   */
  async balanceLoad(): Promise<void> {
    this.logger.info('Starting load balancing...');

    const systemLoad = this.getSystemLoad();
    
    if (systemLoad.bottlenecks.length === 0) {
      this.logger.debug('No bottlenecks detected, load balancing not needed');
      return;
    }

    // Find overloaded agents
    const overloadedAgents = systemLoad.agentLoads
      .filter(load => load.currentLoad > 0.8)
      .sort((a, b) => b.currentLoad - a.currentLoad);

    // Find underloaded agents
    const underloadedAgents = systemLoad.agentLoads
      .filter(load => load.currentLoad < 0.6 && load.availableCapacity > 0)
      .sort((a, b) => a.currentLoad - b.currentLoad);

    if (underloadedAgents.length === 0) {
      this.logger.warn('No underloaded agents available for load balancing');
      return;
    }

    // Reassign tasks from overloaded to underloaded agents
    for (const overloadedAgent of overloadedAgents) {
      const tasksToReassign = this.findReassignableTasks(overloadedAgent.agentId);
      
      for (const task of tasksToReassign) {
        const suitableAgent = underloadedAgents.find(agent => 
          this.canAgentHandleTask(agent, task)
        );

        if (suitableAgent) {
          await this.reassignTask(task.id, 'Load balancing');
          this.logger.info(`Reassigned task ${task.id} from ${overloadedAgent.agentId} to ${suitableAgent.agentId}`);
          break; // Only reassign one task at a time per agent
        }
      }
    }

    this.logger.info('Load balancing completed');
  }

  // Private methods

  private async findCandidateAgents(task: Task): Promise<AgentInstance[]> {
    const allAgents = this.orchestrator.getAllAgentsStatus();
    
    const candidates = allAgents.filter(agent => {
      // Check if agent is active and not overloaded
      if (agent.status !== AgentStatus.ACTIVE && agent.status !== AgentStatus.IDLE) {
        return false;
      }

      // Check if agent has required capabilities
      const hasCapabilities = task.requiredCapabilities.every(reqCap =>
        agent.capabilities.some(cap => cap.name === reqCap)
      );

      if (!hasCapabilities) {
        return false;
      }

      // Check if agent has capacity
      const load = this.calculateAgentLoad(agent);
      if (load.availableCapacity <= 0) {
        return false;
      }

      return true;
    });

    this.logger.debug(`Found ${candidates.length} candidate agents for task ${task.id}`);
    return candidates;
  }

  private async selectBestAgent(task: Task, candidates: AgentInstance[]): Promise<AgentInstance> {
    switch (this.distributionStrategy) {
      case DistributionStrategy.ROUND_ROBIN:
        return this.selectAgentRoundRobin(candidates);
      
      case DistributionStrategy.LEAST_LOADED:
        return this.selectLeastLoadedAgent(candidates);
      
      case DistributionStrategy.CAPABILITY_BASED:
        return this.selectBestCapabilityMatch(task, candidates);
      
      case DistributionStrategy.PERFORMANCE_BASED:
        return this.selectHighestPerformingAgent(candidates);
      
      default:
        return candidates[0];
    }
  }

  private selectAgentRoundRobin(candidates: AgentInstance[]): AgentInstance {
    // Simple round-robin selection
    const timestamp = Date.now();
    const index = timestamp % candidates.length;
    return candidates[index];
  }

  private selectLeastLoadedAgent(candidates: AgentInstance[]): AgentInstance {
    return candidates.reduce((least, current) => {
      const leastLoad = this.calculateAgentLoad(least);
      const currentLoad = this.calculateAgentLoad(current);
      
      return currentLoad.currentLoad < leastLoad.currentLoad ? current : least;
    });
  }

  private selectBestCapabilityMatch(task: Task, candidates: AgentInstance[]): AgentInstance {
    // Score agents based on how well their capabilities match the task
    const scoredCandidates = candidates.map(agent => {
      let score = 0;
      
      // Check capability matches
      for (const reqCap of task.requiredCapabilities) {
        const capability = agent.capabilities.find(cap => cap.name === reqCap);
        if (capability) {
          score += capability.reliability * 100;
          
          // Bonus for faster execution
          if (capability.executionTime < task.estimatedDuration) {
            score += 20;
          }
        }
      }

      // Consider agent load (prefer less loaded agents)
      const load = this.calculateAgentLoad(agent);
      score += (1 - load.currentLoad) * 50;

      // Consider success rate
      score += agent.metrics.successRate;

      return { agent, score };
    });

    scoredCandidates.sort((a, b) => b.score - a.score);
    
    this.logger.debug(`Best capability match: ${scoredCandidates[0].agent.id} (score: ${scoredCandidates[0].score})`);
    return scoredCandidates[0].agent;
  }

  private selectHighestPerformingAgent(candidates: AgentInstance[]): AgentInstance {
    return candidates.reduce((best, current) => {
      const bestPerformance = best.metrics.successRate * (1 - this.calculateAgentLoad(best).currentLoad);
      const currentPerformance = current.metrics.successRate * (1 - this.calculateAgentLoad(current).currentLoad);
      
      return currentPerformance > bestPerformance ? current : best;
    });
  }

  private async assignTaskToAgent(task: Task, agent: AgentInstance): Promise<void> {
    // Update task
    task.assignedAgentId = agent.id;
    task.status = TaskStatus.QUEUED;
    task.updatedAt = new Date();

    // Update agent
    agent.currentTasks.push(task.id);
    agent.metrics.tasksInProgress++;

    // Create assignment record
    const assignment: TaskAssignment = {
      taskId: task.id,
      agentId: agent.id,
      assignedAt: new Date(),
      estimatedCompletion: new Date(Date.now() + task.estimatedDuration)
    };

    this.assignments.set(task.id, assignment);

    this.logger.info(`Assigned task ${task.id} to agent ${agent.id}`);
    
    // Notify the agent about the new task
    await this.notifyAgentOfAssignment(agent.id, task);
  }

  private async notifyAgentOfAssignment(agentId: string, task: Task): Promise<void> {
    // Send message to agent about task assignment
    await this.orchestrator.sendMessage('TASK_DISTRIBUTOR', agentId, {
      id: `task-assignment-${task.id}`,
      type: 'TASK_REQUEST' as any,
      fromAgentId: 'TASK_DISTRIBUTOR',
      toAgentId: agentId,
      payload: task,
      timestamp: new Date(),
      priority: task.priority === TaskPriority.CRITICAL ? 5 : 3
    });
  }

  private calculateAgentLoad(agent: AgentInstance): AgentLoadInfo {
    const maxConcurrentTasks = agent.specification.maxConcurrentTasks;
    const currentLoad = agent.currentTasks.length / maxConcurrentTasks;
    const availableCapacity = maxConcurrentTasks - agent.currentTasks.length;

    return {
      agentId: agent.id,
      currentLoad: Math.min(currentLoad, 1),
      availableCapacity: Math.max(availableCapacity, 0),
      activeTasks: agent.currentTasks.length,
      averageTaskTime: agent.metrics.averageTaskTime,
      successRate: agent.metrics.successRate,
      specializations: agent.capabilities.map(cap => cap.name)
    };
  }

  private findReassignableTasks(agentId: string): Task[] {
    const agent = this.orchestrator.getAgentStatus(agentId);
    if (!agent) return [];

    return agent.currentTasks
      .map(taskId => this.orchestrator.getTaskStatus(taskId))
      .filter((task): task is Task => {
        return task !== null && 
               task.status === TaskStatus.QUEUED && 
               task.priority !== TaskPriority.CRITICAL;
      });
  }

  private canAgentHandleTask(agentLoad: AgentLoadInfo, task: Task): boolean {
    // Check if agent has available capacity
    if (agentLoad.availableCapacity <= 0) {
      return false;
    }

    // Check if agent has required capabilities
    const hasCapabilities = task.requiredCapabilities.every(reqCap =>
      agentLoad.specializations.includes(reqCap)
    );

    return hasCapabilities;
  }
}

enum DistributionStrategy {
  ROUND_ROBIN = 'ROUND_ROBIN',
  LEAST_LOADED = 'LEAST_LOADED',
  CAPABILITY_BASED = 'CAPABILITY_BASED',
  PERFORMANCE_BASED = 'PERFORMANCE_BASED'
}