// Development mode - authentication bypassed
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // DEV MODE: Full access without authentication
  // Add mock user context for all routes
  const response = NextResponse.next();
  
  // Mock user for development
  response.headers.set('x-user-id', 'dev-user-123');
  response.headers.set('x-user-role', 'admin');
  response.headers.set('x-dev-mode', 'true');
  
  return response;
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};