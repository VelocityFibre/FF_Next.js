/**
 * Performance Tracker - Monitors and analyzes agent and system performance
 * Provides metrics, trends, and optimization recommendations
 */

import { EventEmitter } from 'events';
import { Task, AgentInstance, TaskStatus, AgentMetrics } from '../types/agent.types';
import { Logger } from '../utils/logger';

interface PerformanceSnapshot {
  timestamp: Date;
  systemMetrics: SystemMetrics;
  agentMetrics: Map<string, AgentMetrics>;
  taskMetrics: TaskMetrics;
}

interface SystemMetrics {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageTaskDuration: number;
  systemThroughput: number; // tasks per minute
  resourceUtilization: ResourceMetrics;
  errorRate: number;
}

interface ResourceMetrics {
  totalCpuUsage: number;
  totalMemoryUsage: number;
  averageCpuPerAgent: number;
  averageMemoryPerAgent: number;
  peakCpuUsage: number;
  peakMemoryUsage: number;
}

interface TaskMetrics {
  byType: Map<string, TaskTypeMetrics>;
  byPriority: Map<string, TaskPriorityMetrics>;
  byAgent: Map<string, AgentTaskMetrics>;
}

interface TaskTypeMetrics {
  count: number;
  averageDuration: number;
  successRate: number;
  averageRetries: number;
}

interface TaskPriorityMetrics {
  count: number;
  averageWaitTime: number;
  averageExecutionTime: number;
  completionRate: number;
}

interface AgentTaskMetrics {
  tasksAssigned: number;
  tasksCompleted: number;
  averageTaskTime: number;
  successRate: number;
  specializations: string[];
}

interface PerformanceTrend {
  metric: string;
  values: { timestamp: Date; value: number }[];
  trend: 'IMPROVING' | 'DEGRADING' | 'STABLE';
  changeRate: number; // percentage change per hour
}

export class PerformanceTracker extends EventEmitter {
  private logger: Logger;
  private snapshots: PerformanceSnapshot[] = [];
  private maxSnapshots: number = 1000; // Keep last 1000 snapshots
  private trackingInterval: NodeJS.Timeout | null = null;
  // private isTracking: boolean = false;
  private performanceAlerts: Map<string, PerformanceAlert> = new Map();

  constructor() {
    super();
    this.logger = new Logger('PerformanceTracker');
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing Performance Tracker...');
    
    // this.isTracking = true;
    this.startPerformanceTracking();
    
    this.logger.info('Performance Tracker initialized');
  }

  /**
   * Record task completion for performance analysis
   */
  async recordTaskCompletion(task: Task): Promise<void> {
    const duration = task.completedAt && task.startedAt ? 
      task.completedAt.getTime() - task.startedAt.getTime() : 0;

    this.logger.debug(`Recording task completion: ${task.id}, duration: ${duration}ms`);
    
    // Emit performance event for real-time monitoring
    this.emit('performance:task_completed', {
      taskId: task.id,
      type: task.type,
      duration,
      success: task.status === TaskStatus.COMPLETED,
      agentId: task.assignedAgentId
    });
  }

  /**
   * Take a performance snapshot of the current system state
   */
  takeSnapshot(agents: AgentInstance[], tasks: Task[]): PerformanceSnapshot {
    const timestamp = new Date();
    
    const systemMetrics = this.calculateSystemMetrics(agents, tasks);
    const agentMetrics = this.calculateAgentMetrics(agents);
    const taskMetrics = this.calculateTaskMetrics(tasks);

    const snapshot: PerformanceSnapshot = {
      timestamp,
      systemMetrics,
      agentMetrics,
      taskMetrics
    };

    this.snapshots.push(snapshot);
    
    // Maintain snapshot limit
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    this.analyzePerformanceTrends();
    
    this.emit('performance:snapshot_taken', snapshot);
    
    return snapshot;
  }

  /**
   * Get current system performance metrics
   */
  getCurrentMetrics(): SystemMetrics | null {
    const latestSnapshot = this.getLatestSnapshot();
    return latestSnapshot?.systemMetrics || null;
  }

  /**
   * Get performance trends for specified metrics
   */
  getPerformanceTrends(timeWindow: number = 3600000): PerformanceTrend[] {
    const cutoffTime = new Date(Date.now() - timeWindow);
    const relevantSnapshots = this.snapshots.filter(s => s.timestamp >= cutoffTime);
    
    if (relevantSnapshots.length < 2) {
      return [];
    }

    const trends: PerformanceTrend[] = [];

    // Analyze system throughput trend
    const throughputTrend = this.calculateMetricTrend(
      'systemThroughput',
      relevantSnapshots.map(s => ({
        timestamp: s.timestamp,
        value: s.systemMetrics.systemThroughput
      }))
    );
    trends.push(throughputTrend);

    // Analyze error rate trend
    const errorRateTrend = this.calculateMetricTrend(
      'errorRate',
      relevantSnapshots.map(s => ({
        timestamp: s.timestamp,
        value: s.systemMetrics.errorRate
      }))
    );
    trends.push(errorRateTrend);

    // Analyze average task duration trend
    const taskDurationTrend = this.calculateMetricTrend(
      'averageTaskDuration',
      relevantSnapshots.map(s => ({
        timestamp: s.timestamp,
        value: s.systemMetrics.averageTaskDuration
      }))
    );
    trends.push(taskDurationTrend);

    return trends;
  }

  /**
   * Get agent performance comparison
   */
  getAgentPerformanceComparison(): Array<{
    agentId: string;
    metrics: AgentMetrics;
    ranking: number;
    performanceScore: number;
  }> {
    const latestSnapshot = this.getLatestSnapshot();
    if (!latestSnapshot) return [];

    const agentPerformances = Array.from(latestSnapshot.agentMetrics.entries()).map(([agentId, metrics]) => {
      // Calculate performance score based on multiple factors
      const performanceScore = this.calculateAgentPerformanceScore(metrics);
      
      return {
        agentId,
        metrics,
        performanceScore,
        ranking: 0 // Will be set after sorting
      };
    });

    // Sort by performance score and assign rankings
    agentPerformances.sort((a, b) => b.performanceScore - a.performanceScore);
    agentPerformances.forEach((agent, index) => {
      agent.ranking = index + 1;
    });

    return agentPerformances;
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): Array<{
    type: 'PERFORMANCE' | 'RESOURCE' | 'LOAD_BALANCING' | 'CAPACITY';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    impact: string;
    action: string;
  }> {
    const recommendations: any[] = [];
    const latestSnapshot = this.getLatestSnapshot();
    const trends = this.getPerformanceTrends();

    if (!latestSnapshot) return recommendations;

    // Check for high error rates
    if (latestSnapshot.systemMetrics.errorRate > 5) {
      recommendations.push({
        type: 'PERFORMANCE',
        priority: 'HIGH',
        description: `System error rate is ${latestSnapshot.systemMetrics.errorRate.toFixed(1)}%`,
        impact: 'Reducing reliability and user experience',
        action: 'Investigate failing tasks and improve error handling'
      });
    }

    // Check for resource utilization issues
    if (latestSnapshot.systemMetrics.resourceUtilization.averageCpuPerAgent > 80) {
      recommendations.push({
        type: 'RESOURCE',
        priority: 'HIGH',
        description: 'High CPU utilization across agents',
        impact: 'System performance degradation',
        action: 'Consider adding more agent instances or optimizing algorithms'
      });
    }

    // Check for throughput degradation
    const throughputTrend = trends.find(t => t.metric === 'systemThroughput');
    if (throughputTrend && throughputTrend.trend === 'DEGRADING') {
      recommendations.push({
        type: 'PERFORMANCE',
        priority: 'MEDIUM',
        description: 'System throughput is declining',
        impact: 'Slower task completion times',
        action: 'Review task distribution and agent load balancing'
      });
    }

    // Check for load imbalance
    const agentPerformances = this.getAgentPerformanceComparison();
    if (agentPerformances.length > 1) {
      const topPerformer = agentPerformances[0];
      const bottomPerformer = agentPerformances[agentPerformances.length - 1];
      
      if (topPerformer.performanceScore / bottomPerformer.performanceScore > 2) {
        recommendations.push({
          type: 'LOAD_BALANCING',
          priority: 'MEDIUM',
          description: 'Significant performance imbalance between agents',
          impact: 'Inefficient resource utilization',
          action: 'Redistribute tasks and review agent capabilities'
        });
      }
    }

    return recommendations;
  }

  /**
   * Get performance alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return Array.from(this.performanceAlerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Shutdown the performance tracker
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Performance Tracker...');
    
    // this.isTracking = false;
    
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    // Clear data
    this.snapshots = [];
    this.performanceAlerts.clear();
    
    this.logger.info('Performance Tracker shutdown complete');
  }

  // Private methods

  private startPerformanceTracking(): void {
    // Take snapshots every 30 seconds
    this.trackingInterval = setInterval(() => {
      // Note: In a real implementation, we'd get current agents and tasks from the orchestrator
      // For now, this is a placeholder
      this.logger.debug('Performance tracking tick');
    }, 30000);
  }

  private calculateSystemMetrics(agents: AgentInstance[], tasks: Task[]): SystemMetrics {
    const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);
    const failedTasks = tasks.filter(t => t.status === TaskStatus.FAILED);
    const activeTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS);

    const averageTaskDuration = completedTasks.length > 0 ?
      completedTasks.reduce((sum, task) => {
        const duration = task.actualDuration || 0;
        return sum + duration;
      }, 0) / completedTasks.length : 0;

    const systemThroughput = completedTasks.length > 0 ?
      (completedTasks.length / (Date.now() - Math.min(...completedTasks.map(t => t.createdAt.getTime())))) * 60000 : 0;

    const errorRate = tasks.length > 0 ?
      (failedTasks.length / tasks.length) * 100 : 0;

    const resourceUtilization = this.calculateResourceMetrics(agents);

    return {
      totalTasks: tasks.length,
      activeTasks: activeTasks.length,
      completedTasks: completedTasks.length,
      failedTasks: failedTasks.length,
      averageTaskDuration,
      systemThroughput,
      resourceUtilization,
      errorRate
    };
  }

  private calculateResourceMetrics(agents: AgentInstance[]): ResourceMetrics {
    if (agents.length === 0) {
      return {
        totalCpuUsage: 0,
        totalMemoryUsage: 0,
        averageCpuPerAgent: 0,
        averageMemoryPerAgent: 0,
        peakCpuUsage: 0,
        peakMemoryUsage: 0
      };
    }

    const cpuUsages = agents.map(a => a.metrics.cpuUsage);
    const memoryUsages = agents.map(a => a.metrics.memoryUsage);

    return {
      totalCpuUsage: cpuUsages.reduce((sum, cpu) => sum + cpu, 0),
      totalMemoryUsage: memoryUsages.reduce((sum, mem) => sum + mem, 0),
      averageCpuPerAgent: cpuUsages.reduce((sum, cpu) => sum + cpu, 0) / agents.length,
      averageMemoryPerAgent: memoryUsages.reduce((sum, mem) => sum + mem, 0) / agents.length,
      peakCpuUsage: Math.max(...cpuUsages),
      peakMemoryUsage: Math.max(...memoryUsages)
    };
  }

  private calculateAgentMetrics(agents: AgentInstance[]): Map<string, AgentMetrics> {
    const agentMetrics = new Map<string, AgentMetrics>();
    
    for (const agent of agents) {
      agentMetrics.set(agent.id, { ...agent.metrics });
    }
    
    return agentMetrics;
  }

  private calculateTaskMetrics(tasks: Task[]): TaskMetrics {
    const byType = new Map<string, TaskTypeMetrics>();
    const byPriority = new Map<string, TaskPriorityMetrics>();
    const byAgent = new Map<string, AgentTaskMetrics>();

    // Initialize maps
    for (const task of tasks) {
      // By type
      if (!byType.has(task.type)) {
        byType.set(task.type, {
          count: 0,
          averageDuration: 0,
          successRate: 0,
          averageRetries: 0
        });
      }

      // By priority
      const priorityKey = task.priority.toString();
      if (!byPriority.has(priorityKey)) {
        byPriority.set(priorityKey, {
          count: 0,
          averageWaitTime: 0,
          averageExecutionTime: 0,
          completionRate: 0
        });
      }

      // By agent
      if (task.assignedAgentId && !byAgent.has(task.assignedAgentId)) {
        byAgent.set(task.assignedAgentId, {
          tasksAssigned: 0,
          tasksCompleted: 0,
          averageTaskTime: 0,
          successRate: 0,
          specializations: []
        });
      }
    }

    // Calculate metrics
    this.populateTaskMetrics(tasks, byType, byPriority, byAgent);

    return { byType, byPriority, byAgent };
  }

  private populateTaskMetrics(
    tasks: Task[],
    byType: Map<string, TaskTypeMetrics>,
    byPriority: Map<string, TaskPriorityMetrics>,
    byAgent: Map<string, AgentTaskMetrics>
  ): void {
    // Implementation would populate the metrics maps
    // This is a simplified version
    for (const task of tasks) {
      // Update type metrics
      const typeMetrics = byType.get(task.type)!;
      typeMetrics.count++;

      // Update priority metrics  
      const priorityMetrics = byPriority.get(task.priority.toString())!;
      priorityMetrics.count++;

      // Update agent metrics
      if (task.assignedAgentId) {
        const agentMetrics = byAgent.get(task.assignedAgentId)!;
        agentMetrics.tasksAssigned++;
        if (task.status === TaskStatus.COMPLETED) {
          agentMetrics.tasksCompleted++;
        }
      }
    }
  }

  private calculateMetricTrend(
    metricName: string,
    values: { timestamp: Date; value: number }[]
  ): PerformanceTrend {
    if (values.length < 2) {
      return {
        metric: metricName,
        values,
        trend: 'STABLE',
        changeRate: 0
      };
    }

    // Simple linear regression to determine trend
    // const n = values.length;
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    
    const timespan = lastValue.timestamp.getTime() - firstValue.timestamp.getTime();
    const valueChange = lastValue.value - firstValue.value;
    const changeRate = timespan > 0 ? (valueChange / firstValue.value) * (3600000 / timespan) * 100 : 0;

    let trend: 'IMPROVING' | 'DEGRADING' | 'STABLE';
    if (Math.abs(changeRate) < 5) {
      trend = 'STABLE';
    } else if (changeRate > 0) {
      trend = metricName === 'errorRate' ? 'DEGRADING' : 'IMPROVING';
    } else {
      trend = metricName === 'errorRate' ? 'IMPROVING' : 'DEGRADING';
    }

    return {
      metric: metricName,
      values,
      trend,
      changeRate
    };
  }

  private calculateAgentPerformanceScore(metrics: AgentMetrics): number {
    // Weighted performance score calculation
    const successRateWeight = 0.4;
    const speedWeight = 0.3;
    const efficiencyWeight = 0.2;
    const reliabilityWeight = 0.1;

    const successScore = metrics.successRate;
    const speedScore = metrics.averageTaskTime > 0 ? Math.min((60000 / metrics.averageTaskTime) * 10, 100) : 0;
    const efficiencyScore = metrics.tasksCompleted > 0 ? Math.min((metrics.tasksCompleted / Math.max(metrics.tasksInProgress, 1)) * 20, 100) : 0;
    const reliabilityScore = 100 - (metrics.errorCount || 0);

    return (
      successScore * successRateWeight +
      speedScore * speedWeight +
      efficiencyScore * efficiencyWeight +
      Math.max(reliabilityScore, 0) * reliabilityWeight
    );
  }

  private analyzePerformanceTrends(): void {
    // Analyze trends and generate alerts if needed
    const trends = this.getPerformanceTrends(1800000); // 30 minutes
    
    for (const trend of trends) {
      this.checkForPerformanceAlerts(trend);
    }
  }

  private checkForPerformanceAlerts(trend: PerformanceTrend): void {
    const alertId = `${trend.metric}_trend_alert`;
    
    // Check if we should create an alert
    if (trend.trend === 'DEGRADING' && Math.abs(trend.changeRate) > 20) {
      const alert: PerformanceAlert = {
        id: alertId,
        type: 'PERFORMANCE_DEGRADATION',
        severity: Math.abs(trend.changeRate) > 50 ? 'HIGH' : 'MEDIUM',
        message: `${trend.metric} is degrading at ${trend.changeRate.toFixed(1)}% per hour`,
        timestamp: new Date(),
        resolved: false,
        metric: trend.metric,
        value: trend.values[trend.values.length - 1].value
      };

      this.performanceAlerts.set(alertId, alert);
      this.emit('performance:alert', alert);
    }
  }

  private getLatestSnapshot(): PerformanceSnapshot | null {
    return this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1] : null;
  }
}

interface PerformanceAlert {
  id: string;
  type: 'PERFORMANCE_DEGRADATION' | 'RESOURCE_EXHAUSTION' | 'HIGH_ERROR_RATE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  timestamp: Date;
  resolved: boolean;
  metric: string;
  value: number;
}