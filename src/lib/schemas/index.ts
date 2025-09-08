/**
 * Centralized Zod Schemas for API Validation
 * 
 * This is the main entry point for all Zod schemas used throughout the application.
 * All API routes should import their schemas from this file.
 * 
 * @example
 * ```typescript
 * import { 
 *   ProjectSchema, 
 *   CreateProjectSchema, 
 *   validateBody,
 *   ApiSuccessResponseSchema 
 * } from '@/lib/schemas';
 * 
 * export async function POST(request: NextRequest) {
 *   const body = await validateBody(request, CreateProjectSchema);
 *   if (body instanceof NextResponse) return body;
 *   
 *   // Process validated data...
 *   const project = await createProject(body);
 *   
 *   return NextResponse.json(
 *     ApiSuccessResponseSchema(ProjectSchema).parse({
 *       success: true,
 *       data: project,
 *       message: 'Project created successfully'
 *     })
 *   );
 * }
 * ```
 */

// Export all common schemas
export * from './common';

// Export all domain schemas
export * from './domains';

// Export validation utilities
export * from './utils/validation';

// Re-export Zod for convenience
export { z } from 'zod';
export type { ZodError, ZodSchema } from 'zod';