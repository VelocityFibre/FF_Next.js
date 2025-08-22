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
CREATE TABLE "boq_exceptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"boq_id" uuid NOT NULL,
	"boq_item_id" uuid NOT NULL,
	"project_id" varchar(255) NOT NULL,
	"exception_type" varchar(50) NOT NULL,
	"severity" varchar(20) DEFAULT 'medium' NOT NULL,
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
	"priority" varchar(20) DEFAULT 'medium',
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
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "boq_item_line_number_unique" UNIQUE("boq_id","line_number")
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
	"original_length" numeric(10, 2) NOT NULL,
	"current_length" numeric(10, 2) NOT NULL,
	"used_length" numeric(10, 2) DEFAULT '0',
	"drum_weight" numeric(10, 2),
	"cable_weight" numeric(10, 2),
	"drum_diameter" numeric(8, 2),
	"current_location" varchar(100),
	"drum_condition" varchar(20) DEFAULT 'good',
	"installation_status" varchar(20) DEFAULT 'available',
	"last_meter_reading" numeric(10, 2),
	"last_reading_date" timestamp,
	"last_used_date" timestamp,
	"test_certificate" text,
	"installation_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "cable_drum_project_number_unique" UNIQUE("project_id","drum_number")
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
CREATE TABLE "drum_usage_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drum_id" uuid NOT NULL,
	"project_id" varchar(255) NOT NULL,
	"usage_date" timestamp NOT NULL,
	"pole_number" varchar(100),
	"section_id" varchar(255),
	"work_order_id" varchar(255),
	"previous_reading" numeric(10, 2) NOT NULL,
	"current_reading" numeric(10, 2) NOT NULL,
	"used_length" numeric(10, 2) NOT NULL,
	"technician_id" varchar(255),
	"technician_name" text,
	"equipment_used" text,
	"installation_type" varchar(50),
	"installation_notes" text,
	"quality_notes" text,
	"start_coordinates" json,
	"end_coordinates" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "financial_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
	"notes" text,
	"attachments" json,
	"created_by" varchar(255),
	"approved_by" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoice_number_unique" UNIQUE("invoice_number")
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
	"material_id" varchar(255) NOT NULL,
	"material_name" text NOT NULL,
	"category" varchar(100),
	"planned_quantity" numeric(15, 4),
	"used_quantity" numeric(15, 4) NOT NULL,
	"wasted_quantity" numeric(15, 4),
	"unit" varchar(50),
	"unit_cost" numeric(15, 2),
	"total_cost" numeric(15, 2),
	"pole_number" varchar(100),
	"section_id" varchar(255),
	"usage_date" timestamp NOT NULL,
	"recorded_by" varchar(255),
	"created_at" timestamp DEFAULT now()
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
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quote_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"quote_item_id" uuid,
	"document_type" varchar(50) NOT NULL,
	"document_name" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer,
	"mime_type" varchar(100),
	"description" text,
	"is_required" boolean DEFAULT false,
	"valid_until" timestamp,
	"uploaded_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
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
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "quote_item_line_unique" UNIQUE("quote_id","line_number")
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
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
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
CREATE TABLE "report_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type" varchar(100) NOT NULL,
	"report_name" text NOT NULL,
	"filters" json,
	"project_id" varchar(255),
	"date_from" timestamp,
	"date_to" timestamp,
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
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "rfq_item_line_unique" UNIQUE("rfq_id","line_number")
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
CREATE TABLE "staff_performance" (
	"id" serial PRIMARY KEY NOT NULL,
	"staff_id" varchar(255) NOT NULL,
	"staff_name" text NOT NULL,
	"role" varchar(100),
	"tasks_completed" integer DEFAULT 0,
	"hours_worked" numeric(10, 2),
	"productivity_score" numeric(5, 2),
	"quality_score" numeric(5, 2),
	"attendance_rate" numeric(5, 2),
	"project_id" varchar(255),
	"team_id" varchar(255),
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"period_type" varchar(50),
	"overtime_hours" numeric(10, 2),
	"incident_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_movement_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"movement_id" uuid NOT NULL,
	"stock_position_id" uuid,
	"project_id" varchar(255) NOT NULL,
	"item_code" varchar(100) NOT NULL,
	"item_name" text NOT NULL,
	"description" text,
	"uom" varchar(20) NOT NULL,
	"planned_quantity" numeric(15, 4) NOT NULL,
	"actual_quantity" numeric(15, 4),
	"received_quantity" numeric(15, 4),
	"unit_cost" numeric(15, 2),
	"total_cost" numeric(15, 2),
	"lot_numbers" json,
	"serial_numbers" json,
	"item_status" varchar(20) DEFAULT 'pending',
	"quality_check_required" boolean DEFAULT false,
	"quality_check_status" varchar(20),
	"quality_notes" text,
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
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
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
CREATE TABLE "supplier_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfq_id" uuid NOT NULL,
	"supplier_id" varchar(255) NOT NULL,
	"project_id" varchar(255) NOT NULL,
	"supplier_name" text NOT NULL,
	"supplier_email" varchar(255) NOT NULL,
	"contact_person" text,
	"invitation_status" varchar(20) DEFAULT 'sent' NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"viewed_at" timestamp,
	"responded_at" timestamp,
	"declined_at" timestamp,
	"access_token" varchar(255),
	"token_expires_at" timestamp,
	"magic_link_token" varchar(255),
	"last_login_at" timestamp,
	"invitation_message" text,
	"decline_reason" text,
	"reminders_sent" integer DEFAULT 0,
	"last_reminder_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "supplier_invitations_access_token_unique" UNIQUE("access_token"),
	CONSTRAINT "rfq_supplier_unique" UNIQUE("rfq_id","supplier_id")
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
ALTER TABLE "boq_exceptions" ADD CONSTRAINT "boq_exceptions_boq_id_boqs_id_fk" FOREIGN KEY ("boq_id") REFERENCES "public"."boqs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boq_exceptions" ADD CONSTRAINT "boq_exceptions_boq_item_id_boq_items_id_fk" FOREIGN KEY ("boq_item_id") REFERENCES "public"."boq_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boq_items" ADD CONSTRAINT "boq_items_boq_id_boqs_id_fk" FOREIGN KEY ("boq_id") REFERENCES "public"."boqs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cable_drums" ADD CONSTRAINT "cable_drums_stock_position_id_stock_positions_id_fk" FOREIGN KEY ("stock_position_id") REFERENCES "public"."stock_positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contractor_documents" ADD CONSTRAINT "contractor_documents_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contractor_teams" ADD CONSTRAINT "contractor_teams_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drum_usage_history" ADD CONSTRAINT "drum_usage_history_drum_id_cable_drums_id_fk" FOREIGN KEY ("drum_id") REFERENCES "public"."cable_drums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_assignments" ADD CONSTRAINT "project_assignments_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_assignments" ADD CONSTRAINT "project_assignments_team_id_contractor_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."contractor_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_documents" ADD CONSTRAINT "quote_documents_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_documents" ADD CONSTRAINT "quote_documents_quote_item_id_quote_items_id_fk" FOREIGN KEY ("quote_item_id") REFERENCES "public"."quote_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_rfq_item_id_rfq_items_id_fk" FOREIGN KEY ("rfq_item_id") REFERENCES "public"."rfq_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_supplier_invitation_id_supplier_invitations_id_fk" FOREIGN KEY ("supplier_invitation_id") REFERENCES "public"."supplier_invitations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_items" ADD CONSTRAINT "rfq_items_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_items" ADD CONSTRAINT "rfq_items_boq_item_id_boq_items_id_fk" FOREIGN KEY ("boq_item_id") REFERENCES "public"."boq_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movement_items" ADD CONSTRAINT "stock_movement_items_movement_id_stock_movements_id_fk" FOREIGN KEY ("movement_id") REFERENCES "public"."stock_movements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movement_items" ADD CONSTRAINT "stock_movement_items_stock_position_id_stock_positions_id_fk" FOREIGN KEY ("stock_position_id") REFERENCES "public"."stock_positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_invitations" ADD CONSTRAINT "supplier_invitations_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_contractor_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."contractor_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_user_idx" ON "audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_timestamp_idx" ON "audit_log" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "boq_exception_boq_id_idx" ON "boq_exceptions" USING btree ("boq_id");--> statement-breakpoint
CREATE INDEX "boq_exception_item_id_idx" ON "boq_exceptions" USING btree ("boq_item_id");--> statement-breakpoint
CREATE INDEX "boq_exception_status_idx" ON "boq_exceptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "boq_exception_assigned_idx" ON "boq_exceptions" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "boq_item_boq_id_idx" ON "boq_items" USING btree ("boq_id");--> statement-breakpoint
CREATE INDEX "boq_item_project_id_idx" ON "boq_items" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "boq_item_line_number_idx" ON "boq_items" USING btree ("boq_id","line_number");--> statement-breakpoint
CREATE INDEX "boq_item_catalog_mapping_idx" ON "boq_items" USING btree ("catalog_item_id");--> statement-breakpoint
CREATE INDEX "boq_item_procurement_status_idx" ON "boq_items" USING btree ("procurement_status");--> statement-breakpoint
CREATE INDEX "boq_project_id_idx" ON "boqs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "boq_status_idx" ON "boqs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "boq_uploaded_by_idx" ON "boqs" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "cable_drum_project_idx" ON "cable_drums" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "cable_drum_number_idx" ON "cable_drums" USING btree ("project_id","drum_number");--> statement-breakpoint
CREATE INDEX "cable_drum_serial_idx" ON "cable_drums" USING btree ("serial_number");--> statement-breakpoint
CREATE INDEX "cable_drum_location_idx" ON "cable_drums" USING btree ("current_location");--> statement-breakpoint
CREATE INDEX "cable_drum_status_idx" ON "cable_drums" USING btree ("installation_status");--> statement-breakpoint
CREATE INDEX "client_analytics_id_idx" ON "client_analytics" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "client_category_idx" ON "client_analytics" USING btree ("client_category");--> statement-breakpoint
CREATE INDEX "contractor_doc_idx" ON "contractor_documents" USING btree ("contractor_id");--> statement-breakpoint
CREATE INDEX "doc_type_idx" ON "contractor_documents" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "contractor_doc_expiry_idx" ON "contractor_documents" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "contractor_team_idx" ON "contractor_teams" USING btree ("contractor_id");--> statement-breakpoint
CREATE INDEX "team_type_idx" ON "contractor_teams" USING btree ("team_type");--> statement-breakpoint
CREATE INDEX "contractor_reg_number_idx" ON "contractors" USING btree ("registration_number");--> statement-breakpoint
CREATE INDEX "contractor_status_idx" ON "contractors" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contractor_rag_idx" ON "contractors" USING btree ("rag_overall");--> statement-breakpoint
CREATE INDEX "contractor_email_idx" ON "contractors" USING btree ("email");--> statement-breakpoint
CREATE INDEX "drum_usage_drum_id_idx" ON "drum_usage_history" USING btree ("drum_id");--> statement-breakpoint
CREATE INDEX "drum_usage_project_idx" ON "drum_usage_history" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "drum_usage_date_idx" ON "drum_usage_history" USING btree ("usage_date");--> statement-breakpoint
CREATE INDEX "drum_usage_pole_idx" ON "drum_usage_history" USING btree ("pole_number");--> statement-breakpoint
CREATE INDEX "financial_project_idx" ON "financial_transactions" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "financial_client_idx" ON "financial_transactions" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "financial_status_idx" ON "financial_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "project_metric_idx" ON "kpi_metrics" USING btree ("project_id","metric_type");--> statement-breakpoint
CREATE INDEX "date_idx" ON "kpi_metrics" USING btree ("recorded_date");--> statement-breakpoint
CREATE INDEX "project_material_idx" ON "material_usage" USING btree ("project_id","material_id");--> statement-breakpoint
CREATE INDEX "usage_date_idx" ON "material_usage" USING btree ("usage_date");--> statement-breakpoint
CREATE INDEX "project_id_idx" ON "project_analytics" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "client_id_idx" ON "project_analytics" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "project_contractor_idx" ON "project_assignments" USING btree ("project_id","contractor_id");--> statement-breakpoint
CREATE INDEX "contractor_assignment_idx" ON "project_assignments" USING btree ("contractor_id");--> statement-breakpoint
CREATE INDEX "assignment_status_idx" ON "project_assignments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "quote_document_quote_id_idx" ON "quote_documents" USING btree ("quote_id");--> statement-breakpoint
CREATE INDEX "quote_document_item_id_idx" ON "quote_documents" USING btree ("quote_item_id");--> statement-breakpoint
CREATE INDEX "quote_document_type_idx" ON "quote_documents" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "quote_item_quote_id_idx" ON "quote_items" USING btree ("quote_id");--> statement-breakpoint
CREATE INDEX "quote_item_rfq_reference_idx" ON "quote_items" USING btree ("rfq_item_id");--> statement-breakpoint
CREATE INDEX "quote_rfq_id_idx" ON "quotes" USING btree ("rfq_id");--> statement-breakpoint
CREATE INDEX "quote_supplier_id_idx" ON "quotes" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "quote_status_idx" ON "quotes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "quote_submission_date_idx" ON "quotes" USING btree ("submission_date");--> statement-breakpoint
CREATE INDEX "report_type_idx" ON "report_cache" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "expiry_idx" ON "report_cache" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "rfq_item_rfq_id_idx" ON "rfq_items" USING btree ("rfq_id");--> statement-breakpoint
CREATE INDEX "rfq_item_boq_reference_idx" ON "rfq_items" USING btree ("boq_item_id");--> statement-breakpoint
CREATE INDEX "rfq_project_id_idx" ON "rfqs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "rfq_status_idx" ON "rfqs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "rfq_number_idx" ON "rfqs" USING btree ("rfq_number");--> statement-breakpoint
CREATE INDEX "rfq_deadline_idx" ON "rfqs" USING btree ("response_deadline");--> statement-breakpoint
CREATE INDEX "staff_period_idx" ON "staff_performance" USING btree ("staff_id","period_start");--> statement-breakpoint
CREATE INDEX "project_staff_idx" ON "staff_performance" USING btree ("project_id","staff_id");--> statement-breakpoint
CREATE INDEX "stock_movement_item_movement_idx" ON "stock_movement_items" USING btree ("movement_id");--> statement-breakpoint
CREATE INDEX "stock_movement_item_position_idx" ON "stock_movement_items" USING btree ("stock_position_id");--> statement-breakpoint
CREATE INDEX "stock_movement_item_code_idx" ON "stock_movement_items" USING btree ("item_code");--> statement-breakpoint
CREATE INDEX "stock_movement_project_idx" ON "stock_movements" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "stock_movement_type_idx" ON "stock_movements" USING btree ("movement_type");--> statement-breakpoint
CREATE INDEX "stock_movement_status_idx" ON "stock_movements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "stock_movement_reference_idx" ON "stock_movements" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "stock_movement_date_idx" ON "stock_movements" USING btree ("movement_date");--> statement-breakpoint
CREATE INDEX "stock_position_project_idx" ON "stock_positions" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "stock_position_item_code_idx" ON "stock_positions" USING btree ("project_id","item_code");--> statement-breakpoint
CREATE INDEX "stock_position_category_idx" ON "stock_positions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "stock_position_status_idx" ON "stock_positions" USING btree ("stock_status");--> statement-breakpoint
CREATE INDEX "supplier_invitation_rfq_supplier_idx" ON "supplier_invitations" USING btree ("rfq_id","supplier_id");--> statement-breakpoint
CREATE INDEX "supplier_invitation_supplier_idx" ON "supplier_invitations" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "supplier_invitation_status_idx" ON "supplier_invitations" USING btree ("invitation_status");--> statement-breakpoint
CREATE INDEX "supplier_invitation_token_idx" ON "supplier_invitations" USING btree ("access_token");--> statement-breakpoint
CREATE INDEX "team_member_idx" ON "team_members" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "contractor_member_idx" ON "team_members" USING btree ("contractor_id");--> statement-breakpoint
CREATE INDEX "member_id_number_idx" ON "team_members" USING btree ("id_number");