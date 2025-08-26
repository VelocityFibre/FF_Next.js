import { pgTable, index, serial, varchar, text, integer, numeric, timestamp, boolean, uuid, json, unique, foreignKey, jsonb, date } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const projectAnalytics = pgTable("project_analytics", {
	id: serial().primaryKey().notNull(),
	projectId: varchar("project_id", { length: 255 }).notNull(),
	projectName: text("project_name").notNull(),
	clientId: varchar("client_id", { length: 255 }),
	clientName: text("client_name"),
	totalPoles: integer("total_poles").default(0),
	completedPoles: integer("completed_poles").default(0),
	totalDrops: integer("total_drops").default(0),
	completedDrops: integer("completed_drops").default(0),
	totalBudget: numeric("total_budget", { precision: 15, scale:  2 }),
	spentBudget: numeric("spent_budget", { precision: 15, scale:  2 }),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	actualEndDate: timestamp("actual_end_date", { mode: 'string' }),
	completionPercentage: numeric("completion_percentage", { precision: 5, scale:  2 }),
	onTimeDelivery: boolean("on_time_delivery"),
	qualityScore: numeric("quality_score", { precision: 5, scale:  2 }),
	lastSyncedAt: timestamp("last_synced_at", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_project_analytics_client_id").using("btree", table.clientId.asc().nullsLast().op("text_ops")),
	index("idx_project_analytics_project_id").using("btree", table.projectId.asc().nullsLast().op("text_ops")),
]);

export const kpiMetrics = pgTable("kpi_metrics", {
	id: serial().primaryKey().notNull(),
	projectId: varchar("project_id", { length: 255 }),
	metricType: varchar("metric_type", { length: 100 }).notNull(),
	metricName: text("metric_name").notNull(),
	metricValue: numeric("metric_value", { precision: 15, scale:  4 }).notNull(),
	unit: varchar({ length: 50 }),
	teamId: varchar("team_id", { length: 255 }),
	contractorId: varchar("contractor_id", { length: 255 }),
	recordedDate: timestamp("recorded_date", { mode: 'string' }).notNull(),
	weekNumber: integer("week_number"),
	monthNumber: integer("month_number"),
	year: integer(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_kpi_metrics_date").using("btree", table.recordedDate.asc().nullsLast().op("timestamp_ops")),
	index("idx_kpi_metrics_project_metric").using("btree", table.projectId.asc().nullsLast().op("text_ops"), table.metricType.asc().nullsLast().op("text_ops")),
]);

export const financialTransactions = pgTable("financial_transactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	transactionType: varchar("transaction_type", { length: 50 }).notNull(),
	projectId: varchar("project_id", { length: 255 }),
	clientId: varchar("client_id", { length: 255 }),
	supplierId: varchar("supplier_id", { length: 255 }),
	amount: numeric({ precision: 15, scale:  2 }).notNull(),
	currency: varchar({ length: 3 }).default('ZAR'),
	status: varchar({ length: 50 }).notNull(),
	invoiceNumber: varchar("invoice_number", { length: 100 }),
	poNumber: varchar("po_number", { length: 100 }),
	transactionDate: timestamp("transaction_date", { mode: 'string' }).notNull(),
	dueDate: timestamp("due_date", { mode: 'string' }),
	paidDate: timestamp("paid_date", { mode: 'string' }),
	notes: text(),
	attachments: json(),
	createdBy: varchar("created_by", { length: 255 }),
	approvedBy: varchar("approved_by", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_financial_client").using("btree", table.clientId.asc().nullsLast().op("text_ops")),
	index("idx_financial_project").using("btree", table.projectId.asc().nullsLast().op("text_ops")),
	index("idx_financial_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
]);

export const materialUsage = pgTable("material_usage", {
	id: serial().primaryKey().notNull(),
	projectId: varchar("project_id", { length: 255 }).notNull(),
	materialId: varchar("material_id", { length: 255 }).notNull(),
	materialName: text("material_name").notNull(),
	category: varchar({ length: 100 }),
	plannedQuantity: numeric("planned_quantity", { precision: 15, scale:  4 }),
	usedQuantity: numeric("used_quantity", { precision: 15, scale:  4 }).notNull(),
	wastedQuantity: numeric("wasted_quantity", { precision: 15, scale:  4 }),
	unit: varchar({ length: 50 }),
	unitCost: numeric("unit_cost", { precision: 15, scale:  2 }),
	totalCost: numeric("total_cost", { precision: 15, scale:  2 }),
	poleNumber: varchar("pole_number", { length: 100 }),
	sectionId: varchar("section_id", { length: 255 }),
	usageDate: timestamp("usage_date", { mode: 'string' }).notNull(),
	recordedBy: varchar("recorded_by", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const staffPerformance = pgTable("staff_performance", {
	id: serial().primaryKey().notNull(),
	staffId: varchar("staff_id", { length: 255 }).notNull(),
	staffName: text("staff_name").notNull(),
	role: varchar({ length: 100 }),
	tasksCompleted: integer("tasks_completed").default(0),
	hoursWorked: numeric("hours_worked", { precision: 10, scale:  2 }),
	productivityScore: numeric("productivity_score", { precision: 5, scale:  2 }),
	qualityScore: numeric("quality_score", { precision: 5, scale:  2 }),
	attendanceRate: numeric("attendance_rate", { precision: 5, scale:  2 }),
	projectId: varchar("project_id", { length: 255 }),
	teamId: varchar("team_id", { length: 255 }),
	periodStart: timestamp("period_start", { mode: 'string' }).notNull(),
	periodEnd: timestamp("period_end", { mode: 'string' }).notNull(),
	periodType: varchar("period_type", { length: 50 }),
	overtimeHours: numeric("overtime_hours", { precision: 10, scale:  2 }),
	incidentCount: integer("incident_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const reportCache = pgTable("report_cache", {
	id: serial().primaryKey().notNull(),
	reportType: varchar("report_type", { length: 100 }).notNull(),
	reportName: text("report_name").notNull(),
	filters: json(),
	projectId: varchar("project_id", { length: 255 }),
	dateFrom: timestamp("date_from", { mode: 'string' }),
	dateTo: timestamp("date_to", { mode: 'string' }),
	reportData: json("report_data").notNull(),
	chartData: json("chart_data"),
	summary: json(),
	generatedBy: varchar("generated_by", { length: 255 }),
	generatedAt: timestamp("generated_at", { mode: 'string' }).defaultNow(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	accessCount: integer("access_count").default(0),
	generationTimeMs: integer("generation_time_ms"),
	dataSizeBytes: integer("data_size_bytes"),
});

export const auditLog = pgTable("audit_log", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	action: varchar({ length: 100 }).notNull(),
	entityType: varchar("entity_type", { length: 100 }).notNull(),
	entityId: varchar("entity_id", { length: 255 }).notNull(),
	userId: varchar("user_id", { length: 255 }).notNull(),
	userName: text("user_name"),
	userRole: varchar("user_role", { length: 100 }),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	oldValue: json("old_value"),
	newValue: json("new_value"),
	changesSummary: text("changes_summary"),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
	sessionId: varchar("session_id", { length: 255 }),
	source: varchar({ length: 50 }),
}, (table) => [
	index("idx_audit_entity").using("btree", table.entityType.asc().nullsLast().op("text_ops"), table.entityId.asc().nullsLast().op("text_ops")),
	index("idx_audit_timestamp").using("btree", table.timestamp.asc().nullsLast().op("timestamp_ops")),
	index("idx_audit_user").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const clientAnalytics = pgTable("client_analytics", {
	id: serial().primaryKey().notNull(),
	clientId: varchar("client_id", { length: 255 }).notNull(),
	clientName: text("client_name").notNull(),
	totalProjects: integer("total_projects").default(0),
	activeProjects: integer("active_projects").default(0),
	completedProjects: integer("completed_projects").default(0),
	totalRevenue: numeric("total_revenue", { precision: 15, scale:  2 }),
	outstandingBalance: numeric("outstanding_balance", { precision: 15, scale:  2 }),
	averageProjectValue: numeric("average_project_value", { precision: 15, scale:  2 }),
	paymentScore: numeric("payment_score", { precision: 5, scale:  2 }),
	averageProjectDuration: integer("average_project_duration"),
	onTimeCompletionRate: numeric("on_time_completion_rate", { precision: 5, scale:  2 }),
	satisfactionScore: numeric("satisfaction_score", { precision: 5, scale:  2 }),
	lastProjectDate: timestamp("last_project_date", { mode: 'string' }),
	nextFollowUpDate: timestamp("next_follow_up_date", { mode: 'string' }),
	totalInteractions: integer("total_interactions").default(0),
	clientCategory: varchar("client_category", { length: 50 }),
	lifetimeValue: numeric("lifetime_value", { precision: 15, scale:  2 }),
	lastCalculatedAt: timestamp("last_calculated_at", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("client_analytics_client_id_key").on(table.clientId),
]);

export const contractors = pgTable("contractors", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	companyName: text("company_name").notNull(),
	registrationNumber: varchar("registration_number", { length: 50 }).notNull(),
	contactPerson: text("contact_person").notNull(),
	email: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 20 }),
	alternatePhone: varchar("alternate_phone", { length: 20 }),
	physicalAddress: text("physical_address"),
	postalAddress: text("postal_address"),
	city: varchar({ length: 100 }),
	province: varchar({ length: 100 }),
	postalCode: varchar("postal_code", { length: 10 }),
	businessType: varchar("business_type", { length: 50 }),
	industryCategory: varchar("industry_category", { length: 100 }),
	yearsInBusiness: integer("years_in_business"),
	employeeCount: integer("employee_count"),
	annualTurnover: numeric("annual_turnover", { precision: 15, scale:  2 }),
	creditRating: varchar("credit_rating", { length: 10 }),
	paymentTerms: varchar("payment_terms", { length: 50 }),
	bankName: varchar("bank_name", { length: 100 }),
	accountNumber: varchar("account_number", { length: 50 }),
	branchCode: varchar("branch_code", { length: 10 }),
	status: varchar({ length: 20 }).default('pending').notNull(),
	isActive: boolean("is_active").default(true),
	complianceStatus: varchar("compliance_status", { length: 20 }).default('pending'),
	ragOverall: varchar("rag_overall", { length: 10 }).default('amber'),
	ragFinancial: varchar("rag_financial", { length: 10 }).default('amber'),
	ragCompliance: varchar("rag_compliance", { length: 10 }).default('amber'),
	ragPerformance: varchar("rag_performance", { length: 10 }).default('amber'),
	ragSafety: varchar("rag_safety", { length: 10 }).default('amber'),
	performanceScore: numeric("performance_score", { precision: 5, scale:  2 }),
	safetyScore: numeric("safety_score", { precision: 5, scale:  2 }),
	qualityScore: numeric("quality_score", { precision: 5, scale:  2 }),
	timelinessScore: numeric("timeliness_score", { precision: 5, scale:  2 }),
	totalProjects: integer("total_projects").default(0),
	completedProjects: integer("completed_projects").default(0),
	activeProjects: integer("active_projects").default(0),
	cancelledProjects: integer("cancelled_projects").default(0),
	onboardingProgress: integer("onboarding_progress").default(0),
	onboardingCompletedAt: timestamp("onboarding_completed_at", { mode: 'string' }),
	documentsExpiring: integer("documents_expiring").default(0),
	notes: text(),
	tags: json(),
	lastActivity: timestamp("last_activity", { mode: 'string' }),
	nextReviewDate: timestamp("next_review_date", { mode: 'string' }),
	createdBy: varchar("created_by", { length: 255 }),
	updatedBy: varchar("updated_by", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_contractor_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("idx_contractor_rag").using("btree", table.ragOverall.asc().nullsLast().op("text_ops")),
	index("idx_contractor_reg_number").using("btree", table.registrationNumber.asc().nullsLast().op("text_ops")),
	index("idx_contractor_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	unique("contractors_registration_number_key").on(table.registrationNumber),
]);

export const contractorTeams = pgTable("contractor_teams", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	contractorId: uuid("contractor_id").notNull(),
	teamName: text("team_name").notNull(),
	teamType: varchar("team_type", { length: 50 }),
	specialization: varchar({ length: 100 }),
	maxCapacity: integer("max_capacity").notNull(),
	currentCapacity: integer("current_capacity").default(0),
	availableCapacity: integer("available_capacity").default(0),
	efficiency: numeric({ precision: 5, scale:  2 }),
	qualityRating: numeric("quality_rating", { precision: 5, scale:  2 }),
	safetyRecord: numeric("safety_record", { precision: 5, scale:  2 }),
	isActive: boolean("is_active").default(true),
	availability: varchar({ length: 20 }).default('available'),
	baseLocation: text("base_location"),
	operatingRadius: integer("operating_radius"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_contractor_team").using("btree", table.contractorId.asc().nullsLast().op("uuid_ops")),
	index("idx_team_type").using("btree", table.teamType.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.contractorId],
			foreignColumns: [contractors.id],
			name: "contractor_teams_contractor_id_fkey"
		}).onDelete("cascade"),
]);

export const teamMembers = pgTable("team_members", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	teamId: uuid("team_id").notNull(),
	contractorId: uuid("contractor_id").notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	idNumber: varchar("id_number", { length: 20 }),
	email: varchar({ length: 255 }),
	phone: varchar({ length: 20 }),
	role: varchar({ length: 50 }).notNull(),
	skillLevel: varchar("skill_level", { length: 20 }),
	certifications: json(),
	specialSkills: json("special_skills"),
	employmentType: varchar("employment_type", { length: 20 }),
	hourlyRate: numeric("hourly_rate", { precision: 10, scale:  2 }),
	dailyRate: numeric("daily_rate", { precision: 10, scale:  2 }),
	isActive: boolean("is_active").default(true),
	isTeamLead: boolean("is_team_lead").default(false),
	performanceRating: numeric("performance_rating", { precision: 5, scale:  2 }),
	safetyScore: numeric("safety_score", { precision: 5, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_contractor_member").using("btree", table.contractorId.asc().nullsLast().op("uuid_ops")),
	index("idx_team_member").using("btree", table.teamId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [contractorTeams.id],
			name: "team_members_team_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.contractorId],
			foreignColumns: [contractors.id],
			name: "team_members_contractor_id_fkey"
		}).onDelete("cascade"),
	unique("team_members_id_number_key").on(table.idNumber),
]);

export const projectAssignments = pgTable("project_assignments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: varchar("project_id", { length: 255 }).notNull(),
	contractorId: uuid("contractor_id").notNull(),
	teamId: uuid("team_id"),
	assignmentType: varchar("assignment_type", { length: 50 }),
	scope: text().notNull(),
	responsibilities: json(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	actualStartDate: timestamp("actual_start_date", { mode: 'string' }),
	actualEndDate: timestamp("actual_end_date", { mode: 'string' }),
	contractValue: numeric("contract_value", { precision: 15, scale:  2 }).notNull(),
	paidAmount: numeric("paid_amount", { precision: 15, scale:  2 }).default('0'),
	outstandingAmount: numeric("outstanding_amount", { precision: 15, scale:  2 }),
	status: varchar({ length: 20 }).default('assigned').notNull(),
	progressPercentage: integer("progress_percentage").default(0),
	performanceRating: numeric("performance_rating", { precision: 5, scale:  2 }),
	qualityScore: numeric("quality_score", { precision: 5, scale:  2 }),
	timelinessScore: numeric("timeliness_score", { precision: 5, scale:  2 }),
	assignmentNotes: text("assignment_notes"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_assignment_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_contractor_assignment").using("btree", table.contractorId.asc().nullsLast().op("uuid_ops")),
	index("idx_project_contractor").using("btree", table.projectId.asc().nullsLast().op("text_ops"), table.contractorId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.contractorId],
			foreignColumns: [contractors.id],
			name: "project_assignments_contractor_id_fkey"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [contractorTeams.id],
			name: "project_assignments_team_id_fkey"
		}),
]);

export const contractorDocuments = pgTable("contractor_documents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	contractorId: uuid("contractor_id").notNull(),
	documentType: varchar("document_type", { length: 50 }).notNull(),
	documentName: text("document_name").notNull(),
	documentNumber: varchar("document_number", { length: 100 }),
	fileName: text("file_name").notNull(),
	fileUrl: text("file_url").notNull(),
	fileSize: integer("file_size"),
	mimeType: varchar("mime_type", { length: 100 }),
	issueDate: timestamp("issue_date", { mode: 'string' }),
	expiryDate: timestamp("expiry_date", { mode: 'string' }),
	isExpired: boolean("is_expired").default(false),
	daysUntilExpiry: integer("days_until_expiry"),
	verificationStatus: varchar("verification_status", { length: 20 }).default('pending'),
	verifiedBy: varchar("verified_by", { length: 255 }),
	verifiedAt: timestamp("verified_at", { mode: 'string' }),
	notes: text(),
	rejectionReason: text("rejection_reason"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_contractor_doc").using("btree", table.contractorId.asc().nullsLast().op("uuid_ops")),
	index("idx_doc_expiry").using("btree", table.expiryDate.asc().nullsLast().op("timestamp_ops")),
	index("idx_doc_type").using("btree", table.documentType.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.contractorId],
			foreignColumns: [contractors.id],
			name: "contractor_documents_contractor_id_fkey"
		}).onDelete("cascade"),
]);

export const boqs = pgTable("boqs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: varchar("project_id", { length: 255 }).notNull(),
	version: varchar({ length: 50 }).notNull(),
	title: text(),
	description: text(),
	status: varchar({ length: 20 }).default('draft').notNull(),
	mappingStatus: varchar("mapping_status", { length: 20 }).default('pending'),
	mappingConfidence: numeric("mapping_confidence", { precision: 5, scale:  2 }),
	uploadedBy: varchar("uploaded_by", { length: 255 }).notNull(),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow().notNull(),
	fileName: text("file_name"),
	fileUrl: text("file_url"),
	fileSize: integer("file_size"),
	approvedBy: varchar("approved_by", { length: 255 }),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	rejectedBy: varchar("rejected_by", { length: 255 }),
	rejectedAt: timestamp("rejected_at", { mode: 'string' }),
	rejectionReason: text("rejection_reason"),
	itemCount: integer("item_count").default(0),
	mappedItems: integer("mapped_items").default(0),
	unmappedItems: integer("unmapped_items").default(0),
	exceptionsCount: integer("exceptions_count").default(0),
	totalEstimatedValue: numeric("total_estimated_value", { precision: 15, scale:  2 }),
	currency: varchar({ length: 3 }).default('ZAR'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_boq_project").using("btree", table.projectId.asc().nullsLast().op("text_ops")),
	index("idx_boq_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	unique("boqs_project_id_version_key").on(table.projectId, table.version),
]);

export const boqItems = pgTable("boq_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	boqId: uuid("boq_id").notNull(),
	projectId: varchar("project_id", { length: 255 }).notNull(),
	itemNumber: varchar("item_number", { length: 50 }),
	description: text().notNull(),
	unit: varchar({ length: 50 }),
	quantity: numeric({ precision: 15, scale:  4 }),
	rate: numeric({ precision: 15, scale:  2 }),
	amount: numeric({ precision: 15, scale:  2 }),
	category: varchar({ length: 100 }),
	materialCode: varchar("material_code", { length: 100 }),
	mappedMaterialId: varchar("mapped_material_id", { length: 255 }),
	mappingConfidence: numeric("mapping_confidence", { precision: 5, scale:  2 }),
	isMapped: boolean("is_mapped").default(false),
	mappingNotes: text("mapping_notes"),
	parentItemId: uuid("parent_item_id"),
	level: integer().default(0),
	sequenceNumber: integer("sequence_number"),
	customFields: json("custom_fields"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.boqId],
			foreignColumns: [boqs.id],
			name: "boq_items_boq_id_fkey"
		}).onDelete("cascade"),
]);

export const boqExceptions = pgTable("boq_exceptions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	boqId: uuid("boq_id").notNull(),
	boqItemId: uuid("boq_item_id"),
	exceptionType: varchar("exception_type", { length: 50 }).notNull(),
	severity: varchar({ length: 20 }).notNull(),
	description: text().notNull(),
	resolutionStatus: varchar("resolution_status", { length: 20 }).default('pending'),
	resolvedBy: varchar("resolved_by", { length: 255 }),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	resolutionNotes: text("resolution_notes"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.boqId],
			foreignColumns: [boqs.id],
			name: "boq_exceptions_boq_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.boqItemId],
			foreignColumns: [boqItems.id],
			name: "boq_exceptions_boq_item_id_fkey"
		}),
]);

export const requisitionItems = pgTable("requisition_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	prId: uuid("pr_id").notNull(),
	boqItemId: uuid("boq_item_id"),
	itemNumber: integer("item_number").notNull(),
	description: text().notNull(),
	specifications: text(),
	materialCode: varchar("material_code", { length: 100 }),
	unit: varchar({ length: 50 }),
	quantity: numeric({ precision: 15, scale:  4 }).notNull(),
	estimatedPrice: numeric("estimated_price", { precision: 15, scale:  2 }),
	totalPrice: numeric("total_price", { precision: 15, scale:  2 }),
	supplierId: varchar("supplier_id", { length: 255 }),
	supplierName: text("supplier_name"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.prId],
			foreignColumns: [purchaseRequisitions.id],
			name: "requisition_items_pr_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.boqItemId],
			foreignColumns: [boqItems.id],
			name: "requisition_items_boq_item_id_fkey"
		}),
]);

export const purchaseRequisitions = pgTable("purchase_requisitions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	prNumber: varchar("pr_number", { length: 100 }).notNull(),
	projectId: varchar("project_id", { length: 255 }).notNull(),
	boqId: uuid("boq_id"),
	department: varchar({ length: 100 }),
	requestedBy: varchar("requested_by", { length: 255 }).notNull(),
	requestedDate: timestamp("requested_date", { mode: 'string' }).notNull(),
	requiredDate: timestamp("required_date", { mode: 'string' }),
	status: varchar({ length: 20 }).default('draft').notNull(),
	priority: varchar({ length: 20 }).default('medium'),
	totalAmount: numeric("total_amount", { precision: 15, scale:  2 }),
	currency: varchar({ length: 3 }).default('ZAR'),
	justification: text(),
	approvedBy: varchar("approved_by", { length: 255 }),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	rejectedBy: varchar("rejected_by", { length: 255 }),
	rejectedAt: timestamp("rejected_at", { mode: 'string' }),
	rejectionReason: text("rejection_reason"),
	notes: text(),
	attachments: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.boqId],
			foreignColumns: [boqs.id],
			name: "purchase_requisitions_boq_id_fkey"
		}),
	unique("purchase_requisitions_pr_number_key").on(table.prNumber),
]);

export const purchaseOrders = pgTable("purchase_orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	poNumber: varchar("po_number", { length: 100 }).notNull(),
	prId: uuid("pr_id"),
	supplierId: varchar("supplier_id", { length: 255 }).notNull(),
	supplierName: text("supplier_name").notNull(),
	projectId: varchar("project_id", { length: 255 }).notNull(),
	orderDate: timestamp("order_date", { mode: 'string' }).notNull(),
	deliveryDate: timestamp("delivery_date", { mode: 'string' }),
	status: varchar({ length: 20 }).default('draft').notNull(),
	paymentTerms: varchar("payment_terms", { length: 100 }),
	deliveryTerms: varchar("delivery_terms", { length: 100 }),
	deliveryAddress: text("delivery_address"),
	billingAddress: text("billing_address"),
	subtotal: numeric({ precision: 15, scale:  2 }),
	taxAmount: numeric("tax_amount", { precision: 15, scale:  2 }),
	discountAmount: numeric("discount_amount", { precision: 15, scale:  2 }),
	totalAmount: numeric("total_amount", { precision: 15, scale:  2 }).notNull(),
	currency: varchar({ length: 3 }).default('ZAR'),
	notes: text(),
	termsConditions: text("terms_conditions"),
	approvedBy: varchar("approved_by", { length: 255 }),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	createdBy: varchar("created_by", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_po_project").using("btree", table.projectId.asc().nullsLast().op("text_ops")),
	index("idx_po_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_po_supplier").using("btree", table.supplierId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.prId],
			foreignColumns: [purchaseRequisitions.id],
			name: "purchase_orders_pr_id_fkey"
		}),
	unique("purchase_orders_po_number_key").on(table.poNumber),
]);

export const poItems = pgTable("po_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	poId: uuid("po_id").notNull(),
	prItemId: uuid("pr_item_id"),
	lineNumber: integer("line_number").notNull(),
	materialCode: varchar("material_code", { length: 100 }),
	description: text().notNull(),
	specifications: text(),
	unit: varchar({ length: 50 }),
	quantity: numeric({ precision: 15, scale:  4 }).notNull(),
	unitPrice: numeric("unit_price", { precision: 15, scale:  2 }).notNull(),
	discountPercent: numeric("discount_percent", { precision: 5, scale:  2 }),
	taxPercent: numeric("tax_percent", { precision: 5, scale:  2 }),
	totalPrice: numeric("total_price", { precision: 15, scale:  2 }).notNull(),
	deliveryDate: timestamp("delivery_date", { mode: 'string' }),
	receivedQuantity: numeric("received_quantity", { precision: 15, scale:  4 }).default('0'),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.poId],
			foreignColumns: [purchaseOrders.id],
			name: "po_items_po_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.prItemId],
			foreignColumns: [requisitionItems.id],
			name: "po_items_pr_item_id_fkey"
		}),
]);

export const suppliers = pgTable("suppliers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	supplierCode: varchar("supplier_code", { length: 100 }).notNull(),
	companyName: text("company_name").notNull(),
	registrationNumber: varchar("registration_number", { length: 50 }),
	contactPerson: text("contact_person"),
	email: varchar({ length: 255 }),
	phone: varchar({ length: 20 }),
	address: text(),
	city: varchar({ length: 100 }),
	province: varchar({ length: 100 }),
	postalCode: varchar("postal_code", { length: 10 }),
	country: varchar({ length: 100 }).default('South Africa'),
	taxNumber: varchar("tax_number", { length: 50 }),
	paymentTerms: varchar("payment_terms", { length: 100 }),
	creditLimit: numeric("credit_limit", { precision: 15, scale:  2 }),
	rating: numeric({ precision: 3, scale:  2 }),
	status: varchar({ length: 20 }).default('active'),
	categories: json(),
	certifications: json(),
	preferred: boolean().default(false),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("suppliers_supplier_code_key").on(table.supplierCode),
]);

export const rfqItems = pgTable("rfq_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	rfqId: uuid("rfq_id").notNull(),
	boqItemId: uuid("boq_item_id"),
	projectId: varchar("project_id", { length: 255 }).notNull(),
	lineNumber: integer("line_number").notNull(),
	itemCode: varchar("item_code", { length: 100 }),
	description: text().notNull(),
	category: varchar({ length: 100 }),
	quantity: numeric({ precision: 15, scale:  4 }).notNull(),
	uom: varchar({ length: 20 }).notNull(),
	budgetPrice: numeric("budget_price", { precision: 15, scale:  2 }),
	specifications: json(),
	technicalRequirements: text("technical_requirements"),
	acceptableAlternatives: json("acceptable_alternatives"),
	evaluationWeight: numeric("evaluation_weight", { precision: 5, scale:  2 }).default('1.0'),
	isCriticalItem: boolean("is_critical_item").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.rfqId],
			foreignColumns: [rfqs.id],
			name: "rfq_items_rfq_id_fkey"
		}).onDelete("cascade"),
]);

export const supplierInvitations = pgTable("supplier_invitations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	rfqId: uuid("rfq_id").notNull(),
	supplierId: varchar("supplier_id", { length: 255 }).notNull(),
	projectId: varchar("project_id", { length: 255 }).notNull(),
	supplierName: varchar("supplier_name", { length: 255 }).notNull(),
	supplierEmail: varchar("supplier_email", { length: 255 }).notNull(),
	contactPerson: varchar("contact_person", { length: 255 }),
	invitationStatus: varchar("invitation_status", { length: 20 }).default('sent'),
	invitedAt: timestamp("invited_at", { mode: 'string' }).defaultNow(),
	viewedAt: timestamp("viewed_at", { mode: 'string' }),
	respondedAt: timestamp("responded_at", { mode: 'string' }),
	declinedAt: timestamp("declined_at", { mode: 'string' }),
	accessToken: varchar("access_token", { length: 500 }),
	tokenExpiresAt: timestamp("token_expires_at", { mode: 'string' }),
	magicLinkToken: varchar("magic_link_token", { length: 500 }),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	invitationMessage: text("invitation_message"),
	declineReason: text("decline_reason"),
	remindersSent: integer("reminders_sent").default(0),
	lastReminderAt: timestamp("last_reminder_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.rfqId],
			foreignColumns: [rfqs.id],
			name: "supplier_invitations_rfq_id_fkey"
		}).onDelete("cascade"),
]);

export const quotes = pgTable("quotes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	rfqId: uuid("rfq_id").notNull(),
	supplierId: varchar("supplier_id", { length: 255 }).notNull(),
	supplierInvitationId: uuid("supplier_invitation_id"),
	projectId: varchar("project_id", { length: 255 }).notNull(),
	quoteNumber: varchar("quote_number", { length: 100 }),
	quoteReference: varchar("quote_reference", { length: 100 }),
	status: varchar({ length: 20 }).default('draft'),
	submissionDate: timestamp("submission_date", { mode: 'string' }).defaultNow(),
	validUntil: timestamp("valid_until", { mode: 'string' }).notNull(),
	totalValue: numeric("total_value", { precision: 15, scale:  2 }).notNull(),
	subtotal: numeric({ precision: 15, scale:  2 }),
	taxAmount: numeric("tax_amount", { precision: 15, scale:  2 }),
	discountAmount: numeric("discount_amount", { precision: 15, scale:  2 }),
	currency: varchar({ length: 3 }).default('ZAR'),
	leadTime: integer("lead_time"),
	paymentTerms: text("payment_terms"),
	deliveryTerms: text("delivery_terms"),
	warrantyTerms: text("warranty_terms"),
	validityPeriod: integer("validity_period"),
	notes: text(),
	terms: text(),
	conditions: text(),
	evaluationScore: numeric("evaluation_score", { precision: 5, scale:  2 }),
	technicalScore: numeric("technical_score", { precision: 5, scale:  2 }),
	commercialScore: numeric("commercial_score", { precision: 5, scale:  2 }),
	evaluationNotes: text("evaluation_notes"),
	isWinner: boolean("is_winner").default(false),
	awardedAt: timestamp("awarded_at", { mode: 'string' }),
	rejectedAt: timestamp("rejected_at", { mode: 'string' }),
	rejectionReason: text("rejection_reason"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.rfqId],
			foreignColumns: [rfqs.id],
			name: "quotes_rfq_id_fkey"
		}).onDelete("cascade"),
]);

export const rfqs = pgTable("rfqs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	rfqNumber: varchar("rfq_number", { length: 100 }).notNull(),
	projectId: varchar("project_id", { length: 255 }).notNull(),
	title: text().notNull(),
	description: text(),
	issueDate: timestamp("issue_date", { mode: 'string' }).notNull(),
	status: varchar({ length: 20 }).default('draft').notNull(),
	evaluationCriteria: json("evaluation_criteria"),
	termsConditions: text("terms_conditions"),
	deliveryRequirements: text("delivery_requirements"),
	paymentTerms: varchar("payment_terms", { length: 100 }),
	totalItems: integer("total_items").default(0),
	invitedSuppliers: integer("invited_suppliers").default(0),
	responsesReceived: integer("responses_received").default(0),
	createdBy: varchar("created_by", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	responseDeadline: timestamp("response_deadline", { mode: 'string' }),
}, (table) => [
	unique("rfqs_rfq_number_key").on(table.rfqNumber),
]);

export const clients = pgTable("clients", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }),
	phone: varchar({ length: 50 }),
	address: text(),
	city: varchar({ length: 100 }),
	state: varchar({ length: 100 }),
	postalCode: varchar("postal_code", { length: 20 }),
	country: varchar({ length: 100 }).default('South Africa'),
	type: varchar({ length: 50 }).default('COMPANY'),
	status: varchar({ length: 50 }).default('ACTIVE'),
	contactPerson: varchar("contact_person", { length: 255 }),
	contactEmail: varchar("contact_email", { length: 255 }),
	contactPhone: varchar("contact_phone", { length: 50 }),
	metadata: jsonb().default({}),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	paymentTerms: integer("payment_terms"),
}, (table) => [
	index("idx_clients_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_clients_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
]);

export const projects = pgTable("projects", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	clientId: uuid("client_id"),
	projectManagerId: uuid("project_manager_id"),
	status: varchar({ length: 50 }).default('PLANNING'),
	priority: varchar({ length: 50 }).default('MEDIUM'),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	budgetAllocated: numeric("budget_allocated", { precision: 15, scale:  2 }),
	budgetSpent: numeric("budget_spent", { precision: 15, scale:  2 }).default('0'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	municipalDistrict: text("municipal_district"),
	gpsLatitude: numeric("gps_latitude", { precision: 10, scale:  8 }),
	gpsLongitude: numeric("gps_longitude", { precision: 11, scale:  8 }),
	city: text(),
	state: text(),
}, (table) => [
	index("idx_projects_client_id").using("btree", table.clientId.asc().nullsLast().op("uuid_ops")),
	index("idx_projects_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "projects_client_id_fkey"
		}),
	foreignKey({
			columns: [table.projectManagerId],
			foreignColumns: [staff.id],
			name: "projects_project_manager_id_fkey"
		}),
]);

export const staff = pgTable("staff", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	employeeId: varchar("employee_id", { length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 50 }),
	alternatePhone: varchar("alternate_phone", { length: 50 }),
	address: text(),
	city: varchar({ length: 100 }),
	state: varchar({ length: 100 }),
	postalCode: varchar("postal_code", { length: 20 }),
	department: varchar({ length: 100 }).notNull(),
	position: varchar({ length: 100 }).notNull(),
	type: varchar({ length: 50 }).default('FULL_TIME'),
	status: varchar({ length: 50 }).default('ACTIVE'),
	salary: numeric({ precision: 12, scale:  2 }),
	joinDate: date("join_date").notNull(),
	endDate: date("end_date"),
	emergencyContact: jsonb("emergency_contact"),
	skills: text().array(),
	certifications: text().array(),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	reportsTo: uuid("reports_to"),
}, (table) => [
	index("idx_staff_department").using("btree", table.department.asc().nullsLast().op("text_ops")),
	index("idx_staff_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.reportsTo],
			foreignColumns: [table.id],
			name: "staff_reports_to_fkey"
		}),
	unique("staff_employee_id_key").on(table.employeeId),
	unique("staff_email_key").on(table.email),
]);

// Workflow Templates - Core templates for project workflows
export const workflowTemplates = pgTable("workflow_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	category: varchar({ length: 100 }).default('project'),
	type: varchar({ length: 50 }).default('custom'), // 'default', 'custom', 'system'
	status: varchar({ length: 20 }).default('active'), // 'active', 'archived', 'draft'
	version: varchar({ length: 20 }).default('1.0'),
	isDefault: boolean("is_default").default(false),
	isSystem: boolean("is_system").default(false),
	tags: json(),
	metadata: jsonb().default({}),
	createdBy: varchar("created_by", { length: 255 }),
	updatedBy: varchar("updated_by", { length: 255 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_workflow_templates_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("idx_workflow_templates_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_workflow_templates_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
	unique("workflow_templates_name_version_key").on(table.name, table.version),
]);

// Workflow Phases - Logical groupings within a workflow
export const workflowPhases = pgTable("workflow_phases", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	workflowTemplateId: uuid("workflow_template_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	orderIndex: integer("order_index").notNull(),
	color: varchar({ length: 20 }).default('#3B82F6'), // Hex color for UI
	icon: varchar({ length: 50 }), // Icon identifier
	estimatedDuration: integer("estimated_duration"), // Duration in days
	requiredRoles: json("required_roles"), // Array of required roles
	dependencies: json(), // Array of dependent phase IDs
	completionCriteria: json("completion_criteria"), // Array of criteria
	isOptional: boolean("is_optional").default(false),
	isParallel: boolean("is_parallel").default(false), // Can run parallel to other phases
	metadata: jsonb().default({}),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_workflow_phases_template").using("btree", table.workflowTemplateId.asc().nullsLast().op("uuid_ops")),
	index("idx_workflow_phases_order").using("btree", table.workflowTemplateId.asc().nullsLast().op("uuid_ops"), table.orderIndex.asc().nullsLast().op("int4_ops")),
	foreignKey({
		columns: [table.workflowTemplateId],
		foreignColumns: [workflowTemplates.id],
		name: "workflow_phases_template_id_fkey"
	}).onDelete("cascade"),
]);

// Workflow Steps - Individual actions within phases
export const workflowSteps = pgTable("workflow_steps", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	workflowPhaseId: uuid("workflow_phase_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	orderIndex: integer("order_index").notNull(),
	stepType: varchar("step_type", { length: 50 }).default('task'), // 'task', 'approval', 'review', 'milestone'
	estimatedDuration: integer("estimated_duration"), // Duration in hours
	assigneeRole: varchar("assignee_role", { length: 100 }), // Role responsible for step
	assigneeId: uuid("assignee_id"), // Specific user assignment (optional)
	dependencies: json(), // Array of dependent step IDs
	preconditions: json(), // Array of conditions that must be met
	postconditions: json(), // Array of outcomes/deliverables
	instructions: text(), // Detailed instructions
	resources: json(), // Required resources/tools
	validation: json(), // Validation criteria
	isRequired: boolean("is_required").default(true),
	isAutomated: boolean("is_automated").default(false),
	automationConfig: json("automation_config"), // Configuration for automated steps
	metadata: jsonb().default({}),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_workflow_steps_phase").using("btree", table.workflowPhaseId.asc().nullsLast().op("uuid_ops")),
	index("idx_workflow_steps_order").using("btree", table.workflowPhaseId.asc().nullsLast().op("uuid_ops"), table.orderIndex.asc().nullsLast().op("int4_ops")),
	index("idx_workflow_steps_type").using("btree", table.stepType.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.workflowPhaseId],
		foreignColumns: [workflowPhases.id],
		name: "workflow_steps_phase_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.assigneeId],
		foreignColumns: [staff.id],
		name: "workflow_steps_assignee_id_fkey"
	}),
]);

// Workflow Tasks - Granular tasks within steps
export const workflowTasks = pgTable("workflow_tasks", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	workflowStepId: uuid("workflow_step_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	orderIndex: integer("order_index").notNull(),
	priority: varchar({ length: 20 }).default('medium'), // 'low', 'medium', 'high', 'critical'
	estimatedHours: numeric("estimated_hours", { precision: 5, scale: 2 }),
	skillsRequired: json("skills_required"), // Array of required skills
	tools: json(), // Required tools/software
	deliverables: json(), // Expected outputs
	acceptanceCriteria: json("acceptance_criteria"), // Array of acceptance criteria
	isOptional: boolean("is_optional").default(false),
	canBeParallel: boolean("can_be_parallel").default(true),
	tags: json(),
	metadata: jsonb().default({}),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_workflow_tasks_step").using("btree", table.workflowStepId.asc().nullsLast().op("uuid_ops")),
	index("idx_workflow_tasks_order").using("btree", table.workflowStepId.asc().nullsLast().op("uuid_ops"), table.orderIndex.asc().nullsLast().op("int4_ops")),
	index("idx_workflow_tasks_priority").using("btree", table.priority.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.workflowStepId],
		foreignColumns: [workflowSteps.id],
		name: "workflow_tasks_step_id_fkey"
	}).onDelete("cascade"),
]);

// Project Workflows - Instances of workflow templates applied to projects
export const projectWorkflows = pgTable("project_workflows", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id").notNull(),
	workflowTemplateId: uuid("workflow_template_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	status: varchar({ length: 20 }).default('active'), // 'active', 'paused', 'completed', 'cancelled'
	currentPhaseId: uuid("current_phase_id"),
	progressPercentage: numeric("progress_percentage", { precision: 5, scale: 2 }).default('0'),
	startDate: timestamp("start_date", { withTimezone: true, mode: 'string' }),
	plannedEndDate: timestamp("planned_end_date", { withTimezone: true, mode: 'string' }),
	actualEndDate: timestamp("actual_end_date", { withTimezone: true, mode: 'string' }),
	assignedTo: uuid("assigned_to"), // Primary project manager
	teamMembers: json("team_members"), // Array of team member IDs
	metrics: jsonb().default({}), // Performance metrics
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_project_workflows_project").using("btree", table.projectId.asc().nullsLast().op("uuid_ops")),
	index("idx_project_workflows_template").using("btree", table.workflowTemplateId.asc().nullsLast().op("uuid_ops")),
	index("idx_project_workflows_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.projectId],
		foreignColumns: [projects.id],
		name: "project_workflows_project_id_fkey"
	}),
	foreignKey({
		columns: [table.workflowTemplateId],
		foreignColumns: [workflowTemplates.id],
		name: "project_workflows_template_id_fkey"
	}),
	foreignKey({
		columns: [table.assignedTo],
		foreignColumns: [staff.id],
		name: "project_workflows_assigned_to_fkey"
	}),
	foreignKey({
		columns: [table.currentPhaseId],
		foreignColumns: [workflowPhases.id],
		name: "project_workflows_current_phase_fkey"
	}),
]);

// Workflow Execution Log - Track workflow execution history
export const workflowExecutionLog = pgTable("workflow_execution_log", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectWorkflowId: uuid("project_workflow_id").notNull(),
	phaseId: uuid("phase_id"),
	stepId: uuid("step_id"),
	taskId: uuid("task_id"),
	action: varchar({ length: 100 }).notNull(), // 'started', 'completed', 'paused', 'cancelled', 'assigned'
	actorId: uuid("actor_id").notNull(), // User who performed the action
	actorName: varchar("actor_name", { length: 255 }),
	previousStatus: varchar("previous_status", { length: 50 }),
	newStatus: varchar("new_status", { length: 50 }),
	duration: integer(), // Duration in minutes
	notes: text(),
	attachments: json(), // Array of file attachments
	metadata: jsonb().default({}),
	timestamp: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_workflow_log_project").using("btree", table.projectWorkflowId.asc().nullsLast().op("uuid_ops")),
	index("idx_workflow_log_actor").using("btree", table.actorId.asc().nullsLast().op("uuid_ops")),
	index("idx_workflow_log_timestamp").using("btree", table.timestamp.asc().nullsLast().op("timestamp_ops")),
	index("idx_workflow_log_action").using("btree", table.action.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.projectWorkflowId],
		foreignColumns: [projectWorkflows.id],
		name: "workflow_log_project_workflow_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.actorId],
		foreignColumns: [staff.id],
		name: "workflow_log_actor_fkey"
	}),
]);
