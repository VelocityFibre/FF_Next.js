# Section 4.1: Core Components

## Overview

The FibreFlow React application uses a **component-driven architecture** with 148+ reusable components organized by feature and function. Components are built with TypeScript, React 18, and follow consistent patterns for props, styling, and composition.

### Component Philosophy
- **Atomic Design Principles**: Small, focused components that compose into larger features
- **TypeScript First**: Full type safety for props and events
- **Tailwind Styling**: Utility-first CSS with consistent design tokens
- **Accessibility**: ARIA attributes and keyboard navigation support
- **Performance**: Lazy loading and memoization where appropriate

### Directory Structure
```
src/components/
├── analytics/          # Analytics and dashboard components
├── auth/              # Authentication components (simplified for dev)
├── clients/           # Client management components
├── contractor/        # Contractor components
├── dashboard/         # Dashboard-specific components
├── database/          # Database health and status components
├── error/             # Error boundaries and error displays
├── forms/             # Reusable form components
├── layout/            # Layout components (header, sidebar, etc.)
├── procurement/       # Procurement module components
├── projects/          # Project management components
├── shared/            # Shared/common components
├── sow/              # SOW import components
├── staff/            # Staff management components
└── ui/               # Base UI components

```

## Layout Components

### App Layout (`src/components/layout/AppLayout.tsx`)

The main application layout that wraps all pages:

```typescript
interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: string[];
}

export function AppLayout({ children, title, breadcrumbs }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => localStorage.getItem('sidebar-open') !== 'false'
  );
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={title}
          breadcrumbs={breadcrumbs}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Sidebar Component (`src/components/layout/sidebar/`)

#### Sidebar Navigation Structure
```typescript
const navigationSections = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/app/dashboard' },
      { label: 'Meetings', icon: Users, href: '/app/meetings' },
      { label: 'Action Items', icon: ClipboardList, href: '/app/action-items' },
    ]
  },
  {
    title: 'PROJECT MANAGEMENT',
    items: [
      { label: 'Projects', icon: Briefcase, href: '/app/projects' },
      { label: 'SOW Import', icon: Upload, href: '/app/sow' },
      { label: 'Pole Tracker', icon: MapPin, href: '/app/pole-tracker' },
      { label: 'Fiber Stringing', icon: Cable, href: '/app/fiber-stringing' },
    ]
  },
  // More sections...
];
```

#### Sidebar Component
```typescript
export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  
  return (
    <aside className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b">
          {isOpen ? (
            <Logo className="h-8" />
          ) : (
            <LogoIcon className="h-8 w-8" />
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navigationSections.map(section => (
            <SidebarSection 
              key={section.title}
              {...section}
              isCollapsed={!isOpen}
              currentPath={location.pathname}
            />
          ))}
        </nav>
        
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="p-4 border-t hover:bg-gray-50"
        >
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>
    </aside>
  );
}
```

### Header Component (`src/components/layout/header/Header.tsx`)

```typescript
export function Header({ title, breadcrumbs, onMenuClick }: HeaderProps) {
  const { user } = useAuth(); // Simplified dev auth
  
  return (
    <header className="h-16 bg-white border-b border-gray-200">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {breadcrumbs && <BreadcrumbNavigation items={breadcrumbs} />}
          {title && <h1 className="text-xl font-semibold">{title}</h1>}
        </div>
        
        {/* Right side */}
        <div className="flex items-center gap-4">
          <NotificationBell />
          <ThemeToggle />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
```

## Form Components

### Form Wrapper Component

```typescript
// src/components/forms/Form.tsx
interface FormProps<T> {
  onSubmit: (data: T) => Promise<void>;
  defaultValues?: Partial<T>;
  schema?: ZodSchema<T>;
  children: React.ReactNode;
}

export function Form<T>({ onSubmit, defaultValues, schema, children }: FormProps<T>) {
  const form = useForm<T>({
    defaultValues,
    resolver: schema ? zodResolver(schema) : undefined,
  });
  
  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
      toast.success('Saved successfully');
    } catch (error) {
      toast.error('Failed to save');
      console.error(error);
    }
  });
  
  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {children}
      </form>
    </FormProvider>
  );
}
```

### Input Components

```typescript
// src/components/forms/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function Input({ label, error, hint, required, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        className={cn(
          "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2",
          error 
            ? "border-red-500 focus:ring-red-500" 
            : "border-gray-300 focus:ring-blue-500"
        )}
        {...props}
      />
      {hint && <p className="text-sm text-gray-500">{hint}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

### Select Component

```typescript
// src/components/forms/Select.tsx
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function Select({ label, options, value, onChange, placeholder, error }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full px-3 py-2 border rounded-md",
          error ? "border-red-500" : "border-gray-300"
        )}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(option => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

## Data Display Components

### Data Table Component

```typescript
// src/components/shared/DataTable.tsx
interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onChange: (page: number) => void;
  };
}

export function DataTable<T>({ 
  data, 
  columns, 
  onRowClick, 
  loading, 
  emptyMessage,
  pagination 
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDirection]);
  
  if (loading) {
    return <TableSkeleton columns={columns.length} rows={5} />;
  }
  
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage || 'No data available'}
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(column => (
              <th
                key={String(column.key)}
                className={cn(
                  "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                  column.sortable && "cursor-pointer hover:bg-gray-100"
                )}
                style={{ width: column.width }}
                onClick={() => {
                  if (column.sortable) {
                    if (sortKey === column.key) {
                      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortKey(column.key);
                      setSortDirection('asc');
                    }
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && <SortIcon column={column.key} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row, index) => (
            <tr
              key={index}
              className={cn(
                "hover:bg-gray-50",
                onRowClick && "cursor-pointer"
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map(column => (
                <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap">
                  {column.render 
                    ? column.render(row[column.key], row)
                    : String(row[column.key] || '-')
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {pagination && (
        <TablePagination {...pagination} />
      )}
    </div>
  );
}
```

### Card Component

```typescript
// src/components/shared/Card.tsx
interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ 
  title, 
  subtitle, 
  actions, 
  children, 
  className,
  padding = 'md' 
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div className={cn("bg-white rounded-lg shadow", className)}>
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2">{actions}</div>
            )}
          </div>
        </div>
      )}
      <div className={paddingClasses[padding]}>
        {children}
      </div>
    </div>
  );
}
```

### Stats Card Component

```typescript
// src/components/shared/StatsCard.tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
  };
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon, 
  trend = 'neutral',
  loading 
}: StatsCardProps) {
  if (loading) {
    return <StatsCardSkeleton />;
  }
  
  const trendColors = {
    up: 'text-green-600 bg-green-100',
    down: 'text-red-600 bg-red-100',
    neutral: 'text-gray-600 bg-gray-100',
  };
  
  return (
    <Card padding="sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">
            {value}
          </p>
          {change && (
            <div className={cn("mt-2 flex items-center text-sm", trendColors[trend])}>
              {trend === 'up' && <ArrowUp className="h-4 w-4 mr-1" />}
              {trend === 'down' && <ArrowDown className="h-4 w-4 mr-1" />}
              <span className="font-medium">{change.value}%</span>
              <span className="ml-2">{change.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-blue-100 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
```

## Modal Components

### Modal Component

```typescript
// src/components/shared/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  size = 'md', 
  children,
  footer 
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };
  
  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={cn(
          "relative bg-white rounded-lg shadow-xl w-full",
          sizeClasses[size]
        )}>
          {/* Header */}
          {title && (
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium">{title}</h3>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="px-6 py-4">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 bg-gray-50 border-t">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
```

## Loading & Error Components

### Loading Spinner

```typescript
// src/components/shared/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ 
  size = 'md', 
  label,
  fullScreen 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={cn(
        "animate-spin rounded-full border-b-2 border-blue-600",
        sizeClasses[size]
      )} />
      {label && (
        <p className="text-sm text-gray-600">{label}</p>
      )}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }
  
  return spinner;
}
```

### Error Boundary

```typescript
// src/components/error/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  ErrorBoundaryState
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return <Fallback error={this.state.error!} />;
    }
    
    return this.props.children;
  }
}

function DefaultErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
```

## Specialized Components

### Database Health Indicator

```typescript
// src/components/database/DatabaseHealthIndicator.tsx
export function DatabaseHealthIndicator({ children }: { children: React.ReactNode }) {
  const { data: health, isLoading, error } = useQuery({
    queryKey: ['database-health'],
    queryFn: async () => {
      const response = await fetch('/api/health');
      if (!response.ok) throw new Error('Database unhealthy');
      return response.json();
    },
    refetchInterval: 30000, // Check every 30 seconds
  });
  
  if (isLoading) return <LoadingSpinner fullScreen />;
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert type="error">
          <AlertTitle>Database Connection Error</AlertTitle>
          <AlertDescription>
            Unable to connect to the database. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <>
      {children}
      {/* Status indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className={cn(
          "w-3 h-3 rounded-full",
          health?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
        )} />
      </div>
    </>
  );
}
```

### File Upload Component

```typescript
// src/components/shared/FileUpload.tsx
interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  onUpload: (files: File[]) => void;
  onError?: (error: string) => void;
}

export function FileUpload({ 
  accept, 
  multiple, 
  maxSize = 10 * 1024 * 1024, // 10MB
  onUpload,
  onError 
}: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    multiple,
    maxSize,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        onError?.(error.message);
        return;
      }
      
      onUpload(acceptedFiles);
    },
  });
  
  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragActive 
          ? "border-blue-500 bg-blue-50" 
          : "border-gray-300 hover:border-gray-400"
      )}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        {isDragActive 
          ? "Drop the files here..." 
          : "Drag & drop files here, or click to select"}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Max file size: {(maxSize / (1024 * 1024)).toFixed(0)}MB
      </p>
    </div>
  );
}
```

## Component Patterns

### Composition Pattern

```typescript
// Compound components for flexibility
const Table = ({ children }) => <table>{children}</table>;
Table.Head = ({ children }) => <thead>{children}</thead>;
Table.Body = ({ children }) => <tbody>{children}</tbody>;
Table.Row = ({ children }) => <tr>{children}</tr>;
Table.Cell = ({ children }) => <td>{children}</td>;

// Usage
<Table>
  <Table.Head>
    <Table.Row>
      <Table.Cell>Name</Table.Cell>
      <Table.Cell>Status</Table.Cell>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    {data.map(item => (
      <Table.Row key={item.id}>
        <Table.Cell>{item.name}</Table.Cell>
        <Table.Cell>{item.status}</Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>
```

### Render Props Pattern

```typescript
// Flexible data fetching component
function DataFetcher<T>({ 
  url, 
  render 
}: { 
  url: string; 
  render: (data: T) => React.ReactNode 
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: [url],
    queryFn: () => fetch(url).then(r => r.json()),
  });
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <>{render(data)}</>;
}

// Usage
<DataFetcher 
  url="/api/projects"
  render={(projects) => (
    <ProjectList projects={projects} />
  )}
/>
```

## Performance Optimizations

### Memoization

```typescript
// Memoized expensive component
export const ExpensiveComponent = memo(({ data }: { data: any[] }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      calculated: expensiveCalculation(item),
    }));
  }, [data]);
  
  return <DataDisplay data={processedData} />;
});
```

### Lazy Loading

```typescript
// Lazy load heavy components
const HeavyChart = lazy(() => import('./components/charts/HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart data={data} />
    </Suspense>
  );
}
```

## Next.js Migration Impact

### Server vs Client Components

```typescript
// Server Component (default in Next.js 13+)
// app/components/ProjectList.tsx
export default async function ProjectList() {
  const projects = await db.query.projects.findMany();
  
  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

// Client Component (interactive)
// app/components/ProjectForm.tsx
'use client';

export function ProjectForm() {
  const [formData, setFormData] = useState({});
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Interactive form elements */}
    </form>
  );
}
```

## Best Practices

### Do's
- ✅ Keep components small and focused
- ✅ Use TypeScript for all components
- ✅ Implement proper error boundaries
- ✅ Add loading states for async operations
- ✅ Use semantic HTML and ARIA attributes

### Don'ts
- ❌ Don't put business logic in components
- ❌ Don't ignore accessibility
- ❌ Don't forget error states
- ❌ Don't over-optimize with memoization

## Summary

The component library provides a comprehensive set of 148+ reusable components that form the building blocks of the FibreFlow application. Components are well-organized, fully typed, and follow consistent patterns for maintainability and scalability. The architecture is ready for the Next.js migration with clear separation between server and client components.