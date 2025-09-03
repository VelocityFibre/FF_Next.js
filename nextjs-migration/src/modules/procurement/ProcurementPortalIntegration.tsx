// 🟢 WORKING: Integration example for the new Procurement Portal
// React import removed - not using JSX in this component
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { ProcurementPortalPage } from './ProcurementPortalPage';
import {
  DashboardTab,
  BOQTab,
  RFQTab,
  QuoteEvaluationTab,
  StockMovementTab,
  PurchaseOrdersTab
} from './components/tabs';

// Import existing components for integration
import SupplierPortalPage from './suppliers/SupplierPortalPage';
import ReportsAnalyticsPage from './reports/ReportsAnalyticsPage';
import { log } from '@/lib/logger';

/**
 * Main procurement routes with the new portal structure
 * This replaces the existing procurement routing
 */
export function ProcurementPortalRoutes() {
  const [searchParams] = useSearchParams();
  
  // Get active tab from URL or default to overview
  const activeTab = searchParams.get('tab') || 'overview';

  // Render appropriate tab content based on URL and tab parameter
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardTab />;
      case 'boq':
        return <BOQTab />;
      case 'rfq':
        return <RFQTab />;
      case 'quotes':
        return <QuoteEvaluationTab />;
      case 'purchase-orders':
        return <PurchaseOrdersTab />;
      case 'stock':
        return <StockMovementTab />;
      case 'suppliers':
        return <SupplierPortalPage />;
      case 'reports':
        return <ReportsAnalyticsPage />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <Routes>
      {/* Main portal route with tab-based navigation */}
      <Route 
        path="/*" 
        element={
          <ProcurementPortalPage>
            {renderTabContent()}
          </ProcurementPortalPage>
        } 
      />
      
      {/* Legacy route redirects for backward compatibility */}
      <Route path="/overview" element={<Navigate to="/app/procurement?tab=overview" replace />} />
      <Route path="/boq/*" element={<Navigate to="/app/procurement?tab=boq" replace />} />
      <Route path="/rfq/*" element={<Navigate to="/app/procurement?tab=rfq" replace />} />
      <Route path="/quotes/*" element={<Navigate to="/app/procurement?tab=quotes" replace />} />
      <Route path="/orders/*" element={<Navigate to="/app/procurement?tab=purchase-orders" replace />} />
      <Route path="/stock/*" element={<Navigate to="/app/procurement?tab=stock" replace />} />
      <Route path="/suppliers/*" element={<Navigate to="/app/procurement?tab=suppliers" replace />} />
      <Route path="/reports/*" element={<Navigate to="/app/procurement?tab=reports" replace />} />
    </Routes>
  );
}

/**
 * Example of how to integrate with existing app routing
 * This would be added to your main App.tsx or routing configuration
 */
export function AppRoutingExample() {
  return (
    <Routes>
      {/* Other app routes */}
      <Route path="/app/dashboard" element={<div>Dashboard</div>} />
      <Route path="/app/projects/*" element={<div>Projects</div>} />
      <Route path="/app/staff/*" element={<div>Staff</div>} />
      
      {/* New Procurement Portal Route */}
      <Route 
        path="/app/procurement/*" 
        element={<ProcurementPortalRoutes />} 
      />
      
      {/* Other routes */}
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
}

/**
 * Session persistence utility for tab state
 */
export class ProcurementPortalSession {
  private static readonly STORAGE_KEY = 'procurement_portal_state';

  static saveState(state: {
    activeTab: string;
    selectedProject?: { id: string; name: string; code: string };
    viewMode: 'single' | 'all';
  }) {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        ...state,
        timestamp: Date.now()
      }));
    } catch (error) {
      log.warn('Failed to save procurement portal state:', { data: error }, 'ProcurementPortalIntegration');
    }
  }

  static loadState(): {
    activeTab?: string;
    selectedProject?: { id: string; name: string; code: string };
    viewMode?: 'single' | 'all';
  } | null {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const state = JSON.parse(stored);
      
      // Check if state is less than 1 hour old
      if (Date.now() - state.timestamp > 3600000) {
        this.clearState();
        return null;
      }

      return state;
    } catch (error) {
      log.warn('Failed to load procurement portal state:', { data: error }, 'ProcurementPortalIntegration');
      return null;
    }
  }

  static clearState() {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      log.warn('Failed to clear procurement portal state:', { data: error }, 'ProcurementPortalIntegration');
    }
  }
}

/**
 * URL utilities for deep linking and navigation
 */
export class ProcurementPortalURL {
  /**
   * Generate URL for specific tab and project
   */
  static generateURL(params: {
    tab?: string;
    project?: { id: string; name: string; code: string };
    viewMode?: 'single' | 'all';
    additionalParams?: Record<string, string>;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params.tab) {
      searchParams.set('tab', params.tab);
    }
    
    if (params.project) {
      searchParams.set('project', params.project.id);
      searchParams.set('projectName', params.project.name);
      searchParams.set('projectCode', params.project.code);
    }
    
    if (params.viewMode) {
      searchParams.set('viewMode', params.viewMode);
    }
    
    if (params.additionalParams) {
      Object.entries(params.additionalParams).forEach(([key, value]) => {
        searchParams.set(key, value);
      });
    }
    
    return `/app/procurement?${searchParams.toString()}`;
  }

  /**
   * Parse current URL to extract portal state
   */
  static parseURL(searchParams: URLSearchParams) {
    return {
      tab: searchParams.get('tab') || 'overview',
      project: searchParams.get('project') ? {
        id: searchParams.get('project')!,
        name: searchParams.get('projectName') || 'Unknown Project',
        code: searchParams.get('projectCode') || 'N/A'
      } : undefined,
      viewMode: (searchParams.get('viewMode') as 'single' | 'all') || 'single'
    };
  }
}

/**
 * Example usage in a navigation component
 */
export function NavigationExample() {
  const handleNavigate = (tab: string, projectId?: string) => {
    const project = projectId ? {
      id: projectId,
      name: 'Example Project',
      code: 'EX-2024-001'
    } : undefined;

    const url = ProcurementPortalURL.generateURL({
      tab,
      ...(project && { project }),
      viewMode: project ? 'single' : 'all'
    });

    // Use your navigation method here
    window.location.href = url;
  };

  return (
    <nav>
      <button onClick={() => handleNavigate('overview')}>
        Dashboard
      </button>
      <button onClick={() => handleNavigate('boq', 'project-1')}>
        BOQ
      </button>
      <button onClick={() => handleNavigate('rfq', 'project-1')}>
        RFQ
      </button>
      {/* More navigation items */}
    </nav>
  );
}