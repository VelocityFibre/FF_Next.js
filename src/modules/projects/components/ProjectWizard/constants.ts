import { 
  FolderOpen,
  MapPin,
  FileSpreadsheet,
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
    id: 'sow',
    title: 'Statement of Work',
    description: 'Upload SOW documents and specifications',
    icon: FileSpreadsheet,
    component: 'sow'
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review all information before creating',
    icon: CheckCircle,
    component: 'review'
  }
];