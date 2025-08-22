# Procurement Portal - Tech Stack

## Frontend Architecture
### Core Framework
- **React 18.2+**: Component library with hooks and context
- **TypeScript 5.0+**: Type safety and development experience
- **Vite**: Build tool and development server
- **React Router**: Client-side routing and navigation

### UI/UX Framework
- **TailwindCSS**: Utility-first CSS framework (existing FibreFlow standard)
- **shadcn/ui**: Component library (consistent with FibreFlow design system)
- **Lucide Icons**: Icon library (matching current usage)
- **React Hook Form**: Form management and validation
- **Zod**: Schema validation for forms and API responses

### State Management
- **React Context + useReducer**: Global state (following FibreFlow patterns)
- **React Query/TanStack Query**: Server state management and caching
- **Zustand**: Local component state where needed

## Backend Architecture
### API Framework
- **Existing FibreFlow API**: Extend current TypeScript/Node.js backend
- **Express.js**: HTTP server and routing
- **Prisma/Drizzle**: Database ORM (match existing choice)
- **Zod**: API validation and type generation

### Database
- **PostgreSQL 16**: Primary database (existing)
- **Redis**: Caching and session storage (existing)
- **S3-compatible**: Document and file storage

### Security & Authentication
- **JWT**: Token-based authentication (existing pattern)
- **bcrypt**: Password hashing
- **helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration

## Development Tools
### Code Quality
- **ESLint**: Linting (existing configuration)
- **Prettier**: Code formatting (existing configuration)
- **TypeScript compiler**: Type checking
- **Husky**: Git hooks for pre-commit validation

### Testing
- **Vitest**: Unit testing (existing choice)
- **Testing Library**: Component testing
- **Playwright**: E2E testing (existing setup)
- **MSW**: API mocking for tests

### Build & Deployment
- **Vite**: Production builds
- **Docker**: Containerization (if needed)
- **GitHub Actions**: CI/CD pipeline (existing)

## Integration Points
### Existing FibreFlow Services
- **Authentication Service**: User management and RBAC
- **Project Service**: Project data and associations
- **Notification Service**: Email and in-app notifications
- **File Service**: Document upload and storage

### External Services
- **Email Provider**: SMTP for notifications
- **Storage Provider**: S3-compatible for documents
- **Monitoring**: Existing observability stack

## File Structure
```
src/
├── modules/procurement/
│   ├── components/
│   │   ├── boq/                 # BOQ management components
│   │   ├── rfq/                 # RFQ creation and management
│   │   ├── supplier-portal/     # External supplier interface
│   │   ├── stock/               # Stock movement and tracking
│   │   └── shared/              # Shared procurement components
│   ├── hooks/
│   │   ├── useBoq.ts
│   │   ├── useRfq.ts
│   │   ├── useStock.ts
│   │   └── useSupplier.ts
│   ├── services/
│   │   ├── boqService.ts
│   │   ├── rfqService.ts
│   │   ├── stockService.ts
│   │   └── supplierService.ts
│   ├── types/
│   │   ├── boq.types.ts
│   │   ├── rfq.types.ts
│   │   ├── stock.types.ts
│   │   └── supplier.types.ts
│   ├── utils/
│   │   ├── excelParser.ts
│   │   ├── catalogMatcher.ts
│   │   └── validationSchemas.ts
│   └── stores/
│       ├── procurementContext.tsx
│       └── procurementReducer.ts
```

## Dependencies
### Production Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "react-hook-form": "^7.43.0",
  "react-query": "^4.28.0",
  "zod": "^3.20.0",
  "xlsx": "^0.18.5",
  "papaparse": "^5.4.0",
  "date-fns": "^2.29.0",
  "lucide-react": "^0.263.0"
}
```

### Development Dependencies
```json
{
  "@types/react": "^18.0.0",
  "@types/papaparse": "^5.3.0",
  "@typescript-eslint/eslint-plugin": "^5.57.0",
  "@testing-library/react": "^14.0.0",
  "@playwright/test": "^1.32.0",
  "vitest": "^0.29.0",
  "msw": "^1.2.0"
}
```

## Performance Considerations
### Frontend Optimization
- Code splitting by route and feature
- Lazy loading for large components
- Virtual scrolling for large datasets
- Debounced search and filtering
- Optimistic updates for better UX

### Backend Optimization
- Database indexing strategy for project-scoped queries
- Caching layer for frequently accessed data
- Pagination for large result sets
- Batch operations for bulk imports
- Connection pooling for database efficiency

## Security Architecture
### Frontend Security
- CSP headers for XSS protection
- Input sanitization and validation
- Secure token storage
- HTTPS enforcement

### Backend Security
- RBAC with project-level scoping
- SQL injection prevention via ORM
- Rate limiting on API endpoints
- Audit logging for all operations
- Secrets management via environment variables