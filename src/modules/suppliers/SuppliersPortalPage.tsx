import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Building2, Users, TrendingUp, Clock } from 'lucide-react';
import { 
  SuppliersPortalProvider, 
  useSuppliersPortal,
  type SupplierTabId 
} from './context/SuppliersPortalContext';
import { SuppliersTabsNav } from './components/SuppliersTabsNav';
import { SupplierFilter } from './components/SupplierFilter';

// Tab components (to be created)
import { DashboardTab } from './components/tabs/DashboardTab';
import { RFQInvitesTab } from './components/tabs/RFQInvitesTab';
import { CompanyProfileTab } from './components/tabs/CompanyProfileTab';
import { PerformanceTab } from './components/tabs/PerformanceTab';
import { DocumentsTab } from './components/tabs/DocumentsTab';
import { MessagesTab } from './components/tabs/MessagesTab';
import { log } from '@/lib/logger';

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class SuppliersPortalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static override getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    log.error('Suppliers Portal Error:', { data: error, errorInfo }, 'SuppliersPortalPage');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Suppliers Portal Error
            </h2>
            <p className="text-gray-600 mb-4">
              Something went wrong loading the suppliers portal. Please refresh the page or contact support.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Portal layout component
function SuppliersPortalLayout() {
  const {
    selectedSupplier,
    activeTab,
    isLoading,
    error,
    allSuppliersStats,
    setActiveTab
  } = useSuppliersPortal();

  const [searchParams] = useSearchParams();

  // Handle tab changes from URL
  useEffect(() => {
    const tabParam = searchParams.get('tab') as SupplierTabId;
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams, activeTab, setActiveTab]);

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'rfq-invites':
        return <RFQInvitesTab />;
      case 'company-profile':
        return <CompanyProfileTab />;
      case 'performance':
        return <PerformanceTab />;
      case 'documents':
        return <DocumentsTab />;
      case 'messages':
        return <MessagesTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Suppliers Portal
                  </h1>
                  <p className="text-gray-600">
                    {selectedSupplier 
                      ? `Managing: ${selectedSupplier.name} (${selectedSupplier.code})`
                      : 'Manage supplier relationships and communications'
                    }
                  </p>
                </div>
              </div>

              {/* Quick Stats Bar */}
              <div className="hidden lg:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-600">
                    {allSuppliersStats.totalSuppliers} Suppliers
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">
                    {allSuppliersStats.averageRating.toFixed(1)} Avg Rating
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-gray-600">
                    {allSuppliersStats.pendingRFQs} Pending RFQs
                  </span>
                </div>
              </div>
            </div>

            {/* Selected Supplier Context */}
            {selectedSupplier && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        {selectedSupplier.name}
                      </p>
                      <p className="text-xs text-blue-700">
                        {selectedSupplier.code} • {selectedSupplier.category} • {selectedSupplier.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-xs text-blue-700">Rating</p>
                      <p className="text-sm font-semibold text-blue-900">
                        {selectedSupplier.rating}/5.0
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-700">Compliance</p>
                      <p className="text-sm font-semibold text-blue-900">
                        {selectedSupplier.complianceScore}%
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedSupplier.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : selectedSupplier.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedSupplier.status.charAt(0).toUpperCase() + selectedSupplier.status.slice(1)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tabs Navigation */}
          <SuppliersTabsNav />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Supplier Filter */}
        <div className="mb-6">
          <SupplierFilter />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">Error</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        )}

        {/* Tab Content */}
        {!isLoading && (
          <div className="transition-all duration-200 ease-in-out">
            {renderTabContent()}
          </div>
        )}
      </main>
    </div>
  );
}

// Main portal page component
export function SuppliersPortalPage() {
  return (
    <SuppliersPortalErrorBoundary>
      <SuppliersPortalProvider>
        <SuppliersPortalLayout />
      </SuppliersPortalProvider>
    </SuppliersPortalErrorBoundary>
  );
}

export default SuppliersPortalPage;