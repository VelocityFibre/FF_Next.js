import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator, 
  enableIndexedDbPersistence,
  enableMultiTabIndexedDbPersistence 
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  ...(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID && { measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID })
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in production and if supported)
let analytics = null;
if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Initialize Performance Monitoring (only in production)
let performance = null;
if (import.meta.env.VITE_APP_ENV === 'production') {
  performance = getPerformance(app);
}

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