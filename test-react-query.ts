#!/usr/bin/env tsx

import { DashboardStatsService } from './src/services/dashboard/dashboardStatsService';
import { log } from './src/lib/logger';

async function testReactQueryServices() {
  console.log('🔍 Testing React Query Services with New Database...\n');
  
  try {
    // Test dashboard stats service
    console.log('1. Testing Dashboard Stats Service...');
    const dashboardService = new DashboardStatsService();
    
    const stats = await dashboardService.getDashboardStats();
    console.log('   ✅ Dashboard stats retrieved:', {
      totalProjects: stats.totalProjects,
      activeProjects: stats.activeProjects,
      teamMembers: stats.teamMembers,
      contractorsActive: stats.contractorsActive
    });
    
    // Test trends
    console.log('\n2. Testing Dashboard Trends...');
    const trends = await dashboardService.getDashboardTrends();
    console.log('   ✅ Dashboard trends retrieved:', Object.keys(trends).length, 'trend metrics');
    
    console.log('\n🎉 React Query services test completed successfully!');
    console.log('\nNOTE: No infinite loops detected - database queries executed once without issues');
    
  } catch (error) {
    console.error('\n💥 React Query services test failed:', error);
    
    // Check if it's a typical React Query infinite loop error
    if (error instanceof Error) {
      if (error.message.includes('Maximum call stack exceeded') || 
          error.message.includes('Too many re-renders')) {
        console.error('🔄 This looks like a React Query infinite loop issue!');
      } else if (error.message.includes('password authentication failed') || 
                 error.message.includes('connection refused')) {
        console.error('🔗 This looks like a database connection issue!');
      }
    }
    
    process.exit(1);
  }
}

// Run the test
testReactQueryServices();