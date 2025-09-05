import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to projects page on load
    router.push('/projects');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          FibreFlow Next.js
        </h1>
        <p className="text-gray-600 mb-4">
          Enterprise fiber network project management
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to projects...
        </p>
      </div>
    </div>
  );
}