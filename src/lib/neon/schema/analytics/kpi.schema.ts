/**
 * Analytics KPI Schema - Key Performance Indicators and Metrics
 */

import { pgTable, serial, text, varchar, integer, decimal, timestamp, index } from 'drizzle-orm/pg-core';

// KPI Tracking (Time Series Data)
export const kpiMetrics = pgTable('kpi_metrics', {
  id: serial('id').primaryKey(),
  projectId: varchar('project_id', { length: 255 }),
  metricType: varchar('metric_type', { length: 100 }).notNull(), // productivity, quality, safety, cost
  metricName: text('metric_name').notNull(),
  metricValue: decimal('metric_value', { precision: 15, scale: 4 }).notNull(),
  unit: varchar('unit', { length: 50 }),
  
  // Context
  teamId: varchar('team_id', { length: 255 }),
  contractorId: varchar('contractor_id', { length: 255 }),
  
  // Time
  recordedDate: timestamp('recorded_date').notNull(),
  weekNumber: integer('week_number'),
  monthNumber: integer('month_number'),
  year: integer('year'),
  
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    projectMetricIdx: index('project_metric_idx').on(table.projectId, table.metricType),
    dateIdx: index('date_idx').on(table.recordedDate),
  }
});

// Staff Performance Analytics
export const staffPerformance = pgTable('staff_performance', {
  id: serial('id').primaryKey(),
  staffId: varchar('staff_id', { length: 255 }).notNull(),
  staffName: text('staff_name').notNull(),
  projectId: varchar('project_id', { length: 255 }),
  
  // Performance Metrics
  hoursWorked: decimal('hours_worked', { precision: 8, scale: 2 }).default('0'),
  tasksCompleted: integer('tasks_completed').default(0),
  qualityScore: decimal('quality_score', { precision: 5, scale: 2 }),
  safetyScore: decimal('safety_score', { precision: 5, scale: 2 }),
  
  // Period
  periodType: varchar('period_type', { length: 20 }).notNull(), // daily, weekly, monthly
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  
  // Calculated Fields
  productivity: decimal('productivity', { precision: 8, scale: 4 }),
  efficiency: decimal('efficiency', { precision: 5, scale: 2 }),
  
  calculatedAt: timestamp('calculated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    staffProjectIdx: index('staff_project_idx').on(table.staffId, table.projectId),
    periodIdx: index('staff_period_idx').on(table.periodStart, table.periodEnd),
  }
});

// Material Usage (Analytics)
export const materialUsage = pgTable('material_usage', {
  id: serial('id').primaryKey(),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  materialType: varchar('material_type', { length: 100 }).notNull(),
  materialName: text('material_name').notNull(),
  
  // Usage Details
  quantityUsed: decimal('quantity_used', { precision: 15, scale: 4 }).notNull(),
  quantityWasted: decimal('quantity_wasted', { precision: 15, scale: 4 }).default('0'),
  unit: varchar('unit', { length: 20 }).notNull(),
  
  // Financial
  unitCost: decimal('unit_cost', { precision: 15, scale: 2 }),
  totalCost: decimal('total_cost', { precision: 15, scale: 2 }),
  
  // Context
  workOrderId: varchar('work_order_id', { length: 255 }),
  teamId: varchar('team_id', { length: 255 }),
  usedBy: varchar('used_by', { length: 255 }),
  
  // Date
  usageDate: timestamp('usage_date').notNull(),
  recordedAt: timestamp('recorded_at').defaultNow(),
}, (table) => {
  return {
    projectMaterialIdx: index('project_material_idx').on(table.projectId, table.materialType),
    usageDateIdx: index('material_usage_date_idx').on(table.usageDate),
  }
});

// Analytics Type Exports
export type KPIMetrics = typeof kpiMetrics.$inferSelect;
export type NewKPIMetrics = typeof kpiMetrics.$inferInsert;

export type StaffPerformance = typeof staffPerformance.$inferSelect;
export type NewStaffPerformance = typeof staffPerformance.$inferInsert;

export type MaterialUsage = typeof materialUsage.$inferSelect;
export type NewMaterialUsage = typeof materialUsage.$inferInsert;