# Claude Development Notes - FibreFlow React Migration

## 🔗 ARCHON INTEGRATION

**Status**: Active
**Project ID**: `fibreflow-react-migration`
**Activated**: 2025-08-19

### Project Context
- **Type**: React Migration Project
- **Languages**: TypeScript, React, Firebase
- **Path**: C:\Jarvis\AI Workspace\FibreFlow_React

### MANDATORY WORKFLOW RULES

#### Before Starting ANY Task:
```javascript
// ALWAYS execute these checks first:
1. archon:manage_task(action="list", project_id="fibreflow-react-migration", filter_by="status", filter_value="todo")
2. archon:perform_rag_query(query="[relevant feature/pattern]", match_count=5)
3. archon:search_code_examples(query="[implementation pattern]", match_count=3)
```

#### During Development:
```javascript
// Update task status immediately when starting:
archon:manage_task(action="update", task_id="[current_task_id]", update_fields={"status": "doing"})

// Search before implementing:
archon:perform_rag_query(query="[specific technical question]")

// Create tasks for discoveries:
archon:manage_task(action="create", project_id="fibreflow-react-migration", title="[new requirement]")
```

#### After Completing Work:
```javascript
// Mark task complete:
archon:manage_task(action="update", task_id="[task_id]", update_fields={"status": "done"})

// Document learnings:
// Add to knowledge base if new patterns discovered
```

---

## 🚀 Project Context
**Migration**: Angular 20 → React 18.3+ (Complete rewrite maintaining Firebase backend)  
**Timeline**: 14-16 weeks  
**Strategy**: Module-based incremental migration with 100% feature parity  
**Status**: Foundation phase (1.2% complete)

## 🎯 CORE PRINCIPLES

### Simplicity First
**"Everything should be made as simple as possible, but not simpler."** — Einstein

- ✅ Use platform features before adding libraries
- ✅ Choose boring technology that works
- ✅ Write code that junior devs can understand
- ❌ No premature abstractions
- ❌ No complex state management until proven necessary
- ❌ No micro-optimizations before measurement

### Modern React Patterns
- Function components only (no classes)
- Hooks for everything (no HOCs)
- Composition over inheritance
- Co-location of related code
- TypeScript strict mode always

## ⚡ CRITICAL INSTRUCTIONS FOR CLAUDE

### 🤖 DO THE WORK - DON'T GIVE TASKS!
**When the user asks for something:**
1. **CHECK** existing code/files first
2. **PLAN** the implementation
3. **ASK** only if critical info missing
4. **DO IT** - Write the actual code
5. **COMPLETE** - Test and verify

**Examples**:
- ❌ WRONG: "You should create a service for..."
- ✅ RIGHT: "I'll create the service now..." *[creates file]*

- ❌ WRONG: "Run this command to set up..."
- ✅ RIGHT: "I'm setting this up now..." *[runs command]*

### 👂 LISTEN & VERIFY FIRST
**The 4-Hour Debugging Disaster Prevention:**
1. **VERIFY EXACT COMPONENT** - Check routing, grep for unique text
2. **ASK IF UNSURE** - "Are you seeing a grid or list view?"
3. **USE GREP** - Find exact file: `grep -r "unique text" src/`
4. **CHECK ALL ROUTES** - Multiple components can serve same URL

### 🛡️ MANDATORY: Code Validation

**ALWAYS validate before suggesting code:**
```bash
# For React service patterns
grep -r "serviceName" src/services --include="*.ts"

# For hook patterns  
grep -r "useHookName" src/hooks --include="*.ts"

# For component patterns
grep -r "ComponentName" src/components --include="*.tsx"
```

**Check these patterns:**
- React hooks (useEffect, useState, etc.)
- Custom hooks in the codebase
- Service method signatures
- Firebase/Firestore operations
- TypeScript types and interfaces

## 🚨 SAFETY PROTOCOLS

### Dangerous Commands - REQUIRE CONFIRMATION
- `rm -rf` - Deletes permanently
- `git reset --hard` - Loses uncommitted work  
- `npm install <package>` - Adds dependencies (verify need first)
- `firebase deploy` - Affects production

### API Keys & Secrets
- NEVER commit secrets to git
- Use `.env.local` for development
- Add to `.gitignore` immediately
- Use environment variables in code

### Production Mindset
**Before ANY action, consider:**
- How does this affect the build?
- What happens on next deployment?
- Will this break existing features?
- Is backward compatibility maintained?

## 🏗️ MIGRATION ARCHITECTURE

### Module Structure
```
src/
├── app/                    # Application core
│   ├── layouts/           # Shell, navigation, footer
│   ├── providers/         # Context providers
│   └── router/            # Route configuration
├── modules/               # Business modules (migrate one at a time)
│   ├── projects/          # Project management
│   ├── pole-tracker/      # Pole installation tracking
│   ├── staff/             # Staff management
│   ├── stock/             # Inventory management
│   ├── boq/               # Bill of quantities
│   ├── contractors/       # Contractor management
│   ├── daily-progress/    # KPI tracking
│   ├── analytics/         # Reports & dashboards
│   └── settings/          # Configuration
├── shared/                # Shared resources
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript definitions
└── styles/                # Global styles
```

### Service Pattern (Firebase)
```typescript
// services/projectService.ts
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const projectService = {
  async getAll() {
    const snapshot = await getDocs(collection(db, 'projects'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Project));
  },

  async getById(id: string) {
    const docRef = doc(db, 'projects', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) throw new Error('Not found');
    return { id: snapshot.id, ...snapshot.data() } as Project;
  },

  async create(data: Omit<Project, 'id'>) {
    const docRef = await addDoc(collection(db, 'projects'), data);
    return docRef.id;
  }
};
```

### Hook Pattern (Data Fetching)
```typescript
// hooks/useProjects.ts
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### Component Pattern
```typescript
// components/ProjectList.tsx
export function ProjectList() {
  const { data: projects, isLoading, error } = useProjects();
  
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className="grid gap-4">
      {projects?.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

## 📋 MIGRATION CHECKLIST

### Phase 1: Foundation ✅ Partial
- [x] Vite project setup
- [x] TypeScript configuration
- [x] Tailwind CSS
- [x] Firebase initialization
- [ ] Authentication system
- [ ] Routing structure
- [ ] Layout components
- [ ] Error boundaries
- [ ] Theme system

### Phase 2: Core Modules (Priority Order)
1. **Projects Module** - Central to all operations
2. **Pole Tracker** - Complex with offline support
3. **Staff Management** - User system foundation
4. **Stock & Materials** - Inventory tracking
5. **BOQ** - Bill of quantities with Excel
6. **Contractors** - Multi-step workflows
7. **Daily Progress** - KPI tracking
8. **Analytics** - Dashboards and reports
9. **Settings** - Configuration
10. **Supporting Features** - Meetings, audit trail

## 🔄 ANGULAR → REACT TRANSLATION GUIDE

### Services
| Angular | React |
|---------|-------|
| `@Injectable()` service | Plain object with functions |
| RxJS Observables | Promises + React Query |
| `HttpClient` | `fetch` or `axios` |
| Dependency Injection | Direct imports |

### Components
| Angular | React |
|---------|-------|
| `@Component()` class | Function component |
| `ngOnInit()` | `useEffect(() => {}, [])` |
| `ngOnDestroy()` | `useEffect` cleanup |
| `@Input()` | Props |
| `@Output()` | Callback props |
| Two-way binding | Controlled components |

### State Management
| Angular | React |
|---------|-------|
| Services with BehaviorSubject | Zustand store |
| RxJS streams | React Query |
| Reactive Forms | React Hook Form |
| Template variables | useRef |

### Routing
| Angular | React |
|---------|-------|
| Router guards | Protected route components |
| Lazy loading modules | React.lazy() |
| Route parameters | useParams() |
| Query parameters | useSearchParams() |

## 🗄️ FIREBASE CONFIGURATION

### Same Backend - No Migration!
- **Project ID**: `fibreflow-73daf`
- **Collections**: Unchanged structure
- **Security Rules**: Same rules apply
- **User Accounts**: Existing users work
- **Storage**: Same buckets

### React Firebase Setup
```typescript
// config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Same config as Angular version
  projectId: "fibreflow-73daf",
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch(console.warn);
```

## 🎨 STYLING & THEMING

### Tailwind Configuration
```javascript
// tailwind.config.js
export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {...}, // From Angular theme
        // Map Angular Material colors
      }
    }
  }
}
```

### Theme Context
```typescript
// contexts/ThemeContext.tsx
const themes = ['light', 'dark', 'vf', 'fibreflow'] as const;

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<Theme>('light');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

## 🏃 DEVELOPMENT WORKFLOW

### Quick Commands
```bash
# Development
npm run dev              # Start dev server (Vite)

# Building
npm run build           # Production build
npm run preview         # Preview build locally

# Testing
npm test                # Run tests
npm run test:coverage   # With coverage

# Code Quality
npm run lint            # ESLint
npm run format          # Prettier
npm run typecheck       # TypeScript check

# Deployment
npm run build && firebase deploy --only hosting
```

### File Creation Pattern
```bash
# When creating new features:
1. Create types first (types/feature.types.ts)
2. Create service (services/featureService.ts)
3. Create hooks (hooks/useFeature.ts)
4. Create components (components/Feature.tsx)
5. Add routes (router/routes.tsx)
6. Write tests (*.test.ts/tsx)
```

## 📊 FEATURE PARITY TRACKING

### Critical Features (Must Have)
- [ ] Authentication (Google + Email)
- [ ] Project hierarchy (4 levels)
- [ ] Pole tracker with offline
- [ ] Photo capture (6 required)
- [ ] GPS location tracking
- [ ] Staff management
- [ ] Stock tracking
- [ ] BOQ with Excel import/export
- [ ] Daily KPIs
- [ ] Report generation

### Data Integrity Rules
- Pole numbers: Globally unique
- Drop numbers: Globally unique
- Max 12 drops per pole
- Required photo validation
- GPS accuracy thresholds

### Performance Targets
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Lighthouse score > 90
- Bundle size < 500KB (with splitting)
- Offline capable

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue: Component not updating
**Solution**: Check React Query cache invalidation
```typescript
queryClient.invalidateQueries({ queryKey: ['projects'] });
```

### Issue: Firebase permissions error
**Solution**: Check authentication state
```typescript
const user = auth.currentUser;
if (!user) throw new Error('Not authenticated');
```

### Issue: TypeScript errors with Firebase
**Solution**: Type assertions for Firestore
```typescript
const data = doc.data() as Project; // Type assertion
```

### Issue: Offline sync not working
**Solution**: Enable persistence early
```typescript
// Must be called before any Firestore operations
enableIndexedDbPersistence(db);
```

## 🚀 DEPLOYMENT

### Build & Deploy
```bash
# Production build
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# With service account (recommended)
export GOOGLE_APPLICATION_CREDENTIALS="./service-account.json"
firebase deploy --only hosting
```

### Environment Variables
```bash
# .env.local (development)
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=fibreflow-73daf

# .env.production (production)
# Same but with production values
```

## 📝 TESTING STRATEGY

### Unit Tests (Vitest)
```typescript
// Component test
import { render, screen } from '@testing-library/react';
import { ProjectCard } from './ProjectCard';

test('renders project title', () => {
  const project = { id: '1', title: 'Test Project' };
  render(<ProjectCard project={project} />);
  expect(screen.getByText('Test Project')).toBeInTheDocument();
});
```

### Integration Tests
```typescript
// Hook test
import { renderHook, waitFor } from '@testing-library/react';
import { useProjects } from './useProjects';

test('fetches projects', async () => {
  const { result } = renderHook(() => useProjects());
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toHaveLength(3);
});
```

## 🎯 CRITICAL SUCCESS FACTORS

### Must Maintain
1. **100% Feature Parity** - Every Angular feature must work
2. **Same Firebase Data** - No data migration or loss
3. **User Experience** - Similar or better UX
4. **Performance** - Equal or better performance
5. **Offline Support** - Field workers need this

### Can Improve
1. **Bundle Size** - React typically smaller
2. **Build Speed** - Vite is 10-100x faster
3. **Developer Experience** - Modern tooling
4. **Component Reuse** - Better composition
5. **Type Safety** - Stricter TypeScript

## 🔴 RED FLAGS - STOP AND THINK

- Adding complex state management early
- Creating abstractions before patterns emerge
- Optimizing before measuring
- Adding dependencies without clear need
- Diverging from Firebase data structure
- Breaking existing user workflows

## ✅ GREEN FLAGS - GOOD PROGRESS

- Components rendering with real data
- Firebase operations working
- Tests passing
- Types fully defined
- Offline working
- Performance targets met

## 📚 REFERENCES

### Documentation
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [TanStack Query](https://tanstack.com/query)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Firebase Docs](https://firebase.google.com/docs)

### Project Files
- `/docs/REACT_MIGRATION_MASTER_PLAN.md` - Full migration strategy
- `/docs/MODULE_SPECIFICATIONS.md` - Detailed module specs
- `/docs/API_MIGRATION_GUIDE.md` - Service migration patterns
- `/docs/COMPONENT_LIBRARY_GUIDE.md` - UI component library
- `/docs/FEATURE_PARITY_CHECKLIST.md` - 410+ item checklist

## 🤝 WORKING WITH CLAUDE

### Best Practices
1. **Be specific** - Mention exact file paths and component names
2. **Provide context** - Share relevant code snippets
3. **One feature at a time** - Don't mix concerns
4. **Test incrementally** - Deploy and verify often
5. **Document decisions** - Update this file with learnings

### What Claude Will Do
- ✅ Write complete implementations
- ✅ Create all necessary files
- ✅ Run commands for you
- ✅ Test and verify code
- ✅ Fix issues directly

### What Claude Won't Do
- ❌ Give you tasks to do yourself
- ❌ Write documentation without code
- ❌ Make architectural decisions alone
- ❌ Deploy to production without confirmation
- ❌ Add complex patterns prematurely

---

**Remember**: This is a MIGRATION, not a rewrite. Preserve all business logic, maintain data compatibility, and ensure users can continue their work without disruption.

**Current Focus**: Complete authentication system and core infrastructure before moving to business modules.

*Last Updated: 2025-08-19*  
*Migration Status: Foundation Phase (1.2%)*