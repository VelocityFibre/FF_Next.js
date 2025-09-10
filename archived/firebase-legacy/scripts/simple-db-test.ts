/**
 * Simple Database Test - Firebase & Neon
 * Focused test for database connections and basic operations
 */

import { neon } from '@neondatabase/serverless';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import * as dotenv from 'dotenv';

dotenv.config();

// Database configurations
const neonUrl = process.env.VITE_NEON_DATABASE_URL || process.env.DATABASE_URL;
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

async function testDatabases() {
  console.log('🔍 FibreFlow Database Test Suite');
  console.log('==============================\n');

  const results = {
    neon: { status: 'PENDING', details: '', duration: 0 },
    firebase: { status: 'PENDING', details: '', duration: 0 }
  };

  // Test Neon PostgreSQL
  console.log('1. Testing Neon PostgreSQL...');
  const neonStart = Date.now();
  try {
    if (!neonUrl) {
      throw new Error('Neon URL not found');
    }

    const sql = neon(neonUrl);
    
    // Test connection
    const timeResult = await sql`SELECT NOW() as current_time`;
    console.log(`   ✅ Connection successful at ${timeResult[0].current_time}`);
    
    // Test database info
    const dbInfo = await sql`SELECT current_database() as db_name, current_user as user_name`;
    console.log(`   ✅ Database: ${dbInfo[0].db_name}, User: ${dbInfo[0].user_name}`);
    
    // Test table count
    const tables = await sql`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;
    console.log(`   ✅ Tables found: ${tables[0].count}`);
    
    // Test data count from key tables
    try {
      const staffCount = await sql`SELECT COUNT(*) as count FROM staff`;
      const contractorCount = await sql`SELECT COUNT(*) as count FROM contractors`;
      const projectCount = await sql`SELECT COUNT(*) as count FROM projects`;
      
      console.log(`   📊 Data summary:`);
      console.log(`      Staff: ${staffCount[0].count} records`);
      console.log(`      Contractors: ${contractorCount[0].count} records`);
      console.log(`      Projects: ${projectCount[0].count} records`);
    } catch (e) {
      console.log(`   ⚠️ Some tables may be empty or not exist yet`);
    }

    results.neon.status = 'PASS';
    results.neon.details = `Connected to ${dbInfo[0].db_name} with ${tables[0].count} tables`;
    
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.message}`);
    results.neon.status = 'FAIL';
    results.neon.details = error.message;
  }
  results.neon.duration = Date.now() - neonStart;

  // Test Firebase
  console.log('\n2. Testing Firebase Firestore...');
  const firebaseStart = Date.now();
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    
    // Authenticate anonymously
    await signInAnonymously(auth);
    console.log('   ✅ Anonymous authentication successful');
    
    // Test document operations
    const testDoc = doc(db, 'database_tests', 'connection_test');
    
    // Write test
    await setDoc(testDoc, {
      timestamp: new Date(),
      test: 'connection_test',
      status: 'testing'
    });
    console.log('   ✅ Document write successful');
    
    // Read test
    const docSnap = await getDoc(testDoc);
    if (docSnap.exists()) {
      console.log('   ✅ Document read successful');
      console.log(`   📄 Document data: ${JSON.stringify(docSnap.data(), null, 2).substring(0, 100)}...`);
    } else {
      throw new Error('Document not found after write');
    }
    
    // Cleanup
    await deleteDoc(testDoc);
    console.log('   ✅ Document cleanup successful');
    
    results.firebase.status = 'PASS';
    results.firebase.details = `Connected to ${firebaseConfig.projectId}`;
    
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.message}`);
    results.firebase.status = 'FAIL';
    results.firebase.details = error.message;
  }
  results.firebase.duration = Date.now() - firebaseStart;

  // Summary Report
  console.log('\n📊 Test Results Summary');
  console.log('======================');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r.status === 'PASS').length;
  const failedTests = totalTests - passedTests;
  
  console.log(`\n📈 Overall Results:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   ✅ Passed: ${passedTests}`);
  console.log(`   ❌ Failed: ${failedTests}`);
  console.log(`   📊 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  console.log(`\n📋 Detailed Results:`);
  Object.entries(results).forEach(([db, result]) => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`   ${icon} ${db.toUpperCase()}: ${result.details} (${result.duration}ms)`);
  });

  // Recommendations
  console.log(`\n💡 Recommendations:`);
  if (results.neon.status === 'PASS' && results.firebase.status === 'PASS') {
    console.log('   🎉 Both databases are operational and ready for production!');
    console.log('   📈 Consider running comprehensive schema validation');
    console.log('   🔄 Set up monitoring for connection health');
  } else {
    if (results.neon.status === 'FAIL') {
      console.log('   🔧 Fix Neon PostgreSQL connection issues');
      console.log('   🔍 Check DATABASE_URL environment variable');
    }
    if (results.firebase.status === 'FAIL') {
      console.log('   🔧 Fix Firebase connection issues');
      console.log('   🔍 Check Firebase configuration variables');
    }
  }

  console.log(`\n✨ Database testing completed!`);
  
  // Exit with error code if any tests failed
  if (failedTests > 0) {
    process.exit(1);
  }
}

// Run tests
testDatabases().catch(console.error);