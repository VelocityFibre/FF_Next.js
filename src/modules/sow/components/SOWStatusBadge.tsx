import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { DocumentStatus } from '@/modules/projects/types/project.types';

interface SOWStatusBadgeProps {
  status: DocumentStatus;
}

export function SOWStatusBadge({ status }: SOWStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case DocumentStatus.APPROVED:
        return {
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800',
          label: 'Approved'
        };
      case DocumentStatus.REJECTED:
        return {
          icon: AlertCircle,
          className: 'bg-red-100 text-red-800',
          label: 'Rejected'
        };
      case DocumentStatus.PENDING:
      default:
        return {
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800',
          label: 'Pending'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}>
      <Icon className="h-4 w-4 mr-1" />
      {config.label}
    </span>
  );
}