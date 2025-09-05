-- Field Operations Data Population Script
-- This script creates and populates field operations tables for mobile workers

-- ===========================
-- CREATE FIELD OPERATIONS TABLES
-- ===========================

-- Field Tasks Table
CREATE TABLE IF NOT EXISTS field_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_number VARCHAR(100) UNIQUE NOT NULL,
    project_id UUID REFERENCES projects(id),
    task_type VARCHAR(50) NOT NULL, -- 'installation', 'maintenance', 'inspection', 'repair', 'survey'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'scheduled', 'in_progress', 'completed', 'cancelled'
    title TEXT NOT NULL,
    description TEXT,
    location_name TEXT,
    address TEXT,
    gps_latitude NUMERIC(10, 8),
    gps_longitude NUMERIC(11, 8),
    scheduled_date DATE,
    scheduled_time TIME,
    estimated_duration INTEGER, -- in minutes
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    assigned_team_id UUID,
    assigned_technician_id UUID,
    equipment_required JSON,
    materials_required JSON,
    safety_requirements JSON,
    completion_percentage INTEGER DEFAULT 0,
    completion_notes TEXT,
    photo_urls JSON,
    attachment_urls JSON,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    requires_customer_signature BOOLEAN DEFAULT FALSE,
    customer_signature_url TEXT,
    weather_conditions VARCHAR(100),
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_tasks_project ON field_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_field_tasks_status ON field_tasks(status);
CREATE INDEX IF NOT EXISTS idx_field_tasks_scheduled_date ON field_tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_field_tasks_assigned_team ON field_tasks(assigned_team_id);

-- Field Teams Table
CREATE TABLE IF NOT EXISTS field_teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_code VARCHAR(50) UNIQUE NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    team_type VARCHAR(50), -- 'installation', 'maintenance', 'fiber_splicing', 'inspection'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'on_break'
    base_location TEXT,
    current_location_lat NUMERIC(10, 8),
    current_location_lon NUMERIC(11, 8),
    last_location_update TIMESTAMP,
    capacity INTEGER DEFAULT 4,
    current_workload INTEGER DEFAULT 0,
    supervisor_id UUID,
    vehicle_id UUID,
    specializations JSON,
    certifications JSON,
    rating NUMERIC(3, 2),
    tasks_completed INTEGER DEFAULT 0,
    average_completion_time INTEGER, -- in minutes
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_teams_status ON field_teams(status);
CREATE INDEX IF NOT EXISTS idx_field_teams_type ON field_teams(team_type);

-- Field Technicians Table
CREATE TABLE IF NOT EXISTS field_technicians (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    team_id UUID REFERENCES field_teams(id),
    role VARCHAR(50), -- 'lead_technician', 'technician', 'apprentice', 'supervisor'
    status VARCHAR(20) DEFAULT 'available', -- 'available', 'busy', 'on_break', 'off_duty'
    skills JSON,
    certifications JSON,
    years_experience INTEGER,
    current_task_id UUID,
    current_location_lat NUMERIC(10, 8),
    current_location_lon NUMERIC(11, 8),
    last_location_update TIMESTAMP,
    device_id VARCHAR(255),
    device_status VARCHAR(20), -- 'online', 'offline', 'syncing'
    last_sync_time TIMESTAMP,
    performance_rating NUMERIC(3, 2),
    tasks_completed_today INTEGER DEFAULT 0,
    tasks_completed_week INTEGER DEFAULT 0,
    tasks_completed_total INTEGER DEFAULT 0,
    average_task_time INTEGER, -- in minutes
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_technicians_team ON field_technicians(team_id);
CREATE INDEX IF NOT EXISTS idx_field_technicians_status ON field_technicians(status);

-- Daily Schedules Table
CREATE TABLE IF NOT EXISTS daily_schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    schedule_date DATE NOT NULL,
    team_id UUID REFERENCES field_teams(id),
    technician_id UUID REFERENCES field_technicians(id),
    shift_start TIME DEFAULT '07:00',
    shift_end TIME DEFAULT '17:00',
    break_start TIME DEFAULT '12:00',
    break_duration INTEGER DEFAULT 60, -- in minutes
    tasks JSON, -- array of task IDs
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    route_optimization JSON,
    estimated_travel_time INTEGER, -- in minutes
    actual_travel_time INTEGER,
    vehicle_id UUID,
    equipment_checklist JSON,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_schedules_date ON daily_schedules(schedule_date);
CREATE INDEX IF NOT EXISTS idx_daily_schedules_team ON daily_schedules(team_id);
CREATE INDEX IF NOT EXISTS idx_daily_schedules_technician ON daily_schedules(technician_id);

-- Quality Checks Table
CREATE TABLE IF NOT EXISTS quality_checks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES field_tasks(id),
    check_type VARCHAR(50), -- 'installation', 'fiber_splice', 'connection', 'safety'
    inspector_id UUID REFERENCES field_technicians(id),
    inspection_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20), -- 'pass', 'fail', 'conditional_pass', 'pending_review'
    score NUMERIC(5, 2),
    checklist JSON,
    issues_found JSON,
    corrective_actions JSON,
    photo_evidence JSON,
    measurements JSON,
    compliance_standards JSON,
    customer_feedback TEXT,
    customer_satisfaction INTEGER, -- 1-5 rating
    requires_followup BOOLEAN DEFAULT FALSE,
    followup_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quality_checks_task ON quality_checks(task_id);
CREATE INDEX IF NOT EXISTS idx_quality_checks_status ON quality_checks(status);
CREATE INDEX IF NOT EXISTS idx_quality_checks_date ON quality_checks(inspection_date);

-- Equipment Checkout Table
CREATE TABLE IF NOT EXISTS equipment_checkouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    equipment_id VARCHAR(100) NOT NULL,
    equipment_name VARCHAR(255) NOT NULL,
    equipment_type VARCHAR(50), -- 'tool', 'safety_gear', 'testing_equipment', 'vehicle'
    serial_number VARCHAR(100),
    checked_out_to UUID REFERENCES field_technicians(id),
    team_id UUID REFERENCES field_teams(id),
    checkout_date TIMESTAMP DEFAULT NOW(),
    expected_return_date TIMESTAMP,
    actual_return_date TIMESTAMP,
    condition_out VARCHAR(50), -- 'excellent', 'good', 'fair', 'poor'
    condition_in VARCHAR(50),
    notes_out TEXT,
    notes_in TEXT,
    status VARCHAR(20) DEFAULT 'checked_out', -- 'checked_out', 'returned', 'lost', 'damaged'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_checkouts_technician ON equipment_checkouts(checked_out_to);
CREATE INDEX IF NOT EXISTS idx_equipment_checkouts_status ON equipment_checkouts(status);

-- Vehicle Assignments Table
CREATE TABLE IF NOT EXISTS vehicle_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vehicle_id VARCHAR(100) NOT NULL,
    vehicle_registration VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50), -- 'bakkie', 'van', 'truck', 'motorcycle'
    make_model VARCHAR(100),
    team_id UUID REFERENCES field_teams(id),
    driver_id UUID REFERENCES field_technicians(id),
    assignment_date DATE NOT NULL,
    fuel_level_start INTEGER, -- percentage
    fuel_level_end INTEGER,
    odometer_start INTEGER,
    odometer_end INTEGER,
    condition_notes TEXT,
    maintenance_due_date DATE,
    insurance_valid_until DATE,
    gps_tracker_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'assigned', -- 'assigned', 'in_use', 'returned', 'maintenance'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_team ON vehicle_assignments(team_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_date ON vehicle_assignments(assignment_date);

-- Mobile Sync Queue Table
CREATE TABLE IF NOT EXISTS mobile_sync_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL,
    technician_id UUID REFERENCES field_technicians(id),
    sync_type VARCHAR(50), -- 'upload', 'download', 'bidirectional'
    entity_type VARCHAR(50), -- 'task', 'photo', 'checklist', 'signature'
    entity_id VARCHAR(255),
    data JSON,
    priority INTEGER DEFAULT 5, -- 1-10, 1 being highest
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'syncing', 'completed', 'failed'
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    queued_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    file_size INTEGER, -- in bytes
    network_type VARCHAR(20) -- 'wifi', '4g', '3g', 'offline'
);

CREATE INDEX IF NOT EXISTS idx_mobile_sync_queue_device ON mobile_sync_queue(device_id);
CREATE INDEX IF NOT EXISTS idx_mobile_sync_queue_status ON mobile_sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_mobile_sync_queue_priority ON mobile_sync_queue(priority);

-- ===========================
-- POPULATE DATA
-- ===========================

-- First, ensure we have the uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert Field Teams
INSERT INTO field_teams (team_code, team_name, team_type, status, base_location, current_location_lat, current_location_lon, capacity, specializations, certifications, rating)
VALUES
    ('FT001', 'Alpha Installation Team', 'installation', 'active', 'Johannesburg Central', -26.2041 + random() * 0.5, 28.0473 + random() * 0.5, 4, '["fiber_installation", "pole_mounting", "trenching"]', '["safety_certified", "fiber_certified"]', 4.5),
    ('FT002', 'Bravo Maintenance Team', 'maintenance', 'active', 'Sandton', -26.1076 + random() * 0.5, 28.0567 + random() * 0.5, 3, '["preventive_maintenance", "troubleshooting", "repairs"]', '["safety_certified", "electrical_certified"]', 4.3),
    ('FT003', 'Charlie Fiber Team', 'fiber_splicing', 'active', 'Randburg', -26.0964 + random() * 0.5, 27.9772 + random() * 0.5, 2, '["fiber_splicing", "otdr_testing", "fusion_splicing"]', '["fiber_expert", "otdr_certified"]', 4.8),
    ('FT004', 'Delta Inspection Team', 'inspection', 'active', 'Midrand', -25.9984 + random() * 0.5, 28.1280 + random() * 0.5, 2, '["quality_inspection", "safety_audit", "compliance_check"]', '["iso_certified", "safety_inspector"]', 4.6),
    ('FT005', 'Echo Installation Team', 'installation', 'active', 'Roodepoort', -26.1625 + random() * 0.5, 27.8626 + random() * 0.5, 5, '["residential_installation", "business_installation"]', '["safety_certified", "customer_service"]', 4.4),
    ('FT006', 'Foxtrot Emergency Team', 'maintenance', 'active', 'Kempton Park', -26.0833 + random() * 0.5, 28.2333 + random() * 0.5, 3, '["emergency_response", "fault_finding", "restoration"]', '["emergency_certified", "first_aid"]', 4.7),
    ('FT007', 'Golf Survey Team', 'installation', 'active', 'Soweto', -26.2681 + random() * 0.5, 27.8591 + random() * 0.5, 4, '["site_survey", "planning", "documentation"]', '["survey_certified", "cad_certified"]', 4.2),
    ('FT008', 'Hotel Splice Team', 'fiber_splicing', 'active', 'Alexandra', -26.1065 + random() * 0.5, 28.0915 + random() * 0.5, 3, '["mass_splicing", "enclosure_installation"]', '["advanced_fiber", "enclosure_certified"]', 4.5);

-- Generate Field Technicians
DO $$
DECLARE
    team_record RECORD;
    tech_count INTEGER;
    i INTEGER;
    tech_role VARCHAR(50);
    tech_name VARCHAR(255);
    tech_names TEXT[] := ARRAY['John Smith', 'Peter Jones', 'David Brown', 'Michael Davis', 'James Wilson', 'Robert Taylor', 'William Anderson', 'Joseph Thomas', 
                               'Charles Jackson', 'Thomas White', 'Christopher Harris', 'Daniel Martin', 'Matthew Thompson', 'Anthony Garcia', 'Mark Martinez',
                               'Donald Robinson', 'Steven Clark', 'Paul Rodriguez', 'Andrew Lewis', 'Joshua Lee', 'Kenneth Walker', 'Kevin Hall',
                               'Brian Allen', 'George Young', 'Edward Hernandez', 'Ronald King', 'Timothy Wright', 'Jason Lopez', 'Jeffrey Hill',
                               'Ryan Scott', 'Jacob Green', 'Gary Adams', 'Nicholas Baker', 'Eric Nelson', 'Stephen Carter', 'Larry Mitchell',
                               'Justin Perez', 'Scott Roberts', 'Brandon Turner', 'Frank Phillips', 'Benjamin Campbell', 'Gregory Parker', 'Samuel Evans',
                               'Raymond Edwards', 'Patrick Collins', 'Jack Stewart', 'Dennis Sanchez', 'Jerry Morris', 'Tyler Rogers', 'Aaron Reed',
                               'Jose Cook', 'Henry Morgan', 'Adam Bailey', 'Douglas Bell', 'Nathan Murphy', 'Peter Rivera', 'Zachary Cooper'];
    skills_list TEXT[] := ARRAY['fiber_splicing', 'cable_pulling', 'testing', 'troubleshooting', 'customer_service', 'safety', 'documentation', 'equipment_operation'];
BEGIN
    FOR team_record IN SELECT * FROM field_teams LOOP
        tech_count := 2 + floor(random() * 3)::integer; -- 2-4 technicians per team
        
        FOR i IN 1..tech_count LOOP
            -- Determine role based on position
            IF i = 1 THEN
                tech_role := 'lead_technician';
            ELSIF random() < 0.2 THEN
                tech_role := 'apprentice';
            ELSE
                tech_role := 'technician';
            END IF;
            
            -- Select a random name
            tech_name := tech_names[1 + floor(random() * array_length(tech_names, 1))::integer];
            
            INSERT INTO field_technicians (
                employee_id, name, email, phone, team_id, role, status,
                skills, certifications, years_experience, current_location_lat, current_location_lon,
                device_status, performance_rating
            ) VALUES (
                'EMP' || lpad((nextval('staff_id_seq'))::text, 5, '0'),
                tech_name,
                lower(replace(tech_name, ' ', '.')) || '@company.co.za',
                '+27' || (700000000 + floor(random() * 99999999))::text,
                team_record.id,
                tech_role,
                CASE WHEN random() < 0.8 THEN 'available' ELSE 'busy' END,
                (SELECT json_agg(skill) FROM (SELECT skills_list[s] as skill FROM generate_series(1, 3 + floor(random() * 3)::integer) s) sq),
                '["safety_level1", "first_aid"]'::json,
                CASE tech_role 
                    WHEN 'lead_technician' THEN 5 + floor(random() * 10)::integer
                    WHEN 'apprentice' THEN floor(random() * 2)::integer
                    ELSE 2 + floor(random() * 5)::integer
                END,
                -26.2041 + random() * 0.5,
                28.0473 + random() * 0.5,
                CASE WHEN random() < 0.9 THEN 'online' ELSE 'offline' END,
                3.5 + random() * 1.5
            );
        END LOOP;
    END LOOP;
END $$;

-- Create sequence for various IDs if not exists
CREATE SEQUENCE IF NOT EXISTS task_id_seq START 1001;
CREATE SEQUENCE IF NOT EXISTS staff_id_seq START 1001;

-- Generate 250+ Field Tasks with varied types
DO $$
DECLARE
    task_types TEXT[] := ARRAY['installation', 'maintenance', 'inspection', 'repair', 'survey'];
    priorities TEXT[] := ARRAY['low', 'medium', 'high', 'critical'];
    statuses TEXT[] := ARRAY['pending', 'scheduled', 'in_progress', 'completed'];
    locations TEXT[] := ARRAY['Sandton', 'Rosebank', 'Parktown', 'Melrose', 'Hyde Park', 'Bryanston', 'Fourways', 'Midrand', 
                              'Randburg', 'Northcliff', 'Greenside', 'Parkhurst', 'Craighall', 'Dunkeld', 'Illovo',
                              'Bedfordview', 'Edenvale', 'Germiston', 'Kempton Park', 'Benoni', 'Boksburg', 'Springs',
                              'Roodepoort', 'Krugersdorp', 'Randfontein', 'Soweto', 'Alexandra', 'Tembisa', 'Diepsloot'];
    streets TEXT[] := ARRAY['Main Road', 'Church Street', 'Market Street', 'Station Road', 'Park Lane', 'Victoria Avenue',
                           'King Street', 'Queen Street', 'Oxford Road', 'Cambridge Avenue', 'Republic Road', 'Jan Smuts Avenue'];
    task_date DATE;
    task_hour INTEGER;
    i INTEGER;
    proj_id UUID;
    team_id UUID;
    tech_id UUID;
BEGIN
    -- Get random project ID
    SELECT id INTO proj_id FROM projects ORDER BY RANDOM() LIMIT 1;
    
    FOR i IN 1..250 LOOP
        -- Random scheduled date within next 14 days
        task_date := CURRENT_DATE + (random() * 14)::integer;
        task_hour := 7 + floor(random() * 9)::integer; -- Between 7 AM and 4 PM
        
        -- Get random team and technician
        SELECT id INTO team_id FROM field_teams ORDER BY RANDOM() LIMIT 1;
        SELECT id INTO tech_id FROM field_technicians WHERE team_id = team_id ORDER BY RANDOM() LIMIT 1;
        
        INSERT INTO field_tasks (
            task_number, project_id, task_type, priority, status, title, description,
            location_name, address, gps_latitude, gps_longitude,
            scheduled_date, scheduled_time, estimated_duration,
            assigned_team_id, assigned_technician_id,
            equipment_required, materials_required, safety_requirements,
            completion_percentage, customer_name, customer_phone, customer_email,
            requires_customer_signature, weather_conditions
        ) VALUES (
            'TASK-' || lpad((nextval('task_id_seq'))::text, 6, '0'),
            proj_id,
            task_types[1 + floor(random() * array_length(task_types, 1))::integer],
            priorities[1 + floor(random() * array_length(priorities, 1))::integer],
            statuses[1 + floor(random() * array_length(statuses, 1))::integer],
            CASE floor(random() * 5)::integer
                WHEN 0 THEN 'Fiber Installation - Residential'
                WHEN 1 THEN 'Pole Inspection and Maintenance'
                WHEN 2 THEN 'Drop Cable Installation'
                WHEN 3 THEN 'Network Troubleshooting'
                ELSE 'Preventive Maintenance Check'
            END || ' at ' || locations[1 + floor(random() * array_length(locations, 1))::integer],
            CASE floor(random() * 5)::integer
                WHEN 0 THEN 'Install new fiber connection for residential customer. Run cable from distribution point to home.'
                WHEN 1 THEN 'Inspect pole condition, check for damage, verify cable attachments and safety compliance.'
                WHEN 2 THEN 'Install drop cable from pole to customer premises. Include splicing and termination.'
                WHEN 3 THEN 'Investigate reported network issues. Test signal levels and identify fault location.'
                ELSE 'Perform scheduled maintenance check on network equipment and connections.'
            END,
            locations[1 + floor(random() * array_length(locations, 1))::integer],
            (10 + floor(random() * 990))::text || ' ' || streets[1 + floor(random() * array_length(streets, 1))::integer],
            -26.2041 + random() * 0.5,
            28.0473 + random() * 0.5,
            task_date,
            (task_hour || ':' || lpad((floor(random() * 4) * 15)::text, 2, '0'))::TIME,
            30 + floor(random() * 150)::integer, -- 30 to 180 minutes
            team_id,
            tech_id,
            '["ladder", "fiber_splicer", "otdr", "power_meter", "tool_kit"]'::json,
            '["fiber_cable_100m", "connectors_sc", "splice_enclosure", "cable_ties", "mounting_brackets"]'::json,
            '["hard_hat", "safety_vest", "gloves", "safety_glasses", "fall_protection"]'::json,
            CASE 
                WHEN statuses[1 + floor(random() * array_length(statuses, 1))::integer] = 'completed' THEN 100
                WHEN statuses[1 + floor(random() * array_length(statuses, 1))::integer] = 'in_progress' THEN 20 + floor(random() * 70)::integer
                ELSE 0
            END,
            'Customer ' || chr(65 + floor(random() * 26)::integer) || '. ' || 
                ARRAY['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson'][1 + floor(random() * 8)::integer],
            '+27' || (700000000 + floor(random() * 99999999))::text,
            'customer' || i || '@email.co.za',
            random() < 0.3, -- 30% require signature
            ARRAY['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain'][1 + floor(random() * 4)::integer]
        );
    END LOOP;
END $$;

-- Generate Daily Schedules for next 14 days
DO $$
DECLARE
    schedule_date DATE;
    team_record RECORD;
    tech_record RECORD;
    task_ids UUID[];
    vehicle_regs TEXT[] := ARRAY['GP123ABC', 'GP456DEF', 'GP789GHI', 'GP012JKL', 'GP345MNO', 'GP678PQR', 'GP901STU', 'GP234VWX'];
BEGIN
    FOR schedule_date IN SELECT generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '13 days', '1 day')::date LOOP
        -- Schedule for each team
        FOR team_record IN SELECT * FROM field_teams WHERE status = 'active' LOOP
            -- Get 3-6 random tasks for this team
            SELECT array_agg(id) INTO task_ids 
            FROM (
                SELECT id FROM field_tasks 
                WHERE scheduled_date = schedule_date 
                AND assigned_team_id = team_record.id
                ORDER BY RANDOM() 
                LIMIT 3 + floor(random() * 4)::integer
            ) t;
            
            INSERT INTO daily_schedules (
                schedule_date, team_id, shift_start, shift_end,
                break_start, break_duration, tasks, total_tasks,
                completed_tasks, estimated_travel_time, vehicle_id,
                equipment_checklist, status
            ) VALUES (
                schedule_date,
                team_record.id,
                '07:00'::TIME,
                '17:00'::TIME,
                '12:00'::TIME,
                60,
                to_json(COALESCE(task_ids, ARRAY[]::UUID[])),
                COALESCE(array_length(task_ids, 1), 0),
                CASE 
                    WHEN schedule_date < CURRENT_DATE THEN floor(random() * COALESCE(array_length(task_ids, 1), 1))::integer
                    ELSE 0
                END,
                30 + floor(random() * 90)::integer, -- 30-120 minutes travel time
                md5(vehicle_regs[1 + floor(random() * array_length(vehicle_regs, 1))::integer])::UUID,
                '{"ladder": true, "safety_gear": true, "testing_equipment": true, "tools": true}'::json,
                CASE 
                    WHEN schedule_date < CURRENT_DATE THEN 'completed'
                    WHEN schedule_date = CURRENT_DATE THEN 'in_progress'
                    ELSE 'scheduled'
                END
            );
            
            -- Schedule for individual technicians
            FOR tech_record IN SELECT * FROM field_technicians WHERE team_id = team_record.id LOOP
                INSERT INTO daily_schedules (
                    schedule_date, team_id, technician_id, shift_start, shift_end,
                    break_start, break_duration, status
                ) VALUES (
                    schedule_date,
                    team_record.id,
                    tech_record.id,
                    CASE tech_record.role 
                        WHEN 'lead_technician' THEN '06:30'::TIME
                        ELSE '07:00'::TIME
                    END,
                    '17:00'::TIME,
                    '12:00'::TIME,
                    CASE tech_record.role
                        WHEN 'apprentice' THEN 45
                        ELSE 60
                    END,
                    CASE 
                        WHEN schedule_date < CURRENT_DATE THEN 'completed'
                        WHEN schedule_date = CURRENT_DATE THEN 'in_progress'
                        ELSE 'scheduled'
                    END
                );
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Generate Quality Check Data (85% pass, 15% with issues)
DO $$
DECLARE
    task_record RECORD;
    inspector_id UUID;
    check_status VARCHAR(20);
    check_score NUMERIC(5,2);
BEGIN
    -- Check completed tasks
    FOR task_record IN SELECT * FROM field_tasks WHERE status = 'completed' LIMIT 150 LOOP
        -- Get random inspector
        SELECT id INTO inspector_id FROM field_technicians 
        WHERE role IN ('lead_technician', 'supervisor') 
        ORDER BY RANDOM() LIMIT 1;
        
        -- 85% pass rate
        IF random() < 0.85 THEN
            check_status := 'pass';
            check_score := 85 + random() * 15; -- 85-100 score
        ELSE
            check_status := CASE 
                WHEN random() < 0.5 THEN 'fail'
                ELSE 'conditional_pass'
            END;
            check_score := 50 + random() * 35; -- 50-85 score
        END IF;
        
        INSERT INTO quality_checks (
            task_id, check_type, inspector_id, inspection_date,
            status, score, checklist, issues_found, corrective_actions,
            photo_evidence, measurements, compliance_standards,
            customer_satisfaction, requires_followup, notes
        ) VALUES (
            task_record.id,
            ARRAY['installation', 'fiber_splice', 'connection', 'safety'][1 + floor(random() * 4)::integer],
            inspector_id,
            task_record.updated_at + INTERVAL '1 hour',
            check_status,
            check_score,
            '{
                "cable_routing": true,
                "connector_quality": true,
                "signal_strength": true,
                "documentation": true,
                "safety_compliance": true,
                "customer_premises": true
            }'::json,
            CASE 
                WHEN check_status != 'pass' THEN 
                    json_build_array(
                        CASE floor(random() * 4)::integer
                            WHEN 0 THEN 'Improper cable bend radius'
                            WHEN 1 THEN 'Connector not properly seated'
                            WHEN 2 THEN 'Signal loss above threshold'
                            ELSE 'Documentation incomplete'
                        END
                    )
                ELSE '[]'::json
            END,
            CASE 
                WHEN check_status != 'pass' THEN 
                    json_build_array(
                        CASE floor(random() * 4)::integer
                            WHEN 0 THEN 'Re-route cable with proper bend radius'
                            WHEN 1 THEN 'Re-terminate connector'
                            WHEN 2 THEN 'Check and clean all connections'
                            ELSE 'Complete all required documentation'
                        END
                    )
                ELSE '[]'::json
            END,
            json_build_array(
                'https://storage.company.com/inspections/' || task_record.id || '/photo1.jpg',
                'https://storage.company.com/inspections/' || task_record.id || '/photo2.jpg'
            ),
            json_build_object(
                'signal_power', -20 + random() * 10,
                'return_loss', 35 + random() * 15,
                'insertion_loss', 0.2 + random() * 0.3
            ),
            '["ISO9001", "TIA568", "Safety_Standards_2024"]'::json,
            CASE 
                WHEN check_status = 'pass' THEN 4 + floor(random() * 2)::integer
                ELSE 2 + floor(random() * 3)::integer
            END,
            check_status != 'pass',
            CASE 
                WHEN check_status = 'pass' THEN 'All checks passed. Installation meets quality standards.'
                WHEN check_status = 'fail' THEN 'Quality issues identified. Requires immediate correction.'
                ELSE 'Minor issues noted. Conditional approval granted pending corrections.'
            END
        );
    END LOOP;
END $$;

-- Generate Equipment Checkouts
DO $$
DECLARE
    tech_record RECORD;
    equipment_types TEXT[] := ARRAY['Fusion Splicer', 'OTDR', 'Power Meter', 'Light Source', 'Ladder', 'Tool Kit', 'Safety Harness', 'Generator'];
    equipment_conditions TEXT[] := ARRAY['excellent', 'good', 'fair'];
    i INTEGER;
BEGIN
    FOR tech_record IN SELECT * FROM field_technicians WHERE status IN ('available', 'busy') LIMIT 50 LOOP
        FOR i IN 1..2 LOOP -- Each technician checks out 2 items
            INSERT INTO equipment_checkouts (
                equipment_id, equipment_name, equipment_type, serial_number,
                checked_out_to, team_id, checkout_date, expected_return_date,
                condition_out, notes_out, status
            ) VALUES (
                'EQ-' || lpad((1000 + floor(random() * 9000))::text, 4, '0'),
                equipment_types[1 + floor(random() * array_length(equipment_types, 1))::integer],
                CASE 
                    WHEN equipment_types[1 + floor(random() * array_length(equipment_types, 1))::integer] IN ('Ladder', 'Safety Harness') THEN 'safety_gear'
                    WHEN equipment_types[1 + floor(random() * array_length(equipment_types, 1))::integer] IN ('Tool Kit', 'Generator') THEN 'tool'
                    ELSE 'testing_equipment'
                END,
                'SN-' || md5(random()::text)::text,
                tech_record.id,
                tech_record.team_id,
                CURRENT_TIMESTAMP - INTERVAL '1 day' * floor(random() * 7)::integer,
                CURRENT_TIMESTAMP + INTERVAL '1 day' * (1 + floor(random() * 7)::integer),
                equipment_conditions[1 + floor(random() * array_length(equipment_conditions, 1))::integer],
                'Equipment checked and verified functional',
                'checked_out'
            );
        END LOOP;
    END LOOP;
END $$;

-- Generate Vehicle Assignments
DO $$
DECLARE
    team_record RECORD;
    vehicle_makes TEXT[] := ARRAY['Toyota Hilux', 'Ford Ranger', 'Isuzu D-Max', 'Nissan NP200', 'VW Amarok', 'Mazda BT-50'];
    vehicle_types TEXT[] := ARRAY['bakkie', 'van', 'truck'];
    reg_prefix TEXT[] := ARRAY['GP', 'GP', 'GP', 'WP', 'KZN'];
BEGIN
    FOR team_record IN SELECT * FROM field_teams WHERE status = 'active' LOOP
        INSERT INTO vehicle_assignments (
            vehicle_id, vehicle_registration, vehicle_type, make_model,
            team_id, assignment_date, fuel_level_start, odometer_start,
            maintenance_due_date, insurance_valid_until, gps_tracker_id, status
        ) VALUES (
            'VEH-' || lpad((team_record.id::text)::text, 4, '0'),
            reg_prefix[1 + floor(random() * array_length(reg_prefix, 1))::integer] || ' ' || 
                lpad((floor(random() * 1000))::text, 3, '0') || ' ' ||
                chr(65 + floor(random() * 26)::integer) || chr(65 + floor(random() * 26)::integer),
            vehicle_types[1 + floor(random() * array_length(vehicle_types, 1))::integer],
            vehicle_makes[1 + floor(random() * array_length(vehicle_makes, 1))::integer],
            team_record.id,
            CURRENT_DATE,
            60 + floor(random() * 40)::integer, -- 60-100% fuel
            120000 + floor(random() * 80000)::integer, -- 120k-200k km
            CURRENT_DATE + INTERVAL '1 month' * (1 + floor(random() * 3)::integer),
            CURRENT_DATE + INTERVAL '1 month' * (6 + floor(random() * 6)::integer),
            'GPS-' || md5(team_record.id::text),
            'assigned'
        );
    END LOOP;
END $$;

-- Generate Mobile Sync Queue Data
DO $$
DECLARE
    tech_record RECORD;
    sync_types TEXT[] := ARRAY['upload', 'download', 'bidirectional'];
    entity_types TEXT[] := ARRAY['task', 'photo', 'checklist', 'signature'];
    network_types TEXT[] := ARRAY['wifi', '4g', '3g', 'offline'];
    i INTEGER;
BEGIN
    FOR tech_record IN SELECT * FROM field_technicians WHERE device_status = 'online' LIMIT 30 LOOP
        FOR i IN 1..5 LOOP -- 5 sync items per technician
            INSERT INTO mobile_sync_queue (
                device_id, technician_id, sync_type, entity_type, entity_id,
                data, priority, status, retry_count, created_at,
                file_size, network_type
            ) VALUES (
                'DEVICE-' || md5(tech_record.id::text),
                tech_record.id,
                sync_types[1 + floor(random() * array_length(sync_types, 1))::integer],
                entity_types[1 + floor(random() * array_length(entity_types, 1))::integer],
                md5(random()::text),
                json_build_object(
                    'timestamp', CURRENT_TIMESTAMP,
                    'location', json_build_object('lat', -26.2041 + random() * 0.5, 'lon', 28.0473 + random() * 0.5),
                    'data', CASE entity_types[1 + floor(random() * array_length(entity_types, 1))::integer]
                        WHEN 'task' THEN json_build_object('status', 'completed', 'notes', 'Task completed successfully')
                        WHEN 'photo' THEN json_build_object('url', 'photo_' || i || '.jpg', 'type', 'installation')
                        WHEN 'checklist' THEN json_build_object('items', 10, 'completed', 10)
                        ELSE json_build_object('signature', 'base64_signature_data')
                    END
                ),
                1 + floor(random() * 10)::integer, -- priority 1-10
                CASE 
                    WHEN random() < 0.7 THEN 'completed'
                    WHEN random() < 0.9 THEN 'syncing'
                    ELSE 'pending'
                END,
                CASE WHEN random() < 0.1 THEN 1 + floor(random() * 2)::integer ELSE 0 END,
                CURRENT_TIMESTAMP - INTERVAL '1 hour' * floor(random() * 24)::integer,
                1024 + floor(random() * 102400)::integer, -- 1KB to 100KB
                network_types[1 + floor(random() * array_length(network_types, 1))::integer]
            );
        END LOOP;
    END LOOP;
END $$;

-- Update some tasks with actual completion data and photos
UPDATE field_tasks 
SET 
    actual_start_time = scheduled_date + scheduled_time,
    actual_end_time = scheduled_date + scheduled_time + (estimated_duration || ' minutes')::interval,
    completion_notes = 'Task completed successfully. All quality checks passed.',
    photo_urls = json_build_array(
        'https://storage.company.com/tasks/' || id || '/before.jpg',
        'https://storage.company.com/tasks/' || id || '/during.jpg',
        'https://storage.company.com/tasks/' || id || '/after.jpg'
    ),
    customer_signature_url = CASE 
        WHEN requires_customer_signature THEN 'https://storage.company.com/signatures/' || id || '.png'
        ELSE NULL
    END
WHERE status = 'completed';

-- Add some conflict resolutions to sync queue
INSERT INTO mobile_sync_queue (device_id, technician_id, sync_type, entity_type, entity_id, data, priority, status, error_message, retry_count)
SELECT 
    'DEVICE-' || md5(id::text),
    id,
    'upload',
    'task',
    md5(random()::text),
    json_build_object(
        'conflict', true,
        'local_version', 1,
        'server_version', 2,
        'resolution', 'merge',
        'data', json_build_object('status', 'completed')
    ),
    1,
    'failed',
    'Version conflict detected. Manual resolution required.',
    3
FROM field_technicians
ORDER BY RANDOM()
LIMIT 10;

-- Summary Statistics
SELECT 'Field Operations Data Population Complete!' as status;
SELECT 'Field Teams Created:' as metric, COUNT(*) as count FROM field_teams
UNION ALL
SELECT 'Field Technicians Created:', COUNT(*) FROM field_technicians
UNION ALL
SELECT 'Field Tasks Created:', COUNT(*) FROM field_tasks
UNION ALL
SELECT 'Daily Schedules Created:', COUNT(*) FROM daily_schedules
UNION ALL
SELECT 'Quality Checks Created:', COUNT(*) FROM quality_checks
UNION ALL
SELECT 'Equipment Checkouts Created:', COUNT(*) FROM equipment_checkouts
UNION ALL
SELECT 'Vehicle Assignments Created:', COUNT(*) FROM vehicle_assignments
UNION ALL
SELECT 'Mobile Sync Queue Items:', COUNT(*) FROM mobile_sync_queue;