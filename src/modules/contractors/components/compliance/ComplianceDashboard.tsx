/**
 * ComplianceDashboard Component - Comprehensive compliance monitoring and management
 * Following FibreFlow patterns and keeping under 250 lines
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Shield, FileText, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { contractorComplianceService, ComplianceStatus, ComplianceIssue, ExpiringItem } from '@/services/contractor/contractorComplianceService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface ComplianceDashboardProps {
  contractorId: string;
  contractorName: string;
  projectId?: string;
}

export function ComplianceDashboard({ contractorId, contractorName, projectId }: ComplianceDashboardProps) {
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<ComplianceIssue | null>(null);

  useEffect(() => {
    loadComplianceStatus();
  }, [contractorId, projectId]);

  const loadComplianceStatus = async () => {
    try {
      setIsLoading(true);
      const status = await contractorComplianceService.getComplianceStatus(contractorId, projectId);
      setComplianceStatus(status);
    } catch (error) {
      console.error('Failed to load compliance status:', error);
      toast.error('Failed to load compliance status');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      compliant: 'bg-green-100 text-green-800',
      non_compliant: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'non_compliant':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'under_review':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'text-red-600 bg-red-50',
      high: 'text-orange-600 bg-orange-50',
      medium: 'text-yellow-600 bg-yellow-50',
      low: 'text-blue-600 bg-blue-50'
    };
    return colors[severity as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      insurance: <Shield className="w-4 h-4" />,
      certification: <FileText className="w-4 h-4" />,
      bbbee: <TrendingUp className="w-4 h-4" />,
      safety: <AlertTriangle className="w-4 h-4" />,
      financial: <Calendar className="w-4 h-4" />,
      legal: <FileText className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || <FileText className="w-4 h-4" />;
  };

  const formatDaysUntilExpiry = (days: number) => {
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Expires today';
    if (days === 1) return '1 day remaining';
    return `${days} days remaining`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" label="Loading compliance status..." />
      </div>
    );
  }

  if (!complianceStatus) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Failed to load compliance status</p>
      </div>
    );
  }

  const criticalIssues = complianceStatus.issues.filter(issue => issue.severity === 'critical');
  const expiredItems = complianceStatus.expiringItems.filter(item => item.isExpired);
  const expiringSoonItems = complianceStatus.expiringItems.filter(item => item.isExpiringSoon && !item.isExpired);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Compliance Status</h2>
          <p className="text-gray-600">{contractorName}{projectId ? ' - Project Specific' : ''}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(complianceStatus.overall)}`}>
          {getStatusIcon(complianceStatus.overall)}
          <span>{complianceStatus.overall.replace('_', ' ').toUpperCase()}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600">{criticalIssues.length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Issues</p>
              <p className="text-2xl font-bold text-gray-900">{complianceStatus.issues.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired Items</p>
              <p className="text-2xl font-bold text-red-600">{expiredItems.length}</p>
            </div>
            <Clock className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-yellow-600">{expiringSoonItems.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {(criticalIssues.length > 0 || expiredItems.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 mb-3">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-medium">Critical Compliance Issues</h3>
          </div>
          <ul className="space-y-2">
            {criticalIssues.map(issue => (
              <li key={issue.id} className="text-red-700 text-sm">
                • {issue.description}
              </li>
            ))}
            {expiredItems.map(item => (
              <li key={item.id} className="text-red-700 text-sm">
                • {item.name} expired {Math.abs(item.daysUntilExpiry)} days ago
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Compliance Issues */}
      {complianceStatus.issues.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Compliance Issues ({complianceStatus.issues.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {complianceStatus.issues.map(issue => (
              <div key={issue.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getSeverityColor(issue.severity)}`}>
                      {getTypeIcon(issue.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{issue.description}</h4>
                      <p className="text-sm text-gray-600 mt-1">{issue.actionRequired}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded ${getSeverityColor(issue.severity)}`}>
                          {issue.severity.toUpperCase()}
                        </span>
                        <span>{issue.type.replace('_', ' ').toUpperCase()}</span>
                        {issue.dueDate && (
                          <span>Due: {issue.dueDate.toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedIssue(issue)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expiring Items */}
      {complianceStatus.expiringItems.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Expiring Items ({complianceStatus.expiringItems.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {complianceStatus.expiringItems.map(item => (
              <div key={item.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      item.isExpired ? 'bg-red-100 text-red-600' : 
                      item.isExpiringSoon ? 'bg-yellow-100 text-yellow-600' : 
                      'bg-green-100 text-green-600'
                    }`}>
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        Expires: {item.expiryDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      item.isExpired ? 'text-red-600' : 
                      item.isExpiringSoon ? 'text-yellow-600' : 
                      'text-green-600'
                    }`}>
                      {formatDaysUntilExpiry(item.daysUntilExpiry)}
                    </p>
                    {item.renewalRequired && (
                      <p className="text-xs text-gray-500">Renewal required</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Schedule */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-800 mb-2">
          <Calendar className="w-5 h-5" />
          <h3 className="font-medium">Compliance Review Schedule</h3>
        </div>
        <div className="text-blue-700 text-sm space-y-1">
          <p>Last Review: {complianceStatus.lastReviewDate.toLocaleDateString()}</p>
          <p>Next Review: {complianceStatus.nextReviewDate.toLocaleDateString()}</p>
        </div>
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Issue Details</h3>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className={`p-3 rounded-lg ${getSeverityColor(selectedIssue.severity)}`}>
                <div className="flex items-center gap-2">
                  {getTypeIcon(selectedIssue.type)}
                  <span className="font-medium">{selectedIssue.severity.toUpperCase()} - {selectedIssue.type.toUpperCase()}</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedIssue.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Action Required</h4>
                <p className="text-gray-700">{selectedIssue.actionRequired}</p>
              </div>
              
              {selectedIssue.dueDate && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Due Date</h4>
                  <p className="text-gray-700">{selectedIssue.dueDate.toLocaleDateString()}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                <span className={`px-2 py-1 rounded text-sm ${
                  selectedIssue.status === 'open' ? 'bg-red-100 text-red-800' :
                  selectedIssue.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  selectedIssue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedIssue.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}