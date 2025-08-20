import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FirebaseTest } from '@/components/dev/FirebaseTest';
import { StaffDebug } from '@/components/dev/StaffDebug';
import { StaffDataFix } from '@/pages/StaffDataFix';
import { LoginPage } from '@/components/auth/LoginPage';
import { useAuth } from '@/contexts/AuthContext';

// Lazy load modules and pages
const Dashboard = lazy(() => import('@/modules/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));

// Legacy pages (to be migrated to modules)
const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const Projects = lazy(() => import('@/pages/Projects').then(m => ({ default: m.Projects })));
const ProjectForm = lazy(() => import('@/pages/ProjectForm').then(m => ({ default: m.ProjectForm })));
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail').then(m => ({ default: m.ProjectDetail })));
const StaffList = lazy(() => import('@/pages/StaffList').then(m => ({ default: m.StaffList })));
const StaffForm = lazy(() => import('@/pages/StaffForm').then(m => ({ default: m.StaffForm })));
const StaffDetail = lazy(() => import('@/pages/StaffDetail').then(m => ({ default: m.StaffDetail })));
const ClientList = lazy(() => import('@/pages/ClientList').then(m => ({ default: m.ClientList })));
const ClientForm = lazy(() => import('@/pages/ClientForm').then(m => ({ default: m.ClientForm })));
const ClientDetail = lazy(() => import('@/pages/ClientDetail').then(m => ({ default: m.ClientDetail })));

// Loading component
function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background-primary">
      <LoadingSpinner size="lg" label="Loading..." />
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
}

// Define routes
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
    path: '/app',
    element: (
      <ProtectedRoute />
    ),
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<Loading />}>
                <Dashboard />
              </Suspense>
            ),
          },
          {
            path: 'projects',
            element: (
              <Suspense fallback={<Loading />}>
                <Projects />
              </Suspense>
            ),
          },
          {
            path: 'projects/new',
            element: (
              <Suspense fallback={<Loading />}>
                <ProjectForm />
              </Suspense>
            ),
          },
          {
            path: 'projects/:id/edit',
            element: (
              <Suspense fallback={<Loading />}>
                <ProjectForm />
              </Suspense>
            ),
          },
          {
            path: 'projects/:id',
            element: (
              <Suspense fallback={<Loading />}>
                <ProjectDetail />
              </Suspense>
            ),
          },
          {
            path: 'clients',
            element: (
              <Suspense fallback={<Loading />}>
                <ClientList />
              </Suspense>
            ),
          },
          {
            path: 'clients/new',
            element: (
              <Suspense fallback={<Loading />}>
                <ClientForm />
              </Suspense>
            ),
          },
          {
            path: 'clients/:id/edit',
            element: (
              <Suspense fallback={<Loading />}>
                <ClientForm />
              </Suspense>
            ),
          },
          {
            path: 'clients/:id',
            element: (
              <Suspense fallback={<Loading />}>
                <ClientDetail />
              </Suspense>
            ),
          },
          {
            path: 'procurement',
            element: <div className="bg-white rounded-lg p-6">Procurement Module (Coming Soon)</div>,
          },
          {
            path: 'staff',
            element: (
              <Suspense fallback={<Loading />}>
                <StaffList />
              </Suspense>
            ),
          },
          {
            path: 'staff/new',
            element: (
              <Suspense fallback={<Loading />}>
                <StaffForm />
              </Suspense>
            ),
          },
          {
            path: 'staff/:id/edit',
            element: (
              <Suspense fallback={<Loading />}>
                <StaffForm />
              </Suspense>
            ),
          },
          {
            path: 'staff/:id',
            element: (
              <Suspense fallback={<Loading />}>
                <StaffDetail />
              </Suspense>
            ),
          },
          {
            path: 'contractors',
            element: <div className="bg-white rounded-lg p-6">Contractors Module (Coming Soon)</div>,
          },
          {
            path: 'suppliers',
            element: <div className="bg-white rounded-lg p-6">Suppliers Module (Coming Soon)</div>,
          },
          {
            path: 'communications',
            element: <div className="bg-white rounded-lg p-6">Communications Module (Coming Soon)</div>,
          },
          {
            path: 'analytics',
            element: <div className="bg-white rounded-lg p-6">Analytics Module (Coming Soon)</div>,
          },
          {
            path: 'field',
            element: <div className="bg-white rounded-lg p-6">Field App (Coming Soon)</div>,
          },
          {
            path: 'settings',
            element: <div className="bg-white rounded-lg p-6">Settings (Coming Soon)</div>,
          },
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
          {
            path: 'pole-tracker',
            element: <div className="bg-white rounded-lg p-6">Pole Tracker (Coming Soon)</div>,
          },
          {
            path: 'sow',
            element: <div className="bg-white rounded-lg p-6">SOW Data Management (Coming Soon)</div>,
          },
          {
            path: 'tasks',
            element: <div className="bg-white rounded-lg p-6">Task Management (Coming Soon)</div>,
          },
          {
            path: 'daily-progress',
            element: <div className="bg-white rounded-lg p-6">Daily Progress (Coming Soon)</div>,
          },
          {
            path: 'kpis',
            element: <div className="bg-white rounded-lg p-6">Enhanced KPIs (Coming Soon)</div>,
          },
          {
            path: 'kpi-dashboard',
            element: <div className="bg-white rounded-lg p-6">KPI Dashboard (Coming Soon)</div>,
          },
          {
            path: 'reports',
            element: <div className="bg-white rounded-lg p-6">Reports (Coming Soon)</div>,
          },
          {
            path: 'action-items',
            element: <div className="bg-white rounded-lg p-6">Action Items (Coming Soon)</div>,
          },
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
    element: <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600">Page not found</p>
      </div>
    </div>,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}