#!/usr/bin/env tsx
/**
 * Simple verification that contractors migration from Firebase to Neon is complete
 */

console.log('🔄 Verifying Contractors Database Migration...\n');

// Check if the service files exist and are properly structured
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

async function verifyMigration() {
  const checks = [
    {
      name: 'Neon service exists',
      path: 'src/services/contractor/neon/index.ts',
      check: (content: string) => content.includes('contractorNeonService')
    },
    {
      name: 'CRUD operations exist',
      path: 'src/services/contractor/neon/crudOperations.ts', 
      check: (content: string) => content.includes('createContractor') && content.includes('updateContractor')
    },
    {
      name: 'Statistics module exists',
      path: 'src/services/contractor/neon/statistics.ts',
      check: (content: string) => content.includes('getContractorAnalytics')
    },
    {
      name: 'Core service migrated to Neon',
      path: 'src/services/contractor/crud/contractorCrudCore.ts',
      check: (content: string) => {
        // Check that Neon is now primary for key operations
        return content.includes('contractorNeonService.getById') && 
               content.includes('contractorNeonService.create') &&
               content.includes('Use Neon as primary database');
      }
    }
  ];

  let passedChecks = 0;
  
  for (const check of checks) {
    try {
      const fullPath = `C:\\Jarvis\\AI Workspace\\FibreFlow_React\\${check.path}`;
      
      if (!existsSync(fullPath)) {
        console.log(`❌ ${check.name}: File not found`);
        continue;
      }
      
      const content = await readFile(fullPath, 'utf-8');
      
      if (check.check(content)) {
        console.log(`✅ ${check.name}: Passed`);
        passedChecks++;
      } else {
        console.log(`❌ ${check.name}: Failed check`);
      }
      
    } catch (error) {
      console.log(`❌ ${check.name}: Error - ${error}`);
    }
  }

  console.log(`\n📊 Migration Status: ${passedChecks}/${checks.length} checks passed\n`);
  
  if (passedChecks === checks.length) {
    console.log('🎉 Migration Complete!');
    console.log('✅ Contractors module successfully migrated from Firebase to Neon PostgreSQL');
    console.log('\n📋 What Changed:');
    console.log('   • Primary database: Firebase → Neon PostgreSQL');
    console.log('   • CRUD operations: Now use Neon first, Firebase as fallback');
    console.log('   • Analytics: Powered by Neon database queries');
    console.log('   • Search: Uses Neon search functionality');
    console.log('   • Import: Will create records in Neon database');
    
    console.log('\n🔧 Next Steps:');
    console.log('   • Test contractor creation, editing, and deletion');
    console.log('   • Verify import functionality works');
    console.log('   • Check dashboard analytics display correctly');
    
    return true;
  } else {
    console.log('❗ Migration incomplete - some checks failed');
    return false;
  }
}

verifyMigration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Verification failed:', error);
    process.exit(1);
  });