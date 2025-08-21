/**
 * Simple Neon Connection Test
 */

import { neon } from '@neondatabase/serverless';

const CONNECTION_STRING = 'postgresql://neondb_owner:npg_Jq8OGXiWcYK0@ep-wandering-dew-a14qgf25-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testConnection() {
  console.log('🚀 Testing Neon database connection...');
  
  try {
    // Create Neon client
    const sql = neon(CONNECTION_STRING);
    
    // Test basic query
    console.log('📡 Executing test query...');
    const result = await sql`SELECT NOW() as current_time, VERSION() as version`;
    
    console.log('✅ Connection successful!');
    console.log('⏰ Current time:', result[0].current_time);
    console.log('📊 Database version:', result[0].version.substring(0, 50) + '...');
    
    // Test table creation
    console.log('\n🔧 Testing table operations...');
    
    // Create a test table
    await sql`
      CREATE TABLE IF NOT EXISTS connection_test (
        id SERIAL PRIMARY KEY,
        test_message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    // Insert test data
    await sql`
      INSERT INTO connection_test (test_message) 
      VALUES ('Connection test successful!')
    `;
    
    // Query test data
    const testData = await sql`
      SELECT * FROM connection_test 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    console.log('✅ Table operations successful!');
    console.log('📝 Test data:', testData[0]);
    
    // Cleanup
    await sql`DROP TABLE connection_test`;
    console.log('🧹 Cleanup completed');
    
    console.log('\n🎉 All tests passed! Neon database is ready for the hybrid architecture.');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    process.exit(1);
  }
}

testConnection();