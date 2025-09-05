const fetch = require('node-fetch');

async function testAPIs() {
  const baseUrl = 'http://localhost:3000/api';
  
  console.log('🧪 Testing Analytics API Endpoints...\n');
  
  // Test dashboard stats
  try {
    console.log('📊 Testing /analytics/dashboard/stats...');
    const statsResponse = await fetch(`${baseUrl}/analytics/dashboard/stats`);
    const stats = await statsResponse.json();
    
    if (stats.success) {
      console.log('✅ Stats endpoint working!');
      console.log('   Projects:', stats.data.totalProjects);
      console.log('   Active Projects:', stats.data.activeProjects);
      console.log('   Staff:', stats.data.teamMembers);
      console.log('   Performance Score:', stats.data.performanceScore + '%');
    } else {
      console.log('❌ Stats endpoint error:', stats.error);
    }
  } catch (error) {
    console.log('❌ Failed to call stats API:', error.message);
  }
  
  // Test dashboard trends
  try {
    console.log('\n📈 Testing /analytics/dashboard/trends...');
    const trendsResponse = await fetch(`${baseUrl}/analytics/dashboard/trends`);
    const trends = await trendsResponse.json();
    
    if (trends.success) {
      console.log('✅ Trends endpoint working!');
      if (trends.data.activeProjects) {
        console.log('   Project trend:', trends.data.activeProjects.direction, 
                    `(${trends.data.activeProjects.percentage}%)`);
      }
      if (trends.data.teamMembers) {
        console.log('   Staff trend:', trends.data.teamMembers.direction,
                    `(${trends.data.teamMembers.percentage}%)`);
      }
    } else {
      console.log('❌ Trends endpoint error:', trends.error);
    }
  } catch (error) {
    console.log('❌ Failed to call trends API:', error.message);
  }
  
  // Test dashboard summary
  try {
    console.log('\n📑 Testing /analytics/dashboard/summary...');
    const summaryResponse = await fetch(`${baseUrl}/analytics/dashboard/summary?period=monthly`);
    const summary = await summaryResponse.json();
    
    if (summary.success) {
      console.log('✅ Summary endpoint working!');
      console.log('   Period:', summary.data.period);
      console.log('   Total Projects:', summary.data.projects?.total || 0);
      console.log('   Active Staff:', summary.data.staff?.active || 0);
    } else {
      console.log('❌ Summary endpoint error:', summary.error);
    }
  } catch (error) {
    console.log('❌ Failed to call summary API:', error.message);
  }
  
  console.log('\n📋 API Testing Complete!');
}

// Check if server is running
fetch('http://localhost:3000')
  .then(() => {
    console.log('🚀 Server is running on http://localhost:3000\n');
    testAPIs();
  })
  .catch(() => {
    console.log('⚠️  Server is not running. Please start the dev server first:');
    console.log('    npm run dev\n');
  });