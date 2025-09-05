/**
 * Mock Clerk functions for pages (client-side)
 * Provides development authentication bypass
 */

export function getAuth(req: any) {
  return {
    userId: 'demo-user-123',
    sessionId: 'demo-session'
  };
}

// Mock getServerSideProps helper
export function withAuth(gssp: any) {
  return async (ctx: any) => {
    // Always pass authentication in demo mode
    return gssp(ctx);
  };
}

// Remove authentication requirement
export const getServerSideProps = async () => {
  return { props: {} };
};