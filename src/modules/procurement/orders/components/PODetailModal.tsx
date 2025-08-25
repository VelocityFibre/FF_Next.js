// ============= PO Detail Modal Component =============

import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  User,
  MapPin,
  DollarSign,
  Package,
  Truck,
  FileCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Send,
  Edit,
} from 'lucide-react';
import {
  VelocityButton,
  GlassCard,
  LoadingSpinner,
  StatusBadge
} from '../../../../components/ui';
import type { 
  PurchaseOrder, 
  POItem,
  POStatus
} from '../../../../types/procurement/po.types';
import { poService } from '../../../../services/procurement/poService';

interface PODetailModalProps {
  poId: string;
  onClose: () => void;
  onUpdated: () => void;
}

export const PODetailModal: React.FC<PODetailModalProps> = ({ 
  poId, 
  onClose, 
  onUpdated 
}) => {
  const [po, setPO] = useState<PurchaseOrder | null>(null);
  const [items, setItems] = useState<POItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPOData();
  }, [poId]);

  const loadPOData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [poData, itemsData] = await Promise.all([
        poService.getPOById(poId),
        poService.getPOItems(poId)
      ]);
      
      if (!poData) {
        throw new Error('Purchase Order not found');
      }
      
      setPO(poData);
      setItems(itemsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchase order');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: POStatus, notes?: string) => {
    if (!po) return;
    
    try {
      setActionLoading('status');
      await poService.updatePOStatus(po.id, newStatus, notes);
      await loadPOData();
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async () => {
    if (!po) return;
    
    try {
      setActionLoading('approve');
      await poService.approvePO(po.id, 'current-user'); // In real app, get from auth context
      await loadPOData();
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve purchase order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!po) return;
    
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      setActionLoading('reject');
      await poService.rejectPO(po.id, 'current-user', reason);
      await loadPOData();
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject purchase order');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'ZAR') => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };



  const canApprove = po?.approvalStatus === 'PENDING' || po?.approvalStatus === 'IN_PROGRESS';
  const canEdit = po?.status === 'DRAFT';
  const canSend = po?.status === 'APPROVED';

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex space-x-3">
              <VelocityButton variant="outline" onClick={onClose}>
                Close
              </VelocityButton>
              <VelocityButton onClick={loadPOData}>
                Try Again
              </VelocityButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!po) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{po.poNumber}</h2>
            <p className="text-gray-600">{po.title}</p>
            <div className="flex items-center space-x-3 mt-2">
              <StatusBadge 
                status={po.status} 
              />
              <StatusBadge 
                status={po.approvalStatus} 
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Action Buttons */}
            {canApprove && (
              <>
                <VelocityButton
                  size="sm"
                  onClick={handleApprove}
                  loading={actionLoading === 'approve'}
                  icon={<CheckCircle className="h-4 w-4" />}
                >
                  Approve
                </VelocityButton>
                <VelocityButton
                  variant="outline"
                  size="sm"
                  onClick={handleReject}
                  loading={actionLoading === 'reject'}
                  icon={<AlertCircle className="h-4 w-4" />}
                >
                  Reject
                </VelocityButton>
              </>
            )}
            
            {canSend && (
              <VelocityButton
                size="sm"
                onClick={() => handleStatusChange('SENT' as any)}
                loading={actionLoading === 'status'}
                icon={<Send className="h-4 w-4" />}
              >
                Send to Supplier
              </VelocityButton>
            )}
            
            {canEdit && (
              <VelocityButton
                variant="outline"
                size="sm"
                icon={<Edit className="h-4 w-4" />}
              >
                Edit
              </VelocityButton>
            )}
            
            <VelocityButton
              variant="outline"
              size="sm"
              icon={<Download className="h-4 w-4" />}
            >
              Download PDF
            </VelocityButton>
            
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'details', label: 'Details', icon: FileText },
              { key: 'items', label: 'Line Items', icon: Package },
              { key: 'delivery', label: 'Delivery', icon: Truck },
              { key: 'invoices', label: 'Invoices', icon: FileCheck },
              { key: 'history', label: 'History', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Title:</span>
                    <p className="text-gray-900">{po.title}</p>
                  </div>
                  {po.description && (
                    <div>
                      <span className="font-medium text-gray-700">Description:</span>
                      <p className="text-gray-900">{po.description}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Order Type:</span>
                    <p className="text-gray-900">{po.orderType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Created By:</span>
                    <p className="text-gray-900">{po.createdBy}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Created Date:</span>
                    <p className="text-gray-900">{formatDate(po.createdAt)}</p>
                  </div>
                </div>
              </GlassCard>

              {/* Supplier Information */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Supplier Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <p className="text-gray-900">{po.supplier.name}</p>
                  </div>
                  {po.supplier.code && (
                    <div>
                      <span className="font-medium text-gray-700">Code:</span>
                      <p className="text-gray-900">{po.supplier.code}</p>
                    </div>
                  )}
                  {po.supplier.contactPerson && (
                    <div>
                      <span className="font-medium text-gray-700">Contact Person:</span>
                      <p className="text-gray-900">{po.supplier.contactPerson}</p>
                    </div>
                  )}
                  {po.supplier.email && (
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p className="text-gray-900">{po.supplier.email}</p>
                    </div>
                  )}
                  {po.supplier.phone && (
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <p className="text-gray-900">{po.supplier.phone}</p>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Financial Summary */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Financial Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Subtotal:</span>
                    <span className="text-gray-900">{formatCurrency(po.subtotal, po.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Tax Amount:</span>
                    <span className="text-gray-900">{formatCurrency(po.taxAmount, po.currency)}</span>
                  </div>
                  {po.discountAmount && po.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Discount:</span>
                      <span className="text-gray-900">-{formatCurrency(po.discountAmount, po.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-3 text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(po.totalAmount, po.currency)}</span>
                  </div>
                </div>
              </GlassCard>

              {/* Terms & Delivery */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Terms & Delivery
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Payment Terms:</span>
                    <p className="text-gray-900">{po.paymentTerms}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Delivery Terms:</span>
                    <p className="text-gray-900">{po.deliveryTerms}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Expected Delivery:</span>
                    <p className="text-gray-900">{formatDate(po.expectedDeliveryDate)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Delivery Address:</span>
                    <div className="text-gray-900">
                      <p>{po.deliveryAddress.street}</p>
                      <p>{po.deliveryAddress.city}, {po.deliveryAddress.province}</p>
                      <p>{po.deliveryAddress.postalCode}, {po.deliveryAddress.country}</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === 'items' && (
            <div className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No line items found</p>
                </div>
              ) : (
                items.map((item) => (
                  <GlassCard key={item.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Line {item.lineNumber}: {item.description}
                        </h4>
                        {item.itemCode && (
                          <p className="text-sm text-gray-600">Code: {item.itemCode}</p>
                        )}
                        {item.category && (
                          <p className="text-sm text-gray-600">Category: {item.category}</p>
                        )}
                      </div>
                      <StatusBadge 
                        status={item.itemStatus}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Quantity:</span>
                        <p className="text-gray-900">{item.quantity.toLocaleString()} {item.uom}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Unit Price:</span>
                        <p className="text-gray-900">{formatCurrency(item.unitPrice)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Line Total:</span>
                        <p className="text-gray-900 font-semibold">{formatCurrency(item.lineTotal)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Delivered:</span>
                        <p className="text-gray-900">{item.quantityDelivered.toLocaleString()} {item.uom}</p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Delivery Progress</span>
                        <span>{Math.round((item.quantityDelivered / item.quantity) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min((item.quantityDelivered / item.quantity) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-6">
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Delivery Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p><span className="font-medium">Status:</span> 
                      <StatusBadge 
                        status={po.deliveryStatus}
                      />
                    </p>
                    <p className="mt-2"><span className="font-medium">Expected Date:</span> {formatDate(po.expectedDeliveryDate)}</p>
                    {po.actualDeliveryDate && (
                      <p className="mt-2"><span className="font-medium">Actual Date:</span> {formatDate(po.actualDeliveryDate)}</p>
                    )}
                  </div>
                  <div>
                    <p><span className="font-medium">Partial Delivery:</span> {po.partialDeliveryAllowed ? 'Allowed' : 'Not Allowed'}</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h4 className="font-semibold mb-4">Delivery Notes</h4>
                <p className="text-center text-gray-500">No delivery notes available</p>
              </GlassCard>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FileCheck className="h-5 w-5 mr-2" />
                  Invoice Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p><span className="font-medium">Status:</span> 
                      <StatusBadge 
                        status={po.invoiceStatus}
                      />
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h4 className="font-semibold mb-4">Invoices</h4>
                <p className="text-center text-gray-500">No invoices submitted yet</p>
              </GlassCard>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Activity History
                </h3>
                
                <div className="space-y-4">
                  {[
                    { date: po.createdAt, action: 'Purchase Order created', user: po.createdBy },
                    po.issuedAt && { date: po.issuedAt, action: 'Purchase Order issued', user: po.issuedBy },
                    po.sentAt && { date: po.sentAt, action: 'Purchase Order sent to supplier', user: po.issuedBy },
                    po.acknowledgedAt && { date: po.acknowledgedAt, action: 'Purchase Order acknowledged by supplier', user: 'Supplier' }
                  ].filter(Boolean).map((entry: any, index) => (
                    <div key={index} className="flex items-start space-x-4 border-l-2 border-blue-500 pl-4">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{entry.action}</p>
                        <p className="text-sm text-gray-600">by {entry.user}</p>
                        <p className="text-xs text-gray-500">{formatDate(entry.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};