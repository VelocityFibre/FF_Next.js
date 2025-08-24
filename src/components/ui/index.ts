// Standard UI Components for consistent module design
export { StandardModuleHeader } from './StandardModuleHeader';
export { StandardSummaryCards } from './StandardSummaryCards';
export { StandardSearchFilter } from './StandardSearchFilter';
export { StandardDataTable, Pagination } from './StandardDataTable';
export { StandardActionButtons, StatusBadge, PriorityBadge } from './StandardActionButtons';

// Existing UI components
export { LoadingSpinner } from './LoadingSpinner';

// VELOCITY Premium UI Components - Enhanced with theme integration
export { 
  GlassCard, 
  glassCardVariants 
} from './GlassCard';

export { 
  VelocityButton, 
  velocityButtonVariants 
} from './VelocityButton';

export { 
  VelocityInput, 
  velocityInputVariants 
} from './VelocityInput';

export { 
  VelocitySpinner, 
  velocitySpinnerVariants 
} from './VelocitySpinner';

export { 
  PageTransition, 
  withPageTransition, 
  RouteTransition,
  usePageTransition 
} from './PageTransition';

// Standard UI Component Types
export type { SummaryCardData } from './StandardSummaryCards';
export type { TableColumn } from './StandardDataTable';

// VELOCITY Premium UI Component Types
export type { GlassCardProps } from './GlassCard';
export type { VelocityButtonProps } from './VelocityButton';
export type { VelocityInputProps } from './VelocityInput';
export type { VelocitySpinnerProps } from './VelocitySpinner';
export type { 
  PageTransitionProps, 
  RouteTransitionProps, 
  TransitionType 
} from './PageTransition';