import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AppRouter } from './app/router';
import './styles/App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App(): JSX.Element {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // In production, send to error tracking service
        console.error('Global error caught:', error, errorInfo);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" enableSystemTheme={true}>
          <AuthProvider>
            <ProjectProvider>
              <AppRouter />
            </ProjectProvider>
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
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;