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
const VFThemeTest = lazy(() => import('@/pages/test/VFThemeTest'));

// Module pages
const ClientsPage = lazy(() => import('@/modules/clients/ClientsPage').then(m => ({ default: m.ClientsPage })));
const ClientCreatePage = lazy(() => import('@/modules/clients/ClientCreatePage').then(m => ({ default: m.ClientCreatePage })));
const ClientEditPage = lazy(() => import('@/modules/clients/ClientEditPage').then(m => ({ default: m.ClientEditPage })));
const ClientDetailPage = lazy(() => import('@/modules/clients/ClientDetailPage').then(m => ({ default: m.ClientDetailPage })));

const StaffPage = lazy(() => import('@/modules/staff/StaffPage').then(m => ({ default: m.StaffPage })));
const StaffCreatePage = lazy(() => import('@/modules/staff/StaffCreatePage').then(m => ({ default: m.StaffCreatePage })));
const StaffEditPage = lazy(() => import('@/modules/staff/StaffEditPage').then(m => ({ default: m.StaffEditPage })));
const StaffDetailPage = lazy(() => import('@/modules/staff/StaffDetailPage').then(m => ({ default: m.StaffDetailPage })));

// Procurement Module
const ProcurementPage = lazy(() => import('@/modules/procurement/ProcurementPage').then(m => ({ default: m.ProcurementPage })));
const ProcurementOverview = lazy(() => import('@/modules/procurement/ProcurementOverview').then(m => ({ default: m.ProcurementOverview })));
const BOQListPage = lazy(() => import('@/modules/procurement/boq/BOQListPage').then(m => ({ default: m.BOQListPage })));
const RFQListPage = lazy(() => import('@/modules/procurement/rfq/RFQListPage').then(m => ({ default: m.RFQListPage })));

// Suppliers Module
const SuppliersPage = lazy(() => import('@/modules/suppliers/SuppliersPage').then(m => ({ default: m.SuppliersPage })));

// Communications Module
const MeetingsDashboard = lazy(() => import('@/modules/meetings/MeetingsDashboard').then(m => ({ default: m.MeetingsDashboard })));
const ActionItemsDashboard = lazy(() => import('@/modules/action-items/ActionItemsDashboard').then(m => ({ default: m.ActionItemsDashboard })));
const TasksDashboard = lazy(() => import('@/modules/tasks/TasksDashboard').then(m => ({ default: m.TasksDashboard })));

// Project Management Module Extensions
const SOWDashboard = lazy(() => import('@/modules/sow/SOWDashboard').then(m => ({ default: m.SOWDashboard })));
const OneMapDashboard = lazy(() => import('@/modules/onemap/OneMapDashboard').then(m => ({ default: m.OneMapDashboard })));
const NokiaEquipmentDashboard = lazy(() => import('@/modules/nokia-equipment/NokiaEquipmentDashboard').then(m => ({ default: m.NokiaEquipmentDashboard })));

// Project Management Module Extensions
const PoleTrackerDashboard = lazy(() => import('@/modules/projects/pole-tracker/PoleTrackerDashboard').then(m => ({ default: m.PoleTrackerDashboard })));
const PoleTrackerList = lazy(() => import('@/modules/projects/pole-tracker/PoleTrackerList').then(m => ({ default: m.PoleTrackerList })));
const UnifiedTrackerGrid = lazy(() => import('@/modules/projects/tracker/UnifiedTrackerGrid').then(m => ({ default: m.UnifiedTrackerGrid })));

// Analytics Module
const DailyProgressDashboard = lazy(() => import('@/modules/daily-progress/DailyProgressDashboard').then(m => ({ default: m.DailyProgressDashboard })));
const EnhancedKPIDashboard = lazy(() => import('@/modules/kpis/EnhancedKPIDashboard').then(m => ({ default: m.EnhancedKPIDashboard })));
const KPIDashboard = lazy(() => import('@/modules/kpi-dashboard/KPIDashboard').then(m => ({ default: m.KPIDashboard })));
const ReportsDashboard = lazy(() => import('@/modules/reports/ReportsDashboard').then(m => ({ default: m.ReportsDashboard })));

// Legacy pages (to be migrated to modules)
const Projects = lazy(() => import('@/pages/Projects').then(m => ({ default: m.Projects })));
const ProjectForm = lazy(() => import('@/pages/ProjectForm').then(m => ({ default: m.ProjectForm })));
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail').then(m => ({ default: m.ProjectDetail })));
const Settings = lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })));

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
    path: '/test/vf-theme',
    element: (
      <Suspense fallback={<Loading />}>
        <VFThemeTest />
      </Suspense>
    ),
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
                <ClientsPage />
              </Suspense>
            ),
          },
          {
            path: 'clients/new',
            element: (
              <Suspense fallback={<Loading />}>
                <ClientCreatePage />
              </Suspense>
            ),
          },
          {
            path: 'clients/:id/edit',
            element: (
              <Suspense fallback={<Loading />}>
                <ClientEditPage />
              </Suspense>
            ),
          },
          {
            path: 'clients/:id',
            element: (
              <Suspense fallback={<Loading />}>
                <ClientDetailPage />
              </Suspense>
            ),
          },
          {
            path: 'procurement',
            element: (
              <Suspense fallback={<Loading />}>
                <ProcurementPage />
              </Suspense>
            ),
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<Loading />}>
                    <ProcurementOverview />
                  </Suspense>
                ),
              },
              {
                path: 'boq',
                element: (
                  <Suspense fallback={<Loading />}>
                    <BOQListPage />
                  </Suspense>
                ),
              },
              {
                path: 'rfq',
                element: (
                  <Suspense fallback={<Loading />}>
                    <RFQListPage />
                  </Suspense>
                ),
              },
              {
                path: 'stock',
                element: <div className="p-6">Stock Management (Coming Soon)</div>,
              },
              {
                path: 'orders',
                element: <div className="p-6">Purchase Orders (Coming Soon)</div>,
              },
              {
                path: 'suppliers',
                element: <div className="p-6">Supplier Management (Coming Soon)</div>,
              },
            ],
          },
          {
            path: 'staff',
            element: (
              <Suspense fallback={<Loading />}>
                <StaffPage />
              </Suspense>
            ),
          },
          {
            path: 'staff/new',
            element: (
              <Suspense fallback={<Loading />}>
                <StaffCreatePage />
              </Suspense>
            ),
          },
          {
            path: 'staff/:id/edit',
            element: (
              <Suspense fallback={<Loading />}>
                <StaffEditPage />
              </Suspense>
            ),
          },
          {
            path: 'staff/:id',
            element: (
              <Suspense fallback={<Loading />}>
                <StaffDetailPage />
              </Suspense>
            ),
          },
          {
            path: 'contractors',
            element: <div className="bg-white rounded-lg p-6">Contractors Module (Coming Soon)</div>,
          },
          {
            path: 'suppliers',
            element: (
              <Suspense fallback={<Loading />}>
                <SuppliersPage />
              </Suspense>
            ),
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
            element: (
              <Suspense fallback={<Loading />}>
                <Settings />
              </Suspense>
            ),
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
            path: 'meetings',
            element: (
              <Suspense fallback={<Loading />}>
                <MeetingsDashboard />
              </Suspense>
            ),
          },
          {
            path: 'sow',
            element: (
              <Suspense fallback={<Loading />}>
                <SOWDashboard />
              </Suspense>
            ),
          },
          {
            path: 'onemap',
            element: (
              <Suspense fallback={<Loading />}>
                <OneMapDashboard />
              </Suspense>
            ),
          },
          {
            path: 'nokia-equipment',
            element: (
              <Suspense fallback={<Loading />}>
                <NokiaEquipmentDashboard />
              </Suspense>
            ),
          },
          {
            path: 'tasks',
            element: (
              <Suspense fallback={<Loading />}>
                <TasksDashboard />
              </Suspense>
            ),
          },
          {
            path: 'daily-progress',
            element: (
              <Suspense fallback={<Loading />}>
                <DailyProgressDashboard />
              </Suspense>
            ),
          },
          {
            path: 'enhanced-kpis',
            element: (
              <Suspense fallback={<Loading />}>
                <EnhancedKPIDashboard />
              </Suspense>
            ),
          },
          {
            path: 'kpi-dashboard',
            element: (
              <Suspense fallback={<Loading />}>
                <KPIDashboard />
              </Suspense>
            ),
          },
          {
            path: 'reports',
            element: (
              <Suspense fallback={<Loading />}>
                <ReportsDashboard />
              </Suspense>
            ),
          },
          {
            path: 'action-items',
            element: (
              <Suspense fallback={<Loading />}>
                <ActionItemsDashboard />
              </Suspense>
            ),
          },
          {
            path: 'pole-tracker',
            element: (
              <Suspense fallback={<Loading />}>
                <PoleTrackerDashboard />
              </Suspense>
            ),
          },
          {
            path: 'pole-tracker/list',
            element: (
              <Suspense fallback={<Loading />}>
                <PoleTrackerList />
              </Suspense>
            ),
          },
          {
            path: 'projects/:projectId/tracker',
            element: (
              <Suspense fallback={<Loading />}>
                <UnifiedTrackerGrid />
              </Suspense>
            ),
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