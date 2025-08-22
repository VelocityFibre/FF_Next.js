/**
 * ComplianceExpiringItems Component - List of expiring compliance items
 * Following FibreFlow patterns and staying under 100 lines
 */

import { Calendar } from 'lucide-react';
import { ExpiringItem } from '@/services/contractor/contractorComplianceService';

interface ComplianceExpiringItemsProps {
  items: ExpiringItem[];
}

export function ComplianceExpiringItems({ items }: ComplianceExpiringItemsProps) {
  const formatDaysUntilExpiry = (days: number) => {
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Expires today';
    if (days === 1) return '1 day remaining';
    return `${days} days remaining`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Expiring Items ({items.length})
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {items.map(item => (
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
  );
}
