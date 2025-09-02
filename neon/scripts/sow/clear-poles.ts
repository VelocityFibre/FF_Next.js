import { sql } from '../config/database.config.js';

async function clearAndCheck() {
  try {
    // Clear existing poles for the project
    const result = await sql`
      DELETE FROM poles 
      WHERE project_id = '8e49f043-66fd-452c-8371-e571cafcf1c4'
      RETURNING pole_number
    `;
    
    console.log(`Cleared ${result.length} existing poles`);
    
    // Check current count
    const count = await sql`
      SELECT COUNT(*) as count FROM poles
    `;
    
    console.log(`Current total poles in database: ${count[0].count}`);
    console.log('\nDatabase is ready for fresh import!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

clearAndCheck();