/**
 * Create a test user for development
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

async function createTestUser() {
  try {
    console.log('🔑 Creating test user...');
    
    const email = 'test@fibreflow.com';
    const password = 'Test123!@#';
    
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Auth user created:', user.uid);
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: email,
      name: 'Test User',
      role: 'admin',
      permissions: ['all'],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ User profile created in Firestore');
    
    console.log('\n📝 Test User Credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('UID:', user.uid);
    
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Test user already exists');
      console.log('\n📝 Test User Credentials:');
      console.log('Email: test@fibreflow.com');
      console.log('Password: Test123!@#');
    } else {
      console.error('❌ Error creating test user:', error);
    }
    process.exit(1);
  }
}

createTestUser();