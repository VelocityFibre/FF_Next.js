/**
 * System Overview Component
 * Displays high-level system metrics, status, and key performance indicators
 */

import React from 'react';
import { AgentInstance, Task, HealthStatus, AgentStatus, TaskStatus, HealthStatusType } from '../../types/agent.types';

interface Props {
  systemMetrics: any;
  agents: AgentInstance[];
  tasks: Task[];
  healthStatuses: HealthStatus[];
}

export const SystemOverview: React.FC<Props> = ({
  systemMetrics,
  agents,
  tasks,
  healthStatuses
}) => {
  // Calculate derived metrics
  const activeAgents = agents.filter(a => a.status === AgentStatus.ACTIVE || a.status === AgentStatus.BUSY);
  const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING);
  const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS);
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);
  const failedTasks = tasks.filter(t => t.status === TaskStatus.FAILED);
  
  const healthyAgents = healthStatuses.filter(h => h.status === HealthStatusType.HEALTHY);
  const unhealthyAgents = healthStatuses.filter(h => h.status === HealthStatusType.UNHEALTHY);
  
  const systemHealthPercentage = agents.length > 0 ? 
    (healthyAgents.length / agents.length) * 100 : 100;

  const taskCompletionRate = (completedTasks.length + failedTasks.length) > 0 ?
    (completedTasks.length / (completedTasks.length + failedTasks.length)) * 100 : 0;

  const averageTaskDuration = completedTasks.length > 0 ?
    completedTasks.reduce((sum, task) => sum + (task.actualDuration || 0), 0) / completedTasks.length : 0;

  return (
    <div className="space-y-6">
      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="System Status"
          value={systemMetrics?.isRunning ? 'Running' : 'Stopped'}
          valueColor={systemMetrics?.isRunning ? 'text-green-600' : 'text-red-600'}
          subtitle={`Uptime: ${formatUptime(systemMetrics?.uptime || 0)}`}
          icon="🟢"
        />
        
        <StatusCard
          title="Active Agents"
          value={`${activeAgents.length}/${agents.length}`}
          valueColor="text-blue-600"
          subtitle={`${agents.length - activeAgents.length} inactive`}
          icon="🤖"
        />
        
        <StatusCard
          title="System Health"
          value={`${systemHealthPercentage.toFixed(1)}%`}
          valueColor={systemHealthPercentage > 80 ? 'text-green-600' : systemHealthPercentage > 60 ? 'text-yellow-600' : 'text-red-600'}
          subtitle={`${unhealthyAgents.length} unhealthy agents`}
          icon="❤️"
        />
        
        <StatusCard
          title="Task Queue"
          value={`${pendingTasks.length + inProgressTasks.length}`}
          valueColor="text-purple-600"
          subtitle={`${pendingTasks.length} pending, ${inProgressTasks.length} active`}
          icon="📋"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Task Completion Rate"
          value={`${taskCompletionRate.toFixed(1)}%`}
          change={+2.3}
          description="Percentage of tasks completed successfully"
          color="green"
        />
        
        <MetricCard
          title="Average Task Duration"
          value={formatDuration(averageTaskDuration)}
          change={-5.8}
          description="Average time to complete tasks"
          color="blue"
        />
        
        <MetricCard
          title="System Throughput"
          value={`${systemMetrics?.systemMetrics?.averageThroughput?.toFixed(1) || 0} tasks/min`}
          change={+12.4}
          description="Tasks processed per minute"
          color="purple"
        />
      </div>

      {/* Agent Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Agent Status Distribution</h3>
          <AgentStatusChart agents={agents} />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task Status Distribution</h3>
          <TaskStatusChart tasks={tasks} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <RecentActivity tasks={tasks.slice(-10)} agents={agents} />
        </div>
      </div>

      {/* System Alerts */}
      {(unhealthyAgents.length > 0 || failedTasks.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-900 mb-4">System Alerts</h3>
          <div className="space-y-2">
            {unhealthyAgents.map(agent => (
              <div key={agent.agentId} className="text-red-700 text-sm">
                ⚠️ Agent {agent.agentId} is unhealthy - {agent.issues.length} issues detected
              </div>
            ))}
            {failedTasks.length > 0 && (
              <div className="text-red-700 text-sm">
                🚨 {failedTasks.length} tasks have failed in the last hour
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components

interface StatusCardProps {
  title: string;
  value: string;
  valueColor?: string;
  subtitle?: string;
  icon?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, value, valueColor, subtitle, icon }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold ${valueColor || 'text-gray-900'}`}>{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {icon && <div className="text-2xl">{icon}</div>}
    </div>
  </div>
);

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  description: string;
  color: 'green' | 'blue' | 'purple' | 'red';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, description, color }) => {
  const colorClasses = {
    green: 'text-green-600 bg-green-100',
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100',
    red: 'text-red-600 bg-red-100'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {change >= 0 ? '↗' : '↘'} {Math.abs(change).toFixed(1)}%
        </span>
      </div>
      <div className={`text-2xl font-bold mt-2 ${colorClasses[color].split(' ')[0]}`}>
        {value}
      </div>
      <p className="text-sm text-gray-500 mt-2">{description}</p>
    </div>
  );
};

const AgentStatusChart: React.FC<{ agents: AgentInstance[] }> = ({ agents }) => {
  const statusCounts = agents.reduce((acc, agent) => {
    acc[agent.status] = (acc[agent.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-3">
      {Object.entries(statusCounts).map(([status, count]) => {
        const percentage = (count / agents.length) * 100;
        const color = getStatusColor(status);
        
        return (
          <div key={status} className="flex items-center">
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{status}</span>
                <span>{count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full ${color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TaskStatusChart: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-3">
      {Object.entries(statusCounts).map(([status, count]) => {
        const percentage = (count / tasks.length) * 100;
        const color = getTaskStatusColor(status);
        
        return (
          <div key={status} className="flex items-center">
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{status}</span>
                <span>{count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full ${color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const RecentActivity: React.FC<{ tasks: Task[]; agents: AgentInstance[] }> = ({ tasks, agents }) => {
  const recentTasks = tasks
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {recentTasks.map(task => {
        const agent = agents.find(a => a.id === task.assignedAgentId);
        return (
          <div key={task.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{task.name}</p>
              <p className="text-sm text-gray-500">
                {agent ? `Assigned to ${agent.specification.name}` : 'Unassigned'}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                getTaskStatusColor(task.status)
              }`}>
                {task.status}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                {formatTimeAgo(task.updatedAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Helper functions
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'ACTIVE': return 'bg-green-500';
    case 'BUSY': return 'bg-blue-500';
    case 'IDLE': return 'bg-yellow-500';
    case 'INACTIVE': return 'bg-gray-500';
    case 'ERROR': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getTaskStatusColor = (status: string): string => {
  switch (status) {
    case 'COMPLETED': return 'bg-green-100 text-green-800';
    case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'FAILED': return 'bg-red-100 text-red-800';
    case 'CANCELLED': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatUptime = (uptime: number): string => {
  const hours = Math.floor(uptime / 3600000);
  const minutes = Math.floor((uptime % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};

const formatDuration = (duration: number): string => {
  if (duration < 1000) return `${duration}ms`;
  if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
  return `${(duration / 60000).toFixed(1)}m`;
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
};