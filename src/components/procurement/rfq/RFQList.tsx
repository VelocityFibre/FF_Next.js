/**
 * RFQ List Component
 * Main container for displaying and managing all RFQs
 */

import { useState, useEffect } from 'react';
import { Loader2, FileText, Plus } from 'lucide-react';

interface RFQ {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'closed' | 'expired';
  createdAt: string;
  dueDate?: string;
  projectId?: string;
  supplierCount?: number;
  responseCount?: number;
}

interface RFQListProps {
  onCreateRFQ?: () => void;
  onSelectRFQ?: (rfq: RFQ) => void;
  selectedRFQId?: string;
  className?: string;
  rfqs?: RFQ[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function RFQList({
  onCreateRFQ,
  onSelectRFQ,
  selectedRFQId,
  className,
  rfqs: externalRfqs = [],
  onView,
  onEdit
}: RFQListProps) {
  const [rfqs, setRfqs] = useState<RFQ[]>(externalRfqs);
  const [isLoading, setIsLoading] = useState(externalRfqs.length === 0);

  useEffect(() => {
    if (externalRfqs.length === 0) {
      loadRFQs();
    } else {
      setRfqs(externalRfqs);
      setIsLoading(false);
    }
  }, [externalRfqs]);

  const loadRFQs = async () => {
    setIsLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockRfqs: RFQ[] = [
        {
          id: '1',
          title: 'Network Equipment RFQ',
          description: 'Request for fiber optic equipment and cables',
          status: 'active',
          createdAt: '2024-01-15T10:00:00Z',
          dueDate: '2024-02-15T23:59:59Z',
          supplierCount: 5,
          responseCount: 3
        },
        {
          id: '2',
          title: 'Installation Services RFQ',
          description: 'Professional installation services for fiber network',
          status: 'draft',
          createdAt: '2024-01-10T14:30:00Z',
          dueDate: '2024-03-01T23:59:59Z',
          supplierCount: 3,
          responseCount: 0
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      setRfqs(mockRfqs);
    } catch (error) {
      console.error('Error loading RFQs:', error);
      setRfqs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: RFQ['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleRFQClick = (rfq: RFQ) => {
    if (onSelectRFQ) {
      onSelectRFQ(rfq);
    }
    if (onView) {
      onView(rfq.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading RFQs...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            Request for Quotations ({rfqs.length})
          </h2>
          <p className="text-sm text-gray-500">
            Manage and track your RFQ requests
          </p>
        </div>
        {onCreateRFQ && (
          <button
            onClick={onCreateRFQ}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create RFQ
          </button>
        )}
      </div>

      {/* RFQ List */}
      {rfqs.length > 0 ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {rfqs.map(rfq => (
              <div
                key={rfq.id}
                className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedRFQId === rfq.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => handleRFQClick(rfq)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {rfq.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rfq.status)}`}>
                        {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                      </span>
                    </div>
                    {rfq.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {rfq.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center space-x-6 text-sm text-gray-500">
                      <span>Created: {formatDate(rfq.createdAt)}</span>
                      {rfq.dueDate && (
                        <span>Due: {formatDate(rfq.dueDate)}</span>
                      )}
                      <span>Suppliers: {rfq.supplierCount || 0}</span>
                      <span>Responses: {rfq.responseCount || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(rfq.id);
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 bg-white rounded-lg border">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No RFQs Found</h3>
          <p className="mt-2 text-sm text-gray-500">
            No RFQs have been created for this project yet.
          </p>
          {onCreateRFQ && (
            <div className="mt-6">
              <button
                onClick={onCreateRFQ}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Create Your First RFQ
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}