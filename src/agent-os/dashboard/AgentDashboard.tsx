/**
 * Agent OS Dashboard - Real-time monitoring and control interface
 * Provides comprehensive view of agent system status, performance, and health
 */

import React, { useState, useEffect } from 'react';
import { AgentOrchestrator } from '../core/AgentOrchestrator';
import { AgentInstance, Task, HealthStatus, HealthStatusType } from '../types/agent.types';
import { SystemOverview } from './components/SystemOverview';
// import { AgentGrid } from './components/AgentGrid';
// import { TaskQueue } from './components/TaskQueue';
// import { PerformanceCharts } from './components/PerformanceCharts';
// import { HealthMonitor } from './components/HealthMonitorDisplay';
// import { LogViewer } from './components/LogViewer';
// import { AlertPanel } from './components/AlertPanel';

interface DashboardState {
  agents: AgentInstance[];
  tasks: Task[];
  healthStatuses: HealthStatus[];
  systemMetrics: any;
  selectedAgent: string | null;
  selectedTab: DashboardTab;
  autoRefresh: boolean;
  refreshInterval: number;
}

type DashboardTab = 'overview' | 'agents' | 'tasks' | 'performance' | 'health' | 'logs' | 'alerts';

interface Props {
  orchestrator: AgentOrchestrator;
}

export const AgentDashboard: React.FC<Props> = ({ orchestrator }) => {
  const [state, setState] = useState<DashboardState>({
    agents: [],
    tasks: [],
    healthStatuses: [],
    systemMetrics: null,
    selectedAgent: null,
    selectedTab: 'overview',
    autoRefresh: true,
    refreshInterval: 5000
  });

  // Logs functionality temporarily disabled
  // const [logs, setLogs] = useState<Array<{ timestamp: Date; level: string; message: string; component: string }>>([]);
  const [alerts, setAlerts] = useState<Array<{ id: string; severity: string; message: string; timestamp: Date }>>([]);

  // Initialize dashboard
  useEffect(() => {
    initializeDashboard();
    
    return () => {
      cleanup();
    };
  }, []);

  // Auto-refresh data
  useEffect(() => {
    if (!state.autoRefresh) return;

    const interval = setInterval(() => {
      refreshData();
    }, state.refreshInterval);

    return () => clearInterval(interval);
  }, [state.autoRefresh, state.refreshInterval]);

  const initializeDashboard = async () => {
    // Set up event listeners for real-time updates
    orchestrator.on('agent:registered', handleAgentRegistered);
    orchestrator.on('agent:updated', handleAgentUpdated);
    orchestrator.on('task:created', handleTaskCreated);
    orchestrator.on('task:updated', handleTaskUpdated);
    orchestrator.on('health:updated', handleHealthUpdated);
    orchestrator.on('performance:snapshot_taken', handlePerformanceSnapshot);
    orchestrator.on('system:error', handleSystemError);

    // Initial data load
    await refreshData();
  };

  const cleanup = () => {
    orchestrator.removeAllListeners();
  };

  const refreshData = async () => {
    try {
      const [agents, tasks, systemStatus] = await Promise.all([
        Promise.resolve(orchestrator.getAllAgentsStatus()),
        Promise.resolve(orchestrator.getAllTasks()),
        Promise.resolve(orchestrator.getSystemStatus())
      ]);

      setState(prev => ({
        ...prev,
        agents,
        tasks,
        systemMetrics: systemStatus
      }));

    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      addAlert('error', `Failed to refresh data: ${errorMessage}`, new Date());
    }
  };

  // Event handlers
  const handleAgentRegistered = ({ agent }: { agent: AgentInstance }) => {
    setState(prev => ({
      ...prev,
      agents: [...prev.agents, agent]
    }));
    addAlert('info', `Agent registered: ${agent.specification.name}`, new Date());
  };

  const handleAgentUpdated = ({ agent }: { agent: AgentInstance }) => {
    setState(prev => ({
      ...prev,
      agents: prev.agents.map(a => a.id === agent.id ? agent : a)
    }));
  };

  const handleTaskCreated = ({ task }: { task: Task }) => {
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, task]
    }));
  };

  const handleTaskUpdated = ({ task }: { task: Task }) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === task.id ? task : t)
    }));
  };

  const handleHealthUpdated = ({ healthStatus }: { agentId: string; healthStatus: HealthStatus }) => {
    setState(prev => ({
      ...prev,
      healthStatuses: prev.healthStatuses.map(h => 
        h.agentId === healthStatus.agentId ? healthStatus : h
      )
    }));

    // Add alert for critical health issues
    if (healthStatus.status === HealthStatusType.UNHEALTHY) {
      addAlert('error', `Agent ${healthStatus.agentId} is unhealthy`, new Date());
    }
  };

  const handlePerformanceSnapshot = (_snapshot: any) => {
    // Update performance data for charts
    addLog('info', 'Performance snapshot taken', 'PerformanceTracker');
  };

  const handleSystemError = ({ error, component }: { error: Error; component: string }) => {
    addAlert('error', `System error in ${component}: ${error.message}`, new Date());
    addLog('error', error.message, component);
  };

  const addLog = (level: string, message: string, component: string) => {
    _setLogs(prev => [
      { timestamp: new Date(), level, message, component },
      ...prev.slice(0, 999) // Keep last 1000 logs
    ]);
  };

  const addAlert = (severity: string, message: string, timestamp: Date) => {
    const alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      severity,
      message,
      timestamp
    };
    
    setAlerts(prev => [alert, ...prev.slice(0, 99)]); // Keep last 100 alerts
  };

  const handleTabChange = (tab: DashboardTab) => {
    setState(prev => ({ ...prev, selectedTab: tab }));
  };

  // const _handleAgentSelect = (agentId: string | null) => {
  //   setState(prev => ({ ...prev, selectedAgent: agentId }));
  // };

  const handleToggleAutoRefresh = () => {
    setState(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }));
  };

  const handleRefreshIntervalChange = (interval: number) => {
    setState(prev => ({ ...prev, refreshInterval: interval }));
  };

  // Manual actions
  // const _handleCreateTask = async (taskData: any) => {
  //   try {
  //     await orchestrator.createTask(taskData);
  //     addAlert('success', 'Task created successfully', new Date());
  //   } catch (error) {
  //     addAlert('error', `Failed to create task: ${error instanceof Error ? error.message : String(error)}`, new Date());
  //   }
  // };

  // const _handleStopAgent = async (agentId: string) => {
  //   try {
  //     // Implementation would call orchestrator to stop agent
  //     addAlert('warning', `Agent ${agentId} stopped`, new Date());
  //   } catch (error) {
  //     addAlert('error', `Failed to stop agent: ${error instanceof Error ? error.message : String(error)}`, new Date());
  //   }
  // };

  // const _handleRestartAgent = async (agentId: string) => {
  //   try {
  //     // Implementation would call orchestrator to restart agent
  //     addAlert('success', `Agent ${agentId} restarted`, new Date());
  //   } catch (error) {
  //     addAlert('error', `Failed to restart agent: ${error instanceof Error ? error.message : String(error)}`, new Date());
  //   }
  // };

  const renderTabContent = () => {
    switch (state.selectedTab) {
      case 'overview':
        return (
          <SystemOverview 
            systemMetrics={state.systemMetrics}
            agents={state.agents}
            tasks={state.tasks}
            healthStatuses={state.healthStatuses}
          />
        );
      
      case 'agents':
        return (
          <div>Agent Grid Component - Not implemented</div>
        );
      
      case 'tasks':
        return (
          <div>Task Queue Component - Not implemented</div>
        );
      
      case 'performance':
        return (
          <div>Performance Charts Component - Not implemented</div>
        );
      
      case 'health':
        return (
          <div>Health Monitor Component - Not implemented</div>
        );
      
      case 'logs':
        return (
          <div>Log Viewer Component - Not implemented</div>
        );
      
      case 'alerts':
        return (
          <div>Alert Panel Component - Not implemented</div>
        );
      
      default:
        return <div>Tab not implemented</div>;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agent OS Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              System Status: {state.systemMetrics?.isRunning ? 'Running' : 'Stopped'} | 
              Agents: {state.agents.length} | 
              Active Tasks: {state.systemMetrics?.activeTasks || 0}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Auto-refresh:</label>
              <button
                onClick={handleToggleAutoRefresh}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  state.autoRefresh 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {state.autoRefresh ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <select
              value={state.refreshInterval}
              onChange={(e) => handleRefreshIntervalChange(Number(e.target.value))}
              className="px-3 py-1 border rounded text-sm"
              disabled={!state.autoRefresh}
            >
              <option value={1000}>1s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
            </select>
            
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b px-6">
        <div className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'agents', label: 'Agents' },
            { id: 'tasks', label: 'Tasks' },
            { id: 'performance', label: 'Performance' },
            { id: 'health', label: 'Health' },
            { id: 'logs', label: 'Logs' },
            { id: 'alerts', label: 'Alerts' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as DashboardTab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                state.selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.id === 'alerts' && alerts.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                  {alerts.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        {renderTabContent()}
      </main>
    </div>
  );
};