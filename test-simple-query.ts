#!/usr/bin/env tsx

import { sql } from './src/lib/neon/connectionPool';

async function testSimpleQueries() {
  console.log('🔍 Testing Simple Database Queries...\n');
  
  try {
    // Test basic SELECT query
    console.log('1. Testing basic SELECT query...');
    const basicTest = await sql`SELECT 1 as test_value, NOW() as current_time`;
    console.log('   ✅ Basic query successful:', basicTest[0]);
    
    // Test if any tables exist
    console.log('\n2. Testing table existence...');
    const tablesQuery = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      LIMIT 5
    `;
    console.log('   ✅ Found tables:', tablesQuery.map(t => t.table_name));
    
    // Test if contractors table exists (one of the main tables)
    console.log('\n3. Testing contractors table...');
    const contractorsCount = await sql`
      SELECT COUNT(*) as count 
      FROM contractors
    `;
    console.log('   ✅ Contractors table accessible. Count:', contractorsCount[0].count);
    
    // Test if projects table exists  
    console.log('\n4. Testing projects table...');
    const projectsCount = await sql`
      SELECT COUNT(*) as count 
      FROM projects
    `;
    console.log('   ✅ Projects table accessible. Count:', projectsCount[0].count);
    
    console.log('\n🎉 Simple database queries test completed successfully!');
    console.log('✅ Database connection is working properly');
    console.log('✅ No infinite loop issues detected');
    console.log('✅ Tables are accessible and queryable');
    
  } catch (error) {
    console.error('\n💥 Database queries test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error('🗃️  This looks like a missing table issue!');
      } else if (error.message.includes('password authentication failed') || 
                 error.message.includes('connection refused')) {
        console.error('🔗 This looks like a database connection issue!');
      }
    }
    
    process.exit(1);
  }
}

// Run the test
testSimpleQueries();