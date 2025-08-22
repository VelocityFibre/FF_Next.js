/**
 * Basic Usage Example for FibreFlow Agent OS
 * Demonstrates how to initialize and use the agent system
 */

import { FibreFlowAgentOS } from '../FibreFlowAgentOS';
import { TaskType, TaskPriority, MigrationPhase, ModuleType } from '../types/agent.types';

async function basicUsageExample() {
  console.log('🤖 Starting FibreFlow Agent OS Example');

  // 1. Initialize the Agent OS
  const agentOS = new FibreFlowAgentOS();
  
  try {
    await agentOS.initialize();
    console.log('✅ Agent OS initialized successfully');

    // 2. Check system status
    const status = agentOS.getSystemStatus();
    console.log('📊 System Status:', {
      isRunning: status.isRunning,
      totalAgents: status.totalAgents,
      activeAgents: status.activeAgents
    });

    // 3. Create a migration task
    const migrationTaskId = await agentOS.createMigrationTask({
      type: TaskType.CODE_MIGRATION,
      name: 'Migrate Auth Component',
      description: 'Convert Angular AuthComponent to React',
      priority: TaskPriority.HIGH,
      migrationPhase: MigrationPhase.CORE_MODULES,
      moduleType: ModuleType.AUTHENTICATION,
      angularComponent: 'AuthComponent',
      reactComponent: 'AuthForm',
      dependencies: []
    });

    console.log('🎯 Created migration task:', migrationTaskId);

    // 4. Create a component generation task
    const _componentTaskId = await agentOS.createMigrationTask({
      type: TaskType.COMPONENT_CREATION,
      name: 'Create User Dashboard',
      description: 'Generate new React dashboard component',
      priority: TaskPriority.MEDIUM,
      migrationPhase: MigrationPhase.BUSINESS_LOGIC,
      moduleType: ModuleType.ANALYTICS,
      reactComponent: 'UserDashboard'
    });

    console.log('🏗️ Created component task:', _componentTaskId);

    // 5. Start module migration
    console.log('🚀 Starting authentication module migration...');
    await agentOS.startModuleMigration(ModuleType.AUTHENTICATION);

    // 6. Monitor progress
    const progress = agentOS.getMigrationProgress();
    console.log('📈 Migration Progress:', {
      currentPhase: progress.currentPhase,
      overallProgress: `${progress.overallProgress.toFixed(1)}%`,
      activeModules: progress.activeModules,
      estimatedCompletion: progress.estimatedCompletion
    });

    // 7. Wait for some time (in real usage, you'd monitor via events)
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 8. Check final status
    const finalStatus = agentOS.getSystemStatus();
    console.log('🏁 Final Status:', {
      completedTasks: finalStatus.completedTasks,
      activeTasks: finalStatus.activeTasks
    });

  } catch (error) {
    console.error('❌ Error in Agent OS example:', error);
  } finally {
    // 9. Shutdown the system
    await agentOS.shutdown();
    console.log('🛑 Agent OS shutdown complete');
  }
}

// Dashboard integration example
async function dashboardExample() {
  console.log('🖥️ Dashboard Integration Example');

  const agentOS = new FibreFlowAgentOS();
  
  try {
    await agentOS.initialize();

    // Get the orchestrator for dashboard
    const orchestrator = agentOS.getOrchestrator();

    // In a React app, you would use this like:
    /*
    import { AgentDashboard } from './agent-os/dashboard/AgentDashboard';
    
    function App() {
      return <AgentDashboard orchestrator={orchestrator} />;
    }
    */

    console.log('✅ Dashboard integration ready');
    
    // Get current system data for dashboard
    const agents = orchestrator.getAllAgentsStatus();
    const tasks = orchestrator.getAllTasks();
    
    console.log('📊 Dashboard Data:', {
      agents: agents.length,
      tasks: tasks.length
    });

  } catch (error) {
    console.error('❌ Dashboard example error:', error);
  } finally {
    await agentOS.shutdown();
  }
}

// Event handling example
async function eventHandlingExample() {
  console.log('🎧 Event Handling Example');

  const agentOS = new FibreFlowAgentOS();
  const orchestrator = agentOS.getOrchestrator();

  // Set up event listeners
  orchestrator.on('task:created', ({ taskId: _taskId, task }) => {
    console.log(`🎯 Task created: ${task.name} (${_taskId})`);
  });

  orchestrator.on('task:updated', ({ taskId: _taskId, task }) => {
    console.log(`📝 Task updated: ${task.name} - Status: ${task.status}`);
  });

  orchestrator.on('agent:registered', ({ agentId, agent }) => {
    console.log(`🤖 Agent registered: ${agent.specification.name} (${agentId})`);
  });

  orchestrator.on('system:error', ({ error, component }) => {
    console.error(`❌ System error in ${component}:`, error.message);
  });

  try {
    await agentOS.initialize();

    // Create some tasks to see events in action
    // const _testTaskId = await agentOS.createMigrationTask({
    //   type: TaskType.UNIT_TESTING,
    //   name: 'Test Login Component',
    //   description: 'Create unit tests for login component',
    //   priority: TaskPriority.MEDIUM,
    //   migrationPhase: MigrationPhase.TESTING,
    //   moduleType: ModuleType.AUTHENTICATION
    // });

    // Wait to see events
    await new Promise(resolve => setTimeout(resolve, 3000));

  } catch (error) {
    console.error('❌ Event handling example error:', error);
  } finally {
    await agentOS.shutdown();
  }
}

// Batch task creation example
async function batchTaskExample() {
  console.log('📦 Batch Task Creation Example');

  const agentOS = new FibreFlowAgentOS();

  try {
    await agentOS.initialize();

    // Create multiple related tasks
    const tasks = [
      {
        type: TaskType.CODE_MIGRATION,
        name: 'Migrate Project Service',
        description: 'Convert Angular project service to React hooks',
        priority: TaskPriority.HIGH,
        migrationPhase: MigrationPhase.CORE_MODULES,
        moduleType: ModuleType.PROJECTS,
        angularComponent: 'ProjectService',
        reactComponent: 'useProjects'
      },
      {
        type: TaskType.COMPONENT_CREATION,
        name: 'Create Project List',
        description: 'Generate project list component',
        priority: TaskPriority.HIGH,
        migrationPhase: MigrationPhase.BUSINESS_LOGIC,
        moduleType: ModuleType.PROJECTS,
        reactComponent: 'ProjectList'
      },
      {
        type: TaskType.UNIT_TESTING,
        name: 'Test Project Components',
        description: 'Create comprehensive tests for project module',
        priority: TaskPriority.MEDIUM,
        migrationPhase: MigrationPhase.TESTING,
        moduleType: ModuleType.PROJECTS
      },
      {
        type: TaskType.E2E_TESTING,
        name: 'E2E Project Tests',
        description: 'Create end-to-end tests for project workflow',
        priority: TaskPriority.MEDIUM,
        migrationPhase: MigrationPhase.TESTING,
        moduleType: ModuleType.PROJECTS
      }
    ];

    console.log(`🎯 Creating ${tasks.length} tasks...`);

    const _taskIds = await Promise.all(
      tasks.map(task => agentOS.createMigrationTask(task))
    );

    console.log('✅ Created tasks:', _taskIds);

    // Start the module migration
    await agentOS.startModuleMigration(ModuleType.PROJECTS);

    const progress = agentOS.getMigrationProgress();
    console.log('📈 Migration started:', {
      activeModules: progress.activeModules,
      currentPhase: progress.currentPhase
    });

  } catch (error) {
    console.error('❌ Batch task example error:', error);
  } finally {
    await agentOS.shutdown();
  }
}

// Export examples for testing
export {
  basicUsageExample,
  dashboardExample,
  eventHandlingExample,
  batchTaskExample
};

// Run examples if this file is executed directly
if (require.main === module) {
  async function runExamples() {
    try {
      await basicUsageExample();
      console.log('\n' + '='.repeat(50) + '\n');
      
      await dashboardExample();
      console.log('\n' + '='.repeat(50) + '\n');
      
      await eventHandlingExample();
      console.log('\n' + '='.repeat(50) + '\n');
      
      await batchTaskExample();
      
    } catch (error) {
      console.error('❌ Examples failed:', error);
      process.exit(1);
    }
  }

  runExamples();
}