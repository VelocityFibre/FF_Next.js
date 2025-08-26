-- Default Workflow Templates for FibreFlow Projects
-- This creates the standard 5-phase workflow and additional templates

-- Insert Default 5-Phase FibreFlow Project Workflow Template
INSERT INTO workflow_templates (
    id,
    name,
    description,
    category,
    type,
    status,
    version,
    is_default,
    is_system,
    tags,
    metadata,
    created_by,
    created_at,
    updated_at
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'FibreFlow Standard Project',
    'Standard 5-phase workflow for telecommunications infrastructure projects including planning, design, procurement, implementation, and handover phases.',
    'telecommunications',
    'system',
    'active',
    '1.0',
    true,
    true,
    '["telecommunications", "infrastructure", "standard", "5-phase"]',
    '{"estimatedDuration": 120, "complexity": "standard", "industry": "telecommunications"}',
    'system',
    NOW(),
    NOW()
);

-- Phase 1: Project Planning
INSERT INTO workflow_phases (
    id,
    workflow_template_id,
    name,
    description,
    order_index,
    color,
    icon,
    estimated_duration,
    required_roles,
    dependencies,
    completion_criteria,
    is_optional,
    is_parallel,
    metadata,
    created_at,
    updated_at
) VALUES (
    'a47ac10b-58cc-4372-a567-0e02b2c3d001',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Project Planning',
    'Initial project setup, requirements gathering, and planning phase',
    1,
    '#10B981',
    'clipboard-list',
    14,
    '["project_manager", "business_analyst"]',
    '[]',
    '["Project charter approved", "Requirements documented", "Stakeholders identified"]',
    false,
    false,
    '{"phase_type": "planning", "critical_path": true}',
    NOW(),
    NOW()
);

-- Phase 2: Design & Engineering
INSERT INTO workflow_phases (
    id,
    workflow_template_id,
    name,
    description,
    order_index,
    color,
    icon,
    estimated_duration,
    required_roles,
    dependencies,
    completion_criteria,
    is_optional,
    is_parallel,
    metadata,
    created_at,
    updated_at
) VALUES (
    'a47ac10b-58cc-4372-a567-0e02b2c3d002',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Design & Engineering',
    'Technical design, engineering drawings, and solution architecture',
    2,
    '#3B82F6',
    'drafting-compass',
    21,
    '["design_engineer", "technical_architect", "project_manager"]',
    '["a47ac10b-58cc-4372-a567-0e02b2c3d001"]',
    '["Technical drawings completed", "Design review approved", "BOQ finalized"]',
    false,
    false,
    '{"phase_type": "design", "critical_path": true}',
    NOW(),
    NOW()
);

-- Phase 3: Procurement & Logistics
INSERT INTO workflow_phases (
    id,
    workflow_template_id,
    name,
    description,
    order_index,
    color,
    icon,
    estimated_duration,
    required_roles,
    dependencies,
    completion_criteria,
    is_optional,
    is_parallel,
    metadata,
    created_at,
    updated_at
) VALUES (
    'a47ac10b-58cc-4372-a567-0e02b2c3d003',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Procurement & Logistics',
    'Material procurement, supplier management, and logistics coordination',
    3,
    '#F59E0B',
    'truck',
    28,
    '["procurement_manager", "logistics_coordinator", "supplier_manager"]',
    '["a47ac10b-58cc-4372-a567-0e02b2c3d002"]',
    '["All materials procured", "Delivery schedule confirmed", "Quality checks passed"]',
    false,
    true,
    '{"phase_type": "procurement", "critical_path": false}',
    NOW(),
    NOW()
);

-- Phase 4: Implementation & Construction
INSERT INTO workflow_phases (
    id,
    workflow_template_id,
    name,
    description,
    order_index,
    color,
    icon,
    estimated_duration,
    required_roles,
    dependencies,
    completion_criteria,
    is_optional,
    is_parallel,
    metadata,
    created_at,
    updated_at
) VALUES (
    'a47ac10b-58cc-4372-a567-0e02b2c3d004',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Implementation & Construction',
    'Field work execution, installation, and construction activities',
    4,
    '#EF4444',
    'hammer',
    35,
    '["field_manager", "construction_supervisor", "technician", "safety_officer"]',
    '["a47ac10b-58cc-4372-a567-0e02b2c3d003"]',
    '["Installation completed", "Quality testing passed", "Safety inspections cleared"]',
    false,
    false,
    '{"phase_type": "implementation", "critical_path": true}',
    NOW(),
    NOW()
);

-- Phase 5: Testing & Handover
INSERT INTO workflow_phases (
    id,
    workflow_template_id,
    name,
    description,
    order_index,
    color,
    icon,
    estimated_duration,
    required_roles,
    dependencies,
    completion_criteria,
    is_optional,
    is_parallel,
    metadata,
    created_at,
    updated_at
) VALUES (
    'a47ac10b-58cc-4372-a567-0e02b2c3d005',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Testing & Handover',
    'System testing, client acceptance, and project handover',
    5,
    '#8B5CF6',
    'check-circle',
    14,
    '["test_engineer", "project_manager", "client_manager"]',
    '["a47ac10b-58cc-4372-a567-0e02b2c3d004"]',
    '["System tests completed", "Client acceptance obtained", "Documentation handed over"]',
    false,
    false,
    '{"phase_type": "handover", "critical_path": true}',
    NOW(),
    NOW()
);

-- Sample Steps for Phase 1: Project Planning
INSERT INTO workflow_steps (
    id,
    workflow_phase_id,
    name,
    description,
    order_index,
    step_type,
    estimated_duration,
    assignee_role,
    dependencies,
    preconditions,
    postconditions,
    instructions,
    resources,
    validation,
    is_required,
    is_automated,
    metadata,
    created_at,
    updated_at
) VALUES 
(
    'b47ac10b-58cc-4372-a567-0e02b2c3d101',
    'a47ac10b-58cc-4372-a567-0e02b2c3d001',
    'Create Project Charter',
    'Define project scope, objectives, and success criteria',
    1,
    'task',
    8,
    'project_manager',
    '[]',
    '["Client requirements received"]',
    '["Project charter document", "Stakeholder sign-off"]',
    'Create comprehensive project charter including scope, timeline, budget, and success criteria.',
    '["project_charter_template", "stakeholder_register"]',
    '["Document completeness", "Stakeholder approval"]',
    true,
    false,
    '{"priority": "high", "deliverables": ["project_charter"]}',
    NOW(),
    NOW()
),
(
    'b47ac10b-58cc-4372-a567-0e02b2c3d102',
    'a47ac10b-58cc-4372-a567-0e02b2c3d001',
    'Conduct Stakeholder Analysis',
    'Identify and analyze all project stakeholders',
    2,
    'task',
    4,
    'business_analyst',
    '[]',
    '["Project charter approved"]',
    '["Stakeholder register", "Communication plan"]',
    'Identify all internal and external stakeholders, analyze their influence and requirements.',
    '["stakeholder_analysis_template"]',
    '["All stakeholders identified", "Influence matrix completed"]',
    true,
    false,
    '{"priority": "medium"}',
    NOW(),
    NOW()
),
(
    'b47ac10b-58cc-4372-a567-0e02b2c3d103',
    'a47ac10b-58cc-4372-a567-0e02b2c3d001',
    'Risk Assessment',
    'Identify and assess project risks',
    3,
    'review',
    6,
    'project_manager',
    '["b47ac10b-58cc-4372-a567-0e02b2c3d101"]',
    '["Project scope defined"]',
    '["Risk register", "Mitigation strategies"]',
    'Conduct comprehensive risk assessment and develop mitigation strategies.',
    '["risk_register_template", "risk_assessment_tools"]',
    '["All major risks identified", "Mitigation plans approved"]',
    true,
    false,
    '{"priority": "high"}',
    NOW(),
    NOW()
);

-- Sample Tasks for "Create Project Charter" Step
INSERT INTO workflow_tasks (
    id,
    workflow_step_id,
    name,
    description,
    order_index,
    priority,
    estimated_hours,
    skills_required,
    tools,
    deliverables,
    acceptance_criteria,
    is_optional,
    can_be_parallel,
    tags,
    metadata,
    created_at,
    updated_at
) VALUES 
(
    'c47ac10b-58cc-4372-a567-0e02b2c3d201',
    'b47ac10b-58cc-4372-a567-0e02b2c3d101',
    'Define Project Scope',
    'Document detailed project scope including boundaries and exclusions',
    1,
    'high',
    2.5,
    '["project_management", "business_analysis"]',
    '["MS Word", "Project Template"]',
    '["Scope statement document"]',
    '["Scope clearly defined", "Boundaries identified", "Exclusions documented"]',
    false,
    false,
    '["scope", "documentation"]',
    '{"template": "scope_statement_template"}',
    NOW(),
    NOW()
),
(
    'c47ac10b-58cc-4372-a567-0e02b2c3d202',
    'b47ac10b-58cc-4372-a567-0e02b2c3d101',
    'Set Project Objectives',
    'Define SMART objectives for the project',
    2,
    'high',
    1.5,
    '["project_management"]',
    '["MS Word"]',
    '["Objectives document"]',
    '["Objectives are SMART", "Success criteria defined"]',
    false,
    true,
    '["objectives", "SMART"]',
    '{}',
    NOW(),
    NOW()
),
(
    'c47ac10b-58cc-4372-a567-0e02b2c3d203',
    'b47ac10b-58cc-4372-a567-0e02b2c3d101',
    'Create High-Level Timeline',
    'Develop initial project timeline with major milestones',
    3,
    'medium',
    2.0,
    '["project_management", "scheduling"]',
    '["MS Project", "Excel"]',
    '["High-level timeline", "Milestone schedule"]',
    '["Timeline realistic", "Milestones identified", "Dependencies noted"]',
    false,
    false,
    '["timeline", "milestones"]',
    '{}',
    NOW(),
    NOW()
),
(
    'c47ac10b-58cc-4372-a567-0e02b2c3d204',
    'b47ac10b-58cc-4372-a567-0e02b2c3d101',
    'Budget Estimation',
    'Provide initial budget estimate for the project',
    4,
    'high',
    2.0,
    '["financial_analysis", "cost_estimation"]',
    '["Excel", "Cost_Database"]',
    '["Budget estimate", "Cost breakdown"]',
    '["Budget realistic", "All cost categories included", "Contingency added"]',
    false,
    true,
    '["budget", "costs"]',
    '{"contingency_percentage": 15}',
    NOW(),
    NOW()
);

-- Insert Second Template: Maintenance Project Workflow
INSERT INTO workflow_templates (
    id,
    name,
    description,
    category,
    type,
    status,
    version,
    is_default,
    is_system,
    tags,
    metadata,
    created_by,
    created_at,
    updated_at
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'Network Maintenance Project',
    'Streamlined workflow for network maintenance and upgrade projects',
    'maintenance',
    'system',
    'active',
    '1.0',
    false,
    true,
    '["maintenance", "network", "upgrade", "3-phase"]',
    '{"estimatedDuration": 30, "complexity": "simple", "industry": "telecommunications"}',
    'system',
    NOW(),
    NOW()
);

-- Maintenance Phase 1: Assessment
INSERT INTO workflow_phases (
    id,
    workflow_template_id,
    name,
    description,
    order_index,
    color,
    icon,
    estimated_duration,
    required_roles,
    dependencies,
    completion_criteria,
    is_optional,
    is_parallel,
    metadata,
    created_at,
    updated_at
) VALUES (
    'a47ac10b-58cc-4372-a567-0e02b2c3d006',
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'Network Assessment',
    'Assess current network status and maintenance requirements',
    1,
    '#06B6D4',
    'search',
    7,
    '["network_engineer", "technician"]',
    '[]',
    '["Network assessment completed", "Maintenance plan approved"]',
    false,
    false,
    '{"phase_type": "assessment"}',
    NOW(),
    NOW()
);

-- Maintenance Phase 2: Execution
INSERT INTO workflow_phases (
    id,
    workflow_template_id,
    name,
    description,
    order_index,
    color,
    icon,
    estimated_duration,
    required_roles,
    dependencies,
    completion_criteria,
    is_optional,
    is_parallel,
    metadata,
    created_at,
    updated_at
) VALUES (
    'a47ac10b-58cc-4372-a567-0e02b2c3d007',
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'Maintenance Execution',
    'Execute maintenance tasks and upgrades',
    2,
    '#F59E0B',
    'cog',
    16,
    '["technician", "field_engineer"]',
    '["a47ac10b-58cc-4372-a567-0e02b2c3d006"]',
    '["All maintenance tasks completed", "System performance verified"]',
    false,
    false,
    '{"phase_type": "execution"}',
    NOW(),
    NOW()
);

-- Maintenance Phase 3: Verification
INSERT INTO workflow_phases (
    id,
    workflow_template_id,
    name,
    description,
    order_index,
    color,
    icon,
    estimated_duration,
    required_roles,
    dependencies,
    completion_criteria,
    is_optional,
    is_parallel,
    metadata,
    created_at,
    updated_at
) VALUES (
    'a47ac10b-58cc-4372-a567-0e02b2c3d008',
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'System Verification',
    'Verify system performance and document results',
    3,
    '#10B981',
    'check-circle',
    7,
    '["network_engineer", "qa_specialist"]',
    '["a47ac10b-58cc-4372-a567-0e02b2c3d007"]',
    '["Performance tests passed", "Documentation updated"]',
    false,
    false,
    '{"phase_type": "verification"}',
    NOW(),
    NOW()
);

-- Insert Third Template: Emergency Response Workflow
INSERT INTO workflow_templates (
    id,
    name,
    description,
    category,
    type,
    status,
    version,
    is_default,
    is_system,
    tags,
    metadata,
    created_by,
    created_at,
    updated_at
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    'Emergency Response',
    'Fast-track workflow for critical infrastructure failures and emergency repairs',
    'emergency',
    'system',
    'active',
    '1.0',
    false,
    true,
    '["emergency", "critical", "fast-track", "2-phase"]',
    '{"estimatedDuration": 3, "complexity": "urgent", "industry": "telecommunications", "sla": 24}',
    'system',
    NOW(),
    NOW()
);

-- Emergency Phase 1: Immediate Response
INSERT INTO workflow_phases (
    id,
    workflow_template_id,
    name,
    description,
    order_index,
    color,
    icon,
    estimated_duration,
    required_roles,
    dependencies,
    completion_criteria,
    is_optional,
    is_parallel,
    metadata,
    created_at,
    updated_at
) VALUES (
    'a47ac10b-58cc-4372-a567-0e02b2c3d009',
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    'Immediate Response',
    'Immediate assessment and temporary fixes',
    1,
    '#DC2626',
    'alert-triangle',
    1,
    '["emergency_responder", "field_technician"]',
    '[]',
    '["Issue assessed", "Temporary fix implemented", "Service restored"]',
    false,
    false,
    '{"phase_type": "emergency", "sla_hours": 4}',
    NOW(),
    NOW()
);

-- Emergency Phase 2: Permanent Resolution
INSERT INTO workflow_phases (
    id,
    workflow_template_id,
    name,
    description,
    order_index,
    color,
    icon,
    estimated_duration,
    required_roles,
    dependencies,
    completion_criteria,
    is_optional,
    is_parallel,
    metadata,
    created_at,
    updated_at
) VALUES (
    'a47ac10b-58cc-4372-a567-0e02b2c3d010',
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    'Permanent Resolution',
    'Implement permanent fix and conduct post-incident review',
    2,
    '#059669',
    'shield-check',
    2,
    '["engineer", "project_manager"]',
    '["a47ac10b-58cc-4372-a567-0e02b2c3d009"]',
    '["Permanent fix implemented", "Post-incident review completed", "Preventive measures documented"]',
    false,
    false,
    '{"phase_type": "resolution", "sla_hours": 20}',
    NOW(),
    NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflow_phases_template_order 
ON workflow_phases (workflow_template_id, order_index);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_phase_order 
ON workflow_steps (workflow_phase_id, order_index);

CREATE INDEX IF NOT EXISTS idx_workflow_tasks_step_order 
ON workflow_tasks (workflow_step_id, order_index);

-- Add comments for documentation
COMMENT ON TABLE workflow_templates IS 'Master templates for different types of project workflows';
COMMENT ON TABLE workflow_phases IS 'Phases within workflow templates - logical groupings of work';
COMMENT ON TABLE workflow_steps IS 'Individual steps within phases - specific activities';
COMMENT ON TABLE workflow_tasks IS 'Granular tasks within steps - atomic work units';
COMMENT ON TABLE project_workflows IS 'Instances of workflow templates applied to specific projects';
COMMENT ON TABLE workflow_execution_log IS 'Audit log of workflow execution activities';