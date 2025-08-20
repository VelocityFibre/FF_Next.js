/**
 * Project template types
 */

import { PhaseType } from './hierarchy.types';

export interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  projectType: string;
  phases: PhaseTemplate[];
  estimatedDuration?: number; // in days
  tags?: string[];
}

export interface PhaseTemplate {
  name: string;
  description?: string;
  type?: PhaseType;
  order: number;
  estimatedDuration?: number; // in days
  defaultSteps?: StepTemplate[];
}

export interface StepTemplate {
  name: string;
  description?: string;
  order: number;
  estimatedDuration?: number; // in hours
  defaultTasks?: TaskTemplate[];
}

export interface TaskTemplate {
  name: string;
  description?: string;
  order: number;
  estimatedHours?: number;
  checklist?: string[];
}

export const FIBER_PROJECT_PHASES: PhaseTemplate[] = [
  {
    name: 'Project Initiation',
    description: 'Initial planning and setup phase',
    type: PhaseType.PLANNING,
    order: 1,
    estimatedDuration: 7,
    defaultSteps: [
      {
        name: 'Requirements Gathering',
        order: 1,
        estimatedDuration: 16,
        defaultTasks: [
          { name: 'Client Meeting', order: 1, estimatedHours: 2 },
          { name: 'Site Survey', order: 2, estimatedHours: 8 },
          { name: 'Document Requirements', order: 3, estimatedHours: 4 }
        ]
      },
      {
        name: 'Project Planning',
        order: 2,
        estimatedDuration: 24,
        defaultTasks: [
          { name: 'Create Project Plan', order: 1, estimatedHours: 8 },
          { name: 'Resource Allocation', order: 2, estimatedHours: 4 },
          { name: 'Risk Assessment', order: 3, estimatedHours: 4 }
        ]
      }
    ]
  },
  {
    name: 'Design & Engineering',
    description: 'Network design and technical planning',
    type: PhaseType.DESIGN,
    order: 2,
    estimatedDuration: 14,
    defaultSteps: [
      {
        name: 'Network Design',
        order: 1,
        estimatedDuration: 40,
        defaultTasks: [
          { name: 'Route Planning', order: 1, estimatedHours: 16 },
          { name: 'Capacity Planning', order: 2, estimatedHours: 8 },
          { name: 'Technical Drawings', order: 3, estimatedHours: 16 }
        ]
      },
      {
        name: 'Design Review',
        order: 2,
        estimatedDuration: 16,
        defaultTasks: [
          { name: 'Internal Review', order: 1, estimatedHours: 4 },
          { name: 'Client Approval', order: 2, estimatedHours: 4 },
          { name: 'Finalize Design', order: 3, estimatedHours: 8 }
        ]
      }
    ]
  },
  {
    name: 'Procurement',
    description: 'Material and equipment procurement',
    type: PhaseType.PROCUREMENT,
    order: 3,
    estimatedDuration: 21,
    defaultSteps: [
      {
        name: 'Vendor Selection',
        order: 1,
        estimatedDuration: 24,
        defaultTasks: [
          { name: 'RFQ Preparation', order: 1, estimatedHours: 8 },
          { name: 'Vendor Evaluation', order: 2, estimatedHours: 8 },
          { name: 'Contract Negotiation', order: 3, estimatedHours: 8 }
        ]
      },
      {
        name: 'Material Ordering',
        order: 2,
        estimatedDuration: 16,
        defaultTasks: [
          { name: 'Place Orders', order: 1, estimatedHours: 4 },
          { name: 'Track Shipments', order: 2, estimatedHours: 4 },
          { name: 'Receive Materials', order: 3, estimatedHours: 8 }
        ]
      }
    ]
  },
  {
    name: 'Construction',
    description: 'Physical installation and construction',
    type: PhaseType.CONSTRUCTION,
    order: 4,
    estimatedDuration: 45,
    defaultSteps: [
      {
        name: 'Site Preparation',
        order: 1,
        estimatedDuration: 40,
        defaultTasks: [
          { name: 'Permits & Approvals', order: 1, estimatedHours: 8 },
          { name: 'Site Clearing', order: 2, estimatedHours: 16 },
          { name: 'Access Roads', order: 3, estimatedHours: 16 }
        ]
      },
      {
        name: 'Cable Installation',
        order: 2,
        estimatedDuration: 120,
        defaultTasks: [
          { name: 'Trenching', order: 1, estimatedHours: 40 },
          { name: 'Cable Laying', order: 2, estimatedHours: 40 },
          { name: 'Splicing', order: 3, estimatedHours: 40 }
        ]
      },
      {
        name: 'Equipment Installation',
        order: 3,
        estimatedDuration: 80,
        defaultTasks: [
          { name: 'Install ODF', order: 1, estimatedHours: 24 },
          { name: 'Install Active Equipment', order: 2, estimatedHours: 32 },
          { name: 'Power Systems', order: 3, estimatedHours: 24 }
        ]
      }
    ]
  },
  {
    name: 'Testing & Commissioning',
    description: 'System testing and commissioning',
    type: PhaseType.TESTING,
    order: 5,
    estimatedDuration: 14,
    defaultSteps: [
      {
        name: 'Testing',
        order: 1,
        estimatedDuration: 40,
        defaultTasks: [
          { name: 'Fiber Testing', order: 1, estimatedHours: 16 },
          { name: 'Network Testing', order: 2, estimatedHours: 16 },
          { name: 'Performance Testing', order: 3, estimatedHours: 8 }
        ]
      },
      {
        name: 'Commissioning',
        order: 2,
        estimatedDuration: 24,
        defaultTasks: [
          { name: 'System Integration', order: 1, estimatedHours: 8 },
          { name: 'Service Activation', order: 2, estimatedHours: 8 },
          { name: 'Acceptance Testing', order: 3, estimatedHours: 8 }
        ]
      }
    ]
  },
  {
    name: 'Project Closure',
    description: 'Handover and project closure',
    type: PhaseType.HANDOVER,
    order: 6,
    estimatedDuration: 7,
    defaultSteps: [
      {
        name: 'Documentation',
        order: 1,
        estimatedDuration: 24,
        defaultTasks: [
          { name: 'As-Built Documentation', order: 1, estimatedHours: 16 },
          { name: 'Training Materials', order: 2, estimatedHours: 8 }
        ]
      },
      {
        name: 'Handover',
        order: 2,
        estimatedDuration: 16,
        defaultTasks: [
          { name: 'Client Training', order: 1, estimatedHours: 8 },
          { name: 'Final Sign-off', order: 2, estimatedHours: 4 },
          { name: 'Warranty Documentation', order: 3, estimatedHours: 4 }
        ]
      }
    ]
  }
];