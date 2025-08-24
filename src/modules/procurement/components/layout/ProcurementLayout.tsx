// import React from 'react'; // Not used in this component
import { Outlet, useLocation } from 'react-router-dom';
import { ProcurementErrorBoundary } from '../error/ProcurementErrorBoundary';
// import { ProcurementBreadcrumbs } from '../common/ProcurementBreadcrumbs'; // Not used in this component
import { ProcurementPageHeader } from './ProcurementPageHeader';
import { useProcurementPermissions } from '../../hooks/useProcurementPermissions';
import { useProjectContext } from '@/contexts/ProjectContext'; // Assuming this exists

/**
 * Main layout wrapper for all procurement pages
 * Provides consistent structure, error boundaries, and navigation
 * Following FibreFlow Universal Module Structure
 */
export function ProcurementLayout() {
  const location = useLocation();
  const { currentProject } = useProjectContext() || {};
  const permissions = useProcurementPermissions(currentProject?.id);

  // Get page metadata based on current route
  const getPageMeta = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    // Procurement Dashboard
    if (path.endsWith('/procurement') || path.endsWith('/procurement/')) {
      return {
        title: 'Procurement Dashboard',
        breadcrumbs: [
          { label: 'Home', path: '/app/dashboard' },
          { label: 'Procurement', isActive: true }
        ],
        helpText: 'Manage BOQs, RFQs, suppliers, and procurement processes'
      };
    }

    // BOQ Management
    if (path.includes('/boq')) {
      if (segments.includes('create')) {
        return {
          title: 'Create BOQ',
          breadcrumbs: [
            { label: 'Home', path: '/app/dashboard' },
            { label: 'Procurement', path: '/app/procurement' },
            { label: 'BOQ', path: '/app/procurement/boq' },
            { label: 'Create', isActive: true }
          ]
        };
      }
      if (segments.length > 4) { // Has BOQ ID
        return {
          title: 'BOQ Details',
          breadcrumbs: [
            { label: 'Home', path: '/app/dashboard' },
            { label: 'Procurement', path: '/app/procurement' },
            { label: 'BOQ', path: '/app/procurement/boq' },
            { label: 'Details', isActive: true }
          ]
        };
      }
      return {
        title: 'Bill of Quantities',
        breadcrumbs: [
          { label: 'Home', path: '/app/dashboard' },
          { label: 'Procurement', path: '/app/procurement' },
          { label: 'BOQ', isActive: true }
        ],
        helpText: 'Upload, map, and manage project BOQs'
      };
    }

    // RFQ Management
    if (path.includes('/rfq')) {
      if (segments.includes('create')) {
        return {
          title: 'Create RFQ',
          breadcrumbs: [
            { label: 'Home', path: '/app/dashboard' },
            { label: 'Procurement', path: '/app/procurement' },
            { label: 'RFQ', path: '/app/procurement/rfq' },
            { label: 'Create', isActive: true }
          ]
        };
      }
      if (segments.length > 4) { // Has RFQ ID
        return {
          title: 'RFQ Details',
          breadcrumbs: [
            { label: 'Home', path: '/app/dashboard' },
            { label: 'Procurement', path: '/app/procurement' },
            { label: 'RFQ', path: '/app/procurement/rfq' },
            { label: 'Details', isActive: true }
          ]
        };
      }
      return {
        title: 'Request for Quote',
        breadcrumbs: [
          { label: 'Home', path: '/app/dashboard' },
          { label: 'Procurement', path: '/app/procurement' },
          { label: 'RFQ', isActive: true }
        ],
        helpText: 'Create and manage RFQs and quote evaluations'
      };
    }

    // Quote Evaluation
    if (path.includes('/quotes')) {
      return {
        title: 'Quote Evaluation',
        breadcrumbs: [
          { label: 'Home', path: '/app/dashboard' },
          { label: 'Procurement', path: '/app/procurement' },
          { label: 'Quotes', isActive: true }
        ],
        helpText: 'Compare, evaluate, and award quotes'
      };
    }

    // Stock Management
    if (path.includes('/stock')) {
      return {
        title: 'Stock Management',
        breadcrumbs: [
          { label: 'Home', path: '/app/dashboard' },
          { label: 'Procurement', path: '/app/procurement' },
          { label: 'Stock', isActive: true }
        ],
        helpText: 'Track inventory, movements, and drum usage'
      };
    }

    // Purchase Orders
    if (path.includes('/orders')) {
      if (segments.includes('create')) {
        return {
          title: 'Create Purchase Order',
          breadcrumbs: [
            { label: 'Home', path: '/app/dashboard' },
            { label: 'Procurement', path: '/app/procurement' },
            { label: 'Orders', path: '/app/procurement/orders' },
            { label: 'Create', isActive: true }
          ]
        };
      }
      if (segments.length > 4) { // Has Order ID
        return {
          title: 'Purchase Order Details',
          breadcrumbs: [
            { label: 'Home', path: '/app/dashboard' },
            { label: 'Procurement', path: '/app/procurement' },
            { label: 'Orders', path: '/app/procurement/orders' },
            { label: 'Details', isActive: true }
          ]
        };
      }
      return {
        title: 'Purchase Orders',
        breadcrumbs: [
          { label: 'Home', path: '/app/dashboard' },
          { label: 'Procurement', path: '/app/procurement' },
          { label: 'Orders', isActive: true }
        ],
        helpText: 'Create and manage purchase orders'
      };
    }

    // Suppliers
    if (path.includes('/suppliers')) {
      return {
        title: 'Suppliers',
        breadcrumbs: [
          { label: 'Home', path: '/app/dashboard' },
          { label: 'Procurement', path: '/app/procurement' },
          { label: 'Suppliers', isActive: true }
        ],
        helpText: 'Manage supplier relationships and performance'
      };
    }

    // Reports
    if (path.includes('/reports')) {
      return {
        title: 'Procurement Reports',
        breadcrumbs: [
          { label: 'Home', path: '/app/dashboard' },
          { label: 'Procurement', path: '/app/procurement' },
          { label: 'Reports', isActive: true }
        ],
        helpText: 'Analytics, KPIs, and compliance reports'
      };
    }

    // Default
    return {
      title: 'Procurement',
      breadcrumbs: [
        { label: 'Home', path: '/app/dashboard' },
        { label: 'Procurement', isActive: true }
      ]
    };
  };

  const pageMeta = getPageMeta();

  return (
    <ProcurementErrorBoundary>
      <div className="procurement-layout">
        {/* Page Header with Breadcrumbs */}
        <ProcurementPageHeader
          title={pageMeta.title}
          breadcrumbs={pageMeta.breadcrumbs}
          {...(pageMeta.helpText && { helpText: pageMeta.helpText })}
          permissions={permissions}
        />

        {/* Project Context Alert */}
        {!currentProject && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  No Project Selected
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Please select a project to access procurement features.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="procurement-main flex-1 overflow-hidden">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </ProcurementErrorBoundary>
  );
}