/**
 * Staff domain schemas
 * Defines validation schemas for all staff-related API operations
 */

import { z } from 'zod';
import {
  IdSchema,
  EmailSchema,
  PhoneSchema,
  AddressSchema,
  AuditFieldsSchema,
  PaginationParamsSchema,
  StatusSchema,
} from '../common';

// ============================================================================
// Staff Core Schemas
// ============================================================================

export const StaffRoleSchema = z.enum([
  'admin',
  'manager',
  'supervisor',
  'technician',
  'support',
  'contractor',
]);

export const StaffStatusSchema = z.enum([
  'active',
  'inactive',
  'on_leave',
  'terminated',
  'suspended',
]);

export const EmploymentTypeSchema = z.enum([
  'full_time',
  'part_time',
  'contract',
  'freelance',
  'intern',
]);

export const SkillLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);

export const StaffSchema = z.object({
  id: IdSchema,
  employeeId: z.string().min(1).max(50),
  
  // Personal Information
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  middleName: z.string().max(100).optional(),
  dateOfBirth: z.string().datetime().or(z.date()).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  nationality: z.string().optional(),
  idNumber: z.string().optional(),
  
  // Contact Information
  email: EmailSchema,
  phone: PhoneSchema,
  alternatePhone: PhoneSchema.optional(),
  address: AddressSchema.optional(),
  emergencyContact: z.object({
    name: z.string(),
    relationship: z.string(),
    phone: PhoneSchema,
    email: EmailSchema.optional(),
  }).optional(),
  
  // Employment Details
  role: StaffRoleSchema,
  status: StaffStatusSchema,
  employmentType: EmploymentTypeSchema,
  department: z.string().optional(),
  reportsTo: IdSchema.optional(),
  
  // Work Details
  position: z.string().min(1).max(100),
  joinDate: z.string().datetime().or(z.date()),
  confirmationDate: z.string().datetime().or(z.date()).optional(),
  exitDate: z.string().datetime().or(z.date()).optional(),
  
  // Compensation
  salary: z.object({
    amount: z.number().nonnegative(),
    currency: z.string().length(3).default('ZAR'),
    frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'yearly']),
  }).optional(),
  
  // Skills and Certifications
  skills: z.array(z.object({
    name: z.string(),
    level: SkillLevelSchema,
    yearsOfExperience: z.number().min(0).optional(),
    certified: z.boolean().default(false),
  })).optional(),
  
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    issueDate: z.string().datetime().or(z.date()),
    expiryDate: z.string().datetime().or(z.date()).optional(),
    certificateNumber: z.string().optional(),
  })).optional(),
  
  // Availability
  availability: z.object({
    monday: z.boolean().default(true),
    tuesday: z.boolean().default(true),
    wednesday: z.boolean().default(true),
    thursday: z.boolean().default(true),
    friday: z.boolean().default(true),
    saturday: z.boolean().default(false),
    sunday: z.boolean().default(false),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  }).optional(),
  
  // Additional Information
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
}).merge(AuditFieldsSchema);

// ============================================================================
// Staff Creation/Update Schemas
// ============================================================================

export const CreateStaffSchema = StaffSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const UpdateStaffSchema = CreateStaffSchema.partial();

// ============================================================================
// Staff Query Schemas
// ============================================================================

export const StaffQuerySchema = PaginationParamsSchema.extend({
  search: z.string().optional(),
  role: z.union([StaffRoleSchema, z.array(StaffRoleSchema)]).optional(),
  status: z.union([StaffStatusSchema, z.array(StaffStatusSchema)]).optional(),
  employmentType: z.union([EmploymentTypeSchema, z.array(EmploymentTypeSchema)]).optional(),
  department: z.union([z.string(), z.array(z.string())]).optional(),
  reportsTo: IdSchema.optional(),
  skills: z.union([z.string(), z.array(z.string())]).optional(),
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  joinDateFrom: z.string().datetime().optional(),
  joinDateTo: z.string().datetime().optional(),
  availableOn: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
});

export const StaffParamsSchema = z.object({
  id: IdSchema,
});

// ============================================================================
// Staff Statistics Schemas
// ============================================================================

export const StaffStatsSchema = z.object({
  totalStaff: z.number(),
  activeStaff: z.number(),
  onLeaveStaff: z.number(),
  staffByRole: z.record(StaffRoleSchema, z.number()),
  staffByDepartment: z.record(z.string(), z.number()),
  staffByEmploymentType: z.record(EmploymentTypeSchema, z.number()),
  averageTenure: z.number(), // in days
  turnoverRate: z.number(), // percentage
  upcomingBirthdays: z.array(z.object({
    staffId: IdSchema,
    name: z.string(),
    date: z.string().datetime(),
  })),
  expiringCertifications: z.array(z.object({
    staffId: IdSchema,
    staffName: z.string(),
    certificationName: z.string(),
    expiryDate: z.string().datetime(),
  })),
});

// ============================================================================
// Staff Import/Export Schemas
// ============================================================================

export const StaffImportSchema = z.object({
  staff: z.array(CreateStaffSchema),
  options: z.object({
    skipDuplicates: z.boolean().default(false),
    updateExisting: z.boolean().default(false),
    validateEmails: z.boolean().default(true),
    generateEmployeeIds: z.boolean().default(false),
  }).optional(),
});

export const StaffExportQuerySchema = z.object({
  format: z.enum(['json', 'csv', 'xlsx']).default('json'),
  fields: z.array(z.string()).optional(),
  includeInactive: z.boolean().default(false),
  includeSensitive: z.boolean().default(false),
}).merge(StaffQuerySchema);

// ============================================================================
// Staff Assignment Schemas
// ============================================================================

export const StaffAssignmentSchema = z.object({
  staffId: IdSchema,
  projectId: IdSchema,
  role: z.string(),
  allocation: z.number().min(0).max(100), // percentage
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()).optional(),
  notes: z.string().optional(),
});

export const CreateStaffAssignmentSchema = z.object({
  assignments: z.array(StaffAssignmentSchema),
  notifyStaff: z.boolean().default(true),
});

// ============================================================================
// Staff Performance Schemas
// ============================================================================

export const StaffPerformanceSchema = z.object({
  staffId: IdSchema,
  period: z.object({
    startDate: z.string().datetime().or(z.date()),
    endDate: z.string().datetime().or(z.date()),
  }),
  metrics: z.object({
    productivity: z.number().min(0).max(100),
    quality: z.number().min(0).max(100),
    attendance: z.number().min(0).max(100),
    teamwork: z.number().min(0).max(100),
  }),
  rating: z.number().min(1).max(5),
  feedback: z.string().optional(),
  goals: z.array(z.object({
    description: z.string(),
    achieved: z.boolean(),
  })).optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type Staff = z.infer<typeof StaffSchema>;
export type CreateStaff = z.infer<typeof CreateStaffSchema>;
export type UpdateStaff = z.infer<typeof UpdateStaffSchema>;
export type StaffQuery = z.infer<typeof StaffQuerySchema>;
export type StaffParams = z.infer<typeof StaffParamsSchema>;
export type StaffStats = z.infer<typeof StaffStatsSchema>;
export type StaffImport = z.infer<typeof StaffImportSchema>;
export type StaffExportQuery = z.infer<typeof StaffExportQuerySchema>;
export type StaffAssignment = z.infer<typeof StaffAssignmentSchema>;
export type CreateStaffAssignment = z.infer<typeof CreateStaffAssignmentSchema>;
export type StaffPerformance = z.infer<typeof StaffPerformanceSchema>;
export type StaffRole = z.infer<typeof StaffRoleSchema>;
export type StaffStatus = z.infer<typeof StaffStatusSchema>;
export type EmploymentType = z.infer<typeof EmploymentTypeSchema>;
export type SkillLevel = z.infer<typeof SkillLevelSchema>;