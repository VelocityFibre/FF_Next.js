import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { FirebaseTest } from '@/components/dev/FirebaseTest';
import { StaffDebug } from '@/components/dev/StaffDebug';
import { StaffDataFix } from '@/pages/StaffDataFix';
import { LoginPage } from '@/components/auth/LoginPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Dashboard, VFThemeTest } from './lazyImports';
import { ProtectedRoute, Loading, NotFound } from './components';
import { projectRoutes } from './routes/projectRoutes';
import { moduleRoutes } from './routes/moduleRoutes';
import { procurementRoutes } from './routes/procurementRoutes';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/test/vf-theme',
    element: (
      <Suspense fallback={<Loading />}>
        <VFThemeTest />
      </Suspense>
    ),
  },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        element: (
          <ErrorBoundary>
            <AppLayout />
          </ErrorBoundary>
        ),
        children: [
          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<Loading />}>
                <Dashboard />
              </Suspense>
            ),
          },
          // Project routes
          ...projectRoutes,
          // Module routes
          ...moduleRoutes,
          // Procurement routes (nested)
          procurementRoutes,
          // Debug routes
          {
            path: 'firebase-test',
            element: <FirebaseTest />,
          },
          {
            path: 'staff-debug',
            element: <StaffDebug />,
          },
          {
            path: 'staff-fix',
            element: <StaffDataFix />,
          },
          // Default redirect
          {
            path: '',
            element: <Navigate to="/app/dashboard" replace />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
export function AppRouter() {
  return <RouterProvider router={router} />;
}