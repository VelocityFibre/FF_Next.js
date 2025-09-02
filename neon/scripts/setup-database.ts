/**
 * Neon Database Setup Script
 * Creates necessary tables and initial data
 */

import { sql } from '../config/database.config';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

console.log('🚀 Setting up Neon Database...\n');

async function setupDatabase() {
  try {
    // Create clients table
    console.log('Creating clients table...');
    await sql`
      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Clients table created\n');

    // Create projects table
    console.log('Creating projects table...');
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_code VARCHAR(100) UNIQUE NOT NULL,
        project_name VARCHAR(255) NOT NULL,
        client_id UUID REFERENCES clients(id),
        description TEXT,
        project_type VARCHAR(100),
        status VARCHAR(50) DEFAULT 'ACTIVE',
        priority VARCHAR(50) DEFAULT 'MEDIUM',
        start_date DATE,
        end_date DATE,
        budget DECIMAL(15, 2),
        project_manager VARCHAR(255),
        location TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Projects table created\n');

    // Create SOW (Scope of Work) table
    console.log('Creating SOW table...');
    await sql`
      CREATE TABLE IF NOT EXISTS scope_of_work (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        sow_number VARCHAR(100) UNIQUE,
        description TEXT,
        deliverables JSONB,
        milestones JSONB,
        budget_breakdown JSONB,
        timeline JSONB,
        status VARCHAR(50) DEFAULT 'DRAFT',
        approved_by VARCHAR(255),
        approved_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ SOW table created\n');

    // Check if we need to add sample data
    const projectCount = await sql`SELECT COUNT(*) as count FROM projects`;
    
    if (projectCount[0].count === 0) {
      console.log('Adding sample data...');
      
      // Add sample client
      const client = await sql`
        INSERT INTO clients (company_name, contact_person, email, phone, status)
        VALUES ('Sample Company', 'John Doe', 'john@example.com', '555-0100', 'ACTIVE')
        RETURNING id
      `;
      
      // Add sample projects
      await sql`
        INSERT INTO projects (
          project_code, 
          project_name, 
          client_id, 
          description, 
          project_type, 
          status, 
          priority,
          start_date,
          end_date,
          budget,
          project_manager
        ) VALUES 
        (
          'PRJ-001', 
          'Fiber Network Expansion - Phase 1', 
          ${client[0].id},
          'Deploy fiber optic network in downtown area',
          'FIBER_DEPLOYMENT',
          'ACTIVE',
          'HIGH',
          CURRENT_DATE,
          CURRENT_DATE + INTERVAL '90 days',
          250000.00,
          'Sarah Johnson'
        ),
        (
          'PRJ-002', 
          'Rural Connectivity Project', 
          ${client[0].id},
          'Extend fiber network to rural communities',
          'FIBER_DEPLOYMENT',
          'IN_PROGRESS',
          'MEDIUM',
          CURRENT_DATE - INTERVAL '30 days',
          CURRENT_DATE + INTERVAL '120 days',
          500000.00,
          'Mike Chen'
        ),
        (
          'PRJ-003', 
          'Smart City Infrastructure', 
          ${client[0].id},
          'Install smart sensors and IoT connectivity',
          'INFRASTRUCTURE',
          'PLANNING',
          'HIGH',
          CURRENT_DATE + INTERVAL '30 days',
          CURRENT_DATE + INTERVAL '180 days',
          750000.00,
          'Emily Davis'
        )
      `;
      
      console.log('✅ Sample data added\n');
    } else {
      console.log(`ℹ️  Database already contains ${projectCount[0].count} projects\n`);
    }

    console.log('✅ Database setup complete!');
    console.log('\nYou can now:');
    console.log('1. Start the API server: cd neon && npm run dev');
    console.log('2. Test the connection: cd neon && npm run test');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\nMake sure your DATABASE_URL is correctly configured in .env');
    process.exit(1);
  }
}

setupDatabase();