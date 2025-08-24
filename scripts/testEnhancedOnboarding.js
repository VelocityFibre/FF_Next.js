/**
 * Test Enhanced Onboarding System
 * Verifies the document upload and approval workflow
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

async function testEnhancedOnboarding() {
  try {
    console.log('🔧 Testing Enhanced Onboarding System...\n');

    // Authenticate
    console.log('🔑 Authenticating...');
    await signInWithEmailAndPassword(auth, 'test@fibreflow.com', 'Test123!@#');
    console.log('✅ Authenticated\n');

    // Get test contractor
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

    // Check existing documents
    console.log('📋 Checking existing documents...');
    const documentsQuery = query(
      collection(db, 'contractor_documents'),
      where('contractorId', '==', contractorId)
    );
    const documentsSnapshot = await getDocs(documentsQuery);
    
    console.log(`📄 Found ${documentsSnapshot.size} existing documents:`);
    
    const documentsByType = {};
    const documentsByStatus = { pending: 0, verified: 0, rejected: 0 };

    documentsSnapshot.forEach(doc => {
      const data = doc.data();
      documentsByType[data.documentType] = (documentsByType[data.documentType] || 0) + 1;
      documentsByStatus[data.verificationStatus] = (documentsByStatus[data.verificationStatus] || 0) + 1;
      
      console.log(`  - ${data.documentType}: ${data.documentName} (${data.verificationStatus})`);
    });

    console.log('\n📊 Document Summary:');
    console.log('By Type:');
    Object.entries(documentsByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    console.log('By Status:');
    Object.entries(documentsByStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // Check required document types for onboarding
    const requiredDocuments = [
      'company_registration',
      'bee_certificate',
      'tax_clearance',
      'bank_statement',
      'insurance',
      'safety_certificate'
    ];

    console.log('\n📋 Onboarding Progress Check:');
    const missingRequired = [];
    const pendingApproval = [];
    const approved = [];

    requiredDocuments.forEach(docType => {
      const hasDoc = documentsSnapshot.docs.some(doc => doc.data().documentType === docType);
      if (!hasDoc) {
        missingRequired.push(docType);
      } else {
        const doc = documentsSnapshot.docs.find(doc => doc.data().documentType === docType);
        const status = doc.data().verificationStatus;
        if (status === 'pending') {
          pendingApproval.push(docType);
        } else if (status === 'verified') {
          approved.push(docType);
        }
      }
    });

    console.log(`✅ Approved: ${approved.length}/${requiredDocuments.length}`);
    approved.forEach(doc => console.log(`  ✅ ${doc}`));
    
    console.log(`⏳ Pending Approval: ${pendingApproval.length}`);
    pendingApproval.forEach(doc => console.log(`  ⏳ ${doc}`));
    
    console.log(`❌ Missing: ${missingRequired.length}`);
    missingRequired.forEach(doc => console.log(`  ❌ ${doc}`));

    // Calculate completion percentage
    const totalRequired = requiredDocuments.length;
    const completedRequired = approved.length;
    const completionPercentage = Math.round((completedRequired / totalRequired) * 100);

    console.log(`\n🎯 Overall Progress: ${completionPercentage}%`);

    if (completionPercentage === 100) {
      console.log('🎉 All required documents approved! Contractor ready for activation.');
    } else if (pendingApproval.length > 0) {
      console.log('⏳ Documents pending admin approval');
    } else if (missingRequired.length > 0) {
      console.log('📤 Contractor needs to upload missing documents');
    }

    console.log('\n📱 Next Steps:');
    console.log(`1. Navigate to: http://localhost:5174/contractors/${contractorId}`);
    console.log('2. Click on the "Onboarding" tab');
    console.log('3. Upload missing documents or review pending approvals');
    console.log('4. For admin approval: Navigate to Admin Dashboard');
    
    console.log('\n✨ Enhanced Onboarding System Test Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testEnhancedOnboarding();