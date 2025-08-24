import type { Drop } from '../types/drops.types';

export const getStatusColor = (status: Drop['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-success-100 text-success-800 border-success-200';
    case 'in_progress':
      return 'bg-info-100 text-info-800 border-info-200';
    case 'scheduled':
      return 'bg-primary-100 text-primary-800 border-primary-200';
    case 'failed':
      return 'bg-error-100 text-error-800 border-error-200';
    default:
      return 'bg-neutral-100 text-neutral-800 border-neutral-200';
  }
};

export const formatStatusText = (status: Drop['status']) => {
  return status.replace('_', ' ');
};