// Mock data and utilities for workflow system testing
import { vi } from 'vitest';
import type {
  WorkflowTemplate,
  WorkflowPhase,
  WorkflowStep,
  WorkflowTask,
  ProjectWorkflow,
  WorkflowExecutionLog,
  WorkflowValidationResult,
  WorkflowAnalytics,
  StaffMember,
  Project
} from '../../types/workflow.types';
import type {
  TemplateStats,
  ProjectWorkflowStats,
  WorkflowTabBadge
} from '../../types/portal.types';

// Mock staff members
export const mockStaffMembers: StaffMember[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    department: 'Engineering',
    position: 'Project Manager'
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    department: 'Engineering',
    position: 'Senior Engineer'
  },
  {
    id: 'user-3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    department: 'Operations',
    position: 'Field Technician'
  }
];

// Mock projects
export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Downtown Fiber Expansion',
    description: 'Fiber network expansion in downtown area',
    status: 'active',
    clientId: 'client-1',
    projectManagerId: 'user-1',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-06-30T00:00:00Z'
  },
  {
    id: 'proj-2',
    name: 'Residential Network Upgrade',
    description: 'Network infrastructure upgrade for residential areas',
    status: 'active',
    clientId: 'client-2',
    projectManagerId: 'user-2',
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2024-08-15T00:00:00Z'
  }
];

// Mock workflow tasks
export const mockWorkflowTasks: WorkflowTask[] = [
  {
    id: 'task-1',
    workflowStepId: 'step-1',
    name: 'Site Survey',
    description: 'Conduct detailed site survey',
    orderIndex: 0,
    priority: 'high',
    estimatedHours: 8,
    skillsRequired: ['surveying', 'documentation'],
    tools: ['survey equipment', 'camera'],
    deliverables: ['site survey report', 'photos'],
    acceptanceCriteria: ['All areas documented', 'GPS coordinates recorded'],
    isOptional: false,
    canBeParallel: false,
    tags: ['survey', 'documentation'],
    metadata: {},
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'task-2',
    workflowStepId: 'step-1',
    name: 'Risk Assessment',
    description: 'Assess potential risks and safety concerns',
    orderIndex: 1,
    priority: 'high',
    estimatedHours: 4,
    skillsRequired: ['safety', 'risk assessment'],
    tools: ['safety checklist'],
    deliverables: ['risk assessment report'],
    acceptanceCriteria: ['All risks identified', 'Mitigation plans created'],
    isOptional: false,
    canBeParallel: true,
    tags: ['safety', 'risk'],
    metadata: {},
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Mock workflow steps
export const mockWorkflowSteps: WorkflowStep[] = [
  {
    id: 'step-1',
    workflowPhaseId: 'phase-1',
    name: 'Site Preparation',
    description: 'Prepare site for installation',
    orderIndex: 0,
    stepType: 'task',
    estimatedDuration: 2,
    assigneeRole: 'Field Technician',
    assigneeId: 'user-3',
    dependencies: [],
    preconditions: ['Site access confirmed'],
    postconditions: ['Site ready for installation'],
    instructions: 'Follow standard site preparation procedures',
    resources: ['tools', 'safety equipment'],
    validation: ['Site cleared', 'Safety measures in place'],
    isRequired: true,
    isAutomated: false,
    metadata: {},
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    tasks: mockWorkflowTasks,
    assignee: mockStaffMembers[2]
  },
  {
    id: 'step-2',
    workflowPhaseId: 'phase-1',
    name: 'Equipment Delivery',
    description: 'Coordinate equipment delivery to site',
    orderIndex: 1,
    stepType: 'milestone',
    estimatedDuration: 1,
    assigneeRole: 'Project Manager',
    assigneeId: 'user-1',
    dependencies: ['step-1'],
    preconditions: ['Equipment ordered'],
    postconditions: ['Equipment on site'],
    instructions: 'Coordinate with logistics team',
    resources: ['delivery schedule'],
    validation: ['Equipment verified', 'Inventory complete'],
    isRequired: true,
    isAutomated: false,
    metadata: {},
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    assignee: mockStaffMembers[0]
  }
];

// Mock workflow phases
export const mockWorkflowPhases: WorkflowPhase[] = [
  {
    id: 'phase-1',
    workflowTemplateId: 'template-1',
    name: 'Planning & Preparation',
    description: 'Initial planning and site preparation phase',
    orderIndex: 0,
    color: '#3b82f6',
    icon: 'planning',
    estimatedDuration: 5,
    requiredRoles: ['Project Manager', 'Field Technician'],
    dependencies: [],
    completionCriteria: ['All planning complete', 'Site ready'],
    isOptional: false,
    isParallel: false,
    metadata: {},
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    steps: mockWorkflowSteps
  },
  {
    id: 'phase-2',
    workflowTemplateId: 'template-1',
    name: 'Installation',
    description: 'Fiber cable installation phase',
    orderIndex: 1,
    color: '#10b981',
    icon: 'installation',
    estimatedDuration: 10,
    requiredRoles: ['Senior Engineer', 'Field Technician'],
    dependencies: ['phase-1'],
    completionCriteria: ['All cables installed', 'Connections verified'],
    isOptional: false,
    isParallel: false,
    metadata: {},
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    steps: []
  }
];

// Mock workflow templates
export const mockWorkflowTemplates: WorkflowTemplate[] = [
  {
    id: 'template-1',
    name: 'Standard Fiber Installation',
    description: 'Standard workflow for fiber optic cable installation',
    category: 'telecommunications',
    type: 'default',
    status: 'active',
    version: '1.0',
    isDefault: true,
    isSystem: false,
    tags: ['fiber', 'installation', 'standard'],
    metadata: {},
    createdBy: 'user-1',
    updatedBy: 'user-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    phases: mockWorkflowPhases,
    projectCount: 5
  },
  {
    id: 'template-2',
    name: 'Emergency Repair Workflow',
    description: 'Workflow for emergency network repairs',
    category: 'emergency',
    type: 'system',
    status: 'active',
    version: '2.1',
    isDefault: false,
    isSystem: true,
    tags: ['emergency', 'repair', 'priority'],
    metadata: {},
    createdBy: 'system',
    updatedBy: 'user-2',
    createdAt: '2023-12-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    phases: [],
    projectCount: 2
  },
  {
    id: 'template-3',
    name: 'Draft Custom Workflow',
    description: 'Custom workflow in draft status',
    category: 'project',
    type: 'custom',
    status: 'draft',
    version: '0.1',
    isDefault: false,
    isSystem: false,
    tags: ['custom', 'draft'],
    metadata: {},
    createdBy: 'user-2',
    updatedBy: 'user-2',
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-22T00:00:00Z',
    phases: [],
    projectCount: 0
  }
];

// Mock project workflows
export const mockProjectWorkflows: ProjectWorkflow[] = [
  {
    id: 'proj-workflow-1',
    projectId: 'proj-1',
    workflowTemplateId: 'template-1',
    name: 'Downtown Project Workflow',
    status: 'active',
    currentPhaseId: 'phase-2',
    progressPercentage: 65,
    startDate: '2024-01-15T00:00:00Z',
    plannedEndDate: '2024-06-30T00:00:00Z',
    assignedTo: 'user-1',
    teamMembers: ['user-1', 'user-2', 'user-3'],
    metrics: {
      totalTasks: 25,
      completedTasks: 16,
      averageTaskDuration: 4.5
    },
    notes: 'Project progressing well, on schedule',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z',
    project: mockProjects[0],
    template: mockWorkflowTemplates[0],
    currentPhase: mockWorkflowPhases[1],
    assignedUser: mockStaffMembers[0]
  },
  {
    id: 'proj-workflow-2',
    projectId: 'proj-2',
    workflowTemplateId: 'template-1',
    name: 'Residential Upgrade Workflow',
    status: 'paused',
    currentPhaseId: 'phase-1',
    progressPercentage: 30,
    startDate: '2024-02-01T00:00:00Z',
    plannedEndDate: '2024-08-15T00:00:00Z',
    assignedTo: 'user-2',
    teamMembers: ['user-2', 'user-3'],
    metrics: {
      totalTasks: 20,
      completedTasks: 6,
      averageTaskDuration: 5.2
    },
    notes: 'Paused due to permit delays',
    createdAt: '2024-01-28T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z',
    project: mockProjects[1],
    template: mockWorkflowTemplates[0],
    currentPhase: mockWorkflowPhases[0],
    assignedUser: mockStaffMembers[1]
  }
];

// Mock execution logs
export const mockWorkflowExecutionLogs: WorkflowExecutionLog[] = [
  {
    id: 'log-1',
    projectWorkflowId: 'proj-workflow-1',
    phaseId: 'phase-1',
    stepId: 'step-1',
    taskId: 'task-1',
    action: 'completed',
    actorId: 'user-3',
    actorName: 'Mike Johnson',
    previousStatus: 'in_progress',
    newStatus: 'completed',
    duration: 480, // 8 hours in minutes
    notes: 'Site survey completed successfully',
    attachments: ['survey-report.pdf'],
    metadata: {},
    timestamp: '2024-01-16T17:00:00Z',
    actor: mockStaffMembers[2]
  },
  {
    id: 'log-2',
    projectWorkflowId: 'proj-workflow-1',
    phaseId: 'phase-1',
    action: 'started',
    actorId: 'user-1',
    actorName: 'John Doe',
    newStatus: 'active',
    notes: 'Started planning phase',
    attachments: [],
    metadata: {},
    timestamp: '2024-01-15T09:00:00Z',
    actor: mockStaffMembers[0]
  }
];

// Mock validation results
export const mockWorkflowValidationResult: WorkflowValidationResult = {
  isValid: false,
  errors: [
    {
      type: 'missing_required',
      level: 'phase',
      itemId: 'phase-2',
      message: 'Phase is missing required steps',
      field: 'steps'
    }
  ],
  warnings: [
    {
      type: 'performance',
      level: 'template',
      itemId: 'template-1',
      message: 'Template has many sequential steps that could be parallelized',
      suggestion: 'Consider marking some steps as parallel'
    }
  ]
};

// Mock analytics data
export const mockWorkflowAnalytics: WorkflowAnalytics = {
  templateUsage: [
    {
      templateId: 'template-1',
      templateName: 'Standard Fiber Installation',
      projectCount: 5,
      averageDuration: 45.2,
      successRate: 0.95
    },
    {
      templateId: 'template-2',
      templateName: 'Emergency Repair Workflow',
      projectCount: 2,
      averageDuration: 12.5,
      successRate: 1.0
    }
  ],
  phaseMetrics: [
    {
      phaseName: 'Planning & Preparation',
      averageDuration: 5.5,
      completionRate: 0.98,
      bottleneckRisk: 0.2
    },
    {
      phaseName: 'Installation',
      averageDuration: 12.3,
      completionRate: 0.92,
      bottleneckRisk: 0.6
    }
  ],
  performanceMetrics: {
    totalProjects: 7,
    averageProjectDuration: 42.8,
    onTimeCompletion: 0.86,
    mostUsedTemplates: ['template-1', 'template-2'],
    commonBottlenecks: ['Equipment delivery', 'Permit approval']
  }
};

// Mock template statistics
export const mockTemplateStats: TemplateStats = {
  totalTemplates: 3,
  activeTemplates: 2,
  draftTemplates: 1,
  archivedTemplates: 0,
  recentlyUpdated: 2
};

// Mock project workflow statistics
export const mockProjectWorkflowStats: ProjectWorkflowStats = {
  totalProjectWorkflows: 2,
  activeWorkflows: 1,
  completedWorkflows: 0,
  pausedWorkflows: 1,
  overdueWorkflows: 0,
  recentlyUpdated: 2
};

// Mock tab badges
export const mockTabBadges: Record<string, WorkflowTabBadge> = {
  templates: {
    count: 3,
    type: 'info'
  },
  editor: {
    count: 1,
    type: 'warning'
  },
  projects: {
    count: 2,
    type: 'info'
  },
  analytics: {}
};

// Utility functions for creating mock data
export const createMockWorkflowTemplate = (overrides: Partial<WorkflowTemplate> = {}): WorkflowTemplate => ({
  id: `template-${Date.now()}`,
  name: 'Test Template',
  description: 'Test workflow template',
  category: 'project',
  type: 'custom',
  status: 'draft',
  version: '1.0',
  isDefault: false,
  isSystem: false,
  tags: [],
  metadata: {},
  createdBy: 'user-1',
  updatedBy: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

export const createMockWorkflowPhase = (overrides: Partial<WorkflowPhase> = {}): WorkflowPhase => ({
  id: `phase-${Date.now()}`,
  workflowTemplateId: 'template-1',
  name: 'Test Phase',
  description: 'Test workflow phase',
  orderIndex: 0,
  color: '#3b82f6',
  icon: 'test',
  estimatedDuration: 5,
  requiredRoles: [],
  dependencies: [],
  completionCriteria: [],
  isOptional: false,
  isParallel: false,
  metadata: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

export const createMockWorkflowStep = (overrides: Partial<WorkflowStep> = {}): WorkflowStep => ({
  id: `step-${Date.now()}`,
  workflowPhaseId: 'phase-1',
  name: 'Test Step',
  description: 'Test workflow step',
  orderIndex: 0,
  stepType: 'task',
  estimatedDuration: 2,
  dependencies: [],
  preconditions: [],
  postconditions: [],
  resources: [],
  validation: [],
  isRequired: true,
  isAutomated: false,
  metadata: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

export const createMockProjectWorkflow = (overrides: Partial<ProjectWorkflow> = {}): ProjectWorkflow => ({
  id: `proj-workflow-${Date.now()}`,
  projectId: 'proj-1',
  workflowTemplateId: 'template-1',
  name: 'Test Project Workflow',
  status: 'active',
  progressPercentage: 0,
  teamMembers: [],
  metrics: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

// Mock service responses
export const mockWorkflowManagementService = {
  getTemplates: vi.fn(),
  getTemplate: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
  validateTemplate: vi.fn(),
  getAnalytics: vi.fn()
};

export const mockWorkflowTemplateService = {
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  duplicate: vi.fn()
};

// Test utilities
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    })
  };
};

export const mockSessionStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    })
  };
};