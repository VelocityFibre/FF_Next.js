# FibreFlow React - Module Specifications

## Overview

This document provides detailed specifications for each business module in the FibreFlow React migration. Each module is designed as a self-contained unit with clear interfaces and dependencies.

---

## 1. Projects Module

### Purpose
Central module for managing fiber optic installation projects with hierarchical task management.

### Core Features
- Project CRUD operations
- 4-level hierarchy: Project → Phase → Step → Task
- Progress tracking and visualization
- Team assignment and management
- Real-time status updates

### Data Models
```typescript
interface Project {
  id: string;
  title: string;
  client: ClientReference;
  status: 'active' | 'completed' | 'pending' | 'on-hold';
  priority: 'high' | 'medium' | 'low';
  location: string;
  startDate: Date;
  endDate?: Date;
  type: 'FTTH' | 'FTTB' | 'FTTC' | 'P2P';
  projectManager: UserReference;
  phases?: Phase[];
  metadata: ProjectMetadata;
}

interface Phase {
  id: string;
  projectId: string;
  name: string;
  orderNo: number;
  status: PhaseStatus;
  steps?: Step[];
  startDate?: Date;
  endDate?: Date;
}

interface Step {
  id: string;
  phaseId: string;
  name: string;
  orderNo: number;
  status: StepStatus;
  tasks?: Task[];
}

interface Task {
  id: string;
  stepId: string;
  name: string;
  assignee: UserReference;
  status: TaskStatus;
  priority: Priority;
  dueDate: Date;
  completedDate?: Date;
  dependencies: string[];
}
```

### Components Structure
```
modules/projects/
├── components/
│   ├── ProjectCard/
│   ├── ProjectForm/
│   ├── ProjectProgress/
│   ├── PhaseManager/
│   ├── StepEditor/
│   └── TaskBoard/
├── pages/
│   ├── ProjectList/
│   ├── ProjectDetail/
│   ├── ProjectCreate/
│   └── ProjectEdit/
├── hooks/
│   ├── useProjects.ts
│   ├── useProjectDetail.ts
│   └── useProjectProgress.ts
├── services/
│   └── projectService.ts
└── types/
    └── project.types.ts
```

### API Endpoints
- `GET /projects` - List all projects
- `GET /projects/:id` - Get project details
- `POST /projects` - Create project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `GET /projects/:id/phases` - Get project phases
- `POST /projects/:id/phases` - Add phase

### State Management
```typescript
// Zustand Store
interface ProjectStore {
  selectedProject: Project | null;
  filters: ProjectFilters;
  setSelectedProject: (project: Project) => void;
  setFilters: (filters: ProjectFilters) => void;
  clearSelection: () => void;
}
```

---

## 2. Pole Tracker Module

### Purpose
Comprehensive pole installation tracking system with mobile field capture and desktop management.

### Core Features
- Desktop pole management interface
- Mobile-optimized capture app
- GPS location tracking
- Photo capture (6 required photos)
- Offline queue for poor connectivity
- Bulk import/export
- Real-time synchronization

### Data Models
```typescript
interface PoleTracker {
  id: string;
  poleNumber: string; // Globally unique
  projectId: string;
  location: GeoLocation;
  status: PoleStatus;
  plannedDate?: Date;
  installedDate?: Date;
  photos: PolePhotos;
  drops: DropConnection[]; // Max 12
  contractor?: ContractorReference;
  metadata: PoleMetadata;
}

interface DropConnection {
  id: string;
  dropNumber: string; // Globally unique
  poleId: string;
  address: string;
  status: DropStatus;
  installDate?: Date;
}

interface PolePhotos {
  before?: PhotoReference;
  front?: PhotoReference;
  side?: PhotoReference;
  depth?: PhotoReference;
  concrete?: PhotoReference;
  compaction?: PhotoReference;
}

interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}
```

### Desktop Components
```
modules/pole-tracker/desktop/
├── components/
│   ├── PoleTable/
│   ├── PoleFilters/
│   ├── PoleImportWizard/
│   ├── PoleExport/
│   └── PoleStatistics/
├── pages/
│   ├── PoleList/
│   ├── PoleDetail/
│   └── PoleImport/
└── hooks/
    └── usePoleDeskop.ts
```

### Mobile Components
```
modules/pole-tracker/mobile/
├── components/
│   ├── PoleMap/
│   ├── QuickCapture/
│   ├── PhotoUpload/
│   ├── OfflineIndicator/
│   └── NearbyPoles/
├── pages/
│   ├── MobileMapView/
│   ├── CaptureFlow/
│   ├── MyAssignments/
│   └── NearbyView/
└── hooks/
    ├── useGeolocation.ts
    ├── useOfflineQueue.ts
    └── usePhotoCapture.ts
```

### Offline Support
```typescript
interface OfflineQueue {
  id: string;
  type: 'pole_capture' | 'photo_upload' | 'status_update';
  data: any;
  timestamp: Date;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
}

// Service Worker Strategy
const offlineStrategy = {
  poles: 'cache-first',
  photos: 'queue-and-sync',
  updates: 'background-sync'
};
```

---

## 3. Staff Management Module

### Purpose
Comprehensive staff management with role-based access control and project allocations.

### Core Features
- Staff CRUD operations
- Role management
- Project assignments
- Skills tracking
- Performance metrics
- Availability calendar

### Data Models
```typescript
interface Staff {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  skills: string[];
  projects: ProjectAssignment[];
  availability: AvailabilityStatus;
  joinDate: Date;
  status: 'active' | 'inactive' | 'on-leave';
}

interface ProjectAssignment {
  projectId: string;
  role: ProjectRole;
  startDate: Date;
  endDate?: Date;
  allocation: number; // Percentage
}
```

### Components
```
modules/staff/
├── components/
│   ├── StaffCard/
│   ├── StaffForm/
│   ├── RoleSelector/
│   ├── SkillsManager/
│   └── AssignmentCalendar/
├── pages/
│   ├── StaffList/
│   ├── StaffDetail/
│   └── StaffImport/
└── services/
    └── staffService.ts
```

---

## 4. Stock & Materials Module

### Purpose
Inventory management system for tracking materials, stock movements, and allocations.

### Core Features
- Material catalog management
- Stock level tracking
- Movement history
- Project allocations
- Low stock alerts
- Supplier linkage

### Data Models
```typescript
interface StockItem {
  id: string;
  code: string;
  name: string;
  category: MaterialCategory;
  unit: UnitOfMeasure;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  supplier?: SupplierReference;
  cost: number;
  location: string;
}

interface StockMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  projectId?: string;
  date: Date;
  performedBy: UserReference;
  notes?: string;
}

interface MaterialAllocation {
  id: string;
  projectId: string;
  items: AllocatedItem[];
  status: 'reserved' | 'issued' | 'returned';
  allocatedDate: Date;
  allocatedBy: UserReference;
}
```

### Components
```
modules/stock/
├── components/
│   ├── StockTable/
│   ├── StockForm/
│   ├── MovementHistory/
│   ├── AllocationDialog/
│   └── StockAlerts/
├── pages/
│   ├── StockList/
│   ├── Movements/
│   └── Allocations/
└── services/
    ├── stockService.ts
    └── movementService.ts
```

---

## 5. BOQ (Bill of Quantities) Module

### Purpose
Comprehensive BOQ management with Excel import/export, templates, and quote generation.

### Core Features
- BOQ creation and editing
- Excel import/export
- Template management
- Material linkage
- Quote generation
- Cost calculations
- Version control

### Data Models
```typescript
interface BOQ {
  id: string;
  projectId: string;
  version: number;
  items: BOQItem[];
  totalCost: number;
  status: 'draft' | 'approved' | 'revised';
  createdDate: Date;
  approvedBy?: UserReference;
  approvedDate?: Date;
}

interface BOQItem {
  id: string;
  itemNo: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  category: string;
  materialId?: string;
}

interface BOQTemplate {
  id: string;
  name: string;
  category: string;
  items: BOQTemplateItem[];
  isDefault: boolean;
}
```

### Components
```
modules/boq/
├── components/
│   ├── BOQTable/
│   ├── BOQForm/
│   ├── ItemEditor/
│   ├── ImportWizard/
│   ├── ExportDialog/
│   └── TemplateManager/
├── pages/
│   ├── BOQList/
│   ├── BOQDetail/
│   └── Templates/
└── services/
    ├── boqService.ts
    └── excelService.ts
```

---

## 6. Contractors Module

### Purpose
Contractor management with assignment tracking, performance scoring, and payment processing.

### Core Features
- Contractor profiles
- Multi-step onboarding
- Project assignments
- Performance tracking
- Payment management
- Document storage
- RAG scoring

### Data Models
```typescript
interface Contractor {
  id: string;
  companyName: string;
  registrationNo: string;
  taxNo: string;
  contact: ContactInfo;
  services: string[];
  capabilities: Capabilities;
  bankDetails: BankingInfo;
  documents: Document[];
  projects: ContractorProject[];
  ragScore: RAGScore;
  status: 'active' | 'inactive' | 'blacklisted';
}

interface ContractorProject {
  projectId: string;
  contractorId: string;
  scope: string;
  startDate: Date;
  endDate?: Date;
  value: number;
  status: ProjectStatus;
  performance: PerformanceMetrics;
}

interface RAGScore {
  overall: 'red' | 'amber' | 'green';
  quality: number;
  timeline: number;
  communication: number;
  safety: number;
  lastUpdated: Date;
}
```

### Components
```
modules/contractors/
├── components/
│   ├── ContractorCard/
│   ├── OnboardingWizard/
│   ├── AssignmentDialog/
│   ├── PerformanceChart/
│   ├── DocumentManager/
│   └── RAGScorecard/
├── pages/
│   ├── ContractorList/
│   ├── ContractorDetail/
│   └── Onboarding/
└── services/
    └── contractorService.ts
```

---

## 7. Daily Progress Module

### Purpose
Daily KPI tracking with enhanced forms, financial tracking, and weekly report generation.

### Core Features
- Daily KPI entry
- Financial tracking
- Quality metrics
- Weekly summaries
- Report generation
- Trend analysis

### Data Models
```typescript
interface DailyProgress {
  id: string;
  date: Date;
  projectId: string;
  kpis: DailyKPIs;
  financial: FinancialMetrics;
  quality: QualityMetrics;
  notes: string;
  submittedBy: UserReference;
  submittedAt: Date;
}

interface DailyKPIs {
  polesInstalled: number;
  cablesLaid: number;
  connectionsCompleted: number;
  testsPerformed: number;
  issuesResolved: number;
  customMetrics: CustomKPI[];
}

interface FinancialMetrics {
  laborCost: number;
  materialCost: number;
  equipmentCost: number;
  otherCosts: number;
  totalCost: number;
}

interface WeeklyReport {
  weekEnding: Date;
  projectId: string;
  dailyProgress: DailyProgress[];
  summary: WeeklySummary;
  trends: TrendAnalysis;
}
```

### Components
```
modules/daily-progress/
├── components/
│   ├── KPIForm/
│   ├── FinancialForm/
│   ├── QualityForm/
│   ├── ProgressChart/
│   ├── WeeklySummary/
│   └── TrendAnalysis/
├── pages/
│   ├── DailyEntry/
│   ├── ProgressList/
│   └── WeeklyReport/
└── services/
    ├── dailyProgressService.ts
    └── reportService.ts
```

---

## 8. Analytics & Reports Module

### Purpose
Comprehensive analytics dashboard with custom reports and data visualization.

### Core Features
- Executive dashboard
- Custom report builder
- Data visualization
- PDF generation
- Excel exports
- Scheduled reports

### Data Models
```typescript
interface Report {
  id: string;
  name: string;
  type: ReportType;
  parameters: ReportParameters;
  schedule?: ReportSchedule;
  format: 'pdf' | 'excel' | 'csv';
  recipients?: string[];
}

interface Dashboard {
  widgets: DashboardWidget[];
  layout: GridLayout;
  filters: DashboardFilters;
  refreshInterval?: number;
}

interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  dataSource: DataSource;
  visualization: VisualizationType;
  position: GridPosition;
  size: WidgetSize;
}
```

### Components
```
modules/analytics/
├── components/
│   ├── DashboardGrid/
│   ├── WidgetBuilder/
│   ├── ChartContainer/
│   ├── ReportBuilder/
│   ├── ExportDialog/
│   └── ScheduleManager/
├── pages/
│   ├── Dashboard/
│   ├── Reports/
│   └── Analytics/
└── services/
    ├── analyticsService.ts
    └── exportService.ts
```

---

## 9. Settings & Configuration Module

### Purpose
System configuration, user preferences, and application settings management.

### Core Features
- Company settings
- User preferences
- Email templates
- System configuration
- Integration settings
- Backup management

### Data Models
```typescript
interface CompanySettings {
  name: string;
  logo: string;
  address: Address;
  contact: ContactInfo;
  taxInfo: TaxInformation;
  branding: BrandingSettings;
}

interface UserPreferences {
  userId: string;
  theme: ThemePreference;
  language: string;
  notifications: NotificationSettings;
  dashboard: DashboardPreferences;
  accessibility: AccessibilitySettings;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: TemplateVariable[];
  type: EmailType;
}
```

### Components
```
modules/settings/
├── components/
│   ├── CompanyForm/
│   ├── PreferencesPanel/
│   ├── EmailTemplateEditor/
│   ├── IntegrationSettings/
│   └── BackupManager/
├── pages/
│   ├── GeneralSettings/
│   ├── UserPreferences/
│   └── SystemConfig/
└── services/
    └── settingsService.ts
```

---

## Module Dependencies

### Dependency Matrix
```
Module              | Dependencies
--------------------|------------------------------------------
Projects            | None (Core module)
Pole Tracker        | Projects
Staff               | Projects
Stock               | Projects, Suppliers
BOQ                 | Projects, Stock, Materials
Contractors         | Projects
Daily Progress      | Projects, Staff
Analytics           | All modules (read-only)
Settings            | None (Configuration module)
```

### Shared Services
```typescript
// Shared across all modules
export const sharedServices = {
  authService,        // Authentication
  firebaseService,    // Firebase operations
  notificationService,// Toast notifications
  uploadService,      // File uploads
  exportService,      // Data exports
  auditService,       // Audit logging
};
```

---

## Integration Points

### Inter-Module Communication
```typescript
// Event Bus Pattern
interface ModuleEvent {
  source: string;
  target: string;
  event: string;
  data: any;
}

// Example: Project created, notify Pole Tracker
eventBus.emit({
  source: 'projects',
  target: 'pole-tracker',
  event: 'project.created',
  data: { projectId, projectName }
});
```

### Data Synchronization
- Real-time sync via Firestore listeners
- Optimistic updates with rollback
- Conflict resolution strategies
- Offline queue management

---

## Performance Considerations

### Module Loading
- Lazy load all modules
- Code splitting at route level
- Prefetch critical modules
- Progressive enhancement

### Data Management
- Virtual scrolling for large lists
- Pagination with cursor-based navigation
- Debounced search inputs
- Memoized expensive computations

---

## Testing Requirements

### Unit Tests
- Minimum 80% coverage per module
- Test all service methods
- Test custom hooks
- Test utility functions

### Integration Tests
- Test module interactions
- Test data flow
- Test error scenarios
- Test offline behavior

---

*Document Version: 1.0*  
*Last Updated: 2025-08-19*  
*Status: Active*