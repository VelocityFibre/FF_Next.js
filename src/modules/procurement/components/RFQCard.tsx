import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, Send, CheckCircle, XCircle, Award, MoreVertical } from 'lucide-react';
import { RFQ, RFQStatus } from '@/types/procurement.types';
import { format } from 'date-fns';

interface RFQCardProps {
  rfq: RFQ;
}

export function RFQCard({ rfq }: RFQCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/procurement/rfq/${rfq.id}`);
  };

  const getStatusIcon = () => {
    switch (rfq.status) {
      case RFQStatus.SENT:
        return <Send className="h-4 w-4 text-blue-500" />;
      case RFQStatus.RESPONSES_RECEIVED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case RFQStatus.AWARDED:
        return <Award className="h-4 w-4 text-purple-500" />;
      case RFQStatus.CANCELLED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case RFQStatus.EXPIRED:
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (rfq.status) {
      case RFQStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case RFQStatus.SENT:
        return 'bg-blue-100 text-blue-800';
      case RFQStatus.RESPONSES_PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case RFQStatus.RESPONSES_RECEIVED:
        return 'bg-green-100 text-green-800';
      case RFQStatus.EVALUATION:
        return 'bg-indigo-100 text-indigo-800';
      case RFQStatus.AWARDED:
        return 'bg-purple-100 text-purple-800';
      case RFQStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case RFQStatus.EXPIRED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const respondedCount = rfq.invitedSuppliers?.filter(s => s.status === 'responded').length || 0;
  const totalInvited = rfq.invitedSuppliers?.length || 0;

  return (
    <div
      onClick={handleClick}
      className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon()}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {rfq.status}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{rfq.title}</h3>
          <p className="text-sm text-gray-500">{rfq.rfqNumber}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Show dropdown menu
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <MoreVertical className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        {rfq.projectName && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium mr-2">Project:</span>
            <span>{rfq.projectName}</span>
          </div>
        )}
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
          <span>Deadline: {format(rfq.deadline.toDate(), 'MMM dd, yyyy')}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-2 text-gray-400" />
          <span>{totalInvited} suppliers invited</span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500">Responses</p>
            <p className="text-lg font-bold text-gray-900">
              {respondedCount} / {totalInvited}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">{rfq.items.length} items</p>
            {rfq.deliveryDate && (
              <p className="text-xs text-gray-500">
                Delivery: {format(rfq.deliveryDate.toDate(), 'MMM dd')}
              </p>
            )}
          </div>
        </div>
      </div>

      {rfq.selectedResponseId && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-green-600 font-medium">
            ✓ Supplier selected
          </p>
        </div>
      )}

      {/* Response progress bar */}
      {rfq.status !== RFQStatus.DRAFT && totalInvited > 0 && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${(respondedCount / totalInvited) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}