import type { LucideIcon } from 'lucide-react';
import type { CreateProjectRequest } from '../../types/project.types';

export type FormData = CreateProjectRequest;

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  component: 'basic' | 'details' | 'sow' | 'review';
}