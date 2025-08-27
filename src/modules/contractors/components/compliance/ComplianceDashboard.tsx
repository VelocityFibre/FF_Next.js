/**
 * ComplianceDashboard Component - Main compliance overview
 * Following FibreFlow patterns and staying under 250 lines
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Shield, AlertCircle, Calendar } from 'lucide-react';
import { contractorComplianceService, ComplianceStatus } from '@/services/contractor/contractorComplianceService';
import { ComplianceQuickStats } from './dashboard/ComplianceQuickStats';
import { ComplianceCriticalAlerts } from './dashboard/ComplianceCriticalAlerts';
import { ComplianceIssuesList } from './dashboard/ComplianceIssuesList';
import { ComplianceExpiringItems } from './dashboard/ComplianceExpiringItems';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { log } from '@/lib/logger';

interface ComplianceDashboardProps {
  contractorId: string;
  contractorName: string;
  projectId?: string;
}

export function ComplianceDashboard({ contractorId, contractorName, projectId }: ComplianceDashboardProps) {
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComplianceStatus();
  }, [contractorId, projectId]);

  const loadComplianceStatus = async () => {
    try {
      setIsLoading(true);
      const status = await contractorComplianceService.getComplianceStatus(contractorId, projectId);
      setComplianceStatus(status);
    } catch (error) {
      log.error('Failed to load compliance status:', { data: error }, 'ComplianceDashboard');
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
      <ComplianceQuickStats 
        criticalIssues={criticalIssues.length}
        totalIssues={complianceStatus.issues.length}
        expiredItems={expiredItems.length}
        expiringSoonItems={expiringSoonItems.length}
      />

      {/* Critical Alerts */}
      {(criticalIssues.length > 0 || expiredItems.length > 0) && (
        <ComplianceCriticalAlerts 
          criticalIssues={criticalIssues}
          expiredItems={expiredItems}
        />
      )}

      {/* Compliance Issues */}
      {complianceStatus.issues.length > 0 && (
        <ComplianceIssuesList issues={complianceStatus.issues} />
      )}

      {/* Expiring Items */}
      {complianceStatus.expiringItems.length > 0 && (
        <ComplianceExpiringItems items={complianceStatus.expiringItems} />
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
    </div>
  );
}