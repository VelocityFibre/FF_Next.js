/**
 * Test contractor teams functionality
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDvW-ImXptnYIX7IDR78pdruw9BAp5A8Q8",
  authDomain: "fibreflow-292c7.firebaseapp.com",
  projectId: "fibreflow-292c7",
  storageBucket: "fibreflow-292c7.firebasestorage.app",
  messagingSenderId: "178707510767",
  appId: "1:178707510767:web:a9455c8f053de03fbff21a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testTeams() {
  try {
    // Authenticate
    console.log('🔑 Authenticating...');
    await signInWithEmailAndPassword(auth, 'test@fibreflow.com', 'Test123!@#');
    console.log('✅ Authenticated\n');
    
    // Get the test contractor
    console.log('🏢 Finding test contractor...');
    const contractorsQuery = query(
      collection(db, 'contractors'),
      where('companyName', '==', 'Test Contractor Company')
    );
    const contractorsSnapshot = await getDocs(contractorsQuery);
    
    if (contractorsSnapshot.empty) {
      console.log('❌ No test contractor found. Run createTestContractor.js first.');
      process.exit(1);
    }
    
    const contractor = contractorsSnapshot.docs[0];
    const contractorId = contractor.id;
    console.log(`✅ Found contractor: ${contractor.data().companyName} (ID: ${contractorId})\n`);
    
    // Test 1: Get teams for the contractor
    console.log('📋 Test 1: Fetching teams for contractor...');
    const teamsQuery = query(
      collection(db, 'contractor_teams'),
      where('contractorId', '==', contractorId)
    );
    const teamsSnapshot = await getDocs(teamsQuery);
    
    console.log(`✅ Found ${teamsSnapshot.size} teams:`);
    teamsSnapshot.forEach(doc => {
      const team = doc.data();
      console.log(`  - ${team.teamName} (Type: ${team.teamType}, Capacity: ${team.currentCapacity}/${team.maxCapacity})`);
    });
    
    // Test 2: Get team members
    if (!teamsSnapshot.empty) {
      const teamId = teamsSnapshot.docs[0].id;
      const teamName = teamsSnapshot.docs[0].data().teamName;
      
      console.log(`\n📋 Test 2: Fetching members for team "${teamName}"...`);
      const membersQuery = query(
        collection(db, 'team_members'),
        where('teamId', '==', teamId)
      );
      const membersSnapshot = await getDocs(membersQuery);
      
      console.log(`✅ Found ${membersSnapshot.size} team members:`);
      membersSnapshot.forEach(doc => {
        const member = doc.data();
        console.log(`  - ${member.firstName} ${member.lastName} (${member.role}, ${member.skillLevel}${member.isTeamLead ? ', LEAD' : ''})`);
      });
    }
    
    // Test 3: Check all teams in database
    console.log('\n📋 Test 3: Checking all teams in database...');
    const allTeamsSnapshot = await getDocs(collection(db, 'contractor_teams'));
    console.log(`✅ Total teams in database: ${allTeamsSnapshot.size}`);
    
    const contractorIds = new Set();
    allTeamsSnapshot.forEach(doc => {
      contractorIds.add(doc.data().contractorId);
    });
    console.log(`✅ Teams belong to ${contractorIds.size} different contractors`);
    
    console.log('\n✨ All tests completed successfully!');
    console.log('\n📝 You can now:');
    console.log(`1. Navigate to: http://localhost:5174/contractors/${contractorId}`);
    console.log('2. Click on the Teams tab to manage teams');
    console.log('3. Create, edit, and delete teams and members');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testTeams();