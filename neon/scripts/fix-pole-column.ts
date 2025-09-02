/**
 * Fix pole_number column size
 */

import { sql } from '../config/database.config.js';

async function fixPoleColumn() {
  console.log('🔧 Fixing pole_number column size...\n');

  try {
    // 1. Drop the unique constraint first (if it exists)
    console.log('1️⃣ Dropping existing constraints...');
    try {
      await sql`
        ALTER TABLE poles 
        DROP CONSTRAINT IF EXISTS poles_pole_number_unique
      `;
      console.log('✅ Dropped unique constraint');
    } catch (e) {
      console.log('No unique constraint to drop');
    }

    // 2. Alter the column to increase size
    console.log('\n2️⃣ Increasing pole_number column size...');
    await sql`
      ALTER TABLE poles 
      ALTER COLUMN pole_number TYPE VARCHAR(100)
    `;
    console.log('✅ Changed pole_number to VARCHAR(100)');

    // 3. Re-add the unique constraint
    console.log('\n3️⃣ Re-adding unique constraint...');
    await sql`
      ALTER TABLE poles 
      ADD CONSTRAINT poles_pole_number_unique UNIQUE (pole_number)
    `;
    console.log('✅ Added unique constraint back');

    // 4. Check current state
    console.log('\n4️⃣ Verifying column structure...');
    const columnInfo = await sql`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'poles' 
      AND column_name = 'pole_number'
    `;
    
    console.log('\nColumn info:');
    console.log(`  Name: ${columnInfo[0].column_name}`);
    console.log(`  Type: ${columnInfo[0].data_type}`);
    console.log(`  Max Length: ${columnInfo[0].character_maximum_length}`);
    console.log(`  Nullable: ${columnInfo[0].is_nullable}`);

    console.log('\n✅ Database schema fixed! You can now re-upload the poles data.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixPoleColumn();