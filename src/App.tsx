import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { DatabaseErrorBoundary } from '@/components/error/DatabaseErrorBoundary';
import { DatabaseHealthIndicator } from '@/components/database/DatabaseHealthIndicator';
import { AppRouter } from './app/router';
import { log } from '@/lib/logger';
import './styles/App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on critical database errors
        if (error && typeof error === 'object') {
          const errorMessage = 'message' in error ? (error as any).message : '';
          
          // Critical database errors - don't retry to prevent infinite loops
          if (errorMessage.includes('password authentication failed') || 
              errorMessage.includes('connection refused') ||
              errorMessage.includes('network error') ||
              errorMessage.includes('NeonDbError') ||
              errorMessage.includes('ECONNREFUSED') ||
              errorMessage.includes('database connection') ||
              errorMessage.includes('timeout') ||
              errorMessage.includes('SSL connection')) {
            return false;
          }
        }
        
        // For other errors, retry with exponential backoff (max 2 retries)
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      refetchOnWindowFocus: false, // Prevent excessive refetches
      refetchOnReconnect: 'always', // Only refetch when network reconnects
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations on auth errors
        if (error && typeof error === 'object') {
          const errorMessage = 'message' in error ? (error as any).message : '';
          if (errorMessage.includes('password authentication failed') || 
              errorMessage.includes('connection refused')) {
            return false;
          }
        }
        return failureCount < 1; // Only retry once for mutations
      },
    },
  },
});

function App(): JSX.Element {
  return (
    <ErrorBoundary
      onError={(_error, _errorInfo) => {
        // In production, send to error tracking service
        if (process.env.NODE_ENV === 'development') {
          // log.error('Global error caught:', { data: error, errorInfo }, 'App');
        }
      }}
    >
      <DatabaseErrorBoundary
        onError={(error, errorInfo) => {
          // Log database-specific errors
          log.error('Database Error Boundary triggered', { error, errorInfo }, 'App');
        }}
      >
        <QueryClientProvider client={queryClient}>
          <DatabaseHealthIndicator>
            <ThemeProvider defaultTheme="light" enableSystemTheme={true}>
              <AuthProvider>
                <ProjectProvider>
                  <AppRouter />
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#ffffff',
                        color: '#374151',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        padding: '16px',
                        fontSize: '14px',
                        fontWeight: '500',
                      },
                      success: {
                        iconTheme: {
                          primary: '#10b981',
                          secondary: '#ffffff',
                        },
                      },
                      error: {
                        iconTheme: {
                          primary: '#ef4444',
                          secondary: '#ffffff',
                        },
                      },
                    }}
                  />
                </ProjectProvider>
              </AuthProvider>
        </ThemeProvider>
        </DatabaseHealthIndicator>
      </QueryClientProvider>
      </DatabaseErrorBoundary>
    </ErrorBoundary>
  );
}

export default App;