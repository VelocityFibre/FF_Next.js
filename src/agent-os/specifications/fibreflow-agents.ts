/**
 * FibreFlow-specific Agent Specifications
 * Defines specialized agents for the React migration project
 */

import {
  AgentSpecification,
  CapabilityType,
  CommunicationType,
  MessageFormat,
  SpecializationDomain,
  PermissionAction,
  TaskType
} from '../types/agent.types';

export const AGENT_SPECIFICATIONS: AgentSpecification[] = [
  {
    type: 'DEVELOPMENT_AGENT',
    name: 'React Development Agent',
    description: 'Specialized agent for React component development and Angular to React migration',
    version: '1.0.0',
    capabilities: [
      {
        name: 'angular_to_react_migration',
        type: CapabilityType.CODE_GENERATION,
        description: 'Convert Angular components to React functional components',
        parameters: [
          { name: 'angularComponent', type: 'string', required: true },
          { name: 'preserveLogic', type: 'boolean', required: false, default: true },
          { name: 'useHooks', type: 'boolean', required: false, default: true }
        ],
        outputFormat: 'React TSX component',
        executionTime: 30000,
        reliability: 0.95,
        dependencies: ['typescript', 'react']
      },
      {
        name: 'component_generation',
        type: CapabilityType.CODE_GENERATION,
        description: 'Generate React components from specifications',
        parameters: [
          { name: 'componentName', type: 'string', required: true },
          { name: 'props', type: 'object', required: false },
          { name: 'styling', type: 'string', required: false, default: 'tailwindcss' }
        ],
        outputFormat: 'React TSX component with TypeScript',
        executionTime: 15000,
        reliability: 0.98,
        dependencies: ['react', 'typescript', 'tailwindcss']
      },
      {
        name: 'service_migration',
        type: CapabilityType.CODE_GENERATION,
        description: 'Convert Angular services to React custom hooks',
        parameters: [
          { name: 'angularService', type: 'string', required: true },
          { name: 'useReactQuery', type: 'boolean', required: false, default: true }
        ],
        outputFormat: 'React custom hook with TypeScript',
        executionTime: 20000,
        reliability: 0.93,
        dependencies: ['react', 'react-query', 'typescript']
      },
      {
        name: 'firebase_integration',
        type: CapabilityType.API_INTEGRATION,
        description: 'Implement Firebase integration for React components',
        parameters: [
          { name: 'collection', type: 'string', required: true },
          { name: 'operations', type: 'array', required: true },
          { name: 'realtime', type: 'boolean', required: false, default: false }
        ],
        outputFormat: 'Firebase service with React hooks',
        executionTime: 25000,
        reliability: 0.96,
        dependencies: ['firebase', 'react', 'typescript']
      }
    ],
    communicationProtocols: [
      {
        type: CommunicationType.MESSAGE_QUEUE,
        format: MessageFormat.JSON,
        timeout: 60000,
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: 'EXPONENTIAL',
          baseDelay: 1000,
          maxDelay: 10000
        }
      }
    ],
    resourceRequirements: {
      minMemory: 512,
      maxMemory: 2048,
      minCpu: 1,
      maxCpu: 4,
      storage: 1024
    },
    dependencies: ['typescript', 'react', 'firebase'],
    autoStart: true,
    maxConcurrentTasks: 5,
    priority: 9,
    specializationDomain: SpecializationDomain.FRONTEND_DEVELOPMENT,
    permissions: [
      {
        resource: 'src/components',
        actions: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.WRITE, PermissionAction.UPDATE]
      },
      {
        resource: 'src/hooks',
        actions: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.WRITE, PermissionAction.UPDATE]
      },
      {
        resource: 'src/services',
        actions: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.WRITE, PermissionAction.UPDATE]
      }
    ]
  },

  {
    type: 'QUALITY_AGENT',
    name: 'Code Quality Assurance Agent',
    description: 'Ensures code quality, runs tests, and validates standards compliance',
    version: '1.0.0',
    capabilities: [
      {
        name: 'typescript_validation',
        type: CapabilityType.CODE_ANALYSIS,
        description: 'Validate TypeScript code for errors and type issues',
        parameters: [
          { name: 'filePath', type: 'string', required: true },
          { name: 'strict', type: 'boolean', required: false, default: true }
        ],
        outputFormat: 'Validation report with errors and suggestions',
        executionTime: 5000,
        reliability: 0.99,
        dependencies: ['typescript']
      },
      {
        name: 'eslint_validation',
        type: CapabilityType.CODE_ANALYSIS,
        description: 'Run ESLint validation and fix auto-fixable issues',
        parameters: [
          { name: 'filePath', type: 'string', required: true },
          { name: 'autoFix', type: 'boolean', required: false, default: true }
        ],
        outputFormat: 'Linting report with fixes applied',
        executionTime: 8000,
        reliability: 0.97,
        dependencies: ['eslint']
      },
      {
        name: 'test_execution',
        type: CapabilityType.TESTING,
        description: 'Execute unit and integration tests',
        parameters: [
          { name: 'testPattern', type: 'string', required: false },
          { name: 'coverage', type: 'boolean', required: false, default: true },
          { name: 'watch', type: 'boolean', required: false, default: false }
        ],
        outputFormat: 'Test results with coverage report',
        executionTime: 30000,
        reliability: 0.98,
        dependencies: ['vitest', 'testing-library']
      },
      {
        name: 'code_review',
        type: CapabilityType.CODE_REVIEW,
        description: 'Perform automated code review and suggest improvements',
        parameters: [
          { name: 'filePath', type: 'string', required: true },
          { name: 'checkPatterns', type: 'boolean', required: false, default: true },
          { name: 'securityScan', type: 'boolean', required: false, default: true }
        ],
        outputFormat: 'Code review report with recommendations',
        executionTime: 15000,
        reliability: 0.94,
        dependencies: ['typescript', 'eslint']
      }
    ],
    communicationProtocols: [
      {
        type: CommunicationType.MESSAGE_QUEUE,
        format: MessageFormat.JSON,
        timeout: 120000,
        retryPolicy: {
          maxRetries: 2,
          backoffStrategy: 'LINEAR',
          baseDelay: 2000,
          maxDelay: 8000
        }
      }
    ],
    resourceRequirements: {
      minMemory: 256,
      maxMemory: 1024,
      minCpu: 1,
      maxCpu: 2,
      storage: 512
    },
    dependencies: ['typescript', 'eslint', 'vitest'],
    autoStart: true,
    maxConcurrentTasks: 8,
    priority: 8,
    specializationDomain: SpecializationDomain.QUALITY_ASSURANCE,
    permissions: [
      {
        resource: 'src/**',
        actions: [PermissionAction.READ, PermissionAction.EXECUTE]
      },
      {
        resource: 'test/**',
        actions: [PermissionAction.READ, PermissionAction.EXECUTE]
      },
      {
        resource: 'reports',
        actions: [PermissionAction.CREATE, PermissionAction.WRITE]
      }
    ]
  },

  {
    type: 'TESTING_AGENT',
    name: 'Automated Testing Agent',
    description: 'Handles comprehensive testing including E2E, unit, and integration tests',
    version: '1.0.0',
    capabilities: [
      {
        name: 'unit_test_generation',
        type: CapabilityType.TESTING,
        description: 'Generate unit tests for React components and hooks',
        parameters: [
          { name: 'componentPath', type: 'string', required: true },
          { name: 'testFramework', type: 'string', required: false, default: 'vitest' },
          { name: 'coverage', type: 'number', required: false, default: 90 }
        ],
        outputFormat: 'Complete test suite with assertions',
        executionTime: 20000,
        reliability: 0.92,
        dependencies: ['vitest', 'testing-library', 'jsdom']
      },
      {
        name: 'e2e_test_creation',
        type: CapabilityType.TESTING,
        description: 'Create end-to-end tests using Playwright',
        parameters: [
          { name: 'userFlow', type: 'string', required: true },
          { name: 'browser', type: 'string', required: false, default: 'chromium' },
          { name: 'viewport', type: 'string', required: false, default: 'desktop' }
        ],
        outputFormat: 'Playwright test specifications',
        executionTime: 25000,
        reliability: 0.89,
        dependencies: ['playwright']
      },
      {
        name: 'integration_testing',
        type: CapabilityType.TESTING,
        description: 'Test component integration and API interactions',
        parameters: [
          { name: 'modules', type: 'array', required: true },
          { name: 'mockApi', type: 'boolean', required: false, default: true }
        ],
        outputFormat: 'Integration test results',
        executionTime: 35000,
        reliability: 0.91,
        dependencies: ['vitest', 'msw', 'testing-library']
      },
      {
        name: 'performance_testing',
        type: CapabilityType.PERFORMANCE,
        description: 'Run performance tests and benchmarks',
        parameters: [
          { name: 'targetUrl', type: 'string', required: true },
          { name: 'metrics', type: 'array', required: false, default: ['FCP', 'LCP', 'TTI'] },
          { name: 'iterations', type: 'number', required: false, default: 5 }
        ],
        outputFormat: 'Performance metrics report',
        executionTime: 60000,
        reliability: 0.93,
        dependencies: ['lighthouse', 'playwright']
      }
    ],
    communicationProtocols: [
      {
        type: CommunicationType.MESSAGE_QUEUE,
        format: MessageFormat.JSON,
        timeout: 180000,
        retryPolicy: {
          maxRetries: 2,
          backoffStrategy: 'EXPONENTIAL',
          baseDelay: 3000,
          maxDelay: 15000
        }
      }
    ],
    resourceRequirements: {
      minMemory: 1024,
      maxMemory: 4096,
      minCpu: 2,
      maxCpu: 6,
      storage: 2048
    },
    dependencies: ['playwright', 'vitest', 'testing-library', 'lighthouse'],
    autoStart: true,
    maxConcurrentTasks: 3,
    priority: 7,
    specializationDomain: SpecializationDomain.QUALITY_ASSURANCE,
    permissions: [
      {
        resource: 'src/**',
        actions: [PermissionAction.READ, PermissionAction.EXECUTE]
      },
      {
        resource: 'tests/**',
        actions: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.WRITE, PermissionAction.UPDATE]
      },
      {
        resource: 'playwright-report',
        actions: [PermissionAction.CREATE, PermissionAction.WRITE]
      }
    ]
  },

  {
    type: 'ARCHITECTURE_AGENT',
    name: 'System Architecture Agent',
    description: 'Manages system architecture decisions and ensures architectural consistency',
    version: '1.0.0',
    capabilities: [
      {
        name: 'architecture_analysis',
        type: CapabilityType.ARCHITECTURE,
        description: 'Analyze current architecture and identify improvement opportunities',
        parameters: [
          { name: 'scope', type: 'string', required: true },
          { name: 'depth', type: 'string', required: false, default: 'comprehensive' }
        ],
        outputFormat: 'Architecture analysis report',
        executionTime: 45000,
        reliability: 0.96,
        dependencies: ['typescript']
      },
      {
        name: 'dependency_analysis',
        type: CapabilityType.CODE_ANALYSIS,
        description: 'Analyze component dependencies and suggest optimizations',
        parameters: [
          { name: 'rootPath', type: 'string', required: true },
          { name: 'includeExternal', type: 'boolean', required: false, default: true }
        ],
        outputFormat: 'Dependency graph with optimization suggestions',
        executionTime: 30000,
        reliability: 0.94,
        dependencies: ['typescript']
      },
      {
        name: 'migration_planning',
        type: CapabilityType.ARCHITECTURE,
        description: 'Create detailed migration plans for Angular to React conversion',
        parameters: [
          { name: 'moduleType', type: 'string', required: true },
          { name: 'complexity', type: 'string', required: false, default: 'medium' }
        ],
        outputFormat: 'Detailed migration plan with tasks and timeline',
        executionTime: 60000,
        reliability: 0.97,
        dependencies: []
      },
      {
        name: 'pattern_enforcement',
        type: CapabilityType.CODE_REVIEW,
        description: 'Enforce architectural patterns and best practices',
        parameters: [
          { name: 'filePath', type: 'string', required: true },
          { name: 'patterns', type: 'array', required: false }
        ],
        outputFormat: 'Pattern compliance report',
        executionTime: 15000,
        reliability: 0.95,
        dependencies: ['typescript']
      }
    ],
    communicationProtocols: [
      {
        type: CommunicationType.MESSAGE_QUEUE,
        format: MessageFormat.JSON,
        timeout: 120000,
        retryPolicy: {
          maxRetries: 1,
          backoffStrategy: 'FIXED',
          baseDelay: 5000,
          maxDelay: 5000
        }
      }
    ],
    resourceRequirements: {
      minMemory: 512,
      maxMemory: 2048,
      minCpu: 1,
      maxCpu: 4,
      storage: 1024
    },
    dependencies: ['typescript'],
    autoStart: true,
    maxConcurrentTasks: 3,
    priority: 8,
    specializationDomain: SpecializationDomain.ARCHITECTURE,
    permissions: [
      {
        resource: 'src/**',
        actions: [PermissionAction.READ]
      },
      {
        resource: 'docs/**',
        actions: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.WRITE, PermissionAction.UPDATE]
      },
      {
        resource: 'architecture/**',
        actions: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.WRITE, PermissionAction.UPDATE]
      }
    ]
  },

  {
    type: 'DATABASE_AGENT',
    name: 'Database Management Agent',
    description: 'Manages Firebase and Neon database operations and migrations',
    version: '1.0.0',
    capabilities: [
      {
        name: 'firebase_operations',
        type: CapabilityType.DATABASE,
        description: 'Execute Firebase Firestore operations',
        parameters: [
          { name: 'operation', type: 'string', required: true },
          { name: 'collection', type: 'string', required: true },
          { name: 'data', type: 'object', required: false }
        ],
        outputFormat: 'Operation result with metadata',
        executionTime: 10000,
        reliability: 0.98,
        dependencies: ['firebase']
      },
      {
        name: 'neon_operations',
        type: CapabilityType.DATABASE,
        description: 'Execute Neon PostgreSQL operations',
        parameters: [
          { name: 'query', type: 'string', required: true },
          { name: 'parameters', type: 'array', required: false }
        ],
        outputFormat: 'Query result with execution metadata',
        executionTime: 8000,
        reliability: 0.97,
        dependencies: ['neon', 'drizzle-orm']
      },
      {
        name: 'data_migration',
        type: CapabilityType.DATABASE,
        description: 'Migrate data between Firebase and Neon',
        parameters: [
          { name: 'source', type: 'string', required: true },
          { name: 'target', type: 'string', required: true },
          { name: 'batchSize', type: 'number', required: false, default: 100 }
        ],
        outputFormat: 'Migration report with statistics',
        executionTime: 120000,
        reliability: 0.95,
        dependencies: ['firebase', 'neon', 'drizzle-orm']
      },
      {
        name: 'schema_validation',
        type: CapabilityType.DATABASE,
        description: 'Validate database schemas and suggest improvements',
        parameters: [
          { name: 'schema', type: 'object', required: true },
          { name: 'database', type: 'string', required: true }
        ],
        outputFormat: 'Schema validation report',
        executionTime: 15000,
        reliability: 0.96,
        dependencies: ['drizzle-orm']
      }
    ],
    communicationProtocols: [
      {
        type: CommunicationType.MESSAGE_QUEUE,
        format: MessageFormat.JSON,
        timeout: 180000,
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: 'EXPONENTIAL',
          baseDelay: 2000,
          maxDelay: 20000
        }
      }
    ],
    resourceRequirements: {
      minMemory: 256,
      maxMemory: 1024,
      minCpu: 1,
      maxCpu: 2,
      storage: 512,
      networkBandwidth: 100
    },
    dependencies: ['firebase', '@neondatabase/serverless', 'drizzle-orm'],
    autoStart: true,
    maxConcurrentTasks: 4,
    priority: 7,
    specializationDomain: SpecializationDomain.DATABASE_MANAGEMENT,
    permissions: [
      {
        resource: 'firebase',
        actions: [PermissionAction.READ, PermissionAction.WRITE, PermissionAction.UPDATE]
      },
      {
        resource: 'neon',
        actions: [PermissionAction.READ, PermissionAction.WRITE, PermissionAction.UPDATE]
      },
      {
        resource: 'src/lib/neon',
        actions: [PermissionAction.READ, PermissionAction.WRITE]
      }
    ]
  },

  {
    type: 'DEPLOYMENT_AGENT',
    name: 'Deployment and Build Agent',
    description: 'Handles builds, deployments, and environment management',
    version: '1.0.0',
    capabilities: [
      {
        name: 'build_application',
        type: CapabilityType.DEPLOYMENT,
        description: 'Build the React application for production',
        parameters: [
          { name: 'environment', type: 'string', required: false, default: 'production' },
          { name: 'optimize', type: 'boolean', required: false, default: true }
        ],
        outputFormat: 'Build results with bundle analysis',
        executionTime: 120000,
        reliability: 0.98,
        dependencies: ['vite', 'typescript']
      },
      {
        name: 'firebase_deploy',
        type: CapabilityType.DEPLOYMENT,
        description: 'Deploy application to Firebase Hosting',
        parameters: [
          { name: 'target', type: 'string', required: false, default: 'default' },
          { name: 'preview', type: 'boolean', required: false, default: false }
        ],
        outputFormat: 'Deployment status and URLs',
        executionTime: 180000,
        reliability: 0.96,
        dependencies: ['firebase-tools']
      },
      {
        name: 'environment_setup',
        type: CapabilityType.DEPLOYMENT,
        description: 'Set up and validate environment configurations',
        parameters: [
          { name: 'environment', type: 'string', required: true },
          { name: 'variables', type: 'object', required: false }
        ],
        outputFormat: 'Environment validation report',
        executionTime: 30000,
        reliability: 0.97,
        dependencies: []
      },
      {
        name: 'health_check',
        type: CapabilityType.MONITORING,
        description: 'Perform application health checks after deployment',
        parameters: [
          { name: 'url', type: 'string', required: true },
          { name: 'endpoints', type: 'array', required: false }
        ],
        outputFormat: 'Health check results',
        executionTime: 45000,
        reliability: 0.95,
        dependencies: []
      }
    ],
    communicationProtocols: [
      {
        type: CommunicationType.MESSAGE_QUEUE,
        format: MessageFormat.JSON,
        timeout: 300000,
        retryPolicy: {
          maxRetries: 2,
          backoffStrategy: 'LINEAR',
          baseDelay: 10000,
          maxDelay: 30000
        }
      }
    ],
    resourceRequirements: {
      minMemory: 1024,
      maxMemory: 4096,
      minCpu: 2,
      maxCpu: 8,
      storage: 4096,
      networkBandwidth: 500
    },
    dependencies: ['vite', 'firebase-tools', 'typescript'],
    autoStart: false,
    maxConcurrentTasks: 2,
    priority: 6,
    specializationDomain: SpecializationDomain.DEVOPS,
    permissions: [
      {
        resource: 'dist/**',
        actions: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.WRITE]
      },
      {
        resource: 'firebase.json',
        actions: [PermissionAction.READ]
      },
      {
        resource: 'package.json',
        actions: [PermissionAction.READ]
      }
    ]
  },

  {
    type: 'MONITORING_AGENT',
    name: 'System Monitoring Agent',
    description: 'Monitors system health, performance, and provides real-time insights',
    version: '1.0.0',
    capabilities: [
      {
        name: 'performance_monitoring',
        type: CapabilityType.MONITORING,
        description: 'Monitor application performance metrics',
        parameters: [
          { name: 'url', type: 'string', required: true },
          { name: 'interval', type: 'number', required: false, default: 30000 },
          { name: 'metrics', type: 'array', required: false }
        ],
        outputFormat: 'Performance metrics dashboard',
        executionTime: 60000,
        reliability: 0.99,
        dependencies: []
      },
      {
        name: 'error_tracking',
        type: CapabilityType.MONITORING,
        description: 'Track and analyze application errors',
        parameters: [
          { name: 'source', type: 'string', required: true },
          { name: 'severity', type: 'string', required: false, default: 'all' }
        ],
        outputFormat: 'Error analysis report',
        executionTime: 15000,
        reliability: 0.98,
        dependencies: []
      },
      {
        name: 'resource_monitoring',
        type: CapabilityType.MONITORING,
        description: 'Monitor system resource utilization',
        parameters: [
          { name: 'resources', type: 'array', required: false, default: ['cpu', 'memory', 'disk'] },
          { name: 'threshold', type: 'number', required: false, default: 80 }
        ],
        outputFormat: 'Resource utilization report',
        executionTime: 10000,
        reliability: 0.99,
        dependencies: []
      },
      {
        name: 'alert_management',
        type: CapabilityType.MONITORING,
        description: 'Manage and process system alerts',
        parameters: [
          { name: 'alertType', type: 'string', required: true },
          { name: 'severity', type: 'string', required: true },
          { name: 'recipients', type: 'array', required: false }
        ],
        outputFormat: 'Alert processing result',
        executionTime: 5000,
        reliability: 0.99,
        dependencies: []
      }
    ],
    communicationProtocols: [
      {
        type: CommunicationType.WEBSOCKET,
        format: MessageFormat.JSON,
        timeout: 30000,
        retryPolicy: {
          maxRetries: 5,
          backoffStrategy: 'EXPONENTIAL',
          baseDelay: 1000,
          maxDelay: 30000
        }
      }
    ],
    resourceRequirements: {
      minMemory: 256,
      maxMemory: 1024,
      minCpu: 1,
      maxCpu: 2,
      storage: 256,
      networkBandwidth: 100
    },
    dependencies: [],
    autoStart: true,
    maxConcurrentTasks: 10,
    priority: 8,
    specializationDomain: SpecializationDomain.PERFORMANCE,
    permissions: [
      {
        resource: 'system',
        actions: [PermissionAction.READ]
      },
      {
        resource: 'logs',
        actions: [PermissionAction.READ, PermissionAction.WRITE]
      },
      {
        resource: 'metrics',
        actions: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.WRITE]
      }
    ]
  }
];

// Task templates for FibreFlow migration
export const TASK_TEMPLATES = {
  [TaskType.COMPONENT_CREATION]: {
    estimatedDuration: 900000, // 15 minutes
    maxRetries: 2,
    requiredCapabilities: ['component_generation'],
    tags: ['react', 'typescript', 'ui']
  },
  [TaskType.CODE_MIGRATION]: {
    estimatedDuration: 1800000, // 30 minutes
    maxRetries: 3,
    requiredCapabilities: ['angular_to_react_migration'],
    tags: ['migration', 'angular', 'react']
  },
  [TaskType.UNIT_TESTING]: {
    estimatedDuration: 600000, // 10 minutes
    maxRetries: 2,
    requiredCapabilities: ['unit_test_generation'],
    tags: ['testing', 'unit-tests']
  },
  [TaskType.E2E_TESTING]: {
    estimatedDuration: 1200000, // 20 minutes
    maxRetries: 1,
    requiredCapabilities: ['e2e_test_creation'],
    tags: ['testing', 'e2e', 'playwright']
  },
  [TaskType.CODE_REVIEW]: {
    estimatedDuration: 300000, // 5 minutes
    maxRetries: 1,
    requiredCapabilities: ['code_review'],
    tags: ['quality', 'review']
  },
  [TaskType.BUILD]: {
    estimatedDuration: 120000, // 2 minutes
    maxRetries: 3,
    requiredCapabilities: ['build_application'],
    tags: ['build', 'deployment']
  },
  [TaskType.DEPLOYMENT]: {
    estimatedDuration: 180000, // 3 minutes
    maxRetries: 2,
    requiredCapabilities: ['firebase_deploy'],
    tags: ['deployment', 'firebase']
  }
};