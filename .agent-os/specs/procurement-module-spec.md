# Procurement Module - Technical Specification

## Overview
This specification defines the technical implementation details for the Procurement Portal Module within the FibreFlow_React application.

## Module Architecture

### Component Hierarchy
```
ProcurementModule
├── ProcurementDashboard          # Main dashboard and navigation
├── BOQManagement                 # BOQ upload, mapping, and management
│   ├── BOQUpload                 # Excel file upload interface
│   ├── BOQMappingReview          # Catalog mapping and exception handling
│   ├── BOQViewer                 # BOQ display and editing
│   └── BOQHistory               # BOQ version history
├── RFQManagement                # RFQ creation and lifecycle
│   ├── RFQBuilder               # Create RFQ from BOQ items
│   ├── RFQDistribution          # Supplier invitation and communication
│   ├── RFQTracking              # Status tracking and reminders
│   └── RFQArchive               # Historical RFQ data
├── QuoteEvaluation              # Quote comparison and award
│   ├── QuoteComparison          # Side-by-side quote analysis
│   ├── EvaluationMatrix         # Weighted scoring system
│   ├── AwardProcess             # Award recommendations and approval
│   └── QuoteHistory             # Quote archives and analytics
├── SupplierPortal               # External supplier interface
│   ├── SupplierDashboard        # Supplier overview and notifications
│   ├── RFQResponse              # Quote submission interface
│   ├── DocumentManagement       # Certificate and document uploads
│   └── CommunicationCenter      # Messaging and Q&A
├── StockManagement              # Material tracking and logistics
│   ├── StockDashboard           # Inventory overview and alerts
│   ├── GoodsReceipt             # ASN/GRN processing
│   ├── StockMovements           # Issues, returns, transfers
│   └── DrumTracking             # Cable drum meter tracking
└── ProcurementReporting         # Analytics and business intelligence
    ├── KPIDashboard             # Key performance indicators
    ├── CostAnalysis             # Savings and budget variance
    ├── SupplierPerformance      # Supplier scorecards
    └── ComplianceReports        # Audit trails and documentation
```

## Data Models

### Core Entities
```typescript
interface Project {
  id: string;
  name: string;
  code: string;
  status: ProjectStatus;
  budget: ProjectBudget;
  procurement: ProcurementConfig;
}

interface BOQ {
  id: string;
  projectId: string;
  version: string;
  status: BOQStatus;
  uploadedBy: string;
  uploadedAt: Date;
  mappingStatus: MappingStatus;
  items: BOQItem[];
  exceptions: BOQException[];
}

interface BOQItem {
  id: string;
  boqId: string;
  lineNumber: number;
  itemCode?: string;
  description: string;
  uom: string;
  quantity: number;
  catalogItem?: CatalogItem;
  mappingConfidence: number;
  phase?: string;
  task?: string;
  site?: string;
}

interface RFQ {
  id: string;
  projectId: string;
  rfqNumber: string;
  title: string;
  description: string;
  status: RFQStatus;
  issueDate: Date;
  responseDeadline: Date;
  items: RFQItem[];
  invitedSuppliers: SupplierInvitation[];
  quotes: Quote[];
  evaluations: QuoteEvaluation[];
  award?: Award;
}

interface Quote {
  id: string;
  rfqId: string;
  supplierId: string;
  submissionDate: Date;
  validUntil: Date;
  status: QuoteStatus;
  items: QuoteItem[];
  documents: QuoteDocument[];
  totalValue: Money;
  leadTime: number;
  terms: QuoteTerms;
}

interface StockMovement {
  id: string;
  projectId: string;
  type: MovementType; // ASN, GRN, ISSUE, RETURN, TRANSFER
  referenceNumber: string;
  date: Date;
  fromLocation?: string;
  toLocation?: string;
  items: StockMovementItem[];
  documents: MovementDocument[];
  status: MovementStatus;
}
```

### Enums and Types
```typescript
enum BOQStatus {
  DRAFT = 'DRAFT',
  MAPPING_REVIEW = 'MAPPING_REVIEW',
  APPROVED = 'APPROVED',
  ARCHIVED = 'ARCHIVED'
}

enum RFQStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  RESPONSES_RECEIVED = 'RESPONSES_RECEIVED',
  EVALUATED = 'EVALUATED',
  AWARDED = 'AWARDED',
  CANCELLED = 'CANCELLED'
}

enum MovementType {
  ASN = 'ASN',           // Advanced Shipping Notice
  GRN = 'GRN',           // Goods Receipt Note
  ISSUE = 'ISSUE',       // Material Issue
  RETURN = 'RETURN',     // Material Return
  TRANSFER = 'TRANSFER'  // Inter-project Transfer
}

type Money = {
  amount: number;
  currency: string;
};

type ProjectScope = {
  projectId: string;
  siteIds?: string[];
  phaseIds?: string[];
};
```

## API Endpoints

### BOQ Management
```typescript
// BOQ Operations
POST   /api/v1/projects/{projectId}/boqs/import
GET    /api/v1/projects/{projectId}/boqs
GET    /api/v1/projects/{projectId}/boqs/{boqId}
PUT    /api/v1/projects/{projectId}/boqs/{boqId}
DELETE /api/v1/projects/{projectId}/boqs/{boqId}

// BOQ Mapping
POST   /api/v1/projects/{projectId}/boqs/{boqId}/mapping/auto
POST   /api/v1/projects/{projectId}/boqs/{boqId}/mapping/manual
GET    /api/v1/projects/{projectId}/boqs/{boqId}/exceptions
PUT    /api/v1/projects/{projectId}/boqs/{boqId}/exceptions/{exceptionId}
```

### RFQ Management
```typescript
// RFQ Operations
POST   /api/v1/projects/{projectId}/rfqs
GET    /api/v1/projects/{projectId}/rfqs
GET    /api/v1/projects/{projectId}/rfqs/{rfqId}
PUT    /api/v1/projects/{projectId}/rfqs/{rfqId}
DELETE /api/v1/projects/{projectId}/rfqs/{rfqId}

// RFQ Lifecycle
POST   /api/v1/projects/{projectId}/rfqs/{rfqId}/issue
POST   /api/v1/projects/{projectId}/rfqs/{rfqId}/invite-suppliers
POST   /api/v1/projects/{projectId}/rfqs/{rfqId}/close
POST   /api/v1/projects/{projectId}/rfqs/{rfqId}/extend-deadline
```

### Supplier Portal
```typescript
// Supplier Authentication
POST   /api/v1/suppliers/auth/magic-link
POST   /api/v1/suppliers/auth/verify-token

// Supplier RFQ Access
GET    /api/v1/suppliers/{supplierId}/rfqs
GET    /api/v1/suppliers/{supplierId}/rfqs/{rfqId}
POST   /api/v1/suppliers/{supplierId}/rfqs/{rfqId}/quotes
PUT    /api/v1/suppliers/{supplierId}/rfqs/{rfqId}/quotes/{quoteId}
```

### Stock Management
```typescript
// Stock Movements
POST   /api/v1/projects/{projectId}/stock/asn
POST   /api/v1/projects/{projectId}/stock/grn
POST   /api/v1/projects/{projectId}/stock/issue
POST   /api/v1/projects/{projectId}/stock/return
POST   /api/v1/projects/{projectId}/stock/transfer

// Stock Queries
GET    /api/v1/projects/{projectId}/stock/positions
GET    /api/v1/projects/{projectId}/stock/movements
GET    /api/v1/projects/{projectId}/stock/drums/{drumId}/history
```

## State Management

### Context Structure
```typescript
interface ProcurementContextState {
  currentProject: Project | null;
  permissions: ProcurementPermissions;
  boqs: BOQ[];
  rfqs: RFQ[];
  stockPositions: StockPosition[];
  loading: {
    boqs: boolean;
    rfqs: boolean;
    stock: boolean;
  };
  errors: {
    boqs: string | null;
    rfqs: string | null;
    stock: string | null;
  };
}

type ProcurementAction = 
  | { type: 'SET_PROJECT'; payload: Project }
  | { type: 'LOAD_BOQS_START' }
  | { type: 'LOAD_BOQS_SUCCESS'; payload: BOQ[] }
  | { type: 'LOAD_BOQS_ERROR'; payload: string }
  | { type: 'ADD_BOQ'; payload: BOQ }
  | { type: 'UPDATE_BOQ'; payload: { id: string; updates: Partial<BOQ> } }
  | { type: 'REMOVE_BOQ'; payload: string };
```

### Custom Hooks
```typescript
// BOQ Management
export const useBoqs = (projectId: string) => {
  // Returns: { boqs, createBoq, updateBoq, deleteBoq, loading, error }
};

export const useBoqImport = () => {
  // Returns: { importBoq, mapItems, resolveExceptions, progress }
};

// RFQ Management
export const useRfqs = (projectId: string) => {
  // Returns: { rfqs, createRfq, updateRfq, issueRfq, loading, error }
};

export const useQuoteEvaluation = (rfqId: string) => {
  // Returns: { quotes, evaluate, award, comparison, loading }
};

// Stock Management
export const useStockPositions = (projectId: string) => {
  // Returns: { positions, movements, createMovement, loading }
};

export const useDrumTracking = (projectId: string) => {
  // Returns: { drums, updateMeters, trackHistory, alerts }
};
```

## Validation Schemas

### Zod Schemas
```typescript
// BOQ Validation
export const BOQItemSchema = z.object({
  lineNumber: z.number().positive(),
  itemCode: z.string().optional(),
  description: z.string().min(1).max(500),
  uom: z.string().min(1).max(20),
  quantity: z.number().positive(),
  phase: z.string().optional(),
  task: z.string().optional(),
  site: z.string().optional(),
});

export const BOQSchema = z.object({
  projectId: z.string().uuid(),
  version: z.string().min(1),
  items: z.array(BOQItemSchema).min(1),
});

// RFQ Validation
export const RFQSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  responseDeadline: z.date().min(new Date()),
  items: z.array(z.string().uuid()).min(1),
  invitedSuppliers: z.array(z.string().uuid()).min(1),
});

// Quote Validation
export const QuoteItemSchema = z.object({
  rfqItemId: z.string().uuid(),
  unitPrice: z.number().positive(),
  totalPrice: z.number().positive(),
  leadTime: z.number().nonnegative(),
  alternateOffered: z.boolean().default(false),
  technicalNotes: z.string().optional(),
});
```

## Error Handling

### Error Types
```typescript
export class ProcurementError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ProcurementError';
  }
}

export class BOQMappingError extends ProcurementError {
  constructor(
    message: string,
    public unmappedItems: BOQItem[],
    public suggestions: MappingSuggestion[]
  ) {
    super(message, 'BOQ_MAPPING_ERROR', 422);
  }
}

export class RFQValidationError extends ProcurementError {
  constructor(
    message: string,
    public validationErrors: ValidationError[]
  ) {
    super(message, 'RFQ_VALIDATION_ERROR', 422);
  }
}
```

### Error Boundaries
```typescript
export const ProcurementErrorBoundary: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Error boundary implementation with procurement-specific error handling
  // Integrates with existing FibreFlow error reporting
};
```

## Performance Considerations

### Optimization Strategies
- **Virtual Scrolling**: For large BOQ and quote lists
- **Debounced Search**: For catalog item matching
- **Pagination**: Server-side pagination for all list views
- **Caching**: React Query for server state management
- **Code Splitting**: Lazy load procurement module components
- **Batch Operations**: Bulk BOQ item processing

### Database Optimization
- **Indexing Strategy**: Project-scoped indexes for all queries
- **Query Optimization**: Use of database views for complex reporting
- **Connection Pooling**: Efficient database connection management
- **Caching Layer**: Redis for frequently accessed data

## Security Implementation

### Authentication & Authorization
```typescript
// RBAC Implementation
export const useProcurementPermissions = (projectId: string) => {
  const { user, permissions } = useAuth();
  
  return {
    canViewBOQ: hasPermission(permissions, 'boq:read', projectId),
    canEditBOQ: hasPermission(permissions, 'boq:write', projectId),
    canCreateRFQ: hasPermission(permissions, 'rfq:create', projectId),
    canEvaluateQuotes: hasPermission(permissions, 'quote:evaluate', projectId),
    canAccessStock: hasPermission(permissions, 'stock:access', projectId),
  };
};
```

### Data Isolation
- **Project Scoping**: All queries filtered by project access
- **Row-Level Security**: Database-level access controls
- **API Middleware**: Project permission validation on all routes
- **UI Guards**: Component-level permission checks

This specification provides the foundation for implementing the Procurement Portal Module with full integration into the existing FibreFlow_React architecture.