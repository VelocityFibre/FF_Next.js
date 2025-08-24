/**
 * SOW Enums - All enumeration types for Scope of Work
 */

export enum SOWStatus {
  DRAFT = 'draft',
  VALIDATED = 'validated',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PoleStatus {
  // General workflow states
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
  // Permission states
  PENDING_PERMISSION = 'pending_permission',
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_DENIED = 'permission_denied',
  // Installation states
  READY_FOR_INSTALLATION = 'ready_for_installation',
  INSTALLATION_IN_PROGRESS = 'installation_in_progress',
  INSTALLED = 'installed',
  ACTIVE = 'active',
  MAINTENANCE_REQUIRED = 'maintenance_required',
  DECOMMISSIONED = 'decommissioned',
}

export enum PoleType {
  WOODEN = 'wooden',
  CONCRETE = 'concrete',
  STEEL = 'steel',
  COMPOSITE = 'composite',
  EXISTING = 'existing',
  NEW = 'new',
}

export enum DropStatus {
  PLANNED = 'planned',
  SURVEYED = 'surveyed',
  DESIGNED = 'designed',
  IN_PROGRESS = 'in_progress',
  READY_FOR_INSTALLATION = 'ready_for_installation',
  INSTALLED = 'installed',
  ACTIVATED = 'activated',
  CANCELLED = 'cancelled',
}

export enum DropType {
  AERIAL = 'aerial',
  UNDERGROUND = 'underground',
  BUILDING_ENTRY = 'building_entry',
  DIRECT_BURIAL = 'direct_burial',
}

export enum FibreType {
  BACKBONE = 'backbone',
  FEEDER = 'feeder',
  DISTRIBUTION = 'distribution',
  DROP = 'drop',
}

export enum FibreStatus {
  PLANNED = 'planned',
  ORDERED = 'ordered',
  DELIVERED = 'delivered',
  INSTALLED = 'installed',
  TESTED = 'tested',
  ACTIVATED = 'activated',
}

export enum InstallationType {
  AERIAL = 'aerial',
  UNDERGROUND = 'underground',
  DIRECT_BURIAL = 'direct_burial',
  CONDUIT = 'conduit',
}

export enum ValidationLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// Validation status - consolidated from all modules
export enum ValidationStatus {
  PENDING = 'pending',
  VALID = 'valid',
  INVALID = 'invalid',
  WARNING = 'warning',
  ERROR = 'error',
  NEEDS_REVIEW = 'needs_review',
}