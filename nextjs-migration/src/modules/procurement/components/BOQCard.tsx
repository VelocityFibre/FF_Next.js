import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, FileText, MoreVertical, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { BOQ, BOQStatus } from '@/types/procurement.types';
import { format } from 'date-fns';

interface BOQCardProps {
  boq: BOQ;
}

export function BOQCard({ boq }: BOQCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/procurement/boq/${boq.id}`);
  };

  const getStatusIcon = () => {
    switch (boq.status) {
      case BOQStatus.APPROVED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case BOQStatus.MAPPING_REVIEW:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case BOQStatus.ARCHIVED:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (boq.status) {
      case BOQStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case BOQStatus.MAPPING_REVIEW:
        return 'bg-yellow-100 text-yellow-800';
      case BOQStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case BOQStatus.ARCHIVED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
              {boq.status}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{boq.title}</h3>
          <p className="text-sm text-gray-500">v{boq.version}</p>
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
        <div className="flex items-center text-sm text-gray-600">
          <FileText className="h-4 w-4 mr-2 text-gray-400" />
          <span>Project ID: {boq.projectId}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
          <span>Created {format(boq.createdAt, 'MMM dd, yyyy')}</span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-lg font-bold text-gray-900 flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              {boq.currency} {boq.totalEstimatedValue?.toLocaleString() || '0'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">{boq.itemCount} items</p>
            <p className="text-xs text-gray-500">Status: {boq.status}</p>
          </div>
        </div>
      </div>

      {boq.approvedBy && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Approved by {boq.approvedBy} on{' '}
            {boq.approvedAt && format(boq.approvedAt, 'MMM dd, yyyy')}
          </p>
        </div>
      )}
    </div>
  );
}