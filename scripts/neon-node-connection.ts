/**
 * Node.js compatible Neon connection
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { neonTables } from '../src/lib/neon/schema';

// Get connection string from Node.js environment
const neonUrl = process.env.DATABASE_URL || process.env.VITE_NEON_DATABASE_URL || 
  'postgresql://neondb_owner:npg_CrI6tbA7nexf@ep-wandering-dew-a14qgf25-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Create Neon client  
const sql = neon(neonUrl);

// Create Drizzle instance
export const neonDb = drizzle(sql, { schema: neonTables });

export async function testConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Neon connection successful:', result[0].current_time);
    return true;
  } catch (error) {
    console.error('❌ Neon connection failed:', error);
    return false;
  }
}