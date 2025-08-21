/**
 * Create Neon Database Tables
 * Creates the analytical schema for the hybrid architecture
 */

import { neon } from '@neondatabase/serverless';

const CONNECTION_STRING = 'postgresql://neondb_owner:npg_Jq8OGXiWcYK0@ep-wandering-dew-a14qgf25-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function createTables() {
  console.log('🚀 Creating Neon database tables...');
  
  try {
    const sql = neon(CONNECTION_STRING);
    
    // Project Analytics Table
    console.log('📊 Creating project_analytics table...');
    await sql`
      CREATE TABLE IF NOT EXISTS project_analytics (
        id SERIAL PRIMARY KEY,
        project_id VARCHAR(255) NOT NULL,
        project_name TEXT NOT NULL,
        client_id VARCHAR(255),
        client_name TEXT,
        total_poles INTEGER DEFAULT 0,
        completed_poles INTEGER DEFAULT 0,
        total_drops INTEGER DEFAULT 0,
        completed_drops INTEGER DEFAULT 0,
        total_budget DECIMAL(15,2),
        spent_budget DECIMAL(15,2),
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        actual_end_date TIMESTAMP,
        completion_percentage DECIMAL(5,2),
        on_time_delivery BOOLEAN,
        quality_score DECIMAL(5,2),
        last_synced_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_project_analytics_project_id ON project_analytics(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_project_analytics_client_id ON project_analytics(client_id)`;

    // KPI Metrics Table
    console.log('📈 Creating kpi_metrics table...');
    await sql`
      CREATE TABLE IF NOT EXISTS kpi_metrics (
        id SERIAL PRIMARY KEY,
        project_id VARCHAR(255),
        metric_type VARCHAR(100) NOT NULL,
        metric_name TEXT NOT NULL,
        metric_value DECIMAL(15,4) NOT NULL,
        unit VARCHAR(50),
        team_id VARCHAR(255),
        contractor_id VARCHAR(255),
        recorded_date TIMESTAMP NOT NULL,
        week_number INTEGER,
        month_number INTEGER,
        year INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_kpi_metrics_project_metric ON kpi_metrics(project_id, metric_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_kpi_metrics_date ON kpi_metrics(recorded_date)`;

    // Financial Transactions Table
    console.log('💰 Creating financial_transactions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS financial_transactions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        transaction_type VARCHAR(50) NOT NULL,
        project_id VARCHAR(255),
        client_id VARCHAR(255),
        supplier_id VARCHAR(255),
        amount DECIMAL(15,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'ZAR',
        status VARCHAR(50) NOT NULL,
        invoice_number VARCHAR(100),
        po_number VARCHAR(100),
        transaction_date TIMESTAMP NOT NULL,
        due_date TIMESTAMP,
        paid_date TIMESTAMP,
        notes TEXT,
        attachments JSON,
        created_by VARCHAR(255),
        approved_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_financial_transactions_project ON financial_transactions(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_financial_transactions_client ON financial_transactions(client_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON financial_transactions(status)`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_transactions_invoice ON financial_transactions(invoice_number) WHERE invoice_number IS NOT NULL`;

    // Material Usage Table
    console.log('🔧 Creating material_usage table...');
    await sql`
      CREATE TABLE IF NOT EXISTS material_usage (
        id SERIAL PRIMARY KEY,
        project_id VARCHAR(255) NOT NULL,
        material_id VARCHAR(255) NOT NULL,
        material_name TEXT NOT NULL,
        category VARCHAR(100),
        planned_quantity DECIMAL(15,4),
        used_quantity DECIMAL(15,4) NOT NULL,
        wasted_quantity DECIMAL(15,4),
        unit VARCHAR(50),
        unit_cost DECIMAL(15,2),
        total_cost DECIMAL(15,2),
        pole_number VARCHAR(100),
        section_id VARCHAR(255),
        usage_date TIMESTAMP NOT NULL,
        recorded_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_material_usage_project_material ON material_usage(project_id, material_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_material_usage_date ON material_usage(usage_date)`;

    // Staff Performance Table
    console.log('👥 Creating staff_performance table...');
    await sql`
      CREATE TABLE IF NOT EXISTS staff_performance (
        id SERIAL PRIMARY KEY,
        staff_id VARCHAR(255) NOT NULL,
        staff_name TEXT NOT NULL,
        role VARCHAR(100),
        tasks_completed INTEGER DEFAULT 0,
        hours_worked DECIMAL(10,2),
        productivity_score DECIMAL(5,2),
        quality_score DECIMAL(5,2),
        attendance_rate DECIMAL(5,2),
        project_id VARCHAR(255),
        team_id VARCHAR(255),
        period_start TIMESTAMP NOT NULL,
        period_end TIMESTAMP NOT NULL,
        period_type VARCHAR(50),
        overtime_hours DECIMAL(10,2),
        incident_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_staff_performance_staff_period ON staff_performance(staff_id, period_start)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_staff_performance_project_staff ON staff_performance(project_id, staff_id)`;

    // Report Cache Table
    console.log('📋 Creating report_cache table...');
    await sql`
      CREATE TABLE IF NOT EXISTS report_cache (
        id SERIAL PRIMARY KEY,
        report_type VARCHAR(100) NOT NULL,
        report_name TEXT NOT NULL,
        filters JSON,
        project_id VARCHAR(255),
        date_from TIMESTAMP,
        date_to TIMESTAMP,
        report_data JSON NOT NULL,
        chart_data JSON,
        summary JSON,
        generated_by VARCHAR(255),
        generated_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        access_count INTEGER DEFAULT 0,
        generation_time_ms INTEGER,
        data_size_bytes INTEGER
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_report_cache_type ON report_cache(report_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_report_cache_expiry ON report_cache(expires_at)`;

    // Audit Log Table
    console.log('🔍 Creating audit_log table...');
    await sql`
      CREATE TABLE IF NOT EXISTS audit_log (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        user_name TEXT,
        user_role VARCHAR(100),
        ip_address VARCHAR(45),
        user_agent TEXT,
        old_value JSON,
        new_value JSON,
        changes_summary TEXT,
        timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
        session_id VARCHAR(255),
        source VARCHAR(50)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp)`;

    // Client Analytics Table
    console.log('🏢 Creating client_analytics table...');
    await sql`
      CREATE TABLE IF NOT EXISTS client_analytics (
        id SERIAL PRIMARY KEY,
        client_id VARCHAR(255) NOT NULL UNIQUE,
        client_name TEXT NOT NULL,
        total_projects INTEGER DEFAULT 0,
        active_projects INTEGER DEFAULT 0,
        completed_projects INTEGER DEFAULT 0,
        total_revenue DECIMAL(15,2),
        outstanding_balance DECIMAL(15,2),
        average_project_value DECIMAL(15,2),
        payment_score DECIMAL(5,2),
        average_project_duration INTEGER,
        on_time_completion_rate DECIMAL(5,2),
        satisfaction_score DECIMAL(5,2),
        last_project_date TIMESTAMP,
        next_follow_up_date TIMESTAMP,
        total_interactions INTEGER DEFAULT 0,
        client_category VARCHAR(50),
        lifetime_value DECIMAL(15,2),
        last_calculated_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_client_analytics_id ON client_analytics(client_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_client_analytics_category ON client_analytics(client_category)`;

    console.log('✅ All tables created successfully!');
    
    // Verify tables were created
    console.log('\n🔍 Verifying table creation...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('📊 Created tables:');
    tables.forEach((table: any) => {
      console.log(`  ✓ ${table.table_name}`);
    });
    
    console.log('\n🎉 Neon database schema setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Run Firebase sync to populate initial data');
    console.log('2. Test analytics dashboard');
    console.log('3. Configure scheduled sync jobs');
    
  } catch (error) {
    console.error('❌ Table creation failed:', error);
    process.exit(1);
  }
}

createTables();