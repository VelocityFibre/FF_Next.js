// Canonical Neon database client for server-side usage (Next.js API routes, scripts, legacy server)
// Implements a singleton and basic pooling strategy via neonConfig

import { neon, neonConfig } from '@neondatabase/serverless';

// Pooling / concurrency config (tunable via env)
const DEFAULT_POOL_QUERY_LIMIT = 10; // max concurrent queries per connection pool
const poolQueryLimit = Number(process.env.NEON_POOL_QUERY_LIMIT || DEFAULT_POOL_QUERY_LIMIT);
if (!Number.isNaN(poolQueryLimit) && poolQueryLimit > 0) {
  neonConfig.poolQueryLimit = poolQueryLimit;
}

// Optional: control fetch keepalive for serverless environments
// neonConfig.fetchEndpoint can be customized if using proxies; omitted here for simplicity

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set. Please configure it in your environment.');
  }
  return neon(url);
}

// Ensure single instance across hot reloads in dev
const globalKey = '__FF_NEON_SQL__';

/**
 * Get the shared Neon SQL tagged template function.
 * Usage: const rows = await sql`SELECT 1 as x`;
 */
export function getSql() {
  const g = globalThis;
  if (!g[globalKey]) {
    g[globalKey] = createClient();
  }
  return g[globalKey];
}

// Convenient named export
export const sql = getSql();

/**
 * Run a transaction with BEGIN/COMMIT/ROLLBACK semantics.
 * @param {(sql: ReturnType<typeof getSql>) => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function transaction(fn) {
  const client = getSql();
  try {
    await client`BEGIN`;
    const res = await fn(client);
    await client`COMMIT`;
    return res;
  } catch (err) {
    try { await client`ROLLBACK`; } catch (_) {}
    throw err;
  }
}

export default sql;
