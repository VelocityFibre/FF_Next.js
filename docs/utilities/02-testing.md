# Section 5.2: Testing Infrastructure

## Overview

The FF_React codebase implements a comprehensive testing strategy using modern testing frameworks and tools. The testing infrastructure supports unit tests, integration tests, end-to-end tests, and API testing with full coverage reporting and CI/CD integration.

## Testing Framework Stack

### Core Testing Tools

#### Vitest (Unit & Integration Testing)
- **Primary Framework**: Vitest 0.34.0 with React plugin support
- **Environment**: jsdom for DOM simulation
- **Global**: Access to `describe`, `it`, `expect` without imports
- **Configuration**: `/home/louisdup/VF/Apps/FF_React/vitest.config.ts`

#### Playwright (E2E Testing)
- **Framework**: Playwright 1.55.0 for end-to-end testing
- **Configuration**: `/home/louisdup/VF/Apps/FF_React/playwright.config.ts`
- **Test Directory**: `tests/e2e/` and `src/modules/*/__tests__/e2e/`
- **Multi-browser**: Chromium, Firefox, WebKit support
- **Mobile Testing**: Pixel 5, iPhone 12, iPad Pro viewports

#### Testing Library
- **React Testing**: @testing-library/react 13.4.0
- **User Events**: @testing-library/user-event 14.4.0
- **Jest DOM**: @testing-library/jest-dom 6.1.0 for custom matchers
- **Accessibility**: jest-axe 10.0.0 for a11y testing

## Configuration Details

### Vitest Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.ts',
        'dist/',
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/pages': resolve(__dirname, 'src/pages'),
      '@/hooks': resolve(__dirname, 'src/hooks'),
      '@/services': resolve(__dirname, 'src/services'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/styles': resolve(__dirname, 'src/styles'),
      '@/assets': resolve(__dirname, 'src/assets'),
    },
  },
});
```

### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './dev-tools/testing/tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'dev-tools/testing/test-results/results.json' }],
    ['junit', { outputFile: 'dev-tools/testing/test-results/results.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
    { name: 'Tablet', use: { ...devices['iPad Pro'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

## Test Structure and Organization

### Directory Structure

```
src/
├── test/
│   └── setup.ts                    # Global test setup
├── tests/
│   ├── api-integration/           # API integration tests
│   │   ├── api-health.test.ts
│   │   ├── clients.test.ts
│   │   ├── staff.test.ts
│   │   ├── projects.test.ts
│   │   └── sow.test.ts
│   └── no-direct-db-connections.test.ts
├── components/
│   └── **/*.test.tsx              # Component tests
├── services/
│   └── **/__tests__/              # Service tests
│   └── **/*.test.ts
├── utils/
│   └── __tests__/                 # Utility tests
├── modules/
│   └── */__tests__/               # Module-specific tests
│       ├── components/            # Component tests
│       ├── services/              # Service tests
│       ├── __mocks__/             # Mock data
│       └── e2e/                   # End-to-end tests
└── tests/
    └── e2e/
        └── example.spec.ts         # Root E2E tests
```

### Test Categories

#### 1. Unit Tests
- **Location**: Co-located with source files (`*.test.ts`, `*.test.tsx`)
- **Purpose**: Test individual functions, components, and services in isolation
- **Examples**:
  - `/home/louisdup/VF/Apps/FF_React/src/utils/__tests__/dateHelpers.test.ts`
  - `/home/louisdup/VF/Apps/FF_React/src/components/contractor/ContractorImport.test.tsx`

#### 2. Integration Tests  
- **Location**: `src/tests/api-integration/`
- **Purpose**: Test API endpoints and service interactions
- **Examples**:
  - API health checks
  - Database connection tests
  - Service integration validation

#### 3. End-to-End Tests
- **Location**: `tests/e2e/` and `src/modules/*/tests/e2e/`
- **Purpose**: Test complete user workflows
- **Examples**:
  - Authentication flows
  - Workflow drag-and-drop functionality
  - Navigation and page loads

#### 4. Performance Tests
- **Location**: `src/services/*/tests/performance/`
- **Purpose**: Benchmark response times and resource usage
- **Examples**:
  - Response time validation
  - Memory management tests
  - Concurrency testing

## Testing Utilities and Helpers

### Global Test Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock browser APIs
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})
```

### Mock Data and Fixtures

#### Workflow Mocks
- **Location**: `/home/louisdup/VF/Apps/FF_React/src/modules/workflow/__tests__/__mocks__/workflow.mocks.ts`
- **Purpose**: Comprehensive mock data for workflow system testing
- **Content**:
  - Staff members
  - Projects
  - Workflow templates
  - Workflow phases, steps, and tasks
  - Execution logs and analytics

#### Service Mocks
- **Authentication mocks**: For testing RBAC and permissions
- **API response mocks**: Standardized API response formats
- **Database mocks**: For testing database interactions

### Testing Patterns and Best Practices

#### 1. Component Testing Pattern

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkflowEditor } from '../../components/editor/WorkflowEditor';

describe('WorkflowEditor Component', () => {
  const renderWithProvider = (templateId?: string) => {
    return render(
      <WorkflowEditorProvider>
        <WorkflowEditor templateId={templateId} />
      </WorkflowEditorProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup service mocks
  });

  describe('Initial Rendering', () => {
    it('should render loading state initially', () => {
      renderWithProvider();
      expect(screen.getByText('New Workflow Template')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle zoom in action', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithProvider('template-1');
      
      const zoomInButton = screen.getByTitle('Zoom In');
      await user.click(zoomInButton);
      // Assert expected behavior
    });
  });
});
```

#### 2. Service Testing Pattern

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { procurementApiService } from '../procurementApiService';
import { 
  createMockContext, 
  mockSuccessfulAuth, 
  setupTestEnvironment,
  cleanupTestEnvironment
} from './helpers/testHelpers';

describe('ProcurementApiService', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('Authentication Validation', () => {
    it('should validate user context and permissions', async () => {
      const context = createMockContext();
      
      await procurementApiService.getBOQs(context);

      expect(projectAccessMiddleware.checkProjectAccess).toHaveBeenCalledWith(
        context.userId,
        context.projectId
      );
    });
  });
});
```

#### 3. Integration Testing Pattern

```typescript
import { describe, test, expect, beforeAll } from 'vitest';
import axios, { AxiosInstance } from 'axios';

describe('API Health & Integration Tests', () => {
  let api: AxiosInstance;
  const baseURL = process.env.VITE_API_URL || 'http://localhost:3000/api';

  beforeAll(() => {
    api = axios.create({
      baseURL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
  });

  describe('API Infrastructure', () => {
    test('API base endpoint is reachable', async () => {
      try {
        const response = await api.get('/health');
        expect(response.status).toBe(200);
      } catch (error) {
        const response = await api.get('/');
        expect(response.status).toBeLessThan(500);
      }
    });
  });
});
```

#### 4. E2E Testing Pattern

```typescript
import { test, expect } from '@playwright/test';

test.describe('FibreFlow Application', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FibreFlow/);
  });

  test('should navigate to main sections', async ({ page }) => {
    await page.goto('/');
    
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });
});

test.describe('Authentication @smoke', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1, h2').first()).toContainText(/Sign|Login/i);
  });
});
```

## Coverage Requirements

### Coverage Thresholds
- **Branches**: 90% minimum
- **Functions**: 90% minimum  
- **Lines**: 90% minimum
- **Statements**: 90% minimum

### Coverage Exclusions
- Node modules
- Test files themselves
- TypeScript declaration files
- Configuration files
- Distribution/build files

### Coverage Reporting
- **Formats**: Text, JSON, HTML
- **Provider**: V8 (built into Node.js)
- **Output**: Detailed coverage reports with line-by-line analysis

## Running Tests

### Development Commands

```bash
# Unit and integration tests
npm test                    # Run all tests in watch mode
npm run test:coverage       # Run with coverage report
npm run test:ui            # Run with Vitest UI

# End-to-end tests
npm run test:e2e           # Run all E2E tests
npm run test:e2e:ui        # Run with Playwright UI
npm run test:e2e:debug     # Run in debug mode
npm run test:e2e:smoke     # Run smoke tests only
npm run test:e2e:visual    # Run visual regression tests
npm run test:e2e:mobile    # Run mobile-specific tests

# Integration tests
npm run test:integration            # Run API integration tests
npm run test:no-direct-db          # Validate no direct DB connections

# Database tests
npm run db:test            # Run database connectivity tests
npm run db:test:suite      # Run comprehensive database test suite
npm run db:test:schema     # Run schema validation tests
```

### CI/CD Integration

#### Test Execution Strategy
- **Parallel Execution**: Full parallelization in CI environments
- **Retry Logic**: 2 retries for E2E tests in CI
- **Worker Optimization**: Single worker in CI to prevent resource conflicts

#### Test Reporting
- **HTML Reports**: Visual test results with screenshots
- **JSON Reports**: Machine-readable test results
- **JUnit Reports**: CI/CD integration format

## Test Data Management

### Mock Data Strategy
- **Realistic Data**: Mock data mirrors production data structures
- **Comprehensive Coverage**: Covers all major use cases and edge cases
- **Type Safety**: Full TypeScript support for all mock data
- **Isolated Tests**: Each test uses fresh mock data to prevent interference

### Database Testing
- **No Direct DB**: Tests validate that frontend doesn't directly access database
- **API-Only**: All data access goes through API layer
- **Connection Health**: Regular validation of API connectivity
- **Schema Validation**: Ensures data structures match expectations

## Accessibility Testing

### Tools and Setup
- **jest-axe**: Automated accessibility testing
- **Integration**: Built into component tests
- **Coverage**: WCAG compliance validation

### Testing Approach
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Performance Testing

### Benchmarking
- **Response Time**: API endpoint performance validation
- **Memory Management**: Resource usage monitoring
- **Concurrency**: Multi-user scenario testing
- **Load Testing**: Stress testing under high load

### Monitoring
- **Thresholds**: Performance benchmarks with failure thresholds
- **Regression Detection**: Automated performance regression testing
- **Resource Tracking**: Memory, CPU, and network usage monitoring

## Security Testing

### Authentication Testing
- **RBAC Validation**: Role-based access control testing
- **Permission Checks**: Granular permission validation
- **Session Management**: Session security and timeout testing
- **Audit Logging**: Security event logging validation

### Data Protection
- **Input Validation**: XSS and injection prevention testing
- **Data Sanitization**: Output encoding validation
- **CORS Configuration**: Cross-origin request security testing

## Continuous Integration

### Automated Testing Pipeline
1. **Linting and Type Checking**: Code quality validation
2. **Unit Tests**: Fast feedback on component and service functionality
3. **Integration Tests**: API and service interaction validation
4. **E2E Tests**: Critical user journey validation
5. **Performance Tests**: Performance regression detection
6. **Security Tests**: Vulnerability scanning and security validation

### Quality Gates
- **Coverage Thresholds**: Minimum coverage requirements
- **Performance Budgets**: Maximum response time limits
- **Security Scans**: Zero critical security vulnerabilities
- **Accessibility Compliance**: WCAG conformance validation

## Migration Considerations

### Next.js Compatibility
- **Test Configuration**: Vitest and Playwright work seamlessly with Next.js
- **API Route Testing**: Support for Next.js API routes in integration tests
- **SSR Testing**: Server-side rendering compatibility

### Clerk Integration
- **Authentication Mocks**: Mock Clerk authentication for testing
- **User Session Testing**: Validate user session management
- **Protected Route Testing**: Test authentication-protected routes

### Neon Database Testing
- **Real Data Testing**: Tests use real Neon database connections through API
- **Connection Validation**: Regular database connectivity health checks
- **Schema Compatibility**: Validate frontend expectations match database schema

## Best Practices Summary

### Test Writing Guidelines
1. **Descriptive Names**: Clear, descriptive test names that explain intent
2. **AAA Pattern**: Arrange, Act, Assert structure
3. **Single Responsibility**: Each test validates one specific behavior
4. **Realistic Scenarios**: Tests mirror real-world usage patterns
5. **Error Handling**: Test both success and failure scenarios

### Maintenance
1. **Regular Updates**: Keep test dependencies and frameworks current
2. **Mock Maintenance**: Update mocks when APIs change
3. **Performance Monitoring**: Regular performance benchmark updates
4. **Coverage Analysis**: Regular coverage gap analysis and improvement

### Team Practices
1. **Test-First Development**: Write tests before implementation where appropriate
2. **Code Review**: Include test quality in code review process
3. **Documentation**: Keep test documentation current and comprehensive
4. **Knowledge Sharing**: Regular team knowledge sharing on testing practices

This comprehensive testing infrastructure ensures high code quality, reliable deployments, and confident refactoring while supporting the migration from React/Vite to Next.js with modern authentication and database integration.