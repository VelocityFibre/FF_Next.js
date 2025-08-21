import { Package, FileText, Send, ShoppingCart, AlertCircle, DollarSign, Clock } from 'lucide-react';
import { useBOQs } from './hooks/useBOQ';
import { useRFQs } from './hooks/useRFQ';
import { BOQStatus, RFQStatus } from '@/types/procurement.types';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';

export function ProcurementOverview() {
  const navigate = useNavigate();
  const { data: boqs } = useBOQs();
  const { data: rfqs } = useRFQs();

  // Calculate statistics
  const stats = {
    boq: {
      total: boqs?.length || 0,
      draft: boqs?.filter(b => b.status === BOQStatus.DRAFT).length || 0,
      approved: boqs?.filter(b => b.status === BOQStatus.APPROVED).length || 0,
      totalValue: boqs?.reduce((sum, b) => sum + (b.totalAmount || 0), 0) || 0,
    },
    rfq: {
      total: rfqs?.length || 0,
      sent: rfqs?.filter(r => r.status === RFQStatus.SENT).length || 0,
      responsesReceived: rfqs?.filter(r => r.status === RFQStatus.RESPONSES_RECEIVED).length || 0,
      awarded: rfqs?.filter(r => r.status === RFQStatus.AWARDED).length || 0,
    },
  };

  const quickActions = [
    {
      label: 'Create BOQ',
      icon: FileText,
      color: 'bg-blue-500',
      onClick: () => navigate('/procurement/boq/new'),
    },
    {
      label: 'New RFQ',
      icon: Send,
      color: 'bg-green-500',
      onClick: () => navigate('/procurement/rfq/new'),
    },
    {
      label: 'View Stock',
      icon: Package,
      color: 'bg-purple-500',
      onClick: () => navigate('/procurement/stock'),
    },
    {
      label: 'Purchase Orders',
      icon: ShoppingCart,
      color: 'bg-orange-500',
      onClick: () => navigate('/procurement/orders'),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Procurement Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage inventory, quotes, and purchase orders
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={action.onClick}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className={`inline-flex p-3 rounded-lg ${action.color} text-white mb-3`}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="font-medium text-gray-900">{action.label}</p>
            </button>
          );
        })}
      </div>

      {/* BOQ Statistics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Bill of Quantities</h2>
          <Button
            onClick={() => navigate('/procurement/boq')}
            variant="outline"
            size="sm"
          >
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total BOQs</p>
            <p className="text-2xl font-bold text-gray-900">{stats.boq.total}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Draft</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.boq.draft}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-600">{stats.boq.approved}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Value</p>
            <p className="text-2xl font-bold text-gray-900">
              R {stats.boq.totalValue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* RFQ Statistics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Request for Quotes</h2>
          <Button
            onClick={() => navigate('/procurement/rfq')}
            variant="outline"
            size="sm"
          >
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total RFQs</p>
            <p className="text-2xl font-bold text-gray-900">{stats.rfq.total}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Sent</p>
            <p className="text-2xl font-bold text-blue-600">{stats.rfq.sent}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Responses</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.rfq.responsesReceived}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Awarded</p>
            <p className="text-2xl font-bold text-green-600">{stats.rfq.awarded}</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Notifications</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Low Stock Alert</p>
              <p className="text-sm text-gray-600">5 items below minimum stock level</p>
            </div>
            <Button
              onClick={() => navigate('/procurement/stock')}
              variant="outline"
              size="sm"
            >
              View
            </Button>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Pending RFQ Responses</p>
              <p className="text-sm text-gray-600">3 RFQs awaiting supplier responses</p>
            </div>
            <Button
              onClick={() => navigate('/procurement/rfq')}
              variant="outline"
              size="sm"
            >
              View
            </Button>
          </div>
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Cost Savings Opportunity</p>
              <p className="text-sm text-gray-600">Compare supplier prices for recent RFQs</p>
            </div>
            <Button
              onClick={() => navigate('/procurement/rfq/compare')}
              variant="outline"
              size="sm"
            >
              Compare
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {boqs?.slice(0, 3).map((boq) => (
            <div
              key={boq.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
              onClick={() => navigate(`/procurement/boq/${boq.id}`)}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{boq.title}</p>
                  <p className="text-xs text-gray-500">{boq.number}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                R {boq.totalAmount?.toLocaleString() || '0'}
              </span>
            </div>
          ))}
          {rfqs?.slice(0, 2).map((rfq) => (
            <div
              key={rfq.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
              onClick={() => navigate(`/procurement/rfq/${rfq.id}`)}
            >
              <div className="flex items-center gap-3">
                <Send className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{rfq.title}</p>
                  <p className="text-xs text-gray-500">{rfq.number}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {rfq.invitedSuppliers?.length || 0} suppliers
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}