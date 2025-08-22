/**
 * Agent OS Type Definitions
 * Comprehensive type system for multi-agent orchestration
 */

export interface AgentSpecification {
  type: string;
  name: string;
  description: string;
  version: string;
  capabilities: AgentCapability[];
  communicationProtocols: CommunicationProtocol[];
  resourceRequirements: ResourceRequirements;
  dependencies: string[];
  autoStart: boolean;
  maxConcurrentTasks: number;
  priority: number;
  specializationDomain: SpecializationDomain;
  permissions: AgentPermission[];
}

export interface AgentInstance {
  id: string;
  specification: AgentSpecification;
  status: AgentStatus;
  currentTasks: string[];
  capabilities: AgentCapability[];
  metrics: AgentMetrics;
  communicationProtocols: CommunicationProtocol[];
  lastHeartbeat: Date;
  configuration?: Record<string, unknown>;
}

export interface AgentCapability {
  name: string;
  type: CapabilityType;
  description: string;
  parameters: CapabilityParameter[];
  outputFormat: string;
  executionTime: number; // milliseconds
  reliability: number; // 0-1
  dependencies: string[];
}

export interface CapabilityParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  default?: unknown;
  validation?: ParameterValidation;
}

export interface ParameterValidation {
  min?: number;
  max?: number;
  pattern?: string;
  enum?: unknown[];
}

export enum CapabilityType {
  CODE_GENERATION = 'CODE_GENERATION',
  CODE_ANALYSIS = 'CODE_ANALYSIS',
  CODE_REVIEW = 'CODE_REVIEW',
  TESTING = 'TESTING',
  DEBUGGING = 'DEBUGGING',
  DOCUMENTATION = 'DOCUMENTATION',
  DEPLOYMENT = 'DEPLOYMENT',
  MONITORING = 'MONITORING',
  ARCHITECTURE = 'ARCHITECTURE',
  DATABASE = 'DATABASE',
  UI_UX = 'UI_UX',
  API_INTEGRATION = 'API_INTEGRATION',
  SECURITY = 'SECURITY',
  PERFORMANCE = 'PERFORMANCE',
  QUALITY_ASSURANCE = 'QUALITY_ASSURANCE'
}

export enum AgentStatus {
  INITIALIZING = 'INITIALIZING',
  ACTIVE = 'ACTIVE',
  BUSY = 'BUSY',
  IDLE = 'IDLE',
  STOPPING = 'STOPPING',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  MAINTENANCE = 'MAINTENANCE'
}

export interface AgentMetrics {
  tasksCompleted: number;
  tasksInProgress: number;
  averageTaskTime: number; // milliseconds
  successRate: number; // percentage
  lastActive: Date;
  totalUptime: number; // milliseconds
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
  errorCount?: number;
  warningCount?: number;
}

export interface Task {
  id: string;
  type: TaskType;
  name: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedAgentId?: string;
  requiredCapabilities: string[];
  parameters: Record<string, unknown>;
  dependencies: string[];
  estimatedDuration: number; // milliseconds
  actualDuration?: number;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: unknown;
  error?: string;
  retryCount: number;
  maxRetries: number;
  tags: string[];
  metadata: Record<string, unknown>;
}

export enum TaskType {
  // Development Tasks
  FEATURE_DEVELOPMENT = 'FEATURE_DEVELOPMENT',
  BUG_FIX = 'BUG_FIX',
  REFACTORING = 'REFACTORING',
  CODE_GENERATION = 'CODE_GENERATION',
  COMPONENT_CREATION = 'COMPONENT_CREATION',
  SERVICE_IMPLEMENTATION = 'SERVICE_IMPLEMENTATION',
  
  // Testing Tasks
  UNIT_TESTING = 'UNIT_TESTING',
  INTEGRATION_TESTING = 'INTEGRATION_TESTING',
  E2E_TESTING = 'E2E_TESTING',
  PERFORMANCE_TESTING = 'PERFORMANCE_TESTING',
  ACCESSIBILITY_TESTING = 'ACCESSIBILITY_TESTING',
  
  // Quality Tasks
  CODE_REVIEW = 'CODE_REVIEW',
  LINTING = 'LINTING',
  TYPE_CHECKING = 'TYPE_CHECKING',
  SECURITY_SCAN = 'SECURITY_SCAN',
  
  // Architecture Tasks
  SYSTEM_DESIGN = 'SYSTEM_DESIGN',
  API_DESIGN = 'API_DESIGN',
  DATABASE_DESIGN = 'DATABASE_DESIGN',
  ARCHITECTURE_REVIEW = 'ARCHITECTURE_REVIEW',
  
  // Deployment Tasks
  BUILD = 'BUILD',
  DEPLOYMENT = 'DEPLOYMENT',
  ENVIRONMENT_SETUP = 'ENVIRONMENT_SETUP',
  
  // Documentation Tasks
  API_DOCUMENTATION = 'API_DOCUMENTATION',
  USER_DOCUMENTATION = 'USER_DOCUMENTATION',
  TECHNICAL_DOCUMENTATION = 'TECHNICAL_DOCUMENTATION',
  
  // Monitoring Tasks
  PERFORMANCE_MONITORING = 'PERFORMANCE_MONITORING',
  ERROR_MONITORING = 'ERROR_MONITORING',
  HEALTH_CHECK = 'HEALTH_CHECK',
  
  // Migration Tasks
  DATA_MIGRATION = 'DATA_MIGRATION',
  CODE_MIGRATION = 'CODE_MIGRATION',
  PLATFORM_MIGRATION = 'PLATFORM_MIGRATION'
}

export enum TaskPriority {
  CRITICAL = 5,
  HIGH = 4,
  MEDIUM = 3,
  LOW = 2,
  BACKGROUND = 1
}

export enum TaskStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
  BLOCKED = 'BLOCKED'
}

export interface CommunicationProtocol {
  type: CommunicationType;
  endpoint?: string;
  format: MessageFormat;
  authentication?: AuthenticationMethod;
  timeout: number;
  retryPolicy: RetryPolicy;
}

export enum CommunicationType {
  MESSAGE_QUEUE = 'MESSAGE_QUEUE',
  REST_API = 'REST_API',
  WEBSOCKET = 'WEBSOCKET',
  EVENT_STREAM = 'EVENT_STREAM',
  RPC = 'RPC'
}

export enum MessageFormat {
  JSON = 'JSON',
  XML = 'XML',
  PROTOBUF = 'PROTOBUF',
  PLAIN_TEXT = 'PLAIN_TEXT'
}

export interface AuthenticationMethod {
  type: 'API_KEY' | 'JWT' | 'OAUTH' | 'BASIC' | 'NONE';
  credentials?: Record<string, string>;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'EXPONENTIAL' | 'LINEAR' | 'FIXED';
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
}

export interface CoordinationMessage {
  id: string;
  type: MessageType;
  fromAgentId: string;
  toAgentId?: string; // undefined for broadcast
  payload: unknown;
  timestamp: Date;
  correlationId?: string;
  priority: MessagePriority;
}

export enum MessageType {
  TASK_REQUEST = 'TASK_REQUEST',
  TASK_RESPONSE = 'TASK_RESPONSE',
  COORDINATION_REQUEST = 'COORDINATION_REQUEST',
  COORDINATION_RESPONSE = 'COORDINATION_RESPONSE',
  STATUS_UPDATE = 'STATUS_UPDATE',
  HEARTBEAT = 'HEARTBEAT',
  ERROR_NOTIFICATION = 'ERROR_NOTIFICATION',
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION',
  RESOURCE_REQUEST = 'RESOURCE_REQUEST',
  CAPABILITY_QUERY = 'CAPABILITY_QUERY',
  SHUTDOWN_SIGNAL = 'SHUTDOWN_SIGNAL'
}

export enum MessagePriority {
  URGENT = 5,
  HIGH = 4,
  NORMAL = 3,
  LOW = 2,
  BACKGROUND = 1
}

export interface ResourceRequirements {
  minMemory: number; // MB
  maxMemory: number; // MB
  minCpu: number; // cores
  maxCpu: number; // cores
  storage: number; // MB
  networkBandwidth?: number; // Mbps
  specialRequirements?: string[];
}

export enum SpecializationDomain {
  FRONTEND_DEVELOPMENT = 'FRONTEND_DEVELOPMENT',
  BACKEND_DEVELOPMENT = 'BACKEND_DEVELOPMENT',
  FULLSTACK_DEVELOPMENT = 'FULLSTACK_DEVELOPMENT',
  DATABASE_MANAGEMENT = 'DATABASE_MANAGEMENT',
  DEVOPS = 'DEVOPS',
  QUALITY_ASSURANCE = 'QUALITY_ASSURANCE',
  ARCHITECTURE = 'ARCHITECTURE',
  SECURITY = 'SECURITY',
  PERFORMANCE = 'PERFORMANCE',
  UI_UX_DESIGN = 'UI_UX_DESIGN',
  DATA_ANALYSIS = 'DATA_ANALYSIS',
  MACHINE_LEARNING = 'MACHINE_LEARNING',
  MOBILE_DEVELOPMENT = 'MOBILE_DEVELOPMENT',
  CLOUD_SERVICES = 'CLOUD_SERVICES'
}

export interface AgentPermission {
  resource: string;
  actions: PermissionAction[];
  conditions?: PermissionCondition[];
}

export enum PermissionAction {
  READ = 'READ',
  WRITE = 'WRITE',
  EXECUTE = 'EXECUTE',
  DELETE = 'DELETE',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE'
}

export interface PermissionCondition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'IN' | 'NOT_IN' | 'CONTAINS';
  value: unknown;
}

export interface SystemEvent {
  id: string;
  type: SystemEventType;
  timestamp: Date;
  source: string;
  data: unknown;
  severity: EventSeverity;
}

export enum SystemEventType {
  AGENT_REGISTERED = 'AGENT_REGISTERED',
  AGENT_STARTED = 'AGENT_STARTED',
  AGENT_STOPPED = 'AGENT_STOPPED',
  AGENT_ERROR = 'AGENT_ERROR',
  TASK_CREATED = 'TASK_CREATED',
  TASK_STARTED = 'TASK_STARTED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_FAILED = 'TASK_FAILED',
  SYSTEM_STARTED = 'SYSTEM_STARTED',
  SYSTEM_STOPPED = 'SYSTEM_STOPPED',
  RESOURCE_SHORTAGE = 'RESOURCE_SHORTAGE',
  PERFORMANCE_DEGRADATION = 'PERFORMANCE_DEGRADATION'
}

export enum EventSeverity {
  CRITICAL = 'CRITICAL',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface HealthStatus {
  agentId: string;
  status: HealthStatusType;
  lastCheck: Date;
  metrics: HealthMetrics;
  issues: HealthIssue[];
}

export enum HealthStatusType {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNHEALTHY = 'UNHEALTHY',
  UNKNOWN = 'UNKNOWN'
}

export interface HealthMetrics {
  responseTime: number; // milliseconds
  errorRate: number; // percentage
  throughput: number; // operations per second
  availability: number; // percentage
  resourceUtilization: ResourceUtilization;
}

export interface ResourceUtilization {
  cpu: number; // percentage
  memory: number; // percentage
  storage: number; // percentage
  network: number; // percentage
}

export interface HealthIssue {
  type: HealthIssueType;
  severity: EventSeverity;
  description: string;
  timestamp: Date;
  resolved: boolean;
}

export enum HealthIssueType {
  HIGH_CPU_USAGE = 'HIGH_CPU_USAGE',
  HIGH_MEMORY_USAGE = 'HIGH_MEMORY_USAGE',
  HIGH_ERROR_RATE = 'HIGH_ERROR_RATE',
  SLOW_RESPONSE = 'SLOW_RESPONSE',
  CONNECTION_FAILURE = 'CONNECTION_FAILURE',
  TIMEOUT = 'TIMEOUT',
  RESOURCE_EXHAUSTION = 'RESOURCE_EXHAUSTION'
}

export interface TaskExecutionContext {
  taskId: string;
  agentId: string;
  startTime: Date;
  parameters: Record<string, unknown>;
  resources: AllocatedResource[];
  environment: Record<string, string>;
}

export interface AllocatedResource {
  type: ResourceType;
  id: string;
  allocated: number;
  used: number;
  unit: string;
}

export enum ResourceType {
  CPU = 'CPU',
  MEMORY = 'MEMORY',
  STORAGE = 'STORAGE',
  NETWORK = 'NETWORK',
  GPU = 'GPU'
}

// FibreFlow-specific types

export interface FibreFlowTask extends Task {
  migrationPhase: MigrationPhase;
  moduleType: ModuleType;
  angularComponent?: string | undefined;
  reactComponent?: string | undefined;
  testCoverage?: number;
  performanceMetrics?: PerformanceMetric[];
}

export enum MigrationPhase {
  FOUNDATION = 'FOUNDATION',
  CORE_MODULES = 'CORE_MODULES',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  INTEGRATION = 'INTEGRATION',
  TESTING = 'TESTING',
  OPTIMIZATION = 'OPTIMIZATION',
  DEPLOYMENT = 'DEPLOYMENT'
}

export enum ModuleType {
  AUTHENTICATION = 'AUTHENTICATION',
  PROJECTS = 'PROJECTS',
  POLE_TRACKER = 'POLE_TRACKER',
  STAFF_MANAGEMENT = 'STAFF_MANAGEMENT',
  STOCK_MATERIALS = 'STOCK_MATERIALS',
  BOQ = 'BOQ',
  CONTRACTORS = 'CONTRACTORS',
  DAILY_PROGRESS = 'DAILY_PROGRESS',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS'
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  target?: number;
  threshold?: number;
}