import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, createContext, useContext } from 'react';

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
    <DevUserContext.Provider value={mockUser}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </DevUserContext.Provider>
  );
}

export default MyApp;