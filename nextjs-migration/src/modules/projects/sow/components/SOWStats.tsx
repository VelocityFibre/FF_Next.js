import { FileText, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { SOW } from '../types/sow.types';

interface SOWStatsProps {
  sows: SOW[];
}

export function SOWStats({ sows }: SOWStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-600">Total SOWs</span>
          <FileText className="h-4 w-4 text-neutral-400" />
        </div>
        <p className="text-2xl font-semibold text-neutral-900">{sows.length}</p>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-600">Active</span>
          <CheckCircle className="h-4 w-4 text-success-600" />
        </div>
        <p className="text-2xl font-semibold text-success-600">
          {sows.filter(s => s.status === 'active').length}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-600">Pending</span>
          <Clock className="h-4 w-4 text-warning-600" />
        </div>
        <p className="text-2xl font-semibold text-warning-600">
          {sows.filter(s => s.status === 'pending_approval').length}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral-600">Total Value</span>
          <DollarSign className="h-4 w-4 text-primary-600" />
        </div>
        <p className="text-2xl font-semibold text-primary-600">
          ${sows.reduce((sum, s) => sum + s.value, 0).toLocaleString()}
        </p>
      </div>
    </div>
  );
}