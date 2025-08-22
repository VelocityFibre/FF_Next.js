/**
 * ComplianceIssuesList Component - Detailed issues list
 * Following FibreFlow patterns and staying under 150 lines
 */

import { useState } from 'react';
import { Shield, FileText, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { ComplianceIssue } from '@/services/contractor/contractorComplianceService';

interface ComplianceIssuesListProps {
  issues: ComplianceIssue[];
}

export function ComplianceIssuesList({ issues }: ComplianceIssuesListProps) {
  const [selectedIssue, setSelectedIssue] = useState<ComplianceIssue | null>(null);

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

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Compliance Issues ({issues.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {issues.map(issue => (
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
    </>
  );
}
