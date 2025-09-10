// Unified DB access: re-export server-only Neon client from the canonical module
// IMPORTANT: Do not use this from browser/client components. Access DB only in server code or API routes.

export { sql, transaction } from '../../lib/db/pool.js';