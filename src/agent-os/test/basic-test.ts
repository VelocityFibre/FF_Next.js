/**
 * Basic Test Runner for Agent OS
 * Simple validation that the system initializes correctly
 */

import { FibreFlowAgentOS } from '../FibreFlowAgentOS';
import { TaskType, TaskPriority, MigrationPhase, ModuleType } from '../types/agent.types';

export async function runBasicTest(): Promise<boolean> {
  console.log('🧪 Starting Agent OS Basic Test...');

  const agentOS = new FibreFlowAgentOS();
  let testsPassed = 0;
  let testsTotal = 0;

  try {
    // Test 1: System Initialization
    testsTotal++;
    console.log('1️⃣ Testing system initialization...');
    await agentOS.initialize();
    testsPassed++;
    console.log('✅ System initialized successfully');

    // Test 2: System Status
    testsTotal++;
    console.log('2️⃣ Testing system status...');
    const status = agentOS.getSystemStatus();
    if (status.isRunning && status.totalAgents >= 0) {
      testsPassed++;
      console.log('✅ System status retrieved successfully');
      console.log(`   - Running: ${status.isRunning}`);
      console.log(`   - Total Agents: ${status.totalAgents}`);
      console.log(`   - Active Agents: ${status.activeAgents}`);
    } else {
      console.log('❌ System status invalid');
    }

    // Test 3: Migration Progress
    testsTotal++;
    console.log('3️⃣ Testing migration progress...');
    const progress = agentOS.getMigrationProgress();
    if (progress.currentPhase && typeof progress.overallProgress === 'number') {
      testsPassed++;
      console.log('✅ Migration progress retrieved successfully');
      console.log(`   - Current Phase: ${progress.currentPhase}`);
      console.log(`   - Overall Progress: ${progress.overallProgress.toFixed(1)}%`);
    } else {
      console.log('❌ Migration progress invalid');
    }

    // Test 4: Task Creation
    testsTotal++;
    console.log('4️⃣ Testing task creation...');
    const taskId = await agentOS.createMigrationTask({
      type: TaskType.COMPONENT_CREATION,
      name: 'Test Component',
      description: 'Test component creation',
      priority: TaskPriority.LOW,
      migrationPhase: MigrationPhase.FOUNDATION,
      moduleType: ModuleType.AUTHENTICATION,
      reactComponent: 'TestComponent'
    });
    
    if (taskId && typeof taskId === 'string') {
      testsPassed++;
      console.log('✅ Task created successfully');
      console.log(`   - Task ID: ${taskId}`);
    } else {
      console.log('❌ Task creation failed');
    }

    // Test 5: Orchestrator Access
    testsTotal++;
    console.log('5️⃣ Testing orchestrator access...');
    const orchestrator = agentOS.getOrchestrator();
    if (orchestrator && typeof orchestrator.getSystemStatus === 'function') {
      testsPassed++;
      console.log('✅ Orchestrator accessible');
    } else {
      console.log('❌ Orchestrator not accessible');
    }

    // Cleanup
    console.log('🧹 Cleaning up...');
    await agentOS.shutdown();
    console.log('✅ System shutdown successfully');

    // Results
    console.log('\n📊 Test Results:');
    console.log(`   - Tests Passed: ${testsPassed}/${testsTotal}`);
    console.log(`   - Success Rate: ${((testsPassed / testsTotal) * 100).toFixed(1)}%`);

    if (testsPassed === testsTotal) {
      console.log('🎉 All tests passed! Agent OS is working correctly.');
      return true;
    } else {
      console.log('⚠️ Some tests failed. Check the implementation.');
      return false;
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    
    try {
      await agentOS.shutdown();
    } catch (shutdownError) {
      console.error('Error during cleanup:', shutdownError);
    }
    
    return false;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  runBasicTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}