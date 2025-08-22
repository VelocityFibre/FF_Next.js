/**
 * Agent OS - Main entry point
 * Exports all core components for easy integration
 */

// Core system exports
export { AgentOrchestrator } from './core/AgentOrchestrator';
export { MessageBroker } from './core/MessageBroker';
export { TaskDistributor } from './core/TaskDistributor';
export { HealthMonitor } from './core/HealthMonitor';
export { PerformanceTracker } from './core/PerformanceTracker';

// Main FibreFlow system
export { FibreFlowAgentOS } from './FibreFlowAgentOS';

// Agent implementations
export { BaseAgent } from './agents/BaseAgent';
export { DevelopmentAgent } from './agents/DevelopmentAgent';

// Type definitions
export * from './types/agent.types';

// Specifications
export { AGENT_SPECIFICATIONS, TASK_TEMPLATES } from './specifications/fibreflow-agents';

// Dashboard components
export { AgentDashboard } from './dashboard/AgentDashboard';
export { SystemOverview } from './dashboard/components/SystemOverview';

// Utilities
export { Logger, LogLevel } from './utils/logger';

// Default export - the main system
export { FibreFlowAgentOS as default } from './FibreFlowAgentOS';