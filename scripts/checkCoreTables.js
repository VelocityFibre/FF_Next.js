/**
 * Check for core tables in Neon database
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectionString = process.env.VITE_NEON_DATABASE_URL || process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_Jq8OGXiWcYK0@ep-wandering-dew-a14qgf25-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function checkCoreTables() {
  console.log('🔍 Checking Core Tables in Neon Database...\n');
  
  const sql = neon(connectionString);
  
  const coreTables = [
    // Core entities
    { name: 'Projects', table: 'projects', critical: true },
    { name: 'Clients', table: 'clients', critical: true },
    { name: 'Staff', table: 'staff', critical: true },
    { name: 'Users', table: 'users', critical: true },
    
    // Project management
    { name: 'SOW (Statement of Work)', table: 'sow', critical: false },
    { name: 'Poles', table: 'poles', critical: false },
    { name: 'Drops', table: 'drops', critical: false },
    { name: 'Fiber Stringing', table: 'fiber_stringing', critical: false },
    { name: 'Home Installations', table: 'home_installations', critical: false },
    
    // Communication & tasks
    { name: 'Meetings', table: 'meetings', critical: false },
    { name: 'Action Items', table: 'action_items', critical: false },
    { name: 'Tasks', table: 'tasks', critical: false },
    
    // Analytics
    { name: 'Daily Progress', table: 'daily_progress', critical: false },
    { name: 'Reports', table: 'reports', critical: false },
    
    // Field operations
    { name: 'One Map Data', table: 'one_map', critical: false },
    { name: 'Nokia Equipment', table: 'nokia_equipment', critical: false }
  ];
  
  let criticalMissing = [];
  let nonCriticalMissing = [];
  let existing = [];
  
  for (const item of coreTables) {
    try {
      const result = await sql`SELECT COUNT(*) as count FROM ${sql(item.table)}`;
      console.log(`✅ ${item.name}: ${item.table} (${result[0].count} records)`);
      existing.push(item.table);
    } catch (error) {
      console.log(`❌ ${item.name}: ${item.table} - NOT FOUND`);
      if (item.critical) {
        criticalMissing.push(item);
      } else {
        nonCriticalMissing.push(item);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('CORE TABLES AUDIT RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Existing tables: ${existing.length}`);
  console.log(`❌ Missing critical tables: ${criticalMissing.length}`);
  console.log(`⚠️  Missing optional tables: ${nonCriticalMissing.length}`);
  
  if (criticalMissing.length > 0) {
    console.log('\n🚨 CRITICAL TABLES MISSING (Must be created):');
    criticalMissing.forEach(item => {
      console.log(`   - ${item.table}: ${item.name}`);
    });
    console.log('\nThese tables are essential for the application to function properly.');
  }
  
  if (nonCriticalMissing.length > 0) {
    console.log('\n⚠️  Optional tables missing (Can be created as needed):');
    nonCriticalMissing.forEach(item => {
      console.log(`   - ${item.table}: ${item.name}`);
    });
  }
  
  if (criticalMissing.length === 0) {
    console.log('\n🎉 All critical tables are present!');
  }
  
  return { criticalMissing, nonCriticalMissing, existing };
}

checkCoreTables().catch(console.error);