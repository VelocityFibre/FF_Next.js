/**
 * Neon Database Connection Test Script
 * Run this to verify your database connection is working
 */

import { sql, testConnection } from '../config/database.config';

console.log('🔍 Testing Neon Database Connection...\n');

async function runTests() {
  try {
    // Test 1: Basic connection
    console.log('Test 1: Basic Connection');
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }
    console.log('✅ Basic connection successful\n');

    // Test 2: Check if projects table exists
    console.log('Test 2: Checking Projects Table');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'projects'
    `;
    
    if (tables.length === 0) {
      console.log('⚠️  Projects table does not exist');
      console.log('Run the setup script to create tables: npm run setup');
    } else {
      console.log('✅ Projects table exists');
      
      // Test 3: Count projects
      const projectCount = await sql`SELECT COUNT(*) as count FROM projects`;
      console.log(`📊 Found ${projectCount[0].count} projects in database\n`);
      
      // Test 4: Get sample projects
      const sampleProjects = await sql`
        SELECT id, project_code, project_name, status 
        FROM projects 
        LIMIT 5
      `;
      
      if (sampleProjects.length > 0) {
        console.log('Sample Projects:');
        sampleProjects.forEach(p => {
          console.log(`  - ${p.project_code}: ${p.project_name} (${p.status})`);
        });
      }
    }

    console.log('\n✅ All tests passed successfully!');
    console.log('Your Neon database is properly configured.');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Check your .env file has the correct DATABASE_URL');
    console.log('2. Ensure your Neon database is active');
    console.log('3. Verify your connection string format:');
    console.log('   postgresql://username:password@host.neon.tech/database?sslmode=require');
    process.exit(1);
  }
}

runTests();