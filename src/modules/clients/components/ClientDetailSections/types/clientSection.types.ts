import type { Client } from '@/types/client.types';

export interface SectionProps {
  client: Client;
}

export interface StatusBadgeProps {
  status: string;
  priority: string;
}