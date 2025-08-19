import { useEffect, useState } from 'react';
import { db } from '@/config/firebase';

export function FirebaseDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    try {
      const info = {
        projectId: db.app.options.projectId,
        authDomain: db.app.options.authDomain,
        appName: db.app.name,
        environment: {
          VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        }
      };
      setDebugInfo(info);
      console.log('🔍 Firebase Debug Info:', info);
    } catch (error) {
      console.error('Debug error:', error);
      setDebugInfo({ error: error?.toString() });
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