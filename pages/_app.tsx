import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, createContext, useContext } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { reportWebVitals } from '@/lib/performance';

// Export for Next.js Web Vitals
export { reportWebVitals };

// Dev mode mock user context
export const DevUserContext = createContext({
  user: {
    id: 'dev-user-123',
    email: 'dev@fibreflow.com',
    name: 'Dev User',
    role: 'admin'
  },
  isLoaded: true,
  isSignedIn: true
});

export const useUser = () => useContext(DevUserContext);

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 2,
            staleTime: 5 * 60 * 1000,
          },
        },
      })
  );

  const mockUser = {
    user: {
      id: 'dev-user-123',
      email: 'dev@fibreflow.com',
      name: 'Dev User',
      role: 'admin'
    },
    isLoaded: true,
    isSignedIn: true
  };

  return (
    <ErrorBoundary>
      <DevUserContext.Provider value={mockUser}>
        <AuthProvider>
          <ThemeProvider>
            <QueryClientProvider client={queryClient}>
              <Component {...pageProps} />
            </QueryClientProvider>
          </ThemeProvider>
        </AuthProvider>
      </DevUserContext.Provider>
    </ErrorBoundary>
  );
}

export default MyApp;