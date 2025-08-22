/**
 * Health Monitor - Monitors agent health, performance, and system stability
 * Provides real-time health checks and early warning systems
 */

import { EventEmitter } from 'events';
import { AgentInstance, HealthStatus, HealthStatusType, HealthMetrics, HealthIssue, HealthIssueType, EventSeverity, ResourceUtilization } from '../types/agent.types';
import { Logger } from '../utils/logger';
import { AgentOrchestrator } from './AgentOrchestrator';

interface HealthCheckConfig {
  interval: number; // milliseconds
  timeout: number; // milliseconds
  retryCount: number;
  thresholds: HealthThresholds;
}

interface HealthThresholds {
  responseTime: {
    warning: number;
    critical: number;
  };
  errorRate: {
    warning: number; // percentage
    critical: number; // percentage
  };
  resourceUtilization: {
    cpu: { warning: number; critical: number };
    memory: { warning: number; critical: number };
    storage: { warning: number; critical: number };
  };
  availability: {
    warning: number; // percentage
    critical: number; // percentage
  };
}

export class HealthMonitor extends EventEmitter {
  private orchestrator: AgentOrchestrator;
  private logger: Logger;
  private healthStatuses: Map<string, HealthStatus> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private config: HealthCheckConfig;
  private isRunning: boolean = false;

  constructor(orchestrator: AgentOrchestrator) {
    super();
    this.orchestrator = orchestrator;
    this.logger = new Logger('HealthMonitor');
    
    this.config = {
      interval: 30000, // 30 seconds
      timeout: 10000, // 10 seconds
      retryCount: 3,
      thresholds: {
        responseTime: {
          warning: 5000, // 5 seconds
          critical: 10000 // 10 seconds
        },
        errorRate: {
          warning: 5, // 5%
          critical: 15 // 15%
        },
        resourceUtilization: {
          cpu: { warning: 70, critical: 90 },
          memory: { warning: 80, critical: 95 },
          storage: { warning: 85, critical: 95 }
        },
        availability: {
          warning: 95, // 95%
          critical: 85 // 85%
        }
      }
    };
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing Health Monitor...');
    
    this.isRunning = true;
    this.startHealthChecks();
    
    this.logger.info('Health Monitor initialized');
  }

  /**
   * Start continuous health monitoring
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.config.interval);

    this.logger.info(`Health checks started with ${this.config.interval}ms interval`);
  }

  /**
   * Perform health checks on all agents
   */
  private async performHealthChecks(): Promise<void> {
    if (!this.isRunning) return;

    const agents = this.orchestrator.getAllAgentsStatus();
    
    for (const agent of agents) {
      try {
        await this.checkAgentHealth(agent);
      } catch (error) {
        this.logger.error(`Health check failed for agent ${agent.id}:`, error);
      }
    }
  }

  /**
   * Check health of a specific agent
   */
  async checkAgentHealth(agent: AgentInstance): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      const healthStatus = await this.performAgentHealthCheck(agent);
      const responseTime = Date.now() - startTime;
      
      healthStatus.metrics.responseTime = responseTime;
      healthStatus.lastCheck = new Date();
      
      // Analyze health metrics and detect issues
      const issues = this.analyzeHealthMetrics(healthStatus.metrics);
      healthStatus.issues = issues;
      
      // Determine overall health status
      healthStatus.status = this.determineHealthStatus(healthStatus.metrics, issues);
      
      this.healthStatuses.set(agent.id, healthStatus);
      
      // Emit health status update
      this.emit('health:updated', { agentId: agent.id, healthStatus });
      
      // Handle critical issues
      if (healthStatus.status === HealthStatusType.UNHEALTHY) {
        this.handleCriticalHealth(agent, healthStatus);
      }
      
      return healthStatus;
      
    } catch (error) {
      const healthStatus: HealthStatus = {
        agentId: agent.id,
        status: HealthStatusType.UNKNOWN,
        lastCheck: new Date(),
        metrics: this.getDefaultMetrics(),
        issues: [{
          type: HealthIssueType.CONNECTION_FAILURE,
          severity: EventSeverity.CRITICAL,
          description: `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
          timestamp: new Date(),
          resolved: false
        }]
      };
      
      this.healthStatuses.set(agent.id, healthStatus);
      this.emit('health:check_failed', { agentId: agent.id, error });
      
      return healthStatus;
    }
  }

  /**
   * Get health status for a specific agent
   */
  getAgentHealth(agentId: string): HealthStatus | null {
    return this.healthStatuses.get(agentId) || null;
  }

  /**
   * Get health status for all agents
   */
  getAllAgentsHealth(): HealthStatus[] {
    return Array.from(this.healthStatuses.values());
  }

  /**
   * Get system health overview
   */
  getSystemHealth(): {
    overallStatus: HealthStatusType;
    healthyAgents: number;
    unhealthyAgents: number;
    totalAgents: number;
    criticalIssues: HealthIssue[];
    systemMetrics: any;
  } {
    const healthStatuses = Array.from(this.healthStatuses.values());
    
    const healthyAgents = healthStatuses.filter(h => h.status === HealthStatusType.HEALTHY).length;
    const unhealthyAgents = healthStatuses.filter(h => h.status === HealthStatusType.UNHEALTHY).length;
    
    const criticalIssues = healthStatuses
      .flatMap(h => h.issues)
      .filter(issue => issue.severity === EventSeverity.CRITICAL && !issue.resolved);
    
    let overallStatus: HealthStatusType;
    if (unhealthyAgents === 0) {
      overallStatus = HealthStatusType.HEALTHY;
    } else if (unhealthyAgents / healthStatuses.length < 0.3) {
      overallStatus = HealthStatusType.DEGRADED;
    } else {
      overallStatus = HealthStatusType.UNHEALTHY;
    }

    return {
      overallStatus,
      healthyAgents,
      unhealthyAgents,
      totalAgents: healthStatuses.length,
      criticalIssues,
      systemMetrics: this.getSystemMetrics()
    };
  }

  /**
   * Shutdown the health monitor
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Health Monitor...');
    
    this.isRunning = false;
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    this.healthStatuses.clear();
    
    this.logger.info('Health Monitor shutdown complete');
  }

  // Private methods

  private async performAgentHealthCheck(agent: AgentInstance): Promise<HealthStatus> {
    // Calculate current metrics
    const metrics = this.calculateHealthMetrics(agent);
    
    const healthStatus: HealthStatus = {
      agentId: agent.id,
      status: HealthStatusType.HEALTHY, // Will be determined later
      lastCheck: new Date(),
      metrics,
      issues: []
    };

    return healthStatus;
  }

  private calculateHealthMetrics(agent: AgentInstance): HealthMetrics {
    // Calculate error rate
    const errorRate = agent.metrics.errorCount ? 
      (agent.metrics.errorCount / (agent.metrics.tasksCompleted + (agent.metrics.errorCount || 0))) * 100 : 0;
    
    // Calculate throughput (tasks per minute)
    const throughput = agent.metrics.averageTaskTime > 0 ? 
      60000 / agent.metrics.averageTaskTime : 0;
    
    // Calculate availability (percentage of time agent was active)
    const availability = agent.metrics.totalUptime > 0 ? 
      (agent.metrics.totalUptime / (Date.now() - agent.metrics.lastActive.getTime())) * 100 : 100;

    // Get resource utilization (from agent metrics)
    const resourceUtilization: ResourceUtilization = {
      cpu: agent.metrics.cpuUsage || 0,
      memory: agent.metrics.memoryUsage / 1024, // Convert to percentage (assuming 1GB base)
      storage: 0, // TODO: Implement storage monitoring
      network: 0 // TODO: Implement network monitoring
    };

    return {
      responseTime: 0, // Will be set by health check
      errorRate: Math.min(errorRate, 100),
      throughput: Math.max(throughput, 0),
      availability: Math.min(Math.max(availability, 0), 100),
      resourceUtilization
    };
  }

  private analyzeHealthMetrics(metrics: HealthMetrics): HealthIssue[] {
    const issues: HealthIssue[] = [];
    const now = new Date();

    // Check response time
    if (metrics.responseTime > this.config.thresholds.responseTime.critical) {
      issues.push({
        type: HealthIssueType.SLOW_RESPONSE,
        severity: EventSeverity.CRITICAL,
        description: `Response time ${metrics.responseTime}ms exceeds critical threshold`,
        timestamp: now,
        resolved: false
      });
    } else if (metrics.responseTime > this.config.thresholds.responseTime.warning) {
      issues.push({
        type: HealthIssueType.SLOW_RESPONSE,
        severity: EventSeverity.WARNING,
        description: `Response time ${metrics.responseTime}ms exceeds warning threshold`,
        timestamp: now,
        resolved: false
      });
    }

    // Check error rate
    if (metrics.errorRate > this.config.thresholds.errorRate.critical) {
      issues.push({
        type: HealthIssueType.HIGH_ERROR_RATE,
        severity: EventSeverity.CRITICAL,
        description: `Error rate ${metrics.errorRate.toFixed(1)}% exceeds critical threshold`,
        timestamp: now,
        resolved: false
      });
    } else if (metrics.errorRate > this.config.thresholds.errorRate.warning) {
      issues.push({
        type: HealthIssueType.HIGH_ERROR_RATE,
        severity: EventSeverity.WARNING,
        description: `Error rate ${metrics.errorRate.toFixed(1)}% exceeds warning threshold`,
        timestamp: now,
        resolved: false
      });
    }

    // Check resource utilization
    const { cpu, memory } = metrics.resourceUtilization;
    
    if (cpu > this.config.thresholds.resourceUtilization.cpu.critical) {
      issues.push({
        type: HealthIssueType.HIGH_CPU_USAGE,
        severity: EventSeverity.CRITICAL,
        description: `CPU usage ${cpu.toFixed(1)}% exceeds critical threshold`,
        timestamp: now,
        resolved: false
      });
    }

    if (memory > this.config.thresholds.resourceUtilization.memory.critical) {
      issues.push({
        type: HealthIssueType.HIGH_MEMORY_USAGE,
        severity: EventSeverity.CRITICAL,
        description: `Memory usage ${memory.toFixed(1)}% exceeds critical threshold`,
        timestamp: now,
        resolved: false
      });
    }

    // Check availability
    if (metrics.availability < this.config.thresholds.availability.critical) {
      issues.push({
        type: HealthIssueType.CONNECTION_FAILURE,
        severity: EventSeverity.CRITICAL,
        description: `Availability ${metrics.availability.toFixed(1)}% below critical threshold`,
        timestamp: now,
        resolved: false
      });
    }

    return issues;
  }

  private determineHealthStatus(_metrics: HealthMetrics, issues: HealthIssue[]): HealthStatusType {
    const criticalIssues = issues.filter(issue => issue.severity === EventSeverity.CRITICAL);
    const warningIssues = issues.filter(issue => issue.severity === EventSeverity.WARNING);

    if (criticalIssues.length > 0) {
      return HealthStatusType.UNHEALTHY;
    } else if (warningIssues.length > 0) {
      return HealthStatusType.DEGRADED;
    } else {
      return HealthStatusType.HEALTHY;
    }
  }

  private async handleCriticalHealth(agent: AgentInstance, healthStatus: HealthStatus): Promise<void> {
    this.logger.error(`Critical health issues detected for agent ${agent.id}`);
    
    // Emit critical health event
    this.emit('health:critical', { agentId: agent.id, healthStatus });
    
    // Determine if agent should be restarted or taken offline
    const criticalIssues = healthStatus.issues.filter(
      issue => issue.severity === EventSeverity.CRITICAL
    );

    if (criticalIssues.length >= 3) {
      this.logger.warn(`Taking agent ${agent.id} offline due to multiple critical issues`);
      // TODO: Implement agent shutdown/restart logic
      this.emit('health:agent_offline', { agentId: agent.id, reason: 'Critical health issues' });
    }
  }

  private getDefaultMetrics(): HealthMetrics {
    return {
      responseTime: 0,
      errorRate: 0,
      throughput: 0,
      availability: 0,
      resourceUtilization: {
        cpu: 0,
        memory: 0,
        storage: 0,
        network: 0
      }
    };
  }

  private getSystemMetrics(): any {
    const healthStatuses = Array.from(this.healthStatuses.values());
    
    if (healthStatuses.length === 0) {
      return {
        averageResponseTime: 0,
        averageErrorRate: 0,
        averageThroughput: 0,
        averageAvailability: 100
      };
    }

    const allMetrics = healthStatuses.map(h => h.metrics);
    
    return {
      averageResponseTime: allMetrics.reduce((sum, m) => sum + m.responseTime, 0) / allMetrics.length,
      averageErrorRate: allMetrics.reduce((sum, m) => sum + m.errorRate, 0) / allMetrics.length,
      averageThroughput: allMetrics.reduce((sum, m) => sum + m.throughput, 0) / allMetrics.length,
      averageAvailability: allMetrics.reduce((sum, m) => sum + m.availability, 0) / allMetrics.length
    };
  }
}