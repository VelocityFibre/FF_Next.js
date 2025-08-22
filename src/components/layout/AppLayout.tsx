import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
// import { useTheme } from '@/contexts/ThemeContext'; // Ready for future use
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface PageMeta {
  title: string;
  breadcrumbs?: string[];
  actions?: React.ReactNode;
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Load sidebar state from localStorage
    const saved = localStorage.getItem('fibreflow-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  
  const location = useLocation();
  const { currentUser, loading } = useAuth();
  // Theme hook ready for future use
  // const { theme } = useTheme();

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('fibreflow-sidebar-collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Get page metadata based on current route
  const getPageMeta = (): PageMeta => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    // Dashboard
    if (path.includes('dashboard')) {
      return {
        title: 'Dashboard',
        breadcrumbs: ['Home', 'Dashboard'],
      };
    }
    
    // Project Management
    if (path.includes('projects')) {
      if (segments.includes('create')) {
        return {
          title: 'Create Project',
          breadcrumbs: ['Home', 'Projects', 'Create'],
        };
      }
      if (segments.length > 2) {
        return {
          title: 'Project Details',
          breadcrumbs: ['Home', 'Projects', 'Details'],
        };
      }
      return {
        title: 'Projects',
        breadcrumbs: ['Home', 'Projects'],
      };
    }
    
    // Pole Tracker
    if (path.includes('pole-tracker')) {
      return {
        title: 'Pole Tracker',
        breadcrumbs: ['Home', 'Project Management', 'Pole Tracker'],
      };
    }
    
    // Clients
    if (path.includes('clients')) {
      if (segments.includes('create') || segments.includes('new')) {
        return {
          title: 'Add Client',
          breadcrumbs: ['Home', 'Clients', 'Add'],
        };
      }
      if (segments.length > 2) {
        return {
          title: 'Client Details',
          breadcrumbs: ['Home', 'Clients', 'Details'],
        };
      }
      return {
        title: 'Clients',
        breadcrumbs: ['Home', 'Clients'],
      };
    }
    
    // Staff Management
    if (path.includes('staff')) {
      if (segments.includes('create') || segments.includes('new')) {
        return {
          title: 'Add Staff Member',
          breadcrumbs: ['Home', 'Staff', 'Add'],
        };
      }
      if (segments.includes('import')) {
        return {
          title: 'Import Staff',
          breadcrumbs: ['Home', 'Staff', 'Import'],
        };
      }
      if (segments.includes('settings')) {
        return {
          title: 'Staff Settings',
          breadcrumbs: ['Home', 'Staff', 'Settings'],
        };
      }
      if (segments.length > 2) {
        return {
          title: 'Staff Details',
          breadcrumbs: ['Home', 'Staff', 'Details'],
        };
      }
      return {
        title: 'Staff Management',
        breadcrumbs: ['Home', 'Staff'],
      };
    }
    
    // Procurement
    if (path.includes('procurement')) {
      return {
        title: 'Procurement',
        breadcrumbs: ['Home', 'Procurement'],
      };
    }
    
    // Suppliers
    if (path.includes('suppliers')) {
      return {
        title: 'Suppliers',
        breadcrumbs: ['Home', 'Suppliers'],
      };
    }
    
    // Contractors
    if (path.includes('contractors')) {
      return {
        title: 'Contractors',
        breadcrumbs: ['Home', 'Contractors'],
      };
    }
    
    // Communications
    if (path.includes('communications') || path.includes('meetings')) {
      return {
        title: 'Communications',
        breadcrumbs: ['Home', 'Communications'],
      };
    }
    
    // Analytics & Reports
    if (path.includes('analytics') || path.includes('reports')) {
      return {
        title: 'Analytics & Reports',
        breadcrumbs: ['Home', 'Analytics'],
      };
    }
    
    // Daily Progress
    if (path.includes('daily-progress')) {
      return {
        title: 'Daily Progress',
        breadcrumbs: ['Home', 'Analytics', 'Daily Progress'],
      };
    }
    
    // Field App
    if (path.includes('field')) {
      return {
        title: 'Field App',
        breadcrumbs: ['Home', 'Field App'],
      };
    }
    
    // Settings
    if (path.includes('settings')) {
      return {
        title: 'Settings',
        breadcrumbs: ['Home', 'Settings'],
      };
    }

    // Action Items
    if (path.includes('action-items')) {
      return {
        title: 'Action Items',
        breadcrumbs: ['Home', 'Communications', 'Action Items'],
      };
    }
    
    // SOW Management
    if (path.includes('sow')) {
      return {
        title: 'SOW Management',
        breadcrumbs: ['Home', 'Project Management', 'SOW'],
      };
    }
    
    // Default
    return {
      title: 'FibreFlow',
      breadcrumbs: ['Home'],
    };
  };

  // Show loading spinner while user data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-text-secondary">Loading application...</p>
        </div>
      </div>
    );
  }

  const pageMeta = getPageMeta();

  return (
    <div className="flex h-screen bg-background-secondary overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-surface-overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <div className={`
        flex-1 flex flex-col min-w-0 transition-all duration-300
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}>
        {/* Header */}
        <Header 
          title={pageMeta.title}
          breadcrumbs={pageMeta.breadcrumbs || ['Home']}
          actions={pageMeta.actions}
          onMenuClick={() => setSidebarOpen(true)}
          user={currentUser}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background-primary">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}