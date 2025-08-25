CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"user_name" text,
	"user_role" varchar(100),
	"ip_address" varchar(45),
	"user_agent" text,
	"old_value" json,
	"new_value" json,
	"changes_summary" text,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"session_id" varchar(255),
	"source" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "client_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" varchar(255) NOT NULL,
	"client_name" text NOT NULL,
	"total_projects" integer DEFAULT 0,
	"active_projects" integer DEFAULT 0,
	"completed_projects" integer DEFAULT 0,
	"total_revenue" numeric(15, 2),
	"outstanding_balance" numeric(15, 2),
	"average_project_value" numeric(15, 2),
	"payment_score" numeric(5, 2),
	"average_project_duration" integer,
	"on_time_completion_rate" numeric(5, 2),
	"satisfaction_score" numeric(5, 2),
	"last_project_date" timestamp,
	"next_follow_up_date" timestamp,
	"total_interactions" integer DEFAULT 0,
	"client_category" varchar(50),
	"lifetime_value" numeric(15, 2),
	"last_calculated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "client_analytics_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "financial_transactions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"transaction_type" varchar(50) NOT NULL,
	"project_id" varchar(255),
	"client_id" varchar(255),
	"supplier_id" varchar(255),
	"amount" numeric(15, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'ZAR',
	"status" varchar(50) NOT NULL,
	"invoice_number" varchar(100),
	"po_number" varchar(100),
	"transaction_date" timestamp NOT NULL,
	"due_date" timestamp,
	"paid_date" timestamp,
	"description" text,
	"notes" text,
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kpi_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" varchar(255),
	"metric_type" varchar(100) NOT NULL,
	"metric_name" text NOT NULL,
	"metric_value" numeric(15, 4) NOT NULL,
	"unit" varchar(50),
	"team_id" varchar(255),
	"contractor_id" varchar(255),
	"recorded_date" timestamp NOT NULL,
	"week_number" integer,
	"month_number" integer,
	"year" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "material_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" varchar(255) NOT NULL,
	"material_type" varchar(100) NOT NULL,
	"material_name" text NOT NULL,
	"quantity_used" numeric(15, 4) NOT NULL,
	"quantity_wasted" numeric(15, 4) DEFAULT '0',
	"unit" varchar(20) NOT NULL,
	"unit_cost" numeric(15, 2),
	"total_cost" numeric(15, 2),
	"work_order_id" varchar(255),
	"team_id" varchar(255),
	"used_by" varchar(255),
	"usage_date" timestamp NOT NULL,
	"recorded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" varchar(255) NOT NULL,
	"project_name" text NOT NULL,
	"client_id" varchar(255),
	"client_name" text,
	"total_poles" integer DEFAULT 0,
	"completed_poles" integer DEFAULT 0,
	"total_drops" integer DEFAULT 0,
	"completed_drops" integer DEFAULT 0,
	"total_budget" numeric(15, 2),
	"spent_budget" numeric(15, 2),
	"start_date" timestamp,
	"end_date" timestamp,
	"actual_end_date" timestamp,
	"completion_percentage" numeric(5, 2),
	"on_time_delivery" boolean,
	"quality_score" numeric(5, 2),
	"last_synced_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "report_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_type" varchar(100) NOT NULL,
	"report_key" varchar(255) NOT NULL,
	"filters" json NOT NULL,
	"parameters" json,
	"report_data" json NOT NULL,
	"chart_data" json,
	"summary" json,
	"generated_by" varchar(255),
	"generated_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"access_count" integer DEFAULT 0,
	"generation_time_ms" integer,
	"data_size_bytes" integer
);
--> statement-breakpoint
CREATE TABLE "staff_performance" (
	"id" serial PRIMARY KEY NOT NULL,
	"staff_id" varchar(255) NOT NULL,
	"staff_name" text NOT NULL,
	"project_id" varchar(255),
	"hours_worked" numeric(8, 2) DEFAULT '0',
	"tasks_completed" integer DEFAULT 0,
	"quality_score" numeric(5, 2),
	"safety_score" numeric(5, 2),
	"period_type" varchar(20) NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"productivity" numeric(8, 4),
	"efficiency" numeric(5, 2),
	"calculated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contractor_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contractor_id" uuid NOT NULL,
	"document_type" varchar(50) NOT NULL,
	"document_name" text NOT NULL,
	"document_number" varchar(100),
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer,
	"mime_type" varchar(100),
	"issue_date" timestamp,
	"expiry_date" timestamp,
	"is_expired" boolean DEFAULT false,
	"days_until_expiry" integer,
	"verification_status" varchar(20) DEFAULT 'pending',
	"verified_by" varchar(255),
	"verified_at" timestamp,
	"notes" text,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contractor_teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contractor_id" uuid NOT NULL,
	"team_name" text NOT NULL,
	"team_type" varchar(50),
	"specialization" varchar(100),
	"max_capacity" integer NOT NULL,
	"current_capacity" integer DEFAULT 0,
	"available_capacity" integer DEFAULT 0,
	"efficiency" numeric(5, 2),
	"quality_rating" numeric(5, 2),
	"safety_record" numeric(5, 2),
	"is_active" boolean DEFAULT true,
	"availability" varchar(20) DEFAULT 'available',
	"base_location" text,
	"operating_radius" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contractors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"registration_number" varchar(50) NOT NULL,
	"contact_person" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"alternate_phone" varchar(20),
	"physical_address" text,
	"postal_address" text,
	"city" varchar(100),
	"province" varchar(100),
	"postal_code" varchar(10),
	"business_type" varchar(50),
	"industry_category" varchar(100),
	"years_in_business" integer,
	"employee_count" integer,
	"annual_turnover" numeric(15, 2),
	"credit_rating" varchar(10),
	"payment_terms" varchar(50),
	"bank_name" varchar(100),
	"account_number" varchar(50),
	"branch_code" varchar(10),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"is_active" boolean DEFAULT true,
	"compliance_status" varchar(20) DEFAULT 'pending',
	"rag_overall" varchar(10) DEFAULT 'amber',
	"rag_financial" varchar(10) DEFAULT 'amber',
	"rag_compliance" varchar(10) DEFAULT 'amber',
	"rag_performance" varchar(10) DEFAULT 'amber',
	"rag_safety" varchar(10) DEFAULT 'amber',
	"performance_score" numeric(5, 2),
	"safety_score" numeric(5, 2),
	"quality_score" numeric(5, 2),
	"timeliness_score" numeric(5, 2),
	"total_projects" integer DEFAULT 0,
	"completed_projects" integer DEFAULT 0,
	"active_projects" integer DEFAULT 0,
	"cancelled_projects" integer DEFAULT 0,
	"onboarding_progress" integer DEFAULT 0,
	"onboarding_completed_at" timestamp,
	"documents_expiring" integer DEFAULT 0,
	"notes" text,
	"tags" json,
	"last_activity" timestamp,
	"next_review_date" timestamp,
	"created_by" varchar(255),
	"updated_by" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "contractors_registration_number_unique" UNIQUE("registration_number")
);
--> statement-breakpoint
CREATE TABLE "project_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(255) NOT NULL,
	"contractor_id" uuid NOT NULL,
	"team_id" uuid,
	"assignment_type" varchar(50),
	"scope" text NOT NULL,
	"responsibilities" json,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"actual_start_date" timestamp,
	"actual_end_date" timestamp,
	"contract_value" numeric(15, 2) NOT NULL,
	"paid_amount" numeric(15, 2) DEFAULT '0',
	"outstanding_amount" numeric(15, 2),
	"status" varchar(20) DEFAULT 'assigned' NOT NULL,
	"progress_percentage" integer DEFAULT 0,
	"performance_rating" numeric(5, 2),
	"quality_score" numeric(5, 2),
	"timeliness_score" numeric(5, 2),
	"assignment_notes" text,
	"completion_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"contractor_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"id_number" varchar(20),
	"email" varchar(255),
	"phone" varchar(20),
	"role" varchar(50) NOT NULL,
	"skill_level" varchar(20),
	"certifications" json,
	"special_skills" json,
	"employment_type" varchar(20),
	"hourly_rate" numeric(10, 2),
	"daily_rate" numeric(10, 2),
	"is_active" boolean DEFAULT true,
	"is_team_lead" boolean DEFAULT false,
	"performance_rating" numeric(5, 2),
	"safety_score" numeric(5, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "team_members_id_number_unique" UNIQUE("id_number")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"contact_person" varchar(255),
	"email" varchar(255),
	"phone" varchar(20),
	"alternate_phone" varchar(20),
	"address" text,
	"city" varchar(100),
	"state" varchar(100),
	"country" varchar(100) DEFAULT 'USA',
	"postal_code" varchar(20),
	"website" varchar(255),
	"industry" varchar(100),
	"client_type" varchar(50) DEFAULT 'standard',
	"status" varchar(20) DEFAULT 'active',
	"contract_value" numeric(15, 2),
	"payment_terms" varchar(100),
	"tax_id" varchar(50),
	"notes" text,
	"metadata" jsonb DEFAULT '{}',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"project_id" uuid,
	"meeting_type" varchar(50),
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"location" varchar(255),
	"meeting_link" text,
	"organizer" uuid,
	"attendees" jsonb DEFAULT '[]',
	"agenda" jsonb DEFAULT '[]',
	"minutes" text,
	"action_items" jsonb DEFAULT '[]',
	"attachments" jsonb DEFAULT '[]',
	"status" varchar(20) DEFAULT 'scheduled',
	"recurrence" jsonb,
	"metadata" jsonb DEFAULT '{}',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "poles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pole_number" varchar(50) NOT NULL,
	"project_id" uuid,
	"type" varchar(50),
	"height" numeric(5, 2),
	"material" varchar(50),
	"status" varchar(20) DEFAULT 'pending',
	"installation_date" date,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"address" text,
	"notes" text,
	"images" jsonb DEFAULT '[]',
	"inspection_data" jsonb DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_code" varchar(50) NOT NULL,
	"project_name" varchar(255) NOT NULL,
	"client_id" uuid,
	"description" text,
	"project_type" varchar(50),
	"status" varchar(20) DEFAULT 'planning',
	"priority" varchar(20) DEFAULT 'medium',
	"start_date" date,
	"end_date" date,
	"actual_start_date" date,
	"actual_end_date" date,
	"budget" numeric(15, 2),
	"actual_cost" numeric(15, 2),
	"project_manager" uuid,
	"team_lead" uuid,
	"location" text,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"progress_percentage" integer DEFAULT 0,
	"milestones" jsonb DEFAULT '[]',
	"deliverables" jsonb DEFAULT '[]',
	"risks" jsonb DEFAULT '[]',
	"documents" jsonb DEFAULT '[]',
	"tags" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "projects_project_code_unique" UNIQUE("project_code")
);
--> statement-breakpoint
CREATE TABLE "sow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sow_number" varchar(50) NOT NULL,
	"project_id" uuid,
	"client_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"scope" jsonb DEFAULT '[]',
	"deliverables" jsonb DEFAULT '[]',
	"timeline" jsonb DEFAULT '{}',
	"milestones" jsonb DEFAULT '[]',
	"budget" numeric(15, 2),
	"payment_schedule" jsonb DEFAULT '[]',
	"terms" text,
	"assumptions" jsonb DEFAULT '[]',
	"exclusions" jsonb DEFAULT '[]',
	"status" varchar(20) DEFAULT 'draft',
	"version" integer DEFAULT 1,
	"approved_by" uuid,
	"approved_date" timestamp,
	"expiry_date" date,
	"documents" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sow_sow_number_unique" UNIQUE("sow_number")
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" varchar(50) NOT NULL,
	"user_id" uuid,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"alternate_phone" varchar(20),
	"position" varchar(100),
	"department" varchar(100),
	"reports_to" uuid,
	"join_date" date,
	"contract_type" varchar(50) DEFAULT 'full-time',
	"status" varchar(20) DEFAULT 'active',
	"salary" numeric(12, 2),
	"hourly_rate" numeric(8, 2),
	"skills" jsonb DEFAULT '[]',
	"certifications" jsonb DEFAULT '[]',
	"emergency_contact" jsonb DEFAULT '{}',
	"address" text,
	"city" varchar(100),
	"state" varchar(100),
	"country" varchar(100) DEFAULT 'USA',
	"postal_code" varchar(20),
	"profile_picture" text,
	"documents" jsonb DEFAULT '[]',
	"performance_rating" numeric(3, 2),
	"current_project_count" integer DEFAULT 0,
	"max_project_count" integer DEFAULT 5,
	"metadata" jsonb DEFAULT '{}',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "staff_employee_id_unique" UNIQUE("employee_id"),
	CONSTRAINT "staff_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_code" varchar(50),
	"title" varchar(255) NOT NULL,
	"description" text,
	"project_id" uuid,
	"assigned_to" uuid,
	"assigned_by" uuid,
	"priority" varchar(20) DEFAULT 'medium',
	"status" varchar(20) DEFAULT 'pending',
	"category" varchar(50),
	"due_date" timestamp,
	"start_date" timestamp,
	"completed_date" timestamp,
	"estimated_hours" numeric(6, 2),
	"actual_hours" numeric(6, 2),
	"progress" integer DEFAULT 0,
	"dependencies" jsonb DEFAULT '[]',
	"subtasks" jsonb DEFAULT '[]',
	"comments" jsonb DEFAULT '[]',
	"attachments" jsonb DEFAULT '[]',
	"tags" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tasks_task_code_unique" UNIQUE("task_code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255),
	"first_name" varchar(100),
	"last_name" varchar(100),
	"role" varchar(50) DEFAULT 'user',
	"permissions" jsonb DEFAULT '[]',
	"is_active" boolean DEFAULT true,
	"last_login" timestamp,
	"profile_picture" text,
	"phone_number" varchar(20),
	"department" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "action_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action_id" varchar(50) NOT NULL,
	"project_id" uuid,
	"related_table" varchar(50),
	"related_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(50) DEFAULT 'general',
	"priority" varchar(20) DEFAULT 'medium',
	"action_type" varchar(50),
	"assigned_to" uuid,
	"assigned_by" uuid,
	"department_responsible" varchar(100),
	"due_date" date,
	"scheduled_date" date,
	"estimated_hours" numeric(6, 2),
	"status" varchar(20) DEFAULT 'open',
	"start_date" date,
	"completion_date" date,
	"actual_hours" numeric(6, 2),
	"resolution" text,
	"resolution_date" date,
	"verified_by" uuid,
	"verification_date" date,
	"attachments" jsonb DEFAULT '[]',
	"photos" jsonb DEFAULT '[]',
	"related_actions" jsonb DEFAULT '[]',
	"safety_related" boolean DEFAULT false,
	"compliance_related" boolean DEFAULT false,
	"customer_impact" varchar(20),
	"notifications_sent" jsonb DEFAULT '[]',
	"reminder_scheduled" boolean DEFAULT false,
	"escalation_level" integer DEFAULT 0,
	"metadata" jsonb DEFAULT '{}',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "action_items_action_id_unique" UNIQUE("action_id")
);
--> statement-breakpoint
CREATE TABLE "daily_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"work_date" date NOT NULL,
	"shift_type" varchar(20) DEFAULT 'day',
	"team_lead" uuid,
	"team_members" jsonb DEFAULT '[]',
	"contractor_id" uuid,
	"work_type" varchar(50),
	"activities_completed" jsonb DEFAULT '[]',
	"locations_worked" jsonb DEFAULT '[]',
	"drops_completed" integer DEFAULT 0,
	"fiber_stringing_completed" numeric(10, 2) DEFAULT '0',
	"home_installations_completed" integer DEFAULT 0,
	"poles_installed" integer DEFAULT 0,
	"start_time" timestamp,
	"end_time" timestamp,
	"total_hours" numeric(6, 2),
	"overtime_hours" numeric(6, 2) DEFAULT '0',
	"break_time" numeric(4, 2) DEFAULT '0',
	"materials_used" jsonb DEFAULT '[]',
	"equipment_used" jsonb DEFAULT '[]',
	"vehicles_used" jsonb DEFAULT '[]',
	"safety_incidents" jsonb DEFAULT '[]',
	"quality_issues" jsonb DEFAULT '[]',
	"safety_check_completed" boolean DEFAULT false,
	"ppe_compliance" boolean DEFAULT true,
	"weather_conditions" varchar(100),
	"temperature" numeric(4, 1),
	"work_stoppages" jsonb DEFAULT '[]',
	"customer_contacts" jsonb DEFAULT '[]',
	"customer_complaints" jsonb DEFAULT '[]',
	"customer_feedback" jsonb DEFAULT '[]',
	"work_photos" jsonb DEFAULT '[]',
	"progress_notes" text,
	"challenges_faced" text,
	"next_day_planning" text,
	"productivity_score" numeric(5, 2),
	"efficiency_rating" integer,
	"goal_achievement_percentage" integer,
	"metadata" jsonb DEFAULT '{}',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drop_number" varchar(50) NOT NULL,
	"project_id" uuid,
	"drop_type" varchar(50) DEFAULT 'aerial',
	"status" varchar(20) DEFAULT 'planned',
	"customer_count" integer DEFAULT 0,
	"total_length" numeric(10, 2),
	"start_latitude" numeric(10, 8),
	"start_longitude" numeric(11, 8),
	"end_latitude" numeric(10, 8),
	"end_longitude" numeric(11, 8),
	"cable_type" varchar(100),
	"fiber_count" integer,
	"splice_points" jsonb DEFAULT '[]',
	"equipment_required" jsonb DEFAULT '[]',
	"survey_date" date,
	"design_date" date,
	"approval_date" date,
	"construction_start_date" date,
	"completion_date" date,
	"assigned_surveyor" uuid,
	"assigned_designer" uuid,
	"assigned_constructor" uuid,
	"estimated_cost" numeric(15, 2),
	"actual_cost" numeric(15, 2),
	"documents" jsonb DEFAULT '[]',
	"survey_notes" text,
	"design_notes" text,
	"construction_notes" text,
	"quality_check_passed" boolean,
	"compliance_verified" boolean,
	"handover_date" date,
	"metadata" jsonb DEFAULT '{}',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "drops_drop_number_unique" UNIQUE("drop_number")
);
--> statement-breakpoint
CREATE TABLE "fiber_stringing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stringing_id" varchar(50) NOT NULL,
	"project_id" uuid,
	"drop_id" uuid,
	"section_name" varchar(255),
	"cable_type" varchar(100) NOT NULL,
	"fiber_count" integer NOT NULL,
	"length" numeric(10, 2) NOT NULL,
	"installation_type" varchar(50) DEFAULT 'aerial',
	"start_point" varchar(255),
	"end_point" varchar(255),
	"route" jsonb DEFAULT '[]',
	"status" varchar(20) DEFAULT 'planned',
	"scheduled_date" date,
	"start_date" date,
	"completion_date" date,
	"testing_date" date,
	"acceptance_date" date,
	"stringing_team" uuid,
	"testing_team" uuid,
	"supervisor" uuid,
	"tension_reading" numeric(8, 2),
	"sag_measurement" numeric(8, 2),
	"test_results" jsonb DEFAULT '{}',
	"attenuation_loss" numeric(6, 3),
	"pre_installation_check" boolean DEFAULT false,
	"post_installation_check" boolean DEFAULT false,
	"quality_score" integer,
	"work_photos" jsonb DEFAULT '[]',
	"test_documents" jsonb DEFAULT '[]',
	"notes" text,
	"issues" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "fiber_stringing_stringing_id_unique" UNIQUE("stringing_id")
);
--> statement-breakpoint
CREATE TABLE "home_installations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"installation_id" varchar(50) NOT NULL,
	"project_id" uuid,
	"drop_id" uuid,
	"customer_name" varchar(255) NOT NULL,
	"customer_phone" varchar(20),
	"customer_email" varchar(255),
	"service_address" text NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"service_type" varchar(50) DEFAULT 'residential',
	"package_type" varchar(100),
	"bandwidth_speed" varchar(50),
	"static_ip_required" boolean DEFAULT false,
	"scheduled_date" date,
	"time_slot" varchar(50),
	"estimated_duration" integer,
	"status" varchar(20) DEFAULT 'scheduled',
	"confirmation_date" timestamp,
	"start_time" timestamp,
	"completion_time" timestamp,
	"installation_technician" uuid,
	"backup_technician" uuid,
	"team_lead" uuid,
	"equipment_used" jsonb DEFAULT '[]',
	"materials_used" jsonb DEFAULT '[]',
	"serial_numbers" jsonb DEFAULT '{}',
	"fiber_connection_point" varchar(255),
	"internal_cabling" jsonb DEFAULT '{}',
	"router_placement" varchar(255),
	"signal_strength" numeric(5, 2),
	"speed_test_results" jsonb DEFAULT '{}',
	"pre_installation_survey" boolean DEFAULT false,
	"customer_walkthrough" boolean DEFAULT false,
	"quality_checklist" jsonb DEFAULT '{}',
	"customer_satisfaction_score" integer,
	"installation_cost" numeric(10, 2),
	"customer_payment" numeric(10, 2),
	"payment_method" varchar(50),
	"installation_photos" jsonb DEFAULT '[]',
	"customer_signature" text,
	"work_order_number" varchar(50),
	"notes" text,
	"issues" jsonb DEFAULT '[]',
	"follow_up_required" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "home_installations_installation_id_unique" UNIQUE("installation_id")
);
--> statement-breakpoint
CREATE TABLE "nokia_equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"equipment_id" varchar(50) NOT NULL,
	"serial_number" varchar(100) NOT NULL,
	"model_number" varchar(100) NOT NULL,
	"equipment_type" varchar(50) NOT NULL,
	"category" varchar(50),
	"software_version" varchar(50),
	"firmware_version" varchar(50),
	"hardware_revision" varchar(50),
	"part_number" varchar(100),
	"asset_tag" varchar(50),
	"purchase_order" varchar(50),
	"vendor" varchar(100) DEFAULT 'Nokia',
	"purchase_date" date,
	"purchase_cost" numeric(12, 2),
	"warranty_expiry" date,
	"project_id" uuid,
	"current_location" text,
	"installation_address" text,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"installation_date" date,
	"installed_by" uuid,
	"installation_type" varchar(50),
	"status" varchar(20) DEFAULT 'inventory',
	"operational_status" varchar(20),
	"last_status_update" timestamp,
	"ip_address" varchar(45),
	"mac_address" varchar(17),
	"vlan_configuration" jsonb DEFAULT '{}',
	"network_ports" jsonb DEFAULT '[]',
	"uptime" numeric(10, 2),
	"last_maintenance_date" date,
	"next_maintenance_date" date,
	"performance_metrics" jsonb DEFAULT '{}',
	"specifications" jsonb DEFAULT '{}',
	"port_count" integer,
	"power_consumption" numeric(8, 2),
	"operating_temperature" jsonb DEFAULT '{}',
	"connected_equipment" jsonb DEFAULT '[]',
	"parent_equipment" uuid,
	"child_equipment" jsonb DEFAULT '[]',
	"configuration_files" jsonb DEFAULT '[]',
	"manuals" jsonb DEFAULT '[]',
	"certificates" jsonb DEFAULT '[]',
	"compliance_standards" jsonb DEFAULT '[]',
	"maintenance_history" jsonb DEFAULT '[]',
	"incident_history" jsonb DEFAULT '[]',
	"replacement_history" jsonb DEFAULT '[]',
	"depreciation_schedule" jsonb DEFAULT '{}',
	"current_value" numeric(12, 2),
	"insurance_value" numeric(12, 2),
	"return_date" date,
	"disposal_date" date,
	"disposal_method" varchar(50),
	"recycling_info" jsonb DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "nokia_equipment_equipment_id_unique" UNIQUE("equipment_id"),
	CONSTRAINT "nokia_equipment_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
CREATE TABLE "one_map" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"address" text,
	"postal_code" varchar(20),
	"layer_type" varchar(50) NOT NULL,
	"feature_type" varchar(50),
	"feature_id" uuid,
	"project_id" uuid,
	"marker_type" varchar(50),
	"marker_color" varchar(20),
	"marker_icon" varchar(50),
	"marker_size" varchar(20) DEFAULT 'medium',
	"status" varchar(20) DEFAULT 'active',
	"is_visible" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"geometry_type" varchar(20),
	"coordinates" jsonb,
	"bounding_box" jsonb,
	"properties" jsonb DEFAULT '{}',
	"style_properties" jsonb DEFAULT '{}',
	"popup_title" varchar(255),
	"popup_content" text,
	"click_action" varchar(50),
	"cluster_group" varchar(50),
	"allow_clustering" boolean DEFAULT true,
	"cluster_radius" integer DEFAULT 50,
	"valid_from" timestamp,
	"valid_to" timestamp,
	"data_source" varchar(100),
	"accuracy" numeric(8, 2),
	"verification_status" varchar(20) DEFAULT 'unverified',
	"verification_date" date,
	"metadata" jsonb DEFAULT '{}',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" varchar(50) NOT NULL,
	"report_name" varchar(255) NOT NULL,
	"report_type" varchar(50) NOT NULL,
	"category" varchar(50),
	"project_id" uuid,
	"date_from" date,
	"date_to" date,
	"report_scope" jsonb DEFAULT '{}',
	"filters" jsonb DEFAULT '{}',
	"generated_by" uuid NOT NULL,
	"generation_date" timestamp DEFAULT now(),
	"status" varchar(20) DEFAULT 'generating',
	"report_data" jsonb DEFAULT '{}',
	"summary_metrics" jsonb DEFAULT '{}',
	"chart_data" jsonb DEFAULT '{}',
	"tables" jsonb DEFAULT '[]',
	"report_format" varchar(20) DEFAULT 'json',
	"file_size" integer,
	"file_path" text,
	"download_url" text,
	"is_public" boolean DEFAULT false,
	"shared_with" jsonb DEFAULT '[]',
	"access_level" varchar(20) DEFAULT 'private',
	"is_scheduled" boolean DEFAULT false,
	"schedule_frequency" varchar(20),
	"next_generation_date" timestamp,
	"email_recipients" jsonb DEFAULT '[]',
	"version" integer DEFAULT 1,
	"parent_report_id" uuid,
	"generation_time_seconds" numeric(8, 3),
	"query_count" integer,
	"data_points_count" integer,
	"expiry_date" timestamp,
	"is_archived" boolean DEFAULT false,
	"archive_date" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "reports_report_id_unique" UNIQUE("report_id")
);
--> statement-breakpoint
CREATE TABLE "boq_exceptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"boq_id" uuid NOT NULL,
	"boq_item_id" uuid NOT NULL,
	"project_id" varchar(255) NOT NULL,
	"exception_type" varchar(50) NOT NULL,
	"severity" varchar(10) DEFAULT 'medium' NOT NULL,
	"issue_description" text NOT NULL,
	"suggested_action" text,
	"system_suggestions" json,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"resolved_by" varchar(255),
	"resolved_at" timestamp,
	"resolution_notes" text,
	"resolution_action" varchar(50),
	"assigned_to" varchar(255),
	"assigned_at" timestamp,
	"priority" varchar(10) DEFAULT 'medium' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "boq_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"boq_id" uuid NOT NULL,
	"project_id" varchar(255) NOT NULL,
	"line_number" integer NOT NULL,
	"item_code" varchar(100),
	"description" text NOT NULL,
	"category" varchar(100),
	"subcategory" varchar(100),
	"quantity" numeric(15, 4) NOT NULL,
	"uom" varchar(20) NOT NULL,
	"unit_price" numeric(15, 2),
	"total_price" numeric(15, 2),
	"phase" varchar(100),
	"task" varchar(100),
	"site" varchar(100),
	"location" varchar(100),
	"catalog_item_id" varchar(255),
	"catalog_item_code" varchar(100),
	"catalog_item_name" text,
	"mapping_confidence" numeric(5, 2),
	"mapping_status" varchar(20) DEFAULT 'pending',
	"specifications" json,
	"technical_notes" text,
	"alternative_items" json,
	"procurement_status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "boqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(255) NOT NULL,
	"version" varchar(50) NOT NULL,
	"title" text,
	"description" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"mapping_status" varchar(20) DEFAULT 'pending',
	"mapping_confidence" numeric(5, 2),
	"uploaded_by" varchar(255) NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"file_name" text,
	"file_url" text,
	"file_size" integer,
	"approved_by" varchar(255),
	"approved_at" timestamp,
	"rejected_by" varchar(255),
	"rejected_at" timestamp,
	"rejection_reason" text,
	"item_count" integer DEFAULT 0,
	"mapped_items" integer DEFAULT 0,
	"unmapped_items" integer DEFAULT 0,
	"exceptions_count" integer DEFAULT 0,
	"total_estimated_value" numeric(15, 2),
	"currency" varchar(3) DEFAULT 'ZAR',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "boq_project_version_unique" UNIQUE("project_id","version")
);
--> statement-breakpoint
CREATE TABLE "quote_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"project_id" varchar(255) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"file_size" integer NOT NULL,
	"file_type" varchar(100) NOT NULL,
	"document_type" varchar(50) NOT NULL,
	"file_url" text NOT NULL,
	"file_path" text,
	"storage_provider" varchar(50) DEFAULT 'firebase',
	"uploaded_by" varchar(255) NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quote_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"rfq_item_id" uuid NOT NULL,
	"project_id" varchar(255) NOT NULL,
	"line_number" integer NOT NULL,
	"item_code" varchar(100),
	"description" text NOT NULL,
	"quoted_quantity" numeric(15, 4),
	"unit_price" numeric(15, 2) NOT NULL,
	"total_price" numeric(15, 2) NOT NULL,
	"discount_percentage" numeric(5, 2),
	"discount_amount" numeric(15, 2),
	"alternate_offered" boolean DEFAULT false,
	"alternate_description" text,
	"alternate_part_number" varchar(100),
	"alternate_unit_price" numeric(15, 2),
	"lead_time" integer,
	"minimum_order_quantity" numeric(15, 4),
	"packaging_unit" varchar(50),
	"manufacturer_name" varchar(255),
	"part_number" varchar(100),
	"model_number" varchar(100),
	"technical_notes" text,
	"compliance_certificates" json,
	"technical_compliance" boolean DEFAULT true,
	"commercial_score" numeric(5, 2),
	"technical_score" numeric(5, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfq_id" uuid NOT NULL,
	"supplier_id" varchar(255) NOT NULL,
	"supplier_invitation_id" uuid,
	"project_id" varchar(255) NOT NULL,
	"quote_number" varchar(100),
	"quote_reference" varchar(100),
	"status" varchar(20) DEFAULT 'draft',
	"submission_date" timestamp DEFAULT now(),
	"valid_until" timestamp NOT NULL,
	"total_value" numeric(15, 2) NOT NULL,
	"subtotal" numeric(15, 2),
	"tax_amount" numeric(15, 2),
	"discount_amount" numeric(15, 2),
	"currency" varchar(3) DEFAULT 'ZAR',
	"lead_time" integer,
	"payment_terms" text,
	"delivery_terms" text,
	"warranty_terms" text,
	"validity_period" integer,
	"notes" text,
	"terms" text,
	"conditions" text,
	"evaluation_score" numeric(5, 2),
	"technical_score" numeric(5, 2),
	"commercial_score" numeric(5, 2),
	"evaluation_notes" text,
	"is_winner" boolean DEFAULT false,
	"awarded_at" timestamp,
	"rejected_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rfq_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfq_id" uuid NOT NULL,
	"boq_item_id" uuid,
	"project_id" varchar(255) NOT NULL,
	"line_number" integer NOT NULL,
	"item_code" varchar(100),
	"description" text NOT NULL,
	"category" varchar(100),
	"quantity" numeric(15, 4) NOT NULL,
	"uom" varchar(20) NOT NULL,
	"budget_price" numeric(15, 2),
	"specifications" json,
	"technical_requirements" text,
	"acceptable_alternatives" json,
	"evaluation_weight" numeric(5, 2) DEFAULT '1.0',
	"is_critical_item" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rfqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(255) NOT NULL,
	"rfq_number" varchar(100) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"issue_date" timestamp,
	"response_deadline" timestamp NOT NULL,
	"extended_deadline" timestamp,
	"closed_at" timestamp,
	"created_by" varchar(255) NOT NULL,
	"issued_by" varchar(255),
	"payment_terms" text,
	"delivery_terms" text,
	"validity_period" integer,
	"currency" varchar(3) DEFAULT 'ZAR',
	"evaluation_criteria" json,
	"technical_requirements" text,
	"invited_suppliers" json,
	"responded_suppliers" json,
	"item_count" integer DEFAULT 0,
	"total_budget_estimate" numeric(15, 2),
	"lowest_quote_value" numeric(15, 2),
	"highest_quote_value" numeric(15, 2),
	"average_quote_value" numeric(15, 2),
	"awarded_at" timestamp,
	"awarded_to" varchar(255),
	"award_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "rfqs_rfq_number_unique" UNIQUE("rfq_number")
);
--> statement-breakpoint
CREATE TABLE "supplier_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfq_id" uuid NOT NULL,
	"supplier_id" varchar(255) NOT NULL,
	"project_id" varchar(255) NOT NULL,
	"supplier_name" varchar(255) NOT NULL,
	"supplier_email" varchar(255) NOT NULL,
	"contact_person" varchar(255),
	"invitation_status" varchar(20) DEFAULT 'sent',
	"invited_at" timestamp DEFAULT now(),
	"viewed_at" timestamp,
	"responded_at" timestamp,
	"declined_at" timestamp,
	"access_token" varchar(500),
	"token_expires_at" timestamp,
	"magic_link_token" varchar(500),
	"last_login_at" timestamp,
	"invitation_message" text,
	"decline_reason" text,
	"reminders_sent" integer DEFAULT 0,
	"last_reminder_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cable_drums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(255) NOT NULL,
	"stock_position_id" uuid,
	"drum_number" varchar(100) NOT NULL,
	"serial_number" varchar(100),
	"supplier_drum_id" varchar(100),
	"cable_type" varchar(100) NOT NULL,
	"cable_specification" text,
	"manufacturer_name" varchar(255),
	"part_number" varchar(100),
	"original_length" numeric(15, 4) NOT NULL,
	"current_length" numeric(15, 4) NOT NULL,
	"used_length" numeric(15, 4) DEFAULT '0',
	"drum_weight" numeric(10, 2),
	"cable_weight" numeric(10, 2),
	"drum_diameter" numeric(8, 2),
	"current_location" varchar(100),
	"drum_condition" varchar(20) DEFAULT 'good',
	"installation_status" varchar(20) DEFAULT 'available',
	"last_meter_reading" numeric(15, 4),
	"last_reading_date" timestamp,
	"last_used_date" timestamp,
	"test_certificate" text,
	"installation_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drum_usage_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drum_id" uuid NOT NULL,
	"project_id" varchar(255) NOT NULL,
	"usage_date" timestamp NOT NULL,
	"previous_reading" numeric(15, 4) NOT NULL,
	"current_reading" numeric(15, 4) NOT NULL,
	"used_length" numeric(15, 4) NOT NULL,
	"pole_number" varchar(50),
	"section_id" varchar(100),
	"work_order_id" varchar(100),
	"technician_id" varchar(255),
	"installation_type" varchar(20),
	"start_coordinates" json,
	"end_coordinates" json,
	"installation_notes" text,
	"quality_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_movement_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stock_movement_id" uuid NOT NULL,
	"stock_position_id" uuid,
	"project_id" varchar(255) NOT NULL,
	"item_code" varchar(100) NOT NULL,
	"description" text,
	"planned_quantity" numeric(15, 4) NOT NULL,
	"actual_quantity" numeric(15, 4),
	"uom" varchar(20) NOT NULL,
	"unit_cost" numeric(15, 2),
	"total_cost" numeric(15, 2),
	"lot_numbers" json,
	"serial_numbers" json,
	"expiry_date" timestamp,
	"quality_check_required" boolean DEFAULT false,
	"quality_check_status" varchar(20),
	"quality_check_notes" text,
	"item_status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(255) NOT NULL,
	"movement_type" varchar(20) NOT NULL,
	"reference_number" varchar(100) NOT NULL,
	"reference_type" varchar(50),
	"reference_id" varchar(255),
	"from_location" varchar(100),
	"to_location" varchar(100),
	"from_project_id" varchar(255),
	"to_project_id" varchar(255),
	"status" varchar(20) DEFAULT 'pending',
	"movement_date" timestamp NOT NULL,
	"confirmed_at" timestamp,
	"requested_by" varchar(255),
	"authorized_by" varchar(255),
	"processed_by" varchar(255),
	"notes" text,
	"reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(255) NOT NULL,
	"item_code" varchar(100) NOT NULL,
	"item_name" text NOT NULL,
	"description" text,
	"category" varchar(100),
	"uom" varchar(20) NOT NULL,
	"on_hand_quantity" numeric(15, 4) DEFAULT '0',
	"reserved_quantity" numeric(15, 4) DEFAULT '0',
	"available_quantity" numeric(15, 4) DEFAULT '0',
	"in_transit_quantity" numeric(15, 4) DEFAULT '0',
	"average_unit_cost" numeric(15, 2),
	"total_value" numeric(15, 2),
	"warehouse_location" varchar(100),
	"bin_location" varchar(50),
	"reorder_level" numeric(15, 4),
	"max_stock_level" numeric(15, 4),
	"economic_order_quantity" numeric(15, 4),
	"last_movement_date" timestamp,
	"last_count_date" timestamp,
	"next_count_due" timestamp,
	"is_active" boolean DEFAULT true,
	"stock_status" varchar(20) DEFAULT 'normal',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "stock_position_project_item_unique" UNIQUE("project_id","item_code")
);
--> statement-breakpoint
ALTER TABLE "contractor_documents" ADD CONSTRAINT "contractor_documents_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contractor_teams" ADD CONSTRAINT "contractor_teams_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_assignments" ADD CONSTRAINT "project_assignments_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_assignments" ADD CONSTRAINT "project_assignments_team_id_contractor_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."contractor_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_contractor_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."contractor_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_organizer_users_id_fk" FOREIGN KEY ("organizer") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poles" ADD CONSTRAINT "poles_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poles" ADD CONSTRAINT "poles_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_project_manager_staff_id_fk" FOREIGN KEY ("project_manager") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_team_lead_staff_id_fk" FOREIGN KEY ("team_lead") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sow" ADD CONSTRAINT "sow_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sow" ADD CONSTRAINT "sow_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sow" ADD CONSTRAINT "sow_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sow" ADD CONSTRAINT "sow_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_reports_to_staff_id_fk" FOREIGN KEY ("reports_to") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_assigned_to_staff_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_progress" ADD CONSTRAINT "daily_progress_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_progress" ADD CONSTRAINT "daily_progress_team_lead_staff_id_fk" FOREIGN KEY ("team_lead") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_progress" ADD CONSTRAINT "daily_progress_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drops" ADD CONSTRAINT "drops_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drops" ADD CONSTRAINT "drops_assigned_surveyor_staff_id_fk" FOREIGN KEY ("assigned_surveyor") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drops" ADD CONSTRAINT "drops_assigned_designer_staff_id_fk" FOREIGN KEY ("assigned_designer") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drops" ADD CONSTRAINT "drops_assigned_constructor_staff_id_fk" FOREIGN KEY ("assigned_constructor") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drops" ADD CONSTRAINT "drops_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiber_stringing" ADD CONSTRAINT "fiber_stringing_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiber_stringing" ADD CONSTRAINT "fiber_stringing_drop_id_drops_id_fk" FOREIGN KEY ("drop_id") REFERENCES "public"."drops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiber_stringing" ADD CONSTRAINT "fiber_stringing_stringing_team_staff_id_fk" FOREIGN KEY ("stringing_team") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiber_stringing" ADD CONSTRAINT "fiber_stringing_testing_team_staff_id_fk" FOREIGN KEY ("testing_team") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiber_stringing" ADD CONSTRAINT "fiber_stringing_supervisor_staff_id_fk" FOREIGN KEY ("supervisor") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiber_stringing" ADD CONSTRAINT "fiber_stringing_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "home_installations" ADD CONSTRAINT "home_installations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "home_installations" ADD CONSTRAINT "home_installations_drop_id_drops_id_fk" FOREIGN KEY ("drop_id") REFERENCES "public"."drops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "home_installations" ADD CONSTRAINT "home_installations_installation_technician_staff_id_fk" FOREIGN KEY ("installation_technician") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "home_installations" ADD CONSTRAINT "home_installations_backup_technician_staff_id_fk" FOREIGN KEY ("backup_technician") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "home_installations" ADD CONSTRAINT "home_installations_team_lead_staff_id_fk" FOREIGN KEY ("team_lead") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "home_installations" ADD CONSTRAINT "home_installations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nokia_equipment" ADD CONSTRAINT "nokia_equipment_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nokia_equipment" ADD CONSTRAINT "nokia_equipment_installed_by_staff_id_fk" FOREIGN KEY ("installed_by") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nokia_equipment" ADD CONSTRAINT "nokia_equipment_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "one_map" ADD CONSTRAINT "one_map_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "one_map" ADD CONSTRAINT "one_map_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boq_exceptions" ADD CONSTRAINT "boq_exceptions_boq_id_boqs_id_fk" FOREIGN KEY ("boq_id") REFERENCES "public"."boqs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boq_exceptions" ADD CONSTRAINT "boq_exceptions_boq_item_id_boq_items_id_fk" FOREIGN KEY ("boq_item_id") REFERENCES "public"."boq_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boq_items" ADD CONSTRAINT "boq_items_boq_id_boqs_id_fk" FOREIGN KEY ("boq_id") REFERENCES "public"."boqs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_documents" ADD CONSTRAINT "quote_documents_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_rfq_item_id_rfq_items_id_fk" FOREIGN KEY ("rfq_item_id") REFERENCES "public"."rfq_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_supplier_invitation_id_supplier_invitations_id_fk" FOREIGN KEY ("supplier_invitation_id") REFERENCES "public"."supplier_invitations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_items" ADD CONSTRAINT "rfq_items_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_invitations" ADD CONSTRAINT "supplier_invitations_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cable_drums" ADD CONSTRAINT "cable_drums_stock_position_id_stock_positions_id_fk" FOREIGN KEY ("stock_position_id") REFERENCES "public"."stock_positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drum_usage_history" ADD CONSTRAINT "drum_usage_history_drum_id_cable_drums_id_fk" FOREIGN KEY ("drum_id") REFERENCES "public"."cable_drums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movement_items" ADD CONSTRAINT "stock_movement_items_stock_movement_id_stock_movements_id_fk" FOREIGN KEY ("stock_movement_id") REFERENCES "public"."stock_movements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movement_items" ADD CONSTRAINT "stock_movement_items_stock_position_id_stock_positions_id_fk" FOREIGN KEY ("stock_position_id") REFERENCES "public"."stock_positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_user_idx" ON "audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_timestamp_idx" ON "audit_log" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "client_analytics_id_idx" ON "client_analytics" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "client_category_idx" ON "client_analytics" USING btree ("client_category");--> statement-breakpoint
CREATE INDEX "project_finance_idx" ON "financial_transactions" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "transaction_date_idx" ON "financial_transactions" USING btree ("transaction_date");--> statement-breakpoint
CREATE INDEX "finance_status_idx" ON "financial_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "project_metric_idx" ON "kpi_metrics" USING btree ("project_id","metric_type");--> statement-breakpoint
CREATE INDEX "date_idx" ON "kpi_metrics" USING btree ("recorded_date");--> statement-breakpoint
CREATE INDEX "project_material_idx" ON "material_usage" USING btree ("project_id","material_type");--> statement-breakpoint
CREATE INDEX "material_usage_date_idx" ON "material_usage" USING btree ("usage_date");--> statement-breakpoint
CREATE INDEX "project_id_idx" ON "project_analytics" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "client_id_idx" ON "project_analytics" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "report_type_idx" ON "report_cache" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "expiry_idx" ON "report_cache" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "staff_project_idx" ON "staff_performance" USING btree ("staff_id","project_id");--> statement-breakpoint
CREATE INDEX "staff_period_idx" ON "staff_performance" USING btree ("period_start","period_end");--> statement-breakpoint
CREATE INDEX "contractor_doc_idx" ON "contractor_documents" USING btree ("contractor_id");--> statement-breakpoint
CREATE INDEX "doc_type_idx" ON "contractor_documents" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "contractor_doc_expiry_idx" ON "contractor_documents" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "contractor_team_idx" ON "contractor_teams" USING btree ("contractor_id");--> statement-breakpoint
CREATE INDEX "team_type_idx" ON "contractor_teams" USING btree ("team_type");--> statement-breakpoint
CREATE INDEX "contractor_reg_number_idx" ON "contractors" USING btree ("registration_number");--> statement-breakpoint
CREATE INDEX "contractor_status_idx" ON "contractors" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contractor_rag_idx" ON "contractors" USING btree ("rag_overall");--> statement-breakpoint
CREATE INDEX "contractor_email_idx" ON "contractors" USING btree ("email");--> statement-breakpoint
CREATE INDEX "project_contractor_idx" ON "project_assignments" USING btree ("project_id","contractor_id");--> statement-breakpoint
CREATE INDEX "contractor_assignment_idx" ON "project_assignments" USING btree ("contractor_id");--> statement-breakpoint
CREATE INDEX "assignment_status_idx" ON "project_assignments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "team_member_idx" ON "team_members" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "contractor_member_idx" ON "team_members" USING btree ("contractor_id");--> statement-breakpoint
CREATE INDEX "member_id_number_idx" ON "team_members" USING btree ("id_number");--> statement-breakpoint
CREATE INDEX "clients_company_name_idx" ON "clients" USING btree ("company_name");--> statement-breakpoint
CREATE INDEX "clients_status_idx" ON "clients" USING btree ("status");--> statement-breakpoint
CREATE INDEX "clients_type_idx" ON "clients" USING btree ("client_type");--> statement-breakpoint
CREATE INDEX "meetings_project_idx" ON "meetings" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "meetings_organizer_idx" ON "meetings" USING btree ("organizer");--> statement-breakpoint
CREATE INDEX "meetings_start_time_idx" ON "meetings" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "meetings_status_idx" ON "meetings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "poles_number_idx" ON "poles" USING btree ("pole_number");--> statement-breakpoint
CREATE INDEX "poles_project_idx" ON "poles" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "poles_status_idx" ON "poles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "projects_code_idx" ON "projects" USING btree ("project_code");--> statement-breakpoint
CREATE INDEX "projects_client_idx" ON "projects" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "projects_manager_idx" ON "projects" USING btree ("project_manager");--> statement-breakpoint
CREATE INDEX "sow_number_idx" ON "sow" USING btree ("sow_number");--> statement-breakpoint
CREATE INDEX "sow_project_idx" ON "sow" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "sow_client_idx" ON "sow" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "sow_status_idx" ON "sow" USING btree ("status");--> statement-breakpoint
CREATE INDEX "staff_employee_id_idx" ON "staff" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "staff_email_idx" ON "staff" USING btree ("email");--> statement-breakpoint
CREATE INDEX "staff_department_idx" ON "staff" USING btree ("department");--> statement-breakpoint
CREATE INDEX "staff_status_idx" ON "staff" USING btree ("status");--> statement-breakpoint
CREATE INDEX "staff_reports_to_idx" ON "staff" USING btree ("reports_to");--> statement-breakpoint
CREATE INDEX "tasks_project_idx" ON "tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "tasks_assigned_to_idx" ON "tasks" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tasks_priority_idx" ON "tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "tasks_due_date_idx" ON "tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "action_items_id_idx" ON "action_items" USING btree ("action_id");--> statement-breakpoint
CREATE INDEX "action_items_project_idx" ON "action_items" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "action_items_assigned_to_idx" ON "action_items" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "action_items_status_idx" ON "action_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "action_items_priority_idx" ON "action_items" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "action_items_due_date_idx" ON "action_items" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "action_items_related_table_idx" ON "action_items" USING btree ("related_table","related_id");--> statement-breakpoint
CREATE INDEX "daily_progress_project_date_idx" ON "daily_progress" USING btree ("project_id","work_date");--> statement-breakpoint
CREATE INDEX "daily_progress_work_date_idx" ON "daily_progress" USING btree ("work_date");--> statement-breakpoint
CREATE INDEX "daily_progress_team_lead_idx" ON "daily_progress" USING btree ("team_lead");--> statement-breakpoint
CREATE INDEX "daily_progress_work_type_idx" ON "daily_progress" USING btree ("work_type");--> statement-breakpoint
CREATE INDEX "drops_number_idx" ON "drops" USING btree ("drop_number");--> statement-breakpoint
CREATE INDEX "drops_project_idx" ON "drops" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "drops_status_idx" ON "drops" USING btree ("status");--> statement-breakpoint
CREATE INDEX "drops_surveyor_idx" ON "drops" USING btree ("assigned_surveyor");--> statement-breakpoint
CREATE INDEX "fiber_stringing_id_idx" ON "fiber_stringing" USING btree ("stringing_id");--> statement-breakpoint
CREATE INDEX "fiber_stringing_project_idx" ON "fiber_stringing" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "fiber_stringing_drop_idx" ON "fiber_stringing" USING btree ("drop_id");--> statement-breakpoint
CREATE INDEX "fiber_stringing_status_idx" ON "fiber_stringing" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fiber_stringing_team_idx" ON "fiber_stringing" USING btree ("stringing_team");--> statement-breakpoint
CREATE INDEX "home_installations_id_idx" ON "home_installations" USING btree ("installation_id");--> statement-breakpoint
CREATE INDEX "home_installations_project_idx" ON "home_installations" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "home_installations_drop_idx" ON "home_installations" USING btree ("drop_id");--> statement-breakpoint
CREATE INDEX "home_installations_status_idx" ON "home_installations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "home_installations_technician_idx" ON "home_installations" USING btree ("installation_technician");--> statement-breakpoint
CREATE INDEX "home_installations_scheduled_date_idx" ON "home_installations" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "nokia_equipment_id_idx" ON "nokia_equipment" USING btree ("equipment_id");--> statement-breakpoint
CREATE INDEX "nokia_equipment_serial_idx" ON "nokia_equipment" USING btree ("serial_number");--> statement-breakpoint
CREATE INDEX "nokia_equipment_model_idx" ON "nokia_equipment" USING btree ("model_number");--> statement-breakpoint
CREATE INDEX "nokia_equipment_type_idx" ON "nokia_equipment" USING btree ("equipment_type");--> statement-breakpoint
CREATE INDEX "nokia_equipment_project_idx" ON "nokia_equipment" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "nokia_equipment_status_idx" ON "nokia_equipment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "nokia_equipment_location_idx" ON "nokia_equipment" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "one_map_coordinates_idx" ON "one_map" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "one_map_project_idx" ON "one_map" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "one_map_layer_type_idx" ON "one_map" USING btree ("layer_type");--> statement-breakpoint
CREATE INDEX "one_map_feature_idx" ON "one_map" USING btree ("feature_type","feature_id");--> statement-breakpoint
CREATE INDEX "one_map_status_idx" ON "one_map" USING btree ("status");--> statement-breakpoint
CREATE INDEX "one_map_visibility_idx" ON "one_map" USING btree ("is_visible");--> statement-breakpoint
CREATE INDEX "reports_id_idx" ON "reports" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "reports_project_idx" ON "reports" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "reports_type_idx" ON "reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "reports_generated_by_idx" ON "reports" USING btree ("generated_by");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reports_generation_date_idx" ON "reports" USING btree ("generation_date");--> statement-breakpoint
CREATE INDEX "reports_expiry_date_idx" ON "reports" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "boq_exception_boq_id_idx" ON "boq_exceptions" USING btree ("boq_id");--> statement-breakpoint
CREATE INDEX "boq_exception_boq_item_id_idx" ON "boq_exceptions" USING btree ("boq_item_id");--> statement-breakpoint
CREATE INDEX "boq_exception_status_idx" ON "boq_exceptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "boq_exception_severity_idx" ON "boq_exceptions" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "boq_exception_assigned_to_idx" ON "boq_exceptions" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "boq_item_boq_id_idx" ON "boq_items" USING btree ("boq_id");--> statement-breakpoint
CREATE INDEX "boq_item_project_id_idx" ON "boq_items" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "boq_item_code_idx" ON "boq_items" USING btree ("item_code");--> statement-breakpoint
CREATE INDEX "boq_item_category_idx" ON "boq_items" USING btree ("category");--> statement-breakpoint
CREATE INDEX "boq_item_mapping_status_idx" ON "boq_items" USING btree ("mapping_status");--> statement-breakpoint
CREATE INDEX "boq_item_procurement_status_idx" ON "boq_items" USING btree ("procurement_status");--> statement-breakpoint
CREATE INDEX "boq_project_id_idx" ON "boqs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "boq_status_idx" ON "boqs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "boq_uploaded_by_idx" ON "boqs" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "quote_document_quote_id_idx" ON "quote_documents" USING btree ("quote_id");--> statement-breakpoint
CREATE INDEX "quote_document_type_idx" ON "quote_documents" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "quote_item_quote_id_idx" ON "quote_items" USING btree ("quote_id");--> statement-breakpoint
CREATE INDEX "quote_item_rfq_item_id_idx" ON "quote_items" USING btree ("rfq_item_id");--> statement-breakpoint
CREATE INDEX "quote_item_line_number_idx" ON "quote_items" USING btree ("line_number");--> statement-breakpoint
CREATE INDEX "quote_rfq_id_idx" ON "quotes" USING btree ("rfq_id");--> statement-breakpoint
CREATE INDEX "quote_supplier_id_idx" ON "quotes" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "quote_status_idx" ON "quotes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "quote_submission_date_idx" ON "quotes" USING btree ("submission_date");--> statement-breakpoint
CREATE INDEX "quote_is_winner_idx" ON "quotes" USING btree ("is_winner");--> statement-breakpoint
CREATE INDEX "rfq_item_rfq_id_idx" ON "rfq_items" USING btree ("rfq_id");--> statement-breakpoint
CREATE INDEX "rfq_item_project_id_idx" ON "rfq_items" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "rfq_item_boq_item_id_idx" ON "rfq_items" USING btree ("boq_item_id");--> statement-breakpoint
CREATE INDEX "rfq_project_id_idx" ON "rfqs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "rfq_status_idx" ON "rfqs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "rfq_number_idx" ON "rfqs" USING btree ("rfq_number");--> statement-breakpoint
CREATE INDEX "rfq_deadline_idx" ON "rfqs" USING btree ("response_deadline");--> statement-breakpoint
CREATE INDEX "supplier_invitation_rfq_id_idx" ON "supplier_invitations" USING btree ("rfq_id");--> statement-breakpoint
CREATE INDEX "supplier_invitation_supplier_id_idx" ON "supplier_invitations" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "supplier_invitation_status_idx" ON "supplier_invitations" USING btree ("invitation_status");--> statement-breakpoint
CREATE INDEX "supplier_invitation_access_token_idx" ON "supplier_invitations" USING btree ("access_token");--> statement-breakpoint
CREATE INDEX "cable_drum_project_idx" ON "cable_drums" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "cable_drum_number_idx" ON "cable_drums" USING btree ("drum_number");--> statement-breakpoint
CREATE INDEX "cable_drum_type_idx" ON "cable_drums" USING btree ("cable_type");--> statement-breakpoint
CREATE INDEX "cable_drum_status_idx" ON "cable_drums" USING btree ("installation_status");--> statement-breakpoint
CREATE INDEX "cable_drum_location_idx" ON "cable_drums" USING btree ("current_location");--> statement-breakpoint
CREATE INDEX "drum_usage_drum_id_idx" ON "drum_usage_history" USING btree ("drum_id");--> statement-breakpoint
CREATE INDEX "drum_usage_project_id_idx" ON "drum_usage_history" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "drum_usage_date_idx" ON "drum_usage_history" USING btree ("usage_date");--> statement-breakpoint
CREATE INDEX "drum_usage_technician_idx" ON "drum_usage_history" USING btree ("technician_id");--> statement-breakpoint
CREATE INDEX "stock_movement_item_movement_id_idx" ON "stock_movement_items" USING btree ("stock_movement_id");--> statement-breakpoint
CREATE INDEX "stock_movement_item_code_idx" ON "stock_movement_items" USING btree ("item_code");--> statement-breakpoint
CREATE INDEX "stock_movement_item_status_idx" ON "stock_movement_items" USING btree ("item_status");--> statement-breakpoint
CREATE INDEX "stock_movement_project_idx" ON "stock_movements" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "stock_movement_type_idx" ON "stock_movements" USING btree ("movement_type");--> statement-breakpoint
CREATE INDEX "stock_movement_reference_idx" ON "stock_movements" USING btree ("reference_number");--> statement-breakpoint
CREATE INDEX "stock_movement_status_idx" ON "stock_movements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "stock_movement_date_idx" ON "stock_movements" USING btree ("movement_date");--> statement-breakpoint
CREATE INDEX "stock_position_project_idx" ON "stock_positions" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "stock_position_item_code_idx" ON "stock_positions" USING btree ("project_id","item_code");--> statement-breakpoint
CREATE INDEX "stock_position_category_idx" ON "stock_positions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "stock_position_status_idx" ON "stock_positions" USING btree ("stock_status");