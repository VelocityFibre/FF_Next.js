// 🟢 WORKING: Comprehensive procurement tabs with badges and state management
import { useMemo } from 'react';
import { 
  BarChart3,
  FileText, 
  Send, 
  ShoppingCart, 
  Quote,
  Package,
  Truck,
  ClipboardList,
  Lock
} from 'lucide-react';
import type { 
  ProcurementTab, 
  ProcurementTabId, 
  ProcurementPermissions
} from '@/types/procurement/portal.types';

interface ProcurementTabsProps {
  activeTab: ProcurementTabId;
  onTabChange: (tabId: ProcurementTabId) => void;
  selectedProject?: { id: string; name: string; code: string } | undefined;
  tabBadges: Record<ProcurementTabId, { count?: number; type?: 'info' | 'warning' | 'error' | 'success' }>;
  permissions: ProcurementPermissions;
  isLoading?: boolean;
}

export function ProcurementTabs({
  activeTab,
  onTabChange,
  selectedProject,
  tabBadges,
  permissions,
  isLoading = false
}: ProcurementTabsProps) {
  
  // Define all available tabs with enhanced configuration
  const allTabs: ProcurementTab[] = useMemo(() => [
    { 
      id: 'overview', 
      label: 'Dashboard', 
      icon: BarChart3, 
      path: '/app/procurement',
      requiresProject: false
    },
    { 
      id: 'boq', 
      label: 'BOQ', 
      icon: FileText, 
      path: '/app/procurement/boq',
      requiresProject: true,
      permission: 'canViewBOQ'
    },
    { 
      id: 'rfq', 
      label: 'RFQ', 
      icon: Send, 
      path: '/app/procurement/rfq',
      requiresProject: true,
      permission: 'canViewRFQ'
    },
    { 
      id: 'quotes', 
      label: 'Quote Evaluation', 
      icon: Quote, 
      path: '/app/procurement/quotes',
      requiresProject: true,
      permission: 'canViewQuotes'
    },
    { 
      id: 'purchase-orders', 
      label: 'Purchase Orders', 
      icon: ShoppingCart, 
      path: '/app/procurement/orders',
      requiresProject: true,
      permission: 'canViewPurchaseOrders'
    },
    { 
      id: 'stock', 
      label: 'Stock Movement', 
      icon: Package, 
      path: '/app/procurement/stock',
      requiresProject: true,
      permission: 'canAccessStock'
    },
    { 
      id: 'suppliers', 
      label: 'Suppliers', 
      icon: Truck, 
      path: '/app/procurement/suppliers',
      requiresProject: false,
      permission: 'canViewSuppliers'
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: ClipboardList, 
      path: '/app/procurement/reports',
      requiresProject: true,
      permission: 'canAccessReports'
    }
  ], []);

  // Filter tabs based on permissions and project selection
  const availableTabs = useMemo(() => {
    return allTabs.filter(tab => {
      // Always show overview/dashboard
      if (tab.id === 'overview') return true;
      
      // Check if project is required and selected
      if (tab.requiresProject && !selectedProject) return false;
      
      // Check permissions
      if (tab.permission) {
        const hasPermission = permissions[tab.permission as keyof ProcurementPermissions];
        if (!hasPermission) return false;
      }
      
      return true;
    }).map(tab => ({
      ...tab,
      badge: tabBadges[tab.id]
    }));
  }, [allTabs, selectedProject, tabBadges, permissions]);

  // Handle tab click with validation
  const handleTabClick = (tab: ProcurementTab) => {
    // Don't allow tab change if loading
    if (isLoading) return;
    
    // Check if project is required but not selected
    if (tab.requiresProject && !selectedProject) {
      // Could show a toast or modal here
      return;
    }

    onTabChange(tab.id);
  };

  // Get tab display state
  const getTabState = (tab: ProcurementTab) => {
    const isActive = activeTab === tab.id;
    const isDisabled = tab.requiresProject && !selectedProject;
    const hasPermission = !tab.permission || permissions[tab.permission as keyof ProcurementPermissions];
    
    return {
      isActive,
      isDisabled,
      hasPermission,
      showLock: !hasPermission
    };
  };

  // Get badge styles based on type
  const getBadgeStyles = (type?: 'info' | 'warning' | 'error' | 'success') => {
    const baseStyles = 'ml-2 px-2 py-0.5 text-xs font-medium rounded-full min-w-[1.5rem] text-center';
    
    switch (type) {
      case 'error':
        return `${baseStyles} bg-red-100 text-red-700`;
      case 'warning':
        return `${baseStyles} bg-yellow-100 text-yellow-700`;
      case 'success':
        return `${baseStyles} bg-green-100 text-green-700`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-100 text-blue-700`;
    }
  };

  return (
    <nav className="flex space-x-1 overflow-x-auto scrollbar-hide" aria-label="Procurement portal tabs">
      {availableTabs.map((tab) => {
        const Icon = tab.icon;
        const { isActive, isDisabled, hasPermission, showLock } = getTabState(tab);
        const badge = tab.badge;
        
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            disabled={isDisabled || isLoading || !hasPermission}
            className={`
              relative py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap
              flex items-center gap-2 transition-all duration-200 min-w-fit
              ${isActive
                ? 'border-primary-500 text-primary-600 bg-primary-50'
                : isDisabled || !hasPermission
                ? 'border-transparent text-gray-400 cursor-not-allowed'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }
              ${isLoading ? 'opacity-50 cursor-wait' : ''}
              disabled:opacity-50
            `}
            title={
              isDisabled 
                ? `${tab.label} - Project required`
                : !hasPermission 
                ? `${tab.label} - Insufficient permissions`
                : tab.label
            }
            aria-current={isActive ? 'page' : undefined}
          >
            {/* Icon */}
            <div className="flex items-center gap-1">
              <Icon className="h-4 w-4 flex-shrink-0" />
              {showLock && <Lock className="h-3 w-3 text-gray-400" />}
            </div>
            
            {/* Label */}
            <span className="truncate">{tab.label}</span>
            
            {/* Badge */}
            {badge && badge.count !== undefined && badge.count > 0 && (
              <span className={getBadgeStyles(badge.type)}>
                {badge.count > 99 ? '99+' : badge.count}
              </span>
            )}
            
            {/* Loading indicator for active tab */}
            {isLoading && isActive && (
              <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-primary-200 overflow-hidden">
                <div className="h-full bg-primary-500 animate-pulse" />
              </div>
            )}
          </button>
        );
      })}

      {/* Mobile scroll indicator */}
      <div className="flex-shrink-0 w-1" />
    </nav>
  );
}

// Export for use in other components
export type { ProcurementTabsProps };