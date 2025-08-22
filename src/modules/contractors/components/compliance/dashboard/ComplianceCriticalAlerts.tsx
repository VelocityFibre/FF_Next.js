/**
 * ComplianceCriticalAlerts Component - Critical alerts section
 * Following FibreFlow patterns and staying under 100 lines
 */

import { AlertCircle } from 'lucide-react';
import { ComplianceIssue, ExpiringItem } from '@/services/contractor/contractorComplianceService';

interface ComplianceCriticalAlertsProps {
  criticalIssues: ComplianceIssue[];
  expiredItems: ExpiringItem[];
}

export function ComplianceCriticalAlerts({ criticalIssues, expiredItems }: ComplianceCriticalAlertsProps) {
  return (
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
  );
}
