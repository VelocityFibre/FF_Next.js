import { sql } from '../../config/database.config.js';

async function checkConstraints() {
  const columns = await sql`
    SELECT 
      column_name,
      data_type,
      character_maximum_length
    FROM information_schema.columns 
    WHERE table_name = 'poles'
    ORDER BY ordinal_position
  `;
  
  console.log('Poles table columns:');
  columns.forEach(col => {
    if (col.character_maximum_length) {
      console.log(`  ${col.column_name}: ${col.data_type}(${col.character_maximum_length})`);
    } else {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    }
  });
  
  // Check for any columns that might be too small
  const smallColumns = columns.filter(col => 
    col.character_maximum_length && col.character_maximum_length <= 50
  );
  
  if (smallColumns.length > 0) {
    console.log('\n⚠️  Columns with small size limits:');
    smallColumns.forEach(col => {
      console.log(`  ${col.column_name}: VARCHAR(${col.character_maximum_length})`);
    });
  }
}

checkConstraints();