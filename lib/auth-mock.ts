/**
 * Mock authentication for local demo
 * Bypasses Clerk authentication for development
 */

export function getAuth(req: any) {
  // Mock user for demo
  return {
    userId: 'demo-user-123',
    sessionId: 'demo-session',
    user: {
      id: 'demo-user-123',
      email: 'demo@fibreflow.com',
      name: 'Demo User',
      role: 'admin'
    }
  };
}

export function requireAuth(handler: any) {
  return async (req: any, res: any) => {
    // Always pass through for demo
    const auth = getAuth(req);
    req.auth = auth;
    return handler(req, res);
  };
}