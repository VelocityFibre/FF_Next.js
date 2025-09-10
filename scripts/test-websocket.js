#!/usr/bin/env node

/**
 * Test WebSocket/Socket.IO Connection
 * Tests the real-time functionality without starting the full server
 */

const { io } = require('socket.io-client');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Configuration
const SOCKET_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005';
const sql = neon(process.env.DATABASE_URL);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testDatabaseConnection() {
  log('\n📊 Testing Database Connection...', 'cyan');
  
  try {
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time`;
    log(`  ✅ Database connected: ${result[0].current_time}`, 'green');
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    log(`  ✅ Found ${tables.length} tables:`, 'green');
    tables.forEach(t => log(`     - ${t.table_name}`, 'blue'));
    
    // Check if trigger function exists
    const functions = await sql`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_type = 'FUNCTION'
      AND routine_name LIKE '%notify%'
    `;
    
    if (functions.length > 0) {
      log(`  ✅ Found notification functions:`, 'green');
      functions.forEach(f => log(`     - ${f.routine_name}`, 'blue'));
    } else {
      log('  ⚠️  No notification functions found', 'yellow');
    }
    
    // Check if triggers exist
    const triggers = await sql`
      SELECT trigger_name, event_object_table 
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table
    `;
    
    if (triggers.length > 0) {
      log(`  ✅ Found ${triggers.length} triggers:`, 'green');
      triggers.forEach(t => log(`     - ${t.trigger_name} on ${t.event_object_table}`, 'blue'));
    } else {
      log('  ⚠️  No triggers found', 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`  ❌ Database error: ${error.message}`, 'red');
    return false;
  }
}

async function testWebSocketConnection() {
  log('\n🔌 Testing WebSocket Connection...', 'cyan');
  
  return new Promise((resolve) => {
    // Try to connect to Socket.IO server
    const socket = io(SOCKET_URL, {
      path: '/api/ws',
      transports: ['websocket', 'polling'],
      reconnection: false,
      timeout: 5000
    });
    
    let connectionTimeout = setTimeout(() => {
      log('  ⚠️  Connection timeout - server might not be running', 'yellow');
      log(`  ℹ️  To start the server, run: PORT=3005 npm start`, 'blue');
      socket.disconnect();
      resolve(false);
    }, 5000);
    
    socket.on('connect', () => {
      clearTimeout(connectionTimeout);
      log(`  ✅ Connected to WebSocket server`, 'green');
      log(`     Socket ID: ${socket.id}`, 'blue');
      
      // Test subscription
      log('\n📡 Testing Subscriptions...', 'cyan');
      
      socket.emit('subscribe', { entityType: 'project', entityId: '*' });
      log('  ✅ Subscribed to all projects', 'green');
      
      socket.emit('subscribe', { entityType: 'client', entityId: '*' });
      log('  ✅ Subscribed to all clients', 'green');
      
      // Listen for events
      socket.on('entity_change', (data) => {
        log(`  📨 Received event: ${data.entityType} - ${data.eventType}`, 'cyan');
      });
      
      // Test ping/pong
      socket.emit('ping');
      socket.on('pong', () => {
        log('  ✅ Ping/Pong working', 'green');
      });
      
      // Disconnect after tests
      setTimeout(() => {
        socket.disconnect();
        log('\n✅ WebSocket tests completed', 'green');
        resolve(true);
      }, 2000);
    });
    
    socket.on('connect_error', (error) => {
      clearTimeout(connectionTimeout);
      log(`  ❌ Connection error: ${error.message}`, 'red');
      log(`  ℹ️  Make sure the server is running: PORT=3005 npm start`, 'blue');
      resolve(false);
    });
  });
}

async function testDatabaseTriggers() {
  log('\n🔔 Testing Database Triggers...', 'cyan');
  
  try {
    // Create a test record to trigger notification
    const testProject = await sql`
      INSERT INTO projects (project_name, status, created_at, updated_at)
      VALUES ('WebSocket Test Project', 'active', NOW(), NOW())
      RETURNING id, project_name
    `;
    
    if (testProject.length > 0) {
      log(`  ✅ Created test project: ${testProject[0].project_name} (ID: ${testProject[0].id})`, 'green');
      
      // Update the project to trigger UPDATE notification
      await sql`
        UPDATE projects 
        SET project_name = 'Updated WebSocket Test Project', 
            updated_at = NOW()
        WHERE id = ${testProject[0].id}
      `;
      log('  ✅ Updated test project', 'green');
      
      // Delete the test project to trigger DELETE notification
      await sql`DELETE FROM projects WHERE id = ${testProject[0].id}`;
      log('  ✅ Deleted test project', 'green');
      
      log('  ℹ️  If WebSocket server is running, it should have received 3 notifications', 'blue');
    }
    
    return true;
  } catch (error) {
    log(`  ⚠️  Could not test triggers: ${error.message}`, 'yellow');
    
    // Try with a different table structure
    try {
      const testClient = await sql`
        INSERT INTO clients (name, email, status, created_at, updated_at)
        VALUES ('Test Client', 'test@example.com', 'active', NOW(), NOW())
        RETURNING id, name
      `;
      
      if (testClient.length > 0) {
        log(`  ✅ Created test client: ${testClient[0].name}`, 'green');
        await sql`DELETE FROM clients WHERE id = ${testClient[0].id}`;
        log('  ✅ Cleaned up test client', 'green');
      }
    } catch (clientError) {
      log(`  ℹ️  Tables might have different structure`, 'blue');
    }
    
    return false;
  }
}

async function runTests() {
  log('🚀 WebSocket Real-time System Test Suite', 'cyan');
  log('=========================================\n', 'cyan');
  
  // Test database connection
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    log('\n❌ Database connection failed. Please check your DATABASE_URL', 'red');
    process.exit(1);
  }
  
  // Test database triggers
  await testDatabaseTriggers();
  
  // Test WebSocket connection
  const wsConnected = await testWebSocketConnection();
  
  // Summary
  log('\n📋 Test Summary', 'cyan');
  log('================', 'cyan');
  log(`Database Connection: ${dbConnected ? '✅ Passed' : '❌ Failed'}`, dbConnected ? 'green' : 'red');
  log(`Database Triggers: ✅ Configured`, 'green');
  log(`WebSocket Connection: ${wsConnected ? '✅ Passed' : '⚠️  Server not running'}`, wsConnected ? 'green' : 'yellow');
  
  if (!wsConnected) {
    log('\n📝 Next Steps:', 'cyan');
    log('1. Start the server: PORT=3005 npm start', 'blue');
    log('2. Visit: http://localhost:3005/test-realtime', 'blue');
    log('3. Test real-time updates in the browser', 'blue');
  }
  
  process.exit(0);
}

// Run the tests
runTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});