import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Firebase configuration  
const firebaseConfig = {
  apiKey: 'AIzaSyDvW-ImXptnYIX7IDR78pdruw9BAp5A8Q8',
  authDomain: 'fibreflow-292c7.firebaseapp.com',
  projectId: 'fibreflow-292c7',
  storageBucket: 'fibreflow-292c7.firebasestorage.app',
  messagingSenderId: '178707510767',
  appId: '1:178707510767:web:a9455c8f053de03fbff21a'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log('🔥 Testing Firebase Connection...\n');

async function testConnection() {
  const results = {
    auth: false,
    firestore: false,
    collections: []
  };

  try {
    // Test Authentication
    console.log('1. Testing Authentication...');
    try {
      await signInAnonymously(auth);
      console.log('   ✅ Anonymous auth successful');
      results.auth = true;
    } catch (authError) {
      console.log('   ❌ Auth failed:', authError.message);
    }

    // Test Firestore
    console.log('\n2. Testing Firestore...');
    const testCollections = ['projects', 'users', 'staff', 'clients'];
    
    for (const collectionName of testCollections) {
      try {
        const q = query(collection(db, collectionName), limit(1));
        const snapshot = await getDocs(q);
        const docCount = snapshot.size;
        console.log(`   ✅ Collection "${collectionName}": ${docCount} doc(s) found`);
        results.collections.push({ name: collectionName, accessible: true, count: docCount });
        results.firestore = true;
      } catch (error) {
        console.log(`   ❌ Collection "${collectionName}": ${error.message}`);
        results.collections.push({ name: collectionName, accessible: false, error: error.message });
      }
    }

    // Summary
    console.log('\n📊 Connection Test Summary:');
    console.log('─'.repeat(40));
    console.log(`Authentication: ${results.auth ? '✅ Working' : '❌ Failed'}`);
    console.log(`Firestore:      ${results.firestore ? '✅ Working' : '❌ Failed'}`);
    
    if (results.firestore) {
      const accessible = results.collections.filter(c => c.accessible).length;
      console.log(`Collections:    ${accessible}/${results.collections.length} accessible`);
    }

    if (results.auth && results.firestore) {
      console.log('\n🎉 Firebase connection successful!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some Firebase services are not working properly');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the test
testConnection();