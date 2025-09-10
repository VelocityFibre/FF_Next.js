#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');

// Database connection
const sql = neon('postgresql://neondb_owner:npg_aRNLhZc1G2CD@ep-dry-night-a9qyh4sj-pooler.gwc.azure.neon.tech/neondb?sslmode=require');

async function checkAndSeed() {
    console.log('🔍 Checking database structure...\n');
    
    try {
        // Check users table structure
        const userColumns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            ORDER BY ordinal_position
        `;
        
        console.log('Users table columns:');
        userColumns.forEach(col => console.log(`  - ${col.column_name} (${col.data_type})`));
        
        // Check if we already have data
        const existingUsers = await sql`SELECT COUNT(*) as count FROM users`;
        console.log(`\n📊 Existing users: ${existingUsers[0].count}`);
        
        if (existingUsers[0].count > 0) {
            console.log('✅ Database already contains users');
            
            // Show existing data
            const users = await sql`SELECT id, email, name FROM users LIMIT 5`;
            console.log('\nSample users:');
            users.forEach(u => console.log(`  - ${u.email || u.name || u.id}`));
        } else {
            console.log('\n🌱 Inserting seed data for existing schema...');
            
            // Adapt to existing schema - users table likely has different columns
            // Let's insert based on what columns exist
            const hasEmail = userColumns.some(c => c.column_name === 'email');
            const hasName = userColumns.some(c => c.column_name === 'name');
            const hasRole = userColumns.some(c => c.column_name === 'role');
            
            if (hasEmail) {
                // Insert users with available columns
                const users = await sql`
                    INSERT INTO users (email, name, role)
                    VALUES 
                        ('admin@fibreflow.com', 'Admin User', ${hasRole ? 'admin' : null}),
                        ('manager@fibreflow.com', 'Project Manager', ${hasRole ? 'manager' : null}),
                        ('tech@fibreflow.com', 'Field Technician', ${hasRole ? 'technician' : null})
                    RETURNING id
                `;
                console.log(`✅ Created ${users.length} users`);
            }
        }
        
        // Check other tables
        const tables = ['clients', 'projects', 'staff', 'contractors', 'suppliers', 'poles', 'tasks'];
        
        console.log('\n📊 Table record counts:');
        for (const table of tables) {
            try {
                const result = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`;
                console.log(`  - ${table}: ${result[0].count} records`);
            } catch (e) {
                // Table might not exist
            }
        }
        
        // Check if we need to add sample projects
        const projectCount = await sql`SELECT COUNT(*) as count FROM projects`;
        if (projectCount[0].count === 0) {
            console.log('\n🌱 Adding sample projects...');
            
            // Get a user ID for the created_by field
            const users = await sql`SELECT id FROM users LIMIT 1`;
            const userId = users[0]?.id;
            
            if (userId) {
                // Check if projects table has client_id column
                const projectColumns = await sql`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'projects'
                `;
                
                const hasClientId = projectColumns.some(c => c.column_name === 'client_id');
                
                // Insert projects (adapt based on schema)
                const projects = await sql`
                    INSERT INTO projects (name, description, status, created_by, start_date, end_date)
                    VALUES
                        ('Centurion Fiber Rollout', 'Fiber deployment in Centurion', 'active', ${userId}, '2025-02-01', '2025-08-31'),
                        ('Midrand Business Park', 'Business park connectivity', 'planning', ${userId}, '2025-03-01', '2025-09-30')
                    RETURNING id, name
                `;
                console.log(`✅ Created ${projects.length} projects`);
            }
        }
        
        console.log('\n✅ Database check complete!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the check
checkAndSeed().catch(console.error);