/**
 * Create a test contractor for development
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

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

async function createTestContractor() {
  try {
    // First authenticate
    console.log('🔑 Authenticating...');
    await signInWithEmailAndPassword(auth, 'test@fibreflow.com', 'Test123!@#');
    console.log('✅ Authenticated');
    
    // Check if test contractor already exists
    const q = query(collection(db, 'contractors'), where('companyName', '==', 'Test Contractor Company'));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const existingContractor = snapshot.docs[0];
      console.log('ℹ️ Test contractor already exists');
      console.log('Contractor ID:', existingContractor.id);
      
      // Create a test team for this contractor
      await createTestTeam(existingContractor.id);
      
      process.exit(0);
      return;
    }
    
    console.log('🏢 Creating test contractor...');
    
    const contractorData = {
      companyName: 'Test Contractor Company',
      registrationNumber: 'TEST-REG-001',
      taxNumber: 'TEST-TAX-001',
      beeLevel: 1,
      industryCategory: 'Telecommunications',
      
      // Contact details
      primaryContactName: 'John Doe',
      primaryContactEmail: 'john@testcontractor.com',
      primaryContactPhone: '+27 12 345 6789',
      secondaryContactName: 'Jane Smith',
      secondaryContactEmail: 'jane@testcontractor.com',
      secondaryContactPhone: '+27 98 765 4321',
      
      // Address
      physicalAddress: '123 Test Street',
      physicalCity: 'Cape Town',
      physicalProvince: 'Western Cape',
      physicalPostalCode: '8000',
      postalAddress: '123 Test Street',
      postalCity: 'Cape Town',
      postalProvince: 'Western Cape',
      postalPostalCode: '8000',
      
      // Banking
      bankName: 'Test Bank',
      accountNumber: '1234567890',
      accountType: 'Current',
      branchCode: '123456',
      
      // Capabilities
      services: ['installation', 'maintenance', 'survey'],
      certifications: ['ISO 9001', 'ISO 45001'],
      equipment: ['Fiber Splicer', 'OTDR', 'Power Meter'],
      
      // Status
      status: 'approved',
      isActive: true,
      ragOverall: 'green',
      ragCompliance: 'green',
      ragPerformance: 'green',
      ragFinancial: 'green',
      
      // Dates
      createdAt: new Date(),
      updatedAt: new Date(),
      approvedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'contractors'), contractorData);
    console.log('✅ Contractor created with ID:', docRef.id);
    
    // Create test team for this contractor
    await createTestTeam(docRef.id);
    
    console.log('\n📝 Test Contractor Details:');
    console.log('Company:', contractorData.companyName);
    console.log('ID:', docRef.id);
    console.log('Status:', contractorData.status);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test contractor:', error);
    process.exit(1);
  }
}

async function createTestTeam(contractorId) {
  try {
    console.log('\n👥 Creating test team...');
    
    const teamData = {
      contractorId: contractorId,
      teamName: 'Alpha Team',
      teamType: 'installation',
      specialization: 'Fiber Optic Installation',
      maxCapacity: 10,
      currentCapacity: 5,
      availableCapacity: 5,
      isActive: true,
      availability: 'available',
      baseLocation: 'Cape Town',
      operatingRadius: 50,
      efficiency: 95,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const teamRef = await addDoc(collection(db, 'contractor_teams'), teamData);
    console.log('✅ Team created with ID:', teamRef.id);
    
    // Create test team members
    const members = [
      {
        teamId: teamRef.id,
        contractorId: contractorId,
        firstName: 'Mike',
        lastName: 'Johnson',
        idNumber: 'TEST-ID-001',
        role: 'Team Leader',
        skillLevel: 'expert',
        isTeamLead: true,
        phoneNumber: '+27 11 111 1111',
        email: 'mike@testcontractor.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        teamId: teamRef.id,
        contractorId: contractorId,
        firstName: 'Sarah',
        lastName: 'Williams',
        idNumber: 'TEST-ID-002',
        role: 'Fiber Technician',
        skillLevel: 'senior',
        isTeamLead: false,
        phoneNumber: '+27 22 222 2222',
        email: 'sarah@testcontractor.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        teamId: teamRef.id,
        contractorId: contractorId,
        firstName: 'Tom',
        lastName: 'Brown',
        idNumber: 'TEST-ID-003',
        role: 'Fiber Technician',
        skillLevel: 'intermediate',
        isTeamLead: false,
        phoneNumber: '+27 33 333 3333',
        email: 'tom@testcontractor.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    for (const member of members) {
      const memberRef = await addDoc(collection(db, 'team_members'), member);
      console.log(`✅ Team member ${member.firstName} ${member.lastName} created`);
    }
    
    console.log('\n✨ Test data created successfully!');
  } catch (error) {
    console.error('❌ Error creating test team:', error);
    throw error;
  }
}

createTestContractor();