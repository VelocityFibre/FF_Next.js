import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator, 
  enableIndexedDbPersistence,
  enableMultiTabIndexedDbPersistence 
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
// Analytics and Performance disabled to prevent API key errors
// import { getAnalytics, isSupported } from 'firebase/analytics';
// import { getPerformance } from 'firebase/performance';

// Firebase configuration
// Note: These are public keys protected by Firebase Security Rules
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDvW-ImXptnYIX7IDR78pdruw9BAp5A8Q8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'fibreflow-292c7.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'fibreflow-292c7',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'fibreflow-292c7.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '178707510767',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:178707510767:web:a9455c8f053de03fbff21a',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-3S74XHZ49B'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics and Performance Monitoring disabled to prevent installation errors
// These features require additional API enablement in Google Cloud Console
const analytics = null;
const performance = null;

// Uncomment when APIs are enabled:
// if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
//   isSupported().then((supported) => {
//     if (supported) {
//       analytics = getAnalytics(app);
//     }
//   });
// }
// if (import.meta.env.VITE_APP_ENV === 'production') {
//   performance = getPerformance(app);
// }

// Enable offline persistence for Firestore
if (import.meta.env.VITE_ENABLE_OFFLINE === 'true') {
  // Try multi-tab persistence first, fall back to single-tab if it fails
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      enableIndexedDbPersistence(db).catch(() => {
        // Silent fail for persistence
      });
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      // The current browser doesn't support persistence
    }
  });
}

// Connect to Firebase emulators in development
if (import.meta.env.VITE_APP_ENV === 'development' && import.meta.env.VITE_USE_EMULATORS === 'true') {
  // Auth emulator
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  
  // Firestore emulator
  connectFirestoreEmulator(db, 'localhost', 8080);
  
  // Storage emulator
  connectStorageEmulator(storage, 'localhost', 9199);
  
  // Connected to Firebase emulators in development
}

// Debug logging in development
// Firebase initialized successfully

export { analytics, performance };
export default app;