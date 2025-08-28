import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set in the environment variables');
  process.exit(1);
}

console.log('Testing connection to Neon database...');
console.log('Connection URL:', databaseUrl.replace(/:[^:@]+@/, ':***@')); // Hide password

const sql = neon(databaseUrl);

async function testConnection() {
  try {
    // Test basic connection
    const result = await sql`SELECT version()`;
    console.log('✅ Database connected successfully!');
    console.log('PostgreSQL version:', result[0].version);

    // List all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('\n📊 Tables in database:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    // Count records in key tables
    const tableCounts = await Promise.all([
      sql`SELECT COUNT(*) as count FROM clients`,
      sql`SELECT COUNT(*) as count FROM projects`,
      sql`SELECT COUNT(*) as count FROM staff`,
      sql`SELECT COUNT(*) as count FROM users`,
    ]);

    console.log('\n📈 Record counts:');
    console.log(`  - Clients: ${tableCounts[0][0].count}`);
    console.log(`  - Projects: ${tableCounts[1][0].count}`);
    console.log(`  - Staff: ${tableCounts[2][0].count}`);
    console.log(`  - Users: ${tableCounts[3][0].count}`);

    console.log('\n✅ Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();