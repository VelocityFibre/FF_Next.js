# Section 1.2: Routing & Navigation

## Overview

FibreFlow uses a sophisticated routing architecture built on **React Router v6** with a focus on enterprise-scale organization and maintainability. The application is currently structured as a single-page application (SPA) but has an **ongoing migration to Next.js App Router** for improved performance and developer experience.

### Purpose and Routing Architecture
- **Centralized route management** with modular route definitions
- **Nested routing structure** supporting complex application hierarchies  
- **Lazy loading and code splitting** for optimal performance
- **Role-based route protection** with authentication guards
- **Breadcrumb navigation** with automatic path generation

### Key Files and Directories
- `src/app/router/` - Main routing configuration
- `src/app/router/routes/` - Modular route definitions
- `src/components/layout/sidebar/config/` - Navigation menu configuration
- `nextjs-migration/` - Next.js migration workspace

### Route Hierarchy and Structure
```
/app (Protected Routes)
├── /dashboard (Main dashboard)
├── /projects (Project management)
├── /clients (Client management)
├── /staff (Staff management)  
├── /contractors (Contractor management)
├── /procurement (Nested procurement portal)
├── /sow (SOW management)
├── /communications (Meetings, action items, tasks)
├── /analytics (Reporting and KPIs)
└── /settings (System configuration)
```

## Route Configuration

### Main Route Structure

**Top-level Routes:**
- `/` → Redirects to `/app/dashboard`
- `/login` → Authentication page (public)
- `/test/vf-theme` → Theme testing page (public)
- `/app` → Protected route wrapper with nested application routes
- `*` → 404 Not Found handler

**Protected Application Routes (`/app/*`):**
- `/app/dashboard` → Main dashboard (lazy-loaded)
- `/app/projects` → Project listing and management
- `/app/clients` → Client management system
- `/app/staff` → Staff management with import functionality
- `/app/procurement` → Nested procurement portal

### Project Routes
- `/app/projects` → Project listing page
- `/app/projects/new` → Project creation wizard
- `/app/projects/:id` → Project detail view
- `/app/projects/:id/edit` → Project editing form
- `/app/projects/:projectId/tracker` → Unified project tracker
- `/app/pole-tracker` → Pole tracking dashboard
- `/app/fiber-stringing` → Fiber installation management
- `/app/drops` → Drops management system
- `/app/home-installs` → Home installation tracking

### Module Routes

**Client Management:**
- `/app/clients` → Client listing
- `/app/clients/new` → New client creation
- `/app/clients/:id` → Client detail view
- `/app/clients/:id/edit` → Client editing

**Staff Management:**
- `/app/staff` → Staff listing
- `/app/staff/new` → New staff member
- `/app/staff/import` → Staff data import
- `/app/staff/:id` → Staff detail view
- `/app/staff/:id/edit` → Staff editing

**Analytics & Reporting:**
- `/app/analytics` → Analytics dashboard
- `/app/daily-progress` → Daily progress tracking
- `/app/enhanced-kpis` → Enhanced KPI dashboard
- `/app/reports` → Reporting system

### Procurement Routes (Nested Structure)

**Main Structure:**
```typescript
{
  path: 'procurement',
  element: <ProcurementPage />,
  children: [
    // BOQ Management
    { path: 'boq', children: [...boqRoutes] },
    // RFQ Management  
    { path: 'rfq', children: [...rfqRoutes] },
    // Stock Management
    { path: 'stock', children: [...stockRoutes] },
  ]
}
```

## Navigation Components

### Sidebar Navigation

**Navigation Configuration Structure:**
- **Modular sections** organized by functional area
- **Icon-based navigation** with Lucide React icons
- **Permission-based visibility** (currently mocked in development)
- **Responsive design** with collapsed/expanded states

**Navigation Sections:**
1. **MAIN** - Dashboard, meetings, action items
2. **PROJECT MANAGEMENT** - Projects, pole capture, fiber stringing
3. **PEOPLE** - Clients, staff, contractors  
4. **PROCUREMENT** - Procurement portal, suppliers portal
5. **ANALYTICS & REPORTING** - KPIs, reports, daily progress
6. **COMMUNICATIONS** - Meetings, action items, workflow
7. **FIELD OPERATIONS** - Field app, OneMap, Nokia equipment
8. **SYSTEM** - Settings, migration status

### Breadcrumb Navigation

**Features:**
- **Automatic breadcrumb generation** based on current route
- **Clickable navigation** with proper routing
- **Mobile-responsive** with collapsible menu button
- **Semantic path mapping** for user-friendly navigation

### App Layout Integration

**Dynamic Page Metadata:**
- **Context-aware titles** and breadcrumbs
- **Route-based page metadata** generation
- **Sidebar state persistence** with localStorage
- **Mobile-first responsive design**

## Authentication & Guards

### Protected Route System

**Route Protection Mechanism:**
```typescript
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
```

### Authentication Context

**Current State (Development Mode):**
- **Mock authentication** for development ease
- **RBAC framework** prepared for production implementation
- **Permission-based access control** structure in place
- **Role hierarchy** defined but not yet enforced

**Planned RBAC Implementation:**
- **User roles:** `SUPER_ADMIN`, `ADMIN`, `PROJECT_MANAGER`, `FIELD_USER`, `VIEWER`
- **Granular permissions** for different system areas
- **Route-level permission checking**
- **Component-level access control**

### Route Guards and Redirect Logic

**Authentication Flow:**
1. **Root redirect** (`/` → `/app/dashboard`)
2. **Protected route wrapper** checks authentication status
3. **Unauthenticated redirect** to `/login`
4. **Post-login redirect** to intended destination

## Performance Optimizations

### Lazy Loading Strategy

**Comprehensive Lazy Loading (134+ components):**
- **React.lazy()** for all major components
- **Suspense boundaries** with loading states
- **Code splitting** by functional modules
- **Bundle optimization** for faster initial load

**Module-based Code Splitting:**
- **Core modules** (Dashboard, VFThemeTest)
- **Client management** (5+ components)
- **Staff management** (6+ components)
- **Procurement system** (40+ components)
- **Project tracking** (12+ components)
- **Analytics modules** (8+ components)

### Loading States and Error Boundaries

**Loading Component:**
```typescript
export function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" label="Loading..." />
    </div>
  );
}
```

**Error Boundaries:**
- **Project routes** wrapped in ErrorBoundary
- **Main app layout** protected with error handling
- **Graceful fallbacks** for component failures

## Integration Points

### State Management Integration

**Route-aware State:**
- **Sidebar collapse state** persisted across navigation
- **Current user context** available throughout route tree
- **Page metadata** generated dynamically from routes

### API Integration Points

**Route-triggered API Calls:**
- **Project detail routes** (`/projects/:id`) trigger project data fetching
- **Client/Staff detail views** load entity-specific data
- **Procurement workflows** integrate with backend APIs
- **Dashboard routes** aggregate data from multiple sources

### Deep Linking Support

**URL Structure:**
- **RESTful route patterns** for resource management
- **Nested routes** maintain URL context
- **Query parameters** supported for filtering and pagination
- **Bookmarkable URLs** for all major views

## Technical Debt & TODOs

### Current Known Issues

**Authentication System:**
- **Mock authentication** in development mode needs production implementation
- **RBAC system** designed but not yet enforced
- **Permission checking** returns `true` for all requests in development

**Route Management:**
- **Hard-coded breadcrumb mapping** needs dynamic generation
- **Route metadata** could be more structured and type-safe
- **Error handling** needs enhancement for better user experience

### Missing Routes or Features

**Planned Enhancements:**
- **Advanced search** routes for global content discovery
- **User profile management** routes
- **System administration** panel routes
- **Audit log** viewing routes
- **Notification center** routing

### Migration Considerations for Next.js

**Current React Router → Next.js App Router Migration:**

**Migration Status:**
- **Next.js workspace** prepared at `/nextjs-migration/`
- **Authentication** moving from Firebase to Clerk
- **Database** remains Neon PostgreSQL with Drizzle ORM

**Migration Challenges:**
1. **Route structure adaptation** from React Router to Next.js file-based routing
2. **Lazy loading patterns** need adjustment for Next.js dynamic imports  
3. **Protected route middleware** requires Next.js-specific implementation
4. **State management** integration with Next.js SSR/SSG
5. **Bundle optimization** strategies need reconfiguration

**Planned Migration Approach:**
- **Phase 1:** API routes migration to Next.js
- **Phase 2:** Authentication system replacement (Firebase → Clerk)
- **Phase 3:** Frontend route structure adaptation
- **Phase 4:** Performance optimization and deployment

**Benefits of Migration:**
- **Improved performance** with SSR/SSG capabilities
- **Better SEO** support for public-facing routes
- **Simplified deployment** with Vercel integration
- **Enhanced developer experience** with Next.js tooling
- **Reduced bundle complexity** with Next.js automatic optimizations

The routing system is well-architected for the current React SPA approach but will benefit significantly from the planned Next.js migration, particularly in terms of performance, SEO, and developer experience improvements.