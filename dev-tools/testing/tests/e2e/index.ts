/**
 * E2E Test Suites - Entry Point
 * Organizes end-to-end test modules for the application
 */

/**
 * E2E Test Suites Overview:
 * 
 * 1. Project Creation Form Tests (project-create-form.spec.ts)
 *    - Form field validation
 *    - Required field checking
 *    - Client selection handling
 *    - Form data persistence during navigation
 *    - Location data input validation
 * 
 * 2. Project Edit Form Tests (project-edit-form.spec.ts)
 *    - Project data loading in edit form
 *    - Form changes saving functionality
 *    - Field consistency between create/edit forms
 *    - Data preservation validation
 * 
 * 3. Project Workflow Tests (project-workflow.spec.ts)
 *    - Complete project creation workflow
 *    - Multi-step form navigation
 *    - End-to-end data validation
 *    - Project list verification
 * 
 * 4. Legacy Comprehensive Test (project-create-and-verify.spec.ts)
 *    - Original comprehensive field verification test
 *    - Cross-form consistency analysis
 *    - Data preservation checking
 *    - Field mapping validation
 * 
 * Usage:
 * Run specific test suites:
 *   npx playwright test project-create-form.spec.ts
 *   npx playwright test project-edit-form.spec.ts
 *   npx playwright test project-workflow.spec.ts
 * 
 * Run all project-related E2E tests:
 *   npx playwright test tests/e2e/project-*.spec.ts
 * 
 * Test Organization:
 * - Each test file focuses on specific functionality
 * - Tests are under 300 lines for maintainability
 * - Shared utilities can be added to a helpers/ directory
 * - All tests maintain consistent logging and reporting
 */

// Re-export any shared test utilities here if needed
// export * from './helpers/testHelpers';

// Test file imports for documentation (optional)
// These imports ensure TypeScript recognizes the test files
// but don't execute them (Playwright handles execution)

/*
import './project-create-form.spec';
import './project-edit-form.spec';
import './project-workflow.spec';
import './project-create-and-verify.spec'; // Legacy comprehensive test
*/