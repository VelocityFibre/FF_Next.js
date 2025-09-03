import { ClientStatus, ClientPriority, ClientCategory } from '@/types/client.types';

export const getStatusColor = (status: ClientStatus): string => {
  switch (status) {
    case ClientStatus.ACTIVE:
      return 'bg-green-100 text-green-800';
    case ClientStatus.INACTIVE:
      return 'bg-gray-100 text-gray-800';
    case ClientStatus.PROSPECT:
      return 'bg-blue-100 text-blue-800';
    case ClientStatus.CHURNED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityColor = (priority: ClientPriority): string => {
  switch (priority) {
    case ClientPriority.VIP:
      return 'bg-purple-100 text-purple-800';
    case ClientPriority.CRITICAL:
      return 'bg-red-100 text-red-800';
    case ClientPriority.HIGH:
      return 'bg-orange-100 text-orange-800';
    case ClientPriority.MEDIUM:
      return 'bg-yellow-100 text-yellow-800';
    case ClientPriority.LOW:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getCategoryIcon = (category: ClientCategory): string => {
  switch (category) {
    case ClientCategory.ENTERPRISE:
      return '🏢';
    case ClientCategory.SME:
      return '🏪';
    case ClientCategory.RESIDENTIAL:
      return '🏠';
    case ClientCategory.GOVERNMENT:
      return '🏛️';
    case ClientCategory.NON_PROFIT:
      return '❤️';
    case ClientCategory.EDUCATION:
      return '🎓';
    case ClientCategory.HEALTHCARE:
      return '🏥';
    default:
      return '📋';
  }
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};