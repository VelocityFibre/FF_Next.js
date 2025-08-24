import { 
  FolderOpen,
  MapPin,
  CheckCircle
} from 'lucide-react';
import type { WizardStep } from './types';

export const wizardSteps: WizardStep[] = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Project name, client, and timeline',
    icon: FolderOpen,
    component: 'basic'
  },
  {
    id: 'details',
    title: 'Project Details',
    description: 'Location, budget, and team assignment',
    icon: MapPin,
    component: 'details'
  },
  {
    id: 'review',
    title: 'Review & Create',
    description: 'Review all information and create project',
    icon: CheckCircle,
    component: 'review'
  }
];