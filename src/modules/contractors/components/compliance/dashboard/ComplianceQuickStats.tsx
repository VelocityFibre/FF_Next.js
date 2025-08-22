/**
 * ComplianceQuickStats Component - Quick stats cards
 * Following FibreFlow patterns and staying under 100 lines
 */

import { AlertCircle, AlertTriangle, Clock, Calendar } from 'lucide-react';

interface ComplianceQuickStatsProps {
  criticalIssues: number;
  totalIssues: number;
  expiredItems: number;
  expiringSoonItems: number;
}

export function ComplianceQuickStats({ 
  criticalIssues, 
  totalIssues, 
  expiredItems, 
  expiringSoonItems 
}: ComplianceQuickStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Critical Issues</p>
            <p className="text-2xl font-bold text-red-600">{criticalIssues}</p>
          </div>
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Issues</p>
            <p className="text-2xl font-bold text-gray-900">{totalIssues}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-orange-600" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Expired Items</p>
            <p className="text-2xl font-bold text-red-600">{expiredItems}</p>
          </div>
          <Clock className="w-8 h-8 text-red-600" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Expiring Soon</p>
            <p className="text-2xl font-bold text-yellow-600">{expiringSoonItems}</p>
          </div>
          <Calendar className="w-8 h-8 text-yellow-600" />
        </div>
      </div>
    </div>
  );
}
