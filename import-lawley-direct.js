const XLSX = require('xlsx');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function importLawleyPoles() {
  console.log('Direct import of Lawley Poles.xlsx...\n');
  
  const sql = neon(process.env.DATABASE_URL);
  const projectId = '7f035b5b-d453-4f81-9279-5461acc76e0f';
  const filePath = '/home/louisdup/Downloads/Lawley Poles.xlsx';
  
  // Read the Excel file
  console.log('Reading file:', filePath);
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  console.log('Total rows:', data.length);
  
  // Create table if not exists
  console.log('\nCreating table if not exists...');
  await sql`
    CREATE TABLE IF NOT EXISTS sow_poles (
      id SERIAL PRIMARY KEY,
      project_id TEXT NOT NULL,
      pole_number TEXT NOT NULL,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      status TEXT,
      pole_type TEXT,
      pole_spec TEXT,
      height TEXT,
      diameter TEXT,
      owner TEXT,
      pon_no INTEGER,
      zone_no INTEGER,
      address TEXT,
      municipality TEXT,
      created_date TIMESTAMP,
      created_by TEXT,
      comments TEXT,
      raw_data JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  // Delete existing poles for this project
  console.log('Clearing existing poles for project...');
  await sql`DELETE FROM sow_poles WHERE project_id = ${projectId}`;
  
  // Import poles
  console.log('Importing poles...');
  let imported = 0;
  const batchSize = 100;
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    for (const row of batch) {
      if (row.label_1) {
        await sql`
          INSERT INTO sow_poles (
            project_id, pole_number, latitude, longitude, status,
            pole_type, pole_spec, height, diameter, owner,
            pon_no, zone_no, address, municipality,
            created_date, created_by, raw_data
          ) VALUES (
            ${projectId},
            ${row.label_1},
            ${row.lat || null},
            ${row.lon || null},
            ${row.status || 'planned'},
            ${row.type_1 || null},
            ${row.spec_1 || null},
            ${row.dim1 || null},
            ${row.dim2 || null},
            ${row.cmpownr || null},
            ${row.pon_no || null},
            ${row.zone_no || null},
            ${row.subplace || null},
            ${row.mun || null},
            ${row.datecrtd || null},
            ${row.crtdby || null},
            ${JSON.stringify(row)}
          )
        `;
        imported++;
      }
    }
    console.log(`  Imported ${imported}/${data.length} poles...`);
  }
  
  console.log(`\n✅ Successfully imported ${imported} poles to project ${projectId}`);
  console.log('View at: http://localhost:3005/projects/' + projectId);
  
  process.exit(0);
}

// Run the import
importLawleyPoles().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});