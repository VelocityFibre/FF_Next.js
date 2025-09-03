import React, { useState, useEffect } from 'react';
import {
  Plus,
  Download,
  FileText,
  TrendingUp,
  Clock,
  DollarSign,
  BarChart3,
  AlertTriangle,
  Star
} from 'lucide-react';
import {
  StandardSummaryCards,
  StandardSearchFilter,
  StandardDataTable,
  StandardActionButtons,
  StatusBadge,
  VelocityButton,
  GlassCard,
  LoadingSpinner,
  type TableColumn
} from '../../../components/ui';

// Types
interface QuoteEvaluation {
  id: string;
  rfqId: string;
  rfqTitle: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'AWARDED';
  totalQuotes: number;
  evaluatedQuotes: number;
  lowestBid: number;
  averageBid: number;
  highestBid: number;
  currency: string;
  deadline: Date;
  createdDate: Date;
  evaluatedBy: string[];
  awardedSupplierId?: string;
  awardedSupplierName?: string;
  evaluationCriteria: EvaluationCriteria[];
}

interface EvaluationCriteria {
  id: string;
  name: string;
  weight: number;
  type: 'PRICE' | 'TECHNICAL' | 'COMMERCIAL' | 'DELIVERY';
}

interface QuoteStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  awarded: number;
  totalValue: number;
  averageEvaluationTime: number;
}


const QuoteEvaluationPage: React.FC = () => {
  const [evaluations, setEvaluations] = useState<QuoteEvaluation[]>([]);
  const [stats, setStats] = useState<QuoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Load data
  useEffect(() => {
    loadEvaluationData();
  }, []);

  const loadEvaluationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 🟢 WORKING: Empty states - no mock data. Connect to real quote evaluation service when available.
      // TODO: Replace with actual service calls when quote evaluation system is implemented
      
      // Empty arrays - shows "No evaluations found" etc. in UI
      const evaluations: QuoteEvaluation[] = [];
      
      const stats: QuoteStats = {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        awarded: 0,
        totalValue: 0,
        averageEvaluationTime: 0
      };

      // Future implementation would be:
      // const evaluations = await quoteEvaluationService.getEvaluations();
      // const stats = await quoteEvaluationService.getEvaluationStats();

      setEvaluations(evaluations);
      setStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load evaluation data');
      // Ensure empty states on error
      setEvaluations([]);
      setStats({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        awarded: 0,
        totalValue: 0,
        averageEvaluationTime: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter evaluations
  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch = evaluation.rfqTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evaluation.rfqId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || evaluation.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
  };



  const formatCurrency = (amount: number, currency: string = 'ZAR') => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-ZA');
  };

  // Table columns
  const columns: TableColumn<QuoteEvaluation>[] = [
    {
      key: 'rfqTitle',
      header: 'RFQ Details',
      render: (evaluation: QuoteEvaluation) => (
        <div>
          <div className="font-medium text-gray-900">{evaluation.rfqTitle}</div>
          <div className="text-sm text-gray-500">RFQ: {evaluation.rfqId}</div>
          <div className="text-sm text-gray-500">Created: {formatDate(evaluation.createdDate)}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (evaluation: QuoteEvaluation) => (
        <div className="space-y-1">
          <StatusBadge 
            status={evaluation.status}
          />
          {evaluation.awardedSupplierName && (
            <div className="text-xs text-green-600">
              Awarded to: {evaluation.awardedSupplierName}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'quotes',
      header: 'Quote Progress',
      render: (evaluation: QuoteEvaluation) => (
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">{evaluation.evaluatedQuotes}</span>
            <span className="text-gray-500"> / {evaluation.totalQuotes} evaluated</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ 
                width: `${(evaluation.evaluatedQuotes / evaluation.totalQuotes) * 100}%` 
              }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'pricing',
      header: 'Price Analysis',
      render: (evaluation: QuoteEvaluation) => (
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Lowest:</span>
            <span className="text-green-600 font-medium">
              {formatCurrency(evaluation.lowestBid, evaluation.currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Average:</span>
            <span className="font-medium">
              {formatCurrency(evaluation.averageBid, evaluation.currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Highest:</span>
            <span className="text-red-600">
              {formatCurrency(evaluation.highestBid, evaluation.currency)}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (evaluation: QuoteEvaluation) => {
        const isOverdue = new Date(evaluation.deadline) < new Date();
        const daysLeft = Math.ceil((new Date(evaluation.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        
        return (
          <div className="text-sm">
            <div className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
              {formatDate(evaluation.deadline)}
            </div>
            <div className={`text-xs ${isOverdue ? 'text-red-500' : daysLeft <= 3 ? 'text-orange-500' : 'text-gray-500'}`}>
              {isOverdue ? 'Overdue' : `${daysLeft} days left`}
            </div>
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (evaluation: QuoteEvaluation) => (
        <StandardActionButtons
          id={evaluation.id}
          module="quotes"
          onView={() => {}} // TODO: Implement view
          onEdit={() => {}} // TODO: Implement edit
          showDelete={false}
          moreActions={[
            ...(evaluation.status === 'COMPLETED' ? [{
              label: 'Award',
              onClick: () => {} // TODO: Implement award
            }] : []),
            {
              label: 'Export', 
              onClick: () => {} // TODO: Implement export
            }
          ]}
        />
      )
    }
  ];

  // Summary cards - converting to match StandardSummaryCards interface
  const summaryCards = stats ? [
    {
      label: 'Total Evaluations',
      value: stats.total,
      icon: FileText,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100'
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      iconColor: 'text-yellow-600',
      iconBgColor: 'bg-yellow-100'
    },
    {
      label: 'Total Value',
      value: formatCurrency(stats.totalValue),
      icon: DollarSign,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100'
    },
    {
      label: 'Avg. Time',
      value: `${stats.averageEvaluationTime} days`,
      icon: TrendingUp,
      iconColor: 'text-purple-600',
      iconBgColor: 'bg-purple-100'
    }
  ] : [];

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Evaluations</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <VelocityButton onClick={loadEvaluationData} variant="outline" size="sm">
            Try Again
          </VelocityButton>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quote Evaluation</h1>
          <p className="text-gray-600 mt-1">Evaluate and compare supplier quotes using standardized criteria</p>
        </div>
        <div className="flex space-x-3">
          <VelocityButton
            variant="outline"
            size="sm"
            icon={<BarChart3 className="h-4 w-4" />}
            onClick={() => {}} // TODO: Implement analytics
          >
            Analytics
          </VelocityButton>
          <VelocityButton
            variant="outline"
            size="sm"
            icon={<Download className="h-4 w-4" />}
            onClick={() => {}} // TODO: Implement export
          >
            Export Report
          </VelocityButton>
          <VelocityButton
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {}} // TODO: Implement create
          >
            New Evaluation
          </VelocityButton>
        </div>
      </div>

      {/* Summary Cards */}
      <StandardSummaryCards cards={summaryCards} />

      {/* Search and Filters */}
      <GlassCard className="p-4">
        <StandardSearchFilter
          searchValue={searchTerm}
          onSearch={handleSearch}
          placeholder="Search by RFQ title or ID..."
          onFilter={(filters) => {
            if (filters.status !== undefined) {
              handleStatusFilter(filters.status);
            }
          }}
          filterOptions={[
            {
              label: 'Status',
              value: 'status',
              type: 'select',
              options: [
                { label: 'All Status', value: '' },
                { label: 'Pending', value: 'PENDING' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Completed', value: 'COMPLETED' },
                { label: 'Awarded', value: 'AWARDED' }
              ]
            }
          ]}
        />
      </GlassCard>

      {/* Evaluations Table */}
      <GlassCard>
        <StandardDataTable
          columns={columns as TableColumn<unknown>[]}
          data={filteredEvaluations}
          isLoading={loading}
          emptyMessage="No quote evaluations found"
          getRowKey={(row) => (row as QuoteEvaluation).id}
        />
      </GlassCard>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Evaluation Pipeline
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Review</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }} />
                </div>
                <span className="text-sm text-gray-700">{stats?.pending || 0}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">In Progress</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }} />
                </div>
                <span className="text-sm text-gray-700">{stats?.inProgress || 0}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }} />
                </div>
                <span className="text-sm text-gray-700">{stats?.completed || 0}</span>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Evaluation Criteria
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Price Weight</span>
              <span className="text-sm font-medium">35-50%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Technical Weight</span>
              <span className="text-sm font-medium">25-35%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Delivery Weight</span>
              <span className="text-sm font-medium">15-25%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Commercial Weight</span>
              <span className="text-sm font-medium">5-15%</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default QuoteEvaluationPage;