# Section 2.3: State Management

## Overview

The FibreFlow React application uses a hybrid state management architecture that combines multiple approaches to handle different types of state effectively. The application is currently migrating from React/Vite to Next.js, which will bring significant changes to state management patterns.

### State Management Architecture
- **React Query** (`@tanstack/react-query` v5.85.5) for server state and caching
- **React Context API** for global application state (Auth, Theme, Project)
- **React Hook Form** for complex form state management
- **Custom Storage Service** for persistence with encryption/compression
- **Zustand** (v5.0.7) being introduced in Next.js migration

### Key Patterns
- Query-first architecture with React Query for all server interactions
- Context providers for cross-cutting concerns
- Custom hooks for encapsulating business logic
- Service layer abstraction for data access
- Comprehensive error handling and retry strategies

### Client vs Server State
- **Server State**: Managed by React Query with caching, background updates, and optimistic updates
- **Client State**: React Context for global state, useState for component state
- **Form State**: React Hook Form for complex forms with validation
- **Persistent State**: Custom storage service for user preferences

## Context Providers

### Provider Hierarchy
```tsx
<ErrorBoundary>
  <DatabaseErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <DatabaseHealthIndicator>
        <ThemeProvider>
          <AuthProvider>
            <ProjectProvider>
              <AppRouter />
            </ProjectProvider>
          </AuthProvider>
        </ThemeProvider>
      </DatabaseHealthIndicator>
    </QueryClientProvider>
  </DatabaseErrorBoundary>
</ErrorBoundary>
```

### Core Contexts

#### 1. AuthContext
- **Purpose**: User authentication, authorization, and RBAC
- **Current State**: Development mode with mocked authentication
- **Migration**: Will be replaced by Clerk in Next.js
- **Features**:
  - User profile management
  - Role-based permissions
  - Permission checking methods
  - Session management

#### 2. ThemeContext
- **Purpose**: Theme management with system preference support
- **Features**:
  - Multiple theme support (light, dark, vf, fibreflow, velocity)
  - System theme detection
  - Local storage persistence
  - CSS custom properties integration

#### 3. ProjectContext
- **Purpose**: Current project selection and project list management
- **State**:
  - `currentProject`: Currently selected project
  - `projects`: List of available projects
- **Usage**: Simple state management for project selection

## Custom Hooks

### Major Data Fetching Hooks

#### useProjects
- Comprehensive project management
- Multiple query variants (list, detail, hierarchy, summary)
- Mutation hooks for CRUD operations
- Real-time subscriptions support
- Advanced filtering and query key management

#### useClients
- Full CRUD operations
- Filter management
- Client selection helper
- Contact history tracking
- Dropdown option transformation

#### Specialized Hooks
- `useSOW` - Statement of Work management
- `useNeonSOW` - Neon database SOW operations
- `useDashboardData` - Dashboard analytics and metrics
- `useAuth` - Authentication context consumer

### Hook Patterns
```typescript
// Query key factory pattern
const queryKeys = {
  all: ['projects'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (filters: FilterType) => [...queryKeys.lists(), filters] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
};

// Custom hook with React Query
export function useProjects(filters?: FilterType) {
  return useQuery({
    queryKey: queryKeys.list(filters || {}),
    queryFn: () => projectService.getProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

## React Query Configuration

### Setup
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        if (isDatabaseError(error)) return false;
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: (failureCount, error) => {
        return !isAuthError(error) && failureCount < 1;
      }
    }
  }
});
```

### Query Patterns
- **Query Key Factories**: Hierarchical keys for cache control
- **Stale Time**: 5-15 minutes based on data volatility
- **Background Updates**: Auto-refetch on network reconnect
- **Error Boundaries**: Database-specific error handling

### Mutation Patterns
```typescript
const createProject = useMutation({
  mutationFn: projectService.create,
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    toast.success('Project created successfully');
    navigate(`/app/projects/${data.id}`);
  },
  onError: (error) => {
    toast.error('Failed to create project');
    logger.error('Project creation failed', error);
  },
});
```

### Cache Management
- **Hierarchical Keys**: `['projects', 'list', filter]` pattern
- **Selective Invalidation**: Granular cache updates
- **Garbage Collection**: 10-15 minute cache retention
- **Memory Management**: Automatic cleanup of unused queries

## Local State Patterns

### Component State
```typescript
// Simple local state
const [isOpen, setIsOpen] = useState(false);

// Complex state with reducer (limited use)
const [state, dispatch] = useReducer(reducer, initialState);

// Custom hook for reusable state logic
function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle] as const;
}
```

### Form State Management
```typescript
// React Hook Form integration
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(projectSchema),
  defaultValues: {
    name: '',
    description: '',
    status: 'planning',
  },
});
```

### UI State
- **Toasts**: `react-hot-toast` for notifications
- **Modals**: Local state for visibility control
- **Loading**: React Query's loading states

## Persistence

### Advanced Storage Service

#### StorageCore Features
- **Multiple Storage Types**: localStorage, sessionStorage, memory
- **Encryption**: Optional data encryption
- **Compression**: Data compression for large objects
- **TTL Support**: Automatic expiration
- **Namespace Support**: Organized storage with prefixes
- **Size Monitoring**: Storage tracking and cleanup

#### Usage Examples
```typescript
// Theme persistence
localStorage.setItem('fibreflow-theme-preference', theme);

// Encrypted user preferences
await storageCore.set('user-prefs', userData, 'local', { 
  encrypt: true, 
  ttl: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// Session storage for form drafts
sessionStorage.setItem('form-draft', JSON.stringify(formData));
```

## Migration to Next.js

### Current → Target Architecture

| Aspect | Current (React) | Target (Next.js) |
|--------|----------------|------------------|
| **Auth State** | AuthContext (mock) | Clerk (integrated) |
| **Global State** | React Context | Zustand |
| **Server State** | React Query | React Query (unchanged) |
| **Forms** | React Hook Form | React Hook Form (unchanged) |
| **Persistence** | Custom storage | Zustand middleware |

### Zustand Implementation (Next.js)
```typescript
// nextjs-migration/store/useStore.ts
interface AppState {
  // Projects
  selectedProject: Project | null;
  projectFilters: { status?: string; search?: string; };
  
  // UI State
  sidebarOpen: boolean;
  notifications: Notification[];
  
  // Actions
  setSelectedProject: (project: Project | null) => void;
  toggleSidebar: () => void;
  addNotification: (notification: Notification) => void;
}

const useStore = create<AppState>((set) => ({
  selectedProject: null,
  projectFilters: {},
  sidebarOpen: true,
  notifications: [],
  
  setSelectedProject: (project) => set({ selectedProject: project }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  addNotification: (notification) => set((state) => ({ 
    notifications: [...state.notifications, notification] 
  })),
}));
```

### Server Components Impact
```typescript
// Server Component - No client state needed
export default async function ProjectsPage() {
  const projects = await db.query.projects.findMany();
  return <ProjectList projects={projects} />;
}

// Client Component - Uses client state
'use client';
export function ProjectFilters() {
  const { filters, setFilters } = useStore();
  // Client-side filtering logic
}
```

### Clerk Auth State Integration
```typescript
// Replace AuthContext with Clerk
import { useUser, useAuth } from '@clerk/nextjs';

export function useAppAuth() {
  const { user, isLoaded } = useUser();
  const { userId, sessionId, getToken } = useAuth();
  
  return {
    user,
    isAuthenticated: !!userId,
    isLoading: !isLoaded,
    getAuthToken: getToken,
  };
}
```

## Performance Optimizations

### Query Optimization
- **Deduplication**: React Query auto-deduplicates identical queries
- **Background Updates**: Stale-while-revalidate pattern
- **Selective Subscriptions**: Fine-grained query subscriptions

### Memoization Strategies
```typescript
// Expensive calculations
const expensiveValue = useMemo(() => 
  calculateComplexMetric(data), [data]
);

// Stable callbacks
const handleSubmit = useCallback((values) => {
  submitForm(values);
}, [submitForm]);

// Component memoization
const MemoizedComponent = memo(ExpensiveComponent);
```

### Re-render Prevention
- **Query Key Stability**: Consistent keys prevent cache misses
- **State Colocation**: Keep state close to where it's used
- **Zustand Selectors**: Fine-grained subscriptions

```typescript
// Zustand selector for specific state slice
const projectName = useStore(state => state.selectedProject?.name);
```

## Technical Debt & TODOs

### Current Issues
1. **Mock Authentication**: Using mock data for development
2. **Mixed Patterns**: Inconsistency between context and React Query
3. **Type Safety**: Some type definitions could be stricter
4. **Error Handling**: Needs standardization across hooks

### Migration TODOs
1. **Clerk Integration**: Replace mock auth with Clerk
2. **Zustand Migration**: Gradually replace contexts with Zustand
3. **Server Components**: Identify server-renderable components
4. **Performance Audit**: Post-migration performance analysis

### Recommended Improvements
1. **Standardize Error Handling**: Global error patterns
2. **Add Optimistic Updates**: More mutations should be optimistic
3. **Improve Cache Strategy**: Granular invalidation
4. **Add Offline Support**: Offline-first with React Query
5. **State Normalization**: Consider normalized structure for complex data

## Best Practices

### Do's
- Use React Query for all server state
- Colocate state with components when possible
- Use query key factories for consistency
- Implement optimistic updates for better UX
- Leverage server components in Next.js

### Don'ts
- Don't sync server state to local state
- Avoid prop drilling - use context or Zustand
- Don't over-optimize with memoization
- Avoid storing derived state
- Don't ignore TypeScript warnings

The state management architecture is well-designed for the current React SPA and positioned well for the Next.js migration. The combination of React Query for server state and the planned Zustand implementation for client state will provide a modern, performant foundation for the application.