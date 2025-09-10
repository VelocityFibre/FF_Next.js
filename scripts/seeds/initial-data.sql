-- =====================================================
-- INITIAL SEED DATA FOR FIBREFLOW DATABASE
-- =====================================================
-- This script populates the database with initial test data
-- Run after the main migration script
-- =====================================================

-- Set variables for consistent IDs
DO $$
DECLARE
    admin_user_id UUID := uuid_generate_v4();
    manager_user_id UUID := uuid_generate_v4();
    tech_user_id UUID := uuid_generate_v4();
    client1_id UUID := uuid_generate_v4();
    client2_id UUID := uuid_generate_v4();
    project1_id UUID := uuid_generate_v4();
    project2_id UUID := uuid_generate_v4();
    contractor1_id UUID := uuid_generate_v4();
    contractor2_id UUID := uuid_generate_v4();
    supplier1_id UUID := uuid_generate_v4();
    supplier2_id UUID := uuid_generate_v4();
    supplier3_id UUID := uuid_generate_v4();
BEGIN
    -- Store IDs in temp table for reference
    CREATE TEMP TABLE seed_ids (
        entity_type VARCHAR(50),
        entity_name VARCHAR(100),
        entity_id UUID
    );
    
    -- =====================================================
    -- USERS
    -- =====================================================
    INSERT INTO users (id, clerk_id, email, first_name, last_name, display_name, role, permissions, is_active)
    VALUES 
        (admin_user_id, 'clerk_admin_001', 'admin@fibreflow.com', 'Admin', 'User', 'Admin User', 'admin', 
         '["all"]'::jsonb, true),
        (manager_user_id, 'clerk_manager_001', 'manager@fibreflow.com', 'Project', 'Manager', 'Project Manager', 'manager',
         '["projects.manage", "tasks.manage", "staff.view"]'::jsonb, true),
        (tech_user_id, 'clerk_tech_001', 'technician@fibreflow.com', 'Field', 'Technician', 'Field Tech', 'technician',
         '["tasks.view", "tasks.update"]'::jsonb, true);
    
    INSERT INTO seed_ids VALUES 
        ('user', 'admin', admin_user_id),
        ('user', 'manager', manager_user_id),
        ('user', 'technician', tech_user_id);
    
    -- =====================================================
    -- CLIENTS
    -- =====================================================
    INSERT INTO clients (id, name, code, contact_person, email, phone, address, city, country, status, created_by)
    VALUES
        (client1_id, 'Telkom SA', 'TEL001', 'John Smith', 'john.smith@telkom.co.za', '+27 11 311 1000',
         '61 Oak Avenue, Centurion', 'Centurion', 'South Africa', 'active', admin_user_id),
        (client2_id, 'Vodacom Group', 'VOD001', 'Sarah Johnson', 'sarah.j@vodacom.co.za', '+27 11 653 5000',
         'Vodacom Corporate Park, Midrand', 'Midrand', 'South Africa', 'active', admin_user_id);
    
    INSERT INTO seed_ids VALUES 
        ('client', 'Telkom SA', client1_id),
        ('client', 'Vodacom Group', client2_id);
    
    -- =====================================================
    -- PROJECTS
    -- =====================================================
    INSERT INTO projects (id, name, code, description, client_id, project_manager_id, start_date, end_date, 
                         budget, status, priority, type, created_by)
    VALUES
        (project1_id, 'Centurion Fiber Rollout Phase 1', 'CFR-001', 
         'Fiber optic network deployment in Centurion residential areas', 
         client1_id, manager_user_id, '2025-02-01', '2025-08-31', 
         2500000.00, 'active', 'high', 'fiber_deployment', admin_user_id),
        
        (project2_id, 'Midrand Business Park Connectivity', 'MBC-001',
         'High-speed fiber connectivity for Midrand Business Park',
         client2_id, manager_user_id, '2025-03-01', '2025-09-30',
         1800000.00, 'planning', 'medium', 'fiber_deployment', admin_user_id);
    
    INSERT INTO seed_ids VALUES 
        ('project', 'Centurion Fiber Rollout', project1_id),
        ('project', 'Midrand Business Park', project2_id);
    
    -- =====================================================
    -- STAFF
    -- =====================================================
    INSERT INTO staff (employee_id, first_name, last_name, email, phone, department, position, role, 
                      hire_date, availability_status, hourly_rate, user_id, is_active)
    VALUES
        ('EMP001', 'David', 'Williams', 'david.w@fibreflow.com', '+27 82 111 2222', 
         'Engineering', 'Senior Engineer', 'engineer', '2023-01-15', 'available', 85.00, null, true),
        
        ('EMP002', 'Mike', 'Brown', 'mike.b@fibreflow.com', '+27 82 333 4444',
         'Field Operations', 'Field Supervisor', 'supervisor', '2023-03-20', 'available', 75.00, null, true),
        
        ('EMP003', 'Lisa', 'Davis', 'lisa.d@fibreflow.com', '+27 82 555 6666',
         'Field Operations', 'Field Technician', 'technician', '2023-06-01', 'available', 55.00, tech_user_id, true),
        
        ('EMP004', 'James', 'Wilson', 'james.w@fibreflow.com', '+27 82 777 8888',
         'Field Operations', 'Field Technician', 'technician', '2023-07-15', 'available', 55.00, null, true),
        
        ('EMP005', 'Emma', 'Taylor', 'emma.t@fibreflow.com', '+27 82 999 0000',
         'Quality Assurance', 'QA Inspector', 'inspector', '2023-04-10', 'available', 65.00, null, true);
    
    -- =====================================================
    -- CONTRACTORS
    -- =====================================================
    INSERT INTO contractors (id, company_name, registration_number, contact_person, email, phone, 
                           address, city, country, specializations, rating, status, onboarding_status, 
                           onboarding_progress, approved_by, approved_at)
    VALUES
        (contractor1_id, 'FiberTech Solutions', 'REG2023001', 'Peter Anderson', 'info@fibertech.co.za', 
         '+27 11 222 3333', '123 Industrial Road', 'Johannesburg', 'South Africa',
         ARRAY['fiber_splicing', 'cable_laying', 'testing'], 4.5, 'active', 'complete', 100,
         admin_user_id, CURRENT_TIMESTAMP - INTERVAL '30 days'),
        
        (contractor2_id, 'Network Builders Pro', 'REG2023002', 'Mark Thompson', 'contact@netbuilders.co.za',
         '+27 11 444 5555', '456 Construction Ave', 'Pretoria', 'South Africa',
         ARRAY['pole_installation', 'trenching', 'cable_laying'], 4.2, 'active', 'complete', 100,
         admin_user_id, CURRENT_TIMESTAMP - INTERVAL '45 days');
    
    INSERT INTO seed_ids VALUES 
        ('contractor', 'FiberTech Solutions', contractor1_id),
        ('contractor', 'Network Builders Pro', contractor2_id);
    
    -- Contractor team members
    INSERT INTO contractor_team_members (contractor_id, name, role, email, phone, is_primary)
    VALUES
        (contractor1_id, 'Peter Anderson', 'Project Manager', 'peter@fibertech.co.za', '+27 82 111 1111', true),
        (contractor1_id, 'John Roberts', 'Senior Technician', 'john@fibertech.co.za', '+27 82 222 2222', false),
        (contractor2_id, 'Mark Thompson', 'Operations Manager', 'mark@netbuilders.co.za', '+27 82 333 3333', true),
        (contractor2_id, 'Steve Johnson', 'Site Supervisor', 'steve@netbuilders.co.za', '+27 82 444 4444', false);
    
    -- Contractor projects
    INSERT INTO contractor_projects (contractor_id, project_id, contract_value, start_date, status)
    VALUES
        (contractor1_id, project1_id, 800000.00, '2025-02-01', 'active'),
        (contractor2_id, project1_id, 600000.00, '2025-02-15', 'active');
    
    -- =====================================================
    -- SUPPLIERS
    -- =====================================================
    INSERT INTO suppliers (id, name, code, contact_person, email, phone, address, city, country,
                          categories, products, rating, credit_limit, payment_terms, lead_time_days,
                          status, compliance_status, approved_by, approved_at)
    VALUES
        (supplier1_id, 'CableTech Suppliers', 'SUP001', 'Alice Cooper', 'sales@cabletech.co.za',
         '+27 11 555 6666', '789 Supply Street', 'Johannesburg', 'South Africa',
         ARRAY['cables', 'connectors'], ARRAY['fiber_cable', 'patch_panels', 'connectors'],
         4.6, 500000.00, 'Net 30', 7, 'active', 'approved', admin_user_id, CURRENT_TIMESTAMP - INTERVAL '60 days'),
        
        (supplier2_id, 'Network Equipment Co', 'SUP002', 'Bob Martin', 'info@netequip.co.za',
         '+27 11 777 8888', '321 Tech Park', 'Centurion', 'South Africa',
         ARRAY['equipment', 'tools'], ARRAY['switches', 'routers', 'testing_equipment'],
         4.4, 750000.00, 'Net 45', 14, 'active', 'approved', admin_user_id, CURRENT_TIMESTAMP - INTERVAL '75 days'),
        
        (supplier3_id, 'Safety Gear Direct', 'SUP003', 'Carol White', 'orders@safetygear.co.za',
         '+27 11 999 0000', '654 Safety Road', 'Midrand', 'South Africa',
         ARRAY['safety', 'ppe'], ARRAY['helmets', 'safety_vests', 'gloves', 'boots'],
         4.8, 200000.00, 'Net 15', 3, 'active', 'approved', admin_user_id, CURRENT_TIMESTAMP - INTERVAL '90 days');
    
    INSERT INTO seed_ids VALUES 
        ('supplier', 'CableTech Suppliers', supplier1_id),
        ('supplier', 'Network Equipment Co', supplier2_id),
        ('supplier', 'Safety Gear Direct', supplier3_id);
    
    -- =====================================================
    -- PRODUCTS
    -- =====================================================
    INSERT INTO products (sku, name, description, category, sub_category, unit, base_price, specifications)
    VALUES
        ('FIB-SM-12', '12-Core Single Mode Fiber Cable', 'High-quality single mode fiber optic cable',
         'Cables', 'Fiber Optic', 'meter', 45.00, 
         '{"cores": 12, "type": "single_mode", "jacket": "PE", "armored": false}'::jsonb),
        
        ('FIB-SM-24', '24-Core Single Mode Fiber Cable', 'High-quality single mode fiber optic cable',
         'Cables', 'Fiber Optic', 'meter', 75.00,
         '{"cores": 24, "type": "single_mode", "jacket": "PE", "armored": false}'::jsonb),
        
        ('CONN-SC-SM', 'SC Connector Single Mode', 'SC type fiber connector for single mode',
         'Connectors', 'Fiber Connectors', 'piece', 15.00,
         '{"type": "SC", "mode": "single_mode", "polish": "UPC"}'::jsonb),
        
        ('PATCH-24P', '24-Port Patch Panel', 'Rack-mount fiber patch panel',
         'Equipment', 'Patch Panels', 'unit', 450.00,
         '{"ports": 24, "rack_units": "1U", "type": "LC"}'::jsonb),
        
        ('OTDR-T100', 'OTDR Testing Equipment', 'Optical Time Domain Reflectometer',
         'Equipment', 'Testing', 'unit', 15000.00,
         '{"range": "100km", "wavelengths": ["1310nm", "1550nm"], "display": "7inch"}'::jsonb),
        
        ('PPE-HELM-01', 'Safety Helmet', 'Industrial safety helmet with chin strap',
         'Safety', 'Head Protection', 'piece', 85.00,
         '{"color": "white", "standard": "EN397", "adjustable": true}'::jsonb),
        
        ('PPE-VEST-HV', 'High Visibility Vest', 'Reflective safety vest',
         'Safety', 'Body Protection', 'piece', 65.00,
         '{"color": "orange", "size": ["S", "M", "L", "XL"], "class": "2"}'::jsonb);
    
    -- =====================================================
    -- PROJECT PHASES
    -- =====================================================
    INSERT INTO project_phases (project_id, name, description, phase_number, start_date, end_date, 
                               status, progress_percentage, budget_allocated, responsible_id)
    VALUES
        (project1_id, 'Site Survey & Planning', 'Initial site survey and route planning', 1,
         '2025-02-01', '2025-02-28', 'active', 75.00, 250000.00, manager_user_id),
        
        (project1_id, 'Pole Installation', 'Installation of fiber poles along designated routes', 2,
         '2025-03-01', '2025-04-30', 'pending', 0.00, 600000.00, manager_user_id),
        
        (project1_id, 'Cable Laying', 'Laying fiber optic cables', 3,
         '2025-04-15', '2025-06-30', 'pending', 0.00, 800000.00, manager_user_id),
        
        (project1_id, 'Splicing & Testing', 'Cable splicing and network testing', 4,
         '2025-06-15', '2025-07-31', 'pending', 0.00, 500000.00, manager_user_id),
        
        (project1_id, 'Customer Connections', 'Final drop connections to customers', 5,
         '2025-07-01', '2025-08-31', 'pending', 0.00, 350000.00, manager_user_id);
    
    -- =====================================================
    -- TASKS
    -- =====================================================
    WITH phase_ids AS (
        SELECT id, phase_number FROM project_phases WHERE project_id = project1_id
    )
    INSERT INTO tasks (project_id, phase_id, title, description, task_type, priority, status, 
                      assigned_to, start_date, due_date, estimated_hours)
    SELECT 
        project1_id,
        p.id,
        t.title,
        t.description,
        'field_work',
        'high',
        CASE WHEN p.phase_number = 1 THEN 'in_progress' ELSE 'pending' END,
        manager_user_id,
        '2025-02-01'::timestamp + (p.phase_number - 1) * INTERVAL '30 days',
        '2025-02-28'::timestamp + (p.phase_number - 1) * INTERVAL '30 days',
        t.hours
    FROM phase_ids p
    CROSS JOIN (
        VALUES 
            ('Conduct site survey', 'Survey the area and document existing infrastructure', 40),
            ('Create route maps', 'Design optimal cable routing paths', 24),
            ('Obtain permits', 'Secure necessary permits from authorities', 16),
            ('Resource planning', 'Plan equipment and personnel requirements', 20)
    ) AS t(title, description, hours)
    WHERE p.phase_number = 1;
    
    -- =====================================================
    -- BOQ (Bill of Quantities)
    -- =====================================================
    WITH boq_insert AS (
        INSERT INTO boq (project_id, boq_number, title, description, status, total_amount, 
                        prepared_by, approved_by, approved_at)
        VALUES 
            (project1_id, 'BOQ-CFR-001', 'Centurion Fiber Rollout Materials', 
             'Complete bill of quantities for Phase 1', 'approved', 850000.00,
             manager_user_id, admin_user_id, CURRENT_TIMESTAMP - INTERVAL '7 days')
        RETURNING id
    )
    INSERT INTO boq_items (boq_id, description, quantity, unit, unit_price, total_price, category)
    SELECT 
        b.id,
        i.description,
        i.quantity,
        i.unit,
        i.unit_price,
        i.quantity * i.unit_price,
        i.category
    FROM boq_insert b
    CROSS JOIN (
        VALUES
            ('12-Core Single Mode Fiber Cable', 5000, 'meter', 45.00, 'Cables'),
            ('24-Core Single Mode Fiber Cable', 2000, 'meter', 75.00, 'Cables'),
            ('SC Connectors Single Mode', 500, 'piece', 15.00, 'Connectors'),
            ('24-Port Patch Panels', 20, 'unit', 450.00, 'Equipment'),
            ('Safety Helmets', 50, 'piece', 85.00, 'Safety'),
            ('High Visibility Vests', 50, 'piece', 65.00, 'Safety')
    ) AS i(description, quantity, unit, unit_price, category);
    
    -- =====================================================
    -- RFQ (Request for Quotation)
    -- =====================================================
    WITH rfq_insert AS (
        INSERT INTO rfq (rfq_number, project_id, boq_id, title, description, status, 
                        submission_deadline, delivery_date, created_by, published_at)
        SELECT 
            'RFQ-2025-001',
            project1_id,
            id,
            'Fiber Optic Materials Supply - Centurion Project',
            'Request for quotation for fiber optic cables and related equipment',
            'open',
            CURRENT_TIMESTAMP + INTERVAL '14 days',
            '2025-03-15',
            manager_user_id,
            CURRENT_TIMESTAMP
        FROM boq WHERE boq_number = 'BOQ-CFR-001'
        RETURNING id
    )
    INSERT INTO rfq_suppliers (rfq_id, supplier_id, invitation_sent_at, status)
    SELECT 
        r.id,
        s.entity_id,
        CURRENT_TIMESTAMP,
        'invited'
    FROM rfq_insert r
    CROSS JOIN seed_ids s
    WHERE s.entity_type = 'supplier';
    
    -- =====================================================
    -- POLES (Sample data)
    -- =====================================================
    INSERT INTO poles (project_id, pole_number, pole_type, material, height_meters, 
                      latitude, longitude, address, status)
    VALUES
        (project1_id, 'P001', 'distribution', 'concrete', 9.00, 
         -25.7479, 28.2293, 'Corner of Jean Ave and Cantonments Rd, Centurion', 'planned'),
        (project1_id, 'P002', 'distribution', 'concrete', 9.00,
         -25.7481, 28.2295, 'Jean Ave, Centurion', 'planned'),
        (project1_id, 'P003', 'distribution', 'concrete', 9.00,
         -25.7483, 28.2297, 'Jean Ave (North), Centurion', 'planned'),
        (project1_id, 'P004', 'distribution', 'wooden', 7.50,
         -25.7485, 28.2299, 'Cantonments Rd, Centurion', 'planned'),
        (project1_id, 'P005', 'distribution', 'wooden', 7.50,
         -25.7487, 28.2301, 'Cantonments Rd (East), Centurion', 'planned');
    
    -- =====================================================
    -- NOTIFICATIONS (Sample)
    -- =====================================================
    INSERT INTO notifications (user_id, type, title, message, data, priority)
    VALUES
        (manager_user_id, 'task_assigned', 'New Task Assigned', 
         'You have been assigned to conduct site survey', 
         '{"task_id": "' || uuid_generate_v4() || '", "project": "Centurion Fiber Rollout"}'::jsonb,
         'high'),
        
        (admin_user_id, 'rfq_created', 'New RFQ Published',
         'RFQ-2025-001 has been published and sent to suppliers',
         '{"rfq_number": "RFQ-2025-001", "deadline": "2025-02-14"}'::jsonb,
         'normal'),
        
        (manager_user_id, 'project_update', 'Project Phase Started',
         'Site Survey & Planning phase has started for Centurion project',
         '{"project_id": "' || project1_id || '", "phase": "Site Survey & Planning"}'::jsonb,
         'normal');
    
    -- =====================================================
    -- SETTINGS
    -- =====================================================
    INSERT INTO settings (category, key, value, description, is_public)
    VALUES
        ('system', 'company_name', '"FibreFlow Solutions"', 'Company name', true),
        ('system', 'default_currency', '"ZAR"', 'Default currency', true),
        ('system', 'fiscal_year_start', '"04-01"', 'Fiscal year start (MM-DD)', false),
        ('email', 'smtp_host', '"smtp.gmail.com"', 'SMTP server host', false),
        ('email', 'smtp_port', '587', 'SMTP server port', false),
        ('notifications', 'enable_email', 'true', 'Enable email notifications', false),
        ('notifications', 'enable_push', 'true', 'Enable push notifications', false),
        ('procurement', 'rfq_validity_days', '30', 'Default RFQ validity in days', false),
        ('procurement', 'auto_close_rfq', 'true', 'Automatically close RFQ after deadline', false),
        ('projects', 'default_task_priority', '"medium"', 'Default priority for new tasks', false);
    
    -- =====================================================
    -- DISPLAY SUMMARY
    -- =====================================================
    RAISE NOTICE 'Seed data created successfully!';
    RAISE NOTICE '================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '  - Users: 3';
    RAISE NOTICE '  - Clients: 2';
    RAISE NOTICE '  - Projects: 2';
    RAISE NOTICE '  - Staff: 5';
    RAISE NOTICE '  - Contractors: 2';
    RAISE NOTICE '  - Suppliers: 3';
    RAISE NOTICE '  - Products: 7';
    RAISE NOTICE '  - Project Phases: 5';
    RAISE NOTICE '  - Tasks: 4';
    RAISE NOTICE '  - BOQ with items';
    RAISE NOTICE '  - RFQ with invited suppliers';
    RAISE NOTICE '  - Sample poles: 5';
    RAISE NOTICE '  - Notifications: 3';
    RAISE NOTICE '  - System settings: 10';
    RAISE NOTICE '================================';
    
    -- Show created IDs for reference
    RAISE NOTICE 'Key IDs for reference:';
    SELECT * FROM seed_ids;
    
END$$;

-- =====================================================
-- ADDITIONAL TEST DATA GENERATORS
-- =====================================================

-- Function to generate random tasks
CREATE OR REPLACE FUNCTION generate_random_tasks(project_uuid UUID, count INTEGER)
RETURNS void AS $$
DECLARE
    i INTEGER;
    phase_id UUID;
    staff_id UUID;
BEGIN
    FOR i IN 1..count LOOP
        -- Get random phase
        SELECT id INTO phase_id FROM project_phases 
        WHERE project_id = project_uuid 
        ORDER BY RANDOM() LIMIT 1;
        
        -- Get random staff
        SELECT id INTO staff_id FROM staff 
        WHERE is_active = true 
        ORDER BY RANDOM() LIMIT 1;
        
        INSERT INTO tasks (
            project_id, phase_id, title, description, 
            task_type, priority, status, assigned_staff_id,
            start_date, due_date, estimated_hours
        ) VALUES (
            project_uuid,
            phase_id,
            'Task ' || i || ': ' || (ARRAY['Installation', 'Testing', 'Documentation', 'Review', 'Inspection'])[floor(random() * 5 + 1)],
            'Generated task for testing purposes',
            (ARRAY['field_work', 'office_work', 'inspection', 'documentation'])[floor(random() * 4 + 1)],
            (ARRAY['low', 'medium', 'high'])[floor(random() * 3 + 1)],
            (ARRAY['pending', 'in_progress', 'completed'])[floor(random() * 3 + 1)],
            staff_id,
            CURRENT_TIMESTAMP + (i * INTERVAL '1 day'),
            CURRENT_TIMESTAMP + ((i + 7) * INTERVAL '1 day'),
            floor(random() * 40 + 8)
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to generate random poles for a project
CREATE OR REPLACE FUNCTION generate_random_poles(project_uuid UUID, count INTEGER)
RETURNS void AS $$
DECLARE
    i INTEGER;
    base_lat DECIMAL := -25.7479;
    base_long DECIMAL := 28.2293;
BEGIN
    FOR i IN 1..count LOOP
        INSERT INTO poles (
            project_id, pole_number, pole_type, material,
            height_meters, latitude, longitude, status
        ) VALUES (
            project_uuid,
            'P' || LPAD((i + 5)::TEXT, 3, '0'),
            (ARRAY['distribution', 'transmission', 'joint'])[floor(random() * 3 + 1)],
            (ARRAY['concrete', 'wooden', 'steel'])[floor(random() * 3 + 1)],
            floor(random() * 5 + 7)::DECIMAL,
            base_lat + (random() * 0.01 - 0.005),
            base_long + (random() * 0.01 - 0.005),
            (ARRAY['planned', 'installed', 'inspected'])[floor(random() * 3 + 1)]
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- OPTIONAL: Generate additional test data
-- Uncomment to create more sample data
-- =====================================================

-- Generate 20 additional tasks for the first project
-- SELECT generate_random_tasks(
--     (SELECT entity_id FROM seed_ids WHERE entity_type = 'project' AND entity_name = 'Centurion Fiber Rollout'),
--     20
-- );

-- Generate 50 additional poles for the first project  
-- SELECT generate_random_poles(
--     (SELECT entity_id FROM seed_ids WHERE entity_type = 'project' AND entity_name = 'Centurion Fiber Rollout'),
--     50
-- );

-- =====================================================
-- CLEANUP
-- =====================================================

-- Drop temporary functions if not needed
-- DROP FUNCTION IF EXISTS generate_random_tasks(UUID, INTEGER);
-- DROP FUNCTION IF EXISTS generate_random_poles(UUID, INTEGER);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify data was created
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Verification Summary:';
    RAISE NOTICE '====================';
    RAISE NOTICE 'Users: %', (SELECT COUNT(*) FROM users);
    RAISE NOTICE 'Clients: %', (SELECT COUNT(*) FROM clients);
    RAISE NOTICE 'Projects: %', (SELECT COUNT(*) FROM projects);
    RAISE NOTICE 'Staff: %', (SELECT COUNT(*) FROM staff);
    RAISE NOTICE 'Contractors: %', (SELECT COUNT(*) FROM contractors);
    RAISE NOTICE 'Suppliers: %', (SELECT COUNT(*) FROM suppliers);
    RAISE NOTICE 'Products: %', (SELECT COUNT(*) FROM products);
    RAISE NOTICE 'Tasks: %', (SELECT COUNT(*) FROM tasks);
    RAISE NOTICE 'Poles: %', (SELECT COUNT(*) FROM poles);
END$$;