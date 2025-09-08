// import { SignIn } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Development mode sign-in bypass component
const DevSignIn = () => {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to dashboard in development mode
    // This bypasses authentication entirely for easier development
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 1000); // Small delay to show loading state

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            FibreFlow Development Mode
          </h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Redirecting to dashboard...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Authentication bypass enabled for development
          </p>
        </div>
      </div>
    </div>
  );
};

export default function SignInPage() {
  // In development mode, use the bypass component
  // TODO: Replace with actual Clerk SignIn component when ready for production
  return <DevSignIn />;

  // Production code (commented out for development):
  /*
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white shadow-xl rounded-lg",
          }
        }}
        redirectUrl="/dashboard"
      />
    </div>
  );
  */
}