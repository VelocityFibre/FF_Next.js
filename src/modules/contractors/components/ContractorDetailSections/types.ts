/**
 * Contractor Detail Section Types
 * Shared types and interfaces
 */

import { Contractor } from '@/types/contractor.types';

export interface ContractorSectionProps {
  contractor: Contractor;
}

export const ragColors = {
  green: 'bg-green-100 text-green-800',
  amber: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800'
} as const;

export const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  suspended: 'bg-red-100 text-red-800',
  blacklisted: 'bg-red-100 text-red-800',
  under_review: 'bg-blue-100 text-blue-800'
} as const;