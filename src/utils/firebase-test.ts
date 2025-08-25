import { auth, db } from '@/config/firebase';
import { collection, getDocs } from 'firebase/firestore';

/**
 * Test Firebase connection
 */
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    // Test Firestore connection
    const testCollection = collection(db, 'test');
    await getDocs(testCollection);
    
    // Firebase connection successful
    return true;
  } catch (error) {
    // console.error('❌ Firebase connection failed:', error);
    return false;
  }
}

/**
 * Get current auth state
 */
export function getAuthState() {
  return {
    user: auth.currentUser,
    isAuthenticated: !!auth.currentUser,
  };
}