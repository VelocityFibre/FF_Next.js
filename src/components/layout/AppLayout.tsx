import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('projects')) return 'Projects';
    if (path.includes('clients')) return 'Clients';
    if (path.includes('staff')) return 'Staff Management';
    if (path.includes('contractors')) return 'Contractors';
    if (path.includes('suppliers')) return 'Suppliers';
    if (path.includes('procurement')) return 'Procurement';
    if (path.includes('communications')) return 'Meetings';
    if (path.includes('analytics')) return 'Analytics & Reports';
    if (path.includes('field')) return 'Field App';
    if (path.includes('settings')) return 'Settings';
    if (path.includes('pole-tracker')) return 'Pole Tracker';
    if (path.includes('daily-progress')) return 'Daily Progress';
    if (path.includes('action-items')) return 'Action Items';
    if (path.includes('sow')) return 'SOW Data Management';
    if (path.includes('tasks')) return 'Task Management';
    if (path.includes('kpis')) return 'Enhanced KPIs';
    if (path.includes('kpi-dashboard')) return 'KPI Dashboard';
    if (path.includes('reports')) return 'Reports';
    return 'FibreFlow';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <Header title={getPageTitle()} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}