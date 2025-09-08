/**
 * Firebase Configuration - Mock Implementation
 * This is a mock implementation since the app has migrated to Clerk authentication.
 * Firebase references are kept for backward compatibility but don't perform actual operations.
 */

// Mock Firebase app
const app = {
  name: 'mock-app',
  options: {},
  automaticDataCollectionEnabled: false
};

// Mock Firestore database
export const db = {
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ exists: () => false, data: () => null }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve(),
      onSnapshot: () => () => {}
    }),
    add: () => Promise.resolve({ id: 'mock-id' }),
    where: () => ({
      get: () => Promise.resolve({ docs: [], empty: true }),
      onSnapshot: () => () => {}
    }),
    get: () => Promise.resolve({ docs: [], empty: true }),
    onSnapshot: () => () => {}
  })
};

// Mock Auth
export const auth = {
  currentUser: null,
  onAuthStateChanged: () => () => {},
  signOut: () => Promise.resolve(),
  signInWithEmailAndPassword: () => Promise.reject(new Error('Use Clerk authentication')),
  createUserWithEmailAndPassword: () => Promise.reject(new Error('Use Clerk authentication'))
};

// Mock Storage
export const storage = {
  ref: () => ({
    put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('mock-url') } }),
    getDownloadURL: () => Promise.resolve('mock-url'),
    delete: () => Promise.resolve()
  })
};

// Mock Analytics
let analytics: any = {
  logEvent: () => {},
  setUserId: () => {},
  setUserProperties: () => {}
};

export { app, analytics };