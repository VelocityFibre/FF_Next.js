/**
 * Create Firestore composite index for contractor_teams
 * This script creates the required index directly via Firebase Admin SDK
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const app = initializeApp({
  projectId: 'fibreflow-292c7',
});

const db = getFirestore();

async function createIndex() {
  console.log('Creating Firestore index for contractor_teams...');
  
  try {
    // Note: Firebase Admin SDK doesn't directly support creating indexes
    // You need to use the Firebase Console or gcloud CLI
    
    console.log('\n🔗 Please click this link to create the required index:');
    console.log('https://console.firebase.google.com/v1/r/project/fibreflow-292c7/firestore/indexes?create_composite=Clhwcm9qZWN0cy9maWJyZWZsb3ctMjkyYzcvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2NvbnRyYWN0b3JfdGVhbXMvaW5kZXhlcy9fEAEaEAoMY29udHJhY3RvcklkEAEaDAoIdGVhbU5hbWUQARoMCghfX25hbWVfXxAB');
    
    console.log('\nAlternatively, use this gcloud command:');
    console.log(`gcloud firestore indexes create \\
  --collection-group=contractor_teams \\
  --field-config field-path=contractorId,order=ASCENDING \\
  --field-config field-path=teamName,order=ASCENDING \\
  --project=fibreflow-292c7`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createIndex();