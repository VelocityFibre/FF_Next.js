import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { FirebaseDebug } from './FirebaseDebug';

export function FirebaseTest() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('test123456');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (isSignUp: boolean) => {
    setIsLoading(true);
    setResult('');
    
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        setResult('✅ Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setResult('✅ Signed in successfully!');
      }
    } catch (error: any) {
      setResult(`❌ Auth Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setResult('✅ Signed out successfully!');
    } catch (error: any) {
      setResult(`❌ Sign out error: ${error.message}`);
    }
  };

  const testFirestoreConnection = async () => {
    setIsLoading(true);
    setResult('');

    try {
      // Test Firestore connection by fetching projects
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const projectCount = querySnapshot.size;
      
      setResult(`✅ Firestore connection successful! Found ${projectCount} projects in database.`);
    } catch (error: any) {
      setResult(`❌ Connection Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const currentUser = auth.currentUser;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">🔥 Firebase Test Panel</h2>
      
      <div className="space-y-6">
        {/* Debug Info */}
        <FirebaseDebug />
        {/* Auth Status */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Authentication Status:</h3>
          <p className={currentUser ? 'text-green-600' : 'text-red-600'}>
            {currentUser ? `✅ Signed in as: ${currentUser.email}` : '❌ Not authenticated'}
          </p>
        </div>

        {/* Auth Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleAuth(false)}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Sign In
            </button>
            <button
              onClick={() => handleAuth(true)}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Sign Up
            </button>
            <button
              onClick={handleSignOut}
              disabled={!currentUser}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Firestore Test */}
        <div className="space-y-4">
          <button
            onClick={testFirestoreConnection}
            disabled={isLoading || !currentUser}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            Test Firestore Connection
          </button>
          <p className="text-sm text-gray-600">
            Note: You must be authenticated to test Firestore operations
          </p>
        </div>

        {/* Results */}
        {result && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Result:</h3>
            <p className="text-sm">{result}</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-600 bg-blue-100">
              <div className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600">
                <div className="rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
              Testing...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}