import React, { useState, useEffect } from 'react';
import { Plus, Building2, CheckCircle, AlertTriangle, AlertCircle, MoreVertical, Clock } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

interface Contractor {
  id: string;
  companyName: string;
  registrationNumber: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'pending_onboarding' | 'onboarding_in_progress' | 'pending_approval' | 'approved' | 'suspended' | 'blacklisted';
  ragScore: {
    overall: 'red' | 'amber' | 'green';
    financial: 'red' | 'amber' | 'green';
    compliance: 'red' | 'amber' | 'green';
    performance: 'red' | 'amber' | 'green';
    safety: 'red' | 'amber' | 'green';
  };
  onboardingProgress: number;
  documentsExpiring: number;
  activeProjects: number;
  complianceIssues: number;
  lastActivity: Date;
}

const ContractorsDashboard: React.FC = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  // const [filterStatus] = useState<string>('all'); // Reserved for future use

  useEffect(() => {
    loadContractors();
  }, []);

  const loadContractors = () => {
    const mockData: Contractor[] = [
      {
        id: 'CTR001',
        companyName: 'FiberTech Solutions',
        registrationNumber: '2020/123456/07',
        contactPerson: 'John Smith',
        email: 'john@fibertech.co.za',
        phone: '0821234567',
        status: 'approved',
        ragScore: {
          overall: 'green',
          financial: 'green',
          compliance: 'amber',
          performance: 'green',
          safety: 'green'
        },
        onboardingProgress: 100,
        documentsExpiring: 2,
        activeProjects: 3,
        complianceIssues: 0,
        lastActivity: new Date('2024-01-15')
      },
      {
        id: 'CTR002',
        companyName: 'ConnectPro Services',
        registrationNumber: '2019/654321/07',
        contactPerson: 'Jane Doe',
        email: 'jane@connectpro.co.za',
        phone: '0836547890',
        status: 'onboarding_in_progress',
        ragScore: {
          overall: 'amber',
          financial: 'amber',
          compliance: 'red',
          performance: 'green',
          safety: 'amber'
        },
        onboardingProgress: 65,
        documentsExpiring: 0,
        activeProjects: 0,
        complianceIssues: 2,
        lastActivity: new Date('2024-01-20')
      }
    ];
    setContractors(mockData);
  };

  const getStatusColor = (status: Contractor['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'onboarding_in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending_onboarding': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      case 'blacklisted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRagColor = (score: 'red' | 'amber' | 'green') => {
    switch (score) {
      case 'green': return 'bg-green-500';
      case 'amber': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
    }
  };

  const tabs = ['All Contractors', 'Pending Onboarding', 'Active', 'Compliance Issues'];

  return (
    <div className="ff-page-container">
      <DashboardHeader 
        title="Contractors Portal"
        subtitle="Manage contractor onboarding, compliance, and performance"
        actions={[
          {
            label: 'Add Contractor',
            icon: Plus,
            onClick: () => {},
            variant: 'primary'
          }
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contractors</p>
                <p className="text-2xl font-bold">{contractors.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">
                  {contractors.filter(c => c.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Onboarding</p>
                <p className="text-2xl font-bold">
                  {contractors.filter(c => c.status === 'onboarding_in_progress').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="ff-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliance Issues</p>
                <p className="text-2xl font-bold">
                  {contractors.reduce((sum, c) => sum + c.complianceIssues, 0)}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="ff-card mb-6">
        <div className="border-b">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(index)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === index
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Contractors Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RAG Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contractors.map((contractor) => (
                <tr key={contractor.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {contractor.companyName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contractor.contactPerson} • {contractor.registrationNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contractor.status)}`}>
                      {contractor.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      <div className={`w-6 h-6 rounded ${getRagColor(contractor.ragScore.financial)}`} title="Financial" />
                      <div className={`w-6 h-6 rounded ${getRagColor(contractor.ragScore.compliance)}`} title="Compliance" />
                      <div className={`w-6 h-6 rounded ${getRagColor(contractor.ragScore.performance)}`} title="Performance" />
                      <div className={`w-6 h-6 rounded ${getRagColor(contractor.ragScore.safety)}`} title="Safety" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contractor.activeProjects}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contractor.complianceIssues > 0 ? (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {contractor.complianceIssues} issues
                      </div>
                    ) : (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Compliant
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContractorsDashboard;