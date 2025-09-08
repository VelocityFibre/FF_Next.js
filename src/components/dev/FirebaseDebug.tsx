import { useEffect, useState } from 'react';
import { db } from '@/src/config/firebase';

interface FirebaseDebugInfo {
  projectId?: string;
  authDomain?: string;
  appName: string;
  environment: {
    NEXT_PUBLIC_FIREBASE_PROJECT_ID?: string;
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
  };
  error?: string;
}

export function FirebaseDebug() {
  const [debugInfo, setDebugInfo] = useState<FirebaseDebugInfo | null>(null);

  useEffect(() => {
    try {
      const info: FirebaseDebugInfo = {
        projectId: db.app.options.projectId || 'undefined',
        authDomain: db.app.options.authDomain || 'undefined', 
        appName: db.app.name,
        environment: {
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        }
      };
      setDebugInfo(info);
      // DEBUG: Firebase connection info available in debugInfo state
    } catch (error) {
      // Error caught and displayed in UI
      setDebugInfo({ 
        error: error?.toString() || 'Unknown error',
        appName: 'unknown',
        environment: {
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        }
      });
    }
  }, []);

  if (!debugInfo) return <div>Loading debug info...</div>;

  return (
    <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
      <h3 className="font-bold mb-2">🔍 Firebase Connection Debug</h3>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      <div className="mt-4 p-2 bg-yellow-100 rounded">
        <p className="text-sm">
          <strong>Expected Project ID:</strong> fibreflow-292c7<br/>
          <strong>Current Project ID:</strong> {debugInfo.projectId}<br/>
          <strong>Match:</strong> {debugInfo.projectId === 'fibreflow-292c7' ? '✅ CORRECT' : '❌ WRONG PROJECT'}
        </p>
      </div>
    </div>
  );
}