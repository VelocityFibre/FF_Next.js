/**
 * Create Firestore indexes programmatically
 * This will create the required composite indexes for the application
 */

import { exec } from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);

async function createIndexes() {
  console.log('🔥 Creating Firestore Indexes...\n');
  
  const indexes = [
    {
      name: 'contractor_teams composite index',
      command: `firebase firestore:indexes:create --project fibreflow-292c7 --collection-group contractor_teams --field-config "fieldPath=contractorId,order=ASCENDING" --field-config "fieldPath=teamName,order=ASCENDING"`,
      description: 'For querying teams by contractor with ordering'
    },
    {
      name: 'contractor_documents composite index', 
      command: `firebase firestore:indexes:create --project fibreflow-292c7 --collection-group contractor_documents --field-config "fieldPath=contractorId,order=ASCENDING" --field-config "fieldPath=documentType,order=ASCENDING" --field-config "fieldPath=createdAt,order=DESCENDING"`,
      description: 'For querying documents by contractor and type'
    }
  ];
  
  for (const index of indexes) {
    console.log(`📋 Creating: ${index.name}`);
    console.log(`   Purpose: ${index.description}`);
    
    try {
      const { stdout, stderr } = await execPromise(index.command);
      if (stdout) console.log(`   ✅ Success: ${stdout}`);
      if (stderr && !stderr.includes('already exists')) {
        console.log(`   ⚠️ Warning: ${stderr}`);
      }
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`   ℹ️ Index already exists`);
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    console.log();
  }
  
  console.log('📝 Alternative: Create indexes manually via Firebase Console:\n');
  console.log('1. Go to: https://console.firebase.google.com/project/fibreflow-292c7/firestore/indexes\n');
  console.log('2. Click "Add Index"\n');
  console.log('3. Add the following indexes:\n');
  console.log('   CONTRACTOR_TEAMS INDEX:');
  console.log('   - Collection: contractor_teams');
  console.log('   - Fields:');
  console.log('     • contractorId (Ascending)');
  console.log('     • teamName (Ascending)');
  console.log('   - Query scope: Collection\n');
  console.log('   CONTRACTOR_DOCUMENTS INDEX:');
  console.log('   - Collection: contractor_documents');
  console.log('   - Fields:');
  console.log('     • contractorId (Ascending)');
  console.log('     • documentType (Ascending)');
  console.log('     • createdAt (Descending)');
  console.log('   - Query scope: Collection\n');
  
  console.log('🔗 Direct link for contractor_teams index:');
  console.log('https://console.firebase.google.com/v1/r/project/fibreflow-292c7/firestore/indexes?create_composite=Clhwcm9qZWN0cy9maWJyZWZsb3ctMjkyYzcvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2NvbnRyYWN0b3JfdGVhbXMvaW5kZXhlcy9fEAEaEAoMY29udHJhY3RvcklkEAEaDAoIdGVhbU5hbWUQARoMCghfX25hbWVfXxAB\n');
}

createIndexes().catch(console.error);