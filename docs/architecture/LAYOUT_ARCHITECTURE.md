# Layout Architecture Documentation

## Overview
FibreFlow uses a standardized layout system built around the `AppLayout` component. This document outlines the layout architecture and how to use it.

## Current Layout System

### Primary Layout: AppLayout
**Location:** `/components/layout/AppLayout.tsx`

The `AppLayout` is the standard layout wrapper for all pages in the application. It provides:
- Responsive sidebar navigation
- Header with breadcrumbs
- User menu and notifications
- Theme support
- Collapsible sidebar with localStorage persistence
- Footer

### Component Structure
```
components/layout/
├── index.ts              # Single source of truth for exports
├── AppLayout.tsx         # Main layout wrapper (280 lines)
├── Header.tsx            # Top navigation bar
├── Sidebar.tsx           # Side navigation menu
├── Footer.tsx            # Footer component
├── header/               # Header subcomponents
│   ├── BreadcrumbNavigation.tsx
│   ├── NotificationsDropdown.tsx
│   ├── SearchBar.tsx
│   └── UserMenuDropdown.tsx
└── sidebar/              # Sidebar subcomponents
    ├── NavigationMenu.tsx
    ├── SidebarHeader.tsx
    └── CollapseToggle.tsx
```

## Usage

### Basic Page Setup
```tsx
import { AppLayout } from '@/components/layout/AppLayout';

export default function MyPage() {
  return (
    <AppLayout>
      {/* Your page content here */}
    </AppLayout>
  );
}
```

### Importing Layout Components
Always import from the index file for consistency:
```tsx
import { 
  AppLayout, 
  Header, 
  Sidebar, 
  Footer 
} from '@/components/layout';
```

## Features

### 1. Sidebar Persistence
The sidebar collapsed state is automatically saved to localStorage and restored on page load.

### 2. Breadcrumb Navigation
Automatically generated based on the current route using Next.js router.

### 3. Theme Support
Integrated with ThemeContext for light/dark mode support.

### 4. Responsive Design
- Mobile: Sidebar becomes a drawer
- Tablet: Collapsible sidebar
- Desktop: Full sidebar with collapse option

## Migration History

### Previous Layouts (Archived)
The following layouts have been replaced and archived to `/archive/old-layouts/`:

1. **MainLayout** - Basic layout with emoji icons (migrated from)
2. **Simple Layout** - Minimal layout without features (deprecated)

### Cleanup Process (Completed Sept 2025)
1. ✅ Created archive folder for old layouts
2. ✅ Moved deprecated layouts to archive
3. ✅ Updated all pages to use AppLayout
4. ✅ Removed duplicate components from src/components
5. ✅ Created single source of truth index file

## Best Practices

### DO:
- Always use `AppLayout` for new pages
- Import layout components from `@/components/layout`
- Maintain consistent navigation structure
- Use the built-in theme and auth contexts

### DON'T:
- Create new layout wrappers unless absolutely necessary
- Import layout components directly from their files
- Duplicate layout logic in pages
- Use the archived layouts (they're for reference only)

## File References
- Main Layout: `/components/layout/AppLayout.tsx`
- Index File: `/components/layout/index.ts`
- Archived Layouts: `/archive/old-layouts/`
- This Documentation: `/docs/LAYOUT_ARCHITECTURE.md`

## Related Documentation
- See `CLAUDE.md` for AI assistant context
- See `/docs/PROJECT_STRUCTURE.md` for overall architecture

---
*Last Updated: September 2025*
*Layout System Version: 2.0 (AppLayout Standard)*