import { sql } from '../config/database.config.js';

async function fixNullProjects() {
  console.log('🔍 Checking projects table structure and data...\n');
  
  try {
    // First check table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'projects'
      ORDER BY ordinal_position
    `;
    
    console.log('Projects table columns:');
    columns.forEach(c => {
      console.log(`  ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable})`);
    });
    
    // Check if project_name column exists
    const hasProjectName = columns.some(c => c.column_name === 'project_name');
    const hasName = columns.some(c => c.column_name === 'name');
    
    const nameColumn = hasProjectName ? 'project_name' : hasName ? 'name' : null;
    
    if (!nameColumn) {
      console.log('\n⚠️  No name column found in projects table');
      console.log('Adding project_name column...');
      
      await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_name VARCHAR(255)`;
      console.log('✅ Added project_name column');
      
      // Set default names for existing projects
      const result = await sql`
        UPDATE projects 
        SET project_name = 'Lawley Project'
        WHERE project_name IS NULL
        RETURNING id, project_name
      `;
      
      console.log(`✅ Updated ${result.length} projects with default name`);
    } else {
      // Get all projects using the correct column
      const projects = await sql`SELECT id, ${sql.unsafe(nameColumn)} as name, status FROM projects`;
      console.log(`\nTotal projects: ${projects.length}`);
      
      projects.forEach(p => {
        console.log(`- ${p.id}: name='${p.name}' status='${p.status}'`);
      });
      
      // Check for null names
      const nullNameProjects = await sql`SELECT id FROM projects WHERE ${sql.unsafe(nameColumn)} IS NULL`;
      console.log(`\nProjects with NULL ${nameColumn}: ${nullNameProjects.length}`);
      
      if (nullNameProjects.length > 0) {
        console.log(`📝 Fixing NULL ${nameColumn}s...`);
        const result = await sql`
          UPDATE projects 
          SET ${sql.unsafe(nameColumn)} = 'Unnamed Project ' || SUBSTRING(id::text, 1, 8)
          WHERE ${sql.unsafe(nameColumn)} IS NULL
          RETURNING id, ${sql.unsafe(nameColumn)} as name
        `;
        
        console.log('✅ Fixed projects:');
        result.forEach(p => {
          console.log(`   - ${p.id}: ${p.name}`);
        });
      } else {
        console.log(`✅ No NULL ${nameColumn}s found!`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixNullProjects();