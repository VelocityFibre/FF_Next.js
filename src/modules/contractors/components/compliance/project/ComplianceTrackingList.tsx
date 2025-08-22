/**
 * ComplianceTrackingList Component - Simple tracking list
 */

import { ContractorComplianceRecord, ProjectComplianceRequirement } from '@/services/contractor/contractorComplianceService';

interface ComplianceTrackingListProps {
  records: ContractorComplianceRecord[];
  requirements: ProjectComplianceRequirement[];
}

export function ComplianceTrackingList({ records }: ComplianceTrackingListProps) {
  return (
    <div className="space-y-4">
      {records.map((record) => (
        <div key={record.id} className="bg-white p-4 rounded-lg border">
          <div className="flex justify-between items-center">
            <span>Record {record.id}</span>
            <span className={`px-2 py-1 rounded text-sm ${
              record.complianceStatus === 'compliant' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {record.complianceStatus}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}