CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"activity_type" varchar(50) NOT NULL,
	"action" varchar(100) NOT NULL,
	"actor_type" varchar(20) NOT NULL,
	"actor_id" uuid,
	"actor_name" varchar(255),
	"target_type" varchar(50),
	"target_id" uuid,
	"target_name" varchar(255),
	"project_id" uuid,
	"team_id" uuid,
	"workspace_id" uuid,
	"changes_before" jsonb,
	"changes_after" jsonb,
	"changed_fields" jsonb DEFAULT '[]',
	"impact_level" varchar(20) DEFAULT 'low',
	"is_public" boolean DEFAULT true,
	"is_important" boolean DEFAULT false,
	"ip_address" varchar(45),
	"user_agent" text,
	"session_id" varchar(255),
	"request_id" varchar(255),
	"metadata" jsonb DEFAULT '{}',
	"tags" jsonb DEFAULT '[]',
	"occurred_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "communication_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(20) NOT NULL,
	"direction" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"from_type" varchar(20),
	"from_id" uuid,
	"from_name" varchar(255),
	"from_address" varchar(255),
	"to_type" varchar(20),
	"to_id" uuid,
	"to_name" varchar(255),
	"to_address" varchar(255),
	"subject" varchar(500),
	"message" text NOT NULL,
	"message_format" varchar(20) DEFAULT 'text',
	"project_id" uuid,
	"related_table" varchar(50),
	"related_id" uuid,
	"thread_id" uuid,
	"parent_message_id" uuid,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"read_at" timestamp,
	"failed_at" timestamp,
	"error_message" text,
	"attempt_count" integer DEFAULT 0,
	"provider" varchar(50),
	"external_id" varchar(255),
	"provider_id" varchar(255),
	"attachments" jsonb DEFAULT '[]',
	"media_urls" jsonb DEFAULT '[]',
	"priority" varchar(20) DEFAULT 'normal',
	"is_urgent" boolean DEFAULT false,
	"requires_ack" boolean DEFAULT false,
	"acknowledged_at" timestamp,
	"acknowledged_by" uuid,
	"template_id" varchar(50),
	"is_automated" boolean DEFAULT false,
	"trigger_event" varchar(100),
	"metadata" jsonb DEFAULT '{}',
	"tags" jsonb DEFAULT '[]',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "in_app_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject" varchar(500),
	"content" text NOT NULL,
	"message_type" varchar(50) DEFAULT 'direct',
	"priority" varchar(20) DEFAULT 'normal',
	"from_user_id" uuid,
	"to_user_id" uuid,
	"thread_id" uuid,
	"parent_message_id" uuid,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"is_archived" boolean DEFAULT false,
	"archived_at" timestamp,
	"project_id" uuid,
	"related_table" varchar(50),
	"related_id" uuid,
	"attachments" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"sent_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(50) NOT NULL,
	"type" varchar(50) NOT NULL,
	"priority" varchar(20) DEFAULT 'medium',
	"title_template" text NOT NULL,
	"message_template" text NOT NULL,
	"action_type" varchar(50),
	"action_url_template" text,
	"is_active" boolean DEFAULT true,
	"can_user_disable" boolean DEFAULT true,
	"auto_archive_hours" integer,
	"default_target_roles" jsonb DEFAULT '[]',
	"default_target_departments" jsonb DEFAULT '[]',
	"variables" jsonb DEFAULT '[]',
	"required_variables" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "notification_templates_template_id_unique" UNIQUE("template_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"category" varchar(50),
	"priority" varchar(20) DEFAULT 'medium',
	"user_id" uuid,
	"is_global" boolean DEFAULT false,
	"target_roles" jsonb DEFAULT '[]',
	"target_departments" jsonb DEFAULT '[]',
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"is_archived" boolean DEFAULT false,
	"archived_at" timestamp,
	"action_type" varchar(50),
	"action_url" text,
	"action_data" jsonb DEFAULT '{}',
	"related_table" varchar(50),
	"related_id" uuid,
	"project_id" uuid,
	"scheduled_for" timestamp,
	"expires_at" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"template_id" varchar(50),
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_access_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"access_type" varchar(20) NOT NULL,
	"access_method" varchar(20),
	"ip_address" varchar(45),
	"user_agent" text,
	"session_id" varchar(255),
	"request_duration" integer,
	"bytes_transferred" integer,
	"was_successful" boolean DEFAULT true,
	"error_message" text,
	"referer_url" text,
	"device_type" varchar(20),
	"browser_name" varchar(50),
	"browser_version" varchar(20),
	"metadata" jsonb DEFAULT '{}',
	"accessed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"comment_text" text NOT NULL,
	"comment_type" varchar(20) DEFAULT 'general',
	"parent_comment_id" uuid,
	"thread_id" uuid,
	"page_number" integer,
	"x_position" numeric(8, 4),
	"y_position" numeric(8, 4),
	"status" varchar(20) DEFAULT 'open',
	"resolved_by" uuid,
	"resolved_date" timestamp,
	"resolution" text,
	"attachments" jsonb DEFAULT '[]',
	"mentions" jsonb DEFAULT '[]',
	"is_private" boolean DEFAULT false,
	"priority" varchar(20) DEFAULT 'normal',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"folder_name" varchar(255) NOT NULL,
	"folder_path" text NOT NULL,
	"parent_folder_id" uuid,
	"project_id" uuid,
	"description" text,
	"folder_type" varchar(50),
	"is_system_folder" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"is_public" boolean DEFAULT false,
	"access_level" varchar(20) DEFAULT 'project',
	"allowed_users" jsonb DEFAULT '[]',
	"allowed_roles" jsonb DEFAULT '[]',
	"document_count" integer DEFAULT 0,
	"total_size" integer DEFAULT 0,
	"last_activity" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "document_folders_folder_path_unique" UNIQUE("folder_path")
);
--> statement-breakpoint
CREATE TABLE "document_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"share_id" varchar(50) NOT NULL,
	"document_id" uuid NOT NULL,
	"shared_by" uuid NOT NULL,
	"share_type" varchar(20) NOT NULL,
	"share_url" text,
	"access_token" varchar(255),
	"shared_with_users" jsonb DEFAULT '[]',
	"shared_with_emails" jsonb DEFAULT '[]',
	"shared_with_roles" jsonb DEFAULT '[]',
	"can_view" boolean DEFAULT true,
	"can_download" boolean DEFAULT true,
	"can_edit" boolean DEFAULT false,
	"can_comment" boolean DEFAULT false,
	"can_share" boolean DEFAULT false,
	"requires_password" boolean DEFAULT false,
	"password_hash" varchar(255),
	"requires_login" boolean DEFAULT true,
	"expiry_date" timestamp,
	"max_accesses" integer,
	"access_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"last_accessed" timestamp,
	"unique_accessors" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "document_shares_share_id_unique" UNIQUE("share_id")
);
--> statement-breakpoint
CREATE TABLE "document_workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" varchar(50) NOT NULL,
	"document_id" uuid NOT NULL,
	"workflow_name" varchar(255) NOT NULL,
	"workflow_type" varchar(50) NOT NULL,
	"current_step" integer DEFAULT 1,
	"total_steps" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"steps" jsonb NOT NULL,
	"step_history" jsonb DEFAULT '[]',
	"current_assignees" jsonb DEFAULT '[]',
	"all_participants" jsonb DEFAULT '[]',
	"due_date" timestamp,
	"started_date" timestamp,
	"completed_date" timestamp,
	"is_parallel" boolean DEFAULT false,
	"requires_all_approvals" boolean DEFAULT true,
	"allow_delegation" boolean DEFAULT false,
	"notification_settings" jsonb DEFAULT '{}',
	"reminder_settings" jsonb DEFAULT '{}',
	"final_decision" varchar(20),
	"outcome_notes" text,
	"completion_percentage" integer DEFAULT 0,
	"metadata" jsonb DEFAULT '{}',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "document_workflows_workflow_id_unique" UNIQUE("workflow_id")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" varchar(50) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"original_file_name" varchar(255) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"description" text,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"file_extension" varchar(10) NOT NULL,
	"md5_hash" varchar(32) NOT NULL,
	"sha256_hash" varchar(64),
	"storage_path" text NOT NULL,
	"storage_provider" varchar(50) DEFAULT 'local',
	"storage_url" text,
	"thumbnail_path" text,
	"folder_id" uuid,
	"project_id" uuid,
	"client_id" uuid,
	"document_type" varchar(50) NOT NULL,
	"category" varchar(50),
	"subcategory" varchar(50),
	"tags" jsonb DEFAULT '[]',
	"status" varchar(20) DEFAULT 'active',
	"is_template" boolean DEFAULT false,
	"template_category" varchar(50),
	"version" integer DEFAULT 1,
	"parent_document_id" uuid,
	"is_latest_version" boolean DEFAULT true,
	"version_notes" text,
	"is_public" boolean DEFAULT false,
	"access_level" varchar(20) DEFAULT 'project',
	"allowed_users" jsonb DEFAULT '[]',
	"allowed_roles" jsonb DEFAULT '[]',
	"is_password_protected" boolean DEFAULT false,
	"password_hash" varchar(255),
	"has_text" boolean DEFAULT false,
	"extracted_text" text,
	"ocr_text" text,
	"page_count" integer,
	"word_count" integer,
	"requires_approval" boolean DEFAULT false,
	"approval_status" varchar(20) DEFAULT 'pending',
	"approved_by" uuid,
	"approved_date" timestamp,
	"rejection_reason" text,
	"retention_period_days" integer,
	"expiry_date" date,
	"auto_delete_date" date,
	"is_expired" boolean DEFAULT false,
	"download_count" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"last_downloaded" timestamp,
	"last_viewed" timestamp,
	"is_compliant" boolean DEFAULT true,
	"compliance_notes" text,
	"quality_score" integer,
	"has_watermark" boolean DEFAULT false,
	"document_date" date,
	"author_name" varchar(255),
	"company_name" varchar(255),
	"contract_number" varchar(100),
	"invoice_number" varchar(100),
	"receipt_number" varchar(100),
	"amount" numeric(15, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"tax_amount" numeric(15, 2),
	"technical_specs" jsonb DEFAULT '{}',
	"equipment_ids" jsonb DEFAULT '[]',
	"location_data" jsonb DEFAULT '{}',
	"image_width" integer,
	"image_height" integer,
	"camera_model" varchar(100),
	"gps_latitude" numeric(10, 8),
	"gps_longitude" numeric(11, 8),
	"date_taken" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_by" uuid,
	"uploaded_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "documents_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "in_app_messages" ADD CONSTRAINT "in_app_messages_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "in_app_messages" ADD CONSTRAINT "in_app_messages_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "in_app_messages" ADD CONSTRAINT "in_app_messages_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_templates" ADD CONSTRAINT "notification_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_access_logs" ADD CONSTRAINT "document_access_logs_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_access_logs" ADD CONSTRAINT "document_access_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_folders" ADD CONSTRAINT "document_folders_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_folders" ADD CONSTRAINT "document_folders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_shared_by_users_id_fk" FOREIGN KEY ("shared_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_workflows" ADD CONSTRAINT "document_workflows_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_workflows" ADD CONSTRAINT "document_workflows_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_folder_id_document_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."document_folders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_actor_idx" ON "activities" USING btree ("actor_type","actor_id");--> statement-breakpoint
CREATE INDEX "activities_target_idx" ON "activities" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "activities_project_idx" ON "activities" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "activities_type_idx" ON "activities" USING btree ("activity_type");--> statement-breakpoint
CREATE INDEX "activities_action_idx" ON "activities" USING btree ("action");--> statement-breakpoint
CREATE INDEX "activities_occurred_at_idx" ON "activities" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "activities_public_idx" ON "activities" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "activities_important_idx" ON "activities" USING btree ("is_important");--> statement-breakpoint
CREATE INDEX "comm_logs_type_idx" ON "communication_logs" USING btree ("type");--> statement-breakpoint
CREATE INDEX "comm_logs_status_idx" ON "communication_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "comm_logs_from_idx" ON "communication_logs" USING btree ("from_type","from_id");--> statement-breakpoint
CREATE INDEX "comm_logs_to_idx" ON "communication_logs" USING btree ("to_type","to_id");--> statement-breakpoint
CREATE INDEX "comm_logs_project_idx" ON "communication_logs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "comm_logs_thread_idx" ON "communication_logs" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "comm_logs_sent_at_idx" ON "communication_logs" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "comm_logs_created_at_idx" ON "communication_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "comm_logs_priority_idx" ON "communication_logs" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "in_app_messages_from_idx" ON "in_app_messages" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "in_app_messages_to_idx" ON "in_app_messages" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "in_app_messages_thread_idx" ON "in_app_messages" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "in_app_messages_read_idx" ON "in_app_messages" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "in_app_messages_sent_at_idx" ON "in_app_messages" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "in_app_messages_project_idx" ON "in_app_messages" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "notification_templates_id_idx" ON "notification_templates" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "notification_templates_category_idx" ON "notification_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "notification_templates_active_idx" ON "notification_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "notifications_priority_idx" ON "notifications" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "notifications_scheduled_idx" ON "notifications" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "notifications_project_idx" ON "notifications" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "document_access_logs_document_idx" ON "document_access_logs" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_access_logs_user_idx" ON "document_access_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "document_access_logs_type_idx" ON "document_access_logs" USING btree ("access_type");--> statement-breakpoint
CREATE INDEX "document_access_logs_time_idx" ON "document_access_logs" USING btree ("accessed_at");--> statement-breakpoint
CREATE INDEX "document_access_logs_ip_idx" ON "document_access_logs" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "document_comments_document_idx" ON "document_comments" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_comments_user_idx" ON "document_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "document_comments_parent_idx" ON "document_comments" USING btree ("parent_comment_id");--> statement-breakpoint
CREATE INDEX "document_comments_thread_idx" ON "document_comments" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "document_comments_status_idx" ON "document_comments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "document_comments_created_idx" ON "document_comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "document_folders_path_idx" ON "document_folders" USING btree ("folder_path");--> statement-breakpoint
CREATE INDEX "document_folders_parent_idx" ON "document_folders" USING btree ("parent_folder_id");--> statement-breakpoint
CREATE INDEX "document_folders_project_idx" ON "document_folders" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "document_folders_type_idx" ON "document_folders" USING btree ("folder_type");--> statement-breakpoint
CREATE INDEX "document_folders_access_idx" ON "document_folders" USING btree ("access_level");--> statement-breakpoint
CREATE INDEX "document_shares_id_idx" ON "document_shares" USING btree ("share_id");--> statement-breakpoint
CREATE INDEX "document_shares_document_idx" ON "document_shares" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_shares_shared_by_idx" ON "document_shares" USING btree ("shared_by");--> statement-breakpoint
CREATE INDEX "document_shares_type_idx" ON "document_shares" USING btree ("share_type");--> statement-breakpoint
CREATE INDEX "document_shares_expiry_idx" ON "document_shares" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "document_shares_active_idx" ON "document_shares" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "document_workflows_id_idx" ON "document_workflows" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "document_workflows_document_idx" ON "document_workflows" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_workflows_status_idx" ON "document_workflows" USING btree ("status");--> statement-breakpoint
CREATE INDEX "document_workflows_step_idx" ON "document_workflows" USING btree ("current_step");--> statement-breakpoint
CREATE INDEX "document_workflows_due_date_idx" ON "document_workflows" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "documents_id_idx" ON "documents" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "documents_file_name_idx" ON "documents" USING btree ("file_name");--> statement-breakpoint
CREATE INDEX "documents_folder_idx" ON "documents" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "documents_project_idx" ON "documents" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "documents_client_idx" ON "documents" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "documents_type_idx" ON "documents" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "documents_category_idx" ON "documents" USING btree ("category");--> statement-breakpoint
CREATE INDEX "documents_status_idx" ON "documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "documents_version_idx" ON "documents" USING btree ("parent_document_id","version");--> statement-breakpoint
CREATE INDEX "documents_approval_idx" ON "documents" USING btree ("approval_status");--> statement-breakpoint
CREATE INDEX "documents_date_idx" ON "documents" USING btree ("document_date");--> statement-breakpoint
CREATE INDEX "documents_md5_idx" ON "documents" USING btree ("md5_hash");--> statement-breakpoint
CREATE INDEX "documents_mime_type_idx" ON "documents" USING btree ("mime_type");--> statement-breakpoint
CREATE INDEX "documents_tags_idx" ON "documents" USING btree ("tags");