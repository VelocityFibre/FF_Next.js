/**
 * ContractorsDashboard - Enhanced contractors dashboard with comprehensive metrics
 * Features contractor stats, performance metrics, and management tools
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Download, RefreshCw, Upload } from 'lucide-react';
import { ContractorList } from './components/ContractorList';
import { PendingApplicationsList } from './components/applications';
import { PerformanceDashboard } from './components/performance';
import { DocumentApprovalQueue } from './components/documents';
import { StatsGrid } from '@/components/dashboard/EnhancedStatCard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useContractorsDashboardData } from '@/hooks/useDashboardData';
import { getContractorsDashboardCards } from '@/config/dashboards/dashboardConfigs';
import { ContractorImport } from '@/components/contractor/ContractorImport';
export function ContractorsDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showImportModal, setShowImportModal] = useState(false);
  
  const { 
    stats, 
    trends, 
 
    formatNumber, 
    formatCurrency, 
    formatPercentage,
    loadDashboardData 
  } = useContractorsDashboardData();

  // 🟢 WORKING: Get contractor dashboard cards
  const contractorCards = getContractorsDashboardCards(
    stats, 
    trends, 
    { formatNumber, formatCurrency, formatPercentage }
  );

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'active', label: 'Active Contractors' },
    { id: 'pending', label: 'Pending Applications' },
    { id: 'documents', label: 'Document Approval' },
    { id: 'performance', label: 'Performance Analytics' },
  ];

  return (
    <div className="ff-page-container">
      <DashboardHeader 
        title="Contractors Dashboard"
        subtitle="Manage contractor relationships and performance"
        actions={[
          {
            label: 'Add Contractor',
            icon: UserPlus as React.ComponentType<{ className?: string; }>,
            onClick: () => navigate('/app/contractors/new'),
            variant: 'primary'
          },
          {
            label: 'Import Contractors',
            icon: Upload as React.ComponentType<{ className?: string; }>,
            onClick: () => setShowImportModal(true),
            variant: 'secondary'
          },
          {
            label: 'Export Report',
            icon: Download as React.ComponentType<{ className?: string; }>,
            onClick: () => console.log('Export contractors report'),
            variant: 'secondary'
          },
          {
            label: 'Refresh Data',
            icon: RefreshCw as React.ComponentType<{ className?: string; }>,
            onClick: loadDashboardData,
            variant: 'secondary'
          }
        ]}
      />

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Stats Cards */}
      {activeTab === 'overview' && (
        <>
          <StatsGrid 
            cards={contractorCards}
            columns={3}
            className="mb-8"
          />

          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="ff-card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
                <div className="space-y-4">
                  {/* TODO: Replace with real data */}
                  {[
                    { name: 'Alpha Construction', score: 96, projects: 12 },
                    { name: 'Beta Networks', score: 92, projects: 8 },
                    { name: 'Gamma Solutions', score: 89, projects: 15 },
                  ].map((contractor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{contractor.name}</p>
                        <p className="text-sm text-gray-500">{contractor.projects} active projects</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{contractor.score}%</p>
                        <p className="text-xs text-gray-500">Performance</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="ff-card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                <div className="space-y-3">
                  {/* TODO: Replace with real activity data */}
                  {[
                    { action: 'New contractor application', time: '2 hours ago', status: 'pending' },
                    { action: 'Performance review completed', time: '5 hours ago', status: 'completed' },
                    { action: 'Contract renewal approved', time: '1 day ago', status: 'approved' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === 'pending' ? 'bg-yellow-400' :
                        activity.status === 'completed' ? 'bg-green-400' : 
                        'bg-blue-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Contractor List Views */}
      {activeTab === 'active' && (
        <ContractorList />
      )}
      
      {activeTab === 'pending' && (
        <PendingApplicationsList 
          initialFilter={{
            status: ['pending', 'under_review', 'documentation_incomplete']
          }}
        />
      )}
      
      {activeTab === 'documents' && (
        <DocumentApprovalQueue 
          initialFilter="pending"
          enableBatchOperations={true}
          autoRefreshInterval={30}
        />
      )}
      
      {activeTab === 'performance' && (
        <PerformanceDashboard 
          showFilters={true}
          onContractorSelect={(contractorId) => navigate(`/app/contractors/${contractorId}`)}
          className="mt-0"
        />
      )}

      {/* Import Modal */}
      <ContractorImport
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onComplete={(result) => {
          console.log('Import completed:', result);
          setShowImportModal(false);
          loadDashboardData(); // Refresh dashboard data
        }}
      />
    </div>
  );
}

export default ContractorsDashboard;